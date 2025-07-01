import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { emailService } from "./email";
import { paymentService } from "./payment-service";
import {
  insertOfferSchema,
  insertCategorySchema,
  updateOfferSchema,
  insertBranchSchema,
  insertScreenAdSchema,
  insertScreenLocationSchema,
  insertScreenPricingOptionSchema,
  insertScreenBookingSchema,
  insertMerchantProfileSchema,
  insertInvoiceSchema,
  insertContactFormSchema,
  insertMerchantRegistrationSchema,
  screenLocations,
  screenBookings,
  invoices,
  users,
  merchantNotifications,
  campaignMedia,
  bookingLogs,
  contactForms,
  merchantRegistrations,
  subscriptionPlans,
  merchantSubscriptions,
  screenPricingOptions,
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, and, or, gte, lte, desc, ne, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir =
      file.fieldname === "logo" ? "uploads/logos" : "uploads/screen-ads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "ad-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("نوع ملف غير مدعوم. يرجى رفع JPG، PNG، أو MP4"));
    }
  },
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  // Seed categories and screen locations
  seedCategories();
  seedScreenLocations();

  // Public routes - no authentication required

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "خطأ في جلب الفئات" });
    }
  });

  // Get offers with filters
  app.get("/api/offers", async (req, res) => {
    try {
      const {
        category,
        city,
        featured,
        limit = "20",
        offset = "0",
        search,
      } = req.query;

      const categoryId = category ? parseInt(category as string) : undefined;
      const isFeatured = featured === "true" ? true : undefined;

      const offers = await storage.getOffers({
        categoryId,
        city: city as string,
        isFeatured,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        search: search as string,
      });

      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "خطأ في جلب العروض" });
    }
  });

  // Get single offer and increment views
  app.get("/api/offers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await storage.getOffer(id);

      if (!offer) {
        return res.status(404).json({ message: "العرض غير موجود" });
      }

      // Increment views
      await storage.incrementOfferViews(id);

      res.json(offer);
    } catch (error) {
      console.error("Error fetching offer:", error);
      res.status(500).json({ message: "خطأ في جلب العرض" });
    }
  });

  // Protected routes - authentication required

  // Get business offers
  app.get("/api/business/offers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const offers = await storage.getOffers({
        businessId: req.user!.id,
        isApproved: undefined, // Show all offers for business owner
      });
      res.json(offers);
    } catch (error) {
      console.error("Error fetching business offers:", error);
      res.status(500).json({ message: "خطأ في جلب عروض المتجر" });
    }
  });

  // Create new offer
  app.post("/api/business/offers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const validatedData = insertOfferSchema.parse({
        ...req.body,
        businessId: req.user!.id,
        startDate: req.body.startDate
          ? new Date(req.body.startDate)
          : new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      });

      const offer = await storage.createOffer(validatedData);
      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: error.errors,
        });
      }
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "خطأ في إنشاء العرض" });
    }
  });

  // Update offer
  app.put("/api/business/offers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const id = parseInt(req.params.id);
      const existingOffer = await storage.getOffer(id);

      if (!existingOffer || existingOffer.businessId !== req.user!.id) {
        return res.status(404).json({ message: "العرض غير موجود" });
      }

      const dataToValidate = { ...req.body };
      if (req.body.startDate) {
        dataToValidate.startDate = new Date(req.body.startDate);
      }
      if (req.body.endDate) {
        dataToValidate.endDate = new Date(req.body.endDate);
      }
      const validatedData = insertOfferSchema.partial().parse(dataToValidate);
      const updatedOffer = await storage.updateOffer(id, validatedData);

      res.json(updatedOffer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: error.errors,
        });
      }
      console.error("Error updating offer:", error);
      res.status(500).json({ message: "خطأ في تحديث العرض" });
    }
  });

  // Delete offer
  app.delete("/api/business/offers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const id = parseInt(req.params.id);
      const existingOffer = await storage.getOffer(id);

      if (!existingOffer || existingOffer.businessId !== req.user!.id) {
        return res.status(404).json({ message: "العرض غير موجود" });
      }

      const deleted = await storage.deleteOffer(id);
      if (deleted) {
        res.json({ message: "تم حذف العرض بنجاح" });
      } else {
        res.status(500).json({ message: "خطأ في حذف العرض" });
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).json({ message: "خطأ في حذف العرض" });
    }
  });

  // Get business statistics
  app.get("/api/business/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const stats = await storage.getOfferStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  // Get public business profile
  app.get("/api/business/profile/:businessId", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const business = await storage.getUserWithBranches(businessId);

      if (!business) {
        return res.status(404).json({ message: "المتجر غير موجود" });
      }

      res.json(business);
    } catch (error) {
      console.error("Error getting business profile:", error);
      res.status(500).json({ message: "خطأ في جلب معلومات المتجر" });
    }
  });

  // Get public business offers
  app.get("/api/business/:businessId/offers", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const offers = await storage.getOffers({
        businessId,
        isActive: true,
        isApproved: true,
      });

      res.json(offers);
    } catch (error) {
      console.error("Error getting business offers:", error);
      res.status(500).json({ message: "خطأ في جلب عروض المتجر" });
    }
  });

  // Customer Favorites API endpoints
  app.post("/api/favorites", async (req, res) => {
    try {
      const { fullName, phoneNumber, city, offerId } = req.body;

      // Check if customer already saved this offer
      const alreadySaved = await storage.checkCustomerFavorite(
        phoneNumber,
        offerId
      );
      if (alreadySaved) {
        return res.status(400).json({ message: "تم حفظ هذا العرض مسبقاً" });
      }

      const favorite = await storage.createCustomerFavorite({
        fullName,
        phoneNumber,
        city,
        offerId,
      });

      res.status(201).json({ message: "تم حفظ العرض بنجاح", favorite });
    } catch (error) {
      console.error("Error saving favorite:", error);
      res.status(500).json({ message: "خطأ في حفظ العرض" });
    }
  });

  // Get customer favorites by phone number
  app.get("/api/favorites/:phoneNumber", async (req, res) => {
    try {
      const phoneNumber = req.params.phoneNumber;
      const favorites = await storage.getCustomerFavorites(phoneNumber);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorites:", error);
      res.status(500).json({ message: "خطأ في جلب العروض المحفوظة" });
    }
  });

  // Get offer favorite count
  app.get("/api/offers/:id/favorites", async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const count = await storage.getOfferFavoriteCount(offerId);
      res.json({ count });
    } catch (error) {
      console.error("Error getting favorite count:", error);
      res.status(500).json({ message: "خطأ في جلب عدد المفضلة" });
    }
  });

  // Branch management routes

  // Get business branches
  app.get("/api/business/branches", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const branches = await storage.getBranches(req.user!.id);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "خطأ في جلب الفروع" });
    }
  });

  // Create new branch
  app.post("/api/business/branches", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const validatedData = insertBranchSchema.parse({
        ...req.body,
        businessId: req.user!.id,
      });

      const branch = await storage.createBranch(validatedData);
      res.status(201).json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: error.errors,
        });
      }
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "خطأ في إنشاء الفرع" });
    }
  });

  // Update branch
  app.put("/api/business/branches/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const id = parseInt(req.params.id);
      const existingBranch = await storage.getBranch(id);

      if (!existingBranch || existingBranch.businessId !== req.user!.id) {
        return res.status(404).json({ message: "الفرع غير موجود" });
      }

      const validatedData = insertBranchSchema.partial().parse(req.body);
      const updatedBranch = await storage.updateBranch(id, validatedData);

      res.json(updatedBranch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: error.errors,
        });
      }
      console.error("Error updating branch:", error);
      res.status(500).json({ message: "خطأ في تحديث الفرع" });
    }
  });

  // Delete branch
  app.delete("/api/business/branches/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const id = parseInt(req.params.id);
      const existingBranch = await storage.getBranch(id);

      if (!existingBranch || existingBranch.businessId !== req.user!.id) {
        return res.status(404).json({ message: "الفرع غير موجود" });
      }

      const deleted = await storage.deleteBranch(id);
      if (deleted) {
        res.json({ message: "تم حذف الفرع بنجاح" });
      } else {
        res.status(500).json({ message: "خطأ في حذف الفرع" });
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      res.status(500).json({ message: "خطأ في حذف الفرع" });
    }
  });

  // Get user profile with branches
  app.get("/api/business/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const userWithBranches = await storage.getUserWithBranches(req.user!.id);
      res.json(userWithBranches);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "خطأ في جلب الملف الشخصي" });
    }
  });

  // Update business profile
  app.put("/api/business/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    try {
      const allowedFields = [
        "businessName",
        "businessDescription",
        "businessCategory",
        "businessCity",
        "businessPhone",
        "businessWebsite",
        "businessWhatsapp",
        "businessInstagram",
        "businessFacebook",
        "businessSnapchat",
        "businessX",
        "businessTiktok",
        "businessLogo",
      ];

      const updates: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      const updatedUser = await storage.updateUser(req.user!.id, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "خطأ في تحديث الملف الشخصي" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  app.get("/api/admin/businesses", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const businesses = await storage.getAllBusinesses();
      res.json(businesses);
    } catch (error: any) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "خطأ في جلب التجار" });
    }
  });

  app.get("/api/admin/offers", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const offers = await storage.getAllOffersForAdmin();
      res.json(offers);
    } catch (error: any) {
      console.error("Error fetching admin offers:", error);
      res.status(500).json({ message: "خطأ في جلب العروض" });
    }
  });

  app.get("/api/admin/customers", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "خطأ في جلب العملاء" });
    }
  });

  app.patch("/api/admin/businesses/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const businessId = parseInt(req.params.id);
      const { isApproved } = req.body;
      const updatedBusiness = await storage.updateBusinessStatus(
        businessId,
        isApproved
      );
      res.json(updatedBusiness);
    } catch (error: any) {
      console.error("Error updating business status:", error);
      res.status(500).json({ message: "خطأ في تحديث حالة التاجر" });
    }
  });

  // Enhanced Admin Routes
  app.post("/api/admin/businesses/:id/reset-password", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const businessId = parseInt(req.params.id);
      const newPassword = Math.random().toString(36).slice(-8);

      // Hash the new password
      const crypto = require("crypto");
      const { promisify } = require("util");
      const scrypt = promisify(crypto.scrypt);
      const salt = crypto.randomBytes(16).toString("hex");
      const buf = await scrypt(newPassword, salt, 64);
      const hashedPassword = `${buf.toString("hex")}.${salt}`;

      await storage.updateUser(businessId, { password: hashedPassword });
      res.json({ newPassword });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "خطأ في إعادة تعيين كلمة المرور" });
    }
  });

  app.patch("/api/admin/businesses/:id/plan", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const businessId = parseInt(req.params.id);
      const { plan } = req.body;

      let offerLimit = 99999;
      if (plan === "basic") offerLimit = 10;
      if (plan === "premium") offerLimit = 50;

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);

      const updatedBusiness = await storage.updateUser(businessId, {
        subscriptionPlan: plan,
        offerLimit,
        subscriptionExpiry: expiry,
      });

      res.json(updatedBusiness);
    } catch (error: any) {
      console.error("Error changing plan:", error);
      res.status(500).json({ message: "خطأ في تغيير الباقة" });
    }
  });

  // Approve offer with email notification
  app.post("/api/admin/offers/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    try {
      const id = parseInt(req.params.id);
      const offer = await storage.getOffer(id);

      if (!offer) {
        return res.status(404).json({ message: "العرض غير موجود" });
      }

      // Update offer to approved
      const updatedOffer = await storage.updateOffer(id, {
        isApproved: true,
      } as any);

      if (updatedOffer) {
        // Send approval email notification
        await emailService.sendOfferApprovalEmail(offer.business.email, {
          businessName: offer.business.businessName || offer.business.username,
          offerTitle: offer.title,
          status: "approved",
        });

        res.json({
          message: "تم قبول العرض وإرسال إشعار للتاجر",
          offer: updatedOffer,
        });
      } else {
        res.status(500).json({ message: "خطأ في تحديث العرض" });
      }
    } catch (error) {
      console.error("Error approving offer:", error);
      res.status(500).json({ message: "خطأ في قبول العرض" });
    }
  });

  // Reject offer with email notification
  app.post("/api/admin/offers/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const offer = await storage.getOffer(id);

      if (!offer) {
        return res.status(404).json({ message: "العرض غير موجود" });
      }

      // Update offer to rejected
      const updatedOffer = await storage.updateOffer(id, {
        isApproved: false,
      } as any);

      if (updatedOffer) {
        // Send rejection email notification
        await emailService.sendOfferApprovalEmail(offer.business.email, {
          businessName: offer.business.businessName || offer.business.username,
          offerTitle: offer.title,
          status: "rejected",
          reason: reason || "لم يتم تحديد سبب الرفض",
        });

        res.json({
          message: "تم رفض العرض وإرسال إشعار للتاجر",
          offer: updatedOffer,
        });
      } else {
        res.status(500).json({ message: "خطأ في تحديث العرض" });
      }
    } catch (error) {
      console.error("Error rejecting offer:", error);
      res.status(500).json({ message: "خطأ في رفض العرض" });
    }
  });

  // Delete offer (admin only)
  app.delete("/api/admin/offers/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteOffer(id);

      if (deleted) {
        res.json({ message: "تم حذف العرض بنجاح" });
      } else {
        res.status(404).json({ message: "العرض غير موجود" });
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).json({ message: "خطأ في حذف العرض" });
    }
  });

  // Additional admin routes for customer management and system oversight
  app.post("/api/admin/customers/:phone/notify", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const { phone } = req.params;
      const { message } = req.body;

      // In a real app, you would send SMS or push notification here
      console.log(`Admin notification sent to ${phone}: ${message}`);

      res.json({ success: true, message: "تم إرسال الإشعار بنجاح" });
    } catch (error: any) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "خطأ في إرسال الإشعار" });
    }
  });

  app.post("/api/admin/customers/:phone/block", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const { phone } = req.params;

      // In a real app, you would add the phone to a blocked list
      console.log(`Admin blocked customer: ${phone}`);

      res.json({ success: true, message: "تم حظر العميل بنجاح" });
    } catch (error: any) {
      console.error("Error blocking customer:", error);
      res.status(500).json({ message: "خطأ في حظر العميل" });
    }
  });

  app.patch("/api/admin/offers/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const offerId = parseInt(req.params.id);
      const updates = req.body;
      const updatedOffer = await storage.updateOffer(offerId, updates);
      res.json(updatedOffer);
    } catch (error: any) {
      console.error("Error updating offer:", error);
      res.status(500).json({ message: "خطأ في تحديث العرض" });
    }
  });

  // Subscription Plan Management API
  app.get("/api/admin/subscription-plans", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "خطأ في جلب باقات الاشتراك" });
    }
  });

  app.post("/api/admin/subscription-plans", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const plan = await storage.createSubscriptionPlan(req.body);
      res.json(plan);
    } catch (error: any) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({ message: "خطأ في إنشاء باقة الاشتراك" });
    }
  });

  app.patch("/api/admin/subscription-plans/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const planId = parseInt(req.params.id);
      const updatedPlan = await storage.updateSubscriptionPlan(
        planId,
        req.body
      );
      res.json(updatedPlan);
    } catch (error: any) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({ message: "خطأ في تحديث باقة الاشتراك" });
    }
  });

  // Feature Management API
  app.get("/api/admin/features", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const features = await storage.getFeatures();
      res.json(features);
    } catch (error: any) {
      console.error("Error fetching features:", error);
      res.status(500).json({ message: "خطأ في جلب الميزات" });
    }
  });

  app.post("/api/admin/features", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const feature = await storage.createFeature(req.body);
      res.json(feature);
    } catch (error: any) {
      console.error("Error creating feature:", error);
      res.status(500).json({ message: "خطأ في إنشاء الميزة" });
    }
  });

  app.patch("/api/admin/plan-features/:planId/:featureId", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const planId = parseInt(req.params.planId);
      const featureId = parseInt(req.params.featureId);
      const { isIncluded, limit } = req.body;

      const updatedPlanFeature = await storage.updatePlanFeature(
        planId,
        featureId,
        isIncluded,
        limit
      );
      if (!updatedPlanFeature) {
        await storage.addFeatureToPlan(planId, featureId, isIncluded, limit);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating plan feature:", error);
      res.status(500).json({ message: "خطأ في تحديث ميزة الباقة" });
    }
  });

  app.delete("/api/admin/subscription-plans/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const planId = parseInt(req.params.id);
      const deleted = await storage.deleteSubscriptionPlan(planId);
      if (deleted) {
        res.json({ success: true, message: "تم حذف الباقة بنجاح" });
      } else {
        res.status(404).json({ message: "الباقة غير موجودة" });
      }
    } catch (error: any) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({ message: "خطأ في حذف الباقة" });
    }
  });

  app.delete("/api/admin/features/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const featureId = parseInt(req.params.id);
      const deleted = await storage.deleteFeature(featureId);
      if (deleted) {
        res.json({ success: true, message: "تم حذف الميزة بنجاح" });
      } else {
        res.status(404).json({ message: "الميزة غير موجودة" });
      }
    } catch (error: any) {
      console.error("Error deleting feature:", error);
      res.status(500).json({ message: "خطأ في حذف الميزة" });
    }
  });

  // AI Analysis endpoints
  app.post("/api/admin/analyze-offer/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    try {
      const offerId = parseInt(req.params.id);
      const { aiAnalysisService } = await import("./ai-service");

      const analysis = await aiAnalysisService.analyzeOffer(offerId);
      if (analysis) {
        res.json({ success: true, analysis });
      } else {
        res.status(500).json({ message: "فشل في تحليل العرض" });
      }
    } catch (error: any) {
      console.error("Error analyzing offer:", error);
      res.status(500).json({ message: "خطأ في تحليل العرض" });
    }
  });

  app.get("/api/admin/offer-analysis/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    try {
      const offerId = parseInt(req.params.id);
      const analysis = await storage.getAiAnalysis(offerId);
      res.json({ analysis });
    } catch (error: any) {
      console.error("Error getting offer analysis:", error);
      res.status(500).json({ message: "خطأ في جلب تحليل العرض" });
    }
  });

  app.post("/api/admin/reanalyze-offer/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    try {
      const offerId = parseInt(req.params.id);
      const { aiAnalysisService } = await import("./ai-service");

      const analysis = await aiAnalysisService.reanalyzeOffer(offerId);
      if (analysis) {
        res.json({ success: true, analysis });
      } else {
        res.status(500).json({ message: "فشل في إعادة تحليل العرض" });
      }
    } catch (error: any) {
      console.error("Error reanalyzing offer:", error);
      res.status(500).json({ message: "خطأ في إعادة تحليل العرض" });
    }
  });

  app.get("/api/admin/offers-with-analysis", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "غير مصرح" });
    }

    try {
      const offers = await storage.getOffersWithAnalysis();
      res.json(offers);
    } catch (error: any) {
      console.error("Error getting offers with analysis:", error);
      res.status(500).json({ message: "خطأ في جلب العروض مع التحليل" });
    }
  });

  // Admin Screen Ads management routes
  app.get("/api/admin/screen-ads", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const ads = await storage.getScreenAds({});
      res.json(ads);
    } catch (error) {
      console.error("Error fetching admin screen ads:", error);
      res.status(500).json({ error: "Failed to fetch screen ads" });
    }
  });

  app.patch("/api/admin/screen-ads/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const adId = parseInt(req.params.id);
      const updated = await storage.updateScreenAd(adId, {
        status: "approved",
        adminNotes: req.body.notes || "تم الموافقة على الحجز",
      });

      if (updated) {
        res.json({ success: true, message: "تم الموافقة على الحجز" });
      } else {
        res.status(404).json({ error: "Ad not found" });
      }
    } catch (error) {
      console.error("Error approving screen ad:", error);
      res.status(500).json({ error: "Failed to approve ad" });
    }
  });

  app.patch("/api/admin/screen-ads/:id/reject", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const adId = parseInt(req.params.id);
      const updated = await storage.updateScreenAd(adId, {
        status: "rejected",
        adminNotes: req.body.notes || "تم رفض الحجز",
      });

      if (updated) {
        res.json({ success: true, message: "تم رفض الحجز" });
      } else {
        res.status(404).json({ error: "Ad not found" });
      }
    } catch (error) {
      console.error("Error rejecting screen ad:", error);
      res.status(500).json({ error: "Failed to reject ad" });
    }
  });

  // Screen Ads routes
  app.get("/api/screen-locations", async (req, res) => {
    try {
      const locations = await storage.getScreenLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching screen locations:", error);
      res.status(500).json({ error: "Failed to fetch screen locations" });
    }
  });

  // Create screen ad booking with file upload
  app.post("/api/screen-ads", upload.single("mediaFile"), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "يجب تسجيل الدخول" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "يرجى رفع ملف إعلاني" });
      }

      const { locationId, startDate, endDate, mediaType, duration, totalCost } =
        req.body;

      if (!locationId || !startDate || !endDate || !mediaType) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
      }

      const mediaUrl = `/uploads/screen-ads/${req.file.filename}`;

      const screenAd = await storage.createScreenAd({
        merchantId: req.user!.id,
        locationId: parseInt(locationId),
        mediaUrl,
        mediaType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: parseInt(duration),
        totalCost: parseFloat(totalCost).toString(),
        status: "pending",
      });

      res.status(201).json({
        success: true,
        message: "تم إرسال طلب الحجز بنجاح",
        screenAd,
      });
    } catch (error) {
      console.error("Error creating screen ad:", error);
      res.status(500).json({ error: "فشل في إنشاء الحجز" });
    }
  });

  // Get user's screen ads
  app.get("/api/screen-ads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "يجب تسجيل الدخول" });
      }

      const ads = await storage.getScreenAds({ merchantId: req.user!.id });
      res.json(ads);
    } catch (error) {
      console.error("Error fetching user screen ads:", error);
      res.status(500).json({ error: "Failed to fetch screen ads" });
    }
  });

  // Admin Screen Location Management
  app.post("/api/admin/screen-locations", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const locationData = insertScreenLocationSchema.parse(req.body);
      const location = await storage.createScreenLocation(locationData);

      res.status(201).json({
        success: true,
        message: "تم إنشاء الموقع بنجاح",
        location,
      });
    } catch (error) {
      console.error("Error creating screen location:", error);
      res.status(500).json({ error: "فشل في إنشاء الموقع" });
    }
  });

  app.put("/api/admin/screen-locations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const locationId = parseInt(req.params.id);
      const updateData = req.body;

      const updated = await storage.updateScreenLocation(
        locationId,
        updateData
      );

      if (updated) {
        res.json({
          success: true,
          message: "تم تحديث الموقع بنجاح",
          location: updated,
        });
      } else {
        res.status(404).json({ error: "الموقع غير موجود" });
      }
    } catch (error) {
      console.error("Error updating screen location:", error);
      res.status(500).json({ error: "فشل في تحديث الموقع" });
    }
  });

  app.delete("/api/admin/screen-locations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const locationId = parseInt(req.params.id);
      const deleted = await storage.deleteScreenLocation(locationId);

      if (deleted) {
        res.json({
          success: true,
          message: "تم حذف الموقع بنجاح",
        });
      } else {
        res.status(404).json({ error: "الموقع غير موجود" });
      }
    } catch (error) {
      console.error("Error deleting screen location:", error);
      res.status(500).json({ error: "فشل في حذف الموقع" });
    }
  });

  app.get("/api/admin/screen-locations/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const locationId = parseInt(req.params.id);
      const location = await storage.getScreenLocation(locationId);

      if (location) {
        res.json(location);
      } else {
        res.status(404).json({ error: "الموقع غير موجود" });
      }
    } catch (error) {
      console.error("Error fetching screen location:", error);
      res.status(500).json({ error: "فشل في جلب بيانات الموقع" });
    }
  });

  app.post("/api/screen-locations", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const location = await storage.createScreenLocation(req.body);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating screen location:", error);
      res.status(500).json({ error: "Failed to create screen location" });
    }
  });

  app.get("/api/screen-ads", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const params: any = {};

      if (req.user?.role === "business") {
        params.merchantId = req.user.id;
      }

      const ads = await storage.getScreenAds(params);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching screen ads:", error);
      res.status(500).json({ error: "Failed to fetch screen ads" });
    }
  });

  app.post("/api/screen-ads", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "business") {
        return res.status(403).json({ error: "Business account required" });
      }

      const adData = {
        ...req.body,
        merchantId: req.user.id,
        status: "pending",
      };

      const ad = await storage.createScreenAd(adData);
      res.status(201).json(ad);
    } catch (error) {
      console.error("Error creating screen ad:", error);
      res.status(500).json({ error: "Failed to create screen ad" });
    }
  });

  // Enhanced Screen Pricing Options endpoints
  app.get("/api/screen-pricing-options", async (req, res) => {
    try {
      const locationId = req.query.locationId
        ? parseInt(req.query.locationId as string)
        : undefined;
      const options = await storage.getScreenPricingOptions(locationId);
      res.json(options);
    } catch (error) {
      console.error("Error fetching screen pricing options:", error);
      res.status(500).json({ error: "Failed to fetch pricing options" });
    }
  });

  app.post("/api/screen-pricing-options", async (req, res) => {
    try {
      const validatedData = insertScreenPricingOptionSchema.parse(req.body);
      const option = await storage.createScreenPricingOption(validatedData);
      res.status(201).json(option);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating screen pricing option:", error);
      res.status(500).json({ error: "Failed to create pricing option" });
    }
  });

  // Enhanced Screen Booking System endpoints
  app.get("/api/screen-bookings", async (req, res) => {
    try {
      const params = {
        merchantId: req.query.merchantId
          ? parseInt(req.query.merchantId as string)
          : undefined,
        locationId: req.query.locationId
          ? parseInt(req.query.locationId as string)
          : undefined,
        status: req.query.status as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const bookings = await storage.getScreenBookings(params);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching screen bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/screen-bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertScreenBookingSchema.parse({
        ...req.body,
        merchantId: req.user.id,
        status: "pending",
        statusAr: "قيد المراجعة",
      });

      const booking = await storage.createScreenBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating screen booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.post("/api/screen-bookings/:id/approve", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const { adminNotes } = req.body;
      const booking = await storage.approveScreenBooking(id, adminNotes);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Generate invoice for approved booking
      const invoice = await storage.generateInvoiceForBooking(id);

      res.json({ booking, invoice });
    } catch (error) {
      console.error("Error approving screen booking:", error);
      res.status(500).json({ error: "Failed to approve booking" });
    }
  });

  app.post("/api/screen-bookings/:id/reject", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const { rejectionReason } = req.body;
      const booking = await storage.rejectScreenBooking(id, rejectionReason);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error rejecting screen booking:", error);
      res.status(500).json({ error: "Failed to reject booking" });
    }
  });

  // Merchant Profile Management endpoints
  app.get("/api/merchant-profiles/me", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const profile = await storage.getMerchantProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching merchant profile:", error);
      res.status(500).json({ error: "Failed to fetch merchant profile" });
    }
  });

  app.post("/api/merchant-profiles", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertMerchantProfileSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const profile = await storage.createMerchantProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating merchant profile:", error);
      res.status(500).json({ error: "Failed to create merchant profile" });
    }
  });

  // Invoice Management endpoints
  app.get("/api/invoices", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const params = {
        merchantId:
          req.user.role === "admin"
            ? req.query.merchantId
              ? parseInt(req.query.merchantId as string)
              : undefined
            : req.user.id,
        status: req.query.status as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const invoices = await storage.getInvoices(params);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Phase 4: Analytics Dashboard endpoints
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get total screens
      const totalScreensResult = await db
        .select({
          total: sql<number>`SUM(${screenLocations.numberOfScreens})`,
        })
        .from(screenLocations)
        .where(eq(screenLocations.isActive, true));

      const totalScreens = totalScreensResult[0]?.total || 0;

      // Get active bookings count
      const activeBookingsResult = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(screenBookings)
        .where(eq(screenBookings.status, "approved"));

      const bookedScreens = activeBookingsResult[0]?.count || 0;
      const availableScreens = totalScreens - bookedScreens;

      // Get revenue data from paid invoices
      const revenueResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(invoices)
        .where(eq(invoices.status, "paid"));

      const totalRevenue = revenueResult[0]?.total || "0";

      // Monthly revenue (last 30 days)
      const monthlyRevenueResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.status, "paid"),
            gte(invoices.paidDate, sql`NOW() - INTERVAL '30 days'`)
          )
        );

      const monthlyRevenue = monthlyRevenueResult[0]?.total || "0";

      // Weekly revenue (last 7 days)
      const weeklyRevenueResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.status, "paid"),
            gte(invoices.paidDate, sql`NOW() - INTERVAL '7 days'`)
          )
        );

      const weeklyRevenue = weeklyRevenueResult[0]?.total || "0";

      // Most booked locations
      const mostBookedLocations = await db
        .select({
          locationId: screenBookings.locationId,
          locationName: screenLocations.name,
          bookingCount: sql<number>`COUNT(*)`,
        })
        .from(screenBookings)
        .innerJoin(
          screenLocations,
          eq(screenBookings.locationId, screenLocations.id)
        )
        .where(eq(screenBookings.status, "approved"))
        .groupBy(screenBookings.locationId, screenLocations.name)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Most active merchants
      const mostActiveMerchants = await db
        .select({
          merchantId: screenBookings.merchantId,
          merchantName: users.businessName,
          bookingCount: sql<number>`COUNT(*)`,
          totalSpent: sql<string>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(screenBookings)
        .innerJoin(users, eq(screenBookings.merchantId, users.id))
        .leftJoin(invoices, eq(screenBookings.id, invoices.bookingId))
        .where(eq(screenBookings.status, "approved"))
        .groupBy(screenBookings.merchantId, users.businessName)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      res.json({
        totalScreens,
        bookedScreens,
        availableScreens,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        mostBookedLocations,
        mostActiveMerchants,
      });
    } catch (error) {
      console.error("Error fetching analytics dashboard:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  // Phase 4: Merchant Notifications endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const unreadOnly = req.query.unreadOnly === "true";
      const notifications = await db
        .select()
        .from(merchantNotifications)
        .where(
          unreadOnly
            ? and(
                eq(merchantNotifications.merchantId, req.user.id),
                eq(merchantNotifications.isRead, false)
              )
            : eq(merchantNotifications.merchantId, req.user.id)
        )
        .orderBy(desc(merchantNotifications.createdAt));

      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid notification ID" });
      }

      const result = await db
        .update(merchantNotifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(merchantNotifications.id, id),
            eq(merchantNotifications.merchantId, req.user.id)
          )
        );

      if ((result.rowCount || 0) > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Notification not found" });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  // Phase 4: Campaign Media Management endpoints
  app.get("/api/campaign-media", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const bookingId = req.query.bookingId
        ? parseInt(req.query.bookingId as string)
        : undefined;
      const merchantId =
        req.user.role === "admin"
          ? req.query.merchantId
            ? parseInt(req.query.merchantId as string)
            : undefined
          : req.user.id;

      let query = db.select().from(campaignMedia);
      const conditions: any[] = [];

      if (bookingId) {
        conditions.push(eq(campaignMedia.bookingId, bookingId));
      }

      if (merchantId) {
        conditions.push(eq(campaignMedia.merchantId, merchantId));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const media = await query.orderBy(desc(campaignMedia.uploadedAt));
      res.json(media);
    } catch (error) {
      console.error("Error fetching campaign media:", error);
      res.status(500).json({ error: "Failed to fetch campaign media" });
    }
  });

  app.post("/api/campaign-media/:id/review", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid media ID" });
      }

      const { status, adminNotes } = req.body;

      const [media] = await db
        .update(campaignMedia)
        .set({
          uploadStatus: status,
          uploadStatusAr: status === "approved" ? "موافق عليه" : "مرفوض",
          adminNotes,
          reviewedAt: new Date(),
          reviewedBy: req.user.id,
          updatedAt: new Date(),
        })
        .where(eq(campaignMedia.id, id))
        .returning();

      if (media) {
        res.json(media);
      } else {
        res.status(404).json({ error: "Media not found" });
      }
    } catch (error) {
      console.error("Error reviewing campaign media:", error);
      res.status(500).json({ error: "Failed to review media" });
    }
  });

  // Phase 4: Booking Logs endpoints
  app.get("/api/bookings/:id/logs", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }

      const logs = await db
        .select()
        .from(bookingLogs)
        .leftJoin(users, eq(bookingLogs.adminId, users.id))
        .where(eq(bookingLogs.bookingId, bookingId))
        .orderBy(desc(bookingLogs.timestamp));

      res.json(logs);
    } catch (error) {
      console.error("Error fetching booking logs:", error);
      res.status(500).json({ error: "Failed to fetch booking logs" });
    }
  });

  app.post("/api/bookings/:id/logs", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }

      const { action, actionAr, notes, notesAr } = req.body;

      const [log] = await db
        .insert(bookingLogs)
        .values({
          bookingId,
          adminId: req.user.id,
          action,
          actionAr,
          notes,
          notesAr,
        })
        .returning();

      res.status(201).json(log);
    } catch (error) {
      console.error("Error adding booking log:", error);
      res.status(500).json({ error: "Failed to add booking log" });
    }
  });

  // Phase 4: Smart Availability Checker endpoint
  app.post("/api/check-availability", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { locationId, startDate, endDate, excludeBookingId } = req.body;

      if (!locationId || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const conditions = [
        eq(screenBookings.locationId, locationId),
        eq(screenBookings.status, "approved"),
        or(
          and(
            lte(screenBookings.campaignStartDate, start),
            gte(screenBookings.campaignEndDate, start)
          ),
          and(
            lte(screenBookings.campaignStartDate, end),
            gte(screenBookings.campaignEndDate, end)
          ),
          and(
            gte(screenBookings.campaignStartDate, start),
            lte(screenBookings.campaignEndDate, end)
          )
        ),
      ];

      if (excludeBookingId) {
        conditions.push(ne(screenBookings.id, excludeBookingId));
      }

      const conflictingBookings = await db
        .select()
        .from(screenBookings)
        .where(and(...conditions));

      const isAvailable = conflictingBookings.length === 0;

      res.json({
        isAvailable,
        conflictingBookings: isAvailable ? [] : conflictingBookings,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Phase 4: Merchant Campaign History endpoint
  app.get("/api/merchant/campaign-history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const merchantId = req.user.id;

      // Get merchant bookings
      const bookings = await storage.getScreenBookings({ merchantId });

      // Get merchant invoices
      const invoices = await storage.getInvoices({ merchantId });

      // Calculate total spent
      const totalSpentResult = await db
        .select({
          total: sql<string>`COALESCE(SUM(CAST(${invoices.totalAmount} AS DECIMAL)), 0)`,
        })
        .from(invoices)
        .where(
          and(eq(invoices.merchantId, merchantId), eq(invoices.status, "paid"))
        );

      const totalSpent = totalSpentResult[0]?.total || "0";

      // Get campaign statistics
      const statsResult = await db
        .select({
          status: screenBookings.status,
          count: sql<number>`COUNT(*)`,
        })
        .from(screenBookings)
        .where(eq(screenBookings.merchantId, merchantId))
        .groupBy(screenBookings.status);

      const campaignStats = {
        total: bookings.length,
        completed:
          statsResult.find((s) => s.status === "completed")?.count || 0,
        running: statsResult.find((s) => s.status === "approved")?.count || 0,
        cancelled: statsResult.find((s) => s.status === "rejected")?.count || 0,
      };

      res.json({
        bookings,
        invoices,
        totalSpent,
        campaignStats,
      });
    } catch (error) {
      console.error("Error fetching campaign history:", error);
      res.status(500).json({ error: "Failed to fetch campaign history" });
    }
  });

  // Phase 5: Contact Form API
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactFormSchema.parse(req.body);

      const [contactForm] = await db
        .insert(contactForms)
        .values({
          ...validatedData,
          status: "new",
        })
        .returning();

      // Send notification email to admin
      try {
        await emailService.sendContactFormNotification(
          process.env.ADMIN_EMAIL || "admin@laqtoha.com",
          {
            name: contactForm.name,
            email: contactForm.email,
            message: contactForm.message,
            submittedAt: contactForm.createdAt!.toISOString(),
          }
        );
      } catch (emailError) {
        console.error("Failed to send contact form notification:", emailError);
      }

      res.status(201).json(contactForm);
    } catch (error) {
      console.error("Error creating contact form:", error);
      res.status(400).json({ error: "Invalid contact form data" });
    }
  });

  // Phase 5: Merchant Registration API
  app.post(
    "/api/merchant-register",
    upload.single("logo"),
    async (req, res) => {
      try {
        const { companyName, commercialRegNumber, phone, email } = req.body;

        // Check if email already exists
        const existingRegistration = await db
          .select()
          .from(merchantRegistrations)
          .where(eq(merchantRegistrations.email, email))
          .limit(1);

        if (existingRegistration.length > 0) {
          return res
            .status(400)
            .json({ error: "البريد الإلكتروني مسجل مسبقاً" });
        }

        let logoUrl = null;
        if (req.file) {
          logoUrl = `/uploads/logos/${req.file.filename}`;
        }

        const registrationData = {
          companyName,
          commercialRegNumber,
          phone,
          email,
          logoUrl,
          status: "pending" as const,
        };

        const [registration] = await db
          .insert(merchantRegistrations)
          .values(registrationData)
          .returning();

        res.status(201).json(registration);
      } catch (error) {
        console.error("Error creating merchant registration:", error);
        res.status(400).json({ error: "فشل في تسجيل البيانات" });
      }
    }
  );

  // Admin APIs for Phase 5
  app.get("/api/admin/contact-forms", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const forms = await db
        .select()
        .from(contactForms)
        .orderBy(desc(contactForms.createdAt));

      res.json(forms);
    } catch (error) {
      console.error("Error fetching contact forms:", error);
      res.status(500).json({ error: "Failed to fetch contact forms" });
    }
  });

  app.post("/api/admin/contact-forms/:id/reply", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;
      const { reply } = req.body;

      const [form] = await db
        .select()
        .from(contactForms)
        .where(eq(contactForms.id, parseInt(id)))
        .limit(1);

      if (!form) {
        return res.status(404).json({ error: "Contact form not found" });
      }

      await db
        .update(contactForms)
        .set({
          adminReply: reply,
          status: "replied",
          repliedAt: new Date(),
        })
        .where(eq(contactForms.id, parseInt(id)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error replying to contact form:", error);
      res.status(500).json({ error: "Failed to send reply" });
    }
  });

  app.post("/api/admin/contact-forms/:id/resolve", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;

      await db
        .update(contactForms)
        .set({ status: "resolved" })
        .where(eq(contactForms.id, parseInt(id)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error resolving contact form:", error);
      res.status(500).json({ error: "Failed to resolve" });
    }
  });

  app.get("/api/admin/merchant-registrations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const registrations = await db
        .select()
        .from(merchantRegistrations)
        .orderBy(desc(merchantRegistrations.createdAt));

      res.json(registrations);
    } catch (error) {
      console.error("Error fetching merchant registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  app.post(
    "/api/admin/merchant-registrations/:id/approve",
    async (req, res) => {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.sendStatus(401);
      }

      try {
        const { id } = req.params;
        const { notes } = req.body;

        await db
          .update(merchantRegistrations)
          .set({
            status: "approved",
            adminNotes: notes,
            approvedAt: new Date(),
          })
          .where(eq(merchantRegistrations.id, parseInt(id)));

        res.json({ success: true });
      } catch (error) {
        console.error("Error approving merchant registration:", error);
        res.status(500).json({ error: "Failed to approve registration" });
      }
    }
  );

  app.post("/api/admin/merchant-registrations/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;
      const { notes } = req.body;

      await db
        .update(merchantRegistrations)
        .set({
          status: "rejected",
          adminNotes: notes,
          rejectedAt: new Date(),
        })
        .where(eq(merchantRegistrations.id, parseInt(id)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting merchant registration:", error);
      res.status(500).json({ error: "Failed to reject registration" });
    }
  });

  // Screen locations API with filtering support
  app.get("/api/screen-locations", async (req, res) => {
    try {
      const {
        city,
        screenType,
        minPrice,
        maxPrice,
        minRating,
        category,
        availability,
      } = req.query;

      // Build query conditions
      const conditions = [eq(screenLocations.isActive, true)];

      if (city && typeof city === "string") {
        conditions.push(
          or(eq(screenLocations.city, city), eq(screenLocations.cityAr, city))
        );
      }

      if (screenType && typeof screenType === "string") {
        conditions.push(
          or(
            eq(screenLocations.screenType, screenType),
            eq(screenLocations.screenTypeAr, screenType)
          )
        );
      }

      // Get locations with average ratings
      const locationsQuery = db
        .select({
          id: screenLocations.id,
          name: screenLocations.name,
          nameAr: screenLocations.nameAr,
          address: screenLocations.address,
          addressAr: screenLocations.addressAr,
          city: screenLocations.city,
          cityAr: screenLocations.cityAr,
          neighborhood: screenLocations.neighborhood,
          neighborhoodAr: screenLocations.neighborhoodAr,
          latitude: screenLocations.latitude,
          longitude: screenLocations.longitude,
          googleMapsLink: screenLocations.googleMapsLink,
          workingHours: screenLocations.workingHours,
          workingHoursAr: screenLocations.workingHoursAr,
          numberOfScreens: screenLocations.numberOfScreens,
          screenType: screenLocations.screenType,
          screenTypeAr: screenLocations.screenTypeAr,
          dailyPrice: screenLocations.dailyPrice,
          specialNotes: screenLocations.specialNotes,
          specialNotesAr: screenLocations.specialNotesAr,
          locationPhoto: screenLocations.locationPhoto,
          isActive: screenLocations.isActive,
          createdAt: screenLocations.createdAt,
          updatedAt: screenLocations.updatedAt,
          // Calculate average rating
          avgRating:
            sql<number>`COALESCE(AVG(${locationReviews.overallRating}), 0)`.as(
              "avgRating"
            ),
          reviewCount: sql<number>`COUNT(${locationReviews.id})`.as(
            "reviewCount"
          ),
        })
        .from(screenLocations)
        .leftJoin(
          locationReviews,
          eq(locationReviews.locationId, screenLocations.id)
        )
        .where(and(...conditions))
        .groupBy(screenLocations.id);

      const locations = await locationsQuery;

      // Get pricing options for each location and apply price filters
      const locationsWithPricing = await Promise.all(
        locations.map(async (location) => {
          const pricingOptions = await db
            .select()
            .from(screenPricingOptions)
            .where(eq(screenPricingOptions.locationId, location.id));

          return {
            ...location,
            pricingOptions,
            avgRating: Number(location.avgRating) || 0,
            reviewCount: Number(location.reviewCount) || 0,
          };
        })
      );

      // Apply filters after data enrichment
      let filteredLocations = locationsWithPricing;

      // Apply price filter based on daily price
      if (minPrice && typeof minPrice === "string") {
        const minPriceNum = parseFloat(minPrice);
        filteredLocations = filteredLocations.filter(
          (loc) => parseFloat(loc.dailyPrice) >= minPriceNum
        );
      }

      if (maxPrice && typeof maxPrice === "string") {
        const maxPriceNum = parseFloat(maxPrice);
        filteredLocations = filteredLocations.filter(
          (loc) => parseFloat(loc.dailyPrice) <= maxPriceNum
        );
      }

      // Apply rating filter
      if (minRating && typeof minRating === "string") {
        const minRatingNum = parseFloat(minRating);
        filteredLocations = filteredLocations.filter(
          (loc) => loc.avgRating >= minRatingNum
        );
      }

      // For availability filter (simplified - checks if location is active)
      if (availability === "available") {
        filteredLocations = filteredLocations.filter((loc) => loc.isActive);
      }

      res.json({
        locations: filteredLocations,
        total: filteredLocations.length,
        filters: {
          city,
          screenType,
          minPrice,
          maxPrice,
          minRating,
          category,
          availability,
        },
      });
    } catch (error) {
      console.error("Error fetching screen locations:", error);
      res.status(500).json({ error: "Failed to fetch screen locations" });
    }
  });

  // Subscription Plans API
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true))
        .orderBy(subscriptionPlans.displayOrder);

      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/merchant/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { planId } = req.body;
      const userId = req.user.id;

      // Check if plan exists
      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId));

      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }

      // Cancel existing subscription if any
      await db
        .update(merchantSubscriptions)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(merchantSubscriptions.merchantId, userId),
            eq(merchantSubscriptions.status, "active")
          )
        );

      // Create new subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      const [newSubscription] = await db
        .insert(merchantSubscriptions)
        .values({
          merchantId: userId,
          planId: planId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          status: "active",
          autoRenew: true,
        })
        .returning();

      res.json({
        success: true,
        subscription: newSubscription,
        message: "Successfully subscribed to plan",
      });
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      res.status(500).json({ error: "Failed to subscribe to plan" });
    }
  });

  app.get("/api/merchant/subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const userId = req.user.id;

      const [subscription] = await db
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
            maxBookings: subscriptionPlans.maxBookings,
            premiumSupport: subscriptionPlans.premiumSupport,
            advancedReports: subscriptionPlans.advancedReports,
            features: subscriptionPlans.features,
          },
        })
        .from(merchantSubscriptions)
        .innerJoin(
          subscriptionPlans,
          eq(merchantSubscriptions.planId, subscriptionPlans.id)
        )
        .where(
          and(
            eq(merchantSubscriptions.merchantId, userId),
            eq(merchantSubscriptions.status, "active")
          )
        )
        .orderBy(desc(merchantSubscriptions.createdAt));

      if (!subscription) {
        // Return free plan as default
        return res.json({
          plan: {
            name: "Free",
            nameAr: "مجاني",
            price: 0,
            maxBookings: 1,
            premiumSupport: false,
            advancedReports: false,
            features: [],
          },
          status: "active",
          isFree: true,
        });
      }

      res.json(subscription);
    } catch (error) {
      console.error("Error fetching merchant subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Subscription Plans API
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT * FROM subscription_plans WHERE is_active = true ORDER BY sort_order`
      );
      const plans = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        nameAr: row.name_ar,
        description: row.description,
        descriptionAr: row.description_ar,
        price: row.price,
        currency: row.currency,
        billingPeriod: row.billing_period,
        offerLimit: 99999,
        isActive: row.is_active,
        sortOrder: row.sort_order,
        color: row.color,
        icon: row.icon,
        isPopular: row.is_popular,
      }));
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ error: "فشل في جلب خطط الاشتراك" });
    }
  });

  // Subscribe to a plan
  app.post("/api/merchant/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "تسجيل الدخول مطلوب" });
    }

    try {
      const { planId } = req.body;
      const userId = req.user!.id;

      // Check if plan exists
      const planResult = await db.execute(
        sql`SELECT * FROM subscription_plans WHERE id = ${planId}`
      );
      if (planResult.rows.length === 0) {
        return res.status(404).json({ error: "الخطة غير موجودة" });
      }

      // Cancel existing subscription if any
      await db.execute(sql`
        UPDATE merchant_subscriptions 
        SET status = 'cancelled', cancelled_at = NOW() 
        WHERE merchant_id = ${userId} AND status = 'active'
      `);

      // Create new subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await db.execute(sql`
        INSERT INTO merchant_subscriptions (merchant_id, plan_id, start_date, end_date, status, auto_renew)
        VALUES (${userId}, ${planId}, NOW(), ${endDate.toISOString()}, 'active', true)
      `);

      res.status(201).json({
        success: true,
        message: "تم الاشتراك بنجاح",
      });
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(500).json({ error: "فشل في الاشتراك" });
    }
  });

  // Get current merchant subscription
  app.get("/api/merchant/subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "تسجيل الدخول مطلوب" });
    }

    try {
      const userId = req.user!.id;

      const result = await db.execute(sql`
        SELECT 
          ms.id, ms.start_date, ms.end_date, ms.status, ms.auto_renew,
          sp.id as plan_id, sp.name, sp.name_ar, sp.description, sp.description_ar,
          sp.price, sp.currency, sp.billing_period, sp.offer_limit, sp.is_active,
          sp.sort_order, sp.color, sp.icon, sp.is_popular
        FROM merchant_subscriptions ms
        INNER JOIN subscription_plans sp ON ms.plan_id = sp.id
        WHERE ms.merchant_id = ${userId} AND ms.status = 'active'
        ORDER BY ms.created_at DESC
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        // Return free plan as default
        const freePlanResult = await db.execute(
          sql`SELECT * FROM subscription_plans WHERE name = 'Free' LIMIT 1`
        );
        if (freePlanResult.rows.length > 0) {
          const freePlan = freePlanResult.rows[0];
          return res.json({
            status: "active",
            plan: {
              id: freePlan.id,
              name: freePlan.name,
              nameAr: freePlan.name_ar,
              description: freePlan.description,
              descriptionAr: freePlan.description_ar,
              price: freePlan.price,
              currency: freePlan.currency,
              billingPeriod: freePlan.billing_period,
              offerLimit: 99999,
              isActive: freePlan.is_active,
              sortOrder: freePlan.sort_order,
              color: freePlan.color,
              icon: freePlan.icon,
              isPopular: freePlan.is_popular,
            },
            isFree: true,
          });
        }
      }

      const subscription = result.rows[0];
      res.json({
        id: subscription.id,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        status: subscription.status,
        autoRenew: subscription.auto_renew,
        plan: {
          id: subscription.plan_id,
          name: subscription.name,
          nameAr: subscription.name_ar,
          description: subscription.description,
          descriptionAr: subscription.description_ar,
          price: subscription.price,
          currency: subscription.currency,
          billingPeriod: subscription.billing_period,
          offerLimit: 99999,
          isActive: subscription.is_active,
          sortOrder: subscription.sort_order,
          color: subscription.color,
          icon: subscription.icon,
          isPopular: subscription.is_popular,
        },
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: "فشل في جلب بيانات الاشتراك" });
    }
  });

  // Reviews and Ratings API
  app.post("/api/reviews/submit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "تسجيل الدخول مطلوب" });
    }

    try {
      const userId = req.user!.id;
      const {
        locationId,
        bookingId,
        overallRating,
        visibility,
        performance,
        traffic,
        valueForMoney,
        title,
        comment,
      } = req.body;

      // Validate ratings are between 1-5
      const ratings = [
        overallRating,
        visibility,
        performance,
        traffic,
        valueForMoney,
      ];
      if (ratings.some((rating) => rating < 1 || rating > 5)) {
        return res
          .status(400)
          .json({ error: "التقييمات يجب أن تكون بين 1 و 5" });
      }

      // Check if user has completed booking for this location (permission check)
      if (bookingId) {
        const bookingResult = await db.execute(sql`
          SELECT * FROM screen_bookings 
          WHERE id = ${bookingId} AND merchant_id = ${userId} AND status = 'completed'
        `);

        if (bookingResult.rows.length === 0) {
          return res.status(403).json({
            error: "يمكنك فقط تقييم المواقع التي حجزتها وأكملت حملاتها",
          });
        }
      }

      // Check if user already reviewed this booking
      const existingReview = await db.execute(sql`
        SELECT * FROM screen_reviews 
        WHERE user_id = ${userId} AND booking_id = ${bookingId}
      `);

      if (existingReview.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "لقد قمت بتقييم هذا الحجز مسبقاً" });
      }

      // Insert review
      await db.execute(sql`
        INSERT INTO screen_reviews (
          location_id, user_id, booking_id, overall_rating, visibility, 
          performance, traffic, value_for_money, title, comment, is_verified
        ) VALUES (
          ${locationId}, ${userId}, ${bookingId}, ${overallRating}, ${visibility},
          ${performance}, ${traffic}, ${valueForMoney}, ${title}, ${comment}, ${
        bookingId ? true : false
      }
        )
      `);

      res.status(201).json({
        success: true,
        message: "تم إرسال التقييم بنجاح",
      });
    } catch (error) {
      console.error("Review submission error:", error);
      res.status(500).json({ error: "فشل في إرسال التقييم" });
    }
  });

  // Get reviews for a location
  app.get("/api/locations/:id/reviews", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);

      // Get reviews with user info
      const reviewsResult = await db.execute(sql`
        SELECT 
          sr.id, sr.overall_rating, sr.visibility, sr.performance, sr.traffic, 
          sr.value_for_money, sr.title, sr.comment, sr.is_verified, sr.created_at,
          u.username, u.email,
          sb.id as booking_id
        FROM screen_reviews sr
        INNER JOIN users u ON sr.user_id = u.id
        LEFT JOIN screen_bookings sb ON sr.booking_id = sb.id
        WHERE sr.location_id = ${locationId} AND sr.is_approved = true
        ORDER BY sr.created_at DESC
      `);

      // Calculate average ratings
      const avgResult = await db.execute(sql`
        SELECT 
          AVG(overall_rating)::DECIMAL(3,2) as avg_overall,
          AVG(visibility)::DECIMAL(3,2) as avg_visibility,
          AVG(performance)::DECIMAL(3,2) as avg_performance,
          AVG(traffic)::DECIMAL(3,2) as avg_traffic,
          AVG(value_for_money)::DECIMAL(3,2) as avg_value,
          COUNT(*) as total_reviews
        FROM screen_reviews 
        WHERE location_id = ${locationId} AND is_approved = true
      `);

      const reviews = reviewsResult.rows.map((row) => ({
        id: row.id,
        overallRating: row.overall_rating,
        visibility: row.visibility,
        performance: row.performance,
        traffic: row.traffic,
        valueForMoney: row.value_for_money,
        title: row.title,
        comment: row.comment,
        isVerified: row.is_verified,
        createdAt: row.created_at,
        user: {
          username: row.username,
          email: row.email,
        },
        bookingId: row.booking_id,
      }));

      const averages = avgResult.rows[0] || {
        avg_overall: 0,
        avg_visibility: 0,
        avg_performance: 0,
        avg_traffic: 0,
        avg_value: 0,
        total_reviews: 0,
      };

      res.json({
        reviews,
        averages: {
          overall: parseFloat(averages.avg_overall || 0),
          visibility: parseFloat(averages.avg_visibility || 0),
          performance: parseFloat(averages.avg_performance || 0),
          traffic: parseFloat(averages.avg_traffic || 0),
          valueForMoney: parseFloat(averages.avg_value || 0),
        },
        totalReviews: parseInt(averages.total_reviews),
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "فشل في جلب التقييمات" });
    }
  });

  // Get merchant's reviewable bookings
  app.get("/api/merchant/reviewable-bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "تسجيل الدخول مطلوب" });
    }

    try {
      const userId = req.user!.id;

      const result = await db.execute(sql`
        SELECT 
          sb.id, sb.campaign_title, sb.start_date, sb.end_date,
          sl.name, sl.name_ar, sl.address, sl.address_ar,
          sr.id as review_id
        FROM screen_bookings sb
        INNER JOIN screen_locations sl ON sb.location_id = sl.id
        LEFT JOIN screen_reviews sr ON sb.id = sr.booking_id
        WHERE sb.merchant_id = ${userId} 
          AND sb.status = 'completed'
          AND sr.id IS NULL
        ORDER BY sb.end_date DESC
      `);

      const reviewableBookings = result.rows.map((row) => ({
        id: row.id,
        campaignTitle: row.campaign_title,
        startDate: row.start_date,
        endDate: row.end_date,
        location: {
          name: row.name,
          nameAr: row.name_ar,
          address: row.address,
          addressAr: row.address_ar,
        },
        hasReview: false,
      }));

      res.json(reviewableBookings);
    } catch (error) {
      console.error("Error fetching reviewable bookings:", error);
      res.status(500).json({ error: "فشل في جلب الحجوزات القابلة للتقييم" });
    }
  });

  // Admin: Moderate reviews
  app.put("/api/admin/reviews/:id/moderate", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ error: "صلاحيات المدير مطلوبة" });
    }

    try {
      const reviewId = parseInt(req.params.id);
      const { isApproved, adminNotes } = req.body;

      await db.execute(sql`
        UPDATE screen_reviews 
        SET is_approved = ${isApproved}, admin_notes = ${adminNotes}, updated_at = NOW()
        WHERE id = ${reviewId}
      `);

      res.json({
        success: true,
        message: "تم تحديث حالة التقييم بنجاح",
      });
    } catch (error) {
      console.error("Review moderation error:", error);
      res.status(500).json({ error: "فشل في تحديث التقييم" });
    }
  });

  // Initialize data
  seedCategories();
  seedScreenLocations();

  const httpServer = createServer(app);
  return httpServer;
}

