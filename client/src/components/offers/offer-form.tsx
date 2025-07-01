import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertOfferSchema, type InsertOffer, type OfferWithRelations, type Category } from "@shared/schema";
import { z } from "zod";
import { Upload, Link, X } from "lucide-react";

const offerFormSchema = insertOfferSchema.omit({ businessId: true }).extend({
  endDate: z.string().optional(),
  startDate: z.string().optional(),
  categoryId: z.number().min(1, "الفئة مطلوبة"),
  city: z.string().optional(),
  targetBranches: z.array(z.string()).optional(),
  targetCities: z.array(z.string()).optional(),
  discountPercentage: z.number().optional(),
  discountCode: z.string().optional(),
  originalPrice: z.string().optional(),
  discountedPrice: z.string().optional(),
  link: z.string().optional(),
  imageUrl: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate && data.startDate.trim() !== "" && data.endDate.trim() !== "") {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  }
  return true;
}, {
  message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية",
  path: ["endDate"],
});

type OfferFormData = z.infer<typeof offerFormSchema>;

interface OfferFormProps {
  offer?: OfferWithRelations | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const saudiCities = [
  "جميع أنحاء المملكة",
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

export default function OfferForm({ offer, onSuccess, onCancel }: OfferFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUploadMode, setImageUploadMode] = useState<"url" | "upload">("url");
  const [targetingMode, setTargetingMode] = useState<"branches" | "cities">("cities");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["/api/business/branches"],
  });

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: offer?.title || "",
      description: offer?.description || "",
      categoryId: offer?.categoryId || 0,
      imageUrl: offer?.imageUrl || "",
      discountPercentage: offer?.discountPercentage || undefined,
      discountCode: offer?.discountCode || "",
      originalPrice: offer?.originalPrice || "",
      discountedPrice: offer?.discountedPrice || "",
      link: offer?.link || "",
      linkType: offer?.linkType || "whatsapp",
      city: offer?.city || "",
      targetBranches: offer?.targetBranches || [],
      targetCities: offer?.targetCities || [],
      startDate: offer?.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: offer?.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : "",
      isActive: offer?.isActive ?? true,
      isFeatured: offer?.isFeatured ?? false,
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      const offerData = {
        ...data,
        startDate: data.startDate && data.startDate.trim() ? new Date(data.startDate) : undefined,
        endDate: data.endDate && data.endDate.trim() ? new Date(data.endDate) : undefined,
      };
      
      const response = await apiRequest("POST", "/api/business/offers", offerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء العرض",
        description: "تم إنشاء العرض بنجاح وسيتم مراجعته قبل النشر",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء العرض",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      if (!offer) throw new Error("No offer to update");
      
      const offerData = {
        ...data,
        startDate: data.startDate && data.startDate.trim() ? new Date(data.startDate) : undefined,
        endDate: data.endDate && data.endDate.trim() ? new Date(data.endDate) : undefined,
      };
      
      const response = await apiRequest("PUT", `/api/business/offers/${offer.id}`, offerData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث العرض",
        description: "تم تحديث العرض بنجاح",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث العرض",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OfferFormData) => {
    if (offer) {
      updateOfferMutation.mutate(data);
    } else {
      createOfferMutation.mutate(data);
    }
  };

  const cities = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران",
    "الطائف", "بريدة", "تبوك", "خميس مشيط", "الهفوف", "المبرز", "حائل", "نجران",
    "الجبيل", "ينبع", "القطيف", "عرعر", "سكاكا", "جازان", "أبها", "القنفذة"
  ];

  const isLoading = createOfferMutation.isPending || updateOfferMutation.isPending;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يرجى اختيار صورة أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        form.setValue("imageUrl", dataUrl);
      };
      reader.readAsDataURL(file);

      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم رفع الصورة وإضافتها للعرض",
      });
    } catch (error) {
      toast({
        title: "خطأ في رفع الصورة",
        description: "حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>عنوان العرض *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="مثال: خصم 30% على جميع الوجبات" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>وصف العرض *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="اكتب وصفاً مفصلاً عن العرض، شروط الاستخدام، والتفاصيل المهمة"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الفئة *</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة العرض" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.emoji} {category.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Targeting Mode Selection */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">استهداف العرض</label>
            <Tabs value={targetingMode} onValueChange={(value) => setTargetingMode(value as "branches" | "cities")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="branches">استهداف الفروع</TabsTrigger>
                <TabsTrigger value="cities">استهداف المدن</TabsTrigger>
              </TabsList>
              
              <TabsContent value="branches" className="space-y-4">
                <FormField
                  control={form.control}
                  name="targetBranches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اختر الفروع</FormLabel>
                      {branches.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p>لا توجد فروع مسجلة</p>
                          <p className="text-sm">يمكنك إضافة الفروع من ملف التاجر</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                          <label className="flex items-center space-x-reverse space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value?.length === branches.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange(branches.map((b: any) => b.id.toString()));
                                } else {
                                  field.onChange([]);
                                }
                              }}
                              className="rounded"
                            />
                            <span className="font-medium">جميع الفروع</span>
                          </label>
                          {branches.map((branch: any) => (
                            <label key={branch.id} className="flex items-center space-x-reverse space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value?.includes(branch.id.toString()) || false}
                                onChange={(e) => {
                                  const currentValues = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentValues, branch.id.toString()]);
                                  } else {
                                    field.onChange(currentValues.filter((id: string) => id !== branch.id.toString()));
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{branch.name} - {branch.city}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="cities" className="space-y-4">
                <FormField
                  control={form.control}
                  name="targetCities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اختر المدن</FormLabel>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                        <label className="flex items-center space-x-reverse space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value?.includes("جميع أنحاء المملكة") || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange(["جميع أنحاء المملكة"]);
                              } else {
                                field.onChange([]);
                              }
                            }}
                            className="rounded"
                          />
                          <span className="font-medium">جميع أنحاء المملكة</span>
                        </label>
                        {saudiCities.filter(city => city !== "جميع أنحاء المملكة").map((city) => (
                          <label key={city} className="flex items-center space-x-reverse space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(city) || false}
                              disabled={field.value?.includes("جميع أنحاء المملكة")}
                              onChange={(e) => {
                                const currentValues = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentValues.filter(c => c !== "جميع أنحاء المملكة"), city]);
                                } else {
                                  field.onChange(currentValues.filter((c: string) => c !== city));
                                }
                              }}
                              className="rounded"
                            />
                            <span>{city}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>صورة العرض</FormLabel>
                <div className="space-y-4">
                  <Tabs value={imageUploadMode} onValueChange={(value) => setImageUploadMode(value as "url" | "upload")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        رابط الصورة
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        رفع صورة
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="url" className="space-y-2">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://example.com/image.jpg"
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setUploadedImage(null);
                          }}
                        />
                      </FormControl>
                      {field.value && field.value.startsWith('http') && (
                        <div className="mt-2">
                          <img 
                            src={field.value} 
                            alt="معاينة الصورة" 
                            className="max-w-xs h-32 object-cover rounded-lg border"
                            onError={() => {
                              toast({
                                title: "خطأ في تحميل الصورة",
                                description: "تأكد من صحة رابط الصورة",
                                variant: "destructive",
                              });
                            }}
                          />
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        
                        {uploadedImage || (field.value && field.value.startsWith('data:')) ? (
                          <div className="space-y-4">
                            <div className="relative inline-block">
                              <img 
                                src={uploadedImage || field.value} 
                                alt="الصورة المرفوعة" 
                                className="max-w-xs h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeUploadedImage}
                                className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2"
                            >
                              تغيير الصورة
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">انقر لرفع صورة أو اسحب واتركها هنا</p>
                            <p className="text-sm text-gray-500">JPG, PNG, GIF حتى 5MB</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نسبة الخصم (%) - اختياري</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="1" 
                    max="100" 
                    placeholder="30"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>كود الخصم - اختياري</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SAVE30" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="originalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر الأصلي - اختياري</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="100 ريال" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر بعد الخصم - اختياري</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="70 ريال" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الرابط *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="whatsapp">واتساب</SelectItem>
                    <SelectItem value="website">موقع إلكتروني</SelectItem>
                    <SelectItem value="phone">رقم هاتف</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {form.watch("linkType") === "whatsapp" && "رقم الواتساب - اختياري"}
                  {form.watch("linkType") === "website" && "رابط الموقع - اختياري"}
                  {form.watch("linkType") === "phone" && "رقم الهاتف - اختياري"}
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ""}
                    placeholder={
                      form.watch("linkType") === "whatsapp" ? "966501234567" :
                      form.watch("linkType") === "website" ? "https://example.com" :
                      "966501234567"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ بداية العرض</FormLabel>
                <FormControl>
                  <Input {...field} type="date" value={field.value || ""} />
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
                <FormLabel>تاريخ انتهاء العرض - اختياري</FormLabel>
                <FormControl>
                  <Input {...field} type="date" value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
          )}
          <Button 
            type="submit" 
            className="bg-saudi-green hover:bg-green-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                {offer ? "جاري التحديث..." : "جاري الإنشاء..."}
              </>
            ) : (
              offer ? "تحديث العرض" : "إنشاء العرض"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
