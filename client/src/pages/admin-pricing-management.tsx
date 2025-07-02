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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Package, 
  DollarSign, 
  Clock, 
  Monitor,
  Star,
  Settings
} from "lucide-react";

// Enterprise-level feature management system
const PREDEFINED_FEATURES = [
  // Team & Access Control
  {
    id: 'enable_subaccounts',
    name: 'Enable Sub-accounts',
    nameAr: 'تفعيل الحسابات الفرعية',
    description: 'Allow creation and management of sub-accounts',
    descriptionAr: 'السماح بإنشاء وإدارة الحسابات الفرعية',
    category: 'team_access',
    icon: 'Users',
    hasLimit: true,
    limitName: 'subaccount_limit',
    limitLabel: 'Sub-account Limit',
    limitLabelAr: 'حد الحسابات الفرعية'
  },
  {
    id: 'role_permissions',
    name: 'Role-based Permissions',
    nameAr: 'صلاحيات الأدوار',
    description: 'Assign different roles and permissions to team members',
    descriptionAr: 'تعيين أدوار وصلاحيات مختلفة لأعضاء الفريق',
    category: 'team_access',
    icon: 'Shield'
  },
  {
    id: 'activity_log',
    name: 'Activity Log',
    nameAr: 'سجل النشاطات',
    description: 'Track user actions and changes',
    descriptionAr: 'تتبع إجراءات المستخدمين والتغييرات',
    category: 'team_access',
    icon: 'FileText'
  },

  // Content Publishing
  {
    id: 'video_ads',
    name: 'Video Ads',
    nameAr: 'إعلانات الفيديو',
    description: 'Ability to publish video advertisements',
    descriptionAr: 'إمكانية نشر إعلانات الفيديو',
    category: 'content_publishing',
    icon: 'Video'
  },
  {
    id: 'image_ads',
    name: 'Image Ads',
    nameAr: 'إعلانات الصور',
    description: 'Ability to publish image advertisements',
    descriptionAr: 'إمكانية نشر إعلانات الصور',
    category: 'content_publishing',
    icon: 'Image'
  },
  {
    id: 'scheduled_publishing',
    name: 'Scheduled Publishing',
    nameAr: 'النشر المجدول',
    description: 'Schedule ads for future publication',
    descriptionAr: 'جدولة الإعلانات للنشر المستقبلي',
    category: 'content_publishing',
    icon: 'Clock'
  },
  {
    id: 'pause_resume',
    name: 'Pause/Resume Campaigns',
    nameAr: 'إيقاف/استئناف الحملات',
    description: 'Control campaign status',
    descriptionAr: 'التحكم في حالة الحملات',
    category: 'content_publishing',
    icon: 'PlayCircle'
  },
  {
    id: 'premium_locations',
    name: 'Premium Screen Locations',
    nameAr: 'مواقع الشاشات المميزة',
    description: 'Access to premium high-traffic locations',
    descriptionAr: 'الوصول لمواقع الشاشات المميزة عالية الحركة',
    category: 'content_publishing',
    icon: 'MapPin'
  },
  {
    id: 'pin_to_top',
    name: 'Pin to Top',
    nameAr: 'تثبيت في المقدمة',
    description: 'Pin ads to top of rotation',
    descriptionAr: 'تثبيت الإعلانات في مقدمة الدورة',
    category: 'content_publishing',
    icon: 'Pin'
  },
  {
    id: 'offer_limit',
    name: 'Offer Limit',
    nameAr: 'حد العروض',
    description: 'Maximum number of offers allowed',
    descriptionAr: 'الحد الأقصى لعدد العروض المسموحة',
    category: 'content_publishing',
    icon: 'Package',
    hasLimit: true,
    limitName: 'offer_limit_value',
    limitLabel: 'Max Offers',
    limitLabelAr: 'الحد الأقصى للعروض'
  },
  {
    id: 'screen_limit',
    name: 'Screen Limit',
    nameAr: 'حد الشاشات',
    description: 'Maximum number of screens accessible',
    descriptionAr: 'الحد الأقصى لعدد الشاشات المتاحة',
    category: 'content_publishing',
    icon: 'Monitor',
    hasLimit: true,
    limitName: 'screen_limit_value',
    limitLabel: 'Max Screens',
    limitLabelAr: 'الحد الأقصى للشاشات'
  },
  {
    id: 'custom_ad_duration',
    name: 'Custom Ad Duration',
    nameAr: 'مدة الإعلان المخصصة',
    description: 'Set custom duration for advertisements',
    descriptionAr: 'تحديد مدة مخصصة للإعلانات',
    category: 'content_publishing',
    icon: 'Timer',
    hasLimit: true,
    limitName: 'ad_duration_value',
    limitLabel: 'Ad Duration (seconds)',
    limitLabelAr: 'مدة الإعلان (ثانية)'
  },

  // Creative & Design
  {
    id: 'design_support',
    name: 'Free Design Support',
    nameAr: 'دعم التصميم المجاني',
    description: 'Professional design assistance',
    descriptionAr: 'مساعدة تصميم احترافية',
    category: 'creative_design',
    icon: 'Palette'
  },
  {
    id: 'ad_templates',
    name: 'Access to Ad Templates',
    nameAr: 'الوصول لقوالب الإعلانات',
    description: 'Pre-designed ad templates library',
    descriptionAr: 'مكتبة قوالب إعلانات مصممة مسبقاً',
    category: 'creative_design',
    icon: 'Layout'
  },
  {
    id: 'request_edits',
    name: 'Request Edits on Ads',
    nameAr: 'طلب تعديلات على الإعلانات',
    description: 'Request professional edits and modifications',
    descriptionAr: 'طلب تعديلات وتحسينات احترافية',
    category: 'creative_design',
    icon: 'Edit'
  },

  // Analytics & Insights
  {
    id: 'realtime_reports',
    name: 'Real-time Reports',
    nameAr: 'التقارير الفورية',
    description: 'Live analytics and performance data',
    descriptionAr: 'تحليلات وبيانات أداء مباشرة',
    category: 'analytics_insights',
    icon: 'BarChart3'
  },
  {
    id: 'performance_comparison',
    name: 'Ad Performance Comparison',
    nameAr: 'مقارنة أداء الإعلانات',
    description: 'Compare performance across different ads',
    descriptionAr: 'مقارنة الأداء بين الإعلانات المختلفة',
    category: 'analytics_insights',
    icon: 'TrendingUp'
  },
  {
    id: 'weekly_reports',
    name: 'Weekly Report Emails',
    nameAr: 'تقارير أسبوعية بالبريد',
    description: 'Automated weekly performance reports',
    descriptionAr: 'تقارير أداء أسبوعية تلقائية',
    category: 'analytics_insights',
    icon: 'Mail'
  },

  // Platform Access & Management
  {
    id: 'advanced_dashboard',
    name: 'Advanced Dashboard Access',
    nameAr: 'الوصول للوحة المتقدمة',
    description: 'Access to advanced dashboard features',
    descriptionAr: 'الوصول لميزات اللوحة المتقدمة',
    category: 'platform_management',
    icon: 'Settings'
  },
  {
    id: 'page_builder',
    name: 'Page Builder Access',
    nameAr: 'الوصول لبناء الصفحات',
    description: 'Create custom pages like About Us',
    descriptionAr: 'إنشاء صفحات مخصصة مثل من نحن',
    category: 'platform_management',
    icon: 'FileEdit'
  },
  {
    id: 'offer_history',
    name: 'Offer History',
    nameAr: 'تاريخ العروض',
    description: 'Access to complete offer history and analytics',
    descriptionAr: 'الوصول لتاريخ العروض الكامل والتحليلات',
    category: 'platform_management',
    icon: 'History'
  },
  {
    id: 'notification_system',
    name: 'Notification System',
    nameAr: 'نظام الإشعارات',
    description: 'Advanced notification and alert system',
    descriptionAr: 'نظام إشعارات وتنبيهات متقدم',
    category: 'platform_management',
    icon: 'Bell'
  },
  {
    id: 'auto_renewal',
    name: 'Auto-renewal Option',
    nameAr: 'خيار التجديد التلقائي',
    description: 'Automatic subscription renewal',
    descriptionAr: 'تجديد الاشتراك التلقائي',
    category: 'platform_management',
    icon: 'RotateCcw'
  },

  // Support & Services
  {
    id: 'priority_support',
    name: 'Priority Support',
    nameAr: 'الدعم المُسرَّع',
    description: 'Priority customer support and faster response',
    descriptionAr: 'دعم عملاء مُسرَّع واستجابة أسرع',
    category: 'support_services',
    icon: 'Headphones'
  },
  {
    id: 'account_manager',
    name: 'Dedicated Account Manager',
    nameAr: 'مدير حساب مخصص',
    description: 'Personal account manager for assistance',
    descriptionAr: 'مدير حساب شخصي للمساعدة',
    category: 'support_services',
    icon: 'UserCheck'
  },
  {
    id: 'whatsapp_support',
    name: 'WhatsApp Support',
    nameAr: 'دعم واتساب',
    description: 'Direct WhatsApp support channel',
    descriptionAr: 'قناة دعم مباشرة عبر واتساب',
    category: 'support_services',
    icon: 'MessageCircle'
  },
  {
    id: 'training_materials',
    name: 'Access to Training Materials',
    nameAr: 'الوصول لمواد التدريب',
    description: 'Educational resources and training content',
    descriptionAr: 'موارد تعليمية ومحتوى تدريبي',
    category: 'support_services',
    icon: 'BookOpen'
  },

  // Branding & Visibility
  {
    id: 'featured_badge',
    name: 'Featured Badge',
    nameAr: 'شارة مميز',
    description: 'Featured badge on merchant profile',
    descriptionAr: 'شارة مميز على ملف التاجر',
    category: 'branding_visibility',
    icon: 'Award'
  },
  {
    id: 'marketplace_priority',
    name: 'Marketplace Placement Priority',
    nameAr: 'أولوية ترتيب السوق',
    description: 'Higher placement in marketplace listings',
    descriptionAr: 'ترتيب أعلى في قوائم السوق',
    category: 'branding_visibility',
    icon: 'Star'
  },
  {
    id: 'custom_branding',
    name: 'Custom Branding',
    nameAr: 'العلامة التجارية المخصصة',
    description: 'White-label branding options',
    descriptionAr: 'خيارات العلامة التجارية المخصصة',
    category: 'branding_visibility',
    icon: 'Brush'
  }
];

const packageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default("SAR"),
  billingPeriod: z.enum(["monthly", "yearly"]),
  offerLimit: z.number().min(1, "Offer limit must be at least 1"),
  screenLimit: z.number().min(1, "Screen limit must be at least 1"),  
  adDuration: z.number().min(1, "Ad duration must be at least 1"),
  selectedFeatures: z.record(z.boolean()).default({}),
  featureLimits: z.record(z.number()).default({}),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().default(0),
  color: z.string().default("#3B82F6")
});

type PackageFormData = z.infer<typeof packageSchema>;

// Enterprise feature category groups
const FEATURE_CATEGORIES = {
  team_access: { 
    name: 'Team & Access Control', 
    nameAr: 'الفريق والتحكم بالوصول', 
    color: 'bg-blue-100 text-blue-800',
    icon: 'Users'
  },
  content_publishing: { 
    name: 'Content Publishing', 
    nameAr: 'نشر المحتوى', 
    color: 'bg-green-100 text-green-800',
    icon: 'FileText'
  },
  creative_design: { 
    name: 'Creative & Design', 
    nameAr: 'الإبداع والتصميم', 
    color: 'bg-purple-100 text-purple-800',
    icon: 'Palette'
  },
  analytics_insights: { 
    name: 'Analytics & Insights', 
    nameAr: 'التحليلات والرؤى', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'BarChart3'
  },
  platform_management: { 
    name: 'Platform Access & Management', 
    nameAr: 'الوصول وإدارة المنصة', 
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'Settings'
  },
  support_services: { 
    name: 'Support & Services', 
    nameAr: 'الدعم والخدمات', 
    color: 'bg-cyan-100 text-cyan-800',
    icon: 'Headphones'
  },
  branding_visibility: { 
    name: 'Branding & Visibility', 
    nameAr: 'العلامة التجارية والظهور', 
    color: 'bg-pink-100 text-pink-800',
    icon: 'Star'
  }
};

