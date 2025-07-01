import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import OfferForm from "@/components/offers/offer-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OfferWithRelations } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import BranchManagement from "@/components/business/branch-management";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingOffer, setEditingOffer] = useState<OfferWithRelations | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);

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
    if (!offer.isActive) return { label: "غير نشط", variant: "secondary" as const };
    if (!offer.isApproved) return { label: "في انتظار المراجعة", variant: "outline" as const };
    if (offer.endDate && new Date(offer.endDate.toString()) < new Date()) return { label: "منتهي", variant: "destructive" as const };
    return { label: "نشط", variant: "default" as const };
  };

  const getTimeRemaining = (endDate: Date | null) => {
    if (!endDate) return "بدون تاريخ انتهاء";
    const end = new Date(endDate);
    const now = new Date();
    if (end < now) return "منتهي";
    return formatDistanceToNow(end, { addSuffix: true, locale: ar });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم التاجر</h1>
          <p className="text-gray-600">أهلاً بك، {user.businessName || user.username}</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="offers">عروضي</TabsTrigger>
            <TabsTrigger value="create">إضافة عرض</TabsTrigger>
            <TabsTrigger value="profile">ملف التاجر</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-500 text-white p-3 rounded-lg ml-4">
                      <i className="fas fa-eye"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{(stats as any)?.totalViews?.toLocaleString() || 0}</h3>
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
                            <div className="flex items-center space-x-reverse space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setShowOfferForm(true);
                                }}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteOfferMutation.mutate(offer.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
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
                            <div className="flex items-center space-x-reverse space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingOffer(offer);
                                  setShowOfferForm(true);
                                }}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteOfferMutation.mutate(offer.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
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

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إضافة عرض جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <OfferForm 
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/business/offers"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/business/stats"] });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>ملف الشركة</CardTitle>
                  <p className="text-gray-600">إدارة بيانات شركتك ومعلومات التواصل</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">شعار الشركة</h3>
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        {user.businessLogo ? (
                          <img 
                            src={user.businessLogo} 
                            alt="شعار الشركة" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <i className="fas fa-building text-gray-400 text-2xl"></i>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-upload ml-2"></i>
                        {user.businessLogo ? "تغيير الشعار" : "رفع شعار"}
                      </Button>
                    </div>
                  </div>

                  {/* Business Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">معلومات الشركة</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">اسم الشركة</label>
                        <p className="text-gray-900">{user.businessName || "غير محدد"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">فئة النشاط</label>
                        <p className="text-gray-900">{user.businessCategory || "غير محدد"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">المدينة الرئيسية</label>
                        <p className="text-gray-900">{user.businessCity || "غير محدد"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">وصف النشاط</label>
                        <p className="text-gray-900">{user.businessDescription || "غير محدد"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">معلومات التواصل</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                        <p className="text-gray-900">{user.businessPhone || "غير محدد"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">رقم الواتساب</label>
                        <p className="text-gray-900">{user.businessWhatsapp || "غير محدد"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">الموقع الإلكتروني</label>
                        <p className="text-gray-900">{user.businessWebsite || "غير محدد"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">حسابات التواصل الاجتماعي</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {user.businessInstagram && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fab fa-instagram text-pink-600"></i>
                          <a href={user.businessInstagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {user.businessInstagram}
                          </a>
                        </div>
                      )}
                      {user.businessFacebook && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fab fa-facebook text-blue-600"></i>
                          <a href={user.businessFacebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {user.businessFacebook}
                          </a>
                        </div>
                      )}
                      {user.businessSnapchat && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fab fa-snapchat text-yellow-500"></i>
                          <a href={user.businessSnapchat} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {user.businessSnapchat}
                          </a>
                        </div>
                      )}
                      {user.businessX && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fab fa-x-twitter text-black"></i>
                          <a href={user.businessX} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {user.businessX}
                          </a>
                        </div>
                      )}
                      {user.businessTiktok && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fab fa-tiktok text-black"></i>
                          <a href={user.businessTiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {user.businessTiktok}
                          </a>
                        </div>
                      )}
                      {!user.businessInstagram && !user.businessFacebook && !user.businessSnapchat && !user.businessX && !user.businessTiktok && (
                        <p className="text-gray-500">لم يتم إضافة حسابات التواصل الاجتماعي</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="bg-saudi-green hover:bg-green-800">
                      <i className="fas fa-edit ml-2"></i>
                      تحديث البيانات
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Branch Management Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>إدارة الفروع</CardTitle>
                      <p className="text-gray-600">إضافة وإدارة فروع شركتك</p>
                    </div>
                    <Button className="bg-saudi-green hover:bg-green-800" size="sm">
                      <i className="fas fa-plus ml-2"></i>
                      فرع جديد
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BranchManagement />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Offer Form Dialog */}
      <Dialog open={showOfferForm} onOpenChange={setShowOfferForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
              queryClient.invalidateQueries({ queryKey: ["/api/business/offers"] });
              queryClient.invalidateQueries({ queryKey: ["/api/business/stats"] });
            }}
            onCancel={() => {
              setShowOfferForm(false);
              setEditingOffer(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
