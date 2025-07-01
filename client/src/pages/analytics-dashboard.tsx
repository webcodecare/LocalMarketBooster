import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Users, MapPin, DollarSign, Monitor, Calendar, Activity } from "lucide-react";

interface AnalyticsData {
  totalScreens: number;
  bookedScreens: number;
  availableScreens: number;
  totalRevenue: string;
  monthlyRevenue: string;
  weeklyRevenue: string;
  mostBookedLocations: Array<{
    locationId: number;
    locationName: string;
    bookingCount: number;
  }>;
  mostActiveMerchants: Array<{
    merchantId: number;
    merchantName: string;
    bookingCount: number;
    totalSpent: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200">Error Loading Analytics</CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                Failed to load analytics data. Please try again later.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const screenUtilizationData = [
    { name: 'المحجوزة', value: analytics.bookedScreens, color: '#0088FE' },
    { name: 'المتاحة', value: analytics.availableScreens, color: '#00C49F' },
  ];

  const revenueData = [
    { name: 'أسبوعي', value: parseFloat(analytics.weeklyRevenue), color: '#FFBB28' },
    { name: 'شهري', value: parseFloat(analytics.monthlyRevenue), color: '#0088FE' },
    { name: 'إجمالي', value: parseFloat(analytics.totalRevenue), color: '#00C49F' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة التحليلات</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">تحليل شامل لأداء منصة الإعلانات</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                إجمالي الشاشات
              </CardTitle>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {analytics.totalScreens}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                عدد الشاشات المتاحة في النظام
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                الشاشات المحجوزة
              </CardTitle>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {analytics.bookedScreens}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-600 dark:text-green-400">
                معدل الاستخدام: {((analytics.bookedScreens / analytics.totalScreens) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                الإيرادات الشهرية
              </CardTitle>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {parseFloat(analytics.monthlyRevenue).toLocaleString()} ر.س
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                آخر 30 يوم
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                التجار النشطون
              </CardTitle>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {analytics.mostActiveMerchants.length}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                التجار الذين لديهم حجوزات نشطة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="locations">المواقع</TabsTrigger>
            <TabsTrigger value="merchants">التجار</TabsTrigger>
            <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Screen Utilization Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">استخدام الشاشات</CardTitle>
                  <CardDescription>توزيع الشاشات المحجوزة والمتاحة</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={screenUtilizationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {screenUtilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">نظرة عامة على الإيرادات</CardTitle>
                  <CardDescription>الإيرادات حسب الفترة الزمنية</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} ر.س`, 'الإيرادات']} />
                      <Bar dataKey="value" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  أكثر المواقع حجزاً
                </CardTitle>
                <CardDescription>المواقع الأكثر طلباً من قبل التجار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.mostBookedLocations.map((location, index) => (
                    <div key={location.locationId} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{location.locationName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">معرف الموقع: {location.locationId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{location.bookingCount}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">حجز</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="merchants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  أكثر التجار نشاطاً
                </CardTitle>
                <CardDescription>التجار الأكثر استخداماً للمنصة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.mostActiveMerchants.map((merchant, index) => (
                    <div key={merchant.merchantId} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{merchant.merchantName || 'تاجر غير محدد'}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{merchant.bookingCount} حجز</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {parseFloat(merchant.totalSpent).toLocaleString()} ر.س
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">إجمالي الإنفاق</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">الإيرادات الأسبوعية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parseFloat(analytics.weeklyRevenue).toLocaleString()} ر.س
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">آخر 7 أيام</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-600 dark:text-green-400">الإيرادات الشهرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parseFloat(analytics.monthlyRevenue).toLocaleString()} ر.س
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">آخر 30 يوم</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-purple-600 dark:text-purple-400">إجمالي الإيرادات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parseFloat(analytics.totalRevenue).toLocaleString()} ر.س
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">منذ الإطلاق</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}