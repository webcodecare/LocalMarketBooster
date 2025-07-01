import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./countdown-timer";
import SaveOfferDialog from "./save-offer-dialog";
import { useToast } from "@/hooks/use-toast";
import type { OfferWithRelations } from "@shared/schema";
import { useLocation } from "wouter";

interface OfferCardProps {
  offer: OfferWithRelations;
  compact?: boolean;
}

export default function OfferCard({ offer, compact = false }: OfferCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const isExpired = offer.endDate ? new Date(offer.endDate) < new Date() : false;

  const handleShareOffer = (e: React.MouseEvent, platform: string) => {
    e.stopPropagation();
    
    const shareText = `${offer.title} - ${offer.business.businessName}`;
    const shareUrl = `${window.location.origin}/offer/${offer.id}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`);
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

  const handleContactBusiness = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const handleCardClick = () => {
    setLocation(`/offer/${offer.id}`);
  };

  if (compact) {
    return (
      <Card 
        className="offer-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img 
            src={offer.imageUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"} 
            alt={offer.title}
            className="w-full h-32 object-cover"
          />
          <div className="absolute top-2 right-2">
            {isExpired ? (
              <Badge variant="destructive" className="text-xs">
                منتهي
              </Badge>
            ) : (
              offer.endDate && <CountdownTimer endDate={offer.endDate.toString()} compact />
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <Badge className="bg-blue-100 text-blue-800 text-xs mb-2">
            {offer.category.nameAr}
          </Badge>
          <h4 className="text-md font-bold text-gray-900 mb-1 line-clamp-2">
            {offer.title}
          </h4>
          <p className="text-gray-600 text-sm mb-3 line-clamp-1">
            {offer.business.businessName}
          </p>
          
          <div className="flex justify-between items-center">
            <Button 
              className="bg-saudi-green text-white hover:bg-green-800 text-sm px-3 py-1"
              onClick={handleCardClick}
              disabled={isExpired}
            >
              التفاصيل
            </Button>
            <span className="text-gray-500 text-xs">
              <i className="fas fa-eye ml-1"></i>
              {offer.views || 0} مشاهدة
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="offer-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img 
          src={offer.imageUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"} 
          alt={offer.title}
          className="w-full h-48 object-cover"
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
            <CountdownTimer endDate={offer.endDate.toString()} />
          ) : null}
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
        
        <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {offer.title}
        </h4>
        <p className="text-gray-600 mb-4">
          <a 
            href={`/business/${offer.businessId}`}
            className="hover:text-saudi-green hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {offer.business.businessName}
          </a>
        </p>

        {/* Price Display */}
        {(offer.originalPrice || offer.discountedPrice) && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              {offer.discountedPrice && offer.originalPrice ? (
                <>
                  <span className="text-lg font-bold text-green-600">
                    {offer.discountedPrice}
                  </span>
                  <span className="text-sm text-red-500 line-through">
                    {offer.originalPrice}
                  </span>
                  {offer.discountPercentage && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      خصم {offer.discountPercentage}%
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {offer.originalPrice || offer.discountedPrice}
                </span>
              )}
            </div>
          </div>
        )}

        {offer.discountPercentage && !offer.originalPrice && !offer.discountedPrice && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <i className="fas fa-tag text-red-600 ml-2"></i>
              <span className="text-red-800 font-semibold">
                خصم {offer.discountPercentage}%
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <SaveOfferDialog offerId={offer.id} offerTitle={offer.title} />
            <Button 
              className="bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
              onClick={handleContactBusiness}
              disabled={isExpired}
            >
              {offer.linkType === 'whatsapp' && <i className="fas fa-whatsapp ml-1"></i>}
              {offer.linkType === 'website' && <i className="fas fa-globe ml-1"></i>}
              {offer.linkType === 'phone' && <i className="fas fa-phone ml-1"></i>}
              {offer.linkType === 'whatsapp' ? 'واتساب' : 
               offer.linkType === 'website' ? 'الموقع' : 'اتصال'}
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={(e) => handleShareOffer(e, 'whatsapp')}
            >
              <i className="fas fa-share ml-1"></i>
              مشاركة
            </Button>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <i className="fas fa-eye ml-1"></i>
            <span>{(offer.views || 0).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
