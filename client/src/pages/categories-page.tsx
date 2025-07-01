import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Category, type OfferWithRelations } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function CategoriesPage() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: offers = [] } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/offers"],
  });

  // Count offers per category
  const getCategoryOfferCount = (categoryId: number) => {
    return offers.filter(offer => offer.categoryId === categoryId).length;
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الفئات...</p>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            تصفح جميع الفئات
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف العروض والخصومات في جميع الفئات المتاحة
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📂</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد فئات متاحة حالياً
            </h3>
            <p className="text-gray-600 mb-6">
              سيتم إضافة المزيد من الفئات قريباً
            </p>
            <Link href="/">
              <Button>العودة للصفحة الرئيسية</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const offerCount = getCategoryOfferCount(category.id);
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-md">
                    <CardHeader className="text-center pb-4">
                      <div className="text-6xl mb-4">{category.emoji}</div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                        {category.nameAr}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={offerCount > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {offerCount > 0 ? `${offerCount} عرض متاح` : "لا توجد عروض"}
                        </Badge>
                        <div className="text-sm text-green-600 font-medium">
                          تصفح الآن ←
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {categories.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              لم تجد ما تبحث عنه؟
            </p>
            <Link href="/">
              <Button variant="outline">
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}