interface SubscriptionPlan {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  currency: string;
  billingPeriod: string;
  offerLimit: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPricingManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    setLocation('/auth');
    return null;
  }

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      price: 0,
      currency: "SAR",
      billingPeriod: "monthly",
      offerLimit: 3,
      screenLimit: 5,
      adDuration: 30,
      selectedFeatures: {},
      isActive: true,
      isPopular: false,
      sortOrder: 0,
      color: "#3B82F6"
    }
  });

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/admin/subscription-plans'],
    enabled: !!user && user.role === 'admin'
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const response = await apiRequest("POST", "/api/admin/subscription-plans", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Subscription plan created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription plan",
        variant: "destructive"
      });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PackageFormData }) => {
      const response = await apiRequest("PUT", `/api/admin/subscription-plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      setIsDialogOpen(false);
      setEditingPlan(null);
      form.reset();
      toast({
        title: "Success",
        description: "Subscription plan updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription plan",
        variant: "destructive"
      });
    }
  });

  const togglePlanStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/subscription-plans/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      toast({
        title: "Success",
        description: "Plan status updated successfully"
      });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/subscription-plans/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully"
      });
    }
  });

  const onSubmit = (data: PackageFormData) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      nameAr: plan.nameAr,
      description: plan.description || "",
      descriptionAr: plan.descriptionAr || "",
      price: plan.price,
      currency: plan.currency,
      billingPeriod: plan.billingPeriod as "monthly" | "yearly",
      offerLimit: plan.offerLimit,
      screenLimit: 5, // Default values for new fields
      adDuration: 30,
      selectedFeatures: {},
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder,
      color: plan.color
    });
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pricing & Packages Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage subscription plans and pricing packages
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Package
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? 'Edit Package' : 'Create New Package'}
                </DialogTitle>
                <DialogDescription>
                  {editingPlan ? 'Update the package details below.' : 'Add a new subscription package to your platform.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name (English)</FormLabel>
                          <FormControl>
                            <Input placeholder="Basic Plan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name (Arabic)</FormLabel>
                          <FormControl>
                            <Input placeholder="الخطة الأساسية" {...field} dir="rtl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (SAR)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="99" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billingPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Period</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select billing period" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offerLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Limit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="3" 
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
                      name="screenLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Screen Limit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
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
                      name="adDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Duration (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
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
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Package description..." 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="وصف الباقة..." 
                            {...field}
                            rows={3}
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Make this package available for purchase
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
                      name="isPopular"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Popular</FormLabel>
                            <FormDescription>
                              Mark as popular package
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
                  </div>

                  {/* Feature Selection Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Select Package Features
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        Choose which features to include in this subscription package. Toggle each feature on or off.
                      </p>

                      {/* Feature Categories */}
                      {Object.entries(FEATURE_CATEGORIES).map(([categoryKey, category]) => {
                        const categoryFeatures = PREDEFINED_FEATURES.filter(feature => feature.category === categoryKey);
                        if (categoryFeatures.length === 0) return null;

                        return (
                          <div key={categoryKey} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={category.color}>
                                {category.name}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                ({categoryFeatures.length} features)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              {categoryFeatures.map((feature) => (
                                <div key={feature.id} className="rounded-md border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                  <FormField
                                    control={form.control}
                                    name={`selectedFeatures.${feature.id}`}
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Switch
                                            checked={field.value || false}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none flex-1">
                                          <FormLabel className="text-sm font-medium cursor-pointer">
                                            {feature.name}
                                          </FormLabel>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {feature.description}
                                          </p>
                                          <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs">
                                              {feature.nameAr}
                                            </Badge>
                                          </div>
                                        </div>
                                      </FormItem>
                                    )}
                                  />
                                  
                                  {/* Custom Limit Input for Features that Support It */}
                                  {feature.hasLimit && form.watch(`selectedFeatures.${feature.id}`) && (
                                    <div className="mt-3 ml-8">
                                      <label className="text-xs text-gray-600 block mb-1">
                                        {feature.limitLabel} / {feature.limitLabelAr}
                                      </label>
                                      <Input
                                        type="number"
                                        placeholder="Enter limit..."
                                        className="h-8 text-sm"
                                        defaultValue={0}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 0;
                                          // Store the limit value in the form
                                          form.setValue(`selectedFeatures.${feature.limitName}`, value as any);
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Feature Summary */}
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Selected Features Summary
                        </h4>
                        <div className="text-sm text-blue-700 dark:text-blue-200">
                          {(() => {
                            const selectedCount = Object.values(form.watch('selectedFeatures') || {}).filter(Boolean).length;
                            const totalCount = PREDEFINED_FEATURES.length;
                            return `${selectedCount} of ${totalCount} features selected`;
                          })()}
                        </div>
                        {Object.entries(form.watch('selectedFeatures') || {}).some(([_, value]) => value) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(form.watch('selectedFeatures') || {})
                              .filter(([_, value]) => value)
                              .map(([featureId]) => {
                                const feature = PREDEFINED_FEATURES.find(f => f.id === featureId);
                                return feature ? (
                                  <Badge key={featureId} variant="secondary" className="text-xs">
                                    {feature.name}
                                  </Badge>
                                ) : null;
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingPlan(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                    >
                      {editingPlan ? 'Update Package' : 'Create Package'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card key={plan.id} className="relative">
                {plan.isPopular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePlanStatusMutation.mutate({
                          id: plan.id,
                          isActive: !plan.isActive
                        })}
                      >
                        {plan.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePlanMutation.mutate(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.nameAr}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold" style={{ color: plan.color }}>
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        per {plan.billingPeriod === 'monthly' ? 'month' : 'year'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>{plan.offerLimit} offers included</span>
                      </div>
                      
                      {plan.description && (
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Order: {plan.sortOrder}
                      </span>
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