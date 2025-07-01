import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import OfferCard from "@/components/offers/offer-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { UserWithBranches, OfferWithRelations } from "@shared/schema";

export default function BusinessProfile() {
  const { businessId } = useParams();

  const { data: business, isLoading: businessLoading } = useQuery<UserWithBranches>({
    queryKey: [`/api/business/profile/${businessId}`],
    enabled: !!businessId,
  });

  const { data: offers = [], isLoading: offersLoading } = useQuery<OfferWithRelations[]>({
    queryKey: [`/api/business/${businessId}/offers`],
    enabled: !!businessId,
  });

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">المتجر غير موجود</h1>
              <p className="text-gray-600 mb-6">المتجر المطلوب غير متوفر</p>
              <Button onClick={() => window.location.href = '/'}>
                العودة إلى الصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const activeOffers = offers.filter(offer => offer.isActive && offer.isApproved);
  const totalViews = offers.reduce((sum, offer) => sum + (offer.views || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {business.businessLogo ? (
                  <img 
                    src={business.businessLogo} 
                    alt={business.businessName || 'شعار المتجر'}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-saudi-green to-green-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-store text-4xl text-white"></i>
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {business.businessName || business.username}
                  </h1>
                  {business.isApproved && (
                    <Badge className="bg-green-100 text-green-800">
                      <i className="fas fa-check-circle ml-1"></i>
                      موثق
                    </Badge>
                  )}
                </div>

                {business.businessDescription && (
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {business.businessDescription}
                  </p>
                )}

                {/* Business Stats */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-saudi-green">{activeOffers.length}</div>
                    <div className="text-sm text-gray-600">عرض نشط</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-saudi-green">{business.branches?.length || 0}</div>
                    <div className="text-sm text-gray-600">فرع</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-saudi-green">{totalViews}</div>
                    <div className="text-sm text-gray-600">مشاهدة</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {business.businessPhone && (
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-phone ml-3 w-5"></i>
                      <span>{business.businessPhone}</span>
                    </div>
                  )}
                  {business.businessCity && (
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-map-marker-alt ml-3 w-5"></i>
                      <span>{business.businessCity}</span>
                    </div>
                  )}
                  {business.businessWebsite && (
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-globe ml-3 w-5"></i>
                      <a 
                        href={business.businessWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-saudi-green hover:underline"
                      >
                        زيارة الموقع
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {(business.businessWebsite || business.businessPhone) && (
                  <div className="flex gap-3 mt-4">
                    {business.businessWebsite && (
                      <a 
                        href={business.businessWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-saudi-green hover:text-green-700 text-xl"
                      >
                        <i className="fas fa-globe"></i>
                      </a>
                    )}
                    {business.businessPhone && (
                      <a 
                        href={`tel:${business.businessPhone}`} 
                        className="text-saudi-green hover:text-green-700 text-xl"
                      >
                        <i className="fas fa-phone"></i>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branches Section */}
        {business.branches && business.branches.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-map-marker-alt ml-2"></i>
                الفروع ({business.branches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {business.branches.map((branch) => (
                  <div key={branch.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{branch.name}</h4>
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <i className="fas fa-city ml-2 w-4"></i>
                        <span>{branch.city}</span>
                      </div>
                      {branch.address && (
                        <div className="flex items-start">
                          <i className="fas fa-home ml-2 w-4 mt-0.5"></i>
                          <span>{branch.address}</span>
                        </div>
                      )}
                      {branch.phone && (
                        <div className="flex items-center">
                          <i className="fas fa-phone ml-2 w-4"></i>
                          <span>{branch.phone}</span>
                        </div>
                      )}
                      {branch.mapsLink && (
                        <div className="flex items-center">
                          <i className="fas fa-map ml-2 w-4"></i>
                          <a 
                            href={branch.mapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-saudi-green hover:underline"
                          >
                            عرض على الخريطة
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Current Offers Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              العروض الحالية ({activeOffers.length})
            </h2>
          </div>

          {offersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : activeOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <i className="fas fa-tags text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عروض حالياً</h3>
                <p className="text-gray-600">هذا المتجر ليس لديه عروض نشطة في الوقت الحالي</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}