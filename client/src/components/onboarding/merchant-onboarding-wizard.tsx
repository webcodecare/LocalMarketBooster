import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, useTranslation } from "@/contexts/language-context";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { translations } from "@/translations";
import { 
  User, 
  Tag, 
  CreditCard, 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Star,
  Trophy,
  Target,
  Sparkles
} from "lucide-react";

const steps = [
  {
    id: 'business-info',
    title: { ar: 'معلومات النشاط التجاري', en: 'Business Information' },
    description: { ar: 'أضف تفاصيل نشاطك التجاري', en: 'Add your business details' },
    icon: User
  },
  {
    id: 'first-offer',
    title: { ar: 'العرض الأول', en: 'First Offer' },
    description: { ar: 'أنشئ عرضك الأول', en: 'Create your first offer' },
    icon: Tag
  },
  {
    id: 'subscription',
    title: { ar: 'اختيار الباقة', en: 'Choose Package' },
    description: { ar: 'اختر الباقة المناسبة', en: 'Select the right package' },
    icon: CreditCard
  },
  {
    id: 'learn',
    title: { ar: 'تعلم وابدأ', en: 'Learn & Start' },
    description: { ar: 'تعلم كيفية تحقيق أقصى استفادة', en: 'Learn how to maximize benefits' },
    icon: BookOpen
  }
];

const businessInfoSchema = z.object({
  businessName: z.string().min(2, "اسم النشاط التجاري مطلوب"),
  businessDescription: z.string().min(10, "وصف النشاط التجاري مطلوب"),
  businessCategory: z.string().min(1, "فئة النشاط التجاري مطلوبة"),
  businessCity: z.string().min(1, "المدينة مطلوبة"),
  businessPhone: z.string().min(10, "رقم الهاتف مطلوب"),
  businessWhatsapp: z.string().optional(),
});

const offerSchema = z.object({
  title: z.string().min(5, "عنوان العرض مطلوب"),
  description: z.string().min(20, "وصف العرض مطلوب"),
  discountPercentage: z.number().min(1).max(90),
  originalPrice: z.string().optional(),
  discountedPrice: z.string().optional(),
  validUntil: z.string().min(1, "تاريخ انتهاء العرض مطلوب"),
});

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function MerchantOnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { user } = useAuth();
  const { isRTL, dir } = useLanguage();
  const { t } = useTranslation();
  const { toast } = useToast();

  const businessForm = useForm({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: user?.businessName || "",
      businessDescription: user?.businessDescription || "",
      businessCategory: user?.businessCategory || "",
      businessCity: user?.businessCity || "",
      businessPhone: user?.businessPhone || "",
      businessWhatsapp: user?.businessWhatsapp || "",
    }
  });

  const offerForm = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      discountPercentage: 10,
      originalPrice: "",
      discountedPrice: "",
      validUntil: "",
    }
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: () => {
      markStepCompleted('business-info');
      nextStep();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/offers', data);
      return response.json();
    },
    onSuccess: () => {
      markStepCompleted('first-offer');
      nextStep();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء العرض",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onBusinessInfoSubmit = (data: any) => {
    updateBusinessMutation.mutate(data);
  };

  const onOfferSubmit = (data: any) => {
    createOfferMutation.mutate({
      ...data,
      categoryId: 1, // Default category for now
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8" dir={dir}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t("onboarding.welcome", { ar: "مرحباً بك في براق", en: "Welcome to Baraq" })}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {t("onboarding.subtitle", { ar: "دعنا نساعدك في إعداد حسابك خطوة بخطوة", en: "Let us help you set up your account step by step" })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              {t("onboarding.progress", { ar: `الخطوة ${currentStep + 1} من ${steps.length}`, en: `Step ${currentStep + 1} of ${steps.length}` })}
            </span>
            <span className="text-sm font-medium text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            const isPast = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  isActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : isCompleted || isPast
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${
                    isActive 
                      ? 'bg-purple-600 text-white' 
                      : isCompleted || isPast
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted || isPast ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  {isActive && (
                    <Badge className="bg-purple-600">
                      {t("onboarding.current", { ar: "الحالي", en: "Current" })}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  {t(`step.${step.id}.title`, step.title)}
                </h3>
                <p className="text-xs text-gray-600">
                  {t(`step.${step.id}.description`, step.description)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <currentStepData.icon className="w-6 h-6 text-purple-600" />
              {t(`step.${currentStepData.id}.title`, currentStepData.title)}
            </CardTitle>
            <CardDescription>
              {t(`step.${currentStepData.id}.description`, currentStepData.description)}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Business Information */}
            {currentStep === 0 && (
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessInfoSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={businessForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم النشاط التجاري</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="businessCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>فئة النشاط التجاري</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="restaurants">مطاعم</SelectItem>
                              <SelectItem value="fashion">أزياء</SelectItem>
                              <SelectItem value="electronics">إلكترونيات</SelectItem>
                              <SelectItem value="beauty">تجميل</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={businessForm.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف النشاط التجاري</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={businessForm.control}
                      name="businessCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المدينة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المدينة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="riyadh">الرياض</SelectItem>
                              <SelectItem value="jeddah">جدة</SelectItem>
                              <SelectItem value="dammam">الدمام</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="businessPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateBusinessMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {updateBusinessMutation.isPending ? "جاري الحفظ..." : "التالي"}
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2: First Offer */}
            {currentStep === 1 && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">نصائح لعرض ناجح</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• اكتب عنوان جذاب ومختصر</li>
                        <li>• اذكر تفاصيل العرض بوضوح</li>
                        <li>• حدد نسبة خصم معقولة</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Form {...offerForm}>
                  <form onSubmit={offerForm.handleSubmit(onOfferSubmit)} className="space-y-6">
                    <FormField
                      control={offerForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان العرض</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: خصم 30% على جميع المنتجات" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={offerForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف العرض</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={offerForm.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نسبة الخصم %</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={offerForm.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>السعر الأصلي (ريال)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={offerForm.control}
                        name="discountedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>السعر بعد الخصم (ريال)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={offerForm.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ انتهاء العرض</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                      >
                        <ArrowLeft className="w-4 h-4 ml-2" />
                        السابق
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={createOfferMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {createOfferMutation.isPending ? "جاري الإنشاء..." : "إنشاء العرض"}
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {/* Step 3: Subscription Plans */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">اختر الباقة المناسبة لك</h3>
                  <p className="text-gray-600">يمكنك البدء بالباقة المجانية وترقيتها لاحقاً</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Package cards would go here */}
                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">الباقة المجانية</h4>
                      <p className="text-gray-600 mb-4">مثالية للبداية</p>
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          markStepCompleted('subscription');
                          nextStep();
                        }}
                      >
                        اختيار الباقة
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 4: Learn & Start */}
            {currentStep === 3 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    مبروك! تم إعداد حسابك بنجاح
                  </h3>
                  <p className="text-gray-600 text-lg">
                    أنت الآن جاهز للبدء في استقبال العملاء وزيادة مبيعاتك
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-4">نصائح للنجاح</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-yellow-500 mt-1" />
                      <div>
                        <h5 className="font-medium">أضف عروض منتظمة</h5>
                        <p className="text-sm text-gray-600">انشر عروض جديدة بانتظام لجذب المزيد من العملاء</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <h5 className="font-medium">تفاعل مع العملاء</h5>
                        <p className="text-sm text-gray-600">رد على استفسارات العملاء بسرعة</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                  onClick={onComplete}
                >
                  ابدأ الآن
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}