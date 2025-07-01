import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, FileText, CheckCircle, XCircle, DollarSign, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ScreenBookingWithRelations, InvoiceWithRelations } from "@shared/schema";

export default function AdminBookingManagement() {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<ScreenBookingWithRelations | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch all bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<ScreenBookingWithRelations[]>({
    queryKey: ["/api/screen-bookings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/screen-bookings");
      return await response.json();
    },
  });

  // Fetch invoices
  const { data: invoices = [] } = useQuery<InvoiceWithRelations[]>({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invoices");
      return await response.json();
    },
  });

  // Approve booking mutation
  const approveBookingMutation = useMutation({
    mutationFn: async ({ id, adminNotes }: { id: number; adminNotes: string }) => {
      const response = await apiRequest("POST", `/api/screen-bookings/${id}/approve`, { adminNotes });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم قبول الحجز بنجاح",
        description: "تم إنشاء فاتورة للحجز المعتمد",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/screen-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setSelectedBooking(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في قبول الحجز",
        description: error.message || "حدث خطأ أثناء قبول الحجز",
        variant: "destructive",
      });
    },
  });

  // Reject booking mutation
  const rejectBookingMutation = useMutation({
    mutationFn: async ({ id, rejectionReason }: { id: number; rejectionReason: string }) => {
      const response = await apiRequest("POST", `/api/screen-bookings/${id}/reject`, { rejectionReason });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم رفض الحجز",
        description: "تم إرسال إشعار للتاجر برفض الحجز",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/screen-bookings"] });
      setSelectedBooking(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في رفض الحجز",
        description: error.message || "حدث خطأ أثناء رفض الحجز",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600">قيد المراجعة</Badge>;
      case "approved":
        return <Badge variant="default" className="text-green-600">مقبول</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredBookings = bookings.filter(booking => 
    statusFilter === "all" || booking.status === statusFilter
  );

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const approvedBookings = bookings.filter(b => b.status === "approved");
  const rejectedBookings = bookings.filter(b => b.status === "rejected");

  const handleApproveBooking = () => {
    if (selectedBooking) {
      approveBookingMutation.mutate({
        id: selectedBooking.id,
        adminNotes: adminNotes,
      });
    }
  };

  const handleRejectBooking = () => {
    if (selectedBooking) {
      rejectBookingMutation.mutate({
        id: selectedBooking.id,
        rejectionReason: rejectionReason,
      });
    }
  };

  const BookingDetailsDialog = ({ booking }: { booking: ScreenBookingWithRelations }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          تفاصيل طلب الحجز #{booking.id}
        </DialogTitle>
        <DialogDescription>
          مراجعة تفاصيل طلب حجز الشاشة الإعلانية
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Booking Status and Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">معلومات الحجز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>الحالة:</span>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex justify-between">
                <span>تاريخ الطلب:</span>
                <span>{format(new Date(booking.createdAt), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span>التكلفة الإجمالية:</span>
                <span className="font-semibold">{parseFloat(booking.totalPrice.toString()).toLocaleString()} ريال</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">معلومات التاجر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>اسم التاجر:</span>
                <span>{booking.merchant?.displayName || booking.merchant?.username}</span>
              </div>
              <div className="flex justify-between">
                <span>البريد الإلكتروني:</span>
                <span>{booking.merchant?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>رقم الهاتف:</span>
                <span>{booking.merchant?.phone || "غير متوفر"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location and Schedule */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                موقع الشاشة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>{booking.location?.nameAr}</strong></div>
              <div className="text-sm text-muted-foreground">{booking.location?.addressAr}</div>
              <div className="text-sm">{booking.location?.cityAr}, {booking.location?.neighborhoodAr}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                مواعيد العرض
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>تاريخ البداية:</span>
                <span>{format(new Date(booking.startDateTime), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span>تاريخ النهاية:</span>
                <span>{format(new Date(booking.endDateTime), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span>المدة:</span>
                <span>{booking.duration} ساعة</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Content */}
        {booking.mediaUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">المحتوى الإعلاني</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>نوع المحتوى:</span>
                  <span>{booking.mediaType === "image" ? "صورة" : "فيديو"}</span>
                </div>
                <div className="mt-4">
                  {booking.mediaType === "image" ? (
                    <img 
                      src={booking.mediaUrl} 
                      alt="المحتوى الإعلاني" 
                      className="max-w-md max-h-48 object-contain rounded border"
                    />
                  ) : (
                    <video 
                      src={booking.mediaUrl} 
                      controls 
                      className="max-w-md max-h-48 rounded border"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Request Notes */}
        {(booking.requestNotes || booking.requestNotesAr) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ملاحظات الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.requestNotesAr && (
                <div className="mb-2">
                  <strong>بالعربية:</strong>
                  <p className="text-sm mt-1">{booking.requestNotesAr}</p>
                </div>
              )}
              {booking.requestNotes && (
                <div>
                  <strong>بالإنجليزية:</strong>
                  <p className="text-sm mt-1">{booking.requestNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Actions for Pending Bookings */}
        {booking.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">إجراءات الإدارة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-notes">ملاحظات الإدارة (اختياري)</Label>
                <Textarea
                  id="admin-notes"
                  placeholder="أي ملاحظات أو تعليمات إضافية..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApproveBooking}
                  disabled={approveBookingMutation.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {approveBookingMutation.isPending ? "جاري القبول..." : "قبول الحجز"}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      رفض الحجز
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>رفض طلب الحجز</DialogTitle>
                      <DialogDescription>
                        يرجى توضيح سبب رفض الطلب
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rejection-reason">سبب الرفض</Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="اشرح سبب رفض طلب الحجز..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleRejectBooking}
                          disabled={rejectBookingMutation.isPending || !rejectionReason.trim()}
                          variant="destructive"
                          className="flex-1"
                        >
                          {rejectBookingMutation.isPending ? "جاري الرفض..." : "تأكيد الرفض"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Notes (for approved/rejected bookings) */}
        {(booking.adminNotes || booking.rejectionReason) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ملاحظات الإدارة</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.adminNotes && (
                <div className="mb-2">
                  <strong>ملاحظات القبول:</strong>
                  <p className="text-sm mt-1">{booking.adminNotes}</p>
                </div>
              )}
              {booking.rejectionReason && (
                <div>
                  <strong>سبب الرفض:</strong>
                  <p className="text-sm mt-1 text-red-600">{booking.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DialogContent>
  );

  if (bookingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">جاري تحميل طلبات الحجز...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة حجوزات الشاشات الإعلانية</h1>
        <p className="text-muted-foreground">
          مراجعة والموافقة على طلبات حجز الشاشات الإعلانية
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">مقبولة</p>
                <p className="text-2xl font-bold text-green-600">{approvedBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">مرفوضة</p>
                <p className="text-2xl font-bold text-red-600">{rejectedBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">طلبات الحجز</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>طلبات حجز الشاشات</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطلبات</SelectItem>
                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                    <SelectItem value="approved">مقبولة</SelectItem>
                    <SelectItem value="rejected">مرفوضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاجر</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المدة</TableHead>
                    <TableHead>التكلفة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">#{booking.id}</TableCell>
                      <TableCell>{booking.merchant?.displayName || booking.merchant?.username}</TableCell>
                      <TableCell>{booking.location?.nameAr}</TableCell>
                      <TableCell>{format(new Date(booking.startDateTime), "PP")}</TableCell>
                      <TableCell>{booking.duration} ساعة</TableCell>
                      <TableCell>{parseFloat(booking.totalPrice.toString()).toLocaleString()} ريال</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              عرض
                            </Button>
                          </DialogTrigger>
                          {selectedBooking && <BookingDetailsDialog booking={selectedBooking} />}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredBookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات حجز {statusFilter !== "all" && `بحالة "${statusFilter}"`}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الفواتير المُنشأة</CardTitle>
              <CardDescription>
                الفواتير الخاصة بالحجوزات المعتمدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>التاجر</TableHead>
                    <TableHead>تاريخ الإصدار</TableHead>
                    <TableHead>تاريخ الاستحقاق</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.merchant?.displayName || invoice.merchant?.username}</TableCell>
                      <TableCell>{format(new Date(invoice.issueDate), "PP")}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), "PP")}</TableCell>
                      <TableCell>{parseFloat(invoice.totalAmount.toString()).toLocaleString()} ريال</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "paid" ? "default" : "outline"}>
                          {invoice.status === "paid" ? "مدفوعة" : "غير مدفوعة"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {invoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد فواتير مُنشأة بعد
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}