import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OfferWithRelations } from "@shared/schema";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { ar } from "date-fns/locale";

interface OfferScore {
  offerId: number;
  title: string;
  overallScore: number;
  titleStrength: number;
  urgencyScore: number;
  ctaScore: number;
  suggestions: string[];
}

interface SmartSuggestion {
  type: "timing" | "content" | "targeting";
  message: string;
  confidence: number;
  action?: string;
}

interface CampaignEvent {
  id: string;
  title: string;
  date: Date;
  type: "offer" | "campaign" | "holiday";
  status: "scheduled" | "active" | "completed";
}

const saudiHolidays = [
  { name: "اليوم الوطني السعودي", date: new Date(2025, 8, 23), type: "national" },
  { name: "يوم التأسيس", date: new Date(2025, 1, 22), type: "national" },
  { name: "رمضان المبارك", date: new Date(2025, 2, 1), type: "religious" },
  { name: "عيد الفطر", date: new Date(2025, 3, 30), type: "religious" },
];

export default function PremiumDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [autoRepostEnabled, setAutoRepostEnabled] = useState(false);
  const [geoTargeting, setGeoTargeting] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [businessType, setBusinessType] = useState("");
  const [offerGoal, setOfferGoal] = useState("");

  // Mock AI-powered data
  const mockOfferScores: OfferScore[] = [
    {
      offerId: 1,
      title: "خصم 30% على الوجبات",
      overallScore: 85,
      titleStrength: 90,
      urgencyScore: 70,
      ctaScore: 95,
      suggestions: [
        "أضف مدة محدودة للعرض لزيادة الإلحاح",
        "استخدم أرقام محددة بدلاً من النسب المئوية",
        "أضف تفاصيل عن نوع الوجبات المشمولة"
      ]
    },
    {
      offerId: 2,
      title: "عرض خاص",
      overallScore: 45,
      titleStrength: 30,
      urgencyScore: 40,
      ctaScore: 65,
      suggestions: [
        "العنوان غير واضح - اذكر المنتج والخصم بوضوح",
        "أضف رقم الخصم أو نسبة التوفير",
        "استخدم كلمات محفزة مثل 'حصري' أو 'محدود'",
        "أضف تاريخ انتهاء للعرض"
      ]
    }
  ];

  const mockSmartSuggestions: SmartSuggestion[] = [
    {
      type: "timing",
      message: "أفضل وقت لنشر العروض في مدينتك هو الخميس 2:00 م",
      confidence: 92,
      action: "schedule_optimal"
    },
    {
      type: "content",
      message: "العروض التي تحتوي على كلمة 'حصري' تحقق نقرات أكثر بـ 34%",
      confidence: 88
    },
    {
      type: "targeting",
      message: "استهداف الرياض وجدة معاً يزيد المشاهدات بـ 67%",
      confidence: 76,
      action: "update_targeting"
    }
  ];

  const mockCampaignEvents: CampaignEvent[] = [
    {
      id: "1",
      title: "عرض نهاية الأسبوع",
      date: addDays(new Date(), 2),
      type: "offer",
      status: "scheduled"
    },
    {
      id: "2", 
      title: "عرض اليوم الوطني",
      date: saudiHolidays[0].date,
      type: "campaign",
      status: "scheduled"
    }
  ];

  const { data: offers = [] } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/business/offers"],
  });

  const generateOfferMutation = useMutation({
    mutationFn: async (data: { businessType: string; goal: string }) => {
      // Simulate AI offer generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedOffers = [
        {
          title: "خصم حصري 25% على جميع المشتريات",
          description: "استمتع بخصم استثنائي على جميع منتجاتنا لفترة محدودة. لا تفوت الفرصة!",
          discount: "25%",
          urgency: "لمدة 48 ساعة فقط",
          cta: "اطلب الآن واحصل على التوفير"
        },
        {
          title: "عرض اشتر 2 واحصل على الثالث مجاناً",
          description: "عرض رائع للعائلات - اشتر قطعتين واحصل على الثالثة مجاناً",
          discount: "33%",
          urgency: "حتى نفاد الكمية",
          cta: "استفد من العرض فوراً"
        }
      ];
      
      return generatedOffers;
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء العروض بنجاح",
        description: `تم إنشاء ${data.length} عروض ذكية`,
      });
    }
  });

  const enableAutoRepostMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, enabled };
    },
    onSuccess: (data) => {
      setAutoRepostEnabled(data.enabled);
      toast({
        title: data.enabled ? "تم تفعيل الإعادة التلقائية" : "تم إيقاف الإعادة التلقائية",
        description: data.enabled ? "سيتم إعادة نشر العروض عالية الأداء تلقائياً" : "تم إيقاف الإعادة التلقائية",
      });
    }
  });

  const updateGeoTargetingMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; cities: string[] }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, ...data };
    },
    onSuccess: (data) => {
      setGeoTargeting(data.enabled);
      setSelectedCities(data.cities);
      toast({
        title: "تم تحديث الاستهداف الجغرافي",
        description: data.enabled ? `يتم الاستهداف في ${data.cities.length} مدن` : "تم إيقاف الاستهداف الجغرافي",
      });
    }
  });

  const generateAIOffers = () => {
    if (!businessType || !offerGoal) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار نوع النشاط والهدف",
        variant: "destructive",
      });
      return;
    }

    generateOfferMutation.mutate({
      businessType,
      goal: offerGoal
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Check if user has premium access
  const hasPremiumAccess = user.subscriptionPlan === "premium" || user.subscriptionPlan === "basic";

  if (!hasPremiumAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">ميزات متقدمة</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <i className="fas fa-crown text-4xl text-saudi-green"></i>
            <p className="text-gray-600">هذه الميزات متاحة للاشتراكات المدفوعة فقط</p>
            <Button 
              onClick={() => setLocation("/merchant")}
              className="w-full bg-saudi-green hover:bg-green-700"
            >
              ترقية الاشتراك
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button 
          onClick={() => setLocation("/merchant")}
          className="flex items-center text-gray-600 hover:text-saudi-green font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-200 mb-4"
        >
          <i className="fas fa-arrow-right ml-2"></i>
          العودة للوحة التاجر
        </button>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-crown text-saudi-green ml-3"></i>
              الميزات المتقدمة
            </h1>
            <p className="text-gray-600">أدوات ذكية لتحسين أداء عروضك</p>
          </div>
          <Badge className="bg-gradient-to-r from-saudi-green to-green-600 text-white">
            خطة متقدمة
          </Badge>
        </div>

        <Tabs defaultValue="ai-analyzer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ai-analyzer">محلل الذكي</TabsTrigger>
            <TabsTrigger value="automation">الأتمتة</TabsTrigger>
            <TabsTrigger value="analytics">تحليلات متقدمة</TabsTrigger>
            <TabsTrigger value="geo-targeting">الاستهداف</TabsTrigger>
            <TabsTrigger value="calendar">تقويم الحملات</TabsTrigger>
            <TabsTrigger value="ai-generator">مولد العروض</TabsTrigger>
          </TabsList>

          {/* AI Analyzer Tab */}
          <TabsContent value="ai-analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-brain text-saudi-green ml-3"></i>
                  تحليل العروض بالذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockOfferScores.map((offer) => (
                    <div key={offer.offerId} className={`p-6 rounded-lg border ${getScoreBg(offer.overallScore)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{offer.title}</h3>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getScoreColor(offer.overallScore)}`}>
                            {offer.overallScore}
                          </div>
                          <div className="text-sm text-gray-600">النقاط الإجمالية</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getScoreColor(offer.titleStrength)}`}>
                            {offer.titleStrength}
                          </div>
                          <div className="text-sm text-gray-600">قوة العنوان</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getScoreColor(offer.urgencyScore)}`}>
                            {offer.urgencyScore}
                          </div>
                          <div className="text-sm text-gray-600">الإلحاح</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getScoreColor(offer.ctaScore)}`}>
                            {offer.ctaScore}
                          </div>
                          <div className="text-sm text-gray-600">دعوة للعمل</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <i className="fas fa-lightbulb text-yellow-500 ml-2"></i>
                          اقتراحات التحسين
                        </h4>
                        <ul className="space-y-1">
                          {offer.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <i className="fas fa-arrow-left text-saudi-green ml-2 mt-1"></i>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-magic text-purple-600 ml-3"></i>
                  اقتراحات ذكية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSmartSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize">
                          {suggestion.type === "timing" ? "التوقيت" : 
                           suggestion.type === "content" ? "المحتوى" : "الاستهداف"}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          ثقة {suggestion.confidence}%
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{suggestion.message}</p>
                      {suggestion.action && (
                        <Button size="sm" variant="outline">
                          تطبيق الاقتراح
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-robot text-blue-600 ml-3"></i>
                  الأتمتة الذكية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Repost */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">إعادة النشر التلقائي</h3>
                    <p className="text-gray-600 text-sm">
                      إعادة نشر العروض عالية الأداء تلقائياً بعد 3 أيام من انتهائها
                    </p>
                  </div>
                  <Switch 
                    checked={autoRepostEnabled}
                    onCheckedChange={(checked) => enableAutoRepostMutation.mutate(checked)}
                    disabled={enableAutoRepostMutation.isPending}
                  />
                </div>

                {/* Auto Monthly Reports */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">التقارير الشهرية التلقائية</h3>
                    <p className="text-gray-600 text-sm">
                      إرسال تقرير PDF شهري بأداء العروض إلى بريدك الإلكتروني
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Smart Timing */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">التوقيت الذكي</h3>
                    <p className="text-gray-600 text-sm">
                      نشر العروض في الأوقات المثلى بناءً على تحليل البيانات
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Performance Preview */}
                {autoRepostEnabled && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">معاينة الأداء</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">+127%</div>
                        <div className="text-sm text-gray-600">زيادة المشاهدات</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">+89%</div>
                        <div className="text-sm text-gray-600">تفاعل أكثر</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">3.2x</div>
                        <div className="text-sm text-gray-600">عائد استثمار</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تحليلات الأداء المتقدمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>معدل التحويل الأسبوعي</span>
                      <span className="font-bold text-green-600">+12.4%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span>متوسط وقت المشاهدة</span>
                      <span className="font-bold">2:34 دقيقة</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span>نسبة العملاء العائدين</span>
                      <span className="font-bold text-blue-600">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>عرض الأسبوع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-trophy text-yellow-600 text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">خصم 30% على الوجبات</h3>
                    <div className="grid grid-cols-2 gap-4 text-center mt-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">1,250</div>
                        <div className="text-sm text-gray-600">مشاهدة</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">87</div>
                        <div className="text-sm text-gray-600">نقرة</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>اتجاهات الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">رسم بياني تفاعلي للاتجاهات</p>
                    <p className="text-sm text-gray-500">سيتم تطبيقه مع مكتبة الرسوم البيانية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geo Targeting Tab */}
          <TabsContent value="geo-targeting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-map-marker-alt text-red-600 ml-3"></i>
                  الاستهداف الجغرافي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">تفعيل الاستهداف الجغرافي</h3>
                    <p className="text-gray-600 text-sm">
                      اختر المدن التي تريد عرض عروضك فيها
                    </p>
                  </div>
                  <Switch 
                    checked={geoTargeting}
                    onCheckedChange={(checked) => setGeoTargeting(checked)}
                  />
                </div>

                {geoTargeting && (
                  <div className="space-y-4">
                    <Label>المدن المستهدفة</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "تبوك", "أبها", "الطائف"].map((city) => (
                        <label key={city} className="flex items-center space-x-reverse space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedCities.includes(city)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCities([...selectedCities, city]);
                              } else {
                                setSelectedCities(selectedCities.filter(c => c !== city));
                              }
                            }}
                            className="text-saudi-green"
                          />
                          <span className="text-sm">{city}</span>
                        </label>
                      ))}
                    </div>

                    <Button 
                      onClick={() => updateGeoTargetingMutation.mutate({ enabled: geoTargeting, cities: selectedCities })}
                      disabled={updateGeoTargetingMutation.isPending}
                      className="w-full bg-saudi-green hover:bg-green-700"
                    >
                      {updateGeoTargetingMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
                    </Button>
                  </div>
                )}

                {/* Targeting Preview */}
                {geoTargeting && selectedCities.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">معاينة الاستهداف</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      ستظهر عروضك في {selectedCities.length} مدن للجمهور المحتمل البالغ 2.3 مليون شخص
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCities.map((city) => (
                        <Badge key={city} variant="secondary" className="bg-blue-100 text-blue-800">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-calendar-alt text-purple-600 ml-3"></i>
                      تقويم الحملات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      locale={ar}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>الأحداث المجدولة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockCampaignEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-600">
                          {format(event.date, "dd MMMM", { locale: ar })}
                        </p>
                        <Badge 
                          variant={event.status === "active" ? "default" : "secondary"}
                          className="mt-2 text-xs"
                        >
                          {event.status === "scheduled" ? "مجدول" : 
                           event.status === "active" ? "نشط" : "مكتمل"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>المناسبات الوطنية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {saudiHolidays.map((holiday, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-sm text-green-800">{holiday.name}</h4>
                        <p className="text-xs text-green-600">
                          {format(holiday.date, "dd MMMM yyyy", { locale: ar })}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Generator Tab */}
          <TabsContent value="ai-generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-magic text-purple-600 ml-3"></i>
                  مولد العروض بالذكاء الاصطناعي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">نوع النشاط التجاري</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع النشاط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restaurant">مطعم</SelectItem>
                        <SelectItem value="retail">متجر تجزئة</SelectItem>
                        <SelectItem value="services">خدمات</SelectItem>
                        <SelectItem value="electronics">إلكترونيات</SelectItem>
                        <SelectItem value="fashion">أزياء</SelectItem>
                        <SelectItem value="health">صحة وجمال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="offerGoal">هدف العرض</Label>
                    <Select value={offerGoal} onValueChange={setOfferGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الهدف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase-sales">زيادة المبيعات</SelectItem>
                        <SelectItem value="clear-inventory">تصريف المخزون</SelectItem>
                        <SelectItem value="attract-customers">جذب عملاء جدد</SelectItem>
                        <SelectItem value="seasonal-promotion">عرض موسمي</SelectItem>
                        <SelectItem value="loyalty-program">برنامج ولاء</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={generateAIOffers}
                  disabled={generateOfferMutation.isPending || !businessType || !offerGoal}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {generateOfferMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin ml-2"></i>
                      جاري إنشاء العروض...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic ml-2"></i>
                      إنشاء عروض ذكية
                    </>
                  )}
                </Button>

                {generateOfferMutation.data && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">العروض المُنشأة</h3>
                    {generateOfferMutation.data.map((offer, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-purple-50">
                        <h4 className="font-semibold text-purple-800 mb-2">{offer.title}</h4>
                        <p className="text-gray-700 text-sm mb-3">{offer.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="font-bold text-purple-600">{offer.discount}</div>
                            <div className="text-xs text-gray-600">خصم</div>
                          </div>
                          <div>
                            <div className="font-bold text-orange-600">{offer.urgency}</div>
                            <div className="text-xs text-gray-600">مدة العرض</div>
                          </div>
                          <div>
                            <Button size="sm" variant="outline">
                              استخدام هذا العرض
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
        </Tabs>
      </main>
    </div>
  );
}