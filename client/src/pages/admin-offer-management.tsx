import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/back-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Offer {
  id: number;
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  businessId: number;
  categoryId: number;
  imageUrl?: string;
  discountCode?: string;
  link?: string;
  city?: string;
  views: number;
  createdAt: string;
  business: {
    id: number;
    businessName: string;
  };
  category: {
    id: number;
    name: string;
  };
}

export default function AdminOfferManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/admin/offers", statusFilter, searchQuery],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const approveOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/offers/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الموافقة على العرض",
        description: "تم قبول العرض ونشره بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الموافقة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/offers/${id}/reject`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم رفض العرض",
        description: "تم رفض العرض بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الرفض",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/offers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف العرض",
        description: "تم حذف العرض نهائياً",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Offer> }) => {
      const res = await apiRequest("PUT", `/api/admin/offers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث العرض",
        description: "تم حفظ التغييرات بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      setEditingOffer(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">معلق</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      case 'expired':
        return <Badge variant="secondary">منتهي الصلاحية</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer({ ...offer });
  };

  const handleSaveEdit = () => {
    if (editingOffer) {
      updateOfferMutation.mutate({
        id: editingOffer.id,
        data: editingOffer
      });
    }
  };

  const filteredOffers = offers?.filter(offer => {
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.titleAr.includes(searchQuery) ||
      offer.business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.business.businessNameAr.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <BackButton />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingOffers = filteredOffers?.filter(o => o.status === 'pending') || [];
  const approvedOffers = filteredOffers?.filter(o => o.status === 'approved') || [];
  const rejectedOffers = filteredOffers?.filter(o => o.status === 'rejected') || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackButton />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة العروض</h1>
          <p className="text-muted-foreground mt-2">
            مراجعة وإدارة عروض التجار
          </p>
        </div>
        
        <div className="flex gap-3">
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingOffers.length}</div>
              <div className="text-xs text-muted-foreground">معلق</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedOffers.length}</div>
              <div className="text-xs text-muted-foreground">مقبول</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedOffers.length}</div>
              <div className="text-xs text-muted-foreground">مرفوض</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="البحث في العروض، أسماء الشركات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">حالة العرض</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers?.map((offer) => (
          <Card key={offer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Offer Image */}
                {offer.imageUrl && (
                  <div className="w-full lg:w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={offer.imageUrl} 
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Offer Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{offer.titleAr}</h3>
                      <p className="text-sm text-muted-foreground">{offer.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(offer.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>
                        <span className="line-through text-gray-500">{offer.originalPrice} ر.س</span>
                        <span className="font-semibold text-green-600 mr-2">{offer.discountedPrice} ر.س</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>ينتهي: {format(new Date(offer.validUntil), 'dd/MM/yyyy', { locale: ar })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{offer.business.businessNameAr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{offer.category.nameAr}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">{offer.descriptionAr}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex lg:flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOffer(offer)}>
                        <Eye className="h-4 w-4 mr-2" />
                        عرض
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedOffer?.titleAr}</DialogTitle>
                        <DialogDescription>تفاصيل العرض الكاملة</DialogDescription>
                      </DialogHeader>
                      {selectedOffer && (
                        <div className="space-y-4">
                          {selectedOffer.imageUrl && (
                            <img src={selectedOffer.imageUrl} alt={selectedOffer.title} className="w-full h-48 object-cover rounded-lg" />
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>الشركة:</strong> {selectedOffer.business.businessName}</div>
                            <div><strong>الفئة:</strong> {selectedOffer.category.name}</div>
                            <div><strong>السعر الأصلي:</strong> {selectedOffer.originalPrice} ر.س</div>
                            <div><strong>السعر بالخصم:</strong> {selectedOffer.discountedPrice} ر.س</div>
                            <div><strong>نسبة الخصم:</strong> {selectedOffer.discountPercentage}%</div>
                            <div><strong>الحالة:</strong> {selectedOffer.isApproved ? 'موافق عليه' : 'في الانتظار'}</div>
                            <div><strong>يبدأ:</strong> {format(new Date(selectedOffer.startDate), 'dd/MM/yyyy')}</div>
                            <div><strong>ينتهي:</strong> {format(new Date(selectedOffer.endDate), 'dd/MM/yyyy')}</div>
                          </div>
                          <div>
                            <strong>الوصف:</strong>
                            <p className="mt-1 text-sm">{selectedOffer.description}</p>
                          </div>

                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => handleEditOffer(offer)}>
                    <Edit className="h-4 w-4 mr-2" />
                    تعديل
                  </Button>

                  {!offer.isApproved && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => approveOfferMutation.mutate(offer.id)}
                        disabled={approveOfferMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        قبول
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => rejectOfferMutation.mutate(offer.id)}
                        disabled={rejectOfferMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        رفض
                      </Button>
                    </>
                  )}

                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteOfferMutation.mutate(offer.id)}
                    disabled={deleteOfferMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Offer Dialog */}
      {editingOffer && (
        <Dialog open={!!editingOffer} onOpenChange={() => setEditingOffer(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل العرض</DialogTitle>
              <DialogDescription>تحديث بيانات العرض</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleAr">عنوان العرض (عربي)</Label>
                  <Input
                    id="titleAr"
                    value={editingOffer.titleAr}
                    onChange={(e) => setEditingOffer({...editingOffer, titleAr: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="title">عنوان العرض (إنجليزي)</Label>
                  <Input
                    id="title"
                    value={editingOffer.title}
                    onChange={(e) => setEditingOffer({...editingOffer, title: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">السعر الأصلي</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={editingOffer.originalPrice}
                    onChange={(e) => setEditingOffer({...editingOffer, originalPrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="discountedPrice">السعر بالخصم</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    value={editingOffer.discountedPrice}
                    onChange={(e) => setEditingOffer({...editingOffer, discountedPrice: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">تاريخ البداية</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={editingOffer.validFrom.split('T')[0]}
                    onChange={(e) => setEditingOffer({...editingOffer, validFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">تاريخ الانتهاء</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={editingOffer.validUntil.split('T')[0]}
                    onChange={(e) => setEditingOffer({...editingOffer, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descriptionAr">الوصف (عربي)</Label>
                <Textarea
                  id="descriptionAr"
                  value={editingOffer.descriptionAr}
                  onChange={(e) => setEditingOffer({...editingOffer, descriptionAr: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingOffer(null)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveEdit} disabled={updateOfferMutation.isPending}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredOffers?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">لا توجد عروض</h3>
              <p>لم يتم العثور على عروض تطابق المعايير المحددة</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}