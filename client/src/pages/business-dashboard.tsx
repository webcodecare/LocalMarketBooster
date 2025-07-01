import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import OfferForm from "@/components/offers/offer-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import type { OfferWithRelations } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import BranchManagement from "@/components/business/branch-management";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [editingOffer, setEditingOffer] = useState<OfferWithRelations | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  
  // Feature access control
  const { hasFeatureAccess, getOfferLimit, userPlan, getPlanName } = useFeatureAccess();

  const { data: offers = [], isLoading: offersLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/business/offers"],
  });

  const { data: stats = { totalOffers: 0, activeOffers: 0, totalViews: 0, expiringOffers: 0 } } = useQuery({
    queryKey: ["/api/business/stats"],
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      await apiRequest("DELETE", `/api/business/offers/${offerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business/stats"] });
      toast({
        title: "تم حذف العرض",
        description: "تم حذف العرض بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف العرض",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getOfferStatus = (offer: OfferWithRelations) => {
    const now = new Date();
    const endDate = new Date(offer.endDate);
    
    if (!offer.isApproved) {
      return { label: "في انتظار الموافقة", variant: "secondary" as const };
    }
    if (endDate < now) {
      return { label: "منتهي", variant: "destructive" as const };
    }
    if (offer.isActive) {
      return { label: "نشط", variant: "default" as const };
    }
    return { label: "غير نشط", variant: "secondary" as const };
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (end < now) {
      return "انتهى";
    }
    
    return formatDistanceToNow(end, { addSuffix: true, locale: ar });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button 
          onClick={() => setLocation("/")}
          className="flex items-center text-gray-600 hover:text-saudi-green font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-200 mb-4"
        >
          <i className="fas fa-arrow-right ml-2"></i>
          العودة للرئيسية
        </button>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم التاجر</h1>
          <p className="text-gray-600">مرحباً {user.businessName || user.username}</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">نظرة عامة</TabsTrigger>
            <TabsTrigger value="offers">إدارة العروض</TabsTrigger>
            <TabsTrigger value="branches">إدارة الفروع</TabsTrigger>
            <TabsTrigger value="screen-ads">الإعلان على الشاشات</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-500 text-white p-3 rounded-lg ml-4">
                      <i className="fas fa-eye"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{(stats as any)?.totalViews || 0}</h3>
                      <p className="text-gray-600">إجمالي المشاهدات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-green-500 text-white p-3 rounded-lg ml-4">
                      <i className="fas fa-tags"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{(stats as any)?.activeOffers || 0}</h3>
                      <p className="text-gray-600">العروض النشطة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-500 text-white p-3 rounded-lg ml-4">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{(stats as any)?.expiringOffers || 0}</h3>
                      <p className="text-gray-600">تنتهي خلال 24 ساعة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-500 text-white p-3 rounded-lg ml-4">
                      <i className="fas fa-list"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{(stats as any)?.totalOffers || 0}</h3>
                      <p className="text-gray-600">إجمالي العروض</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Offers */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>عروضي الحديثة</CardTitle>
                  {(stats as any)?.activeOffers >= getOfferLimit() ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                        >
                          <i className="fas fa-lock ml-2"></i>
                          تم الوصول للحد الأقصى
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md" dir="rtl">
                        <DialogHeader>
                          <DialogTitle>وصلت لحد العروض الشهرية</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <i className="fas fa-exclamation-triangle text-yellow-600 text-2xl"></i>
                            </div>
                            <p className="text-gray-600">
                              لقد استخدمت {(stats as any)?.activeOffers} من {getOfferLimit()} عروض في باقة {getPlanName(userPlan)}
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-medium text-blue-800 mb-1">حلول متاحة:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• احذف عرض قديم لإضافة عرض جديد</li>
                              <li>• ترقى لباقة أعلى للمزيد من العروض</li>
                            </ul>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1"
                              onClick={() => setLocation("/subscription-management")}
                            >
                              <i className="fas fa-arrow-up ml-2"></i>
                              ترقية الباقة
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <i className="fas fa-info ml-2"></i>
                              المزيد
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button 
                      className="bg-saudi-green hover:bg-green-800"
                      onClick={() => setShowOfferForm(true)}
                    >
                      <i className="fas fa-plus ml-2"></i>
                      إضافة عرض جديد ({(stats as any)?.activeOffers}/{getOfferLimit()})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {offersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg ml-4"></div>
                            <div>
                              <div className="h-4 bg-gray-200 rounded mb-2 w-48"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-tags text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عروض</h3>
                    <p className="text-gray-600 mb-4">ابدأ بإضافة عرضك الأول</p>
                    <Button 
                      className="bg-saudi-green hover:bg-green-800"
                      onClick={() => setShowOfferForm(true)}
                    >
                      إضافة عرض جديد
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.slice(0, 5).map((offer) => {
                      const status = getOfferStatus(offer);
                      return (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                  <span className="text-gray-500 text-sm">
                                    {getTimeRemaining(offer.endDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-reverse space-x-3">
                              <Badge variant={status.variant} className="ml-3">
                                {status.label}
                              </Badge>
                              
                              {/* Edit Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setShowOfferForm(true);
                                }}
                                title="تعديل العرض"
                              >
                                ✏️
                              </Button>
                              
                              {/* Delete Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-10 w-10 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                                    title="حذف العرض"
                                  >
                                    🗑️
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold text-red-600">
                                      ⚠️ تأكيد الحذف
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-700 text-base leading-relaxed">
                                      هل أنت متأكد من حذف العرض "{offer.title}"؟
                                      <br />
                                      <span className="text-red-600 font-medium">لا يمكن التراجع عن هذا الإجراء.</span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-3">
                                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                                      إلغاء
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteOfferMutation.mutate(offer.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white font-medium"
                                      disabled={deleteOfferMutation.isPending}
                                    >
                                      {deleteOfferMutation.isPending ? "جاري الحذف..." : "حذف نهائياً"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>جميع العروض</CardTitle>
                  <Button 
                    className="bg-saudi-green hover:bg-green-800"
                    onClick={() => setShowOfferForm(true)}
                  >
                    <i className="fas fa-plus ml-2"></i>
                    إضافة عرض جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {offersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saudi-green mx-auto"></div>
                    <p className="mt-2 text-gray-600">جاري تحميل العروض...</p>
                  </div>
                ) : offers.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-tags text-4xl text-gray-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عروض</h3>
                    <p className="text-gray-600 mb-4">ابدأ بإضافة عرضك الأول</p>
                    <Button 
                      className="bg-saudi-green hover:bg-green-800"
                      onClick={() => setShowOfferForm(true)}
                    >
                      إضافة عرض جديد
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => {
                      const status = getOfferStatus(offer);
                      return (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                  <span className="text-gray-500 text-sm">
                                    {getTimeRemaining(offer.endDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-reverse space-x-3">
                              <Badge variant={status.variant} className="ml-3">
                                {status.label}
                              </Badge>
                              
                              {/* Edit Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setShowOfferForm(true);
                                }}
                                title="تعديل العرض"
                              >
                                ✏️
                              </Button>
                              
                              {/* Delete Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-10 w-10 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                                    title="حذف العرض"
                                  >
                                    🗑️
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold text-red-600">
                                      ⚠️ تأكيد الحذف
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-700 text-base leading-relaxed">
                                      هل أنت متأكد من حذف العرض "{offer.title}"؟
                                      <br />
                                      <span className="text-red-600 font-medium">لا يمكن التراجع عن هذا الإجراء.</span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-3">
                                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                                      إلغاء
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteOfferMutation.mutate(offer.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white font-medium"
                                      disabled={deleteOfferMutation.isPending}
                                    >
                                      {deleteOfferMutation.isPending ? "جاري الحذف..." : "حذف نهائياً"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branches">
            <BranchManagement />
          </TabsContent>

          <TabsContent value="screen-ads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📺</span>
                  الإعلان على الشاشات
                </CardTitle>
                <p className="text-gray-600">اعرض إعلاناتك على الشاشات في المقاهي والمطاعم والمولات</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold mb-2">اختر موقع وابدأ الإعلان</h3>
                  <p className="text-gray-600 mb-6">
                    شاهد جميع المواقع المتاحة على الخريطة واختر الأنسب لإعلانك
                  </p>
                  <Button 
                    className="bg-saudi-green hover:bg-green-800"
                    onClick={() => setLocation("/screen-ads")}
                  >
                    <i className="fas fa-map-marker-alt ml-2"></i>
                    استكشف المواقع على الخريطة
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl mb-2">🎯</div>
                      <h4 className="font-medium mb-1">استهداف دقيق</h4>
                      <p className="text-sm text-gray-600">اختر المواقع الأنسب لجمهورك المستهدف</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl mb-2">💰</div>
                      <h4 className="font-medium mb-1">أسعار تنافسية</h4>
                      <p className="text-sm text-gray-600">ابدأ من 50 ريال يومياً للشاشة الواحدة</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl mb-2">📊</div>
                      <h4 className="font-medium mb-1">تتبع الأداء</h4>
                      <p className="text-sm text-gray-600">راقب عدد مرات العرض والتفاعل</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Offer Form Dialog */}
        <Dialog open={showOfferForm} onOpenChange={setShowOfferForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? "تعديل العرض" : "إضافة عرض جديد"}
              </DialogTitle>
            </DialogHeader>
            <OfferForm
              offer={editingOffer}
              onSuccess={() => {
                setShowOfferForm(false);
                setEditingOffer(null);
              }}
              onCancel={() => {
                setShowOfferForm(false);
                setEditingOffer(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}