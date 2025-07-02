import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Star,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Sparkles,
  Gift
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface Offer {
  id: number;
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: number;
  imageUrl?: string;
  city?: string;
  views: number;
  business: {
    businessName: string;
  };
  category: {
    name: string;
  };
}

interface RecommendationData {
  offers: Offer[];
  reason: string;
  icon: string;
  title: string;
}

export function PersonalizedOfferCarousel() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch personalized recommendations
  const { data: recommendations, isLoading } = useQuery<RecommendationData[]>({
    queryKey: ['/api/recommendations'],
    enabled: !!user,
  });

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !recommendations || recommendations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => 
        prev >= recommendations.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, recommendations]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    if (!recommendations) return;
    setCurrentIndex(prev => 
      prev >= recommendations.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    if (!recommendations) return;
    setCurrentIndex(prev => 
      prev <= 0 ? recommendations.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) return null;

  const currentRecommendation = recommendations[currentIndex];
  const IconComponent = getIconComponent(currentRecommendation.icon);

  return (
    <div className="w-full space-y-6">
      {/* Header with recommendation reason */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{currentRecommendation.title}</h3>
            <p className="text-gray-600 text-sm">{currentRecommendation.reason}</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="flex space-x-1 rtl:space-x-reverse">
            {recommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Offers Carousel */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentRecommendation.offers.slice(0, 6).map((offer, index) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                index={index}
                recommendationType={currentRecommendation.icon}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Link href="/offers">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            عرض جميع العروض المقترحة
            <TrendingUp className="mr-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

interface OfferCardProps {
  offer: Offer;
  index: number;
  recommendationType: string;
}

function OfferCard({ offer, index, recommendationType }: OfferCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        {/* Recommendation Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            مقترح لك
          </Badge>
        </div>

        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 left-3 z-10 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`} 
          />
        </Button>

        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {offer.imageUrl ? (
            <img 
              src={offer.imageUrl} 
              alt={offer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <Gift className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">صورة العرض</span>
              </div>
            </div>
          )}
          
          {/* Discount Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1">
              -{offer.discountPercentage}%
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Business and Category */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">{offer.business.businessName}</span>
            <Badge variant="outline" className="text-xs">
              {offer.category.name}
            </Badge>
          </div>

          {/* Title */}
          <h4 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {offer.title}
          </h4>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {offer.description}
          </p>

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-2xl font-bold text-green-600">
                  {offer.discountedPrice} ر.س
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {offer.originalPrice} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* Location and Views */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {offer.city || 'جميع المدن'}
            </div>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {offer.views} مشاهدة
            </div>
          </div>

          {/* Action Button */}
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            عرض التفاصيل
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function to get icon component from string
function getIconComponent(iconName: string) {
  const iconMap: { [key: string]: any } = {
    trending: TrendingUp,
    location: MapPin,
    category: Star,
    popular: Users,
    recent: Clock,
    default: Sparkles
  };
  
  return iconMap[iconName] || iconMap.default;
}