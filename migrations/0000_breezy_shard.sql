CREATE TABLE "ai_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"offer_id" integer NOT NULL,
	"overall_score" integer NOT NULL,
	"title_score" integer NOT NULL,
	"description_score" integer NOT NULL,
	"category_match" integer NOT NULL,
	"improvement_suggestions" text NOT NULL,
	"title_suggestions" text,
	"description_suggestions" text,
	"category_suggestions" text,
	"marketing_tips" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"analyzed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"phone" text,
	"maps_link" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"emoji" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "customer_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"city" text NOT NULL,
	"offer_id" integer NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verification_token" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"category" text DEFAULT 'general' NOT NULL,
	"icon" text DEFAULT 'fas fa-star',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offer_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"offer_id" integer NOT NULL,
	"views" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"business_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"image_url" text,
	"discount_percentage" integer,
	"discount_code" text,
	"original_price" text,
	"discounted_price" text,
	"link" text,
	"link_type" text DEFAULT 'whatsapp',
	"city" text,
	"target_branches" text[],
	"target_cities" text[],
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"is_approved" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plan_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"feature_id" integer NOT NULL,
	"is_included" boolean DEFAULT true NOT NULL,
	"limit" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "screen_ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"media_url" text NOT NULL,
	"media_type" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"total_cost" numeric(8, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "screen_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"address" text NOT NULL,
	"address_ar" text NOT NULL,
	"city" text NOT NULL,
	"city_ar" text NOT NULL,
	"neighborhood" text,
	"neighborhood_ar" text,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"google_maps_link" text,
	"working_hours" text DEFAULT '9:00 AM - 12:00 AM',
	"working_hours_ar" text DEFAULT '9:00 ص - 12:00 ص',
	"number_of_screens" integer DEFAULT 1 NOT NULL,
	"screen_type" text DEFAULT 'LED' NOT NULL,
	"screen_type_ar" text DEFAULT 'شاشة LED' NOT NULL,
	"daily_price" numeric(10, 2) NOT NULL,
	"special_notes" text,
	"special_notes_ar" text,
	"location_photo" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ar" text NOT NULL,
	"description" text,
	"description_ar" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'SAR' NOT NULL,
	"billing_period" text DEFAULT 'monthly' NOT NULL,
	"offer_limit" integer DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"color" text DEFAULT '#3B82F6',
	"icon" text DEFAULT 'fas fa-box',
	"is_popular" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"admin_response" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"invite_token" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"business_name" text,
	"business_description" text,
	"business_category" text,
	"business_city" text,
	"business_phone" text,
	"business_website" text,
	"business_whatsapp" text,
	"business_instagram" text,
	"business_facebook" text,
	"business_snapchat" text,
	"business_x" text,
	"business_tiktok" text,
	"business_logo" text,
	"role" text DEFAULT 'business' NOT NULL,
	"is_approved" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"subscription_plan" text DEFAULT 'free',
	"subscription_expiry" timestamp,
	"auto_renew" boolean DEFAULT false,
	"offer_limit" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_analysis" ADD CONSTRAINT "ai_analysis_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_favorites" ADD CONSTRAINT "customer_favorites_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_analytics" ADD CONSTRAINT "offer_analytics_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_feature_id_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screen_ads" ADD CONSTRAINT "screen_ads_merchant_id_users_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screen_ads" ADD CONSTRAINT "screen_ads_location_id_screen_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."screen_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;