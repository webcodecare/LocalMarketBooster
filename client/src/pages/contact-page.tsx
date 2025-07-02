import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Monitor, Send, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال رسالتك بنجاح",
        description: "سنتواصل معك في أقرب وقت ممكن",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إرسال الرسالة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };
    contactMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <img 
                src="/attached_assets/ChatGPT_Image_Jun_25__2025__02_32_00_AM-removebg-preview_1750807971844.png" 
                alt="Baraq Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  براق
                </h1>
                <p className="text-xs text-muted-foreground">Baraq Platform</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                العودة للرئيسية
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline">تسجيل الدخول</Button>
            </Link>
            <Link href="/merchant-register">
              <Button>انضم كتاجر</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              تواصل معنا
            </Badge>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              نحن هنا لمساعدتك
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              لديك استفسار أو تحتاج مساعدة؟ تواصل معنا وسنكون سعداء بخدمتك
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    إرسال رسالة
                  </CardTitle>
                  <CardDescription>
                    املأ النموذج أدناه وسنتواصل معك خلال 24 ساعة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="مثال: أحمد محمد السعدي"
                          required
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="example@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">الرسالة *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="اكتب رسالتك هنا..."
                        required
                        rows={6}
                        className="text-right"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending ? (
                        "جارٍ الإرسال..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          إرسال الرسالة
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات التواصل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">الهاتف</h4>
                      <p className="text-sm text-muted-foreground">+966 11 123 4567</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        الأحد - الخميس: 9:00 - 17:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">البريد الإلكتروني</h4>
                      <p className="text-sm text-muted-foreground">info@baraq.sa</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        نرد خلال 24 ساعة
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">العنوان</h4>
                      <p className="text-sm text-muted-foreground">
                        الرياض، المملكة العربية السعودية
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        حي الملك فهد، طريق الملك عبدالعزيز
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">ساعات العمل</h4>
                      <p className="text-sm text-muted-foreground">
                        الأحد - الخميس: 9:00 - 17:00
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        الجمعة - السبت: مغلق
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الأسئلة الشائعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium text-sm mb-1">كم يستغرق إعداد الحملة؟</h5>
                    <p className="text-xs text-muted-foreground">
                      عادة ما يستغرق من 24-48 ساعة بعد الموافقة على المحتوى
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-1">ما هي طرق الدفع المتاحة؟</h5>
                    <p className="text-xs text-muted-foreground">
                      نقبل جميع البطاقات الائتمانية والتحويل البنكي
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-1">هل يمكن تعديل الحملة بعد البدء؟</h5>
                    <p className="text-xs text-muted-foreground">
                      نعم، يمكن التعديل مع إشعار مسبق 24 ساعة
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>طرق أخرى للتواصل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    الدردشة المباشرة
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="mr-2 h-4 w-4" />
                    طلب مكالمة
                  </Button>
                  
                  <Link href="/merchant-register">
                    <Button className="w-full">
                      سجل الآن كتاجر
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Support Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">مركز المساعدة</h2>
              <p className="text-muted-foreground">
                ابحث عن إجابات لأسئلتك في مركز المساعدة
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Monitor className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">دليل البدء</h3>
                  <p className="text-sm text-muted-foreground">
                    تعلم كيفية إنشاء أول حملة إعلانية
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">الدعم الفني</h3>
                  <p className="text-sm text-muted-foreground">
                    حلول للمشاكل التقنية الشائعة
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">الفوترة</h3>
                  <p className="text-sm text-muted-foreground">
                    معلومات عن الأسعار وطرق الدفع
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}