import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import OfferCard from "@/components/offers/offer-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OfferWithRelations, Category } from "@shared/schema";
import { useState } from "react";

export default function CategoryPage() {
  const { slug } = useParams();
  const [city, setCity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const category = categories.find(cat => cat.slug === slug);

  const { data: offers = [], isLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/offers", { categoryId: category?.id, city: city === "all" ? undefined : city, sortBy }],
    enabled: !!category,
  });

  const cities = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران",
    "الطائف", "بريدة", "تبوك", "خميس مشيط", "الهفوف", "المبرز", "حائل", "نجران",
    "الجبيل", "ينبع", "القطيف", "عرعر", "سكاكا", "جازان", "أبها", "القنفذة"
  ];

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">الفئة غير موجودة</h1>
              <p className="text-gray-600 mb-6">الفئة المطلوبة غير متوفرة</p>
              <Button onClick={() => window.location.href = '/'}>
                العودة إلى الصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      {/* Category Header */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{category.emoji}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.nameAr}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {category.description || `اكتشف أفضل العروض والخصومات في فئة ${category.nameAr}`}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-gray-600">
              عُثر على {offers.length} عرض في فئة {category.nameAr}
            </div>
            
            <div className="flex gap-4">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="جميع المدن" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {cities.map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="oldest">الأقدم</SelectItem>
                  <SelectItem value="views">الأكثر مشاهدة</SelectItem>
                  <SelectItem value="ending">ينتهي قريباً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : offers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-6">{category.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  لا توجد عروض في هذه الفئة
                </h3>
                <p className="text-gray-600 mb-6">
                  {city !== "all" ? `لا توجد عروض في فئة ${category.nameAr} في مدينة ${city}` 
                         : `لا توجد عروض في فئة ${category.nameAr} حالياً`}
                </p>
                <div className="flex gap-4 justify-center">
                  {city !== "all" && (
                    <Button variant="outline" onClick={() => setCity("all")}>
                      إظهار جميع المدن
                    </Button>
                  )}
                  <Button onClick={() => window.location.href = '/'}>
                    تصفح فئات أخرى
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {offers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>

              {/* Load More */}
              {offers.length >= 20 && (
                <div className="text-center mt-12">
                  <Button 
                    className="bg-saudi-green hover:bg-green-800"
                    onClick={() => {
                      // This would implement pagination in a real app
                      console.log("Load more offers");
                    }}
                  >
                    عرض المزيد من العروض
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
