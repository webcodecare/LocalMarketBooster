import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { FeatureCard } from "@/components/features/feature-card";
import type { OfferWithRelations, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

// Subscription plans configuration
const subscriptionPlans = [
  {
    name: "المجاني",
    nameEn: "free",
    price: 0,
    offerLimit: 3,
    duration: 30,
    features: [
      "3 عروض شهرياً",
      "عرض لمدة 7 أيام",
      "دعم أساسي",
      "إحصائيات بسيطة"
    ],
    color: "bg-gray-500"
  },
  {
    name: "الأساسي",
    nameEn: "basic", 
    price: 99,
    offerLimit: 10,
    duration: 30,
    features: [
      "10 عروض شهرياً",
      "عرض لمدة 15 يوم",
      "إحصائيات تفصيلية",
      "دعم الواتساب",
      "شارة متجر موثق ✅"
    ],
    color: "bg-blue-500"
  },
  {
    name: "المتقدم",
    nameEn: "premium",
    price: 199,
    offerLimit: 50,
    duration: 30,
    features: [
      "50 عرض شهرياً",
      "عرض لمدة 30 يوم",
      "إحصائيات متقدمة",
      "أولوية في الظهور",
      "فريق عمل (5 أعضاء)",
      "دعم هاتفي مباشر",
      "شارة متجر موثق ✅"
    ],
    color: "bg-saudi-green"
  }
];

interface OfferAnalytics {
  offerId: number;
  views: number;
  clicks: number;
  title: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function MerchantDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  
  // Feature access control
  const { features, hasFeatureAccess, getOfferLimit, userPlan, getPlanName } = useFeatureAccess();

  // Mock data for demonstration - will be replaced with real API calls
  const mockAnalytics: OfferAnalytics[] = [
    { offerId: 1, views: 1250, clicks: 87, title: "خصم 30% على الوجبات" },
    { offerId: 2, views: 890, clicks: 45, title: "عرض شراء قطعتين بسعر واحدة" },
    { offerId: 3, views: 675, clicks: 23, title: "خصم نهاية الأسبوع" }
  ];

  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: "عرضك على وشك الانتهاء",
      message: "عرض 'خصم 30%' سينتهي خلال 3 أيام",
      type: "offer",
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "تجديد الاشتراك",
      message: "اشتراكك سينتهي خلال 7 أيام. جدد الآن لتجنب انقطاع الخدمة",
      type: "subscription",
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  const { data: offers = [] } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/business/offers"],
  });

  // Get current subscription data
  const { data: currentSubscription } = useQuery({
    queryKey: ["/api/business/subscription"],
    queryFn: async () => {
      const response = await fetch("/api/business/subscription");
      if (response.status === 404) return null; // No active subscription
      if (!response.ok) throw new Error("Failed to fetch subscription");
      return response.json();
    }
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planData: { plan: string; paymentMethod: string }) => {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, plan: planData.plan };
    },
    onSuccess: (data) => {
      toast({
        title: "تم ترقية الاشتراك",
        description: `تم ترقية اشتراكك إلى خطة ${selectedPlan} بنجاح`,
        variant: "default",
      });
      setShowUpgradeDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    }
  });

  const supportMutation = useMutation({
    mutationFn: async (ticketData: { subject: string; message: string }) => {
      // Mock support ticket creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, ticketId: Math.random().toString(36).substr(2, 9) };
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء تذكرة الدعم",
        description: `رقم التذكرة: ${data.ticketId}`,
        variant: "default",
      });
      setShowSupportDialog(false);
      setSupportSubject("");
      setSupportMessage("");
    }
  });

  const currentPlan = subscriptionPlans.find(plan => plan.nameEn === user?.subscriptionPlan) || subscriptionPlans[0];
  const usedOffers = offers.length;
  const remainingOffers = Math.max(0, (user?.offerLimit || 3) - usedOffers);
  const usagePercentage = Math.min(100, (usedOffers / (user?.offerLimit || 3)) * 100);

  const getSubscriptionStatus = () => {
    if (!user?.subscriptionExpiry) return "غير محدد";
    const expiry = new Date(user.subscriptionExpiry);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return "منتهي";
    if (daysLeft <= 7) return `${daysLeft} أيام متبقية`;
    return `${daysLeft} يوم متبقي`;
  };

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setShowUpgradeDialog(true);
  };

  const processPayment = () => {
    upgradeMutation.mutate({
      plan: selectedPlan,
      paymentMethod: "card"
    });
  };

  const submitSupportTicket = () => {
    if (!supportSubject.trim() || !supportMessage.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    supportMutation.mutate({
      subject: supportSubject,
      message: supportMessage
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BackButton fallbackPath="/" />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Business Info */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-saudi-green rounded-full flex items-center justify-center text-white text-2xl font-bold ml-4">
              {user.businessName?.charAt(0) || user.username.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                {user.businessName || user.username}
                {user.isVerified && <span className="text-saudi-green ml-2">✅</span>}
              </h1>
              <p className="text-gray-600">{user.businessCategory} • {user.businessCity}</p>
            </div>
          </div>
          <div className="text-left">
            <Badge variant="outline" className={`${currentPlan.color} text-white border-0`}>
              خطة {currentPlan.name}
            </Badge>
            <p className="text-sm text-gray-500 mt-1">{getSubscriptionStatus()}</p>
          </div>
        </div>

        {/* Notifications Banner */}
        {mockNotifications.filter(n => !n.isRead).length > 0 && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-orange-800">تنبيهات مهمة</h3>
                    <p className="text-orange-700 text-sm">لديك {mockNotifications.filter(n => !n.isRead).length} تنبيهات جديدة</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-orange-700 border-orange-300"
                    onClick={() => setActiveTab("notifications")}
                  >
                    عرض جميع التنبيهات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="offers">إدارة العروض</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="branches">إدارة الفروع</TabsTrigger>
            <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
            <TabsTrigger value="notifications">التنبيهات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Premium Features Banner */}
            {(user.subscriptionPlan === "basic" || user.subscriptionPlan === "premium") && (
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center ml-4">
                        <i className="fas fa-crown text-purple-600 text-xl"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-800">الميزات المتقدمة متاحة</h3>
                        <p className="text-purple-700 text-sm">
                          الذكاء الاصطناعي، الأتمتة، التحليلات المتقدمة والمزيد
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setLocation("/premium")}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <i className="fas fa-magic ml-2"></i>
                      استكشف الميزات المتقدمة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-saudi-green/10 rounded-lg flex items-center justify-center ml-4">
                      <i className="fas fa-tags text-saudi-green text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{usedOffers}</p>
                      <p className="text-gray-600 text-sm">العروض النشطة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ml-4">
                      <i className="fas fa-eye text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockAnalytics.reduce((sum, item) => sum + item.views, 0)}
                      </p>
                      <p className="text-gray-600 text-sm">إجمالي المشاهدات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center ml-4">
                      <i className="fas fa-mouse-pointer text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockAnalytics.reduce((sum, item) => sum + item.clicks, 0)}
                      </p>
                      <p className="text-gray-600 text-sm">النقرات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center ml-4">
                      <i className="fas fa-crown text-purple-600 text-xl"></i>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{remainingOffers}</p>
                      <p className="text-gray-600 text-sm">عروض متبقية</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Progress */}
            <Card>
              <CardHeader>
                <CardTitle>استخدام العروض الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>استخدمت {usedOffers} من {user.offerLimit || 3} عروض</span>
                      <span>{usagePercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={usagePercentage} className="h-3" />
                  </div>
                  {usagePercentage >= 80 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-800 text-sm">
                        <i className="fas fa-exclamation-triangle ml-2"></i>
                        أنت قريب من الوصول لحد العروض الشهرية. فكر في ترقية خطتك.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-reverse space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notification.isRead ? 'bg-gray-400' : 'bg-saudi-green'}`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-gray-600 text-sm">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>الميزات المتاحة</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">
                    باقة {getPlanName(userPlan)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-green-800">حد العروض الشهرية</h4>
                      <p className="text-sm text-green-600">
                        يمكنك إنشاء {getOfferLimit()} عروض شهرياً
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {getOfferLimit()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature) => (
                    <FeatureCard 
                      key={feature.id} 
                      feature={feature}
                      onUpgrade={() => setShowUpgradeDialog(true)}
                    />
                  ))}
                </div>
                
                {features.some(f => f.isLocked) && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="fas fa-lightbulb text-yellow-600 ml-2"></i>
                      <div>
                        <h4 className="font-medium text-yellow-800">أطلق إمكانيات أكثر</h4>
                        <p className="text-sm text-yellow-700">
                          ترقى إلى باقة أعلى للوصول لجميع الميزات المتقدمة وزيادة حد العروض
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-2 bg-yellow-600 hover:bg-yellow-700"
                          onClick={() => setShowUpgradeDialog(true)}
                        >
                          <i className="fas fa-arrow-up ml-2"></i>
                          ترقية الباقة
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>خطة الاشتراك الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className={`${currentPlan.color} text-white p-6 rounded-lg`}>
                      <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
                      <p className="text-3xl font-bold mb-4">{currentPlan.price} ر.س/شهر</p>
                      <ul className="space-y-2 text-sm">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <i className="fas fa-check ml-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold mb-4">الخطط المتاحة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subscriptionPlans.filter(plan => plan.nameEn !== currentPlan.nameEn).map((plan) => (
                        <div key={plan.nameEn} className="border rounded-lg p-4">
                          <h5 className="font-semibold text-lg mb-2">{plan.name}</h5>
                          <p className="text-2xl font-bold text-saudi-green mb-2">{plan.price} ر.س/شهر</p>
                          <ul className="space-y-1 text-sm text-gray-600 mb-4">
                            {plan.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <i className="fas fa-check text-saudi-green ml-2"></i>
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            onClick={() => handleUpgrade(plan.name)}
                            className="w-full bg-saudi-green hover:bg-green-700"
                          >
                            ترقية إلى {plan.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء العروض</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.map((analytics) => (
                    <div key={analytics.offerId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{analytics.title}</h4>
                        <p className="text-gray-600 text-sm">العرض #{analytics.offerId}</p>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{analytics.views}</p>
                          <p className="text-xs text-gray-500">مشاهدة</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-saudi-green">{analytics.clicks}</p>
                          <p className="text-xs text-gray-500">نقرة</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {((analytics.clicks / analytics.views) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">معدل النقر</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة العروض</h2>
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="bg-saudi-green hover:bg-green-700"
              >
                <i className="fas fa-plus ml-2"></i>
                إضافة عرض جديد
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                {offers.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-tags text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">لم تقم بإنشاء أي عروض بعد</p>
                    <Button 
                      onClick={() => setLocation("/dashboard")}
                      className="mt-4 bg-saudi-green hover:bg-green-700"
                    >
                      إنشاء عرضك الأول
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div key={offer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img 
                              src={offer.imageUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                              alt={offer.title}
                              className="w-16 h-16 rounded-lg object-cover ml-4"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                              <p className="text-gray-600 text-sm">{offer.category.nameAr}</p>
                              <div className="flex items-center mt-1 space-x-reverse space-x-4">
                                <span className="text-green-600 text-sm font-medium">
                                  <i className="fas fa-eye ml-1"></i>
                                  {offer.views} مشاهدة
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-reverse space-x-3">
                            <Badge variant={offer.isActive ? "default" : "secondary"}>
                              {offer.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                            <Button variant="outline" size="sm">
                              تعديل
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الفريق</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600 mb-4">ميزة إدارة الفريق متاحة في الخطط المدفوعة</p>
                  <Button 
                    onClick={() => handleUpgrade("المتقدم")}
                    className="bg-saudi-green hover:bg-green-700"
                  >
                    ترقية للوصول لهذه الميزة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إنشاء تذكرة دعم</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowSupportDialog(true)}
                    className="w-full bg-saudi-green hover:bg-green-700"
                  >
                    <i className="fas fa-ticket-alt ml-2"></i>
                    إنشاء تذكرة جديدة
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الاتصال</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <i className="fas fa-envelope text-saudi-green ml-3"></i>
                    <span>support@laqatha.sa</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fab fa-whatsapp text-saudi-green ml-3"></i>
                    <span>+966 50 123 4567</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock text-saudi-green ml-3"></i>
                    <span>الأحد - الخميس: 9:00 ص - 6:00 م</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>جميع التنبيهات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-reverse space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className={`w-3 h-3 rounded-full mt-2 ${notification.isRead ? 'bg-gray-400' : 'bg-saudi-green'}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            notification.type === 'offer' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'subscription' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.type === 'offer' ? 'عرض' :
                             notification.type === 'subscription' ? 'اشتراك' : 'عام'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-gray-400 text-xs">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Mark as read logic here
                          }}
                        >
                          تم القراءة
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {mockNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-bell-slash text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">لا توجد تنبيهات جديدة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>ترقية الاشتراك إلى {selectedPlan}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-2">تفاصيل الدفع</h4>
                <p className="text-sm text-gray-600 mb-4">سيتم تجديد الاشتراك تلقائياً كل شهر</p>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cardNumber">رقم البطاقة</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName">اسم حامل البطاقة</Label>
                    <Input id="cardName" placeholder="الاسم كما يظهر على البطاقة" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={processPayment}
                  disabled={upgradeMutation.isPending}
                  className="flex-1 bg-saudi-green hover:bg-green-700"
                >
                  {upgradeMutation.isPending ? "جاري المعالجة..." : "تأكيد الدفع"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpgradeDialog(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Support Dialog */}
        <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء تذكرة دعم</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">الموضوع</Label>
                <Input 
                  id="subject"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="اكتب موضوع المشكلة"
                />
              </div>
              <div>
                <Label htmlFor="message">الرسالة</Label>
                <Textarea 
                  id="message"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="اشرح المشكلة بالتفصيل"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={submitSupportTicket}
                  disabled={supportMutation.isPending}
                  className="flex-1 bg-saudi-green hover:bg-green-700"
                >
                  {supportMutation.isPending ? "جاري الإرسال..." : "إرسال التذكرة"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSupportDialog(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}