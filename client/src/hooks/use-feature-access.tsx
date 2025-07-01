import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { SubscriptionPlanWithFeatures, Feature } from "@shared/schema";

// Define feature categories and their access rules
export interface FeatureAccess {
  id: string;
  nameAr: string;
  description: string;
  category: string;
  icon: string;
  isLocked: boolean;
  requiredPlan: string;
  limit?: number;
}

// Default features available in the system
const defaultFeatures: Omit<FeatureAccess, 'isLocked' | 'requiredPlan'>[] = [
  {
    id: "basic_offers",
    nameAr: "إنشاء العروض الأساسية",
    description: "إنشاء وإدارة العروض والخصومات",
    category: "general",
    icon: "fas fa-tags",
    limit: 3
  },
  {
    id: "offer_analytics",
    nameAr: "إحصائيات العروض",
    description: "مشاهدة تحليلات الأداء والمشاهدات",
    category: "analytics",
    icon: "fas fa-chart-line"
  },
  {
    id: "advanced_analytics",
    nameAr: "التحليلات المتقدمة",
    description: "تقارير مفصلة وتحليل سلوك العملاء",
    category: "analytics",
    icon: "fas fa-chart-bar"
  },
  {
    id: "priority_listing",
    nameAr: "الأولوية في الظهور",
    description: "ظهور العروض في المقدمة",
    category: "general",
    icon: "fas fa-star"
  },
  {
    id: "team_management",
    nameAr: "إدارة فريق العمل",
    description: "إضافة أعضاء فريق وإدارة الصلاحيات",
    category: "general",
    icon: "fas fa-users"
  },
  {
    id: "whatsapp_support",
    nameAr: "دعم الواتساب",
    description: "دعم فني عبر الواتساب",
    category: "support",
    icon: "fab fa-whatsapp"
  },
  {
    id: "phone_support",
    nameAr: "الدعم الهاتفي",
    description: "دعم فني مباشر عبر الهاتف",
    category: "support",
    icon: "fas fa-phone"
  },
  {
    id: "verified_badge",
    nameAr: "شارة المتجر الموثق",
    description: "شارة تؤكد صحة المتجر",
    category: "general",
    icon: "fas fa-check-circle"
  },
  {
    id: "ai_analysis",
    nameAr: "تحليل الذكاء الاصطناعي",
    description: "تحليل العروض باستخدام الذكاء الاصطناعي",
    category: "automation",
    icon: "fas fa-robot"
  },
  {
    id: "extended_duration",
    nameAr: "مدة عرض مطولة",
    description: "عروض تبقى نشطة لمدة أطول",
    category: "general",
    icon: "fas fa-clock"
  }
];

// Plan access rules
const planAccessRules = {
  free: {
    maxOffers: 3,
    allowedFeatures: ["basic_offers", "offer_analytics"],
    offerDuration: 7
  },
  basic: {
    maxOffers: 10,
    allowedFeatures: [
      "basic_offers", 
      "offer_analytics", 
      "whatsapp_support", 
      "verified_badge",
      "extended_duration"
    ],
    offerDuration: 15
  },
  premium: {
    maxOffers: 50,
    allowedFeatures: [
      "basic_offers",
      "offer_analytics", 
      "advanced_analytics",
      "priority_listing",
      "team_management",
      "whatsapp_support",
      "phone_support",
      "verified_badge",
      "ai_analysis",
      "extended_duration"
    ],
    offerDuration: 30
  }
};

export function useFeatureAccess() {
  const { user } = useAuth();

  // Get subscription plans with features from API
  const { data: subscriptionPlans = [] } = useQuery<SubscriptionPlanWithFeatures[]>({
    queryKey: ["/api/admin/subscription-plans"],
    enabled: !!user
  });

  const getUserPlan = () => {
    if (!user) return "free";
    return user.subscriptionPlan || "free";
  };

  const getFeatureAccess = (): FeatureAccess[] => {
    const userPlan = getUserPlan();
    const planRules = planAccessRules[userPlan as keyof typeof planAccessRules] || planAccessRules.free;

    return defaultFeatures.map(feature => {
      const isLocked = !planRules.allowedFeatures.includes(feature.id);
      
      // Determine required plan for locked features
      let requiredPlan = "basic";
      if (planAccessRules.premium.allowedFeatures.includes(feature.id)) {
        if (planAccessRules.basic.allowedFeatures.includes(feature.id)) {
          requiredPlan = "basic";
        } else {
          requiredPlan = "premium";
        }
      }

      return {
        ...feature,
        isLocked,
        requiredPlan,
        limit: feature.id === "basic_offers" ? planRules.maxOffers : feature.limit
      };
    });
  };

  const hasFeatureAccess = (featureId: string): boolean => {
    const userPlan = getUserPlan();
    const planRules = planAccessRules[userPlan as keyof typeof planAccessRules] || planAccessRules.free;
    return planRules.allowedFeatures.includes(featureId);
  };

  const getOfferLimit = (): number => {
    const userPlan = getUserPlan();
    const planRules = planAccessRules[userPlan as keyof typeof planAccessRules] || planAccessRules.free;
    return planRules.maxOffers;
  };

  const getOfferDuration = (): number => {
    const userPlan = getUserPlan();
    const planRules = planAccessRules[userPlan as keyof typeof planAccessRules] || planAccessRules.free;
    return planRules.offerDuration;
  };

  const getPlanName = (plan: string): string => {
    switch (plan) {
      case "basic": return "الأساسي";
      case "premium": return "المتقدم";
      default: return "المجاني";
    }
  };

  return {
    userPlan: getUserPlan(),
    features: getFeatureAccess(),
    hasFeatureAccess,
    getOfferLimit,
    getOfferDuration,
    getPlanName,
    subscriptionPlans
  };
}