import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Monitor, Upload, CheckCircle, ArrowRight, Building, Phone, Mail, FileText, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MerchantRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/merchant-register", {
        method: "POST",
        body: data,
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التسجيل بنجاح",
        description: "سيتم مراجعة طلبك والرد عليك خلال 24 ساعة",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في التسجيل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يجب أن يكون حجم الشعار أقل من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    registerMutation.mutate(formData);
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
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              انضم إلى شبكة التجار
            </Badge>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              سجل كتاجر في براق
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ابدأ رحلتك الإعلانية معنا واوصل لآلاف العملاء المحتملين في أفضل المواقع التجارية
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  معلومات الشركة
                </CardTitle>
                <CardDescription>
                  أدخل معلومات شركتك لبدء عملية التسجيل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">اسم الشركة *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="مثال: شركة التجارة المتقدمة"
                      required
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commercialRegNumber">رقم السجل التجاري *</Label>
                    <Input
                      id="commercialRegNumber"
                      name="commercialRegNumber"
                      placeholder="1010123456"
                      required
                      pattern="[0-9]{10}"
                      title="يجب أن يكون رقم السجل التجاري 10 أرقام"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الجوال *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="0501234567"
                        required
                        pattern="05[0-9]{8}"
                        title="رقم جوال سعودي صحيح"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="info@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">شعار الشركة</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("logo")?.click()}
                        className="flex items-center"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {logoFile ? "تغيير الشعار" : "رفع الشعار"}
                      </Button>
                      {previewUrl && (
                        <div className="w-16 h-16 border rounded-lg overflow-hidden">
                          <img
                            src={previewUrl}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      اختياري - JPG, PNG أقل من 5 ميجابايت
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      "جارٍ التسجيل..."
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        إرسال طلب التسجيل
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>مميزات الانضمام للمنصة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">وصول واسع</h4>
                      <p className="text-sm text-muted-foreground">
                        اعرض إعلاناتك في أكثر من 50 موقع استراتيجي
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">تحليلات مفصلة</h4>
                      <p className="text-sm text-muted-foreground">
                        تقارير شاملة عن أداء حملاتك الإعلانية
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">دعم فني 24/7</h4>
                      <p className="text-sm text-muted-foreground">
                        فريق متخصص لمساعدتك في جميع الأوقات
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">أسعار تنافسية</h4>
                      <p className="text-sm text-muted-foreground">
                        باقات مرنة تناسب جميع أحجام الأعمال
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>خطوات ما بعد التسجيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <p className="text-sm">مراجعة طلبك خلال 24 ساعة</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <p className="text-sm">إرسال تفاصيل الحساب عبر البريد</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <p className="text-sm">بدء أول حملة إعلانية مجاناً</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  لديك حساب بالفعل؟
                </p>
                <Link href="/auth">
                  <Button variant="outline">
                    تسجيل الدخول
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}