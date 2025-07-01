interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface OfferApprovalEmailData {
  businessName: string;
  offerTitle: string;
  status: 'approved' | 'rejected';
  reason?: string;
}

export class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendOfferApprovalEmail(
    businessEmail: string,
    data: OfferApprovalEmailData
  ): Promise<boolean> {
    try {
      const subject = data.status === 'approved' 
        ? `تم قبول عرضك: ${data.offerTitle}`
        : `تم رفض عرضك: ${data.offerTitle}`;

      const html = this.generateOfferApprovalEmailTemplate(data);
      const text = this.generateOfferApprovalEmailText(data);

      // For now, we'll log the email content
      // This can be replaced with actual email sending logic later
      console.log('=== EMAIL NOTIFICATION ===');
      console.log(`To: ${businessEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text}`);
      console.log('========================');

      // Simulate successful email sending
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private generateOfferApprovalEmailTemplate(data: OfferApprovalEmailData): string {
    const isApproved = data.status === 'approved';
    const statusColor = isApproved ? '#10B981' : '#EF4444';
    const statusText = isApproved ? 'تم قبول عرضك' : 'تم رفض عرضك';

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إشعار حول عرضك</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">منصة العروض السعودية</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">إشعار حول حالة عرضك</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background-color: ${statusColor}; color: white; padding: 15px 30px; border-radius: 50px; font-size: 18px; font-weight: bold;">
                ${statusText}
              </div>
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">مرحباً ${data.businessName}</h2>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-right: 4px solid ${statusColor}; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">تفاصيل العرض:</h3>
              <p style="margin: 0; color: #6b7280; font-size: 16px;"><strong>عنوان العرض:</strong> ${data.offerTitle}</p>
            </div>

            ${data.status === 'approved' ? `
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                نهنئك! تم قبول عرضك وهو الآن متاح للعملاء على منصتنا. يمكن للعملاء الآن مشاهدة عرضك والاستفادة منه.
              </p>
              <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; border: 1px solid #d1fae5;">
                <p style="margin: 0; color: #047857; font-size: 14px;">
                  💡 <strong>نصيحة:</strong> تأكد من تحديث معلومات العرض بانتظام لضمان حصولك على أفضل النتائج.
                </p>
              </div>
            ` : `
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                نأسف لإبلاغك أنه تم رفض عرضك. يرجى مراجعة التفاصيل أدناه وإعادة المحاولة.
              </p>
              ${data.reason ? `
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 20px;">
                  <p style="margin: 0; color: #991b1b;"><strong>سبب الرفض:</strong> ${data.reason}</p>
                </div>
              ` : ''}
              <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  💡 يمكنك تعديل عرضك وإعادة إرساله للمراجعة مرة أخرى من خلال لوحة التحكم.
                </p>
              </div>
            `}
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
              شكراً لاستخدامك منصة العروض السعودية
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              هذا إشعار تلقائي، يرجى عدم الرد على هذا البريد الإلكتروني
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOfferApprovalEmailText(data: OfferApprovalEmailData): string {
    const statusText = data.status === 'approved' ? 'تم قبول عرضك' : 'تم رفض عرضك';
    
    let text = `منصة العروض السعودية\n\n`;
    text += `مرحباً ${data.businessName},\n\n`;
    text += `${statusText}: ${data.offerTitle}\n\n`;
    
    if (data.status === 'approved') {
      text += `نهنئك! تم قبول عرضك وهو الآن متاح للعملاء على منصتنا.\n\n`;
      text += `نصيحة: تأكد من تحديث معلومات العرض بانتظام لضمان حصولك على أفضل النتائج.\n\n`;
    } else {
      text += `نأسف لإبلاغك أنه تم رفض عرضك.\n\n`;
      if (data.reason) {
        text += `سبب الرفض: ${data.reason}\n\n`;
      }
      text += `يمكنك تعديل عرضك وإعادة إرساله للمراجعة مرة أخرى من خلال لوحة التحكم.\n\n`;
    }
    
    text += `شكراً لاستخدامك منصة العروض السعودية\n`;
    text += `هذا إشعار تلقائي، يرجى عدم الرد على هذا البريد الإلكتروني`;
    
    return text;
  }

  async sendWelcomeEmail(businessEmail: string, businessName: string): Promise<boolean> {
    try {
      const subject = `مرحباً بك في منصة العروض السعودية`;
      const html = this.generateWelcomeEmailTemplate(businessName);
      const text = this.generateWelcomeEmailText(businessName);

      console.log('=== WELCOME EMAIL ===');
      console.log(`To: ${businessEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text}`);
      console.log('===================');

      return true;
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return false;
    }
  }

  private generateWelcomeEmailTemplate(businessName: string): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مرحباً بك</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">منصة العروض السعودية</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">مرحباً بك في منصتنا</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">مرحباً ${businessName}!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              أهلاً وسهلاً بك في منصة العروض السعودية! نحن سعداء لانضمامك إلى مجتمعنا من الأعمال المحلية.
            </p>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-right: 4px solid #0ea5e9; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">ما يمكنك فعله الآن:</h3>
              <ul style="margin: 0; padding-right: 20px; color: #374151;">
                <li style="margin-bottom: 8px;">إنشاء عروضك الترويجية وعرضها للعملاء</li>
                <li style="margin-bottom: 8px;">إدارة عروضك من خلال لوحة التحكم</li>
                <li style="margin-bottom: 8px;">متابعة إحصائيات المشاهدات والتفاعل</li>
                <li>الوصول إلى آلاف العملاء المحتملين</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                ابدأ بإنشاء أول عرض
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              شكراً لاختيارك منصة العروض السعودية
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(businessName: string): string {
    return `منصة العروض السعودية

مرحباً ${businessName}!

أهلاً وسهلاً بك في منصة العروض السعودية! نحن سعداء لانضمامك إلى مجتمعنا من الأعمال المحلية.

ما يمكنك فعله الآن:
- إنشاء عروضك الترويجية وعرضها للعملاء
- إدارة عروضك من خلال لوحة التحكم  
- متابعة إحصائيات المشاهدات والتفاعل
- الوصول إلى آلاف العملاء المحتملين

إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.

شكراً لاختيارك منصة العروض السعودية`;
  }
}

export const emailService = EmailService.getInstance();