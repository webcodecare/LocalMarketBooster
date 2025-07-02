import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const likeFormSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  mobileNumber: z.string().min(10, "رقم الجوال مطلوب"),
  city: z.string().min(1, "المدينة مطلوبة")
});

interface OfferLikeButtonProps {
  offerId: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function OfferLikeButton({ offerId, variant = "outline", size = "sm" }: OfferLikeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(likeFormSchema),
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      city: ""
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof likeFormSchema>) => {
      const response = await apiRequest('POST', `/api/offers/${offerId}/like`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح!",
        description: "تم إرسال اهتمامك بالعرض للتاجر بنجاح. سيتواصل معك قريباً.",
        variant: "default",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال طلبك. حاول مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof likeFormSchema>) => {
    likeMutation.mutate(data);
  };

  const saudiCities = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران",
    "تبوك", "أبها", "الطائف", "بريدة", "خميس مشيط", "حائل", "الجبيل", "نجران",
    "الخرج", "ينبع", "الأحساء", "القطيف", "عرعر", "سكاكا", "جازان", "الباحة"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Heart className="w-4 h-4" />
          أعجبني هذا العرض
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">أعجبني هذا العرض</DialogTitle>
          <DialogDescription className="text-right">
            أدخل بياناتك وسيتواصل معك التاجر لتفاصيل العرض
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
                    <Input {...field} placeholder="أدخل اسمك الكامل" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الجوال</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="05xxxxxxxx" dir="ltr" />
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
                      <SelectTrigger>
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
                disabled={likeMutation.isPending}
                className="flex-1"
              >
                {likeMutation.isPending ? "جاري الإرسال..." : "إرسال"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}