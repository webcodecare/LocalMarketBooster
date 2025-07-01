import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText, 
  Globe,
  Settings,
  ExternalLink,
  Search,
  Calendar
} from "lucide-react";

const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleAr: z.string().min(1, "Arabic title is required"),
  slug: z.string().min(1, "URL slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Content is required"),
  contentAr: z.string().min(1, "Arabic content is required"),
  metaTitle: z.string().optional(),
  metaTitleAr: z.string().optional(),
  metaDescription: z.string().optional(),
  metaDescriptionAr: z.string().optional(),
  isPublished: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
  showInHeader: z.boolean().default(false),
  sortOrder: z.number().default(0)
});

type PageFormData = z.infer<typeof pageSchema>;

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
  isPublished: boolean;
  showInFooter: boolean;
  showInHeader: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: number;
  updatedBy?: number;
}

export default function AdminPagesManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  if (!user || user.role !== 'admin') {
    setLocation('/auth');
    return null;
  }

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      titleAr: "",
      slug: "",
      content: "",
      contentAr: "",
      metaTitle: "",
      metaTitleAr: "",
      metaDescription: "",
      metaDescriptionAr: "",
      isPublished: true,
      showInFooter: false,
      showInHeader: false,
      sortOrder: 0
    }
  });

  const { data: pages, isLoading } = useQuery<StaticPage[]>({
    queryKey: ['/api/admin/static-pages'],
    enabled: !!user && user.role === 'admin'
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const response = await apiRequest("POST", "/api/admin/static-pages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-pages'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Page created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create page",
        variant: "destructive"
      });
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PageFormData }) => {
      const response = await apiRequest("PUT", `/api/admin/static-pages/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-pages'] });
      setIsDialogOpen(false);
      setEditingPage(null);
      form.reset();
      toast({
        title: "Success",
        description: "Page updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page",
        variant: "destructive"
      });
    }
  });

  const togglePageStatusMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/static-pages/${id}/status`, { isPublished });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-pages'] });
      toast({
        title: "Success",
        description: "Page status updated successfully"
      });
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/static-pages/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-pages'] });
      toast({
        title: "Success",
        description: "Page deleted successfully"
      });
    }
  });

  const onSubmit = (data: PageFormData) => {
    if (editingPage) {
      updatePageMutation.mutate({ id: editingPage.id, data });
    } else {
      createPageMutation.mutate(data);
    }
  };

  const handleEdit = (page: StaticPage) => {
    setEditingPage(page);
    form.reset({
      title: page.title,
      titleAr: page.titleAr,
      slug: page.slug,
      content: page.content,
      contentAr: page.contentAr,
      metaTitle: page.metaTitle || "",
      metaTitleAr: page.metaTitleAr || "",
      metaDescription: page.metaDescription || "",
      metaDescriptionAr: page.metaDescriptionAr || "",
      isPublished: page.isPublished,
      showInFooter: page.showInFooter,
      showInHeader: page.showInHeader,
      sortOrder: page.sortOrder
    });
    setIsDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const filteredPages = pages?.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.titleAr.includes(searchTerm) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Static Pages Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage website pages like About Us, Privacy Policy, Terms of Service
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Page
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPage ? 'Edit Page' : 'Create New Page'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPage ? 'Update the page content and settings.' : 'Create a new static page for your website.'}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="content" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="content" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Page Title (English)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="About Us" 
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      if (!editingPage && !form.getValues('slug')) {
                                        form.setValue('slug', generateSlug(e.target.value));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="titleAr"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Page Title (Arabic)</FormLabel>
                                <FormControl>
                                  <Input placeholder="من نحن" {...field} dir="rtl" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Slug</FormLabel>
                              <FormControl>
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-2">/{' '}</span>
                                  <Input placeholder="about-us" {...field} />
                                </div>
                              </FormControl>
                              <FormDescription>
                                URL-friendly version of the page title. Use only lowercase letters, numbers, and hyphens.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content (English)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter your page content in English..." 
                                  {...field}
                                  rows={10}
                                  className="font-mono text-sm"
                                />
                              </FormControl>
                              <FormDescription>
                                You can use HTML tags for formatting (h1, h2, p, strong, em, ul, ol, li, a, img, etc.)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contentAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content (Arabic)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="أدخل محتوى الصفحة بالعربية..." 
                                  {...field}
                                  rows={10}
                                  dir="rtl"
                                  className="font-mono text-sm"
                                />
                              </FormControl>
                              <FormDescription>
                                يمكنك استخدام علامات HTML للتنسيق
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="seo" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="metaTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meta Title (English)</FormLabel>
                                <FormControl>
                                  <Input placeholder="About Us - Baraq Platform" {...field} />
                                </FormControl>
                                <FormDescription>
                                  SEO title for search engines (50-60 characters recommended)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="metaTitleAr"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meta Title (Arabic)</FormLabel>
                                <FormControl>
                                  <Input placeholder="من نحن - منصة برق" {...field} dir="rtl" />
                                </FormControl>
                                <FormDescription>
                                  عنوان SEO لمحركات البحث
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description (English)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Learn more about Baraq platform and our mission..." 
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormDescription>
                                SEO description for search engines (150-160 characters recommended)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="metaDescriptionAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description (Arabic)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="تعرف على منصة برق ورسالتنا..." 
                                  {...field}
                                  rows={3}
                                  dir="rtl"
                                />
                              </FormControl>
                              <FormDescription>
                                وصف SEO لمحركات البحث
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="settings" className="space-y-4">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="isPublished"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Published</FormLabel>
                                  <FormDescription>
                                    Make this page visible to the public
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

                          <FormField
                            control={form.control}
                            name="showInFooter"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Show in Footer</FormLabel>
                                  <FormDescription>
                                    Display this page link in the website footer
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

                          <FormField
                            control={form.control}
                            name="showInHeader"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Show in Header</FormLabel>
                                  <FormDescription>
                                    Display this page link in the website header/navigation
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

                          <FormField
                            control={form.control}
                            name="sortOrder"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sort Order</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Order in which pages appear in navigation (lower numbers appear first)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingPage(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPageMutation.isPending || updatePageMutation.isPending}
                      >
                        {editingPage ? 'Update Page' : 'Create Page'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Pages List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No pages found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchTerm ? "No pages match your search criteria." : "Start by creating your first static page."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {page.title}
                        </h3>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 dark:text-gray-300">{page.titleAr}</span>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={page.isPublished ? "default" : "secondary"}>
                            {page.isPublished ? "Published" : "Draft"}
                          </Badge>
                          
                          {page.showInHeader && (
                            <Badge variant="outline">Header</Badge>
                          )}
                          
                          {page.showInFooter && (
                            <Badge variant="outline">Footer</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          <code>/{page.slug}</code>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <span>Order: {page.sortOrder}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        title="Preview page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePageStatusMutation.mutate({
                          id: page.id,
                          isPublished: !page.isPublished
                        })}
                        title={page.isPublished ? "Unpublish" : "Publish"}
                      >
                        {page.isPublished ? (
                          <EyeOff className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(page)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePageMutation.mutate(page.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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