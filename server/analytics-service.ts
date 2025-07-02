import { db } from "./db";
import { users, offers, categories, subscriptionPlans, userSubscriptions, invoices, screenReviews } from "@shared/schema";
import { eq, and, gte, lte, count, sum, avg, desc, sql } from "drizzle-orm";

export class AnalyticsService {
  private static instance: AnalyticsService;

  constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Merchant Analytics
  async getMerchantAnalytics(merchantId: number) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const [totalOffers] = await db
      .select({ count: count() })
      .from(offers)
      .where(eq(offers.userId, merchantId));

    const [activeOffers] = await db
      .select({ count: count() })
      .from(offers)
      .where(and(eq(offers.userId, merchantId), eq(offers.status, 'approved')));

    // Mock analytics data - replace with real tracking when implemented
    const totalViews = Math.floor(Math.random() * 10000) + 1000;
    const totalClicks = Math.floor(totalViews * 0.15);
    const conversionRate = (totalClicks / totalViews) * 100;

    // Get merchant offers for performance data
    const merchantOffers = await db
      .select({
        id: offers.id,
        title: offers.title,
        status: offers.status,
        createdAt: offers.createdAt,
      })
      .from(offers)
      .where(eq(offers.userId, merchantId))
      .orderBy(desc(offers.createdAt))
      .limit(10);

    // Generate performance data for each offer
    const offerPerformance = merchantOffers.map(offer => ({
      offerId: offer.id,
      title: offer.title,
      views: Math.floor(Math.random() * 1000) + 100,
      clicks: Math.floor(Math.random() * 150) + 10,
      conversionRate: Math.random() * 20 + 5,
      status: offer.status,
    }));

    // Find top performing offer
    const topPerformingOffer = offerPerformance.reduce((max, offer) => 
      offer.views > (max?.views || 0) ? offer : max, null
    );

