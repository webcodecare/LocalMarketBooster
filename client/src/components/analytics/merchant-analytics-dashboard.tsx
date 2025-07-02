import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, MousePointer, Users, Calendar, Star, Award, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface MerchantAnalytics {
  totalOffers: number;
  activeOffers: number;
  totalViews: number;
  totalClicks: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  topPerformingOffer: {
    id: number;
    title: string;
    views: number;
    clicks: number;
  } | null;
  offerPerformance: Array<{
    offerId: number;
    title: string;
    views: number;
    clicks: number;
    conversionRate: number;
    status: string;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: number;
    type: 'offer_created' | 'offer_approved' | 'offer_viewed' | 'review_received';
    description: string;
    timestamp: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function MerchantAnalyticsDashboard() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery<MerchantAnalytics>({
    queryKey: ['/api/merchant/analytics'],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">لا توجد بيانات تحليلية متاحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العروض</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeOffers} عرض نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalClicks.toLocaleString()} نقرة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <Progress value={analytics.conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalReviews} تقييم
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Offer */}
      {analytics.topPerformingOffer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              العرض الأكثر أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">{analytics.topPerformingOffer.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {analytics.topPerformingOffer.views.toLocaleString()} مشاهدة
                </span>
                <span className="flex items-center gap-1">
                  <MousePointer className="h-4 w-4" />
                  {analytics.topPerformingOffer.clicks.toLocaleString()} نقرة
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">أداء العروض</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
          <TabsTrigger value="activity">النشاط الحديث</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أداء العروض</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.offerPerformance.map((offer) => (
                  <div key={offer.offerId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{offer.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{offer.views.toLocaleString()} مشاهدة</span>
                        <span>{offer.clicks.toLocaleString()} نقرة</span>
                        <span>{offer.conversionRate.toFixed(1)}% تحويل</span>
                      </div>
                    </div>
                    <Badge variant={offer.status === 'approved' ? 'default' : 'secondary'}>
                      {offer.status === 'approved' ? 'مُوافق عليه' : 'قيد المراجعة'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات المشاهدات والنقرات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.viewsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" name="المشاهدات" />
                  <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="النقرات" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {analytics.categoryBreakdown.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{category.category}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {category.count} ({category.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>النشاط الحديث</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {activity.type === 'offer_created' && <Target className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'offer_approved' && <Award className="h-4 w-4 text-green-600" />}
                      {activity.type === 'offer_viewed' && <Eye className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'review_received' && <Star className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}