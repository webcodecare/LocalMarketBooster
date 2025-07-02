import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  billingPeriod: string;
  offerLimit: number;
  isActive: boolean;
  sortOrder: number;
  color: string;
  icon: string;
  isPopular: boolean;
  features: string[];
}

export default function PackagesPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star className="w-8 h-8" />;
      case 'crown':
        return <Crown className="w-8 h-8" />;
      case 'zap':
        return <Zap className="w-8 h-8" />;
      default:
        return <Star className="w-8 h-8" />;
    }
  };

  const getPriceForPeriod = (price: number) => {
    return billingPeriod === "yearly" ? price * 10 : price; // 2 months free on yearly
  };

  const handleSubscribe = (planId: number) => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    
    if (user.role === "business") {
      setLocation(`/merchant/upgrade?planId=${planId}`);
    } else {
      setLocation("/merchant-register");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saudi-green mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الباقات...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            اختر الباقة المناسبة لك
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            اكتشف باقاتنا المميزة المصممة خصيصاً لتلبية احتياجات أعمالك وتوسيع نطاق وصولك
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium ${billingPeriod === "monthly" ? "text-saudi-green" : "text-gray-500"}`}>
              شهري
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingPeriod === "yearly" ? "bg-saudi-green" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === "yearly" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${billingPeriod === "yearly" ? "text-saudi-green" : "text-gray-500"}`}>
                سنوي
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                وفر شهرين مجاناً
              </Badge>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans
            .filter(plan => plan.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((plan) => {
              const price = getPriceForPeriod(plan.price);
              const isPopular = plan.isPopular;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isPopular 
                      ? "border-2 border-saudi-green shadow-lg scale-105" 
                      : "border border-gray-200 hover:border-saudi-green"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-saudi-green text-white text-center py-2 text-sm font-medium">
                      الأكثر شيوعاً
                    </div>
                  )}
                  
                  <CardHeader className={`text-center ${isPopular ? "pt-12" : "pt-6"}`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${plan.color}`}>
                      {getIcon(plan.icon)}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.nameAr}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-saudi-green">
                        {price === 0 ? "مجاني" : `${price} ر.س`}
                      </div>
                      {price > 0 && (
                        <div className="text-sm text-gray-500">
                          /{billingPeriod === "monthly" ? "شهر" : "سنة"}
                        </div>
                      )}
                      {billingPeriod === "yearly" && price > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          توفير {plan.price * 2} ر.س سنوياً
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 text-center">
                      {plan.descriptionAr}
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-3">
                      {plan.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-saudi-green flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      )) || (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-saudi-green" />
                            <span className="text-gray-700">{plan.offerLimit} عروض شهرياً</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-saudi-green" />
                            <span className="text-gray-700">دعم العملاء</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-saudi-green" />
                            <span className="text-gray-700">إحصائيات أساسية</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                        isPopular
                          ? "bg-saudi-green hover:bg-green-700 text-white shadow-lg"
                          : "bg-white border-2 border-saudi-green text-saudi-green hover:bg-saudi-green hover:text-white"
                      }`}
                    >
                      {price === 0 ? "ابدأ مجاناً" : "اشترك الآن"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            الأسئلة الشائعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل يمكنني تغيير الباقة لاحقاً؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نعم، يمكنك ترقية أو تخفيض الباقة في أي وقت من لوحة التحكم الخاصة بك.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ما هي طرق الدفع المتاحة؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نقبل جميع بطاقات الائتمان الرئيسية، مدى، وطرق الدفع الإلكترونية المحلية.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل هناك رسوم إضافية؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  لا توجد رسوم خفية. السعر المعروض يشمل جميع الميزات المذكورة في الباقة.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">كيف يمكنني الحصول على الدعم؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  فريق الدعم متاح 24/7 عبر الواتساب والبريد الإلكتروني لجميع العملاء.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}