import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Star, Zap, ArrowLeft, CreditCard } from "lucide-react";
import { SubscriptionPayment } from "@/components/subscription-payment";

interface SubscriptionPlan {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  currency: string;
  billingPeriod: string;
  offerLimit: number | null;
  isActive: boolean;
  sortOrder: number;
  color: string;
  icon: string;
  isPopular: boolean;
}

interface MerchantSubscription {
  id?: number;
  startDate?: string;
  endDate?: string;
  status: string;
  autoRenew?: boolean;
  plan: SubscriptionPlan;
  isFree?: boolean;
}

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery<MerchantSubscription>({
    queryKey: ["/api/merchant/subscription"],
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest("POST", "/api/merchant/subscribe", { planId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchant/subscription"] });
      toast({
        title: "اشتراك ناجح",
        description: "تم الاشتراك في الخطة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الاشتراك",
        description: error.message || "حدث خطأ أثناء الاشتراك",
        variant: "destructive",
      });
    },
  });

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Star className="h-6 w-6" />;
      case "standard":
        return <Zap className="h-6 w-6" />;
      case "premium":
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return "from-gray-500 to-gray-600";
      case "standard":
        return "from-blue-500 to-blue-600";
      case "premium":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const isCurrentPlan = (planId: number) => {
    if (!currentSubscription) return false;
    if (currentSubscription.isFree && planId === 1) return true; // Assuming Free plan has ID 1
    return currentSubscription.plan?.id === planId;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-gray-600 mb-4">يجب تسجيل الدخول لعرض خطط الاشتراك</p>
          <Button onClick={() => setLocation("/auth")}>تسجيل الدخول</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/home")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للوحة التحكم
          </Button>
          <h1 className="text-2xl font-bold">خطط الاشتراك</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="mb-8">
            <Card className="border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle>اشتراكك الحالي</CardTitle>
                <CardDescription>
                  تفاصيل الخطة المفعلة حاليًا
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{currentSubscription.plan.nameAr}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentSubscription.plan.offerLimit && currentSubscription.plan.offerLimit < 999
                        ? `حتى ${currentSubscription.plan.offerLimit} حجوزات شهريًا`
                        : "حجوزات غير محدودة"
                      }
                    </p>
                    {currentSubscription.endDate && (
                      <p className="text-sm text-muted-foreground">
                        ينتهي في: {new Date(currentSubscription.endDate).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {currentSubscription.plan.price} ريال
                    </div>
                    <Badge variant={currentSubscription.status === "active" ? "default" : "secondary"}>
                      {currentSubscription.status === "active" ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${isCurrentPlan(plan.id) ? 'ring-2 ring-blue-500' : ''} ${
                plan.name === "Premium" ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white' : ''
              }`}
            >
              {plan.name === "Premium" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    الأكثر شعبية
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="default">خطتك الحالية</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center text-white mb-4`}>
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl">{plan.nameAr}</CardTitle>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground"> ريال/شهر</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>
                      {plan.offerLimit && plan.offerLimit < 999
                        ? `حتى ${plan.offerLimit} حجوزات شهريًا`
                        : "حجوزات غير محدودة"
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>دعم العملاء</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>لوحة تحكم شاملة</span>
                  </div>

                  {plan.name === "Premium" && (
                    <>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm">تقارير متقدمة</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm">إحصائيات تفصيلية</span>
                      </div>
                    </>
                  )}

                  {plan.name === "Standard" && (
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">دعم مميز</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full"
                  variant={plan.name === "Premium" ? "default" : "outline"}
                  onClick={() => {
                    if (plan.price === 0) {
                      subscribeMutation.mutate(plan.id);
                    } else {
                      setSelectedPlan(plan);
                      setShowPaymentDialog(true);
                    }
                  }}
                  disabled={subscribeMutation.isPending || isCurrentPlan(plan.id)}
                >
                  {subscribeMutation.isPending ? (
                    "جاري الاشتراك..."
                  ) : isCurrentPlan(plan.id) ? (
                    "الخطة المفعلة"
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {plan.price === 0 ? "اشترك مجاناً" : "اشترك الآن"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">مقارنة المميزات</CardTitle>
              <CardDescription className="text-center">
                اختر الخطة التي تناسب احتياجاتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3">المميزة</th>
                      <th className="text-center py-3">مجاني</th>
                      <th className="text-center py-3">قياسي</th>
                      <th className="text-center py-3">مميز</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">عدد الحجوزات الشهرية</td>
                      <td className="text-center">1</td>
                      <td className="text-center">5</td>
                      <td className="text-center">غير محدود</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">الدعم المميز</td>
                      <td className="text-center">❌</td>
                      <td className="text-center">✅</td>
                      <td className="text-center">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">التقارير المتقدمة</td>
                      <td className="text-center">❌</td>
                      <td className="text-center">❌</td>
                      <td className="text-center">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription Payment</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <SubscriptionPayment
              plan={selectedPlan}
              onPaymentSuccess={() => {
                setShowPaymentDialog(false);
                setSelectedPlan(null);
                queryClient.invalidateQueries({ queryKey: ["/api/merchant/subscription"] });
                toast({
                  title: "Payment Successful",
                  description: "Your subscription has been activated successfully!",
                });
              }}
              onCancel={() => {
                setShowPaymentDialog(false);
                setSelectedPlan(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}