import { db } from "./db";
import { invoices, merchantSubscriptions, subscriptionPlans, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

interface MoyasarPaymentRequest {
  amount: number; // Amount in halalas (SAR cents)
  currency: string;
  description: string;
  callback_url?: string;
  source: {
    type: string; // 'creditcard', 'mada', 'applepay', etc.
    name?: string;
    number?: string;
    cvc?: string;
    month?: string;
    year?: string;
  };
  metadata?: Record<string, any>;
}

interface MoyasarPaymentResponse {
  id: string;
  status: string; // 'initiated', 'paid', 'failed', 'authorized', 'captured'
  amount: number;
  fee: number;
  currency: string;
  description: string;
  amount_format: string;
  fee_format: string;
  created: string;
  updated: string;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string;
    transaction_url?: string;
  };
  metadata?: Record<string, any>;
}

export class PaymentService {
  private static instance: PaymentService;
  private moyasarSecretKey: string;
  private moyasarBaseUrl = 'https://api.moyasar.com/v1';

  constructor() {
    this.moyasarSecretKey = process.env.MOYASAR_SECRET_KEY!;
    if (!this.moyasarSecretKey) {
      throw new Error('MOYASAR_SECRET_KEY environment variable is required');
    }
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async createSubscriptionPayment(
    merchantId: number,
    planId: number,
    paymentSource: MoyasarPaymentRequest['source']
  ): Promise<{ invoice: any; paymentUrl?: string }> {
    try {
      // Get subscription plan details
      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId));

      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Get merchant details
      const [merchant] = await db
        .select()
        .from(users)
        .where(eq(users.id, merchantId));

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // Create invoice record
      const invoiceNumber = `SUB-${Date.now()}-${nanoid(6)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days to pay

      const [invoice] = await db
        .insert(invoices)
        .values({
          invoiceNumber,
          merchantId,
          planId,
          invoiceType: 'subscription',
          issueDate: new Date(),
          dueDate,
          subtotal: plan.price.toString(),
          taxAmount: '0',
          totalAmount: plan.price.toString(),
          currency: plan.currency,
          status: 'unpaid',
          statusAr: 'غير مدفوع',
        })
        .returning();

      // Create Moyasar payment
      const paymentRequest: MoyasarPaymentRequest = {
        amount: plan.price, // Amount in halalas
        currency: plan.currency,
        description: `${plan.nameAr} - ${merchant.businessName || merchant.username}`,
        callback_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payments/moyasar/callback`,
        source: paymentSource,
        metadata: {
          invoice_id: invoice.id.toString(),
          merchant_id: merchantId.toString(),
          plan_id: planId.toString(),
          invoice_number: invoiceNumber,
        },
      };

      const moyasarResponse = await this.createMoyasarPayment(paymentRequest);

      // Update invoice with Moyasar payment ID
      await db
        .update(invoices)
        .set({
          moyasarPaymentId: moyasarResponse.id,
          moyasarStatus: moyasarResponse.status,
          moyasarMetadata: JSON.stringify(moyasarResponse),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      return {
        invoice: {
          ...invoice,
          moyasarPaymentId: moyasarResponse.id,
          moyasarStatus: moyasarResponse.status,
        },
        paymentUrl: moyasarResponse.source.transaction_url,
      };
    } catch (error) {
      console.error('Error creating subscription payment:', error);
      throw error;
    }
  }

  async handlePaymentCallback(paymentId: string): Promise<{ success: boolean; invoice?: any }> {
    try {
      // Get payment details from Moyasar
      const moyasarPayment = await this.getMoyasarPayment(paymentId);

      // Find invoice by Moyasar payment ID
      const [invoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.moyasarPaymentId, paymentId));

      if (!invoice) {
        console.error('Invoice not found for payment ID:', paymentId);
        return { success: false };
      }

      // Update invoice based on payment status
      if (moyasarPayment.status === 'paid') {
        await this.processSuccessfulPayment(invoice, moyasarPayment);
        return { success: true, invoice };
      } else if (moyasarPayment.status === 'failed') {
        await this.processFailedPayment(invoice, moyasarPayment);
        return { success: false, invoice };
      }

      // Update invoice with latest status
      await db
        .update(invoices)
        .set({
          moyasarStatus: moyasarPayment.status,
          moyasarMetadata: JSON.stringify(moyasarPayment),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      return { success: false, invoice };
    } catch (error) {
      console.error('Error handling payment callback:', error);
      throw error;
    }
  }

  private async processSuccessfulPayment(invoice: any, moyasarPayment: MoyasarPaymentResponse) {
    try {
      // Update invoice as paid
      await db
        .update(invoices)
        .set({
          status: 'paid',
          statusAr: 'مدفوع',
          paidAt: new Date(),
          paymentMethod: moyasarPayment.source.type,
          moyasarStatus: moyasarPayment.status,
          moyasarTransactionId: moyasarPayment.source.reference_number,
          moyasarMetadata: JSON.stringify(moyasarPayment),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      // If it's a subscription payment, activate the subscription
      if (invoice.invoiceType === 'subscription' && invoice.planId) {
        await this.activateSubscription(invoice.merchantId, invoice.planId, invoice.id);
      }
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }

  private async processFailedPayment(invoice: any, moyasarPayment: MoyasarPaymentResponse) {
    try {
      await db
        .update(invoices)
        .set({
          status: 'cancelled',
          statusAr: 'ملغي',
          failureReason: moyasarPayment.source.gateway_id || 'Payment failed',
          moyasarStatus: moyasarPayment.status,
          moyasarMetadata: JSON.stringify(moyasarPayment),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));
    } catch (error) {
      console.error('Error processing failed payment:', error);
      throw error;
    }
  }

  private async activateSubscription(merchantId: number, planId: number, invoiceId: number) {
    try {
      // Cancel any existing active subscription
      await db
        .update(merchantSubscriptions)
        .set({
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(merchantSubscriptions.merchantId, merchantId),
            eq(merchantSubscriptions.status, 'active')
          )
        );

      // Create new subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      await db
        .insert(merchantSubscriptions)
        .values({
          merchantId,
          planId,
          startDate,
          endDate,
          status: 'active',
          autoRenew: true,
          paymentMethod: 'moyasar',
        });

      // Update user subscription plan
      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId));

      if (plan) {
        await db
          .update(users)
          .set({
            subscriptionPlan: plan.name,
            subscriptionExpiry: endDate,
            offerLimit: plan.offerLimit,
          })
          .where(eq(users.id, merchantId));
      }
    } catch (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }
  }

  private async createMoyasarPayment(paymentRequest: MoyasarPaymentRequest): Promise<MoyasarPaymentResponse> {
    const response = await fetch(`${this.moyasarBaseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.moyasarSecretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Moyasar API error:', errorData);
      throw new Error(`Moyasar payment creation failed: ${response.status}`);
    }

    return await response.json();
  }

  private async getMoyasarPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
    const response = await fetch(`${this.moyasarBaseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.moyasarSecretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Moyasar API error:', errorData);
      throw new Error(`Failed to fetch payment: ${response.status}`);
    }

    return await response.json();
  }

  async getInvoicesByMerchant(merchantId: number) {
    try {
      return await db
        .select({
          invoice: invoices,
          plan: subscriptionPlans,
        })
        .from(invoices)
        .leftJoin(subscriptionPlans, eq(invoices.planId, subscriptionPlans.id))
        .where(eq(invoices.merchantId, merchantId))
        .orderBy(invoices.createdAt);
    } catch (error) {
      console.error('Error fetching merchant invoices:', error);
      return [];
    }
  }
}

export const paymentService = PaymentService.getInstance();