import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const saveOfferSchema = z.object({
  fullName: z.string().min(2, "يجب أن يحتوي الاسم على حرفين على الأقل"),
  phoneNumber: z.string().min(10, "يجب أن يحتوي رقم الهاتف على 10 أرقام على الأقل"),
  city: z.string().min(1, "يرجى اختيار المدينة"),
});

type SaveOfferFormData = z.infer<typeof saveOfferSchema>;

interface SaveOfferDialogProps {
  offerId: number;
  offerTitle: string;
}

const saudiCities = [
  "الرياض",
  "جدة", 
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الطائف",
  "بريدة",
  "تبوك",
  "خميس مشيط",
  "حائل",
  "نجران",
  "الجبيل",
  "ينبع",
  "أبها",
  "عرعر",
  "سكاكا",
  "جازان",
  "القطيف",
  "الأحساء"
];

export default function SaveOfferDialog({ offerId, offerTitle }: SaveOfferDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SaveOfferFormData>({
    resolver: zodResolver(saveOfferSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      city: "",
    },
  });

  const saveOfferMutation = useMutation({
    mutationFn: async (data: SaveOfferFormData) => {
      const res = await apiRequest("POST", "/api/favorites", {
        ...data,
        offerId,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ العرض",
        description: "تم حفظ العرض في قائمة المفضلة بنجاح",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حفظ العرض",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SaveOfferFormData) => {
    saveOfferMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Heart className="h-4 w-4" />
          حفظ العرض
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">حفظ العرض في المفضلة</DialogTitle>
          <DialogDescription className="text-right">
            احفظ العرض "{offerTitle}" في قائمة المفضلة لديك
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="أدخل اسمك الكامل" 
                      className="text-right" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="05xxxxxxxx" 
                      className="text-right" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">المدينة</FormLabel>
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
                  <FormMessage className="text-right" />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={saveOfferMutation.isPending}
                className="gap-2"
              >
                <Heart className="h-4 w-4" />
                {saveOfferMutation.isPending ? "جاري الحفظ..." : "حفظ العرض"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}