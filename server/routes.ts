import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "./db";
import { paymentService } from "./payment-service";
import { emailService } from "./email";
import { aiAnalysisService } from "./ai-service";
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
  staticPages,
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
} from "@shared/schema";
import {
  eq,
  desc,
  and,
  gte,
  lte,
  like,
  sql,
  count,
  avg,
  sum,
} from "drizzle-orm";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
        {
          name: "Restaurants",
          nameAr: "المطاعم",
          description: "Food and dining establishments",
          descriptionAr: "مؤسسات الطعام والشراب",
          emoji: "🍽️",
          slug: "restaurants",
        },
        {
          name: "Shopping",
          nameAr: "التسوق",
          description: "Retail stores and shopping centers",
          descriptionAr: "متاجر التجزئة ومراكز التسوق",
          emoji: "🛍️",
          slug: "shopping",
        },
        {
          name: "Health & Beauty",
          nameAr: "الصحة والجمال",
          description: "Healthcare and beauty services",
          descriptionAr: "خدمات الرعاية الصحية والجمال",
          emoji: "💄",
          slug: "health-beauty",
        },
        {
          name: "Electronics",
          nameAr: "الإلكترونيات",
          description: "Electronic devices and gadgets",
          descriptionAr: "الأجهزة الإلكترونية والأدوات",
          emoji: "📱",
          slug: "electronics",
        },
        {
          name: "Fashion",
          nameAr: "الأزياء",
          description: "Clothing and fashion accessories",
          descriptionAr: "الملابس وإكسسوارات الأزياء",
          emoji: "👗",
          slug: "fashion",
        },
        {
          name: "Services",
          nameAr: "الخدمات",
          description: "Professional and personal services",
          descriptionAr: "الخدمات المهنية والشخصية",
          emoji: "🔧",
          slug: "services",
        },
        {
          name: "Sports & Fitness",
          nameAr: "الرياضة واللياقة",
          description: "Sports equipment and fitness services",
          descriptionAr: "معدات رياضية وخدمات اللياقة البدنية",
          emoji: "⚽",
          slug: "sports-fitness",
        },
        {
          name: "Travel & Tourism",
          nameAr: "السفر والسياحة",
          description: "Travel agencies and tourism services",
          descriptionAr: "وكالات السفر وخدمات السياحة",
          emoji: "✈️",
          slug: "travel-tourism",
        },
        {
          name: "Education",
          nameAr: "التعليم",
          description: "Educational institutions and services",
          descriptionAr: "المؤسسات والخدمات التعليمية",
          emoji: "📚",
          slug: "education",
        },
        {
          name: "Entertainment",
          nameAr: "الترفيه",
          description: "Entertainment venues and activities",
          descriptionAr: "أماكن الترفيه والأنشطة",
          emoji: "🎭",
          slug: "entertainment",
        },
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
          isActive: true,
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
          isActive: true,
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
          isActive: true,
        },
      ];

      await db.insert(screenLocations).values(locationData);
      console.log("Screen locations seeded successfully");
    } catch (error) {
      console.error("Error seeding screen locations:", error);
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
          isPopular: false,
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
          isPopular: true,
        },
        {
          name: "Enterprise",
          nameAr: "المؤسسة",
          description: "For large businesses with unlimited needs",
          descriptionAr: "للشركات الكبيرة مع احتياجات غير محدودة",
          price: 399,
          currency: "SAR",
          billingPeriod: "monthly",
          offerLimit: 99999,
          isActive: true,
          sortOrder: 3,
          color: "#8B5CF6",
          icon: "🏢",
          isPopular: false,
        },
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

  // Moyasar Payment Integration Routes
  app.post("/api/payments/create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { planId, paymentSource } = req.body;

      if (!planId || !paymentSource) {
        return res
          .status(400)
          .json({ error: "Missing required payment information" });
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
        message: "Payment initiated successfully",
      });
    } catch (error) {
      console.error("Error creating subscription payment:", error);
      res.status(500).json({
        error: "Failed to create payment",
        message: error instanceof Error ? error.message : "Unknown error",
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
          invoice: result.invoice,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment processing failed",
          invoice: result.invoice,
        });
      }
    } catch (error) {
      console.error("Error handling payment callback:", error);
      res.status(500).json({
        error: "Failed to process payment callback",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/merchant/invoices", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const merchantInvoices = await paymentService.getInvoicesByMerchant(
        req.user.id
      );
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
        status: result.success ? "completed" : "failed",
        invoice: result.invoice,
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
      const plans = await db
        .select()
        .from(subscriptionPlans)
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
      const subscription = await db
        .select({
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
            isPopular: subscriptionPlans.isPopular,
          },
        })
        .from(merchantSubscriptions)
        .innerJoin(
          subscriptionPlans,
          eq(merchantSubscriptions.planId, subscriptionPlans.id)
        )
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

  // Screen locations routes
  app.get("/api/screen-locations", async (req, res) => {
    try {
      const locations = await db
        .select()
        .from(screenLocations)
        .where(eq(screenLocations.isActive, true));
      res.json(locations);
    } catch (error) {
      console.error("Error fetching screen locations:", error);
      res.status(500).json({ error: "Failed to fetch screen locations" });
    }
  });

  // Contact messages routes
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message, type } = req.body;

      if (!name || !email || !message) {
        return res
          .status(400)
          .json({ error: "Name, email, and message are required" });
      }

      const newMessage = await db
        .insert(contactForms)
        .values({
          name,
          email,
          phone,
          subject,
          message,
          type: type || "general",
          status: "new",
        })
        .returning();

      res.json({ success: true, message: "Contact message sent successfully" });
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ error: "Failed to send contact message" });
    }
  });

  // Admin Analytics API Routes
  app.get("/api/admin/analytics/revenue", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      // Get subscription revenue from paid invoices
      const subscriptionRevenue = await db
        .select({
          month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM-DD')`,
          amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)::int`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.status, "paid"),
            eq(invoices.invoiceType, "subscription")
          )
        )
        .groupBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`);

      // Get booking revenue from approved bookings via invoices
      const bookingRevenue = await db
        .select({
          month: sql<string>`TO_CHAR(${invoices.createdAt}, 'YYYY-MM-DD')`,
          amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)::int`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(invoices)
        .where(
          and(eq(invoices.status, "paid"), eq(invoices.invoiceType, "booking"))
        )
        .groupBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`);

      // Calculate totals
      const totalSubscriptionRevenue = subscriptionRevenue.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const totalBookingRevenue = bookingRevenue.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      res.json({
        totalRevenue: totalSubscriptionRevenue + totalBookingRevenue,
        subscriptionRevenue: {
          total: totalSubscriptionRevenue,
          monthly: subscriptionRevenue,
        },
        bookingRevenue: {
          total: totalBookingRevenue,
          monthly: bookingRevenue,
        },
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/admin/analytics/subscriptions", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      // Get subscription distribution by plan from database
      const subscriptionDistribution = await db
        .select({
          planName: subscriptionPlans.name,
          planNameAr: subscriptionPlans.nameAr,
          price: subscriptionPlans.price,
          color: subscriptionPlans.color,
          activeCount: sql<number>`COUNT(CASE WHEN ${merchantSubscriptions.status} = 'active' THEN 1 END)::int`,
          totalCount: sql<number>`COUNT(*)::int`,
        })
        .from(subscriptionPlans)
        .leftJoin(
          merchantSubscriptions,
          eq(merchantSubscriptions.planId, subscriptionPlans.id)
        )
        .groupBy(
          subscriptionPlans.id,
          subscriptionPlans.name,
          subscriptionPlans.nameAr,
          subscriptionPlans.price,
          subscriptionPlans.color
        )
        .orderBy(subscriptionPlans.sortOrder);

      // Get recent subscription activities from database
      const recentSubscriptions = await db
        .select({
          id: merchantSubscriptions.id,
          startDate: sql<string>`${merchantSubscriptions.startDate}::text`,
          status: merchantSubscriptions.status,
          merchantName: sql<string>`COALESCE(${users.businessName}, ${users.username})`,
          planName: subscriptionPlans.name,
          planPrice: subscriptionPlans.price,
        })
        .from(merchantSubscriptions)
        .innerJoin(users, eq(merchantSubscriptions.merchantId, users.id))
        .innerJoin(
          subscriptionPlans,
          eq(merchantSubscriptions.planId, subscriptionPlans.id)
        )
        .orderBy(desc(merchantSubscriptions.createdAt))
        .limit(10);

      const totalActiveSubscriptions = subscriptionDistribution.reduce(
        (sum, item) => sum + item.activeCount,
        0
      );

      res.json({
        distribution: subscriptionDistribution,
        recentActivity: recentSubscriptions,
        totalActiveSubscriptions,
      });
    } catch (error) {
      console.error("Error fetching subscription analytics:", error);
      res.status(500).json({ error: "Failed to fetch subscription analytics" });
    }
  });

  app.get("/api/admin/analytics/bookings", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      // Get most booked screens from database
      const mostBookedScreens = await db
        .select({
          screenId: screenBookings.locationId,
          screenName: screenLocations.name,
          screenNameAr: screenLocations.nameAr,
          city: screenLocations.city,
          bookingCount: sql<number>`COUNT(*)::int`,
          totalRevenue: sql<number>`COALESCE(SUM(${screenBookings.totalPrice}), 0)::int`,
          avgRating: sql<number>`COALESCE(AVG(${screenReviews.overallRating}), 0)::float`,
        })
        .from(screenBookings)
        .innerJoin(
          screenLocations,
          eq(screenBookings.locationId, screenLocations.id)
        )
        .leftJoin(
          screenReviews,
          eq(screenReviews.locationId, screenLocations.id)
        )
        .where(eq(screenBookings.status, "approved"))
        .groupBy(
          screenBookings.locationId,
          screenLocations.name,
          screenLocations.nameAr,
          screenLocations.city
        )
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Get booking distribution by city from database
      const cityDistribution = await db
        .select({
          city: screenLocations.city,
          cityAr: screenLocations.cityAr,
          bookingCount: sql<number>`COUNT(*)::int`,
          revenue: sql<number>`COALESCE(SUM(${screenBookings.totalPrice}), 0)::int`,
        })
        .from(screenBookings)
        .innerJoin(
          screenLocations,
          eq(screenBookings.locationId, screenLocations.id)
        )
        .where(eq(screenBookings.status, "approved"))
        .groupBy(screenLocations.city, screenLocations.cityAr)
        .orderBy(desc(sql`COUNT(*)`));

      // Get average booking prices per screen from database
      const avgPrices = await db
        .select({
          screenName: screenLocations.name,
          dailyPrice: sql<number>`${screenLocations.dailyPrice}::int`,
          avgBookingAmount: sql<number>`COALESCE(AVG(${screenBookings.totalPrice}), 0)::int`,
          bookingCount: sql<number>`COUNT(*)::int`,
        })
        .from(screenBookings)
        .innerJoin(
          screenLocations,
          eq(screenBookings.locationId, screenLocations.id)
        )
        .where(eq(screenBookings.status, "approved"))
        .groupBy(
          screenLocations.id,
          screenLocations.name,
          screenLocations.dailyPrice
        )
        .orderBy(desc(sql`AVG(${screenBookings.totalPrice})`))
        .limit(10);

      // Get booking trends over time from database
      const bookingTrends = await db
        .select({
          month: sql<string>`TO_CHAR(${screenBookings.createdAt}, 'YYYY-MM-DD')`,
          bookingCount: sql<number>`COUNT(*)::int`,
          revenue: sql<number>`COALESCE(SUM(${screenBookings.totalPrice}), 0)::int`,
        })
        .from(screenBookings)
        .where(eq(screenBookings.status, "approved"))
        .groupBy(sql`DATE_TRUNC('month', ${screenBookings.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${screenBookings.createdAt})`);

      const totalBookings = mostBookedScreens.reduce(
        (sum, item) => sum + item.bookingCount,
        0
      );

      res.json({
        mostBookedScreens,
        cityDistribution,
        avgPrices,
        bookingTrends,
        totalBookings,
      });
    } catch (error) {
      console.error("Error fetching booking analytics:", error);
      res.status(500).json({ error: "Failed to fetch booking analytics" });
    }
  });

  // Admin Pricing Management Routes
  app.get("/api/admin/subscription-plans", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const plans = await db
        .select()
        .from(subscriptionPlans)
        .orderBy(subscriptionPlans.sortOrder);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/admin/subscription-plans", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const {
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
      } = req.body;

      const [newPlan] = await db
        .insert(subscriptionPlans)
        .values({
          name,
          nameAr,
          description,
          descriptionAr,
          price,
          currency: currency || "SAR",
          billingPeriod: billingPeriod || "monthly",
          offerLimit: offerLimit || 3,
          isActive: isActive !== undefined ? isActive : true,
          isPopular: isPopular || false,
          sortOrder: sortOrder || 0,
          color: color || "#3B82F6",
        })
        .returning();

      res.status(201).json(newPlan);
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({ error: "Failed to create subscription plan" });
    }
  });

  app.put("/api/admin/subscription-plans/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const planId = parseInt(req.params.id);
      const {
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
      } = req.body;

      const [updatedPlan] = await db
        .update(subscriptionPlans)
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
          updatedAt: new Date(),
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const planId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedPlan] = await db
        .update(subscriptionPlans)
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const planId = parseInt(req.params.id);

      // Check if plan has active subscriptions
      const activeSubscriptions = await db
        .select()
        .from(merchantSubscriptions)
        .where(
          and(
            eq(merchantSubscriptions.planId, planId),
            eq(merchantSubscriptions.status, "active")
          )
        );

      if (activeSubscriptions.length > 0) {
        return res.status(400).json({
          error: "Cannot delete plan with active subscriptions",
        });
      }

      await db
        .delete(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({ error: "Failed to delete subscription plan" });
    }
  });

  // Admin Static Pages Management Routes
  app.get("/api/admin/static-pages", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const pages = await db
        .select()
        .from(staticPages)
        .orderBy(staticPages.sortOrder);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching static pages:", error);
      res.status(500).json({ error: "Failed to fetch static pages" });
    }
  });

  app.post("/api/admin/static-pages", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const {
        title,
        titleAr,
        slug,
        content,
        contentAr,
        metaTitle,
        metaTitleAr,
        metaDescription,
        metaDescriptionAr,
        isPublished,
        showInFooter,
        showInHeader,
        sortOrder,
      } = req.body;

      // Check if slug already exists
      const existingPage = await db
        .select()
        .from(staticPages)
        .where(eq(staticPages.slug, slug));
      if (existingPage.length > 0) {
        return res
          .status(400)
          .json({ error: "A page with this URL slug already exists" });
      }

      const [newPage] = await db
        .insert(staticPages)
        .values({
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
          publishedAt: isPublished ? new Date() : null,
        })
        .returning();

      res.status(201).json(newPage);
    } catch (error) {
      console.error("Error creating static page:", error);
      res.status(500).json({ error: "Failed to create static page" });
    }
  });

  app.put("/api/admin/static-pages/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const pageId = parseInt(req.params.id);
      const {
        title,
        titleAr,
        slug,
        content,
        contentAr,
        metaTitle,
        metaTitleAr,
        metaDescription,
        metaDescriptionAr,
        isPublished,
        showInFooter,
        showInHeader,
        sortOrder,
      } = req.body;

      // Check if slug already exists (excluding current page)
      const existingPage = await db
        .select()
        .from(staticPages)
        .where(
          and(eq(staticPages.slug, slug), not(eq(staticPages.id, pageId)))
        );
      if (existingPage.length > 0) {
        return res
          .status(400)
          .json({ error: "A page with this URL slug already exists" });
      }

      const [updatedPage] = await db
        .update(staticPages)
        .set({
          title,
          titleAr,
          slug,
          content,
          contentAr,
          metaTitle,
          metaTitleAr,
          metaDescription,
          metaDescriptionAr,
          isPublished,
          showInFooter,
          showInHeader,
          sortOrder,
          updatedBy: req.user.id,
          updatedAt: new Date(),
          publishedAt: isPublished ? new Date() : null,
        })
        .where(eq(staticPages.id, pageId))
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const pageId = parseInt(req.params.id);
      const { isPublished } = req.body;

      const [updatedPage] = await db
        .update(staticPages)
        .set({
          isPublished,
          updatedBy: req.user.id,
          updatedAt: new Date(),
          publishedAt: isPublished ? new Date() : null,
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchants = await db
        .select({
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
          lastLoginAt: users.lastLoginAt,
        })
        .from(users)
        .where(eq(users.role, "business"));

      // Get stats for each merchant
      const merchantsWithStats = await Promise.all(
        merchants.map(async (merchant) => {
          const [offerCount] = await db
            .select({ count: count() })
            .from(offers)
            .where(eq(offers.businessId, merchant.id));

          const [bookingCount] = await db
            .select({ count: count() })
            .from(screenBookings)
            .where(eq(screenBookings.merchantId, merchant.id));

          const [totalRevenue] = await db
            .select({
              sum: sum(invoices.amount),
            })
            .from(invoices)
            .where(eq(invoices.merchantId, merchant.id));

          const [avgRating] = await db
            .select({
              avg: avg(screenReviews.rating),
            })
            .from(screenReviews)
            .leftJoin(
              screenBookings,
              eq(screenReviews.bookingId, screenBookings.id)
            )
            .where(eq(screenBookings.merchantId, merchant.id));

          return {
            ...merchant,
            stats: {
              totalOffers: offerCount.count || 0,
              totalBookings: bookingCount.count || 0,
              totalRevenue: Number(totalRevenue.sum) || 0,
              averageRating: Number(avgRating.avg) || 0,
            },
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchantId = parseInt(req.params.id);
      const { isActive } = req.body;

      const [updatedMerchant] = await db
        .update(users)
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchantId = parseInt(req.params.id);

      // Check if merchant has active bookings or offers
      const activeOffers = await db
        .select()
        .from(offers)
        .where(eq(offers.businessId, merchantId));
      const activeBookings = await db
        .select()
        .from(screenBookings)
        .where(
          and(
            eq(screenBookings.merchantId, merchantId),
            eq(screenBookings.status, "active")
          )
        );

      if (activeOffers.length > 0 || activeBookings.length > 0) {
        return res.status(400).json({
          error: "Cannot delete merchant with active offers or bookings",
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
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(401).json({ error: "Admin access required" });
    }

    try {
      const merchantId = parseInt(req.params.id);
      const { subject, message } = req.body;

      const [merchant] = await db
        .select()
        .from(users)
        .where(eq(users.id, merchantId));
      if (!merchant) {
        return res.status(404).json({ error: "Merchant not found" });
      }

      // Send email using email service
      await emailService.sendEmail({
        to: merchant.email,
        subject,
        text: message,
        html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
