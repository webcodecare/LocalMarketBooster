import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Target, DollarSign, Eye, MousePointer, Star, Award, Calendar, Building2, ShoppingBag, Activity } from "lucide-react";

interface AdminAnalytics {
  // Platform Overview
  totalUsers: number;
  totalMerchants: number;
  totalOffers: number;
  totalViews: number;
  totalClicks: number;
  totalRevenue: number;
  
  // Growth Metrics
  userGrowth: number;
  merchantGrowth: number;
  offerGrowth: number;
  revenueGrowth: number;
  
  // Performance Metrics
  averageConversionRate: number;
  averageRating: number;
  activeUsers: number;
  platformEngagement: number;
  
  // Top Performers
  topMerchants: Array<{
    id: number;
    businessName: string;
    totalOffers: number;
    totalViews: number;
    rating: number;
    revenue: number;
  }>;
  
  topOffers: Array<{
    id: number;
    title: string;
    merchantName: string;
    views: number;
    clicks: number;
    conversionRate: number;
  }>;
  
  // Time Series Data
  userGrowthOverTime: Array<{
    date: string;
    users: number;
    merchants: number;
  }>;
  
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
  }>;
  
  engagementOverTime: Array<{
    date: string;
    views: number;
    clicks: number;
    offers: number;
  }>;
  
  // Category Analysis
  categoryPerformance: Array<{
    category: string;
    offers: number;
    views: number;
    merchants: number;
    avgRating: number;
  }>;
  
  // Geographical Data
  cityDistribution: Array<{
    city: string;
    merchants: number;
    offers: number;
    percentage: number;
  }>;
  
  // Recent Activity
  recentActivity: Array<{
    id: number;
    type: 'user_registered' | 'merchant_approved' | 'offer_published' | 'subscription_purchased';
    description: string;
    timestamp: string;
    value?: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AdminAnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AdminAnalytics>({
    queryKey: ['/api/admin/analytics'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${analytics.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {analytics.userGrowth > 0 ? '+' : ''}{analytics.userGrowth.toFixed(1)}%
              </span>
              {' '}من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التجار النشطون</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMerchants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${analytics.merchantGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {analytics.merchantGrowth > 0 ? '+' : ''}{analytics.merchantGrowth.toFixed(1)}%
              </span>
              {' '}نمو شهري
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العروض</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOffers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${analytics.offerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {analytics.offerGrowth > 0 ? '+' : ''}{analytics.offerGrowth.toFixed(1)}%
              </span>
              {' '}هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRevenue.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground">
              <span className={`inline-flex items-center ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {analytics.revenueGrowth > 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
              </span>
              {' '}نمو الإيرادات
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
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageConversionRate.toFixed(1)}%</div>
            <Progress value={analytics.averageConversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(analytics.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}% من المجموع
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="growth">النمو</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="geography">التوزيع الجغرافي</TabsTrigger>
          <TabsTrigger value="activity">النشاط الحديث</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أفضل التجار أداءً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topMerchants.map((merchant, index) => (
                    <div key={merchant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{merchant.businessName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {merchant.totalOffers} عرض • {merchant.totalViews.toLocaleString()} مشاهدة
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{merchant.revenue.toLocaleString()} ر.س</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-3 w-3 mr-1" />
                          {merchant.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل العروض أداءً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topOffers.map((offer, index) => (
                    <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{offer.title}</h4>
                          <p className="text-sm text-muted-foreground">{offer.merchantName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {offer.views.toLocaleString()} مشاهدة • {offer.clicks.toLocaleString()} نقرة
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {offer.conversionRate.toFixed(1)}% تحويل
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>أداء الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="offers" fill="#8884d8" name="العروض" />
                  <Bar dataKey="views" fill="#82ca9d" name="المشاهدات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>نمو المستخدمين والتجار</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.userGrowthOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" name="المستخدمون" />
                    <Area type="monotone" dataKey="merchants" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="التجار" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نمو الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="الإيرادات" />
                    <Line type="monotone" dataKey="subscriptions" stroke="#82ca9d" name="الاشتراكات" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>نشاط المنصة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.engagementOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" name="المشاهدات" />
                  <Area type="monotone" dataKey="clicks" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="النقرات" />
                  <Area type="monotone" dataKey="offers" stackId="1" stroke="#ffc658" fill="#ffc658" name="العروض الجديدة" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء الفئات التفصيلي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryPerformance.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.merchants} تاجر • {category.offers} عرض
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>المشاهدات</span>
                          <span>{category.views.toLocaleString()}</span>
                        </div>
                        <Progress value={(category.views / Math.max(...analytics.categoryPerformance.map(c => c.views))) * 100} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>متوسط التقييم</span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {category.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">معدل التفاعل مع المنصة</span>
                      <span className="text-sm text-muted-foreground">{analytics.platformEngagement.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.platformEngagement} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">معدل التحويل العام</span>
                      <span className="text-sm text-muted-foreground">{analytics.averageConversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.averageConversionRate} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">نسبة المستخدمين النشطين</span>
                      <span className="text-sm text-muted-foreground">
                        {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(analytics.activeUsers / analytics.totalUsers) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التوزيع الجغرافي للتجار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.cityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ city, percentage }) => `${city} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="merchants"
                    >
                      {analytics.cityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-3">
                  {analytics.cityDistribution.map((city, index) => (
                    <div key={city.city} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{city.city}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div>{city.merchants} تاجر</div>
                        <div className="text-muted-foreground">{city.offers} عرض</div>
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
              <CardTitle>النشاط الحديث على المنصة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {activity.type === 'user_registered' && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'merchant_approved' && <Building2 className="h-4 w-4 text-green-600" />}
                      {activity.type === 'offer_published' && <Target className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'subscription_purchased' && <DollarSign className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                    {activity.value && (
                      <div className="text-sm font-medium">
                        {activity.value.toLocaleString()} ر.س
                      </div>
                    )}
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