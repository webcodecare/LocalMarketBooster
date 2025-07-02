import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Plus, Edit, Trash2, Eye, Calendar, Percent, DollarSign, Users, TrendingUp } from 'lucide-react';
import type { DiscountCode } from '@shared/schema';

const discountCodeSchema = z.object({
  code: z.string().min(3, 'يجب أن يكون الكود 3 أحرف على الأقل').max(20, 'يجب أن يكون الكود 20 حرف كحد أقصى'),
  description: z.string().optional(),
  discountType: z.enum(['fixed', 'percentage'], { required_error: 'يجب اختيار نوع الخصم' }),
  discountValue: z.number().min(0.01, 'يجب أن تكون قيمة الخصم أكبر من 0'),
  minimumOrderValue: z.number().min(0, 'يجب أن تكون أكبر من أو تساوي 0').default(0),
  maxUses: z.number().nullable().optional(),
  startDate: z.string().min(1, 'يجب تحديد تاريخ البداية'),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DiscountCodeForm = z.infer<typeof discountCodeSchema>;

interface DiscountCodeWithStats extends DiscountCode {
  usageCount: number;
  totalSavings: number;
  createdBy: { businessName: string; username: string };
}

export default function DiscountCodesManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeWithStats | null>(null);

  const { data: discountCodes, isLoading } = useQuery<DiscountCodeWithStats[]>({
    queryKey: ['/api/admin/discount-codes'],
  });

  const form = useForm<DiscountCodeForm>({
    resolver: zodResolver(discountCodeSchema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumOrderValue: 0,
      maxUses: undefined,
      startDate: '',
      endDate: '',
      isActive: true,
    },
  });

  const createCodeMutation = useMutation({
    mutationFn: async (data: DiscountCodeForm) => {
      const response = await apiRequest('POST', '/api/admin/discount-codes', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: 'تم الإنشاء بنجاح',
        description: 'تم إنشاء كود الخصم بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الإنشاء',
        description: error.message || 'حدث خطأ أثناء إنشاء كود الخصم',
        variant: 'destructive',
      });
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DiscountCodeForm> }) => {
      const response = await apiRequest('PUT', `/api/admin/discount-codes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      setDialogOpen(false);
      setEditingCode(null);
      form.reset();
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحديث كود الخصم بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في التحديث',
        description: error.message || 'حدث خطأ أثناء تحديث كود الخصم',
        variant: 'destructive',
      });
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/discount-codes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/discount-codes'] });
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف كود الخصم بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الحذف',
        description: error.message || 'حدث خطأ أثناء حذف كود الخصم',
        variant: 'destructive',
      });
    },
  });

  const toggleCodeStatus = async (id: number, isActive: boolean) => {
    updateCodeMutation.mutate({ id, data: { isActive } });
  };

  const openCreateDialog = () => {
    setEditingCode(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEditDialog = (code: DiscountCodeWithStats) => {
    setEditingCode(code);
    form.reset({
      code: code.code,
      description: code.description || '',
      discountType: code.discountType as 'fixed' | 'percentage',
      discountValue: Number(code.discountValue),
      minimumOrderValue: Number(code.minimumOrderValue),
      maxUses: code.maxUses || undefined,
      startDate: code.startDate.split('T')[0],
      endDate: code.endDate ? code.endDate.split('T')[0] : '',
      isActive: code.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: DiscountCodeForm) => {
    if (editingCode) {
      updateCodeMutation.mutate({ id: editingCode.id, data });
    } else {
      createCodeMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalCodes = discountCodes?.length || 0;
  const activeCodes = discountCodes?.filter(code => code.isActive).length || 0;
  const totalUsage = discountCodes?.reduce((sum, code) => sum + code.usageCount, 0) || 0;
  const totalSavings = discountCodes?.reduce((sum, code) => sum + code.totalSavings, 0) || 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة أكواد الخصم</h1>
          <p className="text-gray-600">إنشاء وإدارة أكواد الخصم والعروض الترويجية</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          إنشاء كود خصم جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الأكواد</p>
                <p className="text-2xl font-bold">{totalCodes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الأكواد النشطة</p>
                <p className="text-2xl font-bold text-green-600">{activeCodes}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الاستخدامات</p>
                <p className="text-2xl font-bold">{totalUsage}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الوفورات</p>
                <p className="text-2xl font-bold">{totalSavings.toFixed(2)} ر.س</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Percent className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>أكواد الخصم</CardTitle>
          <CardDescription>قائمة بجميع أكواد الخصم المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>القيمة</TableHead>
                <TableHead>الحد الأدنى</TableHead>
                <TableHead>الاستخدامات</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes?.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>
                    <div>
                      <p className="font-mono font-bold">{code.code}</p>
                      <p className="text-sm text-gray-500">{code.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={code.discountType === 'percentage' ? 'default' : 'secondary'}>
                      {code.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {code.discountType === 'percentage' ? (
                        <>
                          <Percent className="w-4 h-4" />
                          {code.discountValue}%
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" />
                          {code.discountValue} ر.س
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{code.minimumOrderValue} ر.س</TableCell>
                  <TableCell>
                    <div>
                      <p>{code.usageCount} / {code.maxUses || '∞'}</p>
                      <p className="text-sm text-gray-500">{code.totalSavings.toFixed(2)} ر.س وفورات</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(code.startDate), 'dd/MM/yyyy', { locale: ar })}</p>
                      {code.endDate && (
                        <p className="text-gray-500">حتى {format(new Date(code.endDate), 'dd/MM/yyyy', { locale: ar })}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={code.isActive}
                        onCheckedChange={(checked) => toggleCodeStatus(code.id, checked)}
                      />
                      <Badge variant={code.isActive ? 'default' : 'secondary'}>
                        {code.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(code)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCodeMutation.mutate(code.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingCode ? 'تعديل كود الخصم' : 'إنشاء كود خصم جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingCode 
                ? 'قم بتعديل تفاصيل كود الخصم'
                : 'أضف كود خصم جديد للعملاء'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كود الخصم</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SAVE20" className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="وصف الكود..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الخصم</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الخصم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">نسبة مئوية</SelectItem>
                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      قيمة الخصم 
                      {form.watch('discountType') === 'percentage' ? ' (%)' : ' (ر.س)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحد الأدنى للطلب (ر.س)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحد الأقصى للاستخدامات (اتركه فارغاً للاستخدام اللانهائي)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ البداية</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الانتهاء (اختياري)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">تفعيل الكود</FormLabel>
                      <p className="text-sm text-gray-500">
                        هل تريد تفعيل كود الخصم فوراً؟
                      </p>
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createCodeMutation.isPending || updateCodeMutation.isPending}>
                  {editingCode ? 'تحديث' : 'إنشاء'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}