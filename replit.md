# Baraq (براق) - Smart Advertising Platform

## Overview

Baraq (براق) is a comprehensive smart advertising platform designed for businesses in Saudi Arabia. The platform serves as a marketplace for offers and discounts while providing advanced screen advertising capabilities for merchants and locations. It features a multi-role system supporting regular businesses, premium merchants, and administrators.

## System Architecture

The application follows a full-stack monorepo architecture with:

- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based authentication
- **UI Components**: Shadcn/ui with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management
- **Deployment**: Configured for Replit with auto-scaling deployment

## Key Components

### Frontend Architecture
- **Component Library**: Radix UI components with shadcn/ui styling
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with Arabic (RTL) support
- **Icons**: Lucide React icons

### Backend Architecture
- **API Design**: RESTful API with Express.js
- **Database Access**: Drizzle ORM with connection pooling via Neon serverless
- **File Uploads**: Multer for handling media uploads
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **Security**: Passport.js authentication with bcrypt password hashing

### Database Schema
The system uses a comprehensive PostgreSQL schema including:
- **Users**: Business owners, merchants, and administrators
- **Offers**: Discount offers and promotions with approval workflow
- **Categories**: Organized business categories with Arabic localization
- **Screen Locations**: Physical advertising screen locations
- **Bookings**: Screen advertising bookings and campaigns
- **Subscriptions**: Tiered subscription plans and features
- **Reviews**: Location and service reviews
- **Analytics**: AI-powered offer analysis and insights

### Multi-Role System
- **Business Users**: Create and manage offers, basic analytics
- **Premium Merchants**: Advanced features, screen advertising, detailed analytics
- **Administrators**: Full system management, approval workflows, content moderation

## Data Flow

1. **User Registration**: New businesses register and await admin approval
2. **Offer Management**: Approved businesses create offers that require admin approval
3. **Screen Advertising**: Premium merchants can book advertising slots on physical screens
4. **Payment Processing**: Integrated payment system for subscriptions and bookings
5. **Analytics & AI**: AI-powered analysis of offers with improvement suggestions
6. **Content Management**: Admin-controlled pages, testimonials, and system settings

## External Dependencies

### Third-Party Services
- **Database**: Neon PostgreSQL serverless database
- **Maps**: Google Maps API for location services
- **Email**: SendGrid for transactional emails
- **AI**: OpenAI GPT-4 for offer analysis and suggestions
- **Payment**: Moyasar payment gateway (Saudi Arabia)

### Key NPM Packages
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Authentication**: Passport.js with local strategy
- **Validation**: Zod for schema validation
- **UI**: Radix UI primitives with shadcn/ui components
- **Charts**: Recharts for analytics visualization
- **Date Handling**: date-fns with Arabic locale support

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: Hot reload with Vite dev server
- **Production**: Built assets served statically with Express
- **Database**: Auto-provisioned PostgreSQL instance
- **Environment**: Node.js 20 with modern ES modules
- **Scaling**: Auto-scaling deployment target with load balancing

### Build Process
1. Frontend assets built with Vite to `dist/public`
2. Backend server bundled with esbuild to `dist/index.js`
3. Database migrations applied via Drizzle Kit
4. Static assets served from Express server

### Configuration Files
- **Drizzle Config**: Database connection and schema management
- **Vite Config**: Frontend build configuration with path aliases
- **Tailwind Config**: Styling framework with Arabic support
- **TypeScript Config**: Strict type checking across client/server/shared code

## Recent Changes
- **June 27, 2025**: Customer-First Homepage Redesign - Completely restructured homepage to target customers instead of merchants. New layout: (1) Customer-centric hero banner with search functionality, (2) Prominent categories section for easy navigation, (3) Featured offers displayed prominently after categories, (4) About Us and contact sections, (5) Moved merchant signup to bottom/footer area, (6) Added engaging messaging focused on customer value proposition
- **June 27, 2025**: Complete Marketing Tracking Integration - Implemented comprehensive marketing tracking system with support for Google Analytics 4, Google Tag Manager, Google Ads conversion tracking, Meta Pixel, TikTok Pixel, and Snap Pixel. Features include: (1) Admin panel with tabbed interface for configuring all tracking platforms, (2) Database storage for tracking settings with tracking_settings table, (3) Public API endpoint for client-side script loading, (4) Automatic tracking script injection based on admin configuration, (5) Event tracking for user registration, offer submission, contact actions, and lead generation, (6) Integration with authentication system to track login/registration events
- **June 25, 2025**: Platform Domain and Branding Update - Updated all "Laqtoha Platform" references to "منصة براق" (Baraq Platform) and changed domain from baraq.com to baraq.ai throughout HTML meta tags, contact information, and branding elements
- **June 24, 2025**: Public Launch Preparation - Complete platform rebranding from "لقطها" to "براق" (Baraq), new user-centric homepage design with prominent "Join as Merchant" button, category-first navigation, About Us section, and comprehensive like button functionality for lead generation
- **June 24, 2025**: Like Button Lead Generation System - Implemented heart button on offer cards that collects customer information (name, phone, city) and sends email notifications to merchants with lead details
- **June 24, 2025**: Homepage Redesign - Restructured for user-centric experience: logo + join merchant button at top, immediate category navigation, large "Browse All Offers" button, About Us section, and clear contact information
- **June 24, 2025**: Multi-Language Toggle (Arabic & English) implemented with RTL/LTR support, dynamic font switching, localStorage persistence, and comprehensive translation system. Features language toggle in navigation header
- **June 24, 2025**: Gamified Merchant Onboarding Wizard created with 4-step interactive flow: business info, first offer creation, subscription selection, and success tips. Features progress tracking and completion badges
- **June 24, 2025**: Public Business Profiles implemented with SEO-friendly URLs (/merchant/[id]), comprehensive merchant information, offer history, performance stats, and social media integration
- **June 24, 2025**: Smart Offer Recommendation Engine deployed with intelligent algorithms based on user behavior, location relevance, category matching, and trending metrics. Features auto-playing carousel with smooth animations
- **June 24, 2025**: Platform rebranded from "لقطها" to "براق" across all areas including homepage, dashboards, metadata, and static content
- **June 24, 2025**: Priority/Featured offers system implemented with flame icon indicators and special placement on homepage
- **June 24, 2025**: Merchant packages page created with three subscription tiers (Basic, Featured, Professional) featuring detailed pricing and feature comparisons
- **June 24, 2025**: Lead generation system implemented with "Like" button on offers, collecting customer contact information for merchants with dedicated leads dashboard
- **June 24, 2025**: External Tracking Integrations implemented with comprehensive support for Google Tag Manager, Google Ads conversion tracking, Meta Pixel, and TikTok Pixel. Features configurable tracking system through admin panel with automatic event tracking for registration, offer submission, and contact interactions
- **June 24, 2025**: Comprehensive Analytics & Insights system completed with merchant performance dashboards and admin platform-wide statistics featuring real-time data visualization with charts and key performance indicators
- **June 23, 2025**: Personalized Offer Recommendation Carousel implemented with intelligent recommendation engine based on user location, business category, discount percentage, popularity metrics, and recent additions. Features animated carousel with auto-play functionality and seamless integration into homepage for logged-in users
- **June 23, 2025**: Complete homepage redesign - removed all screen advertising content and added comprehensive offer categories section with 16 business categories, each with icons and direct navigation to filtered offers
- **June 23, 2025**: Testimonial approval workflow implemented with admin controls for pending/approved/rejected status filtering and visibility toggles
- **June 23, 2025**: Fixed admin settings 404 error by implementing missing /api/site-settings API route

## Changelog  
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.