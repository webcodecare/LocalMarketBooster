import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Heart, 
  Phone, 
  MapPin, 
  Calendar, 
  Eye, 
  EyeOff, 
  Download,
  MessageCircle,
  Star,
  Loader2
} from "lucide-react";

interface Lead {
  id: number;
  fullName: string;
  phone: string;
  city: string;
  createdAt: string;
  isRead: boolean;
  notes?: string;
  offer: {
    id: number;
    title: string;
  };
}

export function MerchantLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data: leads = [], isLoading, refetch } = useQuery<Lead[]>({
    queryKey: ['/api/merchant/leads'],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const response = await apiRequest('PATCH', `/api/leads/${leadId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/merchant/leads']);
      toast({
        title: "تم تحديث حالة العميل المحتمل",
        description: "تم وضع علامة كمقروء",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportLeads = () => {
    const csvContent = [
      ['الاسم الكامل', 'رقم الجوال', 'المدينة', 'العرض', 'تاريخ الاهتمام', 'حالة القراءة'],
      ...leads.map(lead => [
        lead.fullName,
        lead.phone,
        lead.city,
        lead.offer.title,
        new Date(lead.createdAt).toLocaleDateString('ar-SA'),
        lead.isRead ? 'مقروء' : 'غير مقروء'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${new Date().toLocaleDateString('ar-SA')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "تم تصدير البيانات",
      description: "تم تحميل ملف CSV بجميع العملاء المحتملين",
    });
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'unread') return !lead.isRead;
    if (filter === 'read') return lead.isRead;
    return true;
  });

  const unreadCount = leads.filter(lead => !lead.isRead).length;
  const totalLeads = leads.length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">العملاء المحتملون</h2>
          <p className="text-gray-600">عملاء أبدوا اهتماماً بعروضك</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportLeads} variant="outline" disabled={totalLeads === 0}>
            <Download className="w-4 h-4 mr-2" />
            تصدير CSV
          </Button>
          <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
            {totalLeads} عميل محتمل
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-blue-900">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <EyeOff className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600">غير مقروءة</p>
                <p className="text-2xl font-bold text-red-900">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">مقروءة</p>
                <p className="text-2xl font-bold text-green-900">{totalLeads - unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">الكل ({totalLeads})</TabsTrigger>
          <TabsTrigger value="unread">غير مقروءة ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">مقروءة ({totalLeads - unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filter === 'all' ? 'لا توجد عملاء محتملون حتى الآن' : 
                     filter === 'unread' ? 'لا توجد رسائل غير مقروءة' : 
                     'لا توجد رسائل مقروءة'}
                  </h3>
                  <p className="text-gray-500">
                    {filter === 'all' ? 'عندما يضغط العملاء على زر "أعجبني" في عروضك، ستظهر تفاصيلهم هنا' :
                     'تحقق من الفئات الأخرى'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <Card 
                  key={lead.id} 
                  className={`transition-all duration-200 ${
                    !lead.isRead ? 'border-red-200 bg-red-50 shadow-md' : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${!lead.isRead ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <h3 className="text-lg font-semibold text-gray-900">{lead.fullName}</h3>
                          </div>
                          {!lead.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              جديد
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span className="font-mono" dir="ltr">{lead.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{lead.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Heart className="w-4 h-4" />
                            <span>{lead.offer.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ar })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => window.open(`https://wa.me/966${lead.phone.replace(/^0/, '')}`, '_blank')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            واتساب
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                            variant="outline"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            اتصال
                          </Button>

                          {!lead.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsReadMutation.mutate(lead.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              وضع علامة كمقروء
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}