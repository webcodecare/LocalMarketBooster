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

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanWithFeatures | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [planForm, setPlanForm] = useState<Partial<InsertSubscriptionPlan>>({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: 0,
    currency: "SAR",
    billingPeriod: "monthly",
    offerLimit: 3,
    color: "#3B82F6",
    icon: "fas fa-box",
    isPopular: false,
    sortOrder: 0,
  });
  const [featureForm, setFeatureForm] = useState<Partial<InsertFeature>>({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    category: "general",
    icon: "fas fa-star",
    sortOrder: 0,
  });

  // Queries
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
        offerLimit: 3,
        color: "#3B82F6",
        icon: "fas fa-box",
        isPopular: false,
        sortOrder: 0,
      });
      toast({
        title: "تم إنشاء الباقة",
        description: "تم إنشاء الباقة الجديدة بنجاح",
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

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertSubscriptionPlan> }) => {
      const res = await apiRequest("PATCH", `/api/admin/subscription-plans/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      toast({
        title: "تم تحديث الباقة",
        description: "تم تحديث الباقة بنجاح",
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
        sortOrder: 0,
      });
      toast({
        title: "تم إنشاء الميزة",
        description: "تم إنشاء الميزة الجديدة بنجاح",
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

  const deleteFeatureMutation = useMutation({
    mutationFn: async (featureId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/features/${featureId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/features"] });
      toast({
        title: "تم حذف الميزة",
        description: "تم حذف الميزة بنجاح",
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
    return <div>غير مصرح لك بالدخول</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-none p-3 sm:p-6" dir="rtl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 px-2">إدارة باقات الاشتراك والميزات</h1>
        </div>

        <div className="w-full overflow-hidden">
          <Tabs defaultValue="plans" className="w-full">
            <div className="mb-4 sm:mb-6 overflow-x-auto px-2">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger value="plans" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">إدارة الباقات</TabsTrigger>
                <TabsTrigger value="features" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">إدارة الميزات</TabsTrigger>
                <TabsTrigger value="matrix" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">مصفوفة المقارنة</TabsTrigger>
              </TabsList>
            </div>

        {/* Plans Management Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>باقات الاشتراك</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <i className="fas fa-plus ml-2"></i>
                      إضافة باقة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إضافة باقة اشتراك جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الاسم (English)</Label>
                          <Input
                            value={planForm.name}
                            onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                            placeholder="Premium"
                          />
                        </div>
                        <div>
                          <Label>الاسم (العربية)</Label>
                          <Input
                            value={planForm.nameAr}
                            onChange={(e) => setPlanForm({...planForm, nameAr: e.target.value})}
                            placeholder="مميز"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الوصف (English)</Label>
                          <Textarea
                            value={planForm.description || ""}
                            onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                            placeholder="Advanced features for businesses"
                          />
                        </div>
                        <div>
                          <Label>الوصف (العربية)</Label>
                          <Textarea
                            value={planForm.descriptionAr || ""}
                            onChange={(e) => setPlanForm({...planForm, descriptionAr: e.target.value})}
                            placeholder="ميزات متقدمة للشركات"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>السعر (هللة)</Label>
                          <Input
                            type="number"
                            value={planForm.price}
                            onChange={(e) => setPlanForm({...planForm, price: Number(e.target.value)})}
                            placeholder="4900"
                          />
                        </div>
                        <div>
                          <Label>حد العروض</Label>
                          <Input
                            type="number"
                            value={planForm.offerLimit}
                            onChange={(e) => setPlanForm({...planForm, offerLimit: Number(e.target.value)})}
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <Label>ترتيب العرض</Label>
                          <Input
                            type="number"
                            value={planForm.sortOrder}
                            onChange={(e) => setPlanForm({...planForm, sortOrder: Number(e.target.value)})}
                            placeholder="1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
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
                            value={planForm.icon || ""}
                            onChange={(e) => setPlanForm({...planForm, icon: e.target.value})}
                            placeholder="fas fa-crown"
                          />
                        </div>
                        <div>
                          <Label>فترة الفوترة</Label>
                          <Select 
                            value={planForm.billingPeriod || "monthly"} 
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
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="relative min-w-[280px] sm:min-w-0 flex flex-col">
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs whitespace-nowrap">الأكثر شيوعاً</Badge>
                        </div>
                      )}
                    <CardHeader className="text-center" style={{ borderColor: plan.color }}>
                      <div className="flex items-center justify-center space-x-reverse space-x-2">
                        <i className={`${plan.icon} text-2xl`} style={{ color: plan.color }}></i>
                        <CardTitle>{plan.nameAr}</CardTitle>
                      </div>
                      <div className="text-3xl font-bold" style={{ color: plan.color }}>
                        {formatPrice(plan.price)}
                        <span className="text-lg font-normal text-gray-600">/{plan.billingPeriod === 'monthly' ? 'شهر' : 'سنة'}</span>
                      </div>
                      <p className="text-gray-600">{plan.descriptionAr}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span>حد العروض:</span>
                          <span className="font-semibold">{plan.offerLimit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>عدد الميزات:</span>
                          <span className="font-semibold">{plan.planFeatures.filter(pf => pf.isIncluded).length}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setSelectedPlan(plan)}
                            >
                              تعديل الباقة
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-4xl" dir="rtl">
                          <DialogHeader>
                            <DialogTitle>تعديل باقة {selectedPlan?.nameAr}</DialogTitle>
                          </DialogHeader>
                          {selectedPlan && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>السعر (هللة)</Label>
                                  <Input
                                    type="number"
                                    defaultValue={selectedPlan.price}
                                    onBlur={(e) => {
                                      if (Number(e.target.value) !== selectedPlan.price) {
                                        updatePlanMutation.mutate({
                                          id: selectedPlan.id,
                                          updates: { price: Number(e.target.value) }
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>حد العروض</Label>
                                  <Input
                                    type="number"
                                    defaultValue={selectedPlan.offerLimit}
                                    onBlur={(e) => {
                                      if (Number(e.target.value) !== selectedPlan.offerLimit) {
                                        updatePlanMutation.mutate({
                                          id: selectedPlan.id,
                                          updates: { offerLimit: Number(e.target.value) }
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-lg font-semibold">ميزات الباقة</Label>
                                <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                                  {features.map((feature) => {
                                    const isIncluded = getFeatureStatus(selectedPlan.id, feature.id);
                                    return (
                                      <div key={feature.id} className="flex items-center justify-between p-3 border rounded">
                                        <div className="flex items-center space-x-reverse space-x-3">
                                          <i className={`${feature.icon} text-lg`}></i>
                                          <div>
                                            <div className="font-medium">{feature.nameAr}</div>
                                            <div className="text-sm text-gray-600">{feature.descriptionAr}</div>
                                          </div>
                                        </div>
                                        <Switch
                                          checked={isIncluded}
                                          onCheckedChange={(checked) => 
                                            updatePlanFeatureMutation.mutate({
                                              planId: selectedPlan.id,
                                              featureId: feature.id,
                                              isIncluded: checked
                                            })
                                          }
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <i className="fas fa-trash ml-1"></i>
                            حذف
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
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Management Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة الميزات</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <i className="fas fa-plus ml-2"></i>
                      إضافة ميزة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إضافة ميزة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الاسم (English)</Label>
                          <Input
                            value={featureForm.name}
                            onChange={(e) => setFeatureForm({...featureForm, name: e.target.value})}
                            placeholder="Advanced Analytics"
                          />
                        </div>
                        <div>
                          <Label>الاسم (العربية)</Label>
                          <Input
                            value={featureForm.nameAr}
                            onChange={(e) => setFeatureForm({...featureForm, nameAr: e.target.value})}
                            placeholder="التحليلات المتقدمة"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الوصف (English)</Label>
                          <Textarea
                            value={featureForm.description}
                            onChange={(e) => setFeatureForm({...featureForm, description: e.target.value})}
                            placeholder="Detailed analytics and insights"
                          />
                        </div>
                        <div>
                          <Label>الوصف (العربية)</Label>
                          <Textarea
                            value={featureForm.descriptionAr}
                            onChange={(e) => setFeatureForm({...featureForm, descriptionAr: e.target.value})}
                            placeholder="تحليلات ورؤى مفصلة"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>الفئة</Label>
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
                        <div>
                          <Label>ترتيب العرض</Label>
                          <Input
                            type="number"
                            value={featureForm.sortOrder}
                            onChange={(e) => setFeatureForm({...featureForm, sortOrder: Number(e.target.value)})}
                            placeholder="1"
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الميزة</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الترتيب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature) => {
                    const category = getCategoryBadge(feature.category);
                    return (
                      <TableRow key={feature.id}>
                        <TableCell>
                          <div className="flex items-center space-x-reverse space-x-3">
                            <i className={`${feature.icon} text-lg`}></i>
                            <div>
                              <div className="font-medium">{feature.nameAr}</div>
                              <div className="text-sm text-gray-500">{feature.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={category.color}>{category.text}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{feature.descriptionAr}</div>
                        </TableCell>
                        <TableCell>{feature.sortOrder}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Matrix Tab */}
        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مصفوفة مقارنة الباقات والميزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-80">الميزة</TableHead>
                      {plans.map((plan) => (
                        <TableHead key={plan.id} className="text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <i className={`${plan.icon} text-lg`} style={{ color: plan.color }}></i>
                            <span>{plan.nameAr}</span>
                            <span className="text-sm font-normal">{formatPrice(plan.price)}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {features.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell>
                          <div className="flex items-center space-x-reverse space-x-3">
                            <i className={`${feature.icon} text-lg`}></i>
                            <div>
                              <div className="font-medium">{feature.nameAr}</div>
                              <div className="text-sm text-gray-600">{feature.descriptionAr}</div>
                            </div>
                          </div>
                        </TableCell>
                        {plans.map((plan) => {
                          const isIncluded = getFeatureStatus(plan.id, feature.id);
                          return (
                            <TableCell key={plan.id} className="text-center">
                              {isIncluded ? (
                                <i className="fas fa-check text-green-600 text-xl"></i>
                              ) : (
                                <i className="fas fa-times text-red-400 text-xl"></i>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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