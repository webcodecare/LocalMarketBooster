import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CategoryGrid from "@/components/offers/category-grid";
import OfferCard from "@/components/offers/offer-card";
import { PersonalizedOfferCarousel } from "@/components/personalized-offer-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OfferWithRelations, Category } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: featuredOffers = [], isLoading: featuredLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/offers?featured=true&limit=6"],
  });

  const { data: latestOffers = [], isLoading: latestLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/offers?limit=8"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-l from-saudi-green to-green-700 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-right">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6">
                مرحباً بكم في 
                <span className="text-saudi-gold block lg:inline"> براق</span>
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 lg:mb-8">
                اكتشف أفضل العروض
                <span className="text-saudi-gold"> والخصومات</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl mb-6 lg:mb-8 text-green-100 leading-relaxed">
                منصة شاملة للعروض والخصومات من أفضل المتاجر والمطاعم في المملكة العربية السعودية
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  className="bg-saudi-gold text-saudi-green px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-bold hover:bg-yellow-500 transition-all duration-300 shadow-lg"
                  onClick={() => {
                    document.getElementById('offers-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  تصفح العروض الآن
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-bold hover:bg-white hover:text-saudi-green transition-all duration-300"
                  onClick={() => window.location.href = '/auth'}
                >
                  للتجار: اضف عرضك
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Saudi business owners" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -top-4 -right-4 bg-saudi-gold text-saudi-green px-4 py-2 rounded-full font-bold text-sm">
                <i className="fas fa-fire ml-1"></i>
                عرض اليوم
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
            مرحباً بكم في براق
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
            اكتشف آلاف العروض والخصومات من أفضل المتاجر والمطاعم في المملكة
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">تصفح حسب الفئة</h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              اختر الفئة التي تهمك واكتشف أفضل العروض والخصومات المتاحة
            </p>
          </div>
          
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      {user && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PersonalizedOfferCarousel />
          </div>
        </section>
      )}

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-4 sm:mx-8"></div>

      {/* Featured Offers Section */}
      <section id="offers-section" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">العروض المميزة ⭐</h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 lg:mb-8 leading-relaxed">
              اكتشف أفضل العروض المختارة خصيصاً لك من متاجر ومطاعم مختارة بعناية
            </p>
            <Button 
              variant="outline"
              className="border-2 border-saudi-green text-saudi-green hover:bg-saudi-green hover:text-white font-bold px-8 py-3 rounded-xl transition-all duration-300"
              onClick={() => window.location.href = '/offers'}
            >
              عرض جميع العروض
              <i className="fas fa-arrow-left mr-3 scale-x-[-1]"></i>
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 sm:h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-8"></div>

      {/* Latest Offers Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">أحدث العروض 🆕</h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              آخر العروض والخصومات المضافة من التجار والمتاجر المختارة
            </p>
          </div>

          {latestLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 sm:h-36 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1 w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {latestOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} compact />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              className="bg-saudi-green text-white px-8 py-3 hover:bg-green-800 font-medium"
              onClick={() => window.location.href = '/offers'}
            >
              عرض المزيد من العروض
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-l from-saudi-green to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">
              انضم إلى منصة عروض السعودية
            </h3>
            <p className="text-xl text-green-100 mb-8">
              وصل إلى آلاف العملاء المحتملين واعرض منتجاتك وخدماتك بأفضل الطرق
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-saudi-gold text-saudi-green px-8 py-4 text-lg font-bold hover:bg-yellow-500"
                onClick={() => window.location.href = '/auth'}
              >
                ابدأ مجاناً الآن
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white px-8 py-4 text-lg font-bold hover:bg-white hover:text-saudi-green"
                onClick={() => window.location.href = '/dashboard'}
              >
                عرض لوحة التحكم
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
