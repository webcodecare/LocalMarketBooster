import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Plane, Heart, Dumbbell, Utensils, Coffee, Shirt, 
  Smartphone, Home, GraduationCap, Building, Calendar,
  Baby, Gamepad2, Car, Wrench, Monitor, ArrowRight, 
  CheckCircle, Star, Users, BarChart3, Shield
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import FloatingWhatsApp from "@/components/floating-whatsapp";
import SocialMediaIcons from "@/components/social-media-icons";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";

// Offer categories data
const offerCategories = [
  { name: "السفر والسياحة", nameEn: "Travel & Tourism", icon: Plane, slug: "travel-tourism", color: "from-blue-500 to-cyan-500" },
  { name: "الطب والتجميل", nameEn: "Medical & Beauty", icon: Heart, slug: "medical-beauty", color: "from-pink-500 to-red-500" },
  { name: "النوادي الصحية", nameEn: "Gyms & Fitness", icon: Dumbbell, slug: "gyms-fitness", color: "from-orange-500 to-yellow-500" },
  { name: "المطاعم", nameEn: "Restaurants", icon: Utensils, slug: "restaurants", color: "from-green-500 to-emerald-500" },
  { name: "المقاهي", nameEn: "Cafés", icon: Coffee, slug: "cafes", color: "from-amber-500 to-orange-500" },
  { name: "الموضة والملابس", nameEn: "Fashion & Clothing", icon: Shirt, slug: "fashion-clothing", color: "from-purple-500 to-indigo-500" },
  { name: "الإلكترونيات والتقنية", nameEn: "Electronics & Technology", icon: Smartphone, slug: "electronics-technology", color: "from-blue-600 to-purple-600" },
  { name: "العقارات", nameEn: "Real Estate", icon: Home, slug: "real-estate", color: "from-teal-500 to-green-500" },
  { name: "التعليم والدورات", nameEn: "Education & Courses", icon: GraduationCap, slug: "education-courses", color: "from-indigo-500 to-blue-500" },
  { name: "المنتجعات والفنادق", nameEn: "Resorts & Hotels", icon: Building, slug: "resorts-hotels", color: "from-cyan-500 to-blue-500" },
  { name: "الفعاليات والمهرجانات", nameEn: "Events & Festivals", icon: Calendar, slug: "events-festivals", color: "from-pink-500 to-purple-500" },
  { name: "الأطفال والعائلة", nameEn: "Kids & Family", icon: Baby, slug: "kids-family", color: "from-green-400 to-blue-400" },
  { name: "الترفيه والألعاب", nameEn: "Entertainment & Games", icon: Gamepad2, slug: "entertainment-games", color: "from-red-500 to-pink-500" },
  { name: "السيارات والنقل", nameEn: "Cars & Transportation", icon: Car, slug: "cars-transportation", color: "from-gray-600 to-gray-800" },
  { name: "الخدمات المنزلية", nameEn: "Home Services", icon: Wrench, slug: "home-services", color: "from-yellow-500 to-orange-500" },
  { name: "التطبيقات والمنصات الرقمية", nameEn: "Apps & Digital Platforms", icon: Monitor, slug: "apps-digital", color: "from-violet-500 to-purple-500" }
];

