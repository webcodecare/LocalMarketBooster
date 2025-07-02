import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Star, GripVertical, Check, X, Clock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Testimonial, InsertTestimonial } from "@shared/schema";

const testimonialSchema = z.object({
  clientName: z.string().min(1, "اسم العميل مطلوب"),
  jobTitle: z.string().min(1, "المسمى الوظيفي مطلوب"),
  reviewText: z.string().min(10, "نص المراجعة يجب أن يكون 10 أحرف على الأقل"),
  rating: z.number().min(1).max(5),
  clientAvatar: z.string().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export default function AdminTestimonials() {
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await fetch(`/api/admin/testimonials${params}`);
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      const response = await apiRequest("POST", "/api/admin/testimonials", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setIsDialogOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الشهادة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الشهادة",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TestimonialFormData> }) => {
      const response = await apiRequest("PUT", `/api/admin/testimonials/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setIsDialogOpen(false);
      setEditingTestimonial(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الشهادة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الشهادة",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/testimonials/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف الشهادة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الشهادة",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/admin/testimonials/${id}/approve`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "تم الموافقة",
        description: "تم الموافقة على الشهادة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في الموافقة على الشهادة",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/admin/testimonials/${id}/reject`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "تم الرفض",
        description: "تم رفض الشهادة",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في رفض الشهادة",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/admin/testimonials/${id}/toggle-visibility`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "تم التحديث",
        description: "تم تغيير حالة الرؤية بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تغيير حالة الرؤية",
        variant: "destructive",
      });
    },
  });

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: "",
      jobTitle: "",
      reviewText: "",
      rating: 5,
      clientAvatar: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const onSubmit = (data: TestimonialFormData) => {
    if (editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.reset({
      clientName: testimonial.clientName,
      jobTitle: testimonial.jobTitle,
      reviewText: testimonial.reviewText,
      rating: testimonial.rating,
      clientAvatar: testimonial.clientAvatar || "",
      displayOrder: testimonial.displayOrder,
      isActive: testimonial.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشهادة؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewTestimonial = () => {
    setEditingTestimonial(null);
    form.reset({
      clientName: "",
      jobTitle: "",
      reviewText: "",
      rating: 5,
      clientAvatar: "",
      displayOrder: testimonials.length,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الشهادات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة شهادات العملاء المعروضة في الصفحة الرئيسية
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="فلترة حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الشهادات</SelectItem>
              <SelectItem value="pending">في انتظار الموافقة</SelectItem>
              <SelectItem value="approved">موافق عليها</SelectItem>
              <SelectItem value="rejected">مرفوضة</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewTestimonial}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة شهادة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "تعديل الشهادة" : "إضافة شهادة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العميل</FormLabel>
                        <FormControl>
                          <Input placeholder="أحمد محمد" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المسمى الوظيفي</FormLabel>
                        <FormControl>
                          <Input placeholder="مدير التسويق" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reviewText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نص الشهادة</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="نص الشهادة أو المراجعة..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التقييم</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التقييم" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} نجوم
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ترتيب العرض</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>نشط</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clientAvatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة الشخصية (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-reverse space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingTestimonial ? "تحديث" : "إضافة"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-reverse space-x-3">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <div>
                    <CardTitle className="text-lg">{testimonial.clientName}</CardTitle>
                    <CardDescription>{testimonial.jobTitle}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-reverse space-x-2">
                  <Badge 
                    variant={
                      testimonial.status === "approved" ? "default" :
                      testimonial.status === "rejected" ? "destructive" : "secondary"
                    }
                  >
                    {testimonial.status === "approved" ? "موافق عليها" :
                     testimonial.status === "rejected" ? "مرفوضة" : "في الانتظار"}
                  </Badge>
                  <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                    {testimonial.isActive ? "مرئية" : "مخفية"}
                  </Badge>
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                  
                  {testimonial.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => approveMutation.mutate(testimonial.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => rejectMutation.mutate(testimonial.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {testimonial.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibilityMutation.mutate(testimonial.id)}
                      disabled={toggleVisibilityMutation.isPending}
                    >
                      {testimonial.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{testimonial.reviewText}"
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                ترتيب العرض: {testimonial.displayOrder}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {testimonials.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد شهادات</h3>
              <p className="text-gray-600 text-center mb-4">
                لم يتم إضافة أي شهادات بعد. ابدأ بإضافة شهادة العميل الأولى.
              </p>
              <Button onClick={handleNewTestimonial}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة أول شهادة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}