async function seedCategories() {
  try {
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      const defaultCategories = [
        {
          name: "Restaurants",
          nameAr: "المطاعم",
          emoji: "🍽️",
          slug: "restaurants",
          description: "مطاعم وأطعمة",
        },
        {
          name: "Travel & Tourism",
          nameAr: "السفر والسياحة",
          emoji: "✈️",
          slug: "travel-tourism",
          description: "سفر وسياحة",
        },
        {
          name: "Cafes",
          nameAr: "المقاهي",
          emoji: "☕",
          slug: "cafes",
          description: "مقاهي ومشروبات",
        },
        {
          name: "Clinics & Beauty",
          nameAr: "العيادات والتجميل",
          emoji: "💆‍♀️",
          slug: "clinics-beauty",
          description: "عيادات وتجميل",
        },
        {
          name: "Online Stores",
          nameAr: "المتاجر الإلكترونية",
          emoji: "🛍️",
          slug: "online-stores",
          description: "متاجر إلكترونية",
        },
        {
          name: "Education",
          nameAr: "الدورات والتعليم",
          emoji: "🧠",
          slug: "education",
          description: "دورات وتعليم",
        },
        {
          name: "Today's Deals",
          nameAr: "عروض اليوم",
          emoji: "🔥",
          slug: "todays-deals",
          description: "عروض محدودة الوقت",
        },
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
      console.log("Default categories seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

async function seedScreenLocations() {
  try {
    const existingLocations = await storage.getScreenLocations();
    if (existingLocations.length > 0) {
      console.log("Screen locations already exist, skipping seed");
      return;
    }

    const locations = [
      {
        name: "Boulevard Cafe",
        nameAr: "مقهى البوليفارد",
        address: "King Fahd Road, Olaya District",
        addressAr: "طريق الملك فهد، حي العليا",
        city: "Riyadh",
        cityAr: "الرياض",
        neighborhood: "Olaya",
        neighborhoodAr: "العليا",
        latitude: "24.7136",
        longitude: "46.6753",
        workingHours: "6:00 AM - 12:00 AM",
        workingHoursAr: "6:00 ص - 12:00 ص",
        numberOfScreens: 2,
        screenType: "TV",
        screenTypeAr: "شاشة تلفزيون",
        dailyPrice: "85",
        specialNotes: "Popular breakfast and evening spot",
        specialNotesAr: "مكان شعبي للإفطار والمساء",
        isActive: true,
      },
      {
        name: "Al Andalus Mall Restaurant",
        nameAr: "مطعم الأندلس مول",
        address: "Al Andalus Mall, Prince Mohammed bin Abdulaziz Road",
        addressAr: "الأندلس مول، طريق الأمير محمد بن عبدالعزيز",
        city: "Riyadh",
        cityAr: "الرياض",
        neighborhood: "Rabwah",
        neighborhoodAr: "الربوة",
        latitude: "24.7220",
        longitude: "46.6850",
        workingHours: "10:00 AM - 11:00 PM",
        workingHoursAr: "10:00 ص - 11:00 م",
        numberOfScreens: 4,
        screenType: "LED Wall",
        screenTypeAr: "جدار LED",
        dailyPrice: "120",
        specialNotes: "Food court area with family seating",
        specialNotesAr: "منطقة المطاعم مع جلسات عائلية",
        isActive: true,
      },
      {
        name: "Central Park Cafe",
        nameAr: "كافيه سنترال بارك",
        address: "Central Park, King Abdulaziz Road",
        addressAr: "سنترال بارك، طريق الملك عبدالعزيز",
        city: "Riyadh",
        cityAr: "الرياض",
        neighborhood: "Malaz",
        neighborhoodAr: "الملز",
        latitude: "24.6980",
        longitude: "46.6850",
        workingHours: "7:00 AM - 1:00 AM",
        workingHoursAr: "7:00 ص - 1:00 ص",
        numberOfScreens: 3,
        screenType: "TV",
        screenTypeAr: "شاشة تلفزيون",
        dailyPrice: "90",
        specialNotes: "24/7 location with late night crowd",
        specialNotesAr: "موقع على مدار الساعة مع حشود ليلية",
        isActive: true,
      },
      {
        name: "Al Nakheel Restaurant Complex",
        nameAr: "مجمع المطاعم - حي النخيل",
        address: "Al Takhasusi Street, Al Nakheel District",
        addressAr: "شارع التخصصي، حي النخيل",
        city: "Riyadh",
        cityAr: "الرياض",
        neighborhood: "Al Nakheel",
        neighborhoodAr: "النخيل",
        latitude: "24.7450",
        longitude: "46.6250",
        workingHours: "11:00 AM - 12:00 AM",
        workingHoursAr: "11:00 ص - 12:00 ص",
        numberOfScreens: 6,
        screenType: "TV",
        screenTypeAr: "شاشة تلفزيون",
        dailyPrice: "95",
        specialNotes: "Multiple restaurant complex",
        specialNotesAr: "مجمع مطاعم متعددة",
        isActive: true,
      },
      {
        name: "Riyadh Front Cafe",
        nameAr: "مقهى الرياض فرونت",
        address: "Riyadh Front, King Khalid Road",
        addressAr: "الرياض فرونت، طريق الملك خالد",
        city: "Riyadh",
        cityAr: "الرياض",
        neighborhood: "Sulaimaniah",
        neighborhoodAr: "السليمانية",
        latitude: "24.7850",
        longitude: "46.7250",
        workingHours: "8:00 AM - 11:00 PM",
        workingHoursAr: "8:00 ص - 11:00 م",
        numberOfScreens: 2,
        screenType: "Tablet",
        screenTypeAr: "شاشة لوحية",
        dailyPrice: "110",
        specialNotes: "Modern shopping district location",
        specialNotesAr: "موقع في منطقة تسوق حديثة",
        isActive: true,
      },
      {
        name: "Jeddah Corniche Restaurant",
        nameAr: "مطعم كورنيش جدة",
        address: "Corniche Road, Beachfront District",
        addressAr: "طريق الكورنيش، حي الشاطئ",
        city: "Jeddah",
        cityAr: "جدة",
        neighborhood: "Corniche",
        neighborhoodAr: "الكورنيش",
        latitude: "21.4858",
        longitude: "39.1925",
        workingHours: "5:00 PM - 2:00 AM",
        workingHoursAr: "5:00 م - 2:00 ص",
        numberOfScreens: 3,
        screenType: "TV",
        screenTypeAr: "شاشة تلفزيون",
        dailyPrice: "100",
        specialNotes: "Scenic waterfront dining location",
        specialNotesAr: "موقع طعام خلاب على الواجهة البحرية",
        isActive: true,
      },
    ];

    for (const location of locations) {
      try {
        await storage.createScreenLocation(location);
      } catch (error) {
        console.log("Location already exists or error:", error);
      }
    }

    console.log("Screen locations seeded successfully");
  } catch (error) {
    console.error("Error seeding screen locations:", error);
  }
}

async function seedSubscriptionPlans() {
  try {
    const existingPlans = await db.select().from(subscriptionPlans).limit(1);
    if (existingPlans.length > 0) {
      console.log("Subscription plans already exist, skipping seed");
      return;
    }

    const plans = [
      {
        name: "Free",
        nameAr: "مجاني",
        price: "0",
        maxBookings: 1,
        premiumSupport: false,
        advancedReports: false,
        displayOrder: 1,
        features: ["Basic screen booking", "Community support"],
      },
      {
        name: "Standard",
        nameAr: "قياسي",
        price: "99",
        maxBookings: 5,
        premiumSupport: true,
        advancedReports: false,
        displayOrder: 2,
        features: [
          "Up to 5 bookings",
          "Premium support",
          "Priority booking",
          "Email notifications",
        ],
      },
      {
        name: "Premium",
        nameAr: "مميز",
        price: "199",
        maxBookings: null,
        premiumSupport: true,
        advancedReports: true,
        displayOrder: 3,
        features: [
          "Unlimited bookings",
          "Premium support",
          "Advanced reports",
          "Analytics dashboard",
          "API access",
          "Priority support",
        ],
      },
    ];

    await db.insert(subscriptionPlans).values(plans);
    console.log("Subscription plans seeded successfully");
  } catch (error) {
    console.error("Error seeding subscription plans:", error);
  }
}

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

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
      const invoices = await paymentService.getInvoicesByMerchant(req.user.id);
      res.json(invoices);
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

  const httpServer = createServer(app);
  return httpServer;
}
