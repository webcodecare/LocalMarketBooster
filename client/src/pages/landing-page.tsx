import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Monitor, MapPin, Users, BarChart3, Shield, Clock, ArrowRight, CheckCircle, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                لقطها
              </h1>
              <p className="text-xs text-muted-foreground">Laqtoha Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="outline">تسجيل الدخول</Button>
            </Link>
            <Link href="/merchant-register">
              <Button>انضم كتاجر</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="secondary" className="mb-4">
            منصة الإعلانات الذكية في السعودية
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            لقطها
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            منصة متكاملة للشركات السعودية لنشر إعلاناتها على الشاشات الذكية في أهم المواقع التجارية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/offers">
              <Button size="lg" className="min-w-[200px]">
                <Monitor className="mr-2 h-5 w-5" />
                جميع العروض
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/merchant-register">
              <Button size="lg" variant="outline" className="min-w-[200px]">
                <Users className="mr-2 h-5 w-5" />
                سجل كتاجر
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="ghost" className="min-w-[200px]">
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">لماذا لقطها؟</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نوفر حلول إعلانية متطورة للشركات السعودية مع أحدث التقنيات
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>مواقع استراتيجية</CardTitle>
                <CardDescription>
                  شاشات في أفضل المواقع التجارية والمولات الرئيسية
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>تحليلات متقدمة</CardTitle>
                <CardDescription>
                  تقارير مفصلة عن أداء إعلاناتك ومعدل المشاهدة
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>مراجعة آمنة</CardTitle>
                <CardDescription>
                  مراجعة المحتوى قبل النشر لضمان الجودة والأمان
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">كيف يعمل؟</h2>
            <p className="text-lg text-muted-foreground">خطوات بسيطة لبدء حملتك الإعلانية</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">سجل حسابك</h3>
              <p className="text-sm text-muted-foreground">
                أنشئ حساب تاجر واملأ بيانات شركتك
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">اختر الموقع</h3>
              <p className="text-sm text-muted-foreground">
                تصفح الشاشات واختر الموقع المناسب لعملك
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">ارفع المحتوى</h3>
              <p className="text-sm text-muted-foreground">
                ارفع إعلانك وحدد فترة العرض المطلوبة
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">ابدأ حملتك</h3>
              <p className="text-sm text-muted-foreground">
                بعد الموافقة، سيتم عرض إعلانك فوراً
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">أرقام تتحدث عن نفسها</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-blue-100">موقع استراتيجي</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <p className="text-blue-100">حملة إعلانية</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-blue-100">شركة راضية</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <p className="text-blue-100">معدل الرضا</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">ماذا يقول عملاؤنا</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm">
                  "منصة ممتازة ساعدتنا في الوصول لعملاء جدد. الخدمة احترافية والنتائج مبهرة."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">أحمد السعدي</p>
                    <p className="text-xs text-muted-foreground">مدير التسويق - مطاعم الذواقة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm">
                  "زادت مبيعاتنا بنسبة 40% بعد استخدام لقطها. الاستهداف الجغرافي دقيق جداً."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">فاطمة المحمد</p>
                    <p className="text-xs text-muted-foreground">صاحبة متجر الأناقة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm">
                  "سهولة في الاستخدام ودعم فني ممتاز. ننصح جميع التجار باستخدام هذه المنصة."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">خالد العتيبي</p>
                    <p className="text-xs text-muted-foreground">مدير العمليات - تك سلوشنز</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك الإعلانية اليوم</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            انضم إلى مئات الشركات التي تثق في لقطها لحملاتها الإعلانية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/merchant-register">
              <Button size="lg" className="min-w-[200px]">
                <Users className="mr-2 h-5 w-5" />
                سجل الآن مجاناً
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="min-w-[200px]">
                تحدث مع فريق المبيعات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse Screens Section for Merchants */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">هل أنت صاحب شركة أو تاجر؟</h2>
            <p className="text-lg text-muted-foreground mb-8">
              تصفح جميع مواقع الشاشات المتاحة لحجز إعلاناتك واختر الموقع الأنسب لعملك
            </p>
            <Link href="/screen-locations">
              <Button size="lg" variant="outline" className="min-w-[250px]">
                <MapPin className="mr-2 h-5 w-5" />
                تصفح مواقع الشاشات
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">لقطها</h3>
              </div>
              <p className="text-gray-400 text-sm">
                منصة الإعلانات الذكية للشركات السعودية
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">الخدمات</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/categories" className="hover:text-white">الشاشات الإعلانية</Link></li>
                <li><Link href="/screen-ads" className="hover:text-white">حجز الشاشات</Link></li>
                <li><Link href="/analytics" className="hover:text-white">التحليلات</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">الشركة</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">من نحن</Link></li>
                <li><Link href="/contact" className="hover:text-white">تواصل معنا</Link></li>
                <li><Link href="/careers" className="hover:text-white">الوظائف</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">القانونية</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white">الشروط والأحكام</Link></li>
                <li><Link href="/privacy" className="hover:text-white">سياسة الخصوصية</Link></li>
                <li><Link href="/support" className="hover:text-white">الدعم الفني</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 لقطها - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}