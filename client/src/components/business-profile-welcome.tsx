import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Star,
  Users,
  Eye,
  TrendingUp,
  Gift,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Trophy,
  Target
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface WelcomeScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  businessData?: {
    totalOffers: number;
    activeOffers: number;
    totalViews: number;
    completionPercentage: number;
    isNewBusiness: boolean;
    lastLoginDate?: string;
  };
}

export function BusinessProfileWelcome({ isVisible, onComplete, businessData }: WelcomeScreenProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const welcomeSteps = [
    {
      icon: Sparkles,
      title: `أهلاً وسهلاً، ${user?.businessName || 'عزيزنا التاجر'}!`,
      subtitle: "مرحباً بك في منصة براق الذكية",
      description: "منصتك المتكاملة لإدارة العروض والوصول للعملاء",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Trophy,
      title: "إحصائياتك في لمحة",
      subtitle: "تابع أداء عروضك ومبيعاتك",
      description: "نساعدك على فهم عملائك وتحسين أدائك",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Target,
      title: "هدفنا نجاحك",
      subtitle: "أدوات متقدمة لنمو أعمالك",
      description: "استفد من التقنيات الذكية لزيادة مبيعاتك",
      color: "from-orange-500 to-red-600"
    }
  ];

  const achievements = [
    { icon: Gift, label: "عروض نشطة", value: businessData?.activeOffers || 0, color: "bg-blue-100 text-blue-700" },
    { icon: Eye, label: "مشاهدات العروض", value: businessData?.totalViews || 0, color: "bg-green-100 text-green-700" },
    { icon: Users, label: "عملاء جدد", value: "12+", color: "bg-purple-100 text-purple-700" },
    { icon: TrendingUp, label: "نمو المبيعات", value: "+25%", color: "bg-orange-100 text-orange-700" }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= welcomeSteps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => setIsAnimating(false), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(stepInterval);
  }, [isVisible, welcomeSteps.length]);

  const currentStepData = welcomeSteps[currentStep];
  const IconComponent = currentStepData?.icon;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentStepData?.color} opacity-90`} />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  initial={{ 
                    x: Math.random() * 800, 
                    y: Math.random() * 600,
                    scale: 0 
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            <CardContent className="relative z-10 p-8 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Main Content */}
                <div className="text-center lg:text-right space-y-6">
                  <motion.div
                    key={currentStep}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                  >
                    {IconComponent && (
                      <motion.div
                        className="flex justify-center lg:justify-end mb-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                          <IconComponent className="h-12 w-12" />
                        </div>
                      </motion.div>
                    )}
                    
                    <h1 className="text-4xl lg:text-5xl font-bold">
                      {currentStepData?.title}
                    </h1>
                    
                    <h2 className="text-xl lg:text-2xl font-medium opacity-90">
                      {currentStepData?.subtitle}
                    </h2>
                    
                    <p className="text-lg opacity-80 max-w-md mx-auto lg:mx-0">
                      {currentStepData?.description}
                    </p>
                  </motion.div>

                  {/* Progress Indicator */}
                  <div className="flex justify-center lg:justify-end space-x-2 rtl:space-x-reverse">
                    {welcomeSteps.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index <= currentStep ? 'bg-white w-8' : 'bg-white/30 w-2'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Stats and Achievements */}
                <div className="space-y-6">
                  {/* Profile Completion */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium">اكتمال الملف التجاري</span>
                      <span className="text-2xl font-bold">{businessData?.completionPercentage || 75}%</span>
                    </div>
                    <Progress value={businessData?.completionPercentage || 75} className="h-3" />
                  </motion.div>

                  {/* Achievement Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.label}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                      >
                        <div className={`w-10 h-10 ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="text-2xl font-bold">{achievement.value}</div>
                        <div className="text-sm opacity-80">{achievement.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Welcome Message for New Business */}
                  {businessData?.isNewBusiness && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Star className="h-5 w-5 mr-2" />
                        <span className="font-medium">عمل جديد على المنصة</span>
                      </div>
                      <p className="text-sm opacity-80">
                        نرحب بك في عائلة براق! استمتع بخصم 20% على أول إعلان
                      </p>
                      <Badge className="mt-2 bg-yellow-500 text-yellow-900 hover:bg-yellow-400">
                        عرض ترحيبي
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-end"
              >
                <Button
                  variant="outline"
                  onClick={onComplete}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  تخطي الترحيب
                </Button>
                
                <Button
                  onClick={onComplete}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                >
                  ابدأ الآن
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </motion.div>

              {/* Last Login Info */}
              {businessData?.lastLoginDate && !businessData?.isNewBusiness && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="mt-6 text-center text-sm opacity-70"
                >
                  <Calendar className="inline h-4 w-4 mr-2" />
                  آخر دخول: {new Date(businessData.lastLoginDate).toLocaleDateString('ar-SA')}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}