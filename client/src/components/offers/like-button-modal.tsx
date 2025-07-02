import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Loader2 } from "lucide-react";
import type { OfferWithRelations } from "@shared/schema";

const leadSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  phone: z.string().min(10, "رقم الجوال يجب أن يكون 10 أرقام على الأقل"),
  city: z.string().min(2, "اختر المدينة"),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LikeButtonModalProps {
  offer: OfferWithRelations;
}

const saudiCities = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران",
  "الطائف", "بريدة", "تبوك", "خميس مشيط", "الهفوف", "المبرز", "نجران", "الجبيل",
  "ينبع", "الخرج", "عرعر", "سكاكا", "جازان", "أبها", "القطيف", "الباحة", "حائل",
  "الدوادمي", "صبيا", "الليث", "رابغ", "القنفذة", "الوجه", "أملج", "ضباء",
  "البدائع", "الرس", "عنيزة", "الزلفي", "المجمعة", "القويعية", "الأفلاج",
  "وادي الدواسر", "السليل", "شرورة", "بيشة", "محايل عسير", "النماص", "تنومة",
  "ظهران الجنوب", "أحد رفيدة", "الفرشة", "العقيق", "الداير", "فيفا"
];

export function LikeButtonModal({ offer }: LikeButtonModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      fullName: user?.businessName || "",
      phone: user?.phone || "",
      city: user?.city || "",
    },
  });

  const submitLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const response = await apiRequest('POST', '/api/leads', {
        ...data,
        offerId: offer.id,
        merchantId: offer.businessId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال اهتمامك بنجاح!",
        description: "سيتواصل معك التاجر قريباً عبر الواتساب أو الهاتف",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إرسال البيانات",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    submitLeadMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-red-500 hover:bg-red-600 text-white"
          size="lg"
        >
          <Heart className="w-5 h-5 mr-2" />
          أعجبني هذا العرض
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            أعجبك العرض؟ تواصل مع التاجر
          </DialogTitle>
          <DialogDescription>
            اترك بياناتك وسيتواصل معك <span className="font-medium">{offer.business?.businessName}</span> مباشرة
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="أدخل اسمك الكامل" 
                      {...field} 
                      className="text-right"
                    />
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
                  <FormLabel>رقم الجوال</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="05xxxxxxxx" 
                      {...field} 
                      className="text-right"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المدينة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر مدينتك" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {saudiCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitLeadMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {submitLeadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    إرسال الاهتمام
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}