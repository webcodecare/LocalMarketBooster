import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OfferWithRelations, User, CustomerFavorite } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface AdminStats {
  totalBusinesses: number;
  totalOffers: number;
  totalUsers: number;
  pendingOffers: number;
  mostViewedOffers: OfferWithRelations[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [merchantSearchTerm, setMerchantSearchTerm] = useState("");
  const [offerSearchTerm, setOfferSearchTerm] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<User | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferWithRelations | null>(null);
  const [editingOffer, setEditingOffer] = useState<OfferWithRelations | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [systemSettings, setSystemSettings] = useState({
    platformName: "لقطها",
    contactEmail: "support@laqatha.com",
    contactPhone: "+966501234567",
    basicPlanPrice: 49,
    premiumPlanPrice: 149,
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: businesses = [], isLoading: businessesLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/businesses"],
  });

  const { data: offers = [], isLoading: offersLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ["/api/admin/offers"],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<CustomerFavorite[]>({
    queryKey: ["/api/admin/customers"],
  });

  // Mutations
  const updateBusinessStatusMutation = useMutation({
    mutationFn: async ({ businessId, isApproved }: { businessId: number; isApproved: boolean }) => {
      await apiRequest("PATCH", `/api/admin/businesses/${businessId}/status`, { isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم تحديث حالة التاجر بنجاح" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في تحديث حالة التاجر", description: error.message, variant: "destructive" });
    },
  });

  const approveOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      await apiRequest("POST", `/api/admin/offers/${offerId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم قبول العرض بنجاح" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في قبول العرض", description: error.message, variant: "destructive" });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: async ({ offerId, reason }: { offerId: number; reason?: string }) => {
      await apiRequest("POST", `/api/admin/offers/${offerId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم رفض العرض" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في رفض العرض", description: error.message, variant: "destructive" });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      await apiRequest("DELETE", `/api/admin/offers/${offerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "تم حذف العرض بنجاح" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في حذف العرض", description: error.message, variant: "destructive" });
    },
  });

  // Filter functions
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.business.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "approved" && offer.isApproved) ||
                         (statusFilter === "pending" && !offer.isApproved);
    
    return matchesSearch && matchesStatus;
  });

  const getOfferStatus = (offer: OfferWithRelations) => {
    if (!offer.isApproved) {
      return { label: "في انتظار الموافقة", variant: "secondary" as const, color: "yellow" };
    }
    if (!offer.isActive) {
      return { label: "غير نشط", variant: "secondary" as const, color: "gray" };
    }
    const now = new Date();
    const endDate = offer.endDate ? new Date(offer.endDate) : now;
    if (endDate < now) {
      return { label: "منتهي", variant: "destructive" as const, color: "red" };
    }
    return { label: "نشط", variant: "default" as const, color: "green" };
  };

  const getBusinessStatus = (business: User) => {
    if (business.isApproved) {
      return { label: "مفعل", variant: "default" as const, color: "green" };
    }
    return { label: "معلق", variant: "secondary" as const, color: "yellow" };
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح</h1>
            <p className="text-gray-600">ليس لديك صلاحيات للوصول إلى لوحة الإدارة</p>
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
          onClick={() => setLocation("/")}
          className="flex items-center text-gray-600 hover:text-saudi-green font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
        >
          <i className="fas fa-arrow-right ml-2"></i>
          العودة للرئيسية
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-sm sm:text-base text-gray-600">إدارة شاملة للمنصة والمحتوى</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="businesses">التجار</TabsTrigger>
            <TabsTrigger value="offers">العروض</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-500 text-white p-3 rounded-lg ml-4">
                      <i className="fas fa-store"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalBusinesses || 0}
                      </h3>
                      <p className="text-gray-600">إجمالي التجار</p>
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
                      <h3 className="text-2xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalOffers || 0}
                      </h3>
                      <p className="text-gray-600">إجمالي العروض</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-500 text-white p-3 rounded-lg ml-4">
                      <i className="fas fa-users"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.totalUsers || 0}
                      </h3>
                      <p className="text-gray-600">العملاء النشطين</p>
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
                      <h3 className="text-2xl font-bold text-gray-900">
                        {statsLoading ? "..." : stats?.pendingOffers || 0}
                      </h3>
                      <p className="text-gray-600">عروض معلقة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Most Viewed Offers */}
            <Card>
              <CardHeader>
                <CardTitle>العروض الأكثر مشاهدة</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-reverse space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats?.mostViewedOffers.map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-reverse space-x-4">
                          <img 
                            src={offer.imageUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"} 
                            alt={offer.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                            <p className="text-gray-600 text-sm">{offer.business.businessName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-4">
                          <span className="text-green-600 font-medium">
                            <i className="fas fa-eye ml-1"></i>
                            {offer.views} مشاهدة
                          </span>
                          <Badge variant={getOfferStatus(offer).variant}>
                            {getOfferStatus(offer).label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Businesses Tab */}
          <TabsContent value="businesses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة التجار</CardTitle>
                  <div className="flex items-center space-x-reverse space-x-4">
                    <Input
                      placeholder="البحث عن التجار..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {businessesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-reverse space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div>
                              <div className="h-4 bg-gray-200 rounded mb-2 w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {businesses
                      .filter(business => 
                        business.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        business.username.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((business) => {
                        const status = getBusinessStatus(business);
                        return (
                          <div key={business.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-reverse space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <i className="fas fa-store text-gray-500"></i>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {business.businessName || business.username}
                                  </h4>
                                  <p className="text-gray-600 text-sm">{business.email}</p>
                                  <p className="text-gray-500 text-sm">{business.businessCity}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-reverse space-x-3">
                                <Badge variant={status.variant}>
                                  {status.label}
                                </Badge>
                                {business.isApproved ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => updateBusinessStatusMutation.mutate({ businessId: business.id, isApproved: false })}
                                    disabled={updateBusinessStatusMutation.isPending}
                                  >
                                    إلغاء التفعيل
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => updateBusinessStatusMutation.mutate({ businessId: business.id, isApproved: true })}
                                    disabled={updateBusinessStatusMutation.isPending}
                                  >
                                    تفعيل
                                  </Button>
                                )}
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

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة العروض</CardTitle>
                  <div className="flex items-center space-x-reverse space-x-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع العروض</SelectItem>
                        <SelectItem value="pending">معلقة</SelectItem>
                        <SelectItem value="approved">مقبولة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="البحث في العروض..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {offersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-reverse space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                            <div>
                              <div className="h-4 bg-gray-200 rounded mb-2 w-48"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOffers.map((offer) => {
                      const status = getOfferStatus(offer);
                      return (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-reverse space-x-4">
                              <img 
                                src={offer.imageUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"} 
                                alt={offer.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                                <p className="text-gray-600 text-sm">{offer.business.businessName}</p>
                                <p className="text-gray-500 text-sm">{offer.category.nameAr}</p>
                                <div className="flex items-center mt-1 space-x-reverse space-x-4">
                                  <span className="text-green-600 text-sm">
                                    <i className="fas fa-eye ml-1"></i>
                                    {offer.views} مشاهدة
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    {offer.createdAt && formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true, locale: ar })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-reverse space-x-3">
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                              
                              {!offer.isApproved && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => approveOfferMutation.mutate(offer.id)}
                                  disabled={approveOfferMutation.isPending}
                                >
                                  قبول
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                onClick={() => rejectOfferMutation.mutate({ offerId: offer.id })}
                                disabled={rejectOfferMutation.isPending}
                              >
                                رفض
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    حذف
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

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>بيانات العملاء</CardTitle>
                  <Button className="bg-saudi-green hover:bg-green-800">
                    <i className="fas fa-download ml-2"></i>
                    تصدير البيانات
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="h-4 bg-gray-200 rounded mb-2 w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customers.map((customer, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{customer.fullName}</h4>
                            <p className="text-gray-600 text-sm">{customer.phoneNumber}</p>
                            <p className="text-gray-500 text-sm">{customer.city}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-sm">
                              {customer.createdAt ? formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true, locale: ar }) : "غير محدد"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النظام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">إدارة المدراء</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">إضافة مدراء جدد للنظام</p>
                      <Button className="bg-saudi-green hover:bg-green-800">
                        إضافة مدير جديد
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">إعدادات العامة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">تخصيص إعدادات المنصة</p>
                      <Button variant="outline">
                        تعديل الإعدادات
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}