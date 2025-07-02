import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BackButton } from "@/components/ui/back-button";
import type { LeadsSubscriptionPlan } from "@shared/schema";

export default function MerchantPackages() {
  const { user } = useAuth();

  const { data: plans = [], isLoading } = useQuery<LeadsSubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
  });

  const packageIcons = {
    1: <Star className="w-6 h-6" />,
    2: <Zap className="w-6 h-6" />,
    3: <Crown className="w-6 h-6" />
  };

  const packageColors = {
    1: "border-gray-200 bg-white",
    2: "border-blue-200 bg-blue-50 relative",
    3: "border-purple-200 bg-purple-50"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            باقات اشتراك براق
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            اختر الباقة المناسبة لنشاطك التجاري واستفد من ميزات منصة براق المتقدمة
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const planIndex = index + 1;
            const features = plan.featuresAr || plan.features || [];
            const isPopular = planIndex === 2;
            
            return (
              <Card 
                key={plan.id} 
                className={`${packageColors[planIndex as keyof typeof packageColors]} transition-all duration-300 hover:shadow-xl hover:scale-105`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1 text-sm">
                      الأكثر شعبية
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      planIndex === 1 ? 'bg-gray-100 text-gray-600' :
                      planIndex === 2 ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {packageIcons[planIndex as keyof typeof packageIcons]}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">
                    {plan.nameAr}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.descriptionAr}
                  </CardDescription>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === "0" ? "مجاني" : `${plan.price} ريال`}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-gray-500">/ شهر</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    {Array.isArray(features) && features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Package Stats */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>الحد الأقصى للعروض:</span>
                      <span className="font-medium">
                        {plan.maxOffers === -1 ? "غير محدود" : plan.maxOffers}
                      </span>
                    </div>
                    
                    {plan.priorityOffers && (
                      <div className="flex justify-between">
                        <span>العروض المميزة:</span>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    
                    {plan.analytics && (
                      <div className="flex justify-between">
                        <span>التحليلات المتقدمة:</span>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    
                    {plan.badges && (
                      <div className="flex justify-between">
                        <span>الشارات والإنجازات:</span>
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Action Button */}
                  <div className="pt-4">
                    {user ? (
                      <Button 
                        className={`w-full ${
                          planIndex === 1 ? 'bg-gray-600 hover:bg-gray-700' :
                          planIndex === 2 ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-purple-600 hover:bg-purple-700'
                        }`}
                        size="lg"
                      >
                        <Link href={`/dashboard?upgrade=${plan.id}`} className="flex items-center gap-2">
                          {plan.price === "0" ? "البدء الآن" : "ترقية الباقة"}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="lg"
                      >
                        <Link href="/auth" className="flex items-center gap-2">
                          إنشاء حساب مجاني
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">
                هل تحتاج باقة مخصصة لنشاطك التجاري؟
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                تواصل معنا لتصميم باقة مخصصة تناسب احتياجاتك الخاصة مع ميزات إضافية ودعم مخصص
              </p>
              <Button variant="secondary" size="lg">
                <Link href="/contact" className="flex items-center gap-2">
                  تواصل معنا
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}