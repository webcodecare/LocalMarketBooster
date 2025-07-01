import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionPlanWithFeatures, Feature, InsertSubscriptionPlan, InsertFeature } from "@shared/schema";

export default function SubscriptionManagementMobile() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Form states
  const [planForm, setPlanForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: 0,
    currency: "SAR",
    billingPeriod: "monthly",
    offerLimit: 5,
    isActive: true,
    isPopular: false,
    sortOrder: 0,
    color: "#3B82F6",
    icon: "fas fa-box"
  });

  const [featureForm, setFeatureForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    category: "general",
    icon: "fas fa-star",
    isActive: true,
    sortOrder: 0
  });

  // Fetch data
  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlanWithFeatures[]>({
    queryKey: ["/api/admin/subscription-plans"],
  });

  const { data: features = [], isLoading: featuresLoading } = useQuery<Feature[]>({
    queryKey: ["/api/admin/features"],
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: async (plan: InsertSubscriptionPlan) => {
      const res = await apiRequest("POST", "/api/admin/subscription-plans", plan);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setPlanForm({
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        price: 0,
        currency: "SAR",
        billingPeriod: "monthly",
        offerLimit: 5,
        isActive: true,
        isPopular: false,
        sortOrder: 0,
        color: "#3B82F6",
        icon: "fas fa-box"
      });
      toast({
        title: "تم إنشاء الباقة",
        description: "تم إنشاء الباقة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createFeatureMutation = useMutation({
    mutationFn: async (feature: InsertFeature) => {
      const res = await apiRequest("POST", "/api/admin/features", feature);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      setFeatureForm({
        name: "",
        nameAr: "",
        description: "",
        descriptionAr: "",
        category: "general",
        icon: "fas fa-star",
        isActive: true,
        sortOrder: 0
      });
      toast({
        title: "تم إنشاء الميزة",
        description: "تم إنشاء الميزة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlanFeatureMutation = useMutation({
    mutationFn: async ({ planId, featureId, isIncluded }: { planId: number; featureId: number; isIncluded: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/plan-features/${planId}/${featureId}`, { isIncluded });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      toast({
        title: "تم تحديث الميزة",
        description: "تم تحديث ميزة الباقة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/subscription-plans/${planId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      toast({
        title: "تم حذف الباقة",
        description: "تم حذف الباقة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "general": return { text: "عام", color: "bg-gray-100 text-gray-800" };
      case "analytics": return { text: "تحليلات", color: "bg-blue-100 text-blue-800" };
      case "automation": return { text: "أتمتة", color: "bg-green-100 text-green-800" };
      case "support": return { text: "دعم", color: "bg-purple-100 text-purple-800" };
      default: return { text: category, color: "bg-gray-100 text-gray-800" };
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(0)} ريال`;
  };

  const getFeatureStatus = (planId: number, featureId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return false;
    const planFeature = plan.planFeatures.find(pf => pf.featureId === featureId);
    return planFeature?.isIncluded || false;
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">غير مصرح لك بالدخول</h2>
          <p className="text-gray-600">يجب أن تكون مدير لمشاهدة هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full" dir="rtl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            إدارة باقات الاشتراك والميزات
          </h1>
        </div>

        {/* Content */}
        <div className="px-4 py-4 sm:px-6">
          <Tabs defaultValue="plans" className="w-full">
            {/* Tabs Navigation */}
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger 
                  value="plans" 
                  className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  الباقات
                </TabsTrigger>
                <TabsTrigger 
                  value="features" 
                  className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  الميزات
                </TabsTrigger>
                <TabsTrigger 
                  value="matrix" 
                  className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  المقارنة
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-base sm:text-lg">الباقات الحالية</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto text-sm">
                          <i className="fas fa-plus ml-2"></i>
                          إضافة باقة جديدة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                        <DialogHeader>
                          <DialogTitle>إضافة باقة اشتراك جديدة</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] pr-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>الاسم بالإنجليزية</Label>
                                <Input
                                  value={planForm.name}
                                  onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                                  placeholder="Basic Plan"
                                />
                              </div>
                              <div>
                                <Label>الاسم بالعربية</Label>
                                <Input
                                  value={planForm.nameAr}
                                  onChange={(e) => setPlanForm({...planForm, nameAr: e.target.value})}
                                  placeholder="الباقة الأساسية"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label>الوصف بالعربية</Label>
                              <Textarea
                                value={planForm.descriptionAr}
                                onChange={(e) => setPlanForm({...planForm, descriptionAr: e.target.value})}
                                placeholder="وصف الباقة..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>السعر (بالهللة)</Label>
                                <Input
                                  type="number"
                                  value={planForm.price}
                                  onChange={(e) => setPlanForm({...planForm, price: parseInt(e.target.value) || 0})}
                                  placeholder="4900"
                                />
                              </div>
                              <div>
                                <Label>حد العروض</Label>
                                <Input
                                  type="number"
                                  value={planForm.offerLimit}
                                  onChange={(e) => setPlanForm({...planForm, offerLimit: parseInt(e.target.value) || 5})}
                                  placeholder="10"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>اللون</Label>
                                <Input
                                  type="color"
                                  value={planForm.color}
                                  onChange={(e) => setPlanForm({...planForm, color: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label>الأيقونة</Label>
                                <Input
                                  value={planForm.icon}
                                  onChange={(e) => setPlanForm({...planForm, icon: e.target.value})}
                                  placeholder="fas fa-crown"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label>فترة الفوترة</Label>
                              <Select 
                                value={planForm.billingPeriod} 
                                onValueChange={(value) => setPlanForm({...planForm, billingPeriod: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">شهري</SelectItem>
                                  <SelectItem value="yearly">سنوي</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center space-x-reverse space-x-2">
                              <Switch
                                checked={planForm.isPopular}
                                onCheckedChange={(checked) => setPlanForm({...planForm, isPopular: checked})}
                              />
                              <Label>باقة شائعة</Label>
                            </div>
                            
                            <Button 
                              onClick={() => createPlanMutation.mutate(planForm as InsertSubscriptionPlan)}
                              disabled={!planForm.name || !planForm.nameAr || createPlanMutation.isPending}
                              className="w-full"
                            >
                              إنشاء الباقة
                            </Button>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <Card key={plan.id} className="relative border-l-4" style={{ borderLeftColor: plan.color || "#3B82F6" }}>
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <i className={plan.icon || "fas fa-box"} style={{ color: plan.color || "#3B82F6" }}></i>
                              <div>
                                <h3 className="font-semibold text-base">{plan.nameAr}</h3>
                                <p className="text-sm text-gray-600">{plan.name}</p>
                              </div>
                            </div>
                            {plan.isPopular && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <i className="fas fa-star mr-1"></i>
                                شائع
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold" style={{ color: plan.color || "#3B82F6" }}>
                                {formatPrice(plan.price)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {plan.billingPeriod === "monthly" ? "شهريا" : "سنويا"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{plan.offerLimit}</div>
                              <div className="text-xs text-gray-500">حد العروض</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">
                                {plan.planFeatures.filter(pf => pf.isIncluded).length}
                              </div>
                              <div className="text-xs text-gray-500">الميزات</div>
                            </div>
                            <div className="text-center">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="text-xs">
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent dir="rtl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد حذف الباقة</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف باقة "{plan.nameAr}"؟ هذا الإجراء لا يمكن التراجع عنه.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deletePlanMutation.mutate(plan.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      حذف الباقة
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-base sm:text-lg">إدارة الميزات</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto text-sm">
                          <i className="fas fa-plus ml-2"></i>
                          إضافة ميزة جديدة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-2xl" dir="rtl">
                        <DialogHeader>
                          <DialogTitle>إضافة ميزة جديدة</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>الاسم بالإنجليزية</Label>
                              <Input
                                value={featureForm.name}
                                onChange={(e) => setFeatureForm({...featureForm, name: e.target.value})}
                                placeholder="Advanced Analytics"
                              />
                            </div>
                            <div>
                              <Label>الاسم بالعربية</Label>
                              <Input
                                value={featureForm.nameAr}
                                onChange={(e) => setFeatureForm({...featureForm, nameAr: e.target.value})}
                                placeholder="التحليلات المتقدمة"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>الوصف بالعربية</Label>
                            <Textarea
                              value={featureForm.descriptionAr}
                              onChange={(e) => setFeatureForm({...featureForm, descriptionAr: e.target.value})}
                              placeholder="وصف الميزة..."
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>التصنيف</Label>
                              <Select 
                                value={featureForm.category} 
                                onValueChange={(value) => setFeatureForm({...featureForm, category: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">عام</SelectItem>
                                  <SelectItem value="analytics">تحليلات</SelectItem>
                                  <SelectItem value="automation">أتمتة</SelectItem>
                                  <SelectItem value="support">دعم</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>الأيقونة</Label>
                              <Input
                                value={featureForm.icon}
                                onChange={(e) => setFeatureForm({...featureForm, icon: e.target.value})}
                                placeholder="fas fa-chart-line"
                              />
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => createFeatureMutation.mutate(featureForm as InsertFeature)}
                            disabled={!featureForm.name || !featureForm.nameAr || createFeatureMutation.isPending}
                            className="w-full"
                          >
                            إنشاء الميزة
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.map((feature) => {
                      const categoryBadge = getCategoryBadge(feature.category);
                      return (
                        <Card key={feature.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <i className={`${feature.icon || "fas fa-star"} text-blue-600`}></i>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-sm truncate">{feature.nameAr}</h4>
                                <p className="text-xs text-gray-500 truncate">{feature.name}</p>
                              </div>
                            </div>
                            <Badge className={`${categoryBadge.color} text-xs whitespace-nowrap ml-2`}>
                              {categoryBadge.text}
                            </Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comparison Matrix Tab */}
            <TabsContent value="matrix" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">مصفوفة مقارنة الباقات والميزات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 px-4">
                    <div className="min-w-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px] sticky left-0 bg-white z-10 border-r text-xs sm:text-sm">
                              الميزة
                            </TableHead>
                            {plans.map((plan) => (
                              <TableHead key={plan.id} className="text-center min-w-[100px] text-xs sm:text-sm">
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold">{plan.nameAr}</span>
                                  <span className="text-xs text-gray-500">{formatPrice(plan.price)}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {features.map((feature) => (
                            <TableRow key={feature.id}>
                              <TableCell className="sticky left-0 bg-white z-10 border-r">
                                <div className="flex items-center gap-2">
                                  <i className={`${feature.icon || "fas fa-star"} text-blue-600 text-xs`}></i>
                                  <span className="text-xs sm:text-sm font-medium">{feature.nameAr}</span>
                                </div>
                              </TableCell>
                              {plans.map((plan) => (
                                <TableCell key={plan.id} className="text-center">
                                  <Switch
                                    checked={getFeatureStatus(plan.id, feature.id)}
                                    onCheckedChange={(checked) => 
                                      updatePlanFeatureMutation.mutate({
                                        planId: plan.id,
                                        featureId: feature.id,
                                        isIncluded: checked
                                      })
                                    }
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}