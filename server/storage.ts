import { users, categories, offers, branches, customerFavorites, subscriptionPlans, features, planFeatures, aiAnalysis, screenLocations, screenAds, screenPricingOptions, screenBookings, merchantProfiles, invoices, type User, type InsertUser, type Category, type InsertCategory, type Offer, type InsertOffer, type OfferWithRelations, type Branch, type InsertBranch, type UserWithBranches, type CustomerFavorite, type InsertCustomerFavorite, type SubscriptionPlan, type InsertSubscriptionPlan, type Feature, type InsertFeature, type PlanFeature, type InsertPlanFeature, type SubscriptionPlanWithFeatures, type AiAnalysis, type InsertAiAnalysis, type ScreenLocation, type InsertScreenLocation, type ScreenAd, type InsertScreenAd, type ScreenAdWithRelations, type ScreenPricingOption, type InsertScreenPricingOption, type ScreenBooking, type InsertScreenBooking, type ScreenBookingWithRelations, type MerchantProfile, type InsertMerchantProfile, type MerchantProfileWithRelations, type Invoice, type InsertInvoice, type InvoiceWithRelations } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, gt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Branch methods
  getBranches(businessId: number): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<boolean>;
  getUserWithBranches(id: number): Promise<UserWithBranches | undefined>;

  // Offer methods
  getOffers(params?: {
    categoryId?: number;
    city?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isApproved?: boolean;
    businessId?: number;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<OfferWithRelations[]>;
  getOffer(id: number): Promise<OfferWithRelations | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, updates: Partial<InsertOffer & { isApproved?: boolean }>): Promise<Offer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  incrementOfferViews(id: number): Promise<void>;

  // Analytics
  getOfferStats(businessId?: number): Promise<{
    totalOffers: number;
    activeOffers: number;
    totalViews: number;
    expiringOffers: number;
  }>;

  // Customer Favorites
  createCustomerFavorite(favorite: InsertCustomerFavorite): Promise<CustomerFavorite>;
  getCustomerFavorites(phoneNumber: string): Promise<CustomerFavorite[]>;
  checkCustomerFavorite(phoneNumber: string, offerId: number): Promise<boolean>;
  getOfferFavoriteCount(offerId: number): Promise<number>;

  // Admin methods
  getAdminStats(): Promise<{
    totalBusinesses: number;
    totalOffers: number;
    totalUsers: number;
    pendingOffers: number;
    mostViewedOffers: OfferWithRelations[];
  }>;
  getAllBusinesses(): Promise<User[]>;
  getAllOffersForAdmin(): Promise<OfferWithRelations[]>;
  getAllCustomers(): Promise<CustomerFavorite[]>;
  updateBusinessStatus(businessId: number, isApproved: boolean): Promise<User | undefined>;
  approveOffer(offerId: number): Promise<Offer | undefined>;
  rejectOffer(offerId: number): Promise<Offer | undefined>;

  // Subscription Plan Management
  getSubscriptionPlans(): Promise<SubscriptionPlanWithFeatures[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlanWithFeatures | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;

  // Feature Management
  getFeatures(): Promise<Feature[]>;
  getFeature(id: number): Promise<Feature | undefined>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  updateFeature(id: number, updates: Partial<InsertFeature>): Promise<Feature | undefined>;
  deleteFeature(id: number): Promise<boolean>;

  // Plan-Feature Mapping
  getPlanFeatures(planId: number): Promise<PlanFeature[]>;
  updatePlanFeature(planId: number, featureId: number, isIncluded: boolean, limit?: number): Promise<PlanFeature | undefined>;
  addFeatureToPlan(planId: number, featureId: number, isIncluded: boolean, limit?: number): Promise<PlanFeature>;
  removeFeatureFromPlan(planId: number, featureId: number): Promise<boolean>;

  // AI Analysis methods
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getAiAnalysis(offerId: number): Promise<AiAnalysis | undefined>;
  deleteAiAnalysis(offerId: number): Promise<boolean>;
  getOffersWithAnalysis(): Promise<(OfferWithRelations & { aiAnalysis?: AiAnalysis })[]>;

  // Screen Ads methods
  getScreenLocations(): Promise<ScreenLocation[]>;
  getScreenLocation(id: number): Promise<ScreenLocation | undefined>;
  createScreenLocation(location: InsertScreenLocation): Promise<ScreenLocation>;
  updateScreenLocation(id: number, updates: Partial<InsertScreenLocation>): Promise<ScreenLocation | undefined>;
  deleteScreenLocation(id: number): Promise<boolean>;
  
  getScreenAds(params?: {
    merchantId?: number;
    locationId?: number;
    status?: string;
  }): Promise<ScreenAdWithRelations[]>;
  getScreenAd(id: number): Promise<ScreenAdWithRelations | undefined>;
  createScreenAd(ad: InsertScreenAd): Promise<ScreenAd>;
  updateScreenAd(id: number, updates: Partial<InsertScreenAd>): Promise<ScreenAd | undefined>;
  deleteScreenAd(id: number): Promise<boolean>;

  // Enhanced Pricing Options methods
  getScreenPricingOptions(locationId?: number): Promise<ScreenPricingOption[]>;
  getScreenPricingOption(id: number): Promise<ScreenPricingOption | undefined>;
  createScreenPricingOption(option: InsertScreenPricingOption): Promise<ScreenPricingOption>;
  updateScreenPricingOption(id: number, updates: Partial<InsertScreenPricingOption>): Promise<ScreenPricingOption | undefined>;
  deleteScreenPricingOption(id: number): Promise<boolean>;

  // Enhanced Booking System methods
  getScreenBookings(params?: {
    merchantId?: number;
    locationId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ScreenBookingWithRelations[]>;
  getScreenBooking(id: number): Promise<ScreenBookingWithRelations | undefined>;
  createScreenBooking(booking: InsertScreenBooking): Promise<ScreenBooking>;
  updateScreenBooking(id: number, updates: Partial<InsertScreenBooking>): Promise<ScreenBooking | undefined>;
  deleteScreenBooking(id: number): Promise<boolean>;
  approveScreenBooking(id: number, adminNotes?: string): Promise<ScreenBooking | undefined>;
  rejectScreenBooking(id: number, rejectionReason?: string): Promise<ScreenBooking | undefined>;

  // Merchant Profile methods
  getMerchantProfiles(): Promise<MerchantProfileWithRelations[]>;
  getMerchantProfile(userId: number): Promise<MerchantProfileWithRelations | undefined>;
  createMerchantProfile(profile: InsertMerchantProfile): Promise<MerchantProfile>;
  updateMerchantProfile(userId: number, updates: Partial<InsertMerchantProfile>): Promise<MerchantProfile | undefined>;
  deleteMerchantProfile(userId: number): Promise<boolean>;

  // Invoice System methods
  getInvoices(params?: {
    merchantId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<InvoiceWithRelations[]>;
  getInvoice(id: number): Promise<InvoiceWithRelations | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithRelations | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  generateInvoiceForBooking(bookingId: number): Promise<Invoice | undefined>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getBranches(businessId: number): Promise<Branch[]> {
    return await db.select().from(branches).where(eq(branches.businessId, businessId));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch || undefined;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [newBranch] = await db
      .insert(branches)
      .values(branch)
      .returning();
    return newBranch;
  }

  async updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch | undefined> {
    const [branch] = await db
      .update(branches)
      .set(updates)
      .where(eq(branches.id, id))
      .returning();
    return branch || undefined;
  }

  async deleteBranch(id: number): Promise<boolean> {
    const result = await db.delete(branches).where(eq(branches.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUserWithBranches(id: number): Promise<UserWithBranches | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    const userBranches = await this.getBranches(id);
    return { ...user, branches: userBranches };
  }

  async getOffers(params: {
    categoryId?: number;
    city?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isApproved?: boolean;
    businessId?: number;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<OfferWithRelations[]> {
    const {
      categoryId,
      city,
      isActive = true,
      isFeatured,
      isApproved = true,
      businessId,
      limit = 50,
      offset = 0,
      search
    } = params;

    let query = db
      .select()
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .where(and(
        categoryId ? eq(offers.categoryId, categoryId) : undefined,
        city ? eq(offers.city, city) : undefined,
        isActive !== undefined ? eq(offers.isActive, isActive) : undefined,
        isFeatured !== undefined ? eq(offers.isFeatured, isFeatured) : undefined,
        isApproved !== undefined ? eq(offers.isApproved, isApproved) : sql`1=1`,
        businessId ? eq(offers.businessId, businessId) : undefined,
        search ? or(
          like(offers.title, `%${search}%`),
          like(offers.description, `%${search}%`)
        ) : undefined
      ))
      .orderBy(desc(offers.createdAt))
      .limit(limit)
      .offset(offset);

    const result = await query;
    
    return result.map(row => ({
      ...row.offers,
      business: row.users!,
      category: row.categories!,
    })) as OfferWithRelations[];
  }

  async getOffer(id: number): Promise<OfferWithRelations | undefined> {
    const [result] = await db
      .select()
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .where(eq(offers.id, id));

    if (!result) return undefined;

    return {
      ...result.offers,
      business: result.users!,
      category: result.categories!,
    } as OfferWithRelations;
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db
      .insert(offers)
      .values(offer)
      .returning();
    return newOffer;
  }

  async updateOffer(id: number, updates: Partial<InsertOffer>): Promise<Offer | undefined> {
    const [offer] = await db
      .update(offers)
      .set(updates)
      .where(eq(offers.id, id))
      .returning();
    return offer || undefined;
  }

  async deleteOffer(id: number): Promise<boolean> {
    const result = await db
      .delete(offers)
      .where(eq(offers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementOfferViews(id: number): Promise<void> {
    await db
      .update(offers)
      .set({ views: sql`${offers.views} + 1` })
      .where(eq(offers.id, id));
  }

  async getOfferStats(businessId?: number): Promise<{
    totalOffers: number;
    activeOffers: number;
    totalViews: number;
    expiringOffers: number;
  }> {
    const whereClause = businessId ? eq(offers.businessId, businessId) : undefined;

    const [totalOffersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offers)
      .where(whereClause);

    const [activeOffersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offers)
      .where(and(
        whereClause,
        eq(offers.isActive, true)
      ));

    const [totalViewsResult] = await db
      .select({ sum: sql<number>`coalesce(sum(${offers.views}), 0)` })
      .from(offers)
      .where(whereClause);

    const [expiringOffersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offers)
      .where(and(
        whereClause,
        eq(offers.isActive, true),
        gt(offers.endDate, new Date()),
        sql`${offers.endDate} <= NOW() + INTERVAL '24 hours'`
      ));

    return {
      totalOffers: totalOffersResult.count,
      activeOffers: activeOffersResult.count,
      totalViews: totalViewsResult.sum,
      expiringOffers: expiringOffersResult.count,
    };
  }

  // Customer Favorites Methods
  async createCustomerFavorite(favorite: InsertCustomerFavorite): Promise<CustomerFavorite> {
    const [newFavorite] = await db
      .insert(customerFavorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async getCustomerFavorites(phoneNumber: string): Promise<CustomerFavorite[]> {
    return await db
      .select()
      .from(customerFavorites)
      .where(eq(customerFavorites.phoneNumber, phoneNumber));
  }

  async checkCustomerFavorite(phoneNumber: string, offerId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(customerFavorites)
      .where(and(
        eq(customerFavorites.phoneNumber, phoneNumber),
        eq(customerFavorites.offerId, offerId)
      ));
    return !!favorite;
  }

  async getOfferFavoriteCount(offerId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customerFavorites)
      .where(eq(customerFavorites.offerId, offerId));
    return result?.count || 0;
  }

  // Admin methods implementation
  async getAdminStats(): Promise<{
    totalBusinesses: number;
    totalOffers: number;
    totalUsers: number;
    pendingOffers: number;
    mostViewedOffers: OfferWithRelations[];
  }> {
    const [totalBusinessesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "business"));

    const [totalOffersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offers);

    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(distinct ${customerFavorites.phoneNumber})` })
      .from(customerFavorites);

    const [pendingOffersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(offers)
      .where(eq(offers.isApproved, false));

    const mostViewedOffers = await db
      .select()
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .orderBy(desc(offers.views))
      .limit(5);

    return {
      totalBusinesses: totalBusinessesResult.count,
      totalOffers: totalOffersResult.count,
      totalUsers: totalUsersResult.count,
      pendingOffers: pendingOffersResult.count,
      mostViewedOffers: mostViewedOffers.map(row => ({
        ...row.offers!,
        business: row.users!,
        category: row.categories!,
      })),
    };
  }

  async getAllBusinesses(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "business"))
      .orderBy(desc(users.createdAt));
  }

  async getAllOffersForAdmin(): Promise<OfferWithRelations[]> {
    const result = await db
      .select()
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .orderBy(desc(offers.createdAt));

    return result.map(row => ({
      ...row.offers,
      business: row.users!,
      category: row.categories!,
    }));
  }

  async getAllCustomers(): Promise<CustomerFavorite[]> {
    return await db
      .select()
      .from(customerFavorites)
      .orderBy(desc(customerFavorites.createdAt));
  }

  async updateBusinessStatus(businessId: number, isApproved: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isApproved })
      .where(eq(users.id, businessId))
      .returning();
    return updatedUser;
  }

  async approveOffer(offerId: number): Promise<Offer | undefined> {
    const [updatedOffer] = await db
      .update(offers)
      .set({ isApproved: true })
      .where(eq(offers.id, offerId))
      .returning();
    return updatedOffer;
  }

  async rejectOffer(offerId: number): Promise<Offer | undefined> {
    const [updatedOffer] = await db
      .update(offers)
      .set({ isApproved: false })
      .where(eq(offers.id, offerId))
      .returning();
    return updatedOffer;
  }

  // Subscription Plan Management
  async getSubscriptionPlans(): Promise<SubscriptionPlanWithFeatures[]> {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);

    const plansWithFeatures = await Promise.all(
      plans.map(async (plan) => {
        const planFeaturesList = await db
          .select({
            id: planFeatures.id,
            planId: planFeatures.planId,
            featureId: planFeatures.featureId,
            isIncluded: planFeatures.isIncluded,
            limit: planFeatures.limit,
            createdAt: planFeatures.createdAt,
            feature: {
              id: features.id,
              name: features.name,
              nameAr: features.nameAr,
              description: features.description,
              descriptionAr: features.descriptionAr,
              category: features.category,
              icon: features.icon,
              isActive: features.isActive,
              sortOrder: features.sortOrder,
              createdAt: features.createdAt,
            },
          })
          .from(planFeatures)
          .leftJoin(features, eq(planFeatures.featureId, features.id))
          .where(eq(planFeatures.planId, plan.id));

        return {
          ...plan,
          planFeatures: planFeaturesList,
        };
      })
    );

    return plansWithFeatures;
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlanWithFeatures | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));

    if (!plan) return undefined;

    const planFeaturesList = await db
      .select({
        id: planFeatures.id,
        planId: planFeatures.planId,
        featureId: planFeatures.featureId,
        isIncluded: planFeatures.isIncluded,
        limit: planFeatures.limit,
        createdAt: planFeatures.createdAt,
        feature: {
          id: features.id,
          name: features.name,
          nameAr: features.nameAr,
          description: features.description,
          descriptionAr: features.descriptionAr,
          category: features.category,
          icon: features.icon,
          isActive: features.isActive,
          sortOrder: features.sortOrder,
          createdAt: features.createdAt,
        },
      })
      .from(planFeatures)
      .leftJoin(features, eq(planFeatures.featureId, features.id))
      .where(eq(planFeatures.planId, plan.id));

    return {
      ...plan,
      planFeatures: planFeaturesList,
    };
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: number, updates: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const result = await db
      .update(subscriptionPlans)
      .set({ isActive: false })
      .where(eq(subscriptionPlans.id, id));
    return result.rowCount > 0;
  }

  // Feature Management
  async getFeatures(): Promise<Feature[]> {
    return await db
      .select()
      .from(features)
      .where(eq(features.isActive, true))
      .orderBy(features.sortOrder);
  }

  async getFeature(id: number): Promise<Feature | undefined> {
    const [feature] = await db
      .select()
      .from(features)
      .where(eq(features.id, id));
    return feature || undefined;
  }

  async createFeature(feature: InsertFeature): Promise<Feature> {
    const [newFeature] = await db
      .insert(features)
      .values(feature)
      .returning();
    return newFeature;
  }

  async updateFeature(id: number, updates: Partial<InsertFeature>): Promise<Feature | undefined> {
    const [updatedFeature] = await db
      .update(features)
      .set(updates)
      .where(eq(features.id, id))
      .returning();
    return updatedFeature || undefined;
  }

  async deleteFeature(id: number): Promise<boolean> {
    const result = await db
      .update(features)
      .set({ isActive: false })
      .where(eq(features.id, id));
    return result.rowCount > 0;
  }

  // Plan-Feature Mapping
  async getPlanFeatures(planId: number): Promise<PlanFeature[]> {
    return await db
      .select()
      .from(planFeatures)
      .where(eq(planFeatures.planId, planId));
  }

  async updatePlanFeature(planId: number, featureId: number, isIncluded: boolean, limit?: number): Promise<PlanFeature | undefined> {
    const [updated] = await db
      .update(planFeatures)
      .set({ isIncluded, limit })
      .where(and(eq(planFeatures.planId, planId), eq(planFeatures.featureId, featureId)))
      .returning();
    return updated || undefined;
  }

  async addFeatureToPlan(planId: number, featureId: number, isIncluded: boolean, limit?: number): Promise<PlanFeature> {
    const [newPlanFeature] = await db
      .insert(planFeatures)
      .values({ planId, featureId, isIncluded, limit })
      .returning();
    return newPlanFeature;
  }

  async removeFeatureFromPlan(planId: number, featureId: number): Promise<boolean> {
    const result = await db
      .delete(planFeatures)
      .where(and(eq(planFeatures.planId, planId), eq(planFeatures.featureId, featureId)));
    return result.rowCount > 0;
  }

  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [result] = await db
      .insert(aiAnalysis)
      .values(analysis)
      .returning();
    return result;
  }

  async getAiAnalysis(offerId: number): Promise<AiAnalysis | undefined> {
    const [result] = await db
      .select()
      .from(aiAnalysis)
      .where(eq(aiAnalysis.offerId, offerId))
      .orderBy(desc(aiAnalysis.analyzedAt))
      .limit(1);
    return result;
  }

  async deleteAiAnalysis(offerId: number): Promise<boolean> {
    try {
      await db
        .delete(aiAnalysis)
        .where(eq(aiAnalysis.offerId, offerId));
      return true;
    } catch (error) {
      console.error("Error deleting AI analysis:", error);
      return false;
    }
  }

  async getOffersWithAnalysis(): Promise<(OfferWithRelations & { aiAnalysis?: AiAnalysis })[]> {
    const offersWithAnalysis = await db
      .select({
        offer: offers,
        business: users,
        category: categories,
        analysis: aiAnalysis,
      })
      .from(offers)
      .leftJoin(users, eq(offers.businessId, users.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .leftJoin(aiAnalysis, eq(offers.id, aiAnalysis.offerId))
      .orderBy(desc(offers.createdAt));

    return offersWithAnalysis.map(row => ({
      ...row.offer,
      business: row.business!,
      category: row.category!,
      aiAnalysis: row.analysis || undefined,
    }));
  }

  // Screen Ads Methods
  async getScreenLocations(): Promise<ScreenLocation[]> {
    return await db
      .select()
      .from(screenLocations)
      .where(eq(screenLocations.isActive, true))
      .orderBy(screenLocations.name);
  }

  async getScreenLocation(id: number): Promise<ScreenLocation | undefined> {
    const [location] = await db
      .select()
      .from(screenLocations)
      .where(eq(screenLocations.id, id));
    return location || undefined;
  }

  async createScreenLocation(location: InsertScreenLocation): Promise<ScreenLocation> {
    const [newLocation] = await db
      .insert(screenLocations)
      .values(location)
      .returning();
    return newLocation;
  }

  async updateScreenLocation(id: number, updates: Partial<InsertScreenLocation>): Promise<ScreenLocation | undefined> {
    const [updated] = await db
      .update(screenLocations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(screenLocations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteScreenLocation(id: number): Promise<boolean> {
    const result = await db
      .delete(screenLocations)
      .where(eq(screenLocations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getScreenAds(params: {
    merchantId?: number;
    locationId?: number;
    status?: string;
  } = {}): Promise<ScreenAdWithRelations[]> {
    const conditions = [];
    if (params.merchantId) {
      conditions.push(eq(screenAds.merchantId, params.merchantId));
    }
    if (params.locationId) {
      conditions.push(eq(screenAds.locationId, params.locationId));
    }
    if (params.status) {
      conditions.push(eq(screenAds.status, params.status));
    }

    const query = db
      .select({
        id: screenAds.id,
        merchantId: screenAds.merchantId,
        locationId: screenAds.locationId,
        mediaUrl: screenAds.mediaUrl,
        mediaType: screenAds.mediaType,
        startDate: screenAds.startDate,
        endDate: screenAds.endDate,
        duration: screenAds.duration,
        totalCost: screenAds.totalCost,
        status: screenAds.status,
        adminNotes: screenAds.adminNotes,
        createdAt: screenAds.createdAt,
        updatedAt: screenAds.updatedAt,
        merchant: users,
        location: screenLocations,
      })
      .from(screenAds)
      .leftJoin(users, eq(screenAds.merchantId, users.id))
      .leftJoin(screenLocations, eq(screenAds.locationId, screenLocations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(screenAds.createdAt));

    const result = await query;

    return result.map(row => ({
      ...row,
      merchant: row.merchant!,
      location: row.location!,
    }));
  }

  async getScreenAd(id: number): Promise<ScreenAdWithRelations | undefined> {
    const [result] = await db
      .select({
        id: screenAds.id,
        merchantId: screenAds.merchantId,
        locationId: screenAds.locationId,
        mediaUrl: screenAds.mediaUrl,
        mediaType: screenAds.mediaType,
        startDate: screenAds.startDate,
        endDate: screenAds.endDate,
        duration: screenAds.duration,
        totalCost: screenAds.totalCost,
        status: screenAds.status,
        adminNotes: screenAds.adminNotes,
        createdAt: screenAds.createdAt,
        updatedAt: screenAds.updatedAt,
        merchant: users,
        location: screenLocations,
      })
      .from(screenAds)
      .leftJoin(users, eq(screenAds.merchantId, users.id))
      .leftJoin(screenLocations, eq(screenAds.locationId, screenLocations.id))
      .where(eq(screenAds.id, id));

    if (!result) return undefined;

    return {
      ...result,
      merchant: result.merchant!,
      location: result.location!,
    };
  }

  async createScreenAd(ad: InsertScreenAd): Promise<ScreenAd> {
    const [newAd] = await db
      .insert(screenAds)
      .values(ad)
      .returning();
    return newAd;
  }

  async updateScreenAd(id: number, updates: Partial<InsertScreenAd>): Promise<ScreenAd | undefined> {
    const [updated] = await db
      .update(screenAds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(screenAds.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteScreenAd(id: number): Promise<boolean> {
    const result = await db
      .delete(screenAds)
      .where(eq(screenAds.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Enhanced Pricing Options methods
  async getScreenPricingOptions(locationId?: number): Promise<ScreenPricingOption[]> {
    try {
      if (locationId) {
        return await db.select().from(screenPricingOptions)
          .where(eq(screenPricingOptions.locationId, locationId));
      }
      return await db.select().from(screenPricingOptions);
    } catch (error) {
      console.error("Error fetching screen pricing options:", error);
      return [];
    }
  }

  async getScreenPricingOption(id: number): Promise<ScreenPricingOption | undefined> {
    try {
      const [option] = await db.select().from(screenPricingOptions)
        .where(eq(screenPricingOptions.id, id));
      return option || undefined;
    } catch (error) {
      console.error("Error fetching screen pricing option:", error);
      return undefined;
    }
  }

  async createScreenPricingOption(option: InsertScreenPricingOption): Promise<ScreenPricingOption> {
    const [created] = await db.insert(screenPricingOptions).values(option).returning();
    return created;
  }

  async updateScreenPricingOption(id: number, updates: Partial<InsertScreenPricingOption>): Promise<ScreenPricingOption | undefined> {
    try {
      const [updated] = await db.update(screenPricingOptions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(screenPricingOptions.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating screen pricing option:", error);
      return undefined;
    }
  }

  async deleteScreenPricingOption(id: number): Promise<boolean> {
    try {
      const result = await db.delete(screenPricingOptions).where(eq(screenPricingOptions.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting screen pricing option:", error);
      return false;
    }
  }

  // Enhanced Booking System methods
  async getScreenBookings(params?: {
    merchantId?: number;
    locationId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ScreenBookingWithRelations[]> {
    try {
      const results = await db.select({
        booking: screenBookings,
        merchant: users,
        location: screenLocations,
        pricingOption: screenPricingOptions,
      }).from(screenBookings)
        .leftJoin(users, eq(screenBookings.merchantId, users.id))
        .leftJoin(screenLocations, eq(screenBookings.locationId, screenLocations.id))
        .leftJoin(screenPricingOptions, eq(screenBookings.pricingOptionId, screenPricingOptions.id))
        .orderBy(desc(screenBookings.createdAt));

      return results.map(row => ({
        ...row.booking,
        merchant: row.merchant!,
        location: row.location!,
        pricingOption: row.pricingOption!,
      }));
    } catch (error) {
      console.error("Error fetching screen bookings:", error);
      return [];
    }
  }

  async getScreenBooking(id: number): Promise<ScreenBookingWithRelations | undefined> {
    try {
      const [result] = await db.select({
        booking: screenBookings,
        merchant: users,
        location: screenLocations,
        pricingOption: screenPricingOptions,
      }).from(screenBookings)
        .leftJoin(users, eq(screenBookings.merchantId, users.id))
        .leftJoin(screenLocations, eq(screenBookings.locationId, screenLocations.id))
        .leftJoin(screenPricingOptions, eq(screenBookings.pricingOptionId, screenPricingOptions.id))
        .where(eq(screenBookings.id, id));
      
      if (!result) return undefined;

      return {
        ...result.booking,
        merchant: result.merchant!,
        location: result.location!,
        pricingOption: result.pricingOption!,
      };
    } catch (error) {
      console.error("Error fetching screen booking:", error);
      return undefined;
    }
  }

  async createScreenBooking(booking: InsertScreenBooking): Promise<ScreenBooking> {
    const [created] = await db.insert(screenBookings).values(booking).returning();
    return created;
  }

  async updateScreenBooking(id: number, updates: Partial<InsertScreenBooking>): Promise<ScreenBooking | undefined> {
    try {
      const [updated] = await db.update(screenBookings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(screenBookings.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating screen booking:", error);
      return undefined;
    }
  }

  async deleteScreenBooking(id: number): Promise<boolean> {
    try {
      const result = await db.delete(screenBookings).where(eq(screenBookings.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting screen booking:", error);
      return false;
    }
  }

  async approveScreenBooking(id: number, adminNotes?: string): Promise<ScreenBooking | undefined> {
    try {
      const [updated] = await db.update(screenBookings)
        .set({
          status: "approved",
          statusAr: "مقبول",
          adminNotes,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(screenBookings.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error approving screen booking:", error);
      return undefined;
    }
  }

  async rejectScreenBooking(id: number, rejectionReason?: string): Promise<ScreenBooking | undefined> {
    try {
      const [updated] = await db.update(screenBookings)
        .set({
          status: "rejected",
          statusAr: "مرفوض",
          rejectionReason,
          rejectedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(screenBookings.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error rejecting screen booking:", error);
      return undefined;
    }
  }

  // Merchant Profile methods
  async getMerchantProfiles(): Promise<MerchantProfileWithRelations[]> {
    try {
      const results = await db.select({
        profile: merchantProfiles,
        user: users,
      }).from(merchantProfiles)
        .leftJoin(users, eq(merchantProfiles.userId, users.id))
        .orderBy(desc(merchantProfiles.createdAt));

      return results.map(row => ({
        ...row.profile,
        user: row.user!,
      }));
    } catch (error) {
      console.error("Error fetching merchant profiles:", error);
      return [];
    }
  }

  async getMerchantProfile(userId: number): Promise<MerchantProfileWithRelations | undefined> {
    try {
      const [result] = await db.select({
        profile: merchantProfiles,
        user: users,
      }).from(merchantProfiles)
        .leftJoin(users, eq(merchantProfiles.userId, users.id))
        .where(eq(merchantProfiles.userId, userId));
      
      if (!result) return undefined;

      return {
        ...result.profile,
        user: result.user!,
      };
    } catch (error) {
      console.error("Error fetching merchant profile:", error);
      return undefined;
    }
  }

  async createMerchantProfile(profile: InsertMerchantProfile): Promise<MerchantProfile> {
    const [created] = await db.insert(merchantProfiles).values(profile).returning();
    return created;
  }

  async updateMerchantProfile(userId: number, updates: Partial<InsertMerchantProfile>): Promise<MerchantProfile | undefined> {
    try {
      const [updated] = await db.update(merchantProfiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(merchantProfiles.userId, userId))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating merchant profile:", error);
      return undefined;
    }
  }

  async deleteMerchantProfile(userId: number): Promise<boolean> {
    try {
      const result = await db.delete(merchantProfiles).where(eq(merchantProfiles.userId, userId));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting merchant profile:", error);
      return false;
    }
  }

  // Invoice System methods
  async getInvoices(params?: {
    merchantId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<InvoiceWithRelations[]> {
    try {
      const results = await db.select({
        invoice: invoices,
        booking: screenBookings,
        merchant: users,
      }).from(invoices)
        .leftJoin(screenBookings, eq(invoices.bookingId, screenBookings.id))
        .leftJoin(users, eq(invoices.merchantId, users.id))
        .orderBy(desc(invoices.createdAt));

      return results.map(row => ({
        ...row.invoice,
        booking: row.booking as ScreenBookingWithRelations,
        merchant: row.merchant!,
      }));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }
  }

  async getInvoice(id: number): Promise<InvoiceWithRelations | undefined> {
    try {
      const [result] = await db.select({
        invoice: invoices,
        booking: screenBookings,
        merchant: users,
      }).from(invoices)
        .leftJoin(screenBookings, eq(invoices.bookingId, screenBookings.id))
        .leftJoin(users, eq(invoices.merchantId, users.id))
        .where(eq(invoices.id, id));
      
      if (!result) return undefined;

      return {
        ...result.invoice,
        booking: result.booking as ScreenBookingWithRelations,
        merchant: result.merchant!,
      };
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return undefined;
    }
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<InvoiceWithRelations | undefined> {
    try {
      const [result] = await db.select({
        invoice: invoices,
        booking: screenBookings,
        merchant: users,
      }).from(invoices)
        .leftJoin(screenBookings, eq(invoices.bookingId, screenBookings.id))
        .leftJoin(users, eq(invoices.merchantId, users.id))
        .where(eq(invoices.invoiceNumber, invoiceNumber));
      
      if (!result) return undefined;

      return {
        ...result.invoice,
        booking: result.booking as ScreenBookingWithRelations,
        merchant: result.merchant!,
      };
    } catch (error) {
      console.error("Error fetching invoice by number:", error);
      return undefined;
    }
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    try {
      const [updated] = await db.update(invoices)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(invoices.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating invoice:", error);
      return undefined;
    }
  }

  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const result = await db.delete(invoices).where(eq(invoices.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return false;
    }
  }

  async generateInvoiceForBooking(bookingId: number): Promise<Invoice | undefined> {
    try {
      const booking = await this.getScreenBooking(bookingId);
      if (!booking || booking.status !== "approved") {
        return undefined;
      }

      const invoiceNumber = `INV-${Date.now()}-${booking.id}`;
      const issueDate = new Date();
      const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from issue

      const subtotal = parseFloat(booking.totalPrice.toString());
      const taxRate = 0.15; // 15% VAT in Saudi Arabia
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      const invoiceData: InsertInvoice = {
        invoiceNumber,
        bookingId: booking.id,
        merchantId: booking.merchantId,
        issueDate,
        dueDate,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        currency: "SAR",
        status: "unpaid",
        statusAr: "غير مدفوع",
      };

      const invoice = await this.createInvoice(invoiceData);

      // Update booking to mark invoice as generated
      await this.updateScreenBooking(bookingId, {
        invoiceGenerated: true,
        invoiceNumber,
      });

      return invoice;
    } catch (error) {
      console.error("Error generating invoice for booking:", error);
      return undefined;
    }
  }

}

export const storage = new DatabaseStorage();
