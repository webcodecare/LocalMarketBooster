import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/ui/back-button";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  MapPin, 
  Phone, 
  Globe, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Star,
  Calendar,
  Tag,
  TrendingUp,
  Award
} from "lucide-react";
import type { OfferWithRelations, User } from "@shared/schema";

interface MerchantProfile extends User {
  offers: OfferWithRelations[];
  stats: {
    totalOffers: number;
    activeOffers: number;
    expiredOffers: number;
    totalViews: number;
    averageDiscount: number;
  };
}

export default function MerchantProfile() {
  const { merchantId } = useParams();

  const { data: merchant, isLoading } = useQuery<MerchantProfile>({
    queryKey: [`/api/merchants/${merchantId}/profile`],
    enabled: !!merchantId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="container mx-auto px-4 max-w-6xl">
          <BackButton />
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              التاجر غير موجود
            </h1>
            <p className="text-gray-600 mb-8">
              عذراً، لم نتمكن من العثور على هذا التاجر
            </p>
            <Button asChild>
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeOffers = merchant.offers?.filter(offer => 
    offer.isActive && 
    offer.isApproved && 
    new Date(offer.endDate || offer.createdAt) > new Date()
  ) || [];

  const expiredOffers = merchant.offers?.filter(offer => 
    !offer.isActive || 
    new Date(offer.endDate || offer.createdAt) <= new Date()
  ) || [];

  const priorityOffers = activeOffers.filter(offer => offer.isPriority);
  const regularOffers = activeOffers.filter(offer => !offer.isPriority);

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        <BackButton />
        
        {/* Merchant Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-l from-blue-600 to-purple-600 h-32"></div>
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Logo */}
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                  {merchant.businessLogo ? (
                    <img 
                      src={merchant.businessLogo} 
                      alt={merchant.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {merchant.businessName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                {merchant.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full">
                    <Award className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className="flex-1 pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {merchant.businessName}
                  </h1>
                  {merchant.isVerified && (
                    <Badge className="bg-blue-600">
                      متجر موثق
                    </Badge>
                  )}
                </div>
                
                {merchant.businessDescription && (
                  <p className="text-gray-600 mb-4 max-w-2xl">
                    {merchant.businessDescription}
                  </p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-4">
                  {merchant.businessCity && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{merchant.businessCity}</span>
                    </div>
                  )}
                  
                  {merchant.businessPhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span dir="ltr">{merchant.businessPhone}</span>
                    </div>
                  )}
                  
                  {merchant.businessWebsite && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a 
                        href={merchant.businessWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        الموقع الإلكتروني
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {merchant.businessWhatsapp && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => window.open(`https://wa.me/${merchant.businessWhatsapp}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      واتساب
                    </Button>
                  )}
                  
                  {merchant.businessInstagram && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://instagram.com/${merchant.businessInstagram}`, '_blank')}
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      انستقرام
                    </Button>
                  )}
                  
                  {merchant.businessFacebook && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://facebook.com/${merchant.businessFacebook}`, '_blank')}
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      فيسبوك
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{merchant.stats?.totalOffers || 0}</div>
                <p className="text-sm text-gray-600">إجمالي العروض</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{merchant.stats?.activeOffers || 0}</div>
                <p className="text-sm text-gray-600">عروض نشطة</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{merchant.stats?.totalViews || 0}</div>
                <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{merchant.stats?.averageDiscount || 0}%</div>
                <p className="text-sm text-gray-600">متوسط الخصم</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{merchant.stats?.expiredOffers || 0}</div>
                <p className="text-sm text-gray-600">عروض منتهية</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offers Section */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">العروض النشطة ({activeOffers.length})</TabsTrigger>
            <TabsTrigger value="expired">العروض المنتهية ({expiredOffers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeOffers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      لا توجد عروض نشطة حالياً
                    </h3>
                    <p className="text-gray-500">
                      تابع هذا التاجر للحصول على إشعارات بالعروض الجديدة
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Priority Offers */}
                {priorityOffers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded"></div>
                      <h2 className="text-2xl font-bold text-gray-900">العروض المميزة</h2>
                      <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {priorityOffers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} isPriority={true} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Offers */}
                {regularOffers.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">العروض الأخرى</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularOffers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} isPriority={false} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired">
            {expiredOffers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      لا توجد عروض منتهية
                    </h3>
                    <p className="text-gray-500">
                      العروض المنتهية ستظهر هنا
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} isExpired={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface OfferCardProps {
  offer: OfferWithRelations;
  isPriority?: boolean;
  isExpired?: boolean;
}

function OfferCard({ offer, isPriority = false, isExpired = false }: OfferCardProps) {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${
      isPriority ? 'border-2 border-red-200 relative overflow-hidden' : ''
    } ${isExpired ? 'opacity-75' : ''}`}>
      {isPriority && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-orange-500 text-white px-3 py-1 text-sm font-bold rounded-bl-lg">
          🔥 عرض مميز
        </div>
      )}
      
      <div className={`relative overflow-hidden rounded-t-lg ${isPriority ? 'mt-6' : ''}`}>
        <img
          src={offer.imageUrl || "/api/placeholder/300/200"}
          alt={offer.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {offer.discountPercentage && (
          <Badge className={`absolute top-2 right-2 text-white ${
            isPriority ? 'bg-red-500 text-lg px-3 py-1' : 'bg-red-500'
          }`}>
            خصم {offer.discountPercentage}%
          </Badge>
        )}
        {isExpired && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              منتهي
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{offer.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{offer.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{offer.views} مشاهدة</span>
          </div>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true, locale: ar })}
          </span>
        </div>
        
        {!isExpired && (
          <Button asChild className={`w-full ${
            isPriority ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' : ''
          }`}>
            <Link href={`/offer/${offer.id}`}>
              عرض التفاصيل
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}