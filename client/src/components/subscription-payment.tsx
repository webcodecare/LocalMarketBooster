import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionPlan {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  currency: string;
  billingPeriod: string;
  offerLimit: number;
  isPopular?: boolean;
  color?: string;
  features?: string[];
}

interface SubscriptionPaymentProps {
  plan: SubscriptionPlan;
  onPaymentSuccess?: () => void;
  onCancel?: () => void;
}

interface PaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardholderName: string;
  paymentMethod: 'creditcard' | 'mada';
}

export function SubscriptionPayment({ plan, onPaymentSuccess, onCancel }: SubscriptionPaymentProps) {
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
    paymentMethod: 'creditcard'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentInfo: any) => {
      const response = await apiRequest("POST", "/api/payments/create-subscription", paymentInfo);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.paymentUrl) {
        // Redirect to Moyasar payment page
        window.location.href = data.paymentUrl;
      } else {
        // Handle direct payment success
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated successfully!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/merchant/subscription"] });
        onPaymentSuccess?.();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Format card number (remove spaces)
    const formattedCardNumber = paymentData.cardNumber.replace(/\s+/g, '');
    
    // Validate card details
    if (formattedCardNumber.length < 13 || formattedCardNumber.length > 19) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    if (!paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvc) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const paymentSource = {
      type: paymentData.paymentMethod,
      name: paymentData.cardholderName,
      number: formattedCardNumber,
      month: paymentData.expiryMonth.padStart(2, '0'),
      year: paymentData.expiryYear,
      cvc: paymentData.cvc,
    };

    createPaymentMutation.mutate({
      planId: plan.id,
      paymentSource,
    });
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 19) {
      setPaymentData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2); // Convert from halalas to SAR
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscription Summary</span>
            {plan.isPopular && <Badge variant="secondary">Most Popular</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{plan.nameAr}</h3>
                <p className="text-sm text-muted-foreground">{plan.descriptionAr}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatPrice(plan.price)} {plan.currency}</p>
                <p className="text-sm text-muted-foreground">شهرياً</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">Plan Features:</p>
              <div className="grid grid-cols-1 gap-2">
                {plan.features?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Up to {plan.offerLimit} offers</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Enter your card details to activate your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentData.paymentMethod}
                onValueChange={(value: 'creditcard' | 'mada') => 
                  setPaymentData(prev => ({ ...prev, paymentMethod: value }))
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="creditcard" id="creditcard" />
                  <Label htmlFor="creditcard" className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Credit Card</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mada" id="mada" />
                  <Label htmlFor="mada" className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Mada Card</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="Enter cardholder name"
                  value={paymentData.cardholderName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={handleCardNumberChange}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Month</Label>
                  <select
                    id="expiryMonth"
                    className="w-full p-2 border border-input rounded-md"
                    value={paymentData.expiryMonth}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    required
                  >
                    <option value="">MM</option>
                    {months.map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="expiryYear">Year</Label>
                  <select
                    id="expiryYear"
                    className="w-full p-2 border border-input rounded-md"
                    value={paymentData.expiryYear}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryYear: e.target.value }))}
                    required
                  >
                    <option value="">YYYY</option>
                    {years.map(year => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    maxLength={4}
                    value={paymentData.cvc}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Total and Actions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total Amount:</span>
                <span>{formatPrice(plan.price)} {plan.currency}</span>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing || createPaymentMutation.isPending}
                  className="flex-1"
                >
                  {isProcessing || createPaymentMutation.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay {formatPrice(plan.price)} {plan.currency}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
              <Check className="h-3 w-3 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-muted-foreground">
                Your payment information is encrypted and processed securely through Moyasar.
                We do not store your card details on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}