    // Generate time series data for the last 30 days
    const viewsOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 200) + 50,
        clicks: Math.floor(Math.random() * 30) + 5,
      };
    });

    // Get category breakdown
    const categoryData = await db
      .select({
        category: categories.name,
        count: count(),
      })
      .from(offers)
      .innerJoin(categories, eq(offers.categoryId, categories.id))
      .where(eq(offers.userId, merchantId))
      .groupBy(categories.name);

    const totalCategoryOffers = categoryData.reduce((sum, cat) => sum + cat.count, 0);
    const categoryBreakdown = categoryData.map(cat => ({
      category: cat.category,
      count: cat.count,
      percentage: Math.round((cat.count / totalCategoryOffers) * 100),
    }));

    // Recent activity
    const recentActivity = [
      {
        id: 1,
        type: 'offer_created' as const,
        description: 'تم إنشاء عرض جديد',
        timestamp: 'منذ ساعتين',
      },
      {
        id: 2,
        type: 'offer_approved' as const,
        description: 'تم الموافقة على عرض',
        timestamp: 'منذ 5 ساعات',
      },
      {
        id: 3,
        type: 'offer_viewed' as const,
        description: 'تم عرض عرضك 50 مرة اليوم',
        timestamp: 'منذ يوم واحد',
      },
    ];

    return {
      totalOffers: totalOffers.count,
      activeOffers: activeOffers.count,
      totalViews,
      totalClicks,
      averageRating: 4.2 + Math.random() * 0.8,
      totalReviews: Math.floor(Math.random() * 100) + 20,
      conversionRate,
      topPerformingOffer: topPerformingOffer ? {
        id: topPerformingOffer.offerId,
        title: topPerformingOffer.title,
        views: topPerformingOffer.views,
        clicks: topPerformingOffer.clicks,
      } : null,
      offerPerformance,
      viewsOverTime,
      categoryBreakdown,
      recentActivity,
    };
  }

  // Admin Analytics
  async getAdminAnalytics() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Platform overview metrics
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult.count;

    const [totalMerchantsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'merchant'));
    const totalMerchants = totalMerchantsResult.count;

    const [totalOffersResult] = await db.select({ count: count() }).from(offers);
    const totalOffers = totalOffersResult.count;

    // Mock metrics that would come from real analytics tracking
    const totalViews = Math.floor(Math.random() * 100000) + 50000;
    const totalClicks = Math.floor(totalViews * 0.12);
    const totalRevenue = Math.floor(Math.random() * 500000) + 100000;

    // Growth calculations (mock data)
    const userGrowth = Math.random() * 20 - 5; // -5% to +15%
    const merchantGrowth = Math.random() * 15 + 2; // 2% to 17%
    const offerGrowth = Math.random() * 25 + 5; // 5% to 30%
    const revenueGrowth = Math.random() * 18 + 3; // 3% to 21%

    // Performance metrics
    const averageConversionRate = (totalClicks / totalViews) * 100;
    const averageRating = 4.1 + Math.random() * 0.8;
    const activeUsers = Math.floor(totalUsers * (0.6 + Math.random() * 0.3)); // 60-90% active
    const platformEngagement = Math.random() * 20 + 70; // 70-90%

    // Top merchants (get real data)
    const topMerchants = await db
      .select({
        id: users.id,
        businessName: users.businessName,
        username: users.username,
      })
      .from(users)
      .where(eq(users.role, 'merchant'))
      .limit(5);

    const topMerchantsWithStats = topMerchants.map(merchant => ({
      id: merchant.id,
      businessName: merchant.businessName || merchant.username,
      totalOffers: Math.floor(Math.random() * 20) + 5,
      totalViews: Math.floor(Math.random() * 5000) + 1000,
      rating: 4.0 + Math.random() * 1.0,
      revenue: Math.floor(Math.random() * 50000) + 10000,
    }));

    // Top offers (get real data)
    const topOffers = await db
      .select({
        id: offers.id,
        title: offers.title,
        merchantId: offers.userId,
      })
      .from(offers)
      .where(eq(offers.status, 'approved'))
      .limit(5);

    const merchantNames = await db
      .select({
        id: users.id,
        businessName: users.businessName,
        username: users.username,
      })
      .from(users);

    const merchantNameMap = merchantNames.reduce((acc, user) => {
      acc[user.id] = user.businessName || user.username;
      return acc;
    }, {} as Record<number, string>);

    const topOffersWithStats = topOffers.map(offer => ({
      id: offer.id,
      title: offer.title,
      merchantName: merchantNameMap[offer.merchantId] || 'غير معروف',
      views: Math.floor(Math.random() * 2000) + 500,
      clicks: Math.floor(Math.random() * 200) + 50,
      conversionRate: Math.random() * 15 + 5,
    }));

    // Time series data (last 30 days)
    const userGrowthOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 20) + 5,
        merchants: Math.floor(Math.random() * 5) + 1,
      };
    });

    const revenueOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        subscriptions: Math.floor(Math.random() * 10) + 2,
      };
    });

    const engagementOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 2000) + 500,
        clicks: Math.floor(Math.random() * 300) + 100,
        offers: Math.floor(Math.random() * 20) + 5,
      };
    });

    // Category performance
    const categoryPerformanceData = await db
      .select({
        category: categories.name,
        categoryAr: categories.nameAr,
        offerCount: count(offers.id),
      })
      .from(categories)
      .leftJoin(offers, eq(categories.id, offers.categoryId))
      .groupBy(categories.id, categories.name, categories.nameAr)
      .limit(10);

    const categoryPerformance = categoryPerformanceData.map(cat => ({
      category: cat.categoryAr || cat.category,
      offers: cat.offerCount,
      views: Math.floor(Math.random() * 10000) + 2000,
      merchants: Math.floor(Math.random() * 50) + 10,
      avgRating: 4.0 + Math.random() * 1.0,
    }));

    // Geographical distribution (mock data for Saudi cities)
    const saudiCities = [
      { city: 'الرياض', merchants: 45, offers: 180 },
      { city: 'جدة', merchants: 38, offers: 152 },
      { city: 'الدمام', merchants: 22, offers: 88 },
      { city: 'مكة المكرمة', merchants: 15, offers: 60 },
      { city: 'المدينة المنورة', merchants: 12, offers: 48 },
    ];

    const totalCityMerchants = saudiCities.reduce((sum, city) => sum + city.merchants, 0);
    const cityDistribution = saudiCities.map(city => ({
      ...city,
      percentage: Math.round((city.merchants / totalCityMerchants) * 100),
    }));

    // Recent platform activity
    const recentActivity = [
      {
        id: 1,
        type: 'user_registered' as const,
        description: 'انضم مستخدم جديد للمنصة',
        timestamp: 'منذ 15 دقيقة',
      },
      {
        id: 2,
        type: 'merchant_approved' as const,
        description: 'تم الموافقة على تاجر جديد',
        timestamp: 'منذ ساعة واحدة',
      },
      {
        id: 3,
        type: 'offer_published' as const,
        description: 'تم نشر عرض جديد',
        timestamp: 'منذ ساعتين',
      },
      {
        id: 4,
        type: 'subscription_purchased' as const,
        description: 'تم شراء اشتراك متميز',
        timestamp: 'منذ 3 ساعات',
        value: 299,
      },
    ];

    return {
      // Platform Overview
      totalUsers,
      totalMerchants,
      totalOffers,
      totalViews,
      totalClicks,
      totalRevenue,
      
      // Growth Metrics
      userGrowth,
      merchantGrowth,
      offerGrowth,
      revenueGrowth,
      
      // Performance Metrics
      averageConversionRate,
      averageRating,
      activeUsers,
      platformEngagement,
      
      // Top Performers
      topMerchants: topMerchantsWithStats,
      topOffers: topOffersWithStats,
      
      // Time Series Data
      userGrowthOverTime,
      revenueOverTime,
      engagementOverTime,
      
      // Category Analysis
      categoryPerformance,
      
      // Geographical Data
      cityDistribution,
      
      // Recent Activity
      recentActivity,
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();