import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, MapPin } from "lucide-react";
import { ReviewForm } from "@/components/reviews/review-form";

interface ReviewableBooking {
  id: number;
  campaignTitle: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    nameAr: string;
    address: string;
    addressAr: string;
  };
  hasReview: boolean;
}

export default function MerchantReviews() {
  const { user } = useAuth();

  const { data: reviewableBookings = [], isLoading } = useQuery<ReviewableBooking[]>({
    queryKey: ["/api/merchant/reviewable-bookings"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>يجب تسجيل الدخول لعرض التقييمات</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">تقييم المواقع</h1>
        <p className="text-muted-foreground">
          قيم المواقع التي حجزتها لمساعدة التجار الآخرين في اتخاذ قراراتهم
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      ) : reviewableBookings.length > 0 ? (
        <div className="space-y-6">
          {reviewableBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <div>
                      <h3 className="text-lg font-semibold">{booking.location.nameAr}</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {booking.campaignTitle}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    حملة مكتملة
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.location.addressAr}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(booking.startDate).toLocaleDateString('ar-SA')} - {' '}
                        {new Date(booking.endDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        شارك تجربتك مع هذا الموقع لمساعدة التجار الآخرين في اتخاذ قراراتهم المستقبلية.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <ReviewForm
                      locationId={1} // Will be provided by API response
                      locationName={booking.location.nameAr}
                      bookingId={booking.id}
                      onSuccess={() => {
                        // Refresh the reviewable bookings list
                        window.location.reload();
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">لا توجد حملات للتقييم</h3>
              <p className="mb-4">
                ستظهر هنا الحملات المكتملة التي يمكنك تقييمها
              </p>
              <Button 
                onClick={() => window.location.href = '/screen-ads'}
                variant="outline"
              >
                تصفح المواقع المتاحة
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}