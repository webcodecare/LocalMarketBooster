import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackButton } from "@/components/ui/back-button";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  features: string[];
}

export default function MerchantUpgrade() {
  const [, params] = useRoute("/merchant/upgrade");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });

  const planId = params?.planId ? parseInt(params.planId) : null;

  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const selectedPlan = plans.find(p => p.id === (selectedPlanId || planId));

  useEffect(() => {
    if (planId && plans.length > 0) {
      setSelectedPlanId(planId);
    }
  }, [planId, plans]);

  const upgradeMutation = useMutation({
    mutationFn: async (upgradeData: {
      planId: number;
      paymentMethod: string;
      cardData?: any;
    }) => {
      const response = await apiRequest("POST", "/api/merchant/upgrade", upgradeData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم ترقية الباقة بنجاح",
        description: "سيتم تفعيل الباقة الجديدة خلال دقائق",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/business/subscription"] });
      setLocation("/merchant");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في ترقية الباقة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = () => {
    if (!selectedPlanId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار باقة أولاً",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "card" && (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name)) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع بيانات البطاقة",
        variant: "destructive",
      });
      return;
    }

    upgradeMutation.mutate({
      planId: selectedPlanId,
      paymentMethod,
      cardData: paymentMethod === "card" ? cardData : undefined
    });
  };

  if (!user || user.role !== "business") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">يجب تسجيل الدخول كتاجر للوصول لهذه الصفحة</p>
            <Button onClick={() => setLocation("/auth")}>تسجيل الدخول</Button>
          </div>
        </div>
      </div>
    );
  }

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallbackPath="/merchant" />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ترقية الباقة
          </h1>
          <p className="text-xl text-gray-600">
            اختر الباقة المناسبة واستفد من المزيد من الميزات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle>اختيار الباقة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans.filter(plan => plan.price > 0).map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlanId === plan.id
                      ? "border-saudi-green bg-green-50"
                      : "border-gray-200 hover:border-saudi-green"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{plan.nameAr}</h3>
                      <p className="text-gray-600">{plan.descriptionAr}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-saudi-green">
                        {plan.price} ر.س
                      </div>
                      <div className="text-sm text-gray-500">/شهر</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plan.features?.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-saudi-green" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selected Plan Summary */}
              {selectedPlan && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">{selectedPlan.nameAr}</h4>
                  <div className="flex justify-between items-center">
                    <span>السعر الشهري:</span>
                    <span className="font-bold text-saudi-green">{selectedPlan.price} ر.س</span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <Label>طريقة الدفع</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">بطاقة ائتمانية</SelectItem>
                    <SelectItem value="mada">مدى</SelectItem>
                    <SelectItem value="stc_pay">STC Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">رقم البطاقة</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => setCardData({...cardData, number: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="cardName">اسم حامل البطاقة</Label>
                    <Input
                      id="cardName"
                      placeholder="الاسم كما يظهر على البطاقة"
                      value={cardData.name}
                      onChange={(e) => setCardData({...cardData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">معاملة آمنة</p>
                  <p>جميع المعاملات محمية بتشفير SSL</p>
                </div>
              </div>

              {/* Upgrade Button */}
              <Button
                onClick={handleUpgrade}
                disabled={!selectedPlanId || upgradeMutation.isPending}
                className="w-full bg-saudi-green hover:bg-green-700 text-lg py-3"
              >
                {upgradeMutation.isPending ? (
                  "جاري المعالجة..."
                ) : selectedPlan ? (
                  `ترقية إلى ${selectedPlan.nameAr} - ${selectedPlan.price} ر.س/شهر`
                ) : (
                  "اختر باقة أولاً"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}