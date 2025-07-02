import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, MapPin } from "lucide-react";
import type { OfferWithRelations } from "@shared/schema";

interface RecommendationParams {
  userId?: number;
  currentOfferId?: number;
  categoryId?: number;
  city?: string;
  limit?: number;
  excludeIds?: number[];
}

interface SmartOfferRecommendationsProps {
  title?: string;
  params: RecommendationParams;
  className?: string;
  showViewAll?: boolean;
}

export function SmartOfferRecommendations({ 
  title = "قد يعجبك أيضاً", 
  params, 
  className = "",
  showViewAll = false 
}: SmartOfferRecommendationsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const { data: recommendations = [], isLoading } = useQuery<OfferWithRelations[]>({
    queryKey: ['/api/recommendations', params],
    enabled: true,
  });

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || recommendations.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        prev + 3 >= recommendations.length ? 0 : prev + 3
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, recommendations.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev + 3 >= recommendations.length ? 0 : prev + 3
    );
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev - 3 < 0 ? Math.max(0, recommendations.length - 3) : prev - 3
    );
    setAutoPlay(false);
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`} dir="rtl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  const visibleRecommendations = recommendations.slice(currentSlide, currentSlide + 3);
  const hasMultipleSlides = recommendations.length > 3;

  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Badge variant="secondary" className="text-sm">
            {recommendations.length} عرض
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {showViewAll && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/offers">عرض الكل</Link>
            </Button>
          )}
          
          {hasMultipleSlides && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlide + 3 >= recommendations.length}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleRecommendations.map((offer, index) => (
          <RecommendationCard 
            key={`${offer.id}-${currentSlide}`} 
            offer={offer} 
            index={index}
          />
        ))}
      </div>

      {/* Slide Indicators */}
      {hasMultipleSlides && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(recommendations.length / 3) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentSlide / 3) === index 
                  ? 'bg-purple-600' 
                  : 'bg-gray-300'
              }`}
              onClick={() => {
                setCurrentSlide(index * 3);
                setAutoPlay(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RecommendationCardProps {
  offer: OfferWithRelations;
  index: number;
}

function RecommendationCard({ offer, index }: RecommendationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: 'slideInUp 0.5s ease-out forwards'
      }}
    >
      <Link href={`/offer/${offer.id}`}>
        <div className="relative overflow-hidden">
          <div className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <img
              src={offer.imageUrl || "/api/placeholder/300/200"}
              alt={offer.title}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {offer.discountPercentage && (
              <Badge className="bg-red-500 text-white font-bold">
                خصم {offer.discountPercentage}%
              </Badge>
            )}
            {offer.isPriority && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                🔥 مميز
              </Badge>
            )}
            {offer.isFeatured && (
              <Badge className="bg-yellow-500 text-yellow-900">
                ⭐ مُبرز
              </Badge>
            )}
          </div>

          {/* Trending indicator */}
          {offer.views && offer.views > 100 && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-black/70 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                رائج
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {offer.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {offer.description}
          </p>

          {/* Merchant & Location */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">
              {offer.business?.businessName}
            </span>
            {offer.city && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{offer.city}</span>
              </div>
            )}
          </div>

          {/* Price & Time */}
          <div className="flex items-center justify-between">
            {offer.originalPrice && offer.discountedPrice && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  {offer.discountedPrice} ريال
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {offer.originalPrice}
                </span>
              </div>
            )}
            
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true, locale: ar })}
            </span>
          </div>

          {/* Call to Action */}
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="sm"
          >
            اكتشف العرض
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}

// CSS Animation (add to your global styles)
const styles = `
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}