import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric, decimal, date, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  businessName: text("business_name"),
  businessDescription: text("business_description"),
  businessCategory: text("business_category"),
  businessCity: text("business_city"),
  businessPhone: text("business_phone"),
  businessWebsite: text("business_website"),
  businessWhatsapp: text("business_whatsapp"),
  businessInstagram: text("business_instagram"),
  businessFacebook: text("business_facebook"),
  businessSnapchat: text("business_snapchat"),
  businessX: text("business_x"),
  businessTiktok: text("business_tiktok"),
  businessLogo: text("business_logo"),
  role: text("role").notNull().default("business"), // business, admin
  isApproved: boolean("is_approved").default(false),
  isVerified: boolean("is_verified").default(false),
  subscriptionPlan: text("subscription_plan").default("free"), // free, basic, premium
  subscriptionExpiry: timestamp("subscription_expiry"),
  autoRenew: boolean("auto_renew").default(false),
  offerLimit: integer("offer_limit").default(3), // based on plan
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  emoji: text("emoji").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  phone: text("phone"),
  mapsLink: text("maps_link"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  imageUrl: text("image_url"),
  discountPercentage: integer("discount_percentage"),
  discountCode: text("discount_code"),
  originalPrice: text("original_price"),
  discountedPrice: text("discounted_price"),
  link: text("link"), // WhatsApp, website, etc.
  linkType: text("link_type").default("whatsapp"), // whatsapp, website, phone
  city: text("city"),
  targetBranches: text("target_branches").array(), // Array of branch IDs
  targetCities: text("target_cities").array(), // Array of city names
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isPriority: boolean("is_priority").default(false),
  isApproved: boolean("is_approved").default(true),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customerFavorites = pgTable("customer_favorites", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  city: text("city").notNull(),
  offerId: integer("offer_id").references(() => offers.id).notNull(),
  isVerified: boolean("is_verified").default(false), // For future OTP verification
  verificationToken: text("verification_token"), // For future OTP system
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  offers: many(offers),
  branches: many(branches),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  offers: many(offers),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  business: one(users, {
    fields: [branches.businessId],
    references: [users.id],
  }),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  business: one(users, {
    fields: [offers.businessId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [offers.categoryId],
    references: [categories.id],
  }),
  favorites: many(customerFavorites),
}));

export const customerFavoritesRelations = relations(customerFavorites, ({ one }) => ({
  offer: one(offers, {
    fields: [customerFavorites.offerId],
    references: [offers.id],
  }),
}));

