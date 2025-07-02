import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CmsPage {
  id: number;
  title: string;
  titleAr: string;
  slug: string;
  content: string;
  contentAr: string;
  metaTitle?: string;
  metaTitleAr?: string;
  metaDescription?: string;
  metaDescriptionAr?: string;
  isPublished: boolean;
  isVisible: boolean;
  showInFooter: boolean;
  showInHeader: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminCmsPages() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);

  const { data: pages, isLoading } = useQuery<CmsPage[]>({
    queryKey: ["/api/admin/cms-pages"],
  });

  const createPageMutation = useMutation({
    mutationFn: async (pageData: Partial<CmsPage>) => {
      const response = await apiRequest("POST", "/api/admin/cms-pages", pageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء الصفحة بنجاح",
        description: "تم إضافة الصفحة الجديدة إلى النظام",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء الصفحة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, ...pageData }: Partial<CmsPage> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/cms-pages/${id}`, pageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      setIsEditDialogOpen(false);
      setEditingPage(null);
      toast({
        title: "تم تحديث الصفحة بنجاح",
        description: "تم حفظ التغييرات على الصفحة",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث الصفحة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/cms-pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      toast({
        title: "تم حذف الصفحة بنجاح",
        description: "تم حذف الصفحة من النظام",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف الصفحة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/cms-pages/${id}`, { isVisible });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      toast({
        title: "تم تحديث حالة الرؤية",
        description: "تم تغيير حالة عرض الصفحة",
      });
    },
  });

  const PageForm = ({ page, onSubmit, isLoading }: { 
    page?: CmsPage; 
    onSubmit: (data: Partial<CmsPage>) => void; 
    isLoading: boolean;
  }) => {
    const [formData, setFormData] = useState({
      title: page?.title || "",
      titleAr: page?.titleAr || "",
      slug: page?.slug || "",
      content: page?.content || "",
      contentAr: page?.contentAr || "",
      metaTitle: page?.metaTitle || "",
      metaTitleAr: page?.metaTitleAr || "",
      metaDescription: page?.metaDescription || "",
      metaDescriptionAr: page?.metaDescriptionAr || "",
      isPublished: page?.isPublished ?? true,
      isVisible: page?.isVisible ?? true,
      showInFooter: page?.showInFooter ?? false,
      showInHeader: page?.showInHeader ?? false,
      sortOrder: page?.sortOrder || 0,
    });

    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">العنوان (إنجليزي)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (!page) {
                  setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                }
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="titleAr">العنوان (عربي)</Label>
            <Input
              id="titleAr"
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">رابط الصفحة (Slug)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="about-us"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="content">المحتوى (إنجليزي)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentAr">المحتوى (عربي)</Label>
            <Textarea
              id="contentAr"
              value={formData.contentAr}
              onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
              rows={8}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">عنوان SEO (إنجليزي)</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaTitleAr">عنوان SEO (عربي)</Label>
            <Input
              id="metaTitleAr"
              value={formData.metaTitleAr}
              onChange={(e) => setFormData({ ...formData, metaTitleAr: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="metaDescription">وصف SEO (إنجليزي)</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescriptionAr">وصف SEO (عربي)</Label>
            <Textarea
              id="metaDescriptionAr"
              value={formData.metaDescriptionAr}
              onChange={(e) => setFormData({ ...formData, metaDescriptionAr: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
            />
            <Label>منشورة</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isVisible}
              onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
            />
            <Label>مرئية في القوائم</Label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.showInFooter}
              onCheckedChange={(checked) => setFormData({ ...formData, showInFooter: checked })}
            />
            <Label>عرض في الفوتر</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.showInHeader}
              onCheckedChange={(checked) => setFormData({ ...formData, showInHeader: checked })}
            />
            <Label>عرض في الهيدر</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">ترتيب العرض</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "جاري الحفظ..." : page ? "تحديث الصفحة" : "إنشاء الصفحة"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الصفحات الثابتة</h1>
            <p className="text-gray-600 mt-1">إنشاء وتحرير صفحات المحتوى الثابت</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة صفحة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء صفحة جديدة</DialogTitle>
              </DialogHeader>
              <PageForm
                onSubmit={(data) => createPageMutation.mutate(data)}
                isLoading={createPageMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">جاري تحميل الصفحات...</div>
        ) : (
          <div className="grid gap-4">
            {pages?.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {page.titleAr}
                        {!page.isVisible && (
                          <Badge variant="secondary">مخفية</Badge>
                        )}
                        {!page.isPublished && (
                          <Badge variant="outline">غير منشورة</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        /{page.slug} • آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-SA')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibilityMutation.mutate({ 
                          id: page.id, 
                          isVisible: !page.isVisible 
                        })}
                      >
                        {page.isVisible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Dialog open={isEditDialogOpen && editingPage?.id === page.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPage(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>تحرير الصفحة</DialogTitle>
                          </DialogHeader>
                          <PageForm
                            page={editingPage || undefined}
                            onSubmit={(data) => updatePageMutation.mutate({ id: page.id, ...data })}
                            isLoading={updatePageMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل تريد حذف هذه الصفحة؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف الصفحة "{page.titleAr}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePageMutation.mutate(page.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف نهائياً
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">المحتوى العربي:</p>
                      <p className="text-gray-600 line-clamp-3">{page.contentAr}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">المحتوى الإنجليزي:</p>
                      <p className="text-gray-600 line-clamp-3">{page.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {page.showInHeader && <Badge variant="secondary">في الهيدر</Badge>}
                    {page.showInFooter && <Badge variant="secondary">في الفوتر</Badge>}
                    <Badge variant="outline">ترتيب: {page.sortOrder}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}