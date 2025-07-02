import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { BackButton } from "@/components/ui/back-button";
import { AdminAnalyticsDashboard as AdminAnalyticsComponent } from "@/components/analytics/admin-analytics-dashboard";

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== 'admin') {
    setLocation('/auth');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold">لوحة التحليلات الإدارية</h1>
          <p className="text-gray-600">تحليلات شاملة لأداء المنصة والمتاجر</p>
        </div>
      </div>

      <AdminAnalyticsComponent />
    </div>
  );
}