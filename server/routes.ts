import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "./db";
import { paymentService } from "./payment-service";
import { emailService } from "./email";
import { aiAnalysisService } from "./ai-service";
import { badgeService } from "./badge-service";
import { analyticsService } from "./analytics-service";
import { storage } from "./storage";
import { 
  users,
  offers,
  categories,
  subscriptionPlans,
  merchantSubscriptions,
  invoices,
  screenLocations,
  screenBookings,
  screenReviews,
  campaignMedia,
  contactForms,
  aiAnalysis,
  cmsStaticPages,
  cmsSiteSettings,
  cmsHomepageSections,
  cmsSiteBranding,
  cmsBenefits,
  cmsHowItWorksSteps,
  testimonials,
  badges,
  userBadges,
  User,
  Offer,
  Category,
  SubscriptionPlan,
  Invoice,
  ScreenLocation,
  ScreenBooking,
  ScreenReview,
  CampaignMedia,
  ContactForm,
  AiAnalysis,
  insertUserSchema,
  insertOfferSchema,
  insertCategorySchema,
  insertSubscriptionPlanSchema,
  insertInvoiceSchema,
  insertScreenLocationSchema,
  insertScreenBookingSchema,
  insertScreenReviewSchema,
  insertCampaignMediaSchema,
  insertContactFormSchema,
  insertAiAnalysisSchema,
  insertTestimonialSchema,
  Testimonial
} from "@shared/schema";
import { eq, desc, and, gte, lte, like, sql, count, avg, sum, not } from "drizzle-orm";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Seed data functions
  async function seedCategories() {
    try {
      const existingCategories = await db.select().from(categories);
      if (existingCategories.length > 0) {
        console.log("Categories already seeded");
        return;
      }

      const categoryData = [
        { name: "Restaurants", nameAr: "المطاعم", description: "Food and dining establishments", descriptionAr: "مؤسسات الطعام والشراب", emoji: "🍽️", slug: "restaurants" },
        { name: "Shopping", nameAr: "التسوق", description: "Retail stores and shopping centers", descriptionAr: "متاجر التجزئة ومراكز التسوق", emoji: "🛍️", slug: "shopping" },
        { name: "Health & Beauty", nameAr: "الصحة والجمال", description: "Healthcare and beauty services", descriptionAr: "خدمات الرعاية الصحية والجمال", emoji: "💄", slug: "health-beauty" },
        { name: "Electronics", nameAr: "الإلكترونيات", description: "Electronic devices and gadgets", descriptionAr: "الأجهزة الإلكترونية والأدوات", emoji: "📱", slug: "electronics" },
        { name: "Fashion", nameAr: "الأزياء", description: "Clothing and fashion accessories", descriptionAr: "الملابس وإكسسوارات الأزياء", emoji: "👗", slug: "fashion" },
        { name: "Services", nameAr: "الخدمات", description: "Professional and personal services", descriptionAr: "الخدمات المهنية والشخصية", emoji: "🔧", slug: "services" },
        { name: "Sports & Fitness", nameAr: "الرياضة واللياقة", description: "Sports equipment and fitness services", descriptionAr: "معدات رياضية وخدمات اللياقة البدنية", emoji: "⚽", slug: "sports-fitness" },
        { name: "Travel & Tourism", nameAr: "السفر والسياحة", description: "Travel agencies and tourism services", descriptionAr: "وكالات السفر وخدمات السياحة", emoji: "✈️", slug: "travel-tourism" },
        { name: "Education", nameAr: "التعليم", description: "Educational institutions and services", descriptionAr: "المؤسسات والخدمات التعليمية", emoji: "📚", slug: "education" },
        { name: "Entertainment", nameAr: "الترفيه", description: "Entertainment venues and activities", descriptionAr: "أماكن الترفيه والأنشطة", emoji: "🎭", slug: "entertainment" }
      ];

      await db.insert(categories).values(categoryData);
      console.log("Categories seeded successfully");
    } catch (error) {
      console.error("Error seeding categories:", error);
    }
  }

  async function seedScreenLocations() {
    try {
      const existingLocations = await db.select().from(screenLocations);
      if (existingLocations.length > 0) {
        console.log("Screen locations already seeded");
        return;
      }

      const locationData = [
        {
          name: "Riyadh Mall - Main Entrance",
          nameAr: "مول الرياض - المدخل الرئيسي",
          city: "Riyadh",
          cityAr: "الرياض",
          address: "King Fahd Road, Al Olaya District",
          addressAr: "طريق الملك فهد، حي العليا",
          neighborhood: "Al Olaya",
          neighborhoodAr: "العليا",
          latitude: 24.7136,
          longitude: 46.6753,
          screenSize: "55 inch 4K",
          screenSizeAr: "55 بوصة 4K",
          dailyPrice: 500,
          isActive: true
        },
        {
          name: "Kingdom Centre - Food Court",
          nameAr: "مركز المملكة - منطقة الطعام",
          city: "Riyadh",
          cityAr: "الرياض", 
          address: "Al Urubah Road, Al Olaya District",
          addressAr: "طريق العروبة، حي العليا",
          neighborhood: "Al Olaya",
          neighborhoodAr: "العليا",
          latitude: 24.7118,
          longitude: 46.6745,
          screenSize: "65 inch 4K",
          screenSizeAr: "65 بوصة 4K",
          dailyPrice: 750,
          isActive: true
        },
        {
          name: "Al Nakheel Mall - Central Plaza",
          nameAr: "مول النخيل - الساحة المركزية",
          city: "Riyadh",
          cityAr: "الرياض",
          address: "Othman Ibn Affan Road, Al Nakheel District",
          addressAr: "طريق عثمان بن عفان، حي النخيل",
          neighborhood: "Al Nakheel",
          neighborhoodAr: "النخيل",
          latitude: "24.7500",
          longitude: "46.7200",
          screenSize: "75 inch 4K",
          screenSizeAr: "75 بوصة 4K",
          dailyPrice: 900,
          isActive: true
        }
      ];

      await db.insert(screenLocations).values(locationData);
      console.log("Screen locations seeded successfully");
    } catch (error) {
      console.error("Error seeding screen locations:", error);
    }
  }

  async function seedBadges() {
    try {
      const existingBadges = await db.select().from(badges);
      if (existingBadges.length > 0) {
        console.log("Badges already seeded");
        return;
      }

      const defaultBadges = [
        {
          name: "First Offer Published",
          nameAr: "أول عرض منشور",
          description: "Published your first offer on the platform",
          descriptionAr: "نشرت أول عرض لك على المنصة",
          icon: "Sparkles",
          color: "text-blue-600",
          backgroundColor: "bg-blue-100",
          criteria: { type: "offers_published", threshold: 1 }
        },
        {
          name: "Rising Star",
          nameAr: "النجم الصاعد",
          description: "Published 5 approved offers",
          descriptionAr: "نشرت 5 عروض معتمدة",
          icon: "Star",
          color: "text-yellow-600",
          backgroundColor: "bg-yellow-100",
          criteria: { type: "offers_approved", threshold: 5 }
        },
        {
          name: "Popular Merchant",
          nameAr: "التاجر المشهور",
          description: "Reached 100+ total views across all offers",
          descriptionAr: "وصلت إلى 100+ مشاهدة إجمالية عبر جميع العروض",
          icon: "Eye",
          color: "text-purple-600",
          backgroundColor: "bg-purple-100",
          criteria: { type: "total_views", threshold: 100 }
        },
        {
          name: "Deal Master",
          nameAr: "سيد الصفقات",
          description: "Created offers with 50%+ discount",
          descriptionAr: "أنشأت عروض بخصم 50%+",
          icon: "Percent",
          color: "text-red-600",
          backgroundColor: "bg-red-100",
          criteria: { type: "high_discount", threshold: 50, additional: { minimumOffers: 3 } }
        },
        {
          name: "Consistency Champion",
          nameAr: "بطل الثبات",
          description: "Last 5 offers were approved without rejection",
          descriptionAr: "آخر 5 عروض تم اعتمادها دون رفض",
          icon: "CheckCircle",
          color: "text-green-600",
          backgroundColor: "bg-green-100",
          criteria: { type: "consecutive_approvals", threshold: 5 }
        },
        {
          name: "Veteran Merchant",
          nameAr: "التاجر المخضرم",
          description: "Active on platform for 30+ days",
          descriptionAr: "نشط على المنصة لأكثر من 30 يوم",
          icon: "Shield",
          color: "text-indigo-600",
          backgroundColor: "bg-indigo-100",
          criteria: { type: "time_active", threshold: 30 }
        },
        {
          name: "Top Performer",
          nameAr: "الأداء المتميز",
          description: "Reached 500+ total views across all offers",
          descriptionAr: "وصلت إلى 500+ مشاهدة إجمالية عبر جميع العروض",
          icon: "Trophy",
          color: "text-amber-600",
          backgroundColor: "bg-amber-100",
          criteria: { type: "total_views", threshold: 500 }
        },
        {
          name: "Prolific Publisher",
          nameAr: "الناشر المثمر",
          description: "Published 10+ approved offers",
          descriptionAr: "نشرت 10+ عروض معتمدة",
          icon: "BookOpen",
          color: "text-teal-600",
          backgroundColor: "bg-teal-100",
          criteria: { type: "offers_approved", threshold: 10 }
        }
      ];

      for (const badge of defaultBadges) {
        await db.insert(badges).values(badge);
      }

      console.log("Default badges seeded successfully");
    } catch (error) {
      console.error("Error seeding badges:", error);
    }
  }

  async function seedSubscriptionPlans() {
    try {
      const existingPlans = await db.select().from(subscriptionPlans);
      if (existingPlans.length > 0) {
        console.log("Subscription plans already seeded");
        return;
      }

      const plans = [
        {
          name: "Starter",
          nameAr: "المبتدئ",
          description: "Perfect for small businesses just getting started",
          descriptionAr: "مثالي للشركات الصغيرة التي بدأت للتو",
          price: 99,
          currency: "SAR",
          billingPeriod: "monthly",
          offerLimit: 5,
          isActive: true,
          sortOrder: 1,
          color: "#10B981",
          icon: "🌱",
          isPopular: false
        },
        {
          name: "Professional",
          nameAr: "المحترف",
          description: "Ideal for growing businesses with more needs",
          descriptionAr: "مثالي للشركات النامية مع المزيد من الاحتياجات",
          price: 199,
          currency: "SAR",
          billingPeriod: "monthly",
          offerLimit: 20,
          isActive: true,
          sortOrder: 2,
          color: "#3B82F6",
          icon: "💼",
          isPopular: true
        },
        {
          name: "Enterprise",
          nameAr: "المؤسسة",
          description: "For large businesses with unlimited needs",
          descriptionAr: "للشركات الكبيرة مع احتياجات غير محدودة",
          price: 399,
          currency: "SAR",
          billingPeriod: "monthly",
          offerLimit: null,
          isActive: true,
          sortOrder: 3,
          color: "#8B5CF6",
          icon: "🏢",
          isPopular: false
        }
      ];

      await db.insert(subscriptionPlans).values(plans);
      console.log("Subscription plans seeded successfully");
    } catch (error) {
      console.error("Error seeding subscription plans:", error);
    }
  }

  // Initialize seeding functions
  seedCategories();
  seedScreenLocations();
  seedSubscriptionPlans();
  seedBadges();

  // Moyasar Payment Integration Routes
  app.post("/api/payments/create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { planId, paymentSource } = req.body;
      
      if (!planId || !paymentSource) {
        return res.status(400).json({ error: "Missing required payment information" });
      }

      const result = await paymentService.createSubscriptionPayment(
        req.user.id,
        planId,
        paymentSource
      );

      res.json({
        success: true,
        invoice: result.invoice,
        paymentUrl: result.paymentUrl,
        message: "Payment initiated successfully"
      });
    } catch (error) {
      console.error("Error creating subscription payment:", error);
      res.status(500).json({ 
        error: "Failed to create payment",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/payments/moyasar/callback", async (req, res) => {
    try {
      const { id: paymentId } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ error: "Payment ID is required" });
      }

      const result = await paymentService.handlePaymentCallback(paymentId);
      
      if (result.success) {
        res.json({
          success: true,
          message: "Payment processed successfully",
          invoice: result.invoice
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment processing failed",
          invoice: result.invoice
        });
      }
    } catch (error) {
      console.error("Error handling payment callback:", error);
      res.status(500).json({ 
        error: "Failed to process payment callback",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/merchant/invoices", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const merchantInvoices = await paymentService.getInvoicesByMerchant(req.user.id);
      res.json(merchantInvoices);
    } catch (error) {
      console.error("Error fetching merchant invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/payments/status/:paymentId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { paymentId } = req.params;
      const result = await paymentService.handlePaymentCallback(paymentId);
      
      res.json({
        paymentId,
        status: result.success ? 'completed' : 'failed',
        invoice: result.invoice
      });
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await db.select().from(categories);
      res.json(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Subscription plans routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await db.select().from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true))
        .orderBy(subscriptionPlans.sortOrder);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  // Merchant subscription routes
  app.get("/api/merchant/subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const subscription = await db.select({
        id: merchantSubscriptions.id,
        startDate: merchantSubscriptions.startDate,
        endDate: merchantSubscriptions.endDate,
        status: merchantSubscriptions.status,
        autoRenew: merchantSubscriptions.autoRenew,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          nameAr: subscriptionPlans.nameAr,
          price: subscriptionPlans.price,
          currency: subscriptionPlans.currency,
          billingPeriod: subscriptionPlans.billingPeriod,
          offerLimit: subscriptionPlans.offerLimit,
          color: subscriptionPlans.color,
          icon: subscriptionPlans.icon,
          isPopular: subscriptionPlans.isPopular
        }
      })
      .from(merchantSubscriptions)
      .innerJoin(subscriptionPlans, eq(merchantSubscriptions.planId, subscriptionPlans.id))
      .where(eq(merchantSubscriptions.merchantId, req.user.id))
      .orderBy(desc(merchantSubscriptions.createdAt))
      .limit(1);

      if (subscription.length === 0) {
        return res.json({ subscription: null });
      }

      res.json({ subscription: subscription[0] });
    } catch (error) {
      console.error("Error fetching merchant subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Screen locations routes - Admin only
  app.get("/api/screen-locations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const locations = await db.select().from(screenLocations)
        .where(eq(screenLocations.isActive, true));
      res.json(locations);
    } catch (error) {
      console.error("Error fetching screen locations:", error);
      res.status(500).json({ error: "Failed to fetch screen locations" });
    }
  });

  // Screen pricing options - Admin only
  app.get("/api/screen-pricing-options", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      // Return mock pricing options for admin users
      const pricingOptions = [
        { id: 1, name: "Daily", duration: 1, multiplier: 1.0 },
        { id: 2, name: "Weekly", duration: 7, multiplier: 0.9 },
        { id: 3, name: "Monthly", duration: 30, multiplier: 0.8 }
      ];
      res.json(pricingOptions);
    } catch (error) {
      console.error("Error fetching screen pricing options:", error);
      res.status(500).json({ error: "Failed to fetch pricing options" });
    }
  });

  // Screen bookings - Admin only
  app.get("/api/screen-bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const bookings = await db.select().from(screenBookings)
        .innerJoin(users, eq(screenBookings.merchantId, users.id))
        .innerJoin(screenLocations, eq(screenBookings.locationId, screenLocations.id));
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching screen bookings:", error);
      res.status(500).json({ error: "Failed to fetch screen bookings" });
    }
  });

  app.post("/api/screen-bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      // Admin-only screen booking creation
      res.status(201).json({ message: "Booking created successfully" });
    } catch (error) {
      console.error("Error creating screen booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Screen ads routes - Admin only
  app.get("/api/screen-ads", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const ads = await db.select().from(screenAds)
        .innerJoin(users, eq(screenAds.merchantId, users.id))
        .innerJoin(screenLocations, eq(screenAds.locationId, screenLocations.id));
      res.json(ads);
    } catch (error) {
      console.error("Error fetching screen ads:", error);
      res.status(500).json({ error: "Failed to fetch screen ads" });
    }
  });

  app.post("/api/screen-ads", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      // Admin-only screen ad creation
      res.status(201).json({ message: "Screen ad created successfully" });
    } catch (error) {
      console.error("Error creating screen ad:", error);
      res.status(500).json({ error: "Failed to create screen ad" });
    }
  });

  // Contact messages routes
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message, type } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      const newMessage = await db.insert(contactForms).values({
        name,
        email,
        phone,
        subject,
        message,
        type: type || 'general',
        status: 'new'
      }).returning();

      res.json({ success: true, message: "Contact message sent successfully" });
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ error: "Failed to send contact message" });
    }
  });

  // Admin Analytics API Routes
  app.get("/api/admin/analytics/revenue", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      // Get subscription revenue from paid invoices
      const subscriptionRevenue = await db.select({
        month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM-DD')`,
        amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)::int`,
        count: sql<number>`COUNT(*)::int`
      })
      .from(invoices)
      .where(and(
        eq(invoices.status, 'paid'),
        eq(invoices.invoiceType, 'subscription')
      ))
      .groupBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`);

      // Get booking revenue from approved bookings via invoices
      const bookingRevenue = await db.select({
        month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM-DD')`,
        amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)::int`,
        count: sql<number>`COUNT(*)::int`
      })
      .from(invoices)
      .where(and(
        eq(invoices.status, 'paid'),
        eq(invoices.invoiceType, 'booking')
      ))
      .groupBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`);

      // Calculate totals
      const totalSubscriptionRevenue = subscriptionRevenue.reduce((sum, item) => sum + item.amount, 0);
      const totalBookingRevenue = bookingRevenue.reduce((sum, item) => sum + item.amount, 0);

      res.json({
        totalRevenue: totalSubscriptionRevenue + totalBookingRevenue,
        subscriptionRevenue: {
          total: totalSubscriptionRevenue,
          monthly: subscriptionRevenue
        },
        bookingRevenue: {
          total: totalBookingRevenue,
          monthly: bookingRevenue
        }
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/admin/analytics/subscriptions", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      // Get subscription distribution by plan from database
      const subscriptionDistribution = await db.select({
        planName: subscriptionPlans.name,
        planNameAr: subscriptionPlans.nameAr,
        price: subscriptionPlans.price,
        color: subscriptionPlans.color,
        activeCount: sql<number>`COUNT(CASE WHEN ${merchantSubscriptions.status} = 'active' THEN 1 END)::int`,
        totalCount: sql<number>`COUNT(*)::int`
      })
      .from(subscriptionPlans)
      .leftJoin(merchantSubscriptions, eq(merchantSubscriptions.planId, subscriptionPlans.id))
      .groupBy(subscriptionPlans.id, subscriptionPlans.name, subscriptionPlans.nameAr, subscriptionPlans.price, subscriptionPlans.color)
      .orderBy(subscriptionPlans.sortOrder);

      // Get recent subscription activities from database
      const recentSubscriptions = await db.select({
        id: merchantSubscriptions.id,
        startDate: sql<string>`${merchantSubscriptions.startDate}::text`,
        status: merchantSubscriptions.status,
        merchantName: sql<string>`COALESCE(${users.businessName}, ${users.username})`,
        planName: subscriptionPlans.name,
        planPrice: subscriptionPlans.price
      })
      .from(merchantSubscriptions)
      .innerJoin(users, eq(merchantSubscriptions.merchantId, users.id))
      .innerJoin(subscriptionPlans, eq(merchantSubscriptions.planId, subscriptionPlans.id))
      .orderBy(desc(merchantSubscriptions.createdAt))
      .limit(10);

      const totalActiveSubscriptions = subscriptionDistribution.reduce((sum, item) => sum + item.activeCount, 0);

      res.json({
        distribution: subscriptionDistribution,
        recentActivity: recentSubscriptions,
        totalActiveSubscriptions
      });
    } catch (error) {
      console.error("Error fetching subscription analytics:", error);
      res.status(500).json({ error: "Failed to fetch subscription analytics" });
    }
  });

  app.get("/api/admin/analytics/bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      // Get most booked screens from database
      const mostBookedScreens = await db.select({
        screenId: screenBookings.locationId,
        screenName: screenLocations.name,
        screenNameAr: screenLocations.nameAr,
        city: screenLocations.city,
        bookingCount: sql<number>`COUNT(*)::int`,
        totalRevenue: sql<number>`COALESCE(SUM(${screenBookings.totalPrice}), 0)::int`,
        avgRating: sql<number>`COALESCE(AVG(${screenReviews.overallRating}), 0)::float`
      })
      .from(screenBookings)
      .innerJoin(screenLocations, eq(screenBookings.locationId, screenLocations.id))
      .leftJoin(screenReviews, eq(screenReviews.locationId, screenLocations.id))
      .where(eq(screenBookings.status, 'approved'))
      .groupBy(screenBookings.locationId, screenLocations.name, screenLocations.nameAr, screenLocations.city)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(10);

      // Get booking distribution by city from database
      const cityDistribution = await db.select({
        city: screenLocations.city,
        cityAr: screenLocations.cityAr,
        bookingCount: sql<number>`COUNT(*)::int`,
        revenue: sql<number>`COALESCE(SUM(${screenBookings.totalPrice}), 0)::int`
      })
      .from(screenBookings)
      .innerJoin(screenLocations, eq(screenBookings.locationId, screenLocations.id))
      .where(eq(screenBookings.status, 'approved'))
      .groupBy(screenLocations.city, screenLocations.cityAr)
      .orderBy(desc(sql`COUNT(*)`));

      // Get average booking prices per screen from database
      const avgPrices = await db.select({
        screenName: screenLocations.name,
        dailyPrice: sql<number>`${screenLocations.dailyPrice}::int`,
        avgBookingAmount: sql<number>`COALESCE(AVG(${screenBookings.totalPrice}), 0)::int`,
        bookingCount: sql<number>`COUNT(*)::int`
      })
      .from(screenBookings)
      .innerJoin(screenLocations, eq(screenBookings.locationId, screenLocations.id))
      .where(eq(screenBookings.status, 'approved'))
      .groupBy(screenLocations.id, screenLocations.name, screenLocations.dailyPrice)
      .orderBy(desc(sql`AVG(${screenBookings.totalPrice})`))
      .limit(10);

      // Get booking trends over time from database
      const bookingTrends = await db.select({
        month: sql<string>`TO_CHAR(${screenBookings.createdAt}, 'YYYY-MM-DD')`,
        bookingCount: sql<number>`COUNT(*)::int`,
        revenue: sql<number>`COALESCE(SUM(${screenBookings.totalPrice}), 0)::int`
      })
      .from(screenBookings)
      .where(eq(screenBookings.status, 'approved'))
      .groupBy(sql`DATE_TRUNC('month', ${screenBookings.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${screenBookings.createdAt})`);

      const totalBookings = mostBookedScreens.reduce((sum, item) => sum + item.bookingCount, 0);

      res.json({
        mostBookedScreens,
        cityDistribution,
        avgPrices,
        bookingTrends,
        totalBookings
      });
    } catch (error) {
      console.error("Error fetching booking analytics:", error);
      res.status(500).json({ error: "Failed to fetch booking analytics" });
    }
  });

  // Admin Pricing Management Routes
  app.get("/api/admin/subscription-plans", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/admin/subscription-plans", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { 
        name, nameAr, description, descriptionAr, price, currency, 
        billingPeriod, offerLimit, isActive, isPopular, sortOrder, color 
      } = req.body;

      const [newPlan] = await db.insert(subscriptionPlans).values({
        name,
        nameAr,
        description,
        descriptionAr,
        price,
        currency: currency || 'SAR',
        billingPeriod: billingPeriod || 'monthly',
        offerLimit: offerLimit || 3,
        isActive: isActive !== undefined ? isActive : true,
        isPopular: isPopular || false,
        sortOrder: sortOrder || 0,
        color: color || '#3B82F6'
      }).returning();

      res.status(201).json(newPlan);
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({ error: "Failed to create subscription plan" });
    }
  });

  app.put("/api/admin/subscription-plans/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const planId = parseInt(req.params.id);
      const { 
        name, nameAr, description, descriptionAr, price, currency, 
        billingPeriod, offerLimit, isActive, isPopular, sortOrder, color 
      } = req.body;

      const [updatedPlan] = await db.update(subscriptionPlans)
        .set({
          name,
          nameAr,
          description,
          descriptionAr,
          price,
          currency,
          billingPeriod,
          offerLimit,
          isActive,
          isPopular,
          sortOrder,
          color,
          updatedAt: new Date()
        })
        .where(eq(subscriptionPlans.id, planId))
        .returning();

      if (!updatedPlan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }

      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({ error: "Failed to update subscription plan" });
    }
  });

  app.patch("/api/admin/subscription-plans/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const planId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedPlan] = await db.update(subscriptionPlans)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(subscriptionPlans.id, planId))
        .returning();

      if (!updatedPlan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }

      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating plan status:", error);
      res.status(500).json({ error: "Failed to update plan status" });
    }
  });

  app.delete("/api/admin/subscription-plans/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const planId = parseInt(req.params.id);

      // Check if plan has active subscriptions
      const activeSubscriptions = await db.select()
        .from(merchantSubscriptions)
        .where(and(
          eq(merchantSubscriptions.planId, planId),
          eq(merchantSubscriptions.status, 'active')
        ));

      if (activeSubscriptions.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete plan with active subscriptions" 
        });
      }

      await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({ error: "Failed to delete subscription plan" });
    }
  });

  // CMS Homepage Sections API
  app.get("/api/cms/homepage-sections", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const sections = await db.select().from(cmsHomepageSections).orderBy(cmsHomepageSections.sortOrder);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching homepage sections:", error);
      res.status(500).json({ error: "Failed to fetch homepage sections" });
    }
  });

  app.put("/api/cms/homepage-sections/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { id } = req.params;
      const data = req.body;
      
      await db.update(cmsHomepageSections)
        .set({ ...data, updatedAt: new Date(), updatedBy: req.user?.id })
        .where(eq(cmsHomepageSections.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating homepage section:", error);
      res.status(500).json({ error: "Failed to update homepage section" });
    }
  });

  // CMS Site Branding API
  app.get("/api/cms/site-branding", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const [branding] = await db.select().from(cmsSiteBranding).where(eq(cmsSiteBranding.isActive, true));
      res.json(branding || {});
    } catch (error) {
      console.error("Error fetching site branding:", error);
      res.status(500).json({ error: "Failed to fetch site branding" });
    }
  });

  app.put("/api/cms/site-branding", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const data = req.body;
      
      // Check if branding exists
      const [existing] = await db.select().from(cmsSiteBranding).where(eq(cmsSiteBranding.isActive, true));
      
      if (existing) {
        await db.update(cmsSiteBranding)
          .set({ ...data, updatedAt: new Date(), updatedBy: req.user?.id })
          .where(eq(cmsSiteBranding.id, existing.id));
      } else {
        await db.insert(cmsSiteBranding).values({
          ...data,
          isActive: true,
          updatedBy: req.user?.id
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating site branding:", error);
      res.status(500).json({ error: "Failed to update site branding" });
    }
  });

  // CMS Benefits API
  app.get("/api/cms/benefits", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const benefits = await db.select().from(cmsBenefits).orderBy(cmsBenefits.sortOrder);
      res.json(benefits);
    } catch (error) {
      console.error("Error fetching benefits:", error);
      res.status(500).json({ error: "Failed to fetch benefits" });
    }
  });

  app.post("/api/cms/benefits", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const data = req.body;
      const [benefit] = await db.insert(cmsBenefits).values({
        ...data,
        updatedBy: req.user?.id
      }).returning();
      
      res.json(benefit);
    } catch (error) {
      console.error("Error creating benefit:", error);
      res.status(500).json({ error: "Failed to create benefit" });
    }
  });

  app.put("/api/cms/benefits/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { id } = req.params;
      const data = req.body;
      
      await db.update(cmsBenefits)
        .set({ ...data, updatedAt: new Date(), updatedBy: req.user?.id })
        .where(eq(cmsBenefits.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating benefit:", error);
      res.status(500).json({ error: "Failed to update benefit" });
    }
  });

  app.delete("/api/cms/benefits/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { id } = req.params;
      await db.delete(cmsBenefits).where(eq(cmsBenefits.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting benefit:", error);
      res.status(500).json({ error: "Failed to delete benefit" });
    }
  });

  // CMS How It Works Steps API
  app.get("/api/cms/how-it-works-steps", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const steps = await db.select().from(cmsHowItWorksSteps).orderBy(cmsHowItWorksSteps.stepNumber);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching how it works steps:", error);
      res.status(500).json({ error: "Failed to fetch how it works steps" });
    }
  });

  app.post("/api/cms/how-it-works-steps", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const data = req.body;
      const [step] = await db.insert(cmsHowItWorksSteps).values({
        ...data,
        updatedBy: req.user?.id
      }).returning();
      
      res.json(step);
    } catch (error) {
      console.error("Error creating how it works step:", error);
      res.status(500).json({ error: "Failed to create how it works step" });
    }
  });

  app.put("/api/cms/how-it-works-steps/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { id } = req.params;
      const data = req.body;
      
      await db.update(cmsHowItWorksSteps)
        .set({ ...data, updatedAt: new Date(), updatedBy: req.user?.id })
        .where(eq(cmsHowItWorksSteps.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating how it works step:", error);
      res.status(500).json({ error: "Failed to update how it works step" });
    }
  });

  app.delete("/api/cms/how-it-works-steps/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { id } = req.params;
      await db.delete(cmsHowItWorksSteps).where(eq(cmsHowItWorksSteps.id, parseInt(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting how it works step:", error);
      res.status(500).json({ error: "Failed to delete how it works step" });
    }
  });

  // Admin Static Pages Management Routes
  app.get("/api/admin/static-pages", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const pages = await db.select().from(cmsStaticPages).orderBy(cmsStaticPages.sortOrder);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching static pages:", error);
      res.status(500).json({ error: "Failed to fetch static pages" });
    }
  });

  app.post("/api/admin/static-pages", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { 
        title, titleAr, slug, content, contentAr, metaTitle, metaTitleAr,
        metaDescription, metaDescriptionAr, isPublished, showInFooter, 
        showInHeader, sortOrder 
      } = req.body;

      // Check if slug already exists
      const existingPage = await db.select().from(cmsStaticPages).where(eq(cmsStaticPages.slug, slug));
      if (existingPage.length > 0) {
        return res.status(400).json({ error: "A page with this URL slug already exists" });
      }

      const [newPage] = await db.insert(cmsStaticPages).values({
        title,
        titleAr,
        slug,
        content,
        contentAr,
        metaTitle,
        metaTitleAr,
        metaDescription,
        metaDescriptionAr,
        isPublished: isPublished !== undefined ? isPublished : true,
        showInFooter: showInFooter || false,
        showInHeader: showInHeader || false,
        sortOrder: sortOrder || 0,
        createdBy: req.user.id,
        updatedBy: req.user.id,
        publishedAt: isPublished ? new Date() : null
      }).returning();

      res.status(201).json(newPage);
    } catch (error) {
      console.error("Error creating static page:", error);
      res.status(500).json({ error: "Failed to create static page" });
    }
  });

  app.put("/api/admin/static-pages/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const pageId = parseInt(req.params.id);
      const { 
        title, titleAr, slug, content, contentAr, metaTitle, metaTitleAr,
        metaDescription, metaDescriptionAr, isPublished, showInFooter, 
        showInHeader, sortOrder 
      } = req.body;

      // Check if slug already exists (excluding current page)
      const existingPage = await db.select().from(cmsStaticPages)
        .where(and(eq(cmsStaticPages.slug, slug), sql`${cmsStaticPages.id} != ${pageId}`));
      if (existingPage.length > 0) {
        return res.status(400).json({ error: "A page with this URL slug already exists" });
      }

      const [updatedPage] = await db.update(cmsStaticPages)
        .set({
          title,
          titleAr,
          slug,
          content,
          contentAr,
          isPublished: isPublished !== undefined ? isPublished : true,
          isVisible: isVisible !== undefined ? isVisible : true,
          showInFooter,
          showInHeader,
          sortOrder,
          updatedAt: new Date()
        })
        .where(eq(cmsStaticPages.id, pageId))
        .returning();

      if (!updatedPage) {
        return res.status(404).json({ error: "Static page not found" });
      }

      res.json(updatedPage);
    } catch (error) {
      console.error("Error updating static page:", error);
      res.status(500).json({ error: "Failed to update static page" });
    }
  });

  app.patch("/api/admin/static-pages/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const pageId = parseInt(req.params.id);
      const { isPublished } = req.body;

      const [updatedPage] = await db.update(staticPages)
        .set({ 
          isPublished, 
          updatedBy: req.user.id,
          updatedAt: new Date(),
          publishedAt: isPublished ? new Date() : null
        })
        .where(eq(staticPages.id, pageId))
        .returning();

      if (!updatedPage) {
        return res.status(404).json({ error: "Static page not found" });
      }

      res.json(updatedPage);
    } catch (error) {
      console.error("Error updating page status:", error);
      res.status(500).json({ error: "Failed to update page status" });
    }
  });

  app.delete("/api/admin/static-pages/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const pageId = parseInt(req.params.id);
      await db.delete(staticPages).where(eq(staticPages.id, pageId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting static page:", error);
      res.status(500).json({ error: "Failed to delete static page" });
    }
  });

  // Admin Merchant Management Routes
  app.get("/api/admin/merchants", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchants = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        businessName: users.businessName,
        businessType: users.businessType,
        city: users.city,
        role: users.role,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt
      })
      .from(users)
      .where(eq(users.role, 'business'));

      // Get stats for each merchant
      const merchantsWithStats = await Promise.all(
        merchants.map(async (merchant) => {
          const [offerCount] = await db.select({ count: count() })
            .from(offers)
            .where(eq(offers.businessId, merchant.id));

          const [bookingCount] = await db.select({ count: count() })
            .from(screenBookings)
            .where(eq(screenBookings.merchantId, merchant.id));

          const [totalRevenue] = await db.select({ 
            sum: sum(invoices.amount) 
          })
          .from(invoices)
          .where(eq(invoices.merchantId, merchant.id));

          const [avgRating] = await db.select({ 
            avg: avg(screenReviews.rating) 
          })
          .from(screenReviews)
          .leftJoin(screenBookings, eq(screenReviews.bookingId, screenBookings.id))
          .where(eq(screenBookings.merchantId, merchant.id));

          return {
            ...merchant,
            stats: {
              totalOffers: offerCount.count || 0,
              totalBookings: bookingCount.count || 0,
              totalRevenue: Number(totalRevenue.sum) || 0,
              averageRating: Number(avgRating.avg) || 0
            }
          };
        })
      );

      res.json(merchantsWithStats);
    } catch (error) {
      console.error("Error fetching merchants:", error);
      res.status(500).json({ error: "Failed to fetch merchants" });
    }
  });

  app.patch("/api/admin/merchants/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchantId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedMerchant] = await db.update(users)
        .set({ isActive })
        .where(eq(users.id, merchantId))
        .returning();

      if (!updatedMerchant) {
        return res.status(404).json({ error: "Merchant not found" });
      }

      res.json(updatedMerchant);
    } catch (error) {
      console.error("Error updating merchant status:", error);
      res.status(500).json({ error: "Failed to update merchant status" });
    }
  });

  app.delete("/api/admin/merchants/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchantId = parseInt(req.params.id);

      // Check if merchant has active bookings or offers
      const activeOffers = await db.select().from(offers).where(eq(offers.businessId, merchantId));
      const activeBookings = await db.select().from(screenBookings)
        .where(and(
          eq(screenBookings.merchantId, merchantId),
          eq(screenBookings.status, 'active')
        ));

      if (activeOffers.length > 0 || activeBookings.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete merchant with active offers or bookings" 
        });
      }

      await db.delete(users).where(eq(users.id, merchantId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting merchant:", error);
      res.status(500).json({ error: "Failed to delete merchant" });
    }
  });

  app.post("/api/admin/merchants/:id/email", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchantId = parseInt(req.params.id);
      const { subject, message } = req.body;

      const [merchant] = await db.select().from(users).where(eq(users.id, merchantId));
      if (!merchant) {
        return res.status(404).json({ error: "Merchant not found" });
      }

      // Send email using email service
      await emailService.sendEmail({
        to: merchant.email,
        subject,
        text: message,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Testimonials API routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/admin/testimonials", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const { status } = req.query;
      const testimonials = await storage.getAllTestimonials(status as string);
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/admin/testimonials", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  app.put("/api/admin/testimonials/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const testimonial = await storage.updateTestimonial(id, updates);
      
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTestimonial(id);
      
      if (!success) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  app.put("/api/admin/testimonials/:id/order", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const { displayOrder } = req.body;
      const testimonial = await storage.updateTestimonialOrder(id, displayOrder);
      
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial order:", error);
      res.status(500).json({ error: "Failed to update testimonial order" });
    }
  });

  app.put("/api/admin/testimonials/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const testimonial = await storage.approveTestimonial(id, req.user.id);
      
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error("Error approving testimonial:", error);
      res.status(500).json({ error: "Failed to approve testimonial" });
    }
  });

  app.put("/api/admin/testimonials/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const testimonial = await storage.rejectTestimonial(id, req.user.id);
      
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      res.status(500).json({ error: "Failed to reject testimonial" });
    }
  });

  app.put("/api/admin/testimonials/:id/toggle-visibility", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      const testimonial = await storage.toggleTestimonialVisibility(id);
      
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error("Error toggling testimonial visibility:", error);
      res.status(500).json({ error: "Failed to toggle testimonial visibility" });
    }
  });

  // Site Settings API Routes
  app.get("/api/site-settings", async (req, res) => {
    try {
      // Return default site settings
      const siteSettings = {
        siteName: "براق",
        siteNameAr: "براق",
        siteDescription: "منصة الإعلانات الذكية للشركات السعودية",
        siteDescriptionAr: "منصة الإعلانات الذكية للشركات السعودية",
        contactEmail: "info@baraq.ai",
        contactPhone: "+966123456789",
        whatsappNumber: "+966123456789",
        facebookUrl: "https://facebook.com/laqtoha",
        twitterUrl: "https://twitter.com/laqtoha",
        instagramUrl: "https://instagram.com/laqtoha",
        linkedinUrl: "https://linkedin.com/company/laqtoha",
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
      };
      res.json(siteSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ error: "Failed to fetch site settings" });
    }
  });

  app.put("/api/site-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      // For now, just return the updated settings
      // In a real implementation, you would save these to a database
      const updatedSettings = req.body;
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ error: "Failed to update site settings" });
    }
  });

  // Admin offer management routes
  app.get("/api/admin/offers", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { status, search } = req.query;
      
      let query = db.select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        originalPrice: offers.originalPrice,
        discountedPrice: offers.discountedPrice,
        discountPercentage: offers.discountPercentage,
        startDate: offers.startDate,
        endDate: offers.endDate,
        isActive: offers.isActive,
        isApproved: offers.isApproved,
        isFeatured: offers.isFeatured,
        isPriority: offers.isPriority,
        businessId: offers.businessId,
        categoryId: offers.categoryId,
        imageUrl: offers.imageUrl,
        discountCode: offers.discountCode,
        link: offers.link,
        city: offers.city,
        views: offers.views,
        createdAt: offers.createdAt,
        business: {
          id: users.id,
          businessName: users.businessName,
        },
        category: {
          id: categories.id,
          name: categories.name,
        }
      })
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id));

      if (status && status !== 'all') {
        if (status === 'approved') {
          query = query.where(eq(offers.isApproved, true));
        } else if (status === 'pending') {
          query = query.where(eq(offers.isApproved, false));
        }
      }

      const allOffers = await query;
      
      let filteredOffers = allOffers;
      if (search) {
        const searchLower = search.toString().toLowerCase();
        filteredOffers = allOffers.filter(offer => 
          offer.title?.toLowerCase().includes(searchLower) ||
          offer.description?.toLowerCase().includes(searchLower) ||
          offer.business?.businessName?.toLowerCase().includes(searchLower)
        );
      }

      res.json(filteredOffers);
    } catch (error) {
      console.error("Error fetching admin offers:", error);
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  app.post("/api/admin/offers/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const offerId = parseInt(req.params.id);
      
      const [updatedOffer] = await db.update(offers)
        .set({ 
          isApproved: true,
          isActive: true
        })
        .where(eq(offers.id, offerId))
        .returning();

      if (!updatedOffer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      res.json({ success: true, offer: updatedOffer });
    } catch (error) {
      console.error("Error approving offer:", error);
      res.status(500).json({ error: "Failed to approve offer" });
    }
  });

  app.post("/api/admin/offers/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const offerId = parseInt(req.params.id);
      
      const [updatedOffer] = await db.update(offers)
        .set({ 
          isApproved: false,
          isActive: false
        })
        .where(eq(offers.id, offerId))
        .returning();

      if (!updatedOffer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      res.json({ success: true, offer: updatedOffer });
    } catch (error) {
      console.error("Error rejecting offer:", error);
      res.status(500).json({ error: "Failed to reject offer" });
    }
  });

  app.put("/api/admin/offers/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const offerId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Calculate discount percentage if prices are updated
      if (updateData.originalPrice && updateData.discountedPrice) {
        updateData.discountPercentage = Math.round(
          ((updateData.originalPrice - updateData.discountedPrice) / updateData.originalPrice) * 100
        );
      }
      
      updateData.updatedAt = new Date();

      const [updatedOffer] = await db.update(offers)
        .set(updateData)
        .where(eq(offers.id, offerId))
        .returning();

      if (!updatedOffer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      res.json({ success: true, offer: updatedOffer });
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ error: "Failed to update offer" });
    }
  });

  app.delete("/api/admin/offers/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const offerId = parseInt(req.params.id);
      
      // Check if offer has any redemptions or bookings
      const redemptions = await db.select()
        .from(offerRedemptions)
        .where(eq(offerRedemptions.offerId, offerId));

      if (redemptions.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete offer with existing redemptions" 
        });
      }

      await db.delete(offers).where(eq(offers.id, offerId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).json({ error: "Failed to delete offer" });
    }
  });

  // Static pages management routes
  app.get("/api/admin/static-pages", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const pages = await db.select().from(cmsStaticPages).orderBy(cmsStaticPages.sortOrder);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching static pages:", error);
      res.status(500).json({ error: "Failed to fetch static pages" });
    }
  });

  app.get("/api/static-pages/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const [page] = await db.select()
        .from(cmsStaticPages)
        .where(and(
          eq(cmsStaticPages.slug, slug),
          eq(cmsStaticPages.isPublished, true)
        ));

      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }

      res.json(page);
    } catch (error) {
      console.error("Error fetching static page:", error);
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.post("/api/admin/static-pages", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const pageData = req.body;
      pageData.createdBy = req.user.id;
      pageData.updatedBy = req.user.id;
      pageData.publishedAt = pageData.isPublished ? new Date() : null;

      const [newPage] = await db.insert(cmsStaticPages)
        .values(pageData)
        .returning();

      res.status(201).json(newPage);
    } catch (error) {
      console.error("Error creating static page:", error);
      res.status(500).json({ error: "Failed to create page" });
    }
  });

  app.put("/api/admin/static-pages/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const pageId = parseInt(req.params.id);
      const updateData = req.body;
      updateData.updatedBy = req.user.id;
      updateData.updatedAt = new Date();
      
      if (updateData.isPublished && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }

      const [updatedPage] = await db.update(cmsStaticPages)
        .set(updateData)
        .where(eq(cmsStaticPages.id, pageId))
        .returning();

      if (!updatedPage) {
        return res.status(404).json({ error: "Page not found" });
      }

      res.json(updatedPage);
    } catch (error) {
      console.error("Error updating static page:", error);
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/admin/static-pages/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const pageId = parseInt(req.params.id);
      
      await db.delete(cmsStaticPages).where(eq(cmsStaticPages.id, pageId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting static page:", error);
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // Personalized Recommendations API
  app.get("/api/recommendations", async (req, res) => {
    try {
      const userId = req.user?.id;
      
      // Get user's business category and city for personalization
      const userCategory = req.user?.businessCategory;
      const userCity = req.user?.businessCity;
      
      const recommendations = [];

      // 1. Trending Offers in User's City
      if (userCity) {
        const trendingQuery = db.select({
          id: offers.id,
          title: offers.title,
          description: offers.description,
          originalPrice: offers.originalPrice,
          discountedPrice: offers.discountedPrice,
          discountPercentage: offers.discountPercentage,
          imageUrl: offers.imageUrl,
          city: offers.city,
          views: offers.views,
          business: {
            businessName: users.businessName,
          },
          category: {
            name: categories.name,
          }
        })
        .from(offers)
        .leftJoin(users, eq(offers.businessId, users.id))
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(
          and(
            eq(offers.isApproved, true),
            eq(offers.isActive, true),
            eq(offers.city, userCity)
          )
        )
        .orderBy(desc(offers.views))
        .limit(6);

        const trendingOffers = await trendingQuery;
        
        if (trendingOffers.length > 0) {
          recommendations.push({
            title: `العروض الرائجة في ${userCity}`,
            reason: `العروض الأكثر مشاهدة في مدينتك`,
            icon: "location",
            offers: trendingOffers
          });
        }
      }

      // 2. Similar Category Offers (if user has a business)
      if (userCategory) {
        const similarCategoryQuery = db.select({
          id: offers.id,
          title: offers.title,
          description: offers.description,
          originalPrice: offers.originalPrice,
          discountedPrice: offers.discountedPrice,
          discountPercentage: offers.discountPercentage,
          imageUrl: offers.imageUrl,
          city: offers.city,
          views: offers.views,
          business: {
            businessName: users.businessName,
          },
          category: {
            name: categories.name,
          }
        })
        .from(offers)
        .leftJoin(users, eq(offers.businessId, users.id))
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(
          and(
            eq(offers.isApproved, true),
            eq(offers.isActive, true),
            eq(categories.name, userCategory),
            userId ? not(eq(offers.businessId, userId)) : sql`true`
          )
        )
        .orderBy(desc(offers.discountPercentage))
        .limit(6);

        const similarOffers = await similarCategoryQuery;
        
        if (similarOffers.length > 0) {
          recommendations.push({
            title: `عروض في مجال ${userCategory}`,
            reason: `عروض مشابهة لمجال عملك`,
            icon: "category",
            offers: similarOffers
          });
        }
      }

      // 3. High Discount Offers
      const highDiscountQuery = db.select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        originalPrice: offers.originalPrice,
        discountedPrice: offers.discountedPrice,
        discountPercentage: offers.discountPercentage,
        imageUrl: offers.imageUrl,
        city: offers.city,
        views: offers.views,
        business: {
          businessName: users.businessName,
        },
        category: {
          name: categories.name,
        }
      })
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .where(
        and(
          eq(offers.isApproved, true),
          eq(offers.isActive, true),
          gte(offers.discountPercentage, 30)
        )
      )
      .orderBy(desc(offers.discountPercentage))
      .limit(6);

      const highDiscountOffers = await highDiscountQuery;
      
      if (highDiscountOffers.length > 0) {
        recommendations.push({
          title: "عروض بخصومات كبيرة",
          reason: "وفر أكثر مع هذه العروض المميزة",
          icon: "trending",
          offers: highDiscountOffers
        });
      }

      // 4. Popular Offers (Most Viewed)
      const popularQuery = db.select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        originalPrice: offers.originalPrice,
        discountedPrice: offers.discountedPrice,
        discountPercentage: offers.discountPercentage,
        imageUrl: offers.imageUrl,
        city: offers.city,
        views: offers.views,
        business: {
          businessName: users.businessName,
        },
        category: {
          name: categories.name,
        }
      })
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .where(
        and(
          eq(offers.isApproved, true),
          eq(offers.isActive, true),
          gte(offers.views, 10)
        )
      )
      .orderBy(desc(offers.views))
      .limit(6);

      const popularOffers = await popularQuery;
      
      if (popularOffers.length > 0) {
        recommendations.push({
          title: "العروض الأكثر شعبية",
          reason: "العروض التي يبحث عنها الجميع",
          icon: "popular",
          offers: popularOffers
        });
      }

      // 5. Recently Added Offers
      const recentQuery = db.select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        originalPrice: offers.originalPrice,
        discountedPrice: offers.discountedPrice,
        discountPercentage: offers.discountPercentage,
        imageUrl: offers.imageUrl,
        city: offers.city,
        views: offers.views,
        business: {
          businessName: users.businessName,
        },
        category: {
          name: categories.name,
        }
      })
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .where(
        and(
          eq(offers.isApproved, true),
          eq(offers.isActive, true),
          gte(offers.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        )
      )
      .orderBy(desc(offers.createdAt))
      .limit(6);

      const recentOffers = await recentQuery;
      
      if (recentOffers.length > 0) {
        recommendations.push({
          title: "العروض الجديدة",
          reason: "أحدث العروض المضافة هذا الأسبوع",
          icon: "recent",
          offers: recentOffers
        });
      }

      // If no specific recommendations, provide general trending offers
      if (recommendations.length === 0) {
        const generalQuery = db.select({
          id: offers.id,
          title: offers.title,
          description: offers.description,
          originalPrice: offers.originalPrice,
          discountedPrice: offers.discountedPrice,
          discountPercentage: offers.discountPercentage,
          imageUrl: offers.imageUrl,
          city: offers.city,
          views: offers.views,
          business: {
            businessName: users.businessName,
          },
          category: {
            name: categories.name,
          }
        })
        .from(offers)
        .leftJoin(users, eq(offers.businessId, users.id))
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(
          and(
            eq(offers.isApproved, true),
            eq(offers.isActive, true)
          )
        )
        .orderBy(desc(offers.views))
        .limit(6);

        const generalOffers = await generalQuery;
        
        recommendations.push({
          title: "العروض المقترحة",
          reason: "اكتشف أفضل العروض المتاحة",
          icon: "default",
          offers: generalOffers
        });
      }

      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  // Badge Management API Routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badgesWithStats = await badgeService.getAllBadgesWithStats();
      res.json(badgesWithStats);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user is accessing their own badges or is admin
      if (!req.isAuthenticated() || (req.user.id !== userId && req.user.role !== 'admin')) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const userBadges = await badgeService.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  app.post("/api/users/:userId/check-badges", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const userId = parseInt(req.params.userId);
      
      // Only allow checking own badges or admin
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const newBadges = await badgeService.checkAndAwardBadges(userId);
      res.json({ 
        message: `Checked badges for user ${userId}`,
        newBadges,
        count: newBadges.length
      });
    } catch (error) {
      console.error("Error checking badges:", error);
      res.status(500).json({ error: "Failed to check badges" });
    }
  });

  app.post("/api/admin/badges", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const badgeData = req.body;
      const [newBadge] = await db.insert(badges).values(badgeData).returning();
      res.status(201).json(newBadge);
    } catch (error) {
      console.error("Error creating badge:", error);
      res.status(500).json({ error: "Failed to create badge" });
    }
  });

  app.put("/api/admin/badges/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const badgeId = parseInt(req.params.id);
      const updateData = { ...req.body, updatedAt: new Date() };
      
      const [updatedBadge] = await db.update(badges)
        .set(updateData)
        .where(eq(badges.id, badgeId))
        .returning();

      if (!updatedBadge) {
        return res.status(404).json({ error: "Badge not found" });
      }

      res.json(updatedBadge);
    } catch (error) {
      console.error("Error updating badge:", error);
      res.status(500).json({ error: "Failed to update badge" });
    }
  });

  app.post("/api/admin/award-badge", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { userId, badgeId } = req.body;
      
      if (!userId || !badgeId) {
        return res.status(400).json({ error: "Missing userId or badgeId" });
      }

      const awardedBadge = await badgeService.awardBadge(userId, badgeId, false, req.user.id);
      
      if (!awardedBadge) {
        return res.status(400).json({ error: "Badge already awarded or failed to award" });
      }

      res.status(201).json({ 
        message: "Badge awarded successfully",
        userBadge: awardedBadge
      });
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: "Failed to award badge" });
    }
  });

  app.delete("/api/admin/user-badges/:userId/:badgeId", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const userId = parseInt(req.params.userId);
      const badgeId = parseInt(req.params.badgeId);
      
      const success = await badgeService.removeBadge(userId, badgeId);
      
      if (!success) {
        return res.status(404).json({ error: "Badge not found or failed to remove" });
      }

      res.json({ message: "Badge removed successfully" });
    } catch (error) {
      console.error("Error removing badge:", error);
      res.status(500).json({ error: "Failed to remove badge" });
    }
  });

  // Analytics API Routes
  
  // Merchant Analytics
  app.get("/api/merchant/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const analytics = await analyticsService.getMerchantAnalytics(req.user.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching merchant analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Admin Analytics
  app.get("/api/admin/analytics", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const analytics = await analyticsService.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Leads API Routes
  
  // Submit a lead
  app.post("/api/leads", async (req, res) => {
    try {
      const { fullName, phone, city, offerId, merchantId } = req.body;
      
      const newLead = await db.insert(leads).values({
        fullName,
        phone,
        city,
        offerId,
        merchantId,
        userId: req.user?.id || null,
      }).returning();

      res.status(201).json(newLead[0]);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Get leads for a merchant
  app.get("/api/merchant/leads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const merchantLeads = await db.select({
        id: leads.id,
        fullName: leads.fullName,
        phone: leads.phone,
        city: leads.city,
        createdAt: leads.createdAt,
        isRead: leads.isRead,
        notes: leads.notes,
        offer: {
          id: offers.id,
          title: offers.title,
        }
      })
      .from(leads)
      .leftJoin(offers, eq(leads.offerId, offers.id))
      .where(eq(leads.merchantId, req.user.id))
      .orderBy(desc(leads.createdAt));

      res.json(merchantLeads);
    } catch (error) {
      console.error("Error fetching merchant leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Mark lead as read
  app.patch("/api/leads/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { id } = req.params;
      
      await db.update(leads)
        .set({ isRead: true })
        .where(and(eq(leads.id, parseInt(id)), eq(leads.merchantId, req.user.id)));

      res.json({ message: "Lead marked as read" });
    } catch (error) {
      console.error("Error marking lead as read:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Subscription Plans API Routes
  
  // Get all subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      // Return static plans for now
      const staticPlans = [
        {
          id: 1,
          name: "Basic Package",
          nameAr: "الباقة المجانية",
          description: "Perfect for small businesses starting out",
          descriptionAr: "مثالية للأعمال الصغيرة المبتدئة",
          price: "0",
          currency: "SAR",
          duration: 30,
          features: ["Up to 5 offers", "Basic analytics", "Email support"],
          featuresAr: ["حتى 5 عروض", "تحليلات أساسية", "دعم عبر البريد الإلكتروني"],
          maxOffers: 5,
          priorityOffers: false,
          analytics: false,
          badges: false,
          isActive: true,
          sortOrder: 1
        },
        {
          id: 2,
          name: "Featured Package",
          nameAr: "الباقة المميزة",
          description: "Enhanced visibility for growing businesses",
          descriptionAr: "رؤية محسنة للأعمال النامية",
          price: "199",
          currency: "SAR",
          duration: 30,
          features: ["Up to 20 offers", "Featured listing", "Advanced analytics", "Priority support"],
          featuresAr: ["حتى 20 عرض", "إدراج مميز", "تحليلات متقدمة", "دعم أولوية"],
          maxOffers: 20,
          priorityOffers: true,
          analytics: true,
          badges: false,
          isActive: true,
          sortOrder: 2
        },
        {
          id: 3,
          name: "Professional Package",
          nameAr: "الباقة الاحترافية",
          description: "Complete solution for established businesses",
          descriptionAr: "حل شامل للأعمال الراسخة",
          price: "399",
          currency: "SAR",
          duration: 30,
          features: ["Unlimited offers", "Priority placement", "Full analytics", "Badges system", "24/7 support"],
          featuresAr: ["عروض غير محدودة", "ترتيب أولوية", "تحليلات كاملة", "نظام الشارات", "دعم 24/7"],
          maxOffers: -1,
          priorityOffers: true,
          analytics: true,
          badges: true,
          isActive: true,
          sortOrder: 3
        }
      ];

      res.json(staticPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  // Merchant Profile API Routes
  
  // Get merchant profile with offers and stats
  app.get("/api/merchants/:id/profile", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get merchant info
      const [merchant] = await db.select()
        .from(users)
        .where(and(eq(users.id, parseInt(id)), eq(users.isApproved, true)));

      if (!merchant) {
        return res.status(404).json({ error: "Merchant not found" });
      }

      // Get merchant offers
      const merchantOffers = await db.select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        discountPercentage: offers.discountPercentage,
        originalPrice: offers.originalPrice,
        discountedPrice: offers.discountedPrice,
        imageUrl: offers.imageUrl,
        views: offers.views,
        city: offers.city,
        isFeatured: offers.isFeatured,
        isPriority: offers.isPriority,
        isActive: offers.isActive,
        isApproved: offers.isApproved,
        createdAt: offers.createdAt,
        startDate: offers.startDate,
        endDate: offers.endDate,
        linkType: offers.linkType,
        link: offers.link,
        businessId: offers.businessId,
        categoryId: offers.categoryId,
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
          emoji: categories.emoji,
        },
      })
        .from(offers)
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(and(
          eq(offers.businessId, parseInt(id)),
          eq(offers.isApproved, true)
        ))
        .orderBy(desc(offers.isPriority), desc(offers.createdAt));

      // Calculate stats
      const totalOffers = merchantOffers.length;
      const activeOffers = merchantOffers.filter(offer => 
        offer.isActive && 
        (!offer.endDate || new Date(offer.endDate) > new Date())
      ).length;
      const expiredOffers = totalOffers - activeOffers;
      const totalViews = merchantOffers.reduce((sum, offer) => sum + (offer.views || 0), 0);
      const offersWithDiscount = merchantOffers.filter(offer => offer.discountPercentage);
      const averageDiscount = offersWithDiscount.length > 0 
        ? Math.round(offersWithDiscount.reduce((sum, offer) => sum + (offer.discountPercentage || 0), 0) / offersWithDiscount.length)
        : 0;

      const profile = {
        ...merchant,
        offers: merchantOffers,
        stats: {
          totalOffers,
          activeOffers,
          expiredOffers,
          totalViews,
          averageDiscount
        }
      };

      res.json(profile);
    } catch (error) {
      console.error("Error fetching merchant profile:", error);
      res.status(500).json({ error: "Failed to fetch merchant profile" });
    }
  });

  // Tracking Settings API Routes
  
  // Smart Recommendations API
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { 
        userId, 
        currentOfferId, 
        categoryId, 
        city, 
        limit = "6", 
        excludeIds 
      } = req.query;

      let query = db.select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        discountPercentage: offers.discountPercentage,
        originalPrice: offers.originalPrice,
        discountedPrice: offers.discountedPrice,
        imageUrl: offers.imageUrl,
        views: offers.views,
        city: offers.city,
        isFeatured: offers.isFeatured,
        isPriority: offers.isPriority,
        createdAt: offers.createdAt,
        startDate: offers.startDate,
        endDate: offers.endDate,
        linkType: offers.linkType,
        link: offers.link,
        businessId: offers.businessId,
        categoryId: offers.categoryId,
        business: {
          id: users.id,
          businessName: users.businessName,
          businessPhone: users.businessPhone,
          businessWhatsapp: users.businessWhatsapp,
        },
        category: {
          id: categories.id,
          name: categories.name,
          nameAr: categories.nameAr,
          emoji: categories.emoji,
        },
      })
        .from(offers)
        .leftJoin(users, eq(offers.businessId, users.id))
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(
          and(
            eq(offers.isActive, true),
            eq(offers.isApproved, true)
          )
        );

      // Apply filters
      const conditions = [
        eq(offers.isActive, true),
        eq(offers.isApproved, true)
      ];

      if (currentOfferId) {
        conditions.push(ne(offers.id, parseInt(currentOfferId as string)));
      }

      if (excludeIds) {
        const idsArray = (excludeIds as string).split(',').map(id => parseInt(id));
        conditions.push(not(inArray(offers.id, idsArray)));
      }

      if (categoryId) {
        conditions.push(eq(offers.categoryId, parseInt(categoryId as string)));
      }

      if (city) {
        conditions.push(eq(offers.city, city as string));
      }

      query = query.where(and(...conditions));

      // Smart ordering: Priority > Views > Recent
      query = query
        .orderBy(
          desc(offers.isPriority),
          desc(offers.views),
          desc(offers.createdAt)
        )
        .limit(parseInt(limit as string));

      const recommendations = await query;
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Get tracking settings (public endpoint for client-side scripts)
  app.get("/api/tracking-settings", async (req, res) => {
    try {
      const [results] = await db.execute('SELECT * FROM tracking_settings ORDER BY id DESC LIMIT 1');
      
      if (!results || results.length === 0) {
        return res.json({
          googleAnalyticsId: '',
          googleTagManagerId: '',
          googleAdsConversionId: '',
          googleAdsConversionLabel: '',
          metaPixelId: '',
          tiktokPixelId: '',
          snapPixelId: '',
          trackingEnabled: false
        });
      }

      const result = results[0];
      res.json({
        googleAnalyticsId: result.google_analytics_id || '',
        googleTagManagerId: result.google_tag_manager_id || '',
        googleAdsConversionId: result.google_ads_conversion_id || '',
        googleAdsConversionLabel: result.google_ads_conversion_label || '',
        metaPixelId: result.meta_pixel_id || '',
        tiktokPixelId: result.tiktok_pixel_id || '',
        snapPixelId: result.snap_pixel_id || '',
        trackingEnabled: Boolean(result.tracking_enabled)
      });
    } catch (error) {
      console.error("Error fetching tracking settings:", error);
      res.json({
        googleAnalyticsId: '',
        googleTagManagerId: '',
        googleAdsConversionId: '',
        googleAdsConversionLabel: '',
        metaPixelId: '',
        tiktokPixelId: '',
        snapPixelId: '',
        trackingEnabled: false
      });
    }
  });

  // Admin tracking settings
  app.get("/api/admin/tracking-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const [results] = await db.execute('SELECT * FROM tracking_settings ORDER BY id DESC LIMIT 1');
      
      if (!results || results.length === 0) {
        return res.json({
          googleAnalyticsId: '',
          googleTagManagerId: '',
          googleAdsConversionId: '',
          googleAdsConversionLabel: '',
          metaPixelId: '',
          tiktokPixelId: '',
          snapPixelId: '',
          trackingEnabled: true
        });
      }

      const result = results[0];
      res.json({
        googleAnalyticsId: result.google_analytics_id || '',
        googleTagManagerId: result.google_tag_manager_id || '',
        googleAdsConversionId: result.google_ads_conversion_id || '',
        googleAdsConversionLabel: result.google_ads_conversion_label || '',
        metaPixelId: result.meta_pixel_id || '',
        tiktokPixelId: result.tiktok_pixel_id || '',
        snapPixelId: result.snap_pixel_id || '',
        trackingEnabled: Boolean(result.tracking_enabled)
      });
    } catch (error) {
      console.error("Error fetching admin tracking settings:", error);
      res.status(500).json({ error: "Failed to fetch tracking settings" });
    }
  });

  // Update tracking settings
  app.put("/api/admin/tracking-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const {
        googleAnalyticsId,
        googleTagManagerId,
        googleAdsConversionId,
        googleAdsConversionLabel,
        metaPixelId,
        tiktokPixelId,
        snapPixelId,
        trackingEnabled
      } = req.body;

      // Check if settings exist
      const [existing] = await db.execute('SELECT id FROM tracking_settings LIMIT 1');
      
      if (!existing || existing.length === 0) {
        // Insert new settings
        await db.execute(
          'INSERT INTO tracking_settings (google_analytics_id, google_tag_manager_id, google_ads_conversion_id, google_ads_conversion_label, meta_pixel_id, tiktok_pixel_id, snap_pixel_id, tracking_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            googleAnalyticsId || '',
            googleTagManagerId || '',
            googleAdsConversionId || '',
            googleAdsConversionLabel || '',
            metaPixelId || '',
            tiktokPixelId || '',
            snapPixelId || '',
            trackingEnabled !== false
          ]
        );
      } else {
        // Update existing settings
        await db.execute(
          'UPDATE tracking_settings SET google_analytics_id = ?, google_tag_manager_id = ?, google_ads_conversion_id = ?, google_ads_conversion_label = ?, meta_pixel_id = ?, tiktok_pixel_id = ?, snap_pixel_id = ?, tracking_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM tracking_settings ORDER BY id DESC LIMIT 1)',
          [
            googleAnalyticsId || '',
            googleTagManagerId || '',
            googleAdsConversionId || '',
            googleAdsConversionLabel || '',
            metaPixelId || '',
            tiktokPixelId || '',
            snapPixelId || '',
            trackingEnabled !== false
          ]
        );
      }

      res.json({ message: "Tracking settings updated successfully" });
    } catch (error) {
      console.error("Error updating tracking settings:", error);
      res.status(500).json({ error: "Failed to update tracking settings" });
    }
  });

  // Like an offer - creates a lead
  app.post("/api/offers/:id/like", async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const { fullName, mobileNumber, city } = req.body;

      if (!fullName || !mobileNumber || !city) {
        return res.status(400).json({ error: "جميع البيانات مطلوبة" });
      }

      // Get offer details for email
      const offer = await db.query.offers.findFirst({
        where: eq(offers.id, offerId),
        with: {
          user: true
        }
      });

      if (!offer) {
        return res.status(404).json({ error: "العرض غير موجود" });
      }

      // Create lead record
      const [lead] = await db.insert(leads).values({
        offerId,
        fullName,
        mobileNumber,
        city,
        source: 'like_button'
      }).returning();

      // Send email notification to merchant
      try {
        await emailService.sendLeadNotificationEmail(
          offer.user.email,
          {
            businessName: offer.user.businessName || offer.user.username,
            offerTitle: offer.title,
            customerName: fullName,
            customerPhone: mobileNumber,
            customerCity: city
          }
        );
      } catch (emailError) {
        console.error("Failed to send lead notification email:", emailError);
      }

      res.status(201).json({ 
        success: true, 
        message: "تم إرسال اهتمامك بالعرض للتاجر بنجاح",
        lead 
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
    }
  });

  // Get leads for a merchant
  app.get("/api/leads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "غير مصرح" });
      }

      const userLeads = await db.query.leads.findMany({
        where: eq(leads.userId, req.user!.id),
        orderBy: [desc(leads.createdAt)],
        with: {
          offer: true
        }
      });

      res.json(userLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "خطأ في جلب العملاء المحتملين" });
    }
  });

  // ============= DISCOUNT CODES MANAGEMENT API =============

  // Get all discount codes (admin only)
  app.get("/api/admin/discount-codes", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const codes = await db.select({
        id: discountCodes.id,
        code: discountCodes.code,
        description: discountCodes.description,
        discountType: discountCodes.discountType,
        discountValue: discountCodes.discountValue,
        minimumOrderValue: discountCodes.minimumOrderValue,
        maxUses: discountCodes.maxUses,
        usedCount: discountCodes.usedCount,
        startDate: discountCodes.startDate,
        endDate: discountCodes.endDate,
        isActive: discountCodes.isActive,
        createdAt: discountCodes.createdAt,
        createdBy: users.username,
      })
      .from(discountCodes)
      .leftJoin(users, eq(discountCodes.createdBy, users.id))
      .orderBy(desc(discountCodes.createdAt));

      // Calculate usage stats for each code
      const codesWithStats = await Promise.all(codes.map(async (code) => {
        const usageStats = await db.select({
          usageCount: sql<number>`COUNT(*)`,
          totalSavings: sql<number>`COALESCE(SUM(${discountCodeUsage.discountAmount}), 0)`,
        })
        .from(discountCodeUsage)
        .where(eq(discountCodeUsage.codeId, code.id));

        return {
          ...code,
          usageCount: Number(usageStats[0]?.usageCount || 0),
          totalSavings: Number(usageStats[0]?.totalSavings || 0),
          createdBy: { username: code.createdBy, businessName: code.createdBy }
        };
      }));

      res.json(codesWithStats);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      res.status(500).json({ error: "Failed to fetch discount codes" });
    }
  });

  // Create new discount code (admin only)
  app.post("/api/admin/discount-codes", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { code, description, discountType, discountValue, minimumOrderValue, maxUses, startDate, endDate, isActive } = req.body;

      // Check if code already exists
      const existingCode = await db.select()
        .from(discountCodes)
        .where(eq(discountCodes.code, code))
        .limit(1);

      if (existingCode.length > 0) {
        return res.status(400).json({ error: "Discount code already exists" });
      }

      const newCode = await db.insert(discountCodes).values({
        code,
        description,
        discountType,
        discountValue: discountValue.toString(),
        minimumOrderValue: minimumOrderValue?.toString() || "0",
        maxUses,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive,
        createdBy: req.user.id,
      }).returning();

      res.status(201).json(newCode[0]);
    } catch (error) {
      console.error("Error creating discount code:", error);
      res.status(500).json({ error: "Failed to create discount code" });
    }
  });

  // Update discount code (admin only)
  app.put("/api/admin/discount-codes/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const codeId = parseInt(req.params.id);
      const updates = req.body;

      const updatedCode = await db.update(discountCodes)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(discountCodes.id, codeId))
        .returning();

      if (updatedCode.length === 0) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      res.json(updatedCode[0]);
    } catch (error) {
      console.error("Error updating discount code:", error);
      res.status(500).json({ error: "Failed to update discount code" });
    }
  });

  // Delete discount code (admin only)
  app.delete("/api/admin/discount-codes/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const codeId = parseInt(req.params.id);

      const deleted = await db.delete(discountCodes)
        .where(eq(discountCodes.id, codeId))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting discount code:", error);
      res.status(500).json({ error: "Failed to delete discount code" });
    }
  });

  // Validate discount code (public endpoint)
  app.post("/api/validate-discount-code", async (req, res) => {
    try {
      const { code, orderValue } = req.body;

      const discountCode = await db.select()
        .from(discountCodes)
        .where(and(
          eq(discountCodes.code, code),
          eq(discountCodes.isActive, true)
        ))
        .limit(1);

      if (discountCode.length === 0) {
        return res.status(400).json({ error: "Invalid discount code" });
      }

      const discount = discountCode[0];
      const now = new Date();
      
      // Check date validity
      if (now < discount.startDate) {
        return res.status(400).json({ error: "Discount code not yet active" });
      }
      
      if (discount.endDate && now > discount.endDate) {
        return res.status(400).json({ error: "Discount code has expired" });
      }

      // Check usage limit
      if (discount.maxUses && discount.usedCount >= discount.maxUses) {
        return res.status(400).json({ error: "Discount code usage limit reached" });
      }

      // Check minimum order value
      if (Number(discount.minimumOrderValue) > 0 && orderValue < Number(discount.minimumOrderValue)) {
        return res.status(400).json({ 
          error: `Minimum order value is ${discount.minimumOrderValue} SAR` 
        });
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (discount.discountType === 'percentage') {
        discountAmount = (orderValue * Number(discount.discountValue)) / 100;
      } else {
        discountAmount = Number(discount.discountValue);
      }

      res.json({
        valid: true,
        discountAmount,
        discountType: discount.discountType,
        discountValue: Number(discount.discountValue),
      });
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ error: "Failed to validate discount code" });
    }
  });

  // ============= PAYMENT SETTINGS MANAGEMENT API =============

  // Get payment settings (admin only)
  app.get("/api/admin/payment-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const settings = await db.select()
        .from(paymentSettings)
        .orderBy(desc(paymentSettings.id))
        .limit(1);

      if (settings.length === 0) {
        // Return default settings
        return res.json({
          moyasarEnabled: false,
          moyasarPublishableKey: '',
          moyasarSecretKey: '',
          moyasarWebhookSecret: '',
          testMode: true,
          supportedCurrencies: ['SAR'],
          minimumAmount: '1.00',
          maximumAmount: '50000.00',
        });
      }

      res.json(settings[0]);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ error: "Failed to fetch payment settings" });
    }
  });

  // Update payment settings (admin only)
  app.put("/api/admin/payment-settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const settingsData = req.body;

      // Check if settings exist
      const existing = await db.select()
        .from(paymentSettings)
        .limit(1);

      if (existing.length === 0) {
        // Create new settings
        const newSettings = await db.insert(paymentSettings)
          .values({
            ...settingsData,
            minimumAmount: settingsData.minimumAmount?.toString() || '1.00',
            maximumAmount: settingsData.maximumAmount?.toString() || '50000.00',
          })
          .returning();

        res.json(newSettings[0]);
      } else {
        // Update existing settings
        const updatedSettings = await db.update(paymentSettings)
          .set({
            ...settingsData,
            minimumAmount: settingsData.minimumAmount?.toString() || '1.00',
            maximumAmount: settingsData.maximumAmount?.toString() || '50000.00',
            updatedAt: new Date(),
          })
          .where(eq(paymentSettings.id, existing[0].id))
          .returning();

        res.json(updatedSettings[0]);
      }
    } catch (error) {
      console.error("Error updating payment settings:", error);
      res.status(500).json({ error: "Failed to update payment settings" });
    }
  });

  // Test Moyasar connection (admin only)
  app.post("/api/admin/payment-settings/test-connection", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const settings = await db.select()
        .from(paymentSettings)
        .orderBy(desc(paymentSettings.id))
        .limit(1);

      if (settings.length === 0 || !settings[0].moyasarSecretKey) {
        return res.json({ success: false, error: "Moyasar secret key not configured" });
      }

      // Test Moyasar API connection
      const testUrl = settings[0].testMode 
        ? 'https://api.moyasar.com/v1/payments'
        : 'https://api.moyasar.com/v1/payments';

      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(settings[0].moyasarSecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (testResponse.ok || testResponse.status === 401) {
        // 401 is expected when testing with just the key, means API is reachable
        res.json({ success: true });
      } else {
        res.json({ success: false, error: `HTTP ${testResponse.status}` });
      }
    } catch (error) {
      console.error("Error testing payment connection:", error);
      res.json({ success: false, error: error.message });
    }
  });

  // ============= AFFILIATE/MARKETER MANAGEMENT API =============

  // Get all marketers (admin only)
  app.get("/api/admin/marketers", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const marketersData = await db.select()
        .from(marketers)
        .orderBy(desc(marketers.createdAt));

      // Calculate stats for each marketer
      const marketersWithStats = await Promise.all(marketersData.map(async (marketer) => {
        const referralStats = await db.select({
          referralCount: sql<number>`COUNT(*)`,
          conversionCount: sql<number>`SUM(CASE WHEN ${customerReferrals.status} = 'converted' THEN 1 ELSE 0 END)`,
          lastReferral: sql<string>`MAX(${customerReferrals.referredAt})`,
        })
        .from(customerReferrals)
        .where(eq(customerReferrals.marketerId, marketer.id));

        const stats = referralStats[0] || { referralCount: 0, conversionCount: 0, lastReferral: null };
        const referralCount = Number(stats.referralCount || 0);
        const conversionCount = Number(stats.conversionCount || 0);
        const conversionRate = referralCount > 0 ? (conversionCount / referralCount) * 100 : 0;

        return {
          ...marketer,
          referralCount,
          conversionCount,
          conversionRate,
          totalEarnings: Number(marketer.totalEarnings),
          lastReferral: stats.lastReferral,
        };
      }));

      res.json(marketersWithStats);
    } catch (error) {
      console.error("Error fetching marketers:", error);
      res.status(500).json({ error: "Failed to fetch marketers" });
    }
  });

  // Get marketer statistics (admin only)
  app.get("/api/admin/marketers/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const stats = await db.select({
        totalMarketers: sql<number>`COUNT(*)`,
        activeMarketers: sql<number>`SUM(CASE WHEN ${marketers.isActive} THEN 1 ELSE 0 END)`,
        totalEarnings: sql<number>`SUM(${marketers.totalEarnings})`,
      })
      .from(marketers);

      const referralStats = await db.select({
        totalReferrals: sql<number>`COUNT(*)`,
      })
      .from(customerReferrals);

      res.json({
        ...stats[0],
        totalReferrals: Number(referralStats[0]?.totalReferrals || 0),
        totalEarnings: Number(stats[0]?.totalEarnings || 0),
      });
    } catch (error) {
      console.error("Error fetching marketer stats:", error);
      res.status(500).json({ error: "Failed to fetch marketer stats" });
    }
  });

  // Create new marketer (admin only)
  app.post("/api/admin/marketers", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { name, email, phone, referralCode, commissionRate, isActive, notes } = req.body;

      // Check if email or referral code already exists
      const existing = await db.select()
        .from(marketers)
        .where(or(
          eq(marketers.email, email),
          eq(marketers.referralCode, referralCode)
        ))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ 
          error: existing[0].email === email ? "Email already exists" : "Referral code already exists" 
        });
      }

      const newMarketer = await db.insert(marketers).values({
        name,
        email,
        phone,
        referralCode,
        commissionRate: commissionRate?.toString() || "0",
        isActive,
        notes,
      }).returning();

      res.status(201).json(newMarketer[0]);
    } catch (error) {
      console.error("Error creating marketer:", error);
      res.status(500).json({ error: "Failed to create marketer" });
    }
  });

  // Update marketer (admin only)
  app.put("/api/admin/marketers/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const marketerId = parseInt(req.params.id);
      const updates = req.body;

      const updatedMarketer = await db.update(marketers)
        .set({
          ...updates,
          commissionRate: updates.commissionRate?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(marketers.id, marketerId))
        .returning();

      if (updatedMarketer.length === 0) {
        return res.status(404).json({ error: "Marketer not found" });
      }

      res.json(updatedMarketer[0]);
    } catch (error) {
      console.error("Error updating marketer:", error);
      res.status(500).json({ error: "Failed to update marketer" });
    }
  });

  // Delete marketer (admin only)
  app.delete("/api/admin/marketers/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const marketerId = parseInt(req.params.id);

      const deleted = await db.delete(marketers)
        .where(eq(marketers.id, marketerId))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Marketer not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting marketer:", error);
      res.status(500).json({ error: "Failed to delete marketer" });
    }
  });

  // Track referral (public endpoint)
  app.post("/api/track-referral", async (req, res) => {
    try {
      const { referralCode, customerEmail, customerPhone, ipAddress, userAgent } = req.body;

      if (!referralCode) {
        return res.status(400).json({ error: "Referral code is required" });
      }

      // Find marketer by referral code
      const marketer = await db.select()
        .from(marketers)
        .where(and(
          eq(marketers.referralCode, referralCode),
          eq(marketers.isActive, true)
        ))
        .limit(1);

      if (marketer.length === 0) {
        return res.status(400).json({ error: "Invalid referral code" });
      }

      // Check if referral already exists for this email/phone
      const existingReferral = await db.select()
        .from(customerReferrals)
        .where(and(
          eq(customerReferrals.marketerId, marketer[0].id),
          or(
            eq(customerReferrals.customerEmail, customerEmail),
            eq(customerReferrals.customerPhone, customerPhone)
          )
        ))
        .limit(1);

      if (existingReferral.length > 0) {
        return res.json({ success: true, message: "Referral already tracked" });
      }

      // Create new referral
      const newReferral = await db.insert(customerReferrals).values({
        marketerId: marketer[0].id,
        customerEmail,
        customerPhone,
        referralSource: 'link',
        ipAddress,
        userAgent,
        status: 'pending',
      }).returning();

      // Update marketer's total referrals
      await db.update(marketers)
        .set({
          totalReferrals: sql`${marketers.totalReferrals} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(marketers.id, marketer[0].id));

      res.json({ success: true, referral: newReferral[0] });
    } catch (error) {
      console.error("Error tracking referral:", error);
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  // Middleware to automatically check badges after offer actions
  app.use("/api/offers", (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Check if it's a successful offer creation/approval
      if (req.method === 'POST' && res.statusCode === 201 && req.isAuthenticated()) {
        // Async badge check without blocking response
        badgeService.checkAndAwardBadges(req.user.id).catch(console.error);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}