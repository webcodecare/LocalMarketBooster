import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  locationId: z.number(),
  bookingId: z.number().optional(),
  overallRating: z.number().min(1).max(5),
  visibility: z.number().min(1).max(5),
  performance: z.number().min(1).max(5),
  traffic: z.number().min(1).max(5),
  valueForMoney: z.number().min(1).max(5),
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  comment: z.string().min(20, "التعليق يجب أن يكون 20 حرف على الأقل")
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  locationId: number;
  locationName: string;
  bookingId?: number;
  onSuccess?: () => void;
}

function StarRating({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (rating: number) => void; 
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ locationId, locationName, bookingId, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      locationId,
      bookingId,
      overallRating: 5,
      visibility: 5,
      performance: 5,
      traffic: 5,
      valueForMoney: 5,
      title: "",
      comment: ""
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const res = await apiRequest("POST", "/api/reviews/submit", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations", locationId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/merchant/reviewable-bookings"] });
      toast({
        title: "تم إرسال التقييم بنجاح",
        description: "شكراً لك على تقييمك، سيساعد التجار الآخرين في اتخاذ قراراتهم",
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال التقييم",
        description: error.message || "حدث خطأ أثناء إرسال التقييم",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    submitReviewMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Star className="mr-2 h-4 w-4" />
          تقييم الموقع
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تقييم موقع الشاشة</DialogTitle>
          <p className="text-sm text-muted-foreground">{locationName}</p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Rating Sections */}
          <div className="grid md:grid-cols-2 gap-4">
            <StarRating
              label="التقييم العام"
              value={form.watch("overallRating")}
              onChange={(rating) => form.setValue("overallRating", rating)}
            />
            <StarRating
              label="وضوح الشاشة"
              value={form.watch("visibility")}
              onChange={(rating) => form.setValue("visibility", rating)}
            />
            <StarRating
              label="أداء الحملة"
              value={form.watch("performance")}
              onChange={(rating) => form.setValue("performance", rating)}
            />
            <StarRating
              label="حركة المرور"
              value={form.watch("traffic")}
              onChange={(rating) => form.setValue("traffic", rating)}
            />
            <StarRating
              label="القيمة مقابل المال"
              value={form.watch("valueForMoney")}
              onChange={(rating) => form.setValue("valueForMoney", rating)}
            />
          </div>

          {/* Review Content */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان التقييم</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="خلاصة تجربتك مع هذا الموقع"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="comment">تفاصيل التقييم</Label>
              <Textarea
                id="comment"
                {...form.register("comment")}
                placeholder="شارك تجربتك التفصيلية مع هذا الموقع، النقاط الإيجابية والسلبية..."
                rows={4}
              />
              {form.formState.errors.comment && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.comment.message}
                </p>
              )}
            </div>
          </div>

          {/* Verification Notice */}
          {bookingId && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">تقييم موثق - تم التحقق من حجزك</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={submitReviewMutation.isPending}
              className="flex-1"
            >
              {submitReviewMutation.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}