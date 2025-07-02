import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CreditCard, Shield, AlertTriangle, CheckCircle, Settings, DollarSign, Globe, Eye, EyeOff } from 'lucide-react';
import type { PaymentSettings } from '@shared/schema';

const paymentSettingsSchema = z.object({
  moyasarEnabled: z.boolean().default(false),
  moyasarPublishableKey: z.string().optional(),
  moyasarSecretKey: z.string().optional(),
  moyasarWebhookSecret: z.string().optional(),
  testMode: z.boolean().default(true),
  supportedCurrencies: z.array(z.string()).default(['SAR']),
  minimumAmount: z.number().min(0.01, 'يجب أن يكون الحد الأدنى أكبر من 0').default(1),
  maximumAmount: z.number().min(1, 'يجب أن يكون الحد الأقصى أكبر من 0').default(50000),
});

type PaymentSettingsForm = z.infer<typeof paymentSettingsSchema>;

interface PaymentStatus {
  isConnected: boolean;
  lastChecked: string;
  errorMessage?: string;
}

export default function PaymentSettingsManagement() {
  const { toast } = useToast();
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const { data: settings, isLoading } = useQuery<PaymentSettings>({
    queryKey: ['/api/admin/payment-settings'],
  });

  const form = useForm<PaymentSettingsForm>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      moyasarEnabled: false,
      moyasarPublishableKey: '',
      moyasarSecretKey: '',
      moyasarWebhookSecret: '',
      testMode: true,
      supportedCurrencies: ['SAR'],
      minimumAmount: 1,
      maximumAmount: 50000,
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        moyasarEnabled: settings.moyasarEnabled,
        moyasarPublishableKey: settings.moyasarPublishableKey || '',
        moyasarSecretKey: settings.moyasarSecretKey || '',
        moyasarWebhookSecret: settings.moyasarWebhookSecret || '',
        testMode: settings.testMode,
        supportedCurrencies: settings.supportedCurrencies || ['SAR'],
        minimumAmount: Number(settings.minimumAmount),
        maximumAmount: Number(settings.maximumAmount),
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: PaymentSettingsForm) => {
      const response = await apiRequest('PUT', '/api/admin/payment-settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-settings'] });
      toast({
        title: 'تم الحفظ بنجاح',
        description: 'تم تحديث إعدادات الدفع بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message || 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/payment-settings/test-connection');
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'اتصال ناجح',
          description: 'تم الاتصال مع Moyasar بنجاح',
        });
      } else {
        toast({
          title: 'فشل الاتصال',
          description: result.error || 'فشل في الاتصال مع Moyasar',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الاتصال',
        description: error.message || 'حدث خطأ أثناء اختبار الاتصال',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PaymentSettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  const testConnection = () => {
    setTestingConnection(true);
    testConnectionMutation.mutate();
    setTimeout(() => setTestingConnection(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isConnected = settings?.moyasarEnabled && settings?.moyasarSecretKey;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات الدفع</h1>
          <p className="text-gray-600">إدارة بوابات الدفع والإعدادات المالية</p>
        </div>
        <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-2">
          {isConnected ? (
            <>
              <CheckCircle className="w-4 h-4" />
              متصل
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              غير متصل
            </>
          )}
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">حالة Moyasar</p>
                <p className="text-2xl font-bold">
                  {settings?.moyasarEnabled ? 'مفعل' : 'معطل'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CreditCard className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">البيئة</p>
                <p className="text-2xl font-bold">
                  {settings?.testMode ? 'اختبار' : 'إنتاج'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${settings?.testMode ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <Shield className={`w-6 h-6 ${settings?.testMode ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">العملات المدعومة</p>
                <p className="text-2xl font-bold">{settings?.supportedCurrencies?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="moyasar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moyasar">إعدادات Moyasar</TabsTrigger>
          <TabsTrigger value="limits">حدود المبالغ</TabsTrigger>
          <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Moyasar Settings */}
            <TabsContent value="moyasar">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    إعدادات Moyasar
                  </CardTitle>
                  <CardDescription>
                    تكوين بوابة الدفع Moyasar للمعاملات المالية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="moyasarEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">تفعيل Moyasar</FormLabel>
                          <FormDescription>
                            تفعيل أو إلغاء تفعيل بوابة الدفع Moyasar
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">وضع الاختبار</FormLabel>
                          <FormDescription>
                            استخدام بيئة الاختبار لـ Moyasar (موصى به للتطوير)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moyasarPublishableKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moyasar Publishable Key</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="pk_test_..." 
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>
                          المفتاح العام لـ Moyasar (يبدأ بـ pk_test_ أو pk_live_)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moyasarSecretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moyasar Secret Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showSecretKey ? 'text' : 'password'}
                              placeholder="sk_test_..." 
                              className="font-mono pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowSecretKey(!showSecretKey)}
                            >
                              {showSecretKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          المفتاح السري لـ Moyasar (يبدأ بـ sk_test_ أو sk_live_)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moyasarWebhookSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moyasar Webhook Secret</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showWebhookSecret ? 'text' : 'password'}
                              placeholder="whsec_..." 
                              className="font-mono pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                            >
                              {showWebhookSecret ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          مفتاح التحقق من Webhooks لـ Moyasar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testConnection}
                      disabled={testingConnection || !form.watch('moyasarSecretKey')}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      {testingConnection ? 'جاري الاختبار...' : 'اختبار الاتصال'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Amount Limits */}
            <TabsContent value="limits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    حدود المبالغ
                  </CardTitle>
                  <CardDescription>
                    تحديد الحد الأدنى والأقصى للمعاملات المالية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minimumAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأدنى للمبلغ (ر.س)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            أقل مبلغ يمكن قبوله في المعاملة
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maximumAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأقصى للمبلغ (ر.س)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            أكبر مبلغ يمكن قبوله في المعاملة
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">ملاحظات مهمة:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• تأكد من أن الحد الأدنى لا يقل عن 1 ريال سعودي</li>
                      <li>• الحد الأقصى يجب أن يتوافق مع سياسات Moyasar</li>
                      <li>• تطبق هذه الحدود على جميع المعاملات</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    إعدادات متقدمة
                  </CardTitle>
                  <CardDescription>
                    إعدادات إضافية للدفع والعملات
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="supportedCurrencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العملات المدعومة</FormLabel>
                        <FormDescription>
                          اختر العملات التي تقبلها في المدفوعات
                        </FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {['SAR', 'USD', 'EUR', 'AED'].map((currency) => (
                            <div key={currency} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={currency}
                                checked={field.value.includes(currency)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, currency]);
                                  } else {
                                    field.onChange(field.value.filter((c) => c !== currency));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={currency} className="text-sm">
                                {currency}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">تحذير:</h4>
                    <p className="text-sm text-yellow-800">
                      تأكد من أن حساب Moyasar الخاص بك يدعم العملات المختارة قبل تفعيلها.
                      بعض العملات قد تتطلب موافقة إضافية من Moyasar.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateSettingsMutation.isPending}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {updateSettingsMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}