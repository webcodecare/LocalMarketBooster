import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Settings, Globe, Mail, Lock, Database } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  siteName: z.string().min(1, "اسم الموقع مطلوب"),
  siteNameAr: z.string().min(1, "اسم الموقع بالعربية مطلوب"),
  siteDescription: z.string().optional(),
  siteDescriptionAr: z.string().optional(),
  contactEmail: z.string().email("بريد إلكتروني صحيح مطلوب"),
  contactPhone: z.string().min(1, "رقم الهاتف مطلوب"),
  whatsappNumber: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  maintenanceMode: z.boolean().default(false),
  allowRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(false),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SettingsFormData>) => {
      const response = await apiRequest("PUT", "/api/site-settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "",
      siteNameAr: "",
      siteDescription: "",
      siteDescriptionAr: "",
      contactEmail: "",
      contactPhone: "",
      whatsappNumber: "",
      facebookUrl: "",
      twitterUrl: "",
      instagramUrl: "",
      linkedinUrl: "",
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false,
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName || "",
        siteNameAr: settings.siteNameAr || "",
        siteDescription: settings.siteDescription || "",
        siteDescriptionAr: settings.siteDescriptionAr || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        whatsappNumber: settings.whatsappNumber || "",
        facebookUrl: settings.facebookUrl || "",
        twitterUrl: settings.twitterUrl || "",
        instagramUrl: settings.instagramUrl || "",
        linkedinUrl: settings.linkedinUrl || "",
        maintenanceMode: settings.maintenanceMode || false,
        allowRegistration: settings.allowRegistration !== false,
        requireEmailVerification: settings.requireEmailVerification || false,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">جارٍ التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">إعدادات النظام</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                عام
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                التواصل
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                وسائل التواصل
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                الأمان
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الموقع الأساسية</CardTitle>
                  <CardDescription>
                    قم بتحديث المعلومات الأساسية للموقع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الموقع (إنجليزي)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Baraq Platform" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="siteNameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الموقع (عربي)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="منصة براق" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف الموقع (إنجليزي)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Business promotion platform..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="siteDescriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف الموقع (عربي)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="منصة ترويج الأعمال..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات التواصل</CardTitle>
                  <CardDescription>
                    حدث معلومات التواصل الخاصة بالموقع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="info@baraq.sa" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+966501234567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الواتساب</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+966501234567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
                  <CardDescription>
                    أضف روابط حسابات التواصل الاجتماعي
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>فيسبوك</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://facebook.com/baraq" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitterUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تويتر</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://twitter.com/baraq" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="instagramUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>إنستغرام</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://instagram.com/baraq" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>لينكد إن</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://linkedin.com/company/baraq" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الأمان والنظام</CardTitle>
                  <CardDescription>
                    قم بضبط إعدادات الأمان والنظام
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>وضع الصيانة</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        تفعيل وضع الصيانة لإخفاء الموقع مؤقتاً
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>السماح بالتسجيل</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        السماح للمستخدمين الجدد بالتسجيل
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="allowRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>تأكيد البريد الإلكتروني</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        طلب تأكيد البريد الإلكتروني عند التسجيل
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="requireEmailVerification"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}