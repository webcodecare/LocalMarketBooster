import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { ArrowRight } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      businessDescription: "",
      businessCategory: "",
      businessCity: "",
      businessPhone: "",
      businessWebsite: "",
      businessWhatsapp: "",
      role: "business",
    },
  });

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
    });
  };

  const onRegister = (data: RegisterData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
    });
  };

  const cities = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران",
    "الطائف", "بريدة", "تبوك", "خميس مشيط", "الهفوف", "المبرز", "حائل", "نجران",
    "الجبيل", "ينبع", "القطيف", "عرعر", "سكاكا", "جازان", "أبها", "القنفذة"
  ];

  const categories = [
    "المطاعم", "السفر والسياحة", "المقاهي", "العيادات والتجميل", 
    "المتاجر الإلكترونية", "الدورات والتعليم", "الإلكترونيات", "الأزياء والموضة",
    "السيارات", "العقارات", "الخدمات المنزلية", "الرياضة واللياقة"
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header for Auth Page Only */}
      <header className="bg-white shadow-lg border-b-2 border-saudi-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => setLocation("/")}>
              <h1 className="text-3xl font-bold text-saudi-green">لقطها 🇸🇦</h1>
              <p className="text-sm text-gray-600 font-medium">أفضل العروض والخصومات في المملكة</p>
            </div>
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center text-gray-600 hover:text-saudi-green font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 h-14 p-2 bg-gray-100 rounded-2xl">
                <TabsTrigger value="login" className="rounded-xl font-bold text-lg data-[state=active]:bg-white data-[state=active]:text-saudi-green data-[state=active]:shadow-md">
                  تسجيل الدخول
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-bold text-lg data-[state=active]:bg-white data-[state=active]:text-saudi-green data-[state=active]:shadow-md">
                  إنشاء حساب
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">تسجيل الدخول</CardTitle>
                  <CardDescription className="text-center">
                    ادخل بياناتك للوصول إلى لوحة التحكم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ادخل اسم المستخدم" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" placeholder="ادخل كلمة المرور" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-saudi-green hover:bg-green-800"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">إنشاء حساب تاجر</CardTitle>
                  <CardDescription className="text-center">
                    أنشئ حسابك وابدأ في عرض منتجاتك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم المستخدم</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="اسم المستخدم" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>البريد الإلكتروني</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="البريد الإلكتروني" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="كلمة المرور" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأكيد كلمة المرور</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="تأكيد كلمة المرور" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المتجر أو الشركة</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="اسم المتجر أو الشركة" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="businessDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف النشاط التجاري</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ""} placeholder="وصف مختصر عن نشاطك التجاري" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="businessCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>فئة النشاط</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر فئة النشاط" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="businessCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المدينة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر المدينة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="businessPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الهاتف</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="05xxxxxxxx" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="businessWhatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الواتساب</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} placeholder="966xxxxxxxxx" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="businessWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الموقع الإلكتروني (اختياري)</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Social Media Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">حسابات التواصل الاجتماعي (اختياري)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="businessInstagram"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="@username" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="businessFacebook"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Facebook</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="صفحة الفيسبوك" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="businessSnapchat"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Snapchat</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="@username" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="businessX"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>X (Twitter)</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="@username" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="businessTiktok"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>TikTok</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="@username" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-saudi-green hover:bg-green-800"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </div>

        {/* Right Side - Hero */}
        <div className="hidden lg:block lg:flex-1 bg-gradient-to-br from-saudi-green to-green-700">
          <div className="flex flex-col justify-center items-center h-full p-12 text-white text-center">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold mb-6">انضم إلى منصة لقطها</h2>
              <p className="text-xl mb-8 text-green-100">
                وصل إلى آلاف العملاء المحتملين واعرض منتجاتك وخدماتك بأفضل الطرق
              </p>
              <div className="grid grid-cols-1 gap-6 text-right">
                <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="font-semibold mb-1">زيادة في المبيعات</h4>
                  <p className="text-green-100 text-sm">وصل إلى عملاء جدد وزد من مبيعاتك</p>
                </div>
                <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold mb-1">استهداف دقيق</h4>
                  <p className="text-green-100 text-sm">استهدف العملاء في منطقتك ومجالك</p>
                </div>
                <div className="bg-white bg-opacity-10 p-4 rounded-xl">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold mb-1">تقارير مفصلة</h4>
                  <p className="text-green-100 text-sm">احصل على إحصائيات مفصلة عن عروضك</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