export default function LandingPage() {
  const { user } = useAuth();
  
  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  // Filter to show only approved and active testimonials
  const approvedTestimonials = testimonials.filter(
    testimonial => testimonial.status === "approved" && testimonial.isActive
  );
  
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
                براق
              </h1>
              <p className="text-xs text-muted-foreground">منصة براق</p>
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
            منصة العروض والخصومات في السعودية
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            براق
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            اكتشف أفضل العروض والخصومات من الشركات السعودية في جميع المجالات
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

      {/* Offer Categories Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">تصفح العروض حسب الفئة</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اختر الفئة التي تهمك واكتشف أفضل العروض والخصومات المتاحة
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {offerCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link 
                  key={index} 
                  href={`/category/${category.slug}`}
                  className="group"
                >
                  <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700">
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/categories">
              <Button size="lg" variant="outline">
                عرض جميع الفئات
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">لماذا براق؟</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نوفر منصة متكاملة للشركات السعودية لعرض منتجاتها وخدماتها
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>عروض متنوعة</CardTitle>
                <CardDescription>
                  آلاف العروض والخصومات من مختلف الشركات والمتاجر السعودية
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>تحديث مستمر</CardTitle>
                <CardDescription>
                  عروض جديدة يومياً مع إشعارات فورية لأفضل الصفقات
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>موثوقية عالية</CardTitle>
                <CardDescription>
                  جميع العروض مراجعة ومضمونة من شركات معتمدة
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">كيف يعمل؟</h2>
            <p className="text-lg text-muted-foreground">خطوات بسيطة للاستفادة من العروض</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">تصفح الفئات</h3>
              <p className="text-sm text-muted-foreground">
                اختر الفئة التي تهمك من الفئات المتاحة
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">اكتشف العروض</h3>
              <p className="text-sm text-muted-foreground">
                تصفح العروض والخصومات المتاحة من الشركات
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">اختر العرض</h3>
              <p className="text-sm text-muted-foreground">
                حدد العرض المناسب واطلع على تفاصيله
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">استفد من العرض</h3>
              <p className="text-sm text-muted-foreground">
                تواصل مع الشركة واحصل على الخصم
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">لماذا يختارنا الشركاء؟</h2>
          </div>
          
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl leading-relaxed mb-8 text-blue-50">
              نحن نقدم منصة تسويقية مبتكرة تربط الشركات بالعملاء المهتمين بعروضها ومنتجاتها
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">+500</div>
                <div className="text-blue-100">شركة مسجلة</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">+10K</div>
                <div className="text-blue-100">عرض نشط</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold mb-2">+50K</div>
                <div className="text-blue-100">مستخدم يومي</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {approvedTestimonials.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">ماذا يقول عملاؤنا؟</h2>
              <p className="text-lg text-muted-foreground">
                تجارب حقيقية من الشركات التي تثق بنا
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {approvedTestimonials.slice(0, 6).map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{testimonial.clientName}</CardTitle>
                        <CardDescription>{testimonial.jobTitle}</CardDescription>
                        <div className="flex items-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">"{testimonial.reviewText}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك معنا اليوم</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            انضم إلى آلاف الشركات التي تثق بمنصة براق لعرض منتجاتها وخدماتها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/merchant-register">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                سجل كتاجر الآن
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/offers">
              <Button size="lg" variant="outline" className="min-w-[200px] text-white border-white hover:bg-white hover:text-blue-600">
                تصفح العروض
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">براق</h3>
                  <p className="text-xs text-gray-400">منصة براق</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                منصة العروض والخصومات الرائدة في السعودية
              </p>
              <SocialMediaIcons />
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <div className="space-y-2 text-sm">
                <Link href="/offers" className="block text-gray-400 hover:text-white transition-colors">
                  جميع العروض
                </Link>
                <Link href="/categories" className="block text-gray-400 hover:text-white transition-colors">
                  الفئات
                </Link>
                <Link href="/merchant-register" className="block text-gray-400 hover:text-white transition-colors">
                  سجل كتاجر
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  تواصل معنا
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">للتجار</h4>
              <div className="space-y-2 text-sm">
                <Link href="/auth" className="block text-gray-400 hover:text-white transition-colors">
                  تسجيل الدخول
                </Link>
                <Link href="/merchant-register" className="block text-gray-400 hover:text-white transition-colors">
                  إنشاء حساب
                </Link>
                <Link href="/plans" className="block text-gray-400 hover:text-white transition-colors">
                  خطط الاشتراك
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>info@laqtoha.com</p>
                <p>+966 12 345 6789</p>
                <p>الرياض، المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 براق. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}