export const offerAnalytics = pgTable("offer_analytics", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").references(() => offers.id).notNull(),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  date: timestamp("date").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // subscription, offer, system
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // manager, marketing, viewer
  isActive: boolean("is_active").default(true),
  inviteToken: text("invite_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("open"), // open, in_progress, closed
  priority: text("priority").default("medium"), // low, medium, high
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score").notNull(),
  titleScore: integer("title_score").notNull(),
  descriptionScore: integer("description_score").notNull(),
  categoryMatch: integer("category_match").notNull(),
  improvementSuggestions: text("improvement_suggestions").notNull(),
  titleSuggestions: text("title_suggestions"),
  descriptionSuggestions: text("description_suggestions"),
  categorySuggestions: text("category_suggestions"),
  marketingTips: text("marketing_tips"),
  status: text("status").notNull().default("completed"), // completed, failed, pending
  analyzedAt: timestamp("analyzed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  jobTitle: text("job_title").notNull(),
  reviewText: text("review_text").notNull(),
  rating: integer("rating").notNull().default(5), // 1-5 stars
  clientAvatar: text("client_avatar"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").default(true),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const offerAnalyticsRelations = relations(offerAnalytics, ({ one }) => ({
  offer: one(offers, {
    fields: [offerAnalytics.offerId],
    references: [offers.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  business: one(users, {
    fields: [teamMembers.businessId],
    references: [users.id],
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  offer: one(offers, {
    fields: [aiAnalysis.offerId],
    references: [offers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isApproved: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  views: true,
  isApproved: true,
});

export const updateOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  views: true,
}).partial();

export const insertCustomerFavoriteSchema = createInsertSchema(customerFavorites).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  verificationToken: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  businessName: z.string().min(1, "اسم المتجر مطلوب"),
  businessCategory: z.string().min(1, "فئة المتجر مطلوبة"),
  businessCity: z.string().min(1, "المدينة مطلوبة"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  businessInstagram: z.string().optional(),
  businessFacebook: z.string().optional(),
  businessSnapchat: z.string().optional(),
  businessX: z.string().optional(),
  businessTiktok: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمة المرور غير متطابقة",
  path: ["confirmPassword"],
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertCustomerFavorite = z.infer<typeof insertCustomerFavoriteSchema>;
export type CustomerFavorite = typeof customerFavorites.$inferSelect;
export type OfferWithRelations = Offer & {
  business: User;
  category: Category;
};
export type UserWithBranches = User & {
  branches: Branch[];
};
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// New types for merchant dashboard
export const insertOfferAnalyticsSchema = createInsertSchema(offerAnalytics).omit({
  id: true,
  createdAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({
  id: true,
  createdAt: true,
  analyzedAt: true,
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export type OfferAnalytics = typeof offerAnalytics.$inferSelect;
export type InsertOfferAnalytics = z.infer<typeof insertOfferAnalyticsSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// Enterprise Subscription Plans and Features Management
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: integer("price").notNull(), // Price in cents/halalas
  currency: text("currency").notNull().default("SAR"),
  billingPeriod: text("billing_period").notNull().default("monthly"), // monthly, yearly
  offerLimit: integer("offer_limit").notNull().default(3),
  screenLimit: integer("screen_limit").notNull().default(5),
  adDuration: integer("ad_duration").notNull().default(30), // seconds
  selectedFeatures: text("selected_features").default("{}"), // JSON string for feature toggles
  featureLimits: text("feature_limits").default("{}"), // JSON string for custom limits
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  color: text("color").default("#3B82F6"), // Plan color for UI
  icon: text("icon").default("fas fa-box"), // Icon class
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull().default("general"), // general, analytics, automation, support
  icon: text("icon").default("fas fa-star"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const planFeatures = pgTable("plan_features", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  featureId: integer("feature_id").references(() => features.id).notNull(),
  isIncluded: boolean("is_included").notNull().default(true),
  limit: integer("limit"), // For features with usage limits
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for subscription system
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  planFeatures: many(planFeatures),
}));

export const featuresRelations = relations(features, ({ many }) => ({
  planFeatures: many(planFeatures),
}));

export const planFeaturesRelations = relations(planFeatures, ({ one }) => ({
  plan: one(subscriptionPlans, {
    fields: [planFeatures.planId],
    references: [subscriptionPlans.id],
  }),
  feature: one(features, {
    fields: [planFeatures.featureId],
    references: [features.id],
  }),
}));

// Schema types
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
  createdAt: true,
});

export const insertPlanFeatureSchema = createInsertSchema(planFeatures).omit({
  id: true,
  createdAt: true,
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type PlanFeature = typeof planFeatures.$inferSelect;
export type InsertPlanFeature = z.infer<typeof insertPlanFeatureSchema>;

export type SubscriptionPlanWithFeatures = SubscriptionPlan & {
  planFeatures: (PlanFeature & { feature: Feature })[];
};

// Gamified Business Badges System
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description").notNull(),
  descriptionAr: text("description_ar").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  color: text("color").notNull(), // tailwind color class
  backgroundColor: text("background_color").notNull(),
  criteria: json("criteria").notNull(), // JSON object defining requirements
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
  automaticallyAwarded: boolean("automatically_awarded").default(true),
  awardedBy: integer("awarded_by").references(() => users.id), // admin who manually awarded
  progress: json("progress"), // JSON object tracking progress toward badge
});

// Badge Relations
export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
  awardedByUser: one(users, {
    fields: [userBadges.awardedBy],
    references: [users.id],
  }),
}));

// Badge Schema Types
export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  awardedAt: true,
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type BadgeWithUsers = Badge & {
  userBadges: (UserBadge & { user: User })[];
};

export type UserWithBadges = User & {
  userBadges: (UserBadge & { badge: Badge })[];
};

// Leads Schema
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  offerId: integer("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  merchantId: integer("merchant_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  notes: text("notes"),
});

// New Subscription Plans Schema (replacing old one)
export const newSubscriptionPlans = pgTable("subscription_plans_v2", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("SAR"),
  duration: integer("duration").notNull(), // in days
  features: json("features").notNull(),
  featuresAr: json("features_ar").notNull(),
  maxOffers: integer("max_offers").notNull().default(10),
  priorityOffers: boolean("priority_offers").notNull().default(false),
  analytics: boolean("analytics").notNull().default(false),
  badges: boolean("badges").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Subscriptions Schema
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => newSubscriptionPlans.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  autoRenew: boolean("auto_renew").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const leadsRelations = relations(leads, ({ one }) => ({
  offer: one(offers, {
    fields: [leads.offerId],
    references: [offers.id],
  }),
  merchant: one(users, {
    fields: [leads.merchantId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
}));

export const newSubscriptionPlansRelations = relations(newSubscriptionPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(newSubscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [newSubscriptionPlans.id],
  }),
}));

// Update existing user relations to include subscriptions and leads
export const updatedUsersRelations = relations(users, ({ many }) => ({
  offers: many(offers),
  branches: many(branches),
  userBadges: many(userBadges),
  subscriptions: many(userSubscriptions),
  leads: many(leads),
}));

// Schema Types
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertLeadsSubscriptionPlanSchema = createInsertSchema(newSubscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadsUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type LeadsSubscriptionPlan = typeof newSubscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type LeadWithRelations = Lead & {
  offer: OfferWithRelations;
  merchant: User;
  user?: User;
};

export type LeadsSubscriptionPlanWithStats = LeadsSubscriptionPlan & {
  subscriberCount: number;
};

// Screen Ads Tables
export const screenLocations = pgTable("screen_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  address: text("address").notNull(),
  addressAr: text("address_ar").notNull(),
  city: text("city").notNull(),
  cityAr: text("city_ar").notNull(),
  neighborhood: text("neighborhood"),
  neighborhoodAr: text("neighborhood_ar"),  
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  googleMapsLink: text("google_maps_link"),
  workingHours: text("working_hours").default("9:00 AM - 12:00 AM"),
  workingHoursAr: text("working_hours_ar").default("9:00 ص - 12:00 ص"),
  numberOfScreens: integer("number_of_screens").notNull().default(1),
  screenType: text("screen_type").notNull().default("LED"), // TV, LED, Tablet
  screenTypeAr: text("screen_type_ar").notNull().default("شاشة LED"),
  dailyPrice: numeric("daily_price", { precision: 10, scale: 2 }).notNull(),
  specialNotes: text("special_notes"),
  specialNotesAr: text("special_notes_ar"),
  locationPhoto: text("location_photo"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const screenAds = pgTable("screen_ads", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").notNull().references(() => users.id),
  locationId: integer("location_id").notNull().references(() => screenLocations.id),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // image, video
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  duration: integer("duration").notNull(), // days
  totalCost: numeric("total_cost", { precision: 8, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // pending, approved, rejected, active, completed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const screenLocationsRelations = relations(screenLocations, ({ many }) => ({
  screenAds: many(screenAds),
}));

export const screenAdsRelations = relations(screenAds, ({ one }) => ({
  merchant: one(users, { fields: [screenAds.merchantId], references: [users.id] }),
  location: one(screenLocations, { fields: [screenAds.locationId], references: [screenLocations.id] }),
}));

// Schemas
export const insertScreenLocationSchema = createInsertSchema(screenLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScreenAdSchema = createInsertSchema(screenAds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type ScreenLocation = typeof screenLocations.$inferSelect;
export type InsertScreenLocation = z.infer<typeof insertScreenLocationSchema>;
export type ScreenAd = typeof screenAds.$inferSelect;
export type InsertScreenAd = z.infer<typeof insertScreenAdSchema>;



export type ScreenAdWithRelations = ScreenAd & {
  merchant: User;
  location: ScreenLocation;
};

// Enhanced pricing models per screen
export const screenPricingOptions = pgTable("screen_pricing_options", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => screenLocations.id, { onDelete: "cascade" }).notNull(),
  durationType: text("duration_type").notNull(), // 'hour', 'day', 'week'
  durationTypeAr: text("duration_type_ar").notNull(), // 'ساعة', 'يوم', 'أسبوع'
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  minimumDuration: integer("minimum_duration").notNull().default(1),
  maximumDuration: integer("maximum_duration"),
  notes: text("notes"),
  notesAr: text("notes_ar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced booking system
export const screenBookings = pgTable("screen_bookings", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  locationId: integer("location_id").references(() => screenLocations.id, { onDelete: "cascade" }).notNull(),
  pricingOptionId: integer("pricing_option_id").references(() => screenPricingOptions.id, { onDelete: "cascade" }).notNull(),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  duration: integer("duration").notNull(), // in units based on pricing option
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'cancelled'
  statusAr: text("status_ar").notNull().default("معلق"), // 'معلق', 'مقبول', 'مرفوض', 'ملغي'
  mediaUrl: text("media_url"),
  mediaType: text("media_type"), // 'image' or 'video'
  requestNotes: text("request_notes"),
  requestNotesAr: text("request_notes_ar"),
  adminNotes: text("admin_notes"),
  adminNotesAr: text("admin_notes_ar"),
  rejectionReason: text("rejection_reason"),
  rejectionReasonAr: text("rejection_reason_ar"),
  invoiceGenerated: boolean("invoice_generated").notNull().default(false),
  invoiceNumber: text("invoice_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
});

// Merchant profiles
export const merchantProfiles = pgTable("merchant_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  companyName: text("company_name"),
  companyNameAr: text("company_name_ar"),
  contactPerson: text("contact_person"),
  contactPersonAr: text("contact_person_ar"),
  companyLogo: text("company_logo"),
  website: text("website"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  taxNumber: text("tax_number"),
  commercialRegister: text("commercial_register"),
  industry: text("industry"),
  industryAr: text("industry_ar"),
  establishedYear: integer("established_year"),
  employeeCount: text("employee_count"), // '1-10', '11-50', '51-200', '200+'
  employeeCountAr: text("employee_count_ar"),
  address: text("address"),
  addressAr: text("address_ar"),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationDocuments: text("verification_documents").array(),
  totalBookings: integer("total_bookings").notNull().default(0),
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice system - supports both screen bookings and subscription payments
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  bookingId: integer("booking_id").references(() => screenBookings.id, { onDelete: "cascade" }),
  planId: integer("plan_id").references(() => subscriptionPlans.id),
  merchantId: integer("merchant_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  invoiceType: text("invoice_type").notNull().default("booking"), // 'booking' or 'subscription'
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("SAR"),
  status: text("status").notNull().default("unpaid"), // 'unpaid', 'paid', 'overdue', 'cancelled'
  statusAr: text("status_ar").notNull().default("غير مدفوع"),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"),
  // Moyasar payment integration fields
  moyasarPaymentId: text("moyasar_payment_id").unique(),
  moyasarTransactionId: text("moyasar_transaction_id"),
  moyasarStatus: text("moyasar_status"), // initiated, paid, failed, authorized, captured
  moyasarMetadata: text("moyasar_metadata"), // JSON string for additional payment data
  failureReason: text("failure_reason"),
  refundedAt: timestamp("refunded_at"),
  notes: text("notes"),
  notesAr: text("notes_ar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Merchant Subscriptions
export const merchantSubscriptions = pgTable("merchant_subscriptions", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: "cascade" }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'expired', 'cancelled'
  autoRenew: boolean("auto_renew").notNull().default(true),
  paymentMethod: text("payment_method"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for new tables
export const screenPricingOptionsRelations = relations(screenPricingOptions, ({ one }) => ({
  location: one(screenLocations, {
    fields: [screenPricingOptions.locationId],
    references: [screenLocations.id],
  }),
}));

export const screenBookingsRelations = relations(screenBookings, ({ one }) => ({
  merchant: one(users, {
    fields: [screenBookings.merchantId],
    references: [users.id],
  }),
  location: one(screenLocations, {
    fields: [screenBookings.locationId],
    references: [screenLocations.id],
  }),
  pricingOption: one(screenPricingOptions, {
    fields: [screenBookings.pricingOptionId],
    references: [screenPricingOptions.id],
  }),
}));

export const merchantProfilesRelations = relations(merchantProfiles, ({ one }) => ({
  user: one(users, {
    fields: [merchantProfiles.userId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(screenBookings, {
    fields: [invoices.bookingId],
    references: [screenBookings.id],
  }),
  merchant: one(users, {
    fields: [invoices.merchantId],
    references: [users.id],
  }),
}));



// Create insert schemas
export const insertScreenPricingOptionSchema = createInsertSchema(screenPricingOptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScreenBookingSchema = createInsertSchema(screenBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
  rejectedAt: true,
});

export const insertMerchantProfileSchema = createInsertSchema(merchantProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types for new tables
export type ScreenPricingOption = typeof screenPricingOptions.$inferSelect;
export type InsertScreenPricingOption = z.infer<typeof insertScreenPricingOptionSchema>;
export type ScreenBooking = typeof screenBookings.$inferSelect;
export type InsertScreenBooking = z.infer<typeof insertScreenBookingSchema>;
export type MerchantProfile = typeof merchantProfiles.$inferSelect;
export type InsertMerchantProfile = z.infer<typeof insertMerchantProfileSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Enhanced relation types
export type ScreenBookingWithRelations = ScreenBooking & {
  merchant: User;
  location: ScreenLocation;
  pricingOption: ScreenPricingOption;
};

export type InvoiceWithRelations = Invoice & {
  booking: ScreenBookingWithRelations;
  merchant: User;
};

export type MerchantProfileWithRelations = MerchantProfile & {
  user: User;
};

export type ScreenLocationWithPricing = ScreenLocation & {
  pricingOptions: ScreenPricingOption[];
};

// Campaign Media Management
export const campaignMedia = pgTable("campaign_media", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => screenBookings.id).notNull(),
  merchantId: integer("merchant_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileType: text("file_type").notNull(), // image, video
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadStatus: text("upload_status").default("pending").notNull(), // pending, approved, rejected
  uploadStatusAr: text("upload_status_ar").default("قيد المراجعة").notNull(),
  adminNotes: text("admin_notes"),
  adminNotesAr: text("admin_notes_ar"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Internal Admin Notes & Logs
export const bookingLogs = pgTable("booking_logs", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => screenBookings.id).notNull(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // status_change, note_added, media_reviewed, etc.
  actionAr: text("action_ar").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  notes: text("notes"),
  notesAr: text("notes_ar"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Merchant Notifications
export const merchantNotifications = pgTable("merchant_notifications", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").references(() => users.id).notNull(),
  bookingId: integer("booking_id").references(() => screenBookings.id),
  type: text("type").notNull(), // booking_approved, booking_rejected, invoice_issued, campaign_reminder, etc.
  typeAr: text("type_ar").notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  message: text("message").notNull(),
  messageAr: text("message_ar").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  emailSent: boolean("email_sent").default(false).notNull(),
  emailSentAt: timestamp("email_sent_at"),
  priority: text("priority").default("normal").notNull(), // low, normal, high, urgent
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at")
});

// Insert schemas for new tables
export const insertCampaignMediaSchema = createInsertSchema(campaignMedia).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  uploadedAt: true,
  reviewedAt: true,
});

export const insertBookingLogSchema = createInsertSchema(bookingLogs).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export const insertMerchantNotificationSchema = createInsertSchema(merchantNotifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
  emailSentAt: true,
});

// Export types for new tables
export type CampaignMedia = typeof campaignMedia.$inferSelect;
export type InsertCampaignMedia = z.infer<typeof insertCampaignMediaSchema>;
export type BookingLog = typeof bookingLogs.$inferSelect;
export type InsertBookingLog = z.infer<typeof insertBookingLogSchema>;
export type MerchantNotification = typeof merchantNotifications.$inferSelect;
export type InsertMerchantNotification = z.infer<typeof insertMerchantNotificationSchema>;

// Contact Forms (Phase 5)
export const contactForms = pgTable("contact_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").default('new').notNull(), // 'new', 'replied', 'resolved'
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow(),
  repliedAt: timestamp("replied_at"),
});

// Merchant Registration Requests (Phase 5)
export const merchantRegistrations = pgTable("merchant_registrations", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  commercialRegNumber: text("commercial_reg_number").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  logoUrl: text("logo_url"),
  status: text("status").default('pending').notNull(), // 'pending', 'approved', 'rejected'
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
});

// Insert schemas for Phase 5 tables
export const insertContactFormSchema = createInsertSchema(contactForms).omit({
  id: true,
  createdAt: true,
  repliedAt: true,
});

export const insertMerchantRegistrationSchema = createInsertSchema(merchantRegistrations).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  rejectedAt: true,
});

// Export types for Phase 5 tables
export type ContactForm = typeof contactForms.$inferSelect;
export type InsertContactForm = z.infer<typeof insertContactFormSchema>;
export type MerchantRegistration = typeof merchantRegistrations.$inferSelect;
export type InsertMerchantRegistration = z.infer<typeof insertMerchantRegistrationSchema>;

// Enhanced relation types for Phase 4
export type CampaignMediaWithRelations = CampaignMedia & {
  booking: ScreenBookingWithRelations;
  merchant: User;
  reviewedByUser?: User;
};

export type BookingLogWithRelations = BookingLog & {
  booking: ScreenBookingWithRelations;
  admin: User;
};

export type MerchantNotificationWithRelations = MerchantNotification & {
  merchant: User;
  booking?: ScreenBookingWithRelations;
};

// Admin Roles and Permissions
export const adminRoles = pgTable("admin_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  permissions: text("permissions").array().notNull(), // Array of permission strings
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const adminRoleAssignments = pgTable("admin_role_assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roleId: integer("role_id").references(() => adminRoles.id, { onDelete: "cascade" }).notNull(),
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true)
});

// Platform Settings
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  category: text("category").notNull().default("general"), // general, appearance, social, analytics
  type: text("type").notNull().default("text"), // text, json, boolean, number, file
  label: text("label").notNull(),
  labelAr: text("label_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  isPublic: boolean("is_public").notNull().default(false), // Can be accessed in frontend
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id)
});

// CMS Homepage Content Sections
export const cmsHomepageSections = pgTable("cms_homepage_sections", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").notNull().unique(), // hero, benefits, how_it_works, testimonials, etc.
  title: text("title"),
  titleAr: text("title_ar"),
  subtitle: text("subtitle"),
  subtitleAr: text("subtitle_ar"),
  content: text("content"),
  contentAr: text("content_ar"),
  buttonText: text("button_text"),
  buttonTextAr: text("button_text_ar"),
  buttonUrl: text("button_url"),
  backgroundImage: text("background_image"),
  backgroundColor: text("background_color"),
  textColor: text("text_color"),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  metadata: json("metadata"), // For additional flexible data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id)
});

// CMS Site Branding & Logo Management
export const cmsSiteBranding = pgTable("cms_site_branding", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("Braaq"),
  siteNameAr: text("site_name_ar").notNull().default("براق"),
  siteLogo: text("site_logo"), // Main logo URL
  siteLogoWhite: text("site_logo_white"), // White version for dark backgrounds
  siteFavicon: text("site_favicon"),
  siteTagline: text("site_tagline"),
  siteTaglineAr: text("site_tagline_ar"),
  primaryColor: text("primary_color").default("#16a34a"), // Saudi green
  secondaryColor: text("secondary_color").default("#15803d"),
  accentColor: text("accent_color").default("#dcfce7"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id)
});

// CMS Benefits/Features Content
export const cmsBenefits = pgTable("cms_benefits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  icon: text("icon"), // Lucide icon name or image URL
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id)
});

// CMS How It Works Steps
export const cmsHowItWorksSteps = pgTable("cms_how_it_works_steps", {
  id: serial("id").primaryKey(),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  icon: text("icon"), // Lucide icon name or image URL
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id)
});

// Insert schemas for CMS tables
export const insertCmsHomepageSectionSchema = createInsertSchema(cmsHomepageSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertCmsSiteBrandingSchema = createInsertSchema(cmsSiteBranding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertCmsBenefitSchema = createInsertSchema(cmsBenefits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertCmsHowItWorksStepSchema = createInsertSchema(cmsHowItWorksSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});

export const insertAdminRoleSchema = createInsertSchema(adminRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({
  id: true,
  updatedAt: true,
  updatedBy: true,
});

// Relations
// Removed duplicate staticPages relations

export const adminRolesRelations = relations(adminRoles, ({ many }) => ({
  assignments: many(adminRoleAssignments),
}));

export const adminRoleAssignmentsRelations = relations(adminRoleAssignments, ({ one }) => ({
  user: one(users, {
    fields: [adminRoleAssignments.userId],
    references: [users.id],
  }),
  role: one(adminRoles, {
    fields: [adminRoleAssignments.roleId],
    references: [adminRoles.id],
  }),
  assignedByUser: one(users, {
    fields: [adminRoleAssignments.assignedBy],
    references: [users.id],
  }),
}));

export const platformSettingsRelations = relations(platformSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [platformSettings.updatedBy],
    references: [users.id],
  }),
}));

// Export types for CMS tables
export type CmsHomepageSection = typeof cmsHomepageSections.$inferSelect;
export type InsertCmsHomepageSection = z.infer<typeof insertCmsHomepageSectionSchema>;
export type CmsSiteBranding = typeof cmsSiteBranding.$inferSelect;
export type InsertCmsSiteBranding = z.infer<typeof insertCmsSiteBrandingSchema>;
export type CmsBenefit = typeof cmsBenefits.$inferSelect;
export type InsertCmsBenefit = z.infer<typeof insertCmsBenefitSchema>;
export type CmsHowItWorksStep = typeof cmsHowItWorksSteps.$inferSelect;
export type InsertCmsHowItWorksStep = z.infer<typeof insertCmsHowItWorksStepSchema>;

export type StaticPage = typeof cmsStaticPages.$inferSelect;
export type InsertStaticPage = z.infer<typeof insertCmsStaticPageSchema>;
export type AdminRole = typeof adminRoles.$inferSelect;
export type InsertAdminRole = z.infer<typeof insertAdminRoleSchema>;
export type AdminRoleAssignment = typeof adminRoleAssignments.$inferSelect;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;

// Removed StaticPageWithRelations type to fix schema errors

export type AdminRoleWithAssignments = AdminRole & {
  assignments: (AdminRoleAssignment & {
    user: User;
  })[];
};

// Screen Reviews and Ratings System
export const screenReviews = pgTable("screen_reviews", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => screenLocations.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookingId: integer("booking_id").references(() => screenBookings.id, { onDelete: "set null" }),
  
  // Rating components (1-5 scale)
  overallRating: integer("overall_rating").notNull(), // Main rating 1-5
  visibility: integer("visibility").notNull(), // Screen visibility rating
  performance: integer("performance").notNull(), // Campaign performance rating
  traffic: integer("traffic").notNull(), // Location traffic rating
  valueForMoney: integer("value_for_money").notNull(), // Value assessment
  
  // Review content
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  
  // Review metadata
  isVerified: boolean("is_verified").notNull().default(false), // Verified booking
  isApproved: boolean("is_approved").notNull().default(true), // Admin moderation
  adminNotes: text("admin_notes"), // Internal admin notes
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const reviewResponses = pgTable("review_responses", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull().references(() => screenReviews.id, { onDelete: "cascade" }),
  responderId: integer("responder_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  response: text("response").notNull(),
  isAdminResponse: boolean("is_admin_response").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations
export const screenReviewsRelations = relations(screenReviews, ({ one, many }) => ({
  location: one(screenLocations, {
    fields: [screenReviews.locationId],
    references: [screenLocations.id]
  }),
  user: one(users, {
    fields: [screenReviews.userId],
    references: [users.id]
  }),
  booking: one(screenBookings, {
    fields: [screenReviews.bookingId],
    references: [screenBookings.id]
  }),
  responses: many(reviewResponses)
}));

export const reviewResponsesRelations = relations(reviewResponses, ({ one }) => ({
  review: one(screenReviews, {
    fields: [reviewResponses.reviewId],
    references: [screenReviews.id]
  }),
  responder: one(users, {
    fields: [reviewResponses.responderId],
    references: [users.id]
  })
}));

// Schema validation
export const insertScreenReviewSchema = createInsertSchema(screenReviews).omit({
  id: true,
  isVerified: true,
  isApproved: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true
});

export const insertReviewResponseSchema = createInsertSchema(reviewResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type ScreenReview = typeof screenReviews.$inferSelect;
export type InsertScreenReview = z.infer<typeof insertScreenReviewSchema>;
export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type InsertReviewResponse = z.infer<typeof insertReviewResponseSchema>;

export type ScreenReviewWithRelations = ScreenReview & {
  location: ScreenLocation;
  user: User;
  booking?: ScreenBooking;
  responses: (ReviewResponse & { responder: User })[];
};

export type LocationWithReviews = ScreenLocation & {
  reviews: ScreenReviewWithRelations[];
  averageRating: number;
  totalReviews: number;
};

// CMS Static Pages
export const cmsStaticPages = pgTable("cms_static_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  contentAr: text("content_ar").notNull(),
  metaDescription: text("meta_description"),
  metaDescriptionAr: text("meta_description_ar"),
  isVisible: boolean("is_visible").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site Settings for social media and WhatsApp
export const cmsSiteSettings = pgTable("cms_site_settings", {
  id: serial("id").primaryKey(),
  whatsappNumber: text("whatsapp_number"),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  whatsappPosition: text("whatsapp_position").default("bottom-right"),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),
  snapchatUrl: text("snapchat_url"),
  tiktokUrl: text("tiktok_url"),
  socialMediaEnabled: boolean("social_media_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CMS Schemas
export const insertCmsStaticPageSchema = createInsertSchema(cmsStaticPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCmsSiteSettingsSchema = createInsertSchema(cmsSiteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// CMS Types
export type CmsStaticPage = typeof cmsStaticPages.$inferSelect;
export type InsertCmsStaticPage = z.infer<typeof insertCmsStaticPageSchema>;
export type CmsSiteSettings = typeof cmsSiteSettings.$inferSelect;
export type InsertCmsSiteSettings = z.infer<typeof insertCmsSiteSettingsSchema>;

// Tracking Settings for Marketing Integration
export const trackingSettings = pgTable("tracking_settings", {
  id: serial("id").primaryKey(),
  googleAnalyticsId: text("google_analytics_id").default(""),
  googleTagManagerId: text("google_tag_manager_id").default(""),
  googleAdsConversionId: text("google_ads_conversion_id").default(""),
  googleAdsConversionLabel: text("google_ads_conversion_label").default(""),
  metaPixelId: text("meta_pixel_id").default(""),
  tiktokPixelId: text("tiktok_pixel_id").default(""),
  snapPixelId: text("snap_pixel_id").default(""),
  trackingEnabled: boolean("tracking_enabled").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discount Codes Management System
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // 'fixed' or 'percentage'
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumOrderValue: numeric("minimum_order_value", { precision: 10, scale: 2 }).default("0"),
  maxUses: integer("max_uses"), // null means unlimited
  usedCount: integer("used_count").notNull().default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discount Code Usage Tracking
export const discountCodeUsage = pgTable("discount_code_usage", {
  id: serial("id").primaryKey(),
  codeId: integer("code_id").references(() => discountCodes.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  orderValue: numeric("order_value", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  usedAt: timestamp("used_at").defaultNow(),
});

// Affiliate/Marketer Tracking System
export const marketers = pgTable("marketers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  referralCode: text("referral_code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("0"), // percentage
  totalReferrals: integer("total_referrals").notNull().default(0),
  totalEarnings: numeric("total_earnings", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentDetails: json("payment_details"), // bank info, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Referral Tracking
export const customerReferrals = pgTable("customer_referrals", {
  id: serial("id").primaryKey(),
  marketerId: integer("marketer_id").references(() => marketers.id, { onDelete: "cascade" }).notNull(),
  customerId: integer("customer_id").references(() => users.id),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  referralSource: text("referral_source").default("link"), // 'link', 'code', 'manual'
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  conversionValue: numeric("conversion_value", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("pending"), // 'pending', 'converted', 'cancelled'
  referredAt: timestamp("referred_at").defaultNow(),
  convertedAt: timestamp("converted_at"),
});

// Payment Gateway Settings
export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  moyasarEnabled: boolean("moyasar_enabled").notNull().default(false),
  moyasarPublishableKey: text("moyasar_publishable_key").default(""),
  moyasarSecretKey: text("moyasar_secret_key").default(""),
  moyasarWebhookSecret: text("moyasar_webhook_secret").default(""),
  testMode: boolean("test_mode").notNull().default(true),
  supportedCurrencies: text("supported_currencies").array().default(["SAR"]),
  minimumAmount: numeric("minimum_amount", { precision: 10, scale: 2 }).default("1.00"),
  maximumAmount: numeric("maximum_amount", { precision: 10, scale: 2 }).default("50000.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for new tables
export const discountCodesRelations = relations(discountCodes, ({ one, many }) => ({
  createdBy: one(users, { fields: [discountCodes.createdBy], references: [users.id] }),
  usage: many(discountCodeUsage),
}));

export const discountCodeUsageRelations = relations(discountCodeUsage, ({ one }) => ({
  code: one(discountCodes, { fields: [discountCodeUsage.codeId], references: [discountCodes.id] }),
  user: one(users, { fields: [discountCodeUsage.userId], references: [users.id] }),
}));

export const marketersRelations = relations(marketers, ({ many }) => ({
  referrals: many(customerReferrals),
}));

export const customerReferralsRelations = relations(customerReferrals, ({ one }) => ({
  marketer: one(marketers, { fields: [customerReferrals.marketerId], references: [marketers.id] }),
  customer: one(users, { fields: [customerReferrals.customerId], references: [users.id] }),
}));

// Schemas for new tables
export const insertTrackingSettingsSchema = createInsertSchema(trackingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  usedCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountCodeUsageSchema = createInsertSchema(discountCodeUsage).omit({
  id: true,
  usedAt: true,
});

export const insertMarketerSchema = createInsertSchema(marketers).omit({
  id: true,
  totalReferrals: true,
  totalEarnings: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerReferralSchema = createInsertSchema(customerReferrals).omit({
  id: true,
  referredAt: true,
  convertedAt: true,
});

export const insertPaymentSettingsSchema = createInsertSchema(paymentSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for new tables
export type TrackingSettings = typeof trackingSettings.$inferSelect;
export type InsertTrackingSettings = z.infer<typeof insertTrackingSettingsSchema>;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;
export type InsertDiscountCodeUsage = z.infer<typeof insertDiscountCodeUsageSchema>;

export type Marketer = typeof marketers.$inferSelect;
export type InsertMarketer = z.infer<typeof insertMarketerSchema>;

export type CustomerReferral = typeof customerReferrals.$inferSelect;
export type InsertCustomerReferral = z.infer<typeof insertCustomerReferralSchema>;

export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type InsertPaymentSettings = z.infer<typeof insertPaymentSettingsSchema>;

// Enhanced types with relations
export type DiscountCodeWithUsage = DiscountCode & {
  usage: DiscountCodeUsage[];
  createdBy: User;
};

export type MarketerWithStats = Marketer & {
  referrals: CustomerReferral[];
};

export type CustomerReferralWithDetails = CustomerReferral & {
  marketer: Marketer;
  customer?: User;
};
