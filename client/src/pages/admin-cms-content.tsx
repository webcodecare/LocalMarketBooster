import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BackButton } from "@/components/ui/back-button";
import { 
  Globe, 
  Image, 
  Type, 
  Palette, 
  Settings, 
  Eye, 
  EyeOff,
  Save,
  Upload,
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import type { 
  CmsHomepageSection, 
  CmsSiteBranding, 
  CmsBenefit, 
  CmsHowItWorksStep,
  InsertCmsHomepageSection,
  InsertCmsSiteBranding,
  InsertCmsBenefit,
  InsertCmsHowItWorksStep
} from "@shared/schema";

export default function AdminCMSContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("homepage");

  // Homepage Sections Management
  const { data: homepageSections = [] } = useQuery<CmsHomepageSection[]>({
    queryKey: ["/api/cms/homepage-sections"],
  });

  const { data: siteBranding } = useQuery<CmsSiteBranding>({
    queryKey: ["/api/cms/site-branding"],
  });

  const { data: benefits = [] } = useQuery<CmsBenefit[]>({
    queryKey: ["/api/cms/benefits"],
  });

  const { data: howItWorksSteps = [] } = useQuery<CmsHowItWorksStep[]>({
    queryKey: ["/api/cms/how-it-works-steps"],
  });

  // Mutations for homepage sections
  const updateHomepageSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCmsHomepageSection> }) => {
      const res = await apiRequest("PUT", `/api/cms/homepage-sections/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/homepage-sections"] });
      toast({ title: "تم تحديث القسم بنجاح", description: "تم حفظ التغييرات" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث القسم", variant: "destructive" });
    }
  });

  // Mutations for site branding
  const updateSiteBrandingMutation = useMutation({
    mutationFn: async (data: Partial<InsertCmsSiteBranding>) => {
      const res = await apiRequest("PUT", "/api/cms/site-branding", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/site-branding"] });
      toast({ title: "تم تحديث الهوية بنجاح", description: "تم حفظ التغييرات" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في تحديث الهوية", variant: "destructive" });
    }
  });

  // Mutations for benefits
  const createBenefitMutation = useMutation({
    mutationFn: async (data: InsertCmsBenefit) => {
      const res = await apiRequest("POST", "/api/cms/benefits", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/benefits"] });
      toast({ title: "تم إضافة الميزة بنجاح" });
    }
  });

  const updateBenefitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCmsBenefit> }) => {
      const res = await apiRequest("PUT", `/api/cms/benefits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/benefits"] });
      toast({ title: "تم تحديث الميزة بنجاح" });
    }
  });

  const deleteBenefitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/benefits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/benefits"] });
      toast({ title: "تم حذف الميزة بنجاح" });
    }
  });

  // Mutations for how it works steps
  const createHowItWorksStepMutation = useMutation({
    mutationFn: async (data: InsertCmsHowItWorksStep) => {
      const res = await apiRequest("POST", "/api/cms/how-it-works-steps", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/how-it-works-steps"] });
      toast({ title: "تم إضافة الخطوة بنجاح" });
    }
  });

  const updateHowItWorksStepMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCmsHowItWorksStep> }) => {
      const res = await apiRequest("PUT", `/api/cms/how-it-works-steps/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/how-it-works-steps"] });
      toast({ title: "تم تحديث الخطوة بنجاح" });
    }
  });

  const deleteHowItWorksStepMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/how-it-works-steps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/how-it-works-steps"] });
      toast({ title: "تم حذف الخطوة بنجاح" });
    }
  });

  const handleSectionUpdate = (section: CmsHomepageSection, field: string, value: any) => {
    updateHomepageSectionMutation.mutate({
      id: section.id,
      data: { [field]: value }
    });
  };

  const handleBrandingUpdate = (field: string, value: any) => {
    updateSiteBrandingMutation.mutate({ [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath="/admin" />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Settings className="h-8 w-8 text-saudi-green ml-3" />
            إدارة المحتوى الثابت
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            إدارة شاملة لجميع أقسام الموقع والهوية البصرية
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="homepage" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              أقسام الرئيسية
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              الهوية البصرية
            </TabsTrigger>
            <TabsTrigger value="benefits" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              مميزات المنصة
            </TabsTrigger>
            <TabsTrigger value="how-it-works" className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              كيف يعمل
            </TabsTrigger>
          </TabsList>

          {/* Homepage Sections Management */}
          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  أقسام الصفحة الرئيسية
                </CardTitle>
                <CardDescription>
                  تحرير محتوى أقسام الصفحة الرئيسية مثل البانر والمميزات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {homepageSections.map((section) => (
                  <Card key={section.id} className="border-l-4 border-l-saudi-green">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">
                          {section.sectionKey.replace('_', ' ')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={section.isVisible}
                            onCheckedChange={(checked) => 
                              handleSectionUpdate(section, 'isVisible', checked)
                            }
                          />
                          {section.isVisible ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`title-${section.id}`}>العنوان</Label>
                          <Input
                            id={`title-${section.id}`}
                            value={section.title || ''}
                            onChange={(e) => 
                              handleSectionUpdate(section, 'title', e.target.value)
                            }
                            placeholder="العنوان بالعربية"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`titleAr-${section.id}`}>Title (English)</Label>
                          <Input
                            id={`titleAr-${section.id}`}
                            value={section.titleAr || ''}
                            onChange={(e) => 
                              handleSectionUpdate(section, 'titleAr', e.target.value)
                            }
                            placeholder="Title in English"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`subtitle-${section.id}`}>العنوان الفرعي</Label>
                          <Input
                            id={`subtitle-${section.id}`}
                            value={section.subtitle || ''}
                            onChange={(e) => 
                              handleSectionUpdate(section, 'subtitle', e.target.value)
                            }
                            placeholder="العنوان الفرعي بالعربية"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`subtitleAr-${section.id}`}>Subtitle (English)</Label>
                          <Input
                            id={`subtitleAr-${section.id}`}
                            value={section.subtitleAr || ''}
                            onChange={(e) => 
                              handleSectionUpdate(section, 'subtitleAr', e.target.value)
                            }
                            placeholder="Subtitle in English"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`content-${section.id}`}>المحتوى</Label>
                          <Textarea
                            id={`content-${section.id}`}
                            value={section.content || ''}
                            onChange={(e) => 
                              handleSectionUpdate(section, 'content', e.target.value)
                            }
                            placeholder="المحتوى بالعربية"
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`contentAr-${section.id}`}>Content (English)</Label>
                          <Textarea
                            id={`contentAr-${section.id}`}
                            value={section.contentAr || ''}
                            onChange={(e) => 
                              handleSectionUpdate(section, 'contentAr', e.target.value)
                            }
                            placeholder="Content in English"
                            rows={4}
                          />
                        </div>
                      </div>

                      {section.sectionKey === 'hero' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`buttonText-${section.id}`}>نص الزر</Label>
                            <Input
                              id={`buttonText-${section.id}`}
                              value={section.buttonText || ''}
                              onChange={(e) => 
                                handleSectionUpdate(section, 'buttonText', e.target.value)
                              }
                              placeholder="نص الزر بالعربية"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`buttonUrl-${section.id}`}>رابط الزر</Label>
                            <Input
                              id={`buttonUrl-${section.id}`}
                              value={section.buttonUrl || ''}
                              onChange={(e) => 
                                handleSectionUpdate(section, 'buttonUrl', e.target.value)
                              }
                              placeholder="/register"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Branding Management */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  إدارة الهوية البصرية والشعار
                </CardTitle>
                <CardDescription>
                  تحرير اسم الموقع والشعار والألوان
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {siteBranding && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="siteName">اسم الموقع</Label>
                        <Input
                          id="siteName"
                          value={siteBranding.siteName}
                          onChange={(e) => 
                            handleBrandingUpdate('siteName', e.target.value)
                          }
                          placeholder="براق"
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteNameAr">Site Name (English)</Label>
                        <Input
                          id="siteNameAr"
                          value={siteBranding.siteNameAr}
                          onChange={(e) => 
                            handleBrandingUpdate('siteNameAr', e.target.value)
                          }
                          placeholder="Braaq"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="siteTagline">الشعار</Label>
                        <Input
                          id="siteTagline"
                          value={siteBranding.siteTagline || ''}
                          onChange={(e) => 
                            handleBrandingUpdate('siteTagline', e.target.value)
                          }
                          placeholder="منصة العروض والخصومات"
                        />
                      </div>
                      <div>
                        <Label htmlFor="siteTaglineAr">Tagline (English)</Label>
                        <Input
                          id="siteTaglineAr"
                          value={siteBranding.siteTaglineAr || ''}
                          onChange={(e) => 
                            handleBrandingUpdate('siteTaglineAr', e.target.value)
                          }
                          placeholder="Offers & Discounts Platform"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        إدارة الشعارات
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="siteLogo">الشعار الرئيسي</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="siteLogo"
                              value={siteBranding.siteLogo || ''}
                              onChange={(e) => 
                                handleBrandingUpdate('siteLogo', e.target.value)
                              }
                              placeholder="URL للشعار"
                            />
                            <Button size="icon" variant="outline">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="siteLogoWhite">الشعار الأبيض</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="siteLogoWhite"
                              value={siteBranding.siteLogoWhite || ''}
                              onChange={(e) => 
                                handleBrandingUpdate('siteLogoWhite', e.target.value)
                              }
                              placeholder="URL للشعار الأبيض"
                            />
                            <Button size="icon" variant="outline">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="siteFavicon">الأيقونة المفضلة</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="siteFavicon"
                              value={siteBranding.siteFavicon || ''}
                              onChange={(e) => 
                                handleBrandingUpdate('siteFavicon', e.target.value)
                              }
                              placeholder="URL للأيقونة"
                            />
                            <Button size="icon" variant="outline">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        إدارة الألوان
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="primaryColor">اللون الأساسي</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={siteBranding.primaryColor}
                              onChange={(e) => 
                                handleBrandingUpdate('primaryColor', e.target.value)
                              }
                              className="w-16 h-10"
                            />
                            <Input
                              value={siteBranding.primaryColor}
                              onChange={(e) => 
                                handleBrandingUpdate('primaryColor', e.target.value)
                              }
                              placeholder="#16a34a"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="secondaryColor"
                              type="color"
                              value={siteBranding.secondaryColor}
                              onChange={(e) => 
                                handleBrandingUpdate('secondaryColor', e.target.value)
                              }
                              className="w-16 h-10"
                            />
                            <Input
                              value={siteBranding.secondaryColor}
                              onChange={(e) => 
                                handleBrandingUpdate('secondaryColor', e.target.value)
                              }
                              placeholder="#15803d"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="accentColor">لون مساعد</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="accentColor"
                              type="color"
                              value={siteBranding.accentColor}
                              onChange={(e) => 
                                handleBrandingUpdate('accentColor', e.target.value)
                              }
                              className="w-16 h-10"
                            />
                            <Input
                              value={siteBranding.accentColor}
                              onChange={(e) => 
                                handleBrandingUpdate('accentColor', e.target.value)
                              }
                              placeholder="#dcfce7"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Management */}
          <TabsContent value="benefits" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      مميزات المنصة
                    </CardTitle>
                    <CardDescription>
                      إدارة مميزات المنصة المعروضة في الصفحة الرئيسية
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      createBenefitMutation.mutate({
                        title: "ميزة جديدة",
                        titleAr: "New Benefit",
                        description: "وصف الميزة",
                        descriptionAr: "Benefit description",
                        icon: "star",
                        isVisible: true,
                        sortOrder: benefits.length + 1
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة ميزة
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit) => (
                  <Card key={benefit.id} className="border-l-4 border-l-saudi-green">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{benefit.icon}</Badge>
                          <span className="font-medium">{benefit.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={benefit.isVisible}
                            onCheckedChange={(checked) => 
                              updateBenefitMutation.mutate({
                                id: benefit.id,
                                data: { isVisible: checked }
                              })
                            }
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => deleteBenefitMutation.mutate(benefit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>العنوان</Label>
                          <Input
                            value={benefit.title}
                            onChange={(e) => 
                              updateBenefitMutation.mutate({
                                id: benefit.id,
                                data: { title: e.target.value }
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Title (English)</Label>
                          <Input
                            value={benefit.titleAr}
                            onChange={(e) => 
                              updateBenefitMutation.mutate({
                                id: benefit.id,
                                data: { titleAr: e.target.value }
                              })
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>الوصف</Label>
                          <Textarea
                            value={benefit.description || ''}
                            onChange={(e) => 
                              updateBenefitMutation.mutate({
                                id: benefit.id,
                                data: { description: e.target.value }
                              })
                            }
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Description (English)</Label>
                          <Textarea
                            value={benefit.descriptionAr || ''}
                            onChange={(e) => 
                              updateBenefitMutation.mutate({
                                id: benefit.id,
                                data: { descriptionAr: e.target.value }
                              })
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label>الأيقونة (Lucide Icon Name)</Label>
                        <Input
                          value={benefit.icon || ''}
                          onChange={(e) => 
                            updateBenefitMutation.mutate({
                              id: benefit.id,
                              data: { icon: e.target.value }
                            })
                          }
                          placeholder="star, check, heart, etc."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* How It Works Steps Management */}
          <TabsContent value="how-it-works" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUp className="h-5 w-5" />
                      خطوات كيف يعمل
                    </CardTitle>
                    <CardDescription>
                      إدارة خطوات شرح كيفية عمل المنصة
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      createHowItWorksStepMutation.mutate({
                        stepNumber: howItWorksSteps.length + 1,
                        title: "خطوة جديدة",
                        titleAr: "New Step",
                        description: "وصف الخطوة",
                        descriptionAr: "Step description",
                        icon: "arrow-right",
                        isVisible: true,
                        sortOrder: howItWorksSteps.length + 1
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة خطوة
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {howItWorksSteps.map((step) => (
                  <Card key={step.id} className="border-l-4 border-l-saudi-green">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-saudi-green">{step.stepNumber}</Badge>
                          <span className="font-medium">{step.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={step.isVisible}
                            onCheckedChange={(checked) => 
                              updateHowItWorksStepMutation.mutate({
                                id: step.id,
                                data: { isVisible: checked }
                              })
                            }
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => deleteHowItWorksStepMutation.mutate(step.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>رقم الخطوة</Label>
                          <Input
                            type="number"
                            value={step.stepNumber}
                            onChange={(e) => 
                              updateHowItWorksStepMutation.mutate({
                                id: step.id,
                                data: { stepNumber: parseInt(e.target.value) }
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>العنوان</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => 
                              updateHowItWorksStepMutation.mutate({
                                id: step.id,
                                data: { title: e.target.value }
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Title (English)</Label>
                          <Input
                            value={step.titleAr}
                            onChange={(e) => 
                              updateHowItWorksStepMutation.mutate({
                                id: step.id,
                                data: { titleAr: e.target.value }
                              })
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label>الوصف</Label>
                          <Textarea
                            value={step.description || ''}
                            onChange={(e) => 
                              updateHowItWorksStepMutation.mutate({
                                id: step.id,
                                data: { description: e.target.value }
                              })
                            }
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Description (English)</Label>
                          <Textarea
                            value={step.descriptionAr || ''}
                            onChange={(e) => 
                              updateHowItWorksStepMutation.mutate({
                                id: step.id,
                                data: { descriptionAr: e.target.value }
                              })
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label>الأيقونة (Lucide Icon Name)</Label>
                        <Input
                          value={step.icon || ''}
                          onChange={(e) => 
                            updateHowItWorksStepMutation.mutate({
                              id: step.id,
                              data: { icon: e.target.value }
                            })
                          }
                          placeholder="user-plus, search, shopping-cart, etc."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}