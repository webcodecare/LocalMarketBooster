import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertBranchSchema, type Branch, type InsertBranch } from "@shared/schema";
import { z } from "zod";

const branchFormSchema = insertBranchSchema.omit({ businessId: true });
type BranchFormData = z.infer<typeof branchFormSchema>;

const saudiCities = [
  "الرياض",
  "جدة", 
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الظهران",
  "الطائف",
  "بريدة",
  "تبوك",
  "خميس مشيط",
  "حائل",
  "الجبيل",
  "الخرج",
  "الأحساء",
  "نجران",
  "ينبع",
  "أبها",
  "عرعر",
  "سكاكا",
  "جازان",
  "القطيف",
  "الباحة",
  "رابغ",
  "وادي الدواسر",
  "الرس",
  "عنيزة",
  "الزلفي",
  "المجمعة",
  "القريات",
  "صبيا",
  "الليث",
  "العلا",
  "محايل عسير",
  "بيشة",
  "الدوادمي",
  "الأفلاج",
  "القنفذة",
  "عفيف"
];

export default function BranchManagement() {
  const { toast } = useToast();
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["/api/business/branches"],
  });

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: "",
      city: "",
      address: "",
      phone: "",
      mapsLink: "",
      isActive: true,
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const res = await apiRequest("POST", "/api/business/branches", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/branches"] });
      setShowBranchForm(false);
      form.reset();
      toast({
        title: "تم إنشاء الفرع بنجاح",
        description: "تم إضافة الفرع الجديد إلى قائمة فروعك",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء الفرع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<BranchFormData> }) => {
      const res = await apiRequest("PUT", `/api/business/branches/${data.id}`, data.updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/branches"] });
      setShowBranchForm(false);
      setEditingBranch(null);
      form.reset();
      toast({
        title: "تم تحديث الفرع بنجاح",
        description: "تم حفظ التغييرات على بيانات الفرع",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث الفرع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/business/branches/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/branches"] });
      toast({
        title: "تم حذف الفرع",
        description: "تم حذف الفرع من قائمة فروعك",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف الفرع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BranchFormData) => {
    if (editingBranch) {
      updateBranchMutation.mutate({ id: editingBranch.id, updates: data });
    } else {
      createBranchMutation.mutate(data);
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      city: branch.city,
      address: branch.address || "",
      phone: branch.phone || "",
      mapsLink: branch.mapsLink || "",
      isActive: branch.isActive,
    });
    setShowBranchForm(true);
  };

  const handleAddBranch = () => {
    setEditingBranch(null);
    form.reset({
      name: "",
      city: "",
      address: "",
      phone: "",
      mapsLink: "",
      isActive: true,
    });
    setShowBranchForm(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {branches.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-store text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فروع</h3>
          <p className="text-gray-600 mb-4">ابدأ بإضافة فرعك الأول</p>
          <Button onClick={handleAddBranch} className="bg-saudi-green hover:bg-green-800">
            إضافة فرع جديد
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-reverse space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {branch.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <i className="fas fa-map-marker-alt text-gray-400"></i>
                        <span>{branch.city}</span>
                      </div>
                      {branch.address && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fas fa-home text-gray-400"></i>
                          <span>{branch.address}</span>
                        </div>
                      )}
                      {branch.phone && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fas fa-phone text-gray-400"></i>
                          <span>{branch.phone}</span>
                        </div>
                      )}
                      {branch.mapsLink && (
                        <div className="flex items-center space-x-reverse space-x-2">
                          <i className="fas fa-external-link-alt text-gray-400"></i>
                          <a 
                            href={branch.mapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            عرض على الخريطة
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBranch(branch)}
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
                            هل أنت متأكد من حذف هذا الفرع؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteBranchMutation.mutate(branch.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button 
            onClick={handleAddBranch} 
            variant="outline" 
            className="w-full border-dashed border-2 h-16"
          >
            <i className="fas fa-plus ml-2"></i>
            إضافة فرع جديد
          </Button>
        </div>
      )}

      <Dialog open={showBranchForm} onOpenChange={setShowBranchForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "تعديل الفرع" : "إضافة فرع جديد"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الفرع *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="الفرع الرئيسي" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدينة *</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">اختر المدينة</option>
                        {saudiCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="شارع الملك فهد، حي العليا"
                        rows={3}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="966501234567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mapsLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الخريطة (اختياري)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://maps.google.com/..."
                        type="url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowBranchForm(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="bg-saudi-green hover:bg-green-800"
                  disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
                >
                  {createBranchMutation.isPending || updateBranchMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      {editingBranch ? "جاري التحديث..." : "جاري الإنشاء..."}
                    </>
                  ) : (
                    editingBranch ? "تحديث الفرع" : "إنشاء الفرع"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}