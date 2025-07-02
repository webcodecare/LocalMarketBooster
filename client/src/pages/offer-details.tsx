import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CountdownTimer from "@/components/offers/countdown-timer";
import SaveOfferDialog from "@/components/offers/save-offer-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { OfferWithRelations } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { LikeButtonModal } from "@/components/offers/like-button-modal";
import { SmartOfferRecommendations } from "@/components/recommendations/smart-offer-recommendations";

export default function OfferDetails() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: offer, isLoading } = useQuery<OfferWithRelations>({
    queryKey: [`/api/offers/${id}`],
    enabled: !!id,
  });

  const shareOffer = (platform: string) => {
    if (!offer) return;

    const shareText = `${offer.title} - ${offer.business.businessName}`;
    const shareUrl = window.location.href;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          toast({
            title: "تم نسخ الرابط",
            description: "تم نسخ رابط العرض إلى الحافظة",
          });
        });
        break;
    }
  };

  const handleContactBusiness = () => {
    if (!offer) return;

    if (offer.linkType === 'whatsapp' && offer.link) {
      const whatsappUrl = offer.link.startsWith('https://wa.me/') 
        ? offer.link 
        : `https://wa.me/${offer.link}`;
      window.open(whatsappUrl, '_blank');
    } else if (offer.linkType === 'website' && offer.link) {
      window.open(offer.link, '_blank');
    } else if (offer.linkType === 'phone' && offer.link) {
      window.location.href = `tel:${offer.link}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">العرض غير موجود</h1>
              <p className="text-gray-600 mb-6">العرض المطلوب غير متوفر أو تم حذفه</p>
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

  const isExpired = offer.endDate ? new Date(offer.endDate) < new Date() : false;
  const timeRemaining = offer.endDate ? formatDistanceToNow(new Date(offer.endDate), { addSuffix: true, locale: ar }) : null;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-reverse space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-saudi-green">الرئيسية</a></li>
            <li><i className="fas fa-chevron-left text-xs"></i></li>
            <li><a href={`/category/${offer.category.slug}`} className="hover:text-saudi-green">{offer.category.nameAr}</a></li>
            <li><i className="fas fa-chevron-left text-xs"></i></li>
            <li className="text-gray-900">{offer.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <div className="relative">
                <img 
                  src={offer.imageUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
                  alt={offer.title}
                  className="w-full h-64 md:h-80 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {offer.isFeatured && (
                    <Badge className="bg-saudi-gold text-saudi-green">
                      مميز
                    </Badge>
                  )}
                  {isExpired ? (
                    <Badge variant="destructive">
                      منتهي
                    </Badge>
                  ) : offer.endDate ? (
                    <CountdownTimer endDate={offer.endDate} />
                  ) : (
                    <Badge className="bg-green-100 text-green-800">
                      مستمر
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    {offer.category.nameAr}
                  </Badge>
                  <span className="text-gray-500 text-sm mr-auto">
                    <i className="fas fa-map-marker-alt ml-1"></i>
                    {offer.city}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {offer.title}
                </h1>
                
                <div className="flex items-center mb-6">
                  <div className="text-saudi-green text-lg font-semibold">
                    {offer.business.businessName}
                  </div>
                  <div className="mr-auto flex items-center text-gray-500 text-sm">
                    <i className="fas fa-eye ml-1"></i>
                    {offer.views} مشاهدة
                  </div>
                </div>

                {offer.discountPercentage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <div className="text-red-600">
                        <i className="fas fa-tag text-xl ml-3"></i>
                      </div>
                      <div>
                        <h3 className="text-red-800 font-semibold">خصم {offer.discountPercentage}%</h3>
                        {offer.originalPrice && offer.discountedPrice && (
                          <div className="flex items-center space-x-reverse space-x-2 mt-1">
                            <span className="text-gray-500 line-through">{offer.originalPrice}</span>
                            <span className="text-red-600 font-bold">{offer.discountedPrice}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {offer.discountCode && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-green-800 font-semibold mb-1">كود الخصم</h3>
                        <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                          {offer.discountCode}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(offer.discountCode || '');
                          toast({
                            title: "تم نسخ الكود",
                            description: "تم نسخ كود الخصم إلى الحافظة",
                          });
                        }}
                      >
                        <i className="fas fa-copy ml-1"></i>
                        نسخ
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="prose prose-ar max-w-none">
                  <h3 className="text-lg font-semibold mb-3">تفاصيل العرض</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {offer.description}
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-saudi-green hover:bg-green-800 flex-1"
                    onClick={handleContactBusiness}
                    disabled={isExpired}
                  >
                    {offer.linkType === 'whatsapp' && <i className="fas fa-whatsapp ml-2"></i>}
                    {offer.linkType === 'website' && <i className="fas fa-globe ml-2"></i>}
                    {offer.linkType === 'phone' && <i className="fas fa-phone ml-2"></i>}
                    {offer.linkType === 'whatsapp' ? 'تواصل عبر واتساب' : 
                     offer.linkType === 'website' ? 'زيارة الموقع' : 
                     'اتصال'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <SaveOfferDialog offerId={offer.id} offerTitle={offer.title} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOffer('whatsapp')}
                    >
                      <i className="fab fa-whatsapp text-green-600"></i>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOffer('telegram')}
                    >
                      <i className="fab fa-telegram text-blue-500"></i>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOffer('twitter')}
                    >
                      <i className="fab fa-twitter text-blue-400"></i>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOffer('copy')}
                    >
                      <i className="fas fa-link"></i>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">معلومات المتجر</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{offer.business.businessName}</h4>
                    {offer.business.businessDescription && (
                      <p className="text-gray-600 text-sm mt-1">
                        {offer.business.businessDescription}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {offer.business.businessPhone && (
                      <div className="flex items-center text-sm">
                        <i className="fas fa-phone text-gray-400 ml-3 w-4"></i>
                        <span>{offer.business.businessPhone}</span>
                      </div>
                    )}
                    
                    {offer.business.businessCity && (
                      <div className="flex items-center text-sm">
                        <i className="fas fa-map-marker-alt text-gray-400 ml-3 w-4"></i>
                        <span>{offer.business.businessCity}</span>
                      </div>
                    )}
                    
                    {offer.business.businessWebsite && (
                      <div className="flex items-center text-sm">
                        <i className="fas fa-globe text-gray-400 ml-3 w-4"></i>
                        <a 
                          href={offer.business.businessWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-saudi-green hover:underline"
                        >
                          زيارة الموقع
                        </a>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">تفاصيل العرض</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>تاريخ البداية:</span>
                        <span>{offer.startDate ? new Date(offer.startDate).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                      </div>
                      {offer.endDate && (
                        <div className="flex justify-between">
                          <span>تاريخ الانتهاء:</span>
                          <span>{new Date(offer.endDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                      {offer.endDate && (
                        <div className="flex justify-between">
                          <span>المدة المتبقية:</span>
                          <span className={isExpired ? "text-red-600" : "text-green-600"}>
                            {isExpired ? "منتهي" : timeRemaining}
                          </span>
                        </div>
                      )}
                      {!offer.endDate && (
                        <div className="flex justify-between">
                          <span>المدة المتبقية:</span>
                          <span className="text-green-600">مستمر</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
