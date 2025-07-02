import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Plus, Edit, Trash2, Users, TrendingUp, DollarSign, Link, Copy, Eye } from 'lucide-react';
import type { Marketer } from '@shared/schema';

const marketerSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل'),
  email: z.string().email('يجب إدخال بريد إلكتروني صحيح'),
  phone: z.string().optional(),
  referralCode: z.string().min(3, 'يجب أن يكون الكود 3 أحرف على الأقل').max(20, 'يجب أن يكون الكود 20 حرف كحد أقصى'),
  commissionRate: z.number().min(0, 'يجب أن تكون النسبة أكبر من أو تساوي 0').max(100, 'يجب أن تكون النسبة أقل من أو تساوي 100'),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

type MarketerForm = z.infer<typeof marketerSchema>;

interface MarketerWithStats extends Marketer {
  referralCount: number;
  conversionCount: number;
  conversionRate: number;
  totalEarnings: number;
  lastReferral?: string;
}

interface ReferralStats {
  totalMarketers: number;
  activeMarketers: number;
  totalReferrals: number;
  totalEarnings: number;
}

export default function AffiliateManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMarketer, setEditingMarketer] = useState<MarketerWithStats | null>(null);
  const [viewingMarketer, setViewingMarketer] = useState<MarketerWithStats | null>(null);

  const { data: marketers, isLoading } = useQuery<MarketerWithStats[]>({
    queryKey: ['/api/admin/marketers'],
  });

  const { data: stats } = useQuery<ReferralStats>({
    queryKey: ['/api/admin/marketers/stats'],
  });

  const form = useForm<MarketerForm>({
    resolver: zodResolver(marketerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      referralCode: '',
      commissionRate: 0,
      isActive: true,
      notes: '',
    },
  });

  const createMarketerMutation = useMutation({
    mutationFn: async (data: MarketerForm) => {
      const response = await apiRequest('POST', '/api/admin/marketers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketers/stats'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: 'تم الإنشاء بنجاح',
        description: 'تم إنشاء حساب المسوق بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الإنشاء',
        description: error.message || 'حدث خطأ أثناء إنشاء حساب المسوق',
        variant: 'destructive',
      });
    },
  });

  const updateMarketerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MarketerForm> }) => {
      const response = await apiRequest('PUT', `/api/admin/marketers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketers/stats'] });
      setDialogOpen(false);
      setEditingMarketer(null);
      form.reset();
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحديث بيانات المسوق بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في التحديث',
        description: error.message || 'حدث خطأ أثناء تحديث بيانات المسوق',
        variant: 'destructive',
      });
    },
  });

  const deleteMarketerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/marketers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/marketers/stats'] });
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف حساب المسوق بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في الحذف',
        description: error.message || 'حدث خطأ أثناء حذف حساب المسوق',
        variant: 'destructive',
      });
    },
  });

  const toggleMarketerStatus = async (id: number, isActive: boolean) => {
    updateMarketerMutation.mutate({ id, data: { isActive } });
  };

  const generateReferralCode = () => {
    const code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    form.setValue('referralCode', code);
  };

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ رابط الإحالة إلى الحافظة',
    });
  };

  const openCreateDialog = () => {
    setEditingMarketer(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEditDialog = (marketer: MarketerWithStats) => {
    setEditingMarketer(marketer);
    form.reset({
      name: marketer.name,
      email: marketer.email,
      phone: marketer.phone || '',
      referralCode: marketer.referralCode,
      commissionRate: Number(marketer.commissionRate),
      isActive: marketer.isActive,
      notes: marketer.notes || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: MarketerForm) => {
    if (editingMarketer) {
      updateMarketerMutation.mutate({ id: editingMarketer.id, data });
    } else {
      createMarketerMutation.mutate(data);
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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المسوقين والإحالات</h1>
          <p className="text-gray-600">إدارة المسوقين وتتبع أداء الإحالات</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة مسوق جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المسوقين</p>
                <p className="text-2xl font-bold">{stats?.totalMarketers || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">المسوقين النشطين</p>
                <p className="text-2xl font-bold text-green-600">{stats?.activeMarketers || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">إجمالي الإحالات</p>
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Link className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الأرباح</p>
                <p className="text-2xl font-bold">{(stats?.totalEarnings || 0).toFixed(2)} ر.س</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Marketers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المسوقين</CardTitle>
          <CardDescription>إدارة حسابات المسوقين ومتابعة أدائهم</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المسوق</TableHead>
                <TableHead>كود الإحالة</TableHead>
                <TableHead>نسبة العمولة</TableHead>
                <TableHead>الإحالات</TableHead>
                <TableHead>الأرباح</TableHead>
                <TableHead>آخر إحالة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketers?.map((marketer) => (
                <TableRow key={marketer.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{marketer.name}</p>
                      <p className="text-sm text-gray-500">{marketer.email}</p>
                      {marketer.phone && (
                        <p className="text-sm text-gray-500">{marketer.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {marketer.referralCode}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyReferralLink(marketer.referralCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {marketer.commissionRate}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{marketer.referralCount}</p>
                      <p className="text-sm text-gray-500">
                        {marketer.conversionCount} تحويل ({marketer.conversionRate.toFixed(1)}%)
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{marketer.totalEarnings.toFixed(2)} ر.س</p>
                  </TableCell>
                  <TableCell>
                    {marketer.lastReferral ? (
                      <p className="text-sm">
                        {format(new Date(marketer.lastReferral), 'dd/MM/yyyy', { locale: ar })}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">لا توجد إحالات</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={marketer.isActive}
                        onCheckedChange={(checked) => toggleMarketerStatus(marketer.id, checked)}
                      />
                      <Badge variant={marketer.isActive ? 'default' : 'secondary'}>
                        {marketer.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingMarketer(marketer)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(marketer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMarketerMutation.mutate(marketer.id)}
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
              {editingMarketer ? 'تعديل بيانات المسوق' : 'إضافة مسوق جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingMarketer 
                ? 'قم بتعديل بيانات المسوق'
                : 'أضف مسوق جديد لتتبع الإحالات'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المسوق</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="أحمد محمد" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="ahmed@example.com" />
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
                      <Input {...field} placeholder="+966xxxxxxxxx" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كود الإحالة</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="REF123" className="font-mono" />
                      </FormControl>
                      <Button type="button" onClick={generateReferralCode} variant="outline">
                        توليد
                      </Button>
                    </div>
                    <FormDescription>
                      كود فريد للمسوق لتتبع الإحالات
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة العمولة (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      النسبة المئوية للعمولة على كل إحالة ناجحة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="ملاحظات حول المسوق..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">تفعيل الحساب</FormLabel>
                      <FormDescription>
                        هل تريد تفعيل حساب المسوق فوراً؟
                      </FormDescription>
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
                <Button type="submit" disabled={createMarketerMutation.isPending || updateMarketerMutation.isPending}>
                  {editingMarketer ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Marketer Details Dialog */}
      {viewingMarketer && (
        <Dialog open={!!viewingMarketer} onOpenChange={() => setViewingMarketer(null)}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>تفاصيل المسوق - {viewingMarketer.name}</DialogTitle>
              <DialogDescription>
                معلومات مفصلة حول أداء المسوق
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <p className="text-sm text-gray-600">{viewingMarketer.email}</p>
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <p className="text-sm text-gray-600">{viewingMarketer.phone || 'غير محدد'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>كود الإحالة</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {viewingMarketer.referralCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyReferralLink(viewingMarketer.referralCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>نسبة العمولة</Label>
                  <p className="text-sm text-gray-600">{viewingMarketer.commissionRate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{viewingMarketer.referralCount}</p>
                    <p className="text-sm text-gray-600">إجمالي الإحالات</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{viewingMarketer.conversionCount}</p>
                    <p className="text-sm text-gray-600">التحويلات</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{viewingMarketer.totalEarnings.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">الأرباح (ر.س)</p>
                  </div>
                </Card>
              </div>

              {viewingMarketer.notes && (
                <div>
                  <Label>ملاحظات</Label>
                  <p className="text-sm text-gray-600 mt-1">{viewingMarketer.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>رابط الإحالة</Label>
                  <p className="text-xs text-gray-500 font-mono break-all">
                    {window.location.origin}/register?ref={viewingMarketer.referralCode}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyReferralLink(viewingMarketer.referralCode)}
                >
                  نسخ
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingMarketer(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}