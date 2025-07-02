import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OfferCard from "@/components/offers/offer-card";
import type { OfferWithRelations, Category } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { 
  Store, 
  Utensils, 
  Camera, 
  Dumbbell, 
  Coffee, 
  Shirt, 
  Smartphone, 
  Heart, 
  Car, 
  Palette, 
  GraduationCap, 
  Briefcase,
  Home,
  ShoppingBag,
  Plane,
  Gamepad2,
  Star
} from "lucide-react";

const categoryIcons = {
  "مطاعم": Utensils,
  "سياحة": Camera,
  "صالات رياضية": Dumbbell,
  "مقاهي": Coffee,
  "أزياء": Shirt,
  "إلكترونيات": Smartphone,
  "تجميل": Heart,
  "سيارات": Car,
  "فنون": Palette,
  "تعليم": GraduationCap,
  "خدمات مهنية": Briefcase,
  "منزل وحديقة": Home,
  "تسوق": ShoppingBag,
  "سفر": Plane,
  "ترفيه": Gamepad2,
  "صحة": Heart
};

export default function HomePage() {
  const { user } = useAuth();

  const { data: featuredOffers = [], isLoading: featuredLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/offers?featured=true&limit=8"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const mainCategories = categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header - Simplified for customers */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/attached_assets/ChatGPT_Image_Jun_25__2025__02_32_00_AM-removebg-preview_1750807971844.png" 
                  alt="Baraq Logo" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  براق
                </span>
              </Link>
            </div>

            {/* Navigation - Customer focused */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="lg">
                <Link href="/auth">
                  {user ? "لوحة التحكم" : "تسجيل الدخول"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Customer-Centric */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            اكتشف أفضل العروض الحصرية
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            عروض حصرية محدثة يومياً من أفضل المتاجر والخدمات حولك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="ابحث عن العروض، المتاجر، أو الخدمات..."
                className="w-full px-6 py-4 text-lg rounded-full text-gray-900 placeholder-gray-500 border-0 shadow-lg focus:ring-4 focus:ring-white/20 focus:outline-none"
              />
              <Button 
                size="lg" 
                className="absolute left-2 top-2 bottom-2 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                بحث
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - TOP PRIORITY */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              تصفح حسب الفئة
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              اختر الفئة التي تهمك واكتشف أفضل العروض والخصومات الحصرية
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
            {mainCategories.map((category) => {
              const IconComponent = categoryIcons[category.nameAr as keyof typeof categoryIcons] || Store;
              return (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-2 border-transparent hover:border-blue-200">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-600 group-hover:to-purple-700 transition-colors shadow-lg">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-3">
                        {category.nameAr}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Browse All Offers Button */}
          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-saudi-green to-green-600 hover:from-green-700 hover:to-green-800 text-white px-10 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link href="/offers" className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                تصفح جميع العروض والخصومات
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Offers - SECOND PRIORITY */}
      {featuredOffers.length > 0 && (
        <section className="py-10 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                🔥 العروض المميزة والحصرية
              </h2>
              <p className="text-lg text-gray-600">
                أفضل العروض والخصومات المختارة خصيصاً لك - لا تفوتها!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button size="lg" variant="outline" className="border-2 border-saudi-green text-saudi-green hover:bg-saudi-green hover:text-white px-8 py-3 text-lg font-semibold">
                <Link href="/offers" className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  شاهد المزيد من العروض
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* About Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            من نحن
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-xl leading-relaxed mb-6">
              براق منصة سعودية مبتكرة تعرض العروض والخصومات من الأعمال التجارية في مختلف القطاعات.
            </p>
            <p className="text-lg leading-relaxed">
              نهدف إلى ربط المستخدمين بأفضل الصفقات وتوفير قناة ترويجية فعالة وبسيطة للتجار.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                تواصل معنا
              </h2>
              <p className="text-xl mb-8">
                هل لديك استفسار أو تريد الانضمام كتاجر؟ نحن هنا لمساعدتك
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/contact">تواصل معنا</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                  <Link href="/auth">انضم كتاجر</Link>
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 p-4">
                <img 
                  src="/attached_assets/ChatGPT_Image_Jun_25__2025__02_32_00_AM-removebg-preview_1750807971844.png" 
                  alt="Baraq Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">منصة براق</h3>
              <p className="text-gray-300">نربط العملاء بأفضل العروض</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">&copy; 2025 منصة براق. جميع الحقوق محفوظة.</p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="text-gray-300 hover:text-white">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white">
              الشروط والأحكام
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white">
              تواصل معنا
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}