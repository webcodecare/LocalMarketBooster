import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Plane, Heart, Dumbbell, Utensils, Coffee, Shirt, 
  Smartphone, Home, GraduationCap, Building, Calendar,
  Baby, Gamepad2, Car, Wrench, Monitor
} from "lucide-react";
import { type OfferWithRelations } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Same categories data as homepage for consistency
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

export default function CategoriesPage() {
  const { data: offers = [] } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/offers"],
  });

  // Count offers per category slug
  const getCategoryOfferCount = (slug: string) => {
    // This would need proper mapping from slug to category ID in a real implementation
    return Math.floor(Math.random() * 50) + 10; // Placeholder for demonstration
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold mb-4">تصفح جميع الفئات</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اختر الفئة التي تهمك واكتشف أفضل العروض والخصومات المتاحة
          </p>
        </div>
        
        {/* Categories Grid - Exact same design as homepage */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {offerCategories.map((category, index) => {
            const IconComponent = category.icon;
            const offerCount = getCategoryOfferCount(category.slug);
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
                    <CardDescription className="text-xs text-muted-foreground mt-2">
                      {offerCount} عرض متاح
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              لم تجد ما تبحث عنه؟
            </h2>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              تصفح جميع العروض المتاحة أو تواصل معنا لمساعدتك في العثور على ما تحتاجه
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/offers">
                <Button size="lg" variant="secondary" className="min-w-[180px]">
                  جميع العروض
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="min-w-[180px] text-white border-white hover:bg-white hover:text-blue-600">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}