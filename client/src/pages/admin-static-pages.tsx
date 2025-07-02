import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/back-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Globe, 
  FileText, 
  Settings,
  ExternalLink,
  Search,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface StaticPage {
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
  ogImage?: string;
  isPublished: boolean;
  showInFooter: boolean;
  showInHeader: boolean;
  sortOrder: number;
  pageType: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export default function AdminStaticPages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageData, setNewPageData] = useState<Partial<StaticPage>>({
    title: "",
    titleAr: "",
    slug: "",
    content: "",
    contentAr: "",
    metaTitle: "",
    metaTitleAr: "",
    metaDescription: "",
    metaDescriptionAr: "",
    ogImage: "",
    isPublished: true,
    showInFooter: false,
    showInHeader: false,
    sortOrder: 0,
    pageType: "custom"
  });

  const { data: pages, isLoading } = useQuery<StaticPage[]>({
    queryKey: ["/api/admin/static-pages"],
  });

  const createPageMutation = useMutation({
    mutationFn: async (pageData: Partial<StaticPage>) => {
      const res = await apiRequest("POST", "/api/admin/static-pages", pageData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الصفحة",
        description: "تم إنشاء الصفحة الجديدة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/static-pages"] });
      setIsCreateDialogOpen(false);
      setNewPageData({
        title: "",
        titleAr: "",
        slug: "",
        content: "",
        contentAr: "",
        metaTitle: "",
        metaTitleAr: "",
        metaDescription: "",
        metaDescriptionAr: "",
        ogImage: "",
        isPublished: true,
        showInFooter: false,
        showInHeader: false,
        sortOrder: 0,
        pageType: "custom"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الإنشاء",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<StaticPage> }) => {
      const res = await apiRequest("PUT", `/api/admin/static-pages/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الصفحة",
        description: "تم حفظ التغييرات بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/static-pages"] });
      setEditingPage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/static-pages/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الصفحة",
        description: "تم حذف الصفحة نهائياً",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/static-pages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePage = () => {
    createPageMutation.mutate(newPageData);
  };

  const handleEditPage = (page: StaticPage) => {
    setEditingPage({ ...page });
  };

  const handleSaveEdit = () => {
    if (editingPage) {
      updatePageMutation.mutate({
        id: editingPage.id,
        data: editingPage
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getPageTypeLabel = (type: string) => {
    switch (type) {
      case 'about': return 'من نحن';
      case 'contact': return 'تواصل معنا';
      case 'terms': return 'شروط الخدمة';
      case 'privacy': return 'سياسة الخصوصية';
      default: return 'صفحة مخصصة';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <BackButton />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackButton />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة الصفحات الثابتة</h1>
          <p className="text-muted-foreground mt-2">
            إدارة صفحات الموقع مع إعدادات SEO كاملة
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء صفحة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء صفحة جديدة</DialogTitle>
              <DialogDescription>إنشاء صفحة ثابتة جديدة مع إعدادات SEO</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">المحتوى</TabsTrigger>
                <TabsTrigger value="seo">إعدادات SEO</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">العنوان (إنجليزي)</Label>
                    <Input
                      id="title"
                      value={newPageData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setNewPageData({
                          ...newPageData,
                          title,
                          slug: generateSlug(title)
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleAr">العنوان (عربي)</Label>
                    <Input
                      id="titleAr"
                      value={newPageData.titleAr}
                      onChange={(e) => setNewPageData({...newPageData, titleAr: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="slug">الرابط (Slug)</Label>
                  <Input
                    id="slug"
                    value={newPageData.slug}
                    onChange={(e) => setNewPageData({...newPageData, slug: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">المحتوى (إنجليزي)</Label>
                  <Textarea
                    id="content"
                    value={newPageData.content}
                    onChange={(e) => setNewPageData({...newPageData, content: e.target.value})}
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contentAr">المحتوى (عربي)</Label>
                  <Textarea
                    id="contentAr"
                    value={newPageData.contentAr}
                    onChange={(e) => setNewPageData({...newPageData, contentAr: e.target.value})}
                    rows={6}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="seo" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title (إنجليزي)</Label>
                    <Input
                      id="metaTitle"
                      value={newPageData.metaTitle}
                      onChange={(e) => setNewPageData({...newPageData, metaTitle: e.target.value})}
                      placeholder="عنوان الصفحة في محركات البحث"
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaTitleAr">Meta Title (عربي)</Label>
                    <Input
                      id="metaTitleAr"
                      value={newPageData.metaTitleAr}
                      onChange={(e) => setNewPageData({...newPageData, metaTitleAr: e.target.value})}
                      placeholder="عنوان الصفحة في محركات البحث"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metaDescription">Meta Description (إنجليزي)</Label>
                    <Textarea
                      id="metaDescription"
                      value={newPageData.metaDescription}
                      onChange={(e) => setNewPageData({...newPageData, metaDescription: e.target.value})}
                      placeholder="وصف الصفحة في محركات البحث"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescriptionAr">Meta Description (عربي)</Label>
                    <Textarea
                      id="metaDescriptionAr"
                      value={newPageData.metaDescriptionAr}
                      onChange={(e) => setNewPageData({...newPageData, metaDescriptionAr: e.target.value})}
                      placeholder="وصف الصفحة في محركات البحث"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ogImage">صورة Open Graph</Label>
                  <Input
                    id="ogImage"
                    value={newPageData.ogImage}
                    onChange={(e) => setNewPageData({...newPageData, ogImage: e.target.value})}
                    placeholder="رابط الصورة للمشاركة على وسائل التواصل"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortOrder">ترتيب العرض</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={newPageData.sortOrder}
                      onChange={(e) => setNewPageData({...newPageData, sortOrder: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pageType">نوع الصفحة</Label>
                    <select
                      id="pageType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newPageData.pageType}
                      onChange={(e) => setNewPageData({...newPageData, pageType: e.target.value})}
                    >
                      <option value="custom">صفحة مخصصة</option>
                      <option value="about">من نحن</option>
                      <option value="contact">تواصل معنا</option>
                      <option value="terms">شروط الخدمة</option>
                      <option value="privacy">سياسة الخصوصية</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublished"
                      checked={newPageData.isPublished}
                      onCheckedChange={(checked) => setNewPageData({...newPageData, isPublished: checked})}
                    />
                    <Label htmlFor="isPublished">منشورة</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showInFooter"
                      checked={newPageData.showInFooter}
                      onCheckedChange={(checked) => setNewPageData({...newPageData, showInFooter: checked})}
                    />
                    <Label htmlFor="showInFooter">عرض في التذييل</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showInHeader"
                      checked={newPageData.showInHeader}
                      onCheckedChange={(checked) => setNewPageData({...newPageData, showInHeader: checked})}
                    />
                    <Label htmlFor="showInHeader">عرض في الرأس</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
                إنشاء الصفحة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages List */}
      <div className="grid gap-4">
        {pages?.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{page.titleAr}</h3>
                    <Badge variant="outline">{getPageTypeLabel(page.pageType)}</Badge>
                    {page.isPublished ? (
                      <Badge variant="default" className="bg-green-600">منشور</Badge>
                    ) : (
                      <Badge variant="secondary">مسودة</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{page.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{page.contentAr.substring(0, 200)}...</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>الرابط: /{page.slug}</span>
                    <span>آخر تحديث: {format(new Date(page.updatedAt), 'dd/MM/yyyy', { locale: ar })}</span>
                    {page.showInFooter && <span>في التذييل</span>}
                    {page.showInHeader && <span>في الرأس</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedPage(page)}>
                        <Eye className="h-4 w-4 mr-2" />
                        عرض
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedPage?.titleAr}</DialogTitle>
                        <DialogDescription>معاينة محتوى الصفحة</DialogDescription>
                      </DialogHeader>
                      {selectedPage && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>النوع:</strong> {getPageTypeLabel(selectedPage.pageType)}</div>
                            <div><strong>الحالة:</strong> {selectedPage.isPublished ? 'منشور' : 'مسودة'}</div>
                            <div><strong>الرابط:</strong> /{selectedPage.slug}</div>
                            <div><strong>الترتيب:</strong> {selectedPage.sortOrder}</div>
                          </div>
                          
                          {selectedPage.metaTitle && (
                            <div>
                              <strong>Meta Title:</strong>
                              <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{selectedPage.metaTitle}</p>
                            </div>
                          )}
                          
                          {selectedPage.metaDescription && (
                            <div>
                              <strong>Meta Description:</strong>
                              <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{selectedPage.metaDescription}</p>
                            </div>
                          )}
                          
                          <div>
                            <strong>المحتوى:</strong>
                            <div className="mt-1 text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap">
                              {selectedPage.contentAr}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => handleEditPage(page)}>
                    <Edit className="h-4 w-4 mr-2" />
                    تعديل
                  </Button>

                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deletePageMutation.mutate(page.id)}
                    disabled={deletePageMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف
                  </Button>
                  
                  {page.isPublished && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        زيارة
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Page Dialog */}
      {editingPage && (
        <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل الصفحة</DialogTitle>
              <DialogDescription>تحديث محتوى وإعدادات الصفحة</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">المحتوى</TabsTrigger>
                <TabsTrigger value="seo">إعدادات SEO</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editTitle">العنوان (إنجليزي)</Label>
                    <Input
                      id="editTitle"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editTitleAr">العنوان (عربي)</Label>
                    <Input
                      id="editTitleAr"
                      value={editingPage.titleAr}
                      onChange={(e) => setEditingPage({...editingPage, titleAr: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editSlug">الرابط (Slug)</Label>
                  <Input
                    id="editSlug"
                    value={editingPage.slug}
                    onChange={(e) => setEditingPage({...editingPage, slug: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="editContent">المحتوى (إنجليزي)</Label>
                  <Textarea
                    id="editContent"
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="editContentAr">المحتوى (عربي)</Label>
                  <Textarea
                    id="editContentAr"
                    value={editingPage.contentAr}
                    onChange={(e) => setEditingPage({...editingPage, contentAr: e.target.value})}
                    rows={6}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="seo" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editMetaTitle">Meta Title (إنجليزي)</Label>
                    <Input
                      id="editMetaTitle"
                      value={editingPage.metaTitle || ""}
                      onChange={(e) => setEditingPage({...editingPage, metaTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMetaTitleAr">Meta Title (عربي)</Label>
                    <Input
                      id="editMetaTitleAr"
                      value={editingPage.metaTitleAr || ""}
                      onChange={(e) => setEditingPage({...editingPage, metaTitleAr: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editMetaDescription">Meta Description (إنجليزي)</Label>
                    <Textarea
                      id="editMetaDescription"
                      value={editingPage.metaDescription || ""}
                      onChange={(e) => setEditingPage({...editingPage, metaDescription: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMetaDescriptionAr">Meta Description (عربي)</Label>
                    <Textarea
                      id="editMetaDescriptionAr"
                      value={editingPage.metaDescriptionAr || ""}
                      onChange={(e) => setEditingPage({...editingPage, metaDescriptionAr: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editOgImage">صورة Open Graph</Label>
                  <Input
                    id="editOgImage"
                    value={editingPage.ogImage || ""}
                    onChange={(e) => setEditingPage({...editingPage, ogImage: e.target.value})}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="editIsPublished"
                      checked={editingPage.isPublished}
                      onCheckedChange={(checked) => setEditingPage({...editingPage, isPublished: checked})}
                    />
                    <Label htmlFor="editIsPublished">منشورة</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="editShowInFooter"
                      checked={editingPage.showInFooter}
                      onCheckedChange={(checked) => setEditingPage({...editingPage, showInFooter: checked})}
                    />
                    <Label htmlFor="editShowInFooter">عرض في التذييل</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="editShowInHeader"
                      checked={editingPage.showInHeader}
                      onCheckedChange={(checked) => setEditingPage({...editingPage, showInHeader: checked})}
                    />
                    <Label htmlFor="editShowInHeader">عرض في الرأس</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPage(null)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveEdit} disabled={updatePageMutation.isPending}>
                حفظ التغييرات
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {pages?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">لا توجد صفحات</h3>
              <p>لم يتم إنشاء أي صفحات ثابتة بعد</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}