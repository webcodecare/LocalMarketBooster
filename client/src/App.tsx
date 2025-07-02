import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LanguageProvider } from "@/contexts/language-context";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});
import HomePage from "@/pages/home-page-new";
import AuthPage from "@/pages/auth-page";
import BusinessDashboard from "@/pages/business-dashboard";
import MerchantDashboard from "@/pages/merchant-dashboard";
import PremiumDashboard from "@/pages/premium-dashboard";
import BusinessProfile from "@/pages/business-profile";
import AdminDashboard from "@/pages/admin-dashboard-enhanced";
import SubscriptionManagement from "@/pages/subscription-management";
import OfferDetails from "@/pages/offer-details";
import CategoryPage from "@/pages/category-page";
import CategoriesPage from "@/pages/categories-page";
import OffersPage from "@/pages/offers-page";
import ScreenAdsPage from "@/pages/screen-ads-page";
import MerchantScreenLocations from "@/pages/merchant-screen-locations";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import LandingPage from "@/pages/landing-page";
import MerchantRegister from "@/pages/merchant-register";
import ContactPage from "@/pages/contact-page";
import AdminMerchantManagement from "@/pages/admin-merchant-management";
import AdminContactManagement from "@/pages/admin-contact-management";
import ScreenLocationsMap from "@/pages/screen-locations-map";
import DeveloperDocs from "@/pages/developer-docs";
import SubscriptionPlans from "@/pages/subscription-plans";
import MerchantReviews from "@/pages/merchant-reviews";
import AdminAnalyticsDashboard from "@/pages/admin-analytics-dashboard";
import AdminPricingManagement from "@/pages/admin-pricing-management";
import AdminPagesManagement from "@/pages/admin-pages-management";
import AdminCmsPages from "@/pages/admin-cms-pages";
import AdminCMSContent from "@/pages/admin-cms-content";
import AdminTestimonials from "@/pages/admin-testimonials";
import AdminSettings from "@/pages/admin-settings";
import AdminOfferManagement from "@/pages/admin-offer-management";
import AdminStaticPages from "@/pages/admin-static-pages";
import AdminBadgeManagement from "@/pages/admin-badge-management";
import TrackingSettings from "@/components/admin/tracking-settings";
import PaymentSettingsManagement from "@/components/admin/payment-settings";
import DiscountCodesManagement from "@/components/admin/discount-codes-management";
import AffiliateManagement from "@/components/admin/affiliate-management";
import MerchantPackages from "@/pages/merchant-packages";
import MerchantProfile from "@/pages/merchant-profile";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminProtectedRoute } from "./lib/admin-protected-route";
import { TrackingScripts } from "@/components/tracking/tracking-scripts";

// Admin-only wrapper components for Screen Ads module access control
function AdminOnlyScreenAds() {
  const { user } = useAuth();
  return user?.role === "admin" ? <ScreenAdsPage /> : <NotFound />;
}

function AdminOnlyScreenLocations() {
  const { user } = useAuth();
  return user?.role === "admin" ? <ScreenLocationsMap /> : <NotFound />;
}

function AdminOnlyDashboard() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminDashboard /> : <NotFound />;
}

function AdminOnlyContactManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminContactManagement /> : <NotFound />;
}

function AdminOnlyAnalyticsDashboard() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminAnalyticsDashboard /> : <NotFound />;
}

function AdminOnlyPricingManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminPricingManagement /> : <NotFound />;
}

function AdminOnlyPagesManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminPagesManagement /> : <NotFound />;
}

function AdminOnlyCmsPages() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminCmsPages /> : <NotFound />;
}

function AdminOnlyCMSContent() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminCMSContent /> : <NotFound />;
}

function AdminOnlyTestimonials() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminTestimonials /> : <NotFound />;
}

function AdminOnlySettings() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminSettings /> : <NotFound />;
}

function AdminOnlyMerchantManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminMerchantManagement /> : <NotFound />;
}

function AdminOnlyAnalytics() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AnalyticsDashboard /> : <NotFound />;
}

function AdminOnlySubscriptionManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <SubscriptionManagement /> : <NotFound />;
}

function AdminOnlyDeveloperDocs() {
  const { user } = useAuth();
  return user?.role === "admin" ? <DeveloperDocs /> : <NotFound />;
}

function AdminOnlyOfferManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminOfferManagement /> : <NotFound />;
}

function AdminOnlyStaticPages() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminStaticPages /> : <NotFound />;
}

function AdminOnlyBadgeManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminBadgeManagement /> : <NotFound />;
}

function AdminOnlyTrackingSettings() {
  const { user } = useAuth();
  return user?.role === "admin" ? <TrackingSettings /> : <NotFound />;
}

function AdminOnlyPaymentSettings() {
  const { user } = useAuth();
  return user?.role === "admin" ? <PaymentSettingsManagement /> : <NotFound />;
}

function AdminOnlyDiscountCodes() {
  const { user } = useAuth();
  return user?.role === "admin" ? <DiscountCodesManagement /> : <NotFound />;
}

function AdminOnlyAffiliateManagement() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AffiliateManagement /> : <NotFound />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/merchant-register" component={MerchantRegister} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/screen-locations" component={AdminOnlyScreenLocations} />
      <Route path="/docs" component={AdminOnlyDeveloperDocs} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/offers" component={OffersPage} />
      <Route path="/offer/:id" component={OfferDetails} />
      <Route path="/business/:businessId" component={BusinessProfile} />
      <Route path="/merchant/:merchantId" component={MerchantProfile} />
      <Route path="/category/:slug" component={CategoryPage} />
      <ProtectedRoute path="/dashboard" component={BusinessDashboard} />
      <ProtectedRoute path="/merchant" component={MerchantDashboard} />
      <ProtectedRoute path="/premium" component={PremiumDashboard} />
      <Route path="/screen-ads" component={AdminOnlyScreenAds} />
      <Route path="/merchant-screen-locations" component={AdminOnlyScreenLocations} />
      <Route path="/plans" component={SubscriptionPlans} />
      <Route path="/subscription-plans" component={SubscriptionPlans} />
      <Route path="/packages" component={MerchantPackages} />
      <ProtectedRoute path="/merchant/reviews" component={MerchantReviews} />
      <Route path="/admin" component={AdminOnlyDashboard} />
      <Route path="/admin/contact" component={AdminOnlyContactManagement} />
      <Route path="/admin/analytics" component={AdminOnlyAnalyticsDashboard} />
      <Route path="/admin/pricing" component={AdminOnlyPricingManagement} />
      <Route path="/admin/pages" component={AdminOnlyPagesManagement} />
      <Route path="/admin/cms" component={AdminOnlyCmsPages} />
      <Route path="/admin/cms-content" component={AdminOnlyCMSContent} />
      <Route path="/admin/testimonials" component={AdminOnlyTestimonials} />
      <Route path="/admin/settings" component={AdminOnlySettings} />
      <Route path="/admin/offers" component={AdminOnlyOfferManagement} />
      <Route path="/admin/static-pages" component={AdminOnlyStaticPages} />
      <Route path="/admin/badges" component={AdminOnlyBadgeManagement} />
      <Route path="/admin/tracking" component={AdminOnlyTrackingSettings} />
      <Route path="/admin/payment-settings" component={AdminOnlyPaymentSettings} />
      <Route path="/admin/discount-codes" component={AdminOnlyDiscountCodes} />
      <Route path="/admin/marketers" component={AdminOnlyAffiliateManagement} />
      <Route path="/admin/merchants" component={AdminOnlyMerchantManagement} />
      <Route path="/analytics" component={AdminOnlyAnalytics} />
      <Route path="/subscription-management" component={AdminOnlySubscriptionManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <TrackingScripts />
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
