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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OfferAnalysisModal } from "@/components/ai/offer-analysis-modal";
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

export default function AdminDashboardEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Search and filter states
  const [merchantSearchTerm, setMerchantSearchTerm] = useState("");
  const [offerSearchTerm, setOfferSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [merchantCityFilter, setMerchantCityFilter] = useState("all");
  const [offerStatusFilter, setOfferStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  
  // Modal states
  const [selectedMerchant, setSelectedMerchant] = useState<User | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferWithRelations | null>(null);
  const [editingOffer, setEditingOffer] = useState<OfferWithRelations | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // AI Analysis Modal State
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisOfferId, setAnalysisOfferId] = useState<number>(0);
  const [analysisOfferTitle, setAnalysisOfferTitle] = useState<string>("");
  
  // System settings
  const [systemSettings, setSystemSettings] = useState({
    platformName: "براق",
    contactEmail: "support@laqatha.com",
    contactPhone: "+966501234567",
    basicPlanPrice: 49,
    premiumPlanPrice: 149,
    freeOfferLimit: 3,
    basicOfferLimit: 10,
    premiumOfferLimit: 50,
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
      const res = await apiRequest("PATCH", `/api/admin/businesses/${businessId}/status`, { isApproved });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "تم تحديث حالة التاجر",
        description: "تم تحديث حالة التاجر بنجاح",
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

  const resetPasswordMutation = useMutation({
    mutationFn: async (businessId: number) => {
      const res = await apiRequest("POST", `/api/admin/businesses/${businessId}/reset-password`);
      return res.json();
    },
    onSuccess: (data) => {
      setNewPassword(data.newPassword);
      toast({
        title: "تم إعادة تعيين كلمة المرور",
        description: "تم إنشاء كلمة مرور جديدة",
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

  const changePlanMutation = useMutation({
    mutationFn: async ({ businessId, plan }: { businessId: number; plan: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/businesses/${businessId}/plan`, { plan });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
      toast({
        title: "تم تغيير الباقة",
        description: "تم تحديث باقة التاجر بنجاح",
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

  const rejectOfferMutation = useMutation({
    mutationFn: async ({ offerId, reason }: { offerId: number; reason: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/offers/${offerId}/reject`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setRejectReason("");
      toast({
        title: "تم رفض العرض",
        description: "تم رفض العرض مع إرسال السبب للتاجر",
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

  const approveOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/offers/${offerId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "تم قبول العرض",
        description: "تم قبول العرض ونشره على المنصة",
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

  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/offers/${offerId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "تم حذف العرض",
        description: "تم حذف العرض نهائياً من المنصة",
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

  // Filter functions
  const filteredMerchants = businesses.filter(business => {
    const matchesSearch = business.businessName?.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
                         business.email?.toLowerCase().includes(merchantSearchTerm.toLowerCase()) ||
                         business.username?.toLowerCase().includes(merchantSearchTerm.toLowerCase());
    const matchesCity = merchantCityFilter === "all" || business.businessCity === merchantCityFilter;
    const matchesPlan = planFilter === "all" || business.subscriptionPlan === planFilter;
    return matchesSearch && matchesCity && matchesPlan;
  });

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title?.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
                         offer.business?.businessName?.toLowerCase().includes(offerSearchTerm.toLowerCase());
    const matchesStatus = offerStatusFilter === "all" || 
                         (offerStatusFilter === "active" && offer.isActive) ||
                         (offerStatusFilter === "expired" && !offer.isActive) ||
                         (offerStatusFilter === "pending" && !offer.isApproved) ||
                         (offerStatusFilter === "approved" && offer.isApproved);
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(customer => 
    customer.phoneNumber?.includes(customerSearchTerm)
  );

  const getMerchantStatus = (business: User) => {
    if (!business.isApproved) return { text: "معلق", color: "bg-yellow-100 text-yellow-800" };
    if (business.isApproved) return { text: "نشط", color: "bg-green-100 text-green-800" };
    return { text: "غير محدد", color: "bg-gray-100 text-gray-800" };
  };

  const getOfferStatus = (offer: OfferWithRelations) => {
    if (!offer.isApproved) return { text: "معلق", color: "bg-yellow-100 text-yellow-800" };
    if (!offer.isActive) return { text: "منتهي", color: "bg-red-100 text-red-800" };
    if (offer.isActive && offer.isApproved) return { text: "نشط", color: "bg-green-100 text-green-800" };
    return { text: "غير محدد", color: "bg-gray-100 text-gray-800" };
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "free": return { text: "مجاني", color: "bg-gray-100 text-gray-800" };
      case "basic": return { text: "أساسي", color: "bg-blue-100 text-blue-800" };
      case "premium": return { text: "مميز", color: "bg-purple-100 text-purple-800" };
      default: return { text: plan, color: "bg-gray-100 text-gray-800" };
    }
  };

  if (!user || user.role !== "admin") {
    return <div>غير مصرح لك بالدخول</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">لوحة تحكم الإدارة المتقدمة</h1>
        <Button onClick={() => setLocation("/")} variant="outline">
          العودة للصفحة الرئيسية
        </Button>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ml-4">
                <i className="fas fa-store text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي التجار</p>
                <p className="text-2xl font-bold">{stats?.totalBusinesses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center ml-4">
                <i className="fas fa-tags text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي العروض</p>
                <p className="text-2xl font-bold">{stats?.totalOffers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center ml-4">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">العروض المعلقة</p>
                <p className="text-2xl font-bold">{stats?.pendingOffers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center ml-4">
                <i className="fas fa-users text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">العملاء النشطين</p>
                <p className="text-2xl font-bold">{customers.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="merchants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="merchants">إدارة التجار</TabsTrigger>
          <TabsTrigger value="offers">إدارة العروض</TabsTrigger>
          <TabsTrigger value="customers">إدارة العملاء</TabsTrigger>
          <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
          <TabsTrigger value="plans">باقات الاشتراك</TabsTrigger>
          <TabsTrigger value="settings">إعدادات النظام</TabsTrigger>
          <TabsTrigger value="ai-tools">أدوات الذكاء الاصطناعي</TabsTrigger>
        </TabsList>

        {/* Merchant Management Tab */}
        <TabsContent value="merchants" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <CardTitle className="text-lg sm:text-xl">إدارة التجار المتقدمة</CardTitle>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
                  <Input
                    placeholder="البحث بالاسم أو الإيميل..."
                    value={merchantSearchTerm}
                    onChange={(e) => setMerchantSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={merchantCityFilter} onValueChange={setMerchantCityFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المدن</SelectItem>
                      <SelectItem value="الرياض">الرياض</SelectItem>
                      <SelectItem value="جدة">جدة</SelectItem>
                      <SelectItem value="الدمام">الدمام</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="الباقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الباقات</SelectItem>
                      <SelectItem value="free">مجاني</SelectItem>
                      <SelectItem value="basic">أساسي</SelectItem>
                      <SelectItem value="premium">مميز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-[800px]">
                  <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاجر</TableHead>
                    <TableHead>الإيميل</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>الباقة</TableHead>
                    <TableHead>العروض النشطة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>آخر دخول</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMerchants.map((business) => {
                    const status = getMerchantStatus(business);
                    const plan = getPlanBadge(business.subscriptionPlan || "free");
                    const activeOffersCount = offers.filter(offer => 
                      offer.business.id === business.id && offer.isActive
                    ).length;

                    return (
                      <TableRow key={business.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{business.businessName || business.username}</div>
                            <div className="text-sm text-gray-500">#{business.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{business.email}</TableCell>
                        <TableCell>{business.businessCity || "غير محدد"}</TableCell>
                        <TableCell>
                          <Badge className={plan.color}>{plan.text}</Badge>
                        </TableCell>
                        <TableCell>{activeOffersCount}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.text}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(business.createdAt!), { addSuffix: true, locale: ar })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedMerchant(business)}
                                >
                                  <i className="fas fa-eye ml-1"></i>
                                  عرض
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl" dir="rtl">
                                <DialogHeader>
                                  <DialogTitle>تفاصيل التاجر - {selectedMerchant?.businessName}</DialogTitle>
                                </DialogHeader>
                                {selectedMerchant && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>اسم النشاط التجاري</Label>
                                        <p className="text-sm text-gray-600">{selectedMerchant.businessName}</p>
                                      </div>
                                      <div>
                                        <Label>الإيميل</Label>
                                        <p className="text-sm text-gray-600">{selectedMerchant.email}</p>
                                      </div>
                                      <div>
                                        <Label>المدينة</Label>
                                        <p className="text-sm text-gray-600">{selectedMerchant.businessCity}</p>
                                      </div>
                                      <div>
                                        <Label>رقم الهاتف</Label>
                                        <p className="text-sm text-gray-600">{selectedMerchant.businessPhone}</p>
                                      </div>
                                      <div>
                                        <Label>الباقة الحالية</Label>
                                        <Badge className={getPlanBadge(selectedMerchant.subscriptionPlan || "free").color}>
                                          {getPlanBadge(selectedMerchant.subscriptionPlan || "free").text}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label>عدد العروض المسموحة</Label>
                                        <p className="text-sm text-gray-600">{selectedMerchant.offerLimit}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-4">
                                      <Select
                                        value={selectedMerchant.subscriptionPlan || "free"}
                                        onValueChange={(value) => 
                                          changePlanMutation.mutate({ 
                                            businessId: selectedMerchant.id, 
                                            plan: value 
                                          })
                                        }
                                      >
                                        <SelectTrigger className="w-40">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="free">مجاني</SelectItem>
                                          <SelectItem value="basic">أساسي</SelectItem>
                                          <SelectItem value="premium">مميز</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => resetPasswordMutation.mutate(selectedMerchant.id)}
                                      >
                                        <i className="fas fa-key ml-1"></i>
                                        إعادة تعيين كلمة المرور
                                      </Button>
                                      
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setLocation(`/business/${selectedMerchant.id}`)}
                                      >
                                        <i className="fas fa-external-link-alt ml-1"></i>
                                        عرض الصفحة
                                      </Button>
                                    </div>
                                    
                                    {newPassword && (
                                      <div className="p-4 bg-blue-50 rounded-lg">
                                        <Label>كلمة المرور الجديدة</Label>
                                        <p className="font-mono text-lg">{newPassword}</p>
                                        <p className="text-sm text-gray-600">يرجى إرسال كلمة المرور الجديدة للتاجر</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              size="sm"
                              variant={business.isApproved ? "destructive" : "default"}
                              onClick={() =>
                                updateBusinessStatusMutation.mutate({
                                  businessId: business.id,
                                  isApproved: !business.isApproved,
                                })
                              }
                            >
                              {business.isApproved ? "إلغاء التفعيل" : "تفعيل"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offer Management Tab */}
        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة العروض المتقدمة</span>
                <div className="flex gap-2">
                  <Input
                    placeholder="البحث بالعنوان أو التاجر..."
                    value={offerSearchTerm}
                    onChange={(e) => setOfferSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={offerStatusFilter} onValueChange={setOfferStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع العروض</SelectItem>
                      <SelectItem value="pending">معلقة</SelectItem>
                      <SelectItem value="approved">مقبولة</SelectItem>
                      <SelectItem value="active">نشطة</SelectItem>
                      <SelectItem value="expired">منتهية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العرض</TableHead>
                    <TableHead>التاجر</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>المشاهدات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map((offer) => {
                    const status = getOfferStatus(offer);

                    return (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{offer.title}</div>
                            <div className="text-sm text-gray-500">#{offer.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{offer.business?.businessName}</TableCell>
                        <TableCell>{offer.category?.nameAr}</TableCell>
                        <TableCell>{offer.views || 0}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.text}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(offer.createdAt!), { addSuffix: true, locale: ar })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAnalysisOfferId(offer.id);
                                setAnalysisOfferTitle(offer.title);
                                setAnalysisModalOpen(true);
                              }}
                              className="flex items-center gap-1"
                            >
                              <i className="fas fa-brain text-blue-600"></i>
                              تحليل
                            </Button>
                            
                            {!offer.isApproved && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => approveOfferMutation.mutate(offer.id)}
                                >
                                  <i className="fas fa-check ml-1"></i>
                                  قبول
                                </Button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <i className="fas fa-times ml-1"></i>
                                      رفض
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent dir="rtl">
                                    <DialogHeader>
                                      <DialogTitle>رفض العرض</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>سبب الرفض</Label>
                                        <Textarea
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                          placeholder="اكتب سبب رفض العرض..."
                                          rows={3}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => 
                                            rejectOfferMutation.mutate({ 
                                              offerId: offer.id, 
                                              reason: rejectReason 
                                            })
                                          }
                                          disabled={!rejectReason.trim()}
                                        >
                                          رفض العرض
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/offer/${offer.id}`)}
                            >
                              <i className="fas fa-eye ml-1"></i>
                              عرض
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <i className="fas fa-trash ml-1"></i>
                                  حذف
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف هذا العرض نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteOfferMutation.mutate(offer.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف نهائي
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Management Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة العملاء</span>
                <Input
                  placeholder="البحث برقم الهاتف..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-64"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>العروض المفضلة</TableHead>
                    <TableHead>آخر نشاط</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>
                        {customers.filter(c => c.phoneNumber === customer.phoneNumber).length}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(customer.createdAt!), { addSuffix: true, locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <i className="fas fa-bell ml-1"></i>
                            إرسال إشعار
                          </Button>
                          <Button size="sm" variant="destructive">
                            <i className="fas fa-ban ml-1"></i>
                            حظر
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>اسم المنصة</Label>
                    <Input
                      value={systemSettings.platformName}
                      onChange={(e) => setSystemSettings({...systemSettings, platformName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>إيميل التواصل</Label>
                    <Input
                      value={systemSettings.contactEmail}
                      onChange={(e) => setSystemSettings({...systemSettings, contactEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>رقم التواصل</Label>
                    <Input
                      value={systemSettings.contactPhone}
                      onChange={(e) => setSystemSettings({...systemSettings, contactPhone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">أسعار الباقات</h3>
                  <div>
                    <Label>الباقة الأساسية (ريال/شهر)</Label>
                    <Input
                      type="number"
                      value={systemSettings.basicPlanPrice}
                      onChange={(e) => setSystemSettings({...systemSettings, basicPlanPrice: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>الباقة المميزة (ريال/شهر)</Label>
                    <Input
                      type="number"
                      value={systemSettings.premiumPlanPrice}
                      onChange={(e) => setSystemSettings({...systemSettings, premiumPlanPrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">حدود العروض</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">مجاني</Label>
                        <Input
                          type="number"
                          value={systemSettings.freeOfferLimit}
                          onChange={(e) => setSystemSettings({...systemSettings, freeOfferLimit: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">أساسي</Label>
                        <Input
                          type="number"
                          value={systemSettings.basicOfferLimit}
                          onChange={(e) => setSystemSettings({...systemSettings, basicOfferLimit: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">مميز</Label>
                        <Input
                          type="number"
                          value={systemSettings.premiumOfferLimit}
                          onChange={(e) => setSystemSettings({...systemSettings, premiumOfferLimit: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">
                <i className="fas fa-save ml-2"></i>
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الاشتراكات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {businesses.filter(b => b.subscriptionPlan === "free").length}
                    </div>
                    <div className="text-sm text-gray-600">حسابات مجانية</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {businesses.filter(b => b.subscriptionPlan === "basic").length}
                    </div>
                    <div className="text-sm text-gray-600">باقة أساسية</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {businesses.filter(b => b.subscriptionPlan === "premium").length}
                    </div>
                    <div className="text-sm text-gray-600">باقة مميزة</div>
                  </div>
                </Card>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاجر</TableHead>
                    <TableHead>الباقة الحالية</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>التجديد التلقائي</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.filter(b => b.subscriptionPlan !== "free").map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>{business.businessName}</TableCell>
                      <TableCell>
                        <Badge className={getPlanBadge(business.subscriptionPlan || "free").color}>
                          {getPlanBadge(business.subscriptionPlan || "free").text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {business.subscriptionExpiry 
                          ? formatDistanceToNow(new Date(business.subscriptionExpiry), { addSuffix: true, locale: ar })
                          : "غير محدد"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={business.autoRenew ? "default" : "secondary"}>
                          {business.autoRenew ? "مفعل" : "معطل"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-file-pdf ml-1"></i>
                          تقرير شهري
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Plans Management Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة باقات الاشتراك والميزات</span>
                <Button onClick={() => window.open('/subscription-management', '_blank')}>
                  <i className="fas fa-external-link-alt ml-2"></i>
                  فتح إدارة الباقات الكاملة
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <i className="fas fa-crown text-6xl text-purple-300 mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">إدارة الباقات المتقدمة</h3>
                <p className="text-gray-600 mb-4">
                  نظام إدارة الباقات والميزات الديناميكي يتيح لك إنشاء وتعديل الباقات والميزات بسهولة
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 border rounded-lg">
                    <i className="fas fa-plus-circle text-green-600 text-2xl mb-2"></i>
                    <h4 className="font-semibold">إنشاء باقات جديدة</h4>
                    <p className="text-sm text-gray-600">أضف باقات اشتراك جديدة مع أسعار وحدود مخصصة</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <i className="fas fa-toggle-on text-blue-600 text-2xl mb-2"></i>
                    <h4 className="font-semibold">إدارة الميزات</h4>
                    <p className="text-sm text-gray-600">تحكم في الميزات المتاحة لكل باقة اشتراك</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <i className="fas fa-chart-bar text-purple-600 text-2xl mb-2"></i>
                    <h4 className="font-semibold">مصفوفة المقارنة</h4>
                    <p className="text-sm text-gray-600">عرض مقارنة شاملة لجميع الباقات والميزات</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tools Oversight Tab */}
        <TabsContent value="ai-tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مراقبة أدوات الذكاء الاصطناعي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">محلل العروض بالذكاء الاصطناعي</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>الاستخدام اليومي</span>
                      <span className="font-semibold">47 تحليل</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل النجاح</span>
                      <span className="font-semibold text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>متوسط النقاط</span>
                      <span className="font-semibold">8.2/10</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">نظام إعادة النشر التلقائي</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>العروض المعاد نشرها</span>
                      <span className="font-semibold">23 عرض</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل التحسن</span>
                      <span className="font-semibold text-green-600">+32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الوقت المتوسط</span>
                      <span className="font-semibold">3.2 أيام</span>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-4">الرسائل التلقائية المرسلة</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>النوع</TableHead>
                      <TableHead>المتلقي</TableHead>
                      <TableHead>المحتوى</TableHead>
                      <TableHead>وقت الإرسال</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>تحليل العرض</TableCell>
                      <TableCell>مطعم الأصالة</TableCell>
                      <TableCell>تم تحسين نقاط عرضك من 6.5 إلى 8.9</TableCell>
                      <TableCell>منذ ساعتين</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">تم الإرسال</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>إعادة نشر</TableCell>
                      <TableCell>متجر الإلكترونيات</TableCell>
                      <TableCell>تم إعادة نشر عرضك المنتهي تلقائياً</TableCell>
                      <TableCell>منذ 4 ساعات</TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-800">تم الإرسال</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Analysis Modal */}
      <OfferAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        offerId={analysisOfferId}
        offerTitle={analysisOfferTitle}
      />
    </div>
  );
}