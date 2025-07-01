import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addWeeks } from "date-fns";
import { CalendarIcon, MapPin, Clock, DollarSign, Upload, FileImage, FileVideo, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { insertScreenBookingSchema, type ScreenLocation, type ScreenPricingOption, type ScreenLocationWithPricing } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const bookingFormSchema = insertScreenBookingSchema.extend({
  mediaFile: z.any().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface EnhancedBookingFlowProps {
  locationId?: number;
  onBookingComplete?: (bookingId: number) => void;
}

export default function EnhancedBookingFlow({ locationId, onBookingComplete }: EnhancedBookingFlowProps) {
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<ScreenLocationWithPricing | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<ScreenPricingOption | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [step, setStep] = useState<'location' | 'pricing' | 'schedule' | 'content' | 'review' | 'confirmation'>('location');

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      locationId: locationId || 0,
      pricingOptionId: 0,
      startDateTime: new Date(),
      endDateTime: new Date(),
      duration: 1,
      totalPrice: "0",
      mediaType: "image",
      requestNotes: "",
      requestNotesAr: "",
    },
  });

  // Fetch available screen locations with pricing
  const { data: locations = [], isLoading: locationsLoading } = useQuery<ScreenLocationWithPricing[]>({
    queryKey: ["/api/screen-locations-with-pricing"],
    queryFn: async () => {
      const [locationsRes, pricingRes] = await Promise.all([
        apiRequest("GET", "/api/screen-locations"),
        apiRequest("GET", "/api/screen-pricing-options")
      ]);
      
      const locations = await locationsRes.json();
      const pricing = await pricingRes.json();
      
      return locations.map((location: ScreenLocation) => ({
        ...location,
        pricingOptions: pricing.filter((p: ScreenPricingOption) => p.locationId === location.id)
      }));
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const formData = new FormData();
      
      // Add booking data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'mediaFile' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add media file if uploaded
      if (uploadedFile) {
        formData.append('mediaFile', uploadedFile);
      }

      const response = await apiRequest("POST", "/api/screen-bookings", formData);
      return await response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "تم إرسال طلب الحجز بنجاح",
        description: "سيتم مراجعة طلبك من قبل الإدارة وإشعارك بالنتيجة قريباً",
      });
      setStep('confirmation');
      queryClient.invalidateQueries({ queryKey: ["/api/screen-bookings"] });
      onBookingComplete?.(booking.id);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال الطلب",
        description: error.message || "حدث خطأ أثناء إرسال طلب الحجز",
        variant: "destructive",
      });
    },
  });

  // Calculate pricing based on selection
  useEffect(() => {
    if (selectedPricing && startDate && endDate) {
      const timeDiff = endDate.getTime() - startDate.getTime();
      const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));
      
      let units = 1;
      if (selectedPricing.pricingType === 'hourly') {
        units = Math.max(1, hoursDiff);
      } else if (selectedPricing.pricingType === 'daily') {
        units = Math.max(1, Math.ceil(hoursDiff / 24));
      } else if (selectedPricing.pricingType === 'weekly') {
        units = Math.max(1, Math.ceil(hoursDiff / (24 * 7)));
      }

      const calculatedPrice = units * parseFloat(selectedPricing.pricePerUnit.toString());
      setTotalPrice(calculatedPrice);
      
      form.setValue('duration', hoursDiff);
      form.setValue('totalPrice', calculatedPrice.toString());
    }
  }, [selectedPricing, startDate, endDate, form]);

  // Auto-select location if provided
  useEffect(() => {
    if (locationId && locations.length > 0) {
      const location = locations.find(l => l.id === locationId);
      if (location) {
        setSelectedLocation(location);
        form.setValue('locationId', locationId);
        setStep('pricing');
      }
    }
  }, [locationId, locations, form]);

  const handleLocationSelect = (location: ScreenLocationWithPricing) => {
    setSelectedLocation(location);
    form.setValue('locationId', location.id);
    setStep('pricing');
  };

  const handlePricingSelect = (pricing: ScreenPricingOption) => {
    setSelectedPricing(pricing);
    form.setValue('pricingOptionId', pricing.id);
    
    // Auto-calculate end date based on pricing type
    if (startDate) {
      let calculatedEndDate = new Date(startDate);
      if (pricing.pricingType === 'daily') {
        calculatedEndDate = addDays(startDate, 1);
      } else if (pricing.pricingType === 'weekly') {
        calculatedEndDate = addWeeks(startDate, 1);
      } else {
        calculatedEndDate = new Date(startDate.getTime() + (3600 * 1000)); // 1 hour
      }
      setEndDate(calculatedEndDate);
      form.setValue('endDateTime', calculatedEndDate);
    }
    
    setStep('schedule');
  };

  const handleScheduleConfirm = () => {
    if (startDate && endDate) {
      form.setValue('startDateTime', startDate);
      form.setValue('endDateTime', endDate);
      setStep('content');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      form.setValue('mediaType', file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  const renderLocationStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          اختر موقع الشاشة
        </CardTitle>
        <CardDescription>
          اختر الموقع المناسب لعرض إعلانك من المواقع المتاحة
        </CardDescription>
      </CardHeader>
      <CardContent>
        {locationsLoading ? (
          <div className="text-center py-8">جاري تحميل المواقع...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Card 
                key={location.id} 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedLocation?.id === location.id && "ring-2 ring-primary"
                )}
                onClick={() => handleLocationSelect(location)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold">{location.nameAr}</h3>
                    <p className="text-sm text-muted-foreground">{location.addressAr}</p>
                    <Badge variant={location.isActive ? "default" : "secondary"}>
                      {location.isActive ? "متاح" : "غير متاح"}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {location.pricingOptions?.length || 0} خيار تسعير متاح
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPricingStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          اختر باقة التسعير
        </CardTitle>
        <CardDescription>
          اختر الباقة المناسبة لمدة عرض إعلانك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {selectedLocation?.pricingOptions?.map((pricing) => (
            <Card 
              key={pricing.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedPricing?.id === pricing.id && "ring-2 ring-primary"
              )}
              onClick={() => handlePricingSelect(pricing)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{pricing.pricingTypeAr}</h3>
                  <div className="text-2xl font-bold text-primary my-2">
                    {parseFloat(pricing.pricePerUnit.toString()).toLocaleString()} ريال
                  </div>
                  <p className="text-sm text-muted-foreground">
                    لمدة {pricing.durationHours} ساعة
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderScheduleStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          حدد مواعيد العرض
        </CardTitle>
        <CardDescription>
          اختر تاريخ ووقت بداية ونهاية عرض إعلانك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>تاريخ البداية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>تاريخ النهاية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < (startDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {selectedPricing && startDate && endDate && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>المدة المحددة: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600))} ساعة</div>
                <div className="font-semibold">التكلفة الإجمالية: {totalPrice.toLocaleString()} ريال سعودي</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleScheduleConfirm} disabled={!startDate || !endDate} className="w-full">
          تأكيد المواعيد
        </Button>
      </CardContent>
    </Card>
  );

  const renderContentStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          رفع المحتوى الإعلاني
        </CardTitle>
        <CardDescription>
          ارفع الصورة أو الفيديو الذي تريد عرضه على الشاشة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="media-upload">ملف الإعلان</Label>
          <Input
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
          {uploadedFile && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              {uploadedFile.type.startsWith('video/') ? <FileVideo className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
              تم رفع الملف: {uploadedFile.name}
            </div>
          )}
        </div>

        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="requestNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أي تعليمات أو ملاحظات خاصة بالإعلان..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestNotesAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات بالعربية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ملاحظات إضافية باللغة العربية..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>

        <Button onClick={() => setStep('review')} className="w-full">
          مراجعة الطلب
        </Button>
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>مراجعة طلب الحجز</CardTitle>
        <CardDescription>
          تأكد من صحة جميع البيانات قبل إرسال الطلب
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="font-semibold">الموقع المختار</Label>
            <div>{selectedLocation?.nameAr}</div>
            <div className="text-sm text-muted-foreground">{selectedLocation?.addressAr}</div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">باقة التسعير</Label>
            <div>{selectedPricing?.pricingTypeAr}</div>
            <div className="text-sm text-muted-foreground">
              {parseFloat(selectedPricing?.pricePerUnit.toString() || "0").toLocaleString()} ريال / {selectedPricing?.pricingType}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">مواعيد العرض</Label>
            <div>من: {startDate ? format(startDate, "PPP") : "غير محدد"}</div>
            <div>إلى: {endDate ? format(endDate, "PPP") : "غير محدد"}</div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">التكلفة الإجمالية</Label>
            <div className="text-2xl font-bold text-primary">
              {totalPrice.toLocaleString()} ريال سعودي
            </div>
            <div className="text-sm text-muted-foreground">شامل ضريبة القيمة المضافة</div>
          </div>
        </div>

        {uploadedFile && (
          <div className="space-y-2">
            <Label className="font-semibold">المحتوى المرفوع</Label>
            <div className="flex items-center gap-2">
              {uploadedFile.type.startsWith('video/') ? <FileVideo className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
              {uploadedFile.name}
            </div>
          </div>
        )}

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                بعد إرسال الطلب، سيتم مراجعته من قبل الإدارة وإشعارك بالنتيجة خلال 24 ساعة.
                في حالة الموافقة، ستحصل على فاتورة للدفع.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "جاري الإرسال..." : "إرسال طلب الحجز"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderConfirmationStep = () => (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-green-700">تم إرسال طلب الحجز بنجاح!</CardTitle>
        <CardDescription>
          شكراً لك! تم استلام طلب حجز الشاشة الإعلانية بنجاح
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p>سيتم مراجعة طلبك من قبل فريق الإدارة وإشعارك بالنتيجة خلال 24 ساعة.</p>
        <p>في حالة الموافقة على الطلب، ستحصل على فاتورة للدفع.</p>
        
        <div className="space-y-2">
          <Button variant="outline" onClick={() => window.location.href = '/business-dashboard'} className="w-full">
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'location', label: 'اختيار الموقع' },
              { key: 'pricing', label: 'التسعير' },
              { key: 'schedule', label: 'المواعيد' },
              { key: 'content', label: 'المحتوى' },
              { key: 'review', label: 'المراجعة' },
              { key: 'confirmation', label: 'التأكيد' },
            ].map((stepItem, index) => (
              <div key={stepItem.key} className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    step === stepItem.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <div className="ml-2 text-sm font-medium">{stepItem.label}</div>
                {index < 5 && <div className="ml-4 h-px w-8 bg-muted" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 'location' && renderLocationStep()}
        {step === 'pricing' && renderPricingStep()}
        {step === 'schedule' && renderScheduleStep()}
        {step === 'content' && renderContentStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'confirmation' && renderConfirmationStep()}

        {/* Navigation */}
        {step !== 'location' && step !== 'confirmation' && (
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const steps = ['location', 'pricing', 'schedule', 'content', 'review'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1] as any);
                }
              }}
            >
              العودة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}