import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  BarChart3, 
  Target, 
  Users, 
  Eye,
  Save,
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface TrackingSettings {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  snapPixelId?: string;
  trackingEnabled: boolean;
}

export default function TrackingSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TrackingSettings>({
    googleAnalyticsId: '',
    googleTagManagerId: '',
    googleAdsConversionId: '',
    googleAdsConversionLabel: '',
    metaPixelId: '',
    tiktokPixelId: '',
    snapPixelId: '',
    trackingEnabled: true
  });

  const { data: currentSettings, isLoading } = useQuery<TrackingSettings>({
    queryKey: ['/api/admin/tracking-settings']
  });

  // Update settings when data is loaded
  React.useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: TrackingSettings) => {
      const response = await apiRequest('PUT', '/api/admin/tracking-settings', updatedSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tracking-settings'] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات التتبع بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleInputChange = (field: keyof TrackingSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trackingPixels = [
    {
      id: 'ga4',
      name: 'Google Analytics 4',
      description: 'تحليلات شاملة لموقعك الإلكتروني',
      icon: BarChart3,
      enabled: !!settings.googleAnalyticsId,
      status: settings.googleAnalyticsId ? 'active' : 'inactive'
    },
    {
      id: 'gtm',
      name: 'Google Tag Manager',
      description: 'إدارة جميع العلامات من مكان واحد',
      icon: Settings,
      enabled: !!settings.googleTagManagerId,
      status: settings.googleTagManagerId ? 'active' : 'inactive'
    },
    {
      id: 'gads',
      name: 'Google Ads',
      description: 'تتبع التحويلات من إعلانات جوجل',
      icon: Target,
      enabled: !!settings.googleAdsConversionId,
      status: settings.googleAdsConversionId ? 'active' : 'inactive'
    },
    {
      id: 'meta',
      name: 'Meta Pixel (Facebook)',
      description: 'تتبع التحويلات من فيسبوك وانستجرام',
      icon: Users,
      enabled: !!settings.metaPixelId,
      status: settings.metaPixelId ? 'active' : 'inactive'
    },
    {
      id: 'tiktok',
      name: 'TikTok Pixel',
      description: 'تتبع التحويلات من إعلانات تيك توك',
      icon: Eye,
      enabled: !!settings.tiktokPixelId,
      status: settings.tiktokPixelId ? 'active' : 'inactive'
    },
    {
      id: 'snap',
      name: 'Snap Pixel',
      description: 'تتبع التحويلات من إعلانات سناب شات',
      icon: Info,
      enabled: !!settings.snapPixelId,
      status: settings.snapPixelId ? 'active' : 'inactive'
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات التتبع والتحليلات</h1>
          <p className="text-gray-600">إدارة أدوات التتبع الخارجية لتحليل الأداء التسويقي</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.trackingEnabled}
            onCheckedChange={(checked) => handleInputChange('trackingEnabled', checked)}
          />
          <Label>تفعيل التتبع</Label>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trackingPixels.map((pixel) => (
          <Card key={pixel.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${pixel.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <pixel.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{pixel.name}</p>
                    <p className="text-xs text-gray-500">{pixel.description}</p>
                  </div>
                </div>
                <Badge variant={pixel.enabled ? "default" : "secondary"}>
                  {pixel.enabled ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="ga4" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ga4">Google Analytics</TabsTrigger>
          <TabsTrigger value="gtm">Tag Manager</TabsTrigger>
          <TabsTrigger value="gads">Google Ads</TabsTrigger>
          <TabsTrigger value="meta">Meta Pixel</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok & Snap</TabsTrigger>
        </TabsList>

        {/* Google Analytics 4 */}
        <TabsContent value="ga4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Google Analytics 4
              </CardTitle>
              <CardDescription>
                تحليلات شاملة لموقعك تتضمن بيانات الزوار، مصادر الزيارات، والتحويلات.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ga4-id">معرف Google Analytics 4</Label>
                <Input
                  id="ga4-id"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  معرف يبدأ بـ G- تجده في إعدادات Google Analytics
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">كيفية الحصول على معرف GA4:</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>1. اذهب إلى analytics.google.com</li>
                      <li>2. أنشئ حساب جديد أو ادخل لحسابك الحالي</li>
                      <li>3. أنشئ خاصية GA4 جديدة</li>
                      <li>4. انسخ معرف القياس (G-XXXXXXXXXX)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Tag Manager */}
        <TabsContent value="gtm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Google Tag Manager
              </CardTitle>
              <CardDescription>
                إدارة جميع علامات التتبع من مكان واحد. GTM يسمح لك بإدارة Google Analytics، Facebook Pixel، وغيرها من الأدوات.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gtm-id">معرف حاوي GTM</Label>
                <Input
                  id="gtm-id"
                  placeholder="GTM-XXXXXXX"
                  value={settings.googleTagManagerId || ''}
                  onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  تجده في إعدادات حسابك في Google Tag Manager
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">كيفية الحصول على معرف GTM:</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>1. اذهب إلى tagmanager.google.com</li>
                      <li>2. أنشئ حساب جديد أو ادخل لحسابك الحالي</li>
                      <li>3. أنشئ حاوي جديد للموقع</li>
                      <li>4. انسخ معرف الحاوي (GTM-XXXXXXX)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Ads */}
        <TabsContent value="gads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Google Ads Conversion Tracking
              </CardTitle>
              <CardDescription>
                تتبع التحويلات من إعلانات Google Ads لقياس فعالية الحملات الإعلانية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gads-id">معرف تحويل Google Ads</Label>
                <Input
                  id="gads-id"
                  placeholder="AW-XXXXXXXXX"
                  value={settings.googleAdsConversionId || ''}
                  onChange={(e) => handleInputChange('googleAdsConversionId', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gads-label">تسمية التحويل (اختياري)</Label>
                <Input
                  id="gads-label"
                  placeholder="conversion_label"
                  value={settings.googleAdsConversionLabel || ''}
                  onChange={(e) => handleInputChange('googleAdsConversionLabel', e.target.value)}
                />
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">الأحداث المتتبعة:</h4>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• تسجيل حساب جديد</li>
                      <li>• إرسال عرض جديد</li>
                      <li>• النقر على أزرار التواصل</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Pixel */}
        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Meta Pixel (Facebook Pixel)
              </CardTitle>
              <CardDescription>
                تتبع التحويلات من إعلانات Facebook و Instagram لتحسين الاستهداف والأداء.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-id">معرف Meta Pixel</Label>
                <Input
                  id="meta-id"
                  placeholder="1234567890123456"
                  value={settings.metaPixelId || ''}
                  onChange={(e) => handleInputChange('metaPixelId', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  معرف رقمي من 15-16 رقم تجده في Events Manager
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">كيفية الحصول على معرف Meta Pixel:</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>1. اذهب إلى business.facebook.com</li>
                      <li>2. اختر "Events Manager"</li>
                      <li>3. أنشئ pixel جديد أو اختر الموجود</li>
                      <li>4. انسخ معرف الـ Pixel</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TikTok & Snap Pixels */}
        <TabsContent value="tiktok">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  TikTok Pixel
                </CardTitle>
                <CardDescription>
                  تتبع التحويلات من إعلانات TikTok لقياس أداء الحملات على المنصة.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tiktok-id">معرف TikTok Pixel</Label>
                  <Input
                    id="tiktok-id"
                    placeholder="C4XXXXXXXXXXXXXXXXXX"
                    value={settings.tiktokPixelId || ''}
                    onChange={(e) => handleInputChange('tiktokPixelId', e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    معرف يبدأ بـ C4 تجده في TikTok Ads Manager
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Snap Pixel
                </CardTitle>
                <CardDescription>
                  تتبع التحويلات من إعلانات Snapchat لقياس فعالية الحملات.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="snap-id">معرف Snap Pixel</Label>
                  <Input
                    id="snap-id"
                    placeholder="snap-pixel-id"
                    value={settings.snapPixelId || ''}
                    onChange={(e) => handleInputChange('snapPixelId', e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    معرف بكسل سناب شات للتتبع والتحليل
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={updateSettingsMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </div>
    </div>
  );
}