import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFeatureAccess, type FeatureAccess } from "@/hooks/use-feature-access";
import { useLocation } from "wouter";

interface FeatureCardProps {
  feature: FeatureAccess;
  onUpgrade?: () => void;
}

export function FeatureCard({ feature, onUpgrade }: FeatureCardProps) {
  const { getPlanName } = useFeatureAccess();
  const [, setLocation] = useLocation();

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setLocation("/subscription-plans");
    }
  };

  return (
    <Card className={`relative transition-all duration-200 ${
      feature.isLocked 
        ? 'bg-gray-50 border-gray-200 opacity-75' 
        : 'bg-white border-green-200 hover:shadow-md'
    }`}>
      {feature.isLocked && (
        <div className="absolute top-3 left-3 z-10">
          <i className="fas fa-lock text-gray-400 text-lg"></i>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              feature.isLocked ? 'bg-gray-100' : 'bg-green-100'
            }`}>
              <i className={`${feature.icon} ${
                feature.isLocked ? 'text-gray-400' : 'text-green-600'
              }`}></i>
            </div>
            <div>
              <CardTitle className={`text-base ${
                feature.isLocked ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {feature.nameAr}
              </CardTitle>
              {feature.category && (
                <Badge variant="outline" className="text-xs mt-1">
                  {getCategoryName(feature.category)}
                </Badge>
              )}
            </div>
          </div>
          
          {feature.limit && !feature.isLocked && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              حد: {feature.limit}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className={`text-sm mb-4 ${
          feature.isLocked ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {feature.description}
        </p>
        
        {feature.isLocked ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded-lg">
              <i className="fas fa-info-circle ml-1"></i>
              يتطلب باقة {getPlanName(feature.requiredPlan)}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <i className="fas fa-upgrade ml-2"></i>
                  ترقية الباقة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle>ترقية الباقة للوصول لهذه الميزة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className={`${feature.icon} text-blue-600 text-2xl`}></i>
                    </div>
                    <h3 className="font-medium text-lg mb-2">{feature.nameAr}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <i className="fas fa-crown text-yellow-600 ml-2"></i>
                      <span className="text-sm font-medium">
                        متوفر في باقة {getPlanName(feature.requiredPlan)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={handleUpgradeClick}
                    >
                      <i className="fas fa-arrow-up ml-2"></i>
                      ترقية الآن
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-info ml-2"></i>
                      المزيد
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <Button 
            size="sm" 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => {
              // Handle feature activation/usage
              console.log(`Using feature: ${feature.id}`);
            }}
          >
            <i className="fas fa-check ml-2"></i>
            متاح
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function getCategoryName(category: string): string {
  switch (category) {
    case "general": return "عام";
    case "analytics": return "تحليلات";
    case "automation": return "أتمتة";
    case "support": return "دعم";
    default: return category;
  }
}