import { useQuery } from "@tanstack/react-query";
import { Star, CheckCircle, MessageCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface Review {
  id: number;
  overallRating: number;
  visibility: number;
  performance: number;
  traffic: number;
  valueForMoney: number;
  title: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  bookingId?: number;
}

interface ReviewsData {
  reviews: Review[];
  averages: {
    overall: number;
    visibility: number;
    performance: number;
    traffic: number;
    valueForMoney: number;
  };
  totalReviews: number;
}

interface ReviewDisplayProps {
  locationId: number;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function RatingBreakdown({ averages, totalReviews }: { averages: ReviewsData["averages"]; totalReviews: number }) {
  const categories = [
    { key: "overall", label: "التقييم العام", value: averages.overall },
    { key: "visibility", label: "وضوح الشاشة", value: averages.visibility },
    { key: "performance", label: "أداء الحملة", value: averages.performance },
    { key: "traffic", label: "حركة المرور", value: averages.traffic },
    { key: "valueForMoney", label: "القيمة مقابل المال", value: averages.valueForMoney },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ملخص التقييمات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{averages.overall.toFixed(1)}</div>
          <StarRating rating={Math.round(averages.overall)} size="lg" />
          <p className="text-sm text-muted-foreground mt-1">
            بناءً على {totalReviews} تقييم
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          {categories.slice(1).map((category) => (
            <div key={category.key} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium flex-1">{category.label}</span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Progress value={(category.value / 5) * 100} className="flex-1" />
                <span className="text-sm font-medium min-w-[2.5rem] text-right">
                  {category.value.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarFallback>{getUserInitials(review.user.username)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.user.username}</span>
                {review.isVerified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    موثق
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(review.createdAt)}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={review.overallRating} />
              <span className="text-sm text-muted-foreground">
                {review.overallRating}/5
              </span>
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              <h4 className="font-medium">{review.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">وضوح</div>
                <div className="text-sm font-medium">{review.visibility}/5</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">أداء</div>
                <div className="text-sm font-medium">{review.performance}/5</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">مرور</div>
                <div className="text-sm font-medium">{review.traffic}/5</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">قيمة</div>
                <div className="text-sm font-medium">{review.valueForMoney}/5</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewDisplay({ locationId }: ReviewDisplayProps) {
  const { data: reviewsData, isLoading, error } = useQuery<ReviewsData>({
    queryKey: ["/api/locations", locationId, "reviews"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !reviewsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>فشل في تحميل التقييمات</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviewsData.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد تقييمات بعد</p>
            <p className="text-sm">كن أول من يقيم هذا الموقع</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <RatingBreakdown 
        averages={reviewsData.averages} 
        totalReviews={reviewsData.totalReviews} 
      />

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          التقييمات ({reviewsData.totalReviews})
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviewsData.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}