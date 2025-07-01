import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
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
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminProtectedRoute } from "./lib/admin-protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/merchant-register" component={MerchantRegister} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/screen-locations" component={ScreenLocationsMap} />
      <AdminProtectedRoute path="/docs" component={DeveloperDocs} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/offers" component={OffersPage} />
      <Route path="/offer/:id" component={OfferDetails} />
      <Route path="/business/:businessId" component={BusinessProfile} />
      <Route path="/category/:slug" component={CategoryPage} />
      <ProtectedRoute path="/dashboard" component={BusinessDashboard} />
      <ProtectedRoute path="/merchant" component={MerchantDashboard} />
      <ProtectedRoute path="/premium" component={PremiumDashboard} />
      <ProtectedRoute path="/screen-ads" component={ScreenAdsPage} />
      <ProtectedRoute path="/screen-locations" component={MerchantScreenLocations} />
      <ProtectedRoute path="/subscription-plans" component={SubscriptionPlans} />
      <ProtectedRoute path="/merchant/reviews" component={MerchantReviews} />
      <AdminProtectedRoute path="/admin" component={AdminDashboard} />
      <AdminProtectedRoute path="/admin/contact" component={AdminContactManagement} />
      <AdminProtectedRoute path="/admin/analytics" component={AdminAnalyticsDashboard} />
      <AdminProtectedRoute path="/admin/pricing" component={AdminPricingManagement} />
      <AdminProtectedRoute path="/admin/pages" component={AdminPagesManagement} />
      <AdminProtectedRoute path="/admin/merchants" component={AdminMerchantManagement} />
      <AdminProtectedRoute path="/analytics" component={AnalyticsDashboard} />
      <AdminProtectedRoute path="/subscription-management" component={SubscriptionManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
