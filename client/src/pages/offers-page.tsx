import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { type Category, type OfferWithRelations } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import OfferCard from "@/components/offers/offer-card";
import { Search } from "lucide-react";

export default function OffersPage() {
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: offers = [], isLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/offers", { 
      categoryId: category === "all" ? undefined : parseInt(category),
      city: city === "all" ? undefined : city,
      search: searchQuery || undefined
    }],
  });

  const cities = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران",
    "الطائف", "بريدة", "تبوك", "خميس مشيط", "الهفوف", "المبرز", "حائل", "نجران",
    "الجبيل", "ينبع", "القطيف", "عرعر", "سكاكا", "جازان", "أبها", "القنفذة"
  ];

  const sortedOffers = [...offers].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime();
      case "ending":
        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case "discount":
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      default:
        return 0;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل العروض...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            جميع العروض والخصومات
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            اكتشف أفضل العروض والخصومات من الأعمال المحلية في المملكة العربية السعودية
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="ابحث في العروض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </form>

          <div className="flex flex-wrap gap-4 justify-center">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.emoji} {cat.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="ending">ينتهي قريباً</SelectItem>
                <SelectItem value="discount">أعلى خصم</SelectItem>
              </SelectContent>
            </Select>

            {(city !== "all" || category !== "all" || searchQuery) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCity("all");
                  setCategory("all");
                  setSearchQuery("");
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            {sortedOffers.length > 0 
              ? `تم العثور على ${sortedOffers.length} عرض`
              : "لا توجد عروض متطابقة مع البحث"
            }
          </p>
        </div>

        {/* Offers Grid */}
        {sortedOffers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد عروض
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || city !== "all" || category !== "all"
                ? "جرب تغيير معايير البحث أو الفلاتر"
                : "لا توجد عروض متاحة حالياً"
              }
            </p>
            <div className="flex gap-4 justify-center">
              {(city !== "all" || category !== "all" || searchQuery) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCity("all");
                    setCategory("all");
                    setSearchQuery("");
                  }}
                >
                  مسح الفلاتر
                </Button>
              )}
              <Button onClick={() => window.location.href = '/'}>
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}