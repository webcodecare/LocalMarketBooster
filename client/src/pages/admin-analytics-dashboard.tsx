import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin, 
  Monitor,
  Star,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from "lucide-react";
import { useState } from "react";

interface RevenueData {
  totalRevenue: number;
  subscriptionRevenue: {
    total: number;
    monthly: Array<{
      month: string;
      amount: number;
      count: number;
    }>;
  };
  bookingRevenue: {
    total: number;
    monthly: Array<{
      month: string;
      amount: number;
      count: number;
    }>;
  };
}

interface SubscriptionData {
  distribution: Array<{
    planName: string;
    planNameAr: string;
    price: number;
    color: string;
    activeCount: number;
    totalCount: number;
  }>;
  recentActivity: Array<{
    id: number;
    startDate: string;
    status: string;
    merchantName: string;
    planName: string;
    planPrice: number;
  }>;
  totalActiveSubscriptions: number;
}

interface BookingData {
  mostBookedScreens: Array<{
    screenId: number;
    screenName: string;
    screenNameAr: string;
    city: string;
    bookingCount: number;
    totalRevenue: number;
    avgRating: number;
  }>;
  cityDistribution: Array<{
    city: string;
    cityAr: string;
    bookingCount: number;
    revenue: number;
  }>;
  avgPrices: Array<{
    screenName: string;
    dailyPrice: number;
    avgBookingAmount: number;
    bookingCount: number;
  }>;
  bookingTrends: Array<{
    month: string;
    bookingCount: number;
    revenue: number;
  }>;
  totalBookings: number;
}

export default function AdminAnalyticsDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState("30d");

  if (!user || user.role !== 'admin') {
    setLocation('/auth');
    return null;
  }

  const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery<RevenueData>({
    queryKey: ['/api/admin/analytics/revenue', dateRange],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000 // Consider data stale after 15 seconds
  });

  const { data: subscriptionData, isLoading: subscriptionLoading, refetch: refetchSubscriptions } = useQuery<SubscriptionData>({
    queryKey: ['/api/admin/analytics/subscriptions', dateRange],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000,
    staleTime: 15000
  });

  const { data: bookingData, isLoading: bookingLoading, refetch: refetchBookings } = useQuery<BookingData>({
    queryKey: ['/api/admin/analytics/bookings', dateRange],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000,
    staleTime: 15000
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short'
    });
  };

  const isLoading = revenueLoading || subscriptionLoading || bookingLoading;
  const hasError = !revenueData && !revenueLoading;

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No data available yet. Start by creating subscriptions and bookings to see analytics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-400">SAR 0</div>
                  <p className="text-sm text-gray-500">No transactions yet</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-400">0</div>
                  <p className="text-sm text-gray-500">No subscriptions yet</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-400">0</div>
                  <p className="text-sm text-gray-500">No bookings yet</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive revenue and booking insights
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                refetchRevenue();
                refetchSubscriptions();
                refetchBookings();
              }}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4" />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(revenueData?.totalRevenue || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +12.3% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {subscriptionData?.totalActiveSubscriptions || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +8.1% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {bookingData?.totalBookings || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +15.2% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        bookingData?.totalBookings 
                          ? (revenueData?.bookingRevenue.total || 0) / bookingData.totalBookings
                          : 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600 flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        -2.4% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>
                    Monthly revenue breakdown by subscription and bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData?.subscriptionRevenue.monthly?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData.subscriptionRevenue.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => formatDate(value)}
                        />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                          labelFormatter={(label) => formatDate(label)}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#3B82F6" 
                          fill="#93C5FD" 
                          name="Subscription Revenue"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No revenue data available yet</p>
                        <p className="text-sm">Revenue trends will appear once transactions are processed</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Screens */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Screens</CardTitle>
                    <CardDescription>Most booked screens by revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookingData?.mostBookedScreens.slice(0, 5).map((screen, index) => (
                        <div key={screen.screenId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{screen.screenName}</p>
                              <p className="text-sm text-gray-500">{screen.city}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(screen.totalRevenue)}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-sm">{screen.avgRating?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Distribution</CardTitle>
                    <CardDescription>Active subscriptions by plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={subscriptionData?.distribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="activeCount"
                        >
                          {subscriptionData?.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name) => [
                            `${value} active subscriptions`,
                            subscriptionData?.distribution.find(d => d.activeCount === value)?.planName
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(revenueData?.subscriptionRevenue.total || 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      From {revenueData?.subscriptionRevenue.monthly.length || 0} months of data
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(revenueData?.bookingRevenue.total || 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      From {revenueData?.bookingRevenue.monthly.length || 0} months of data
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {formatCurrency(revenueData?.totalRevenue || 0)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Combined revenue streams
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Comparison</CardTitle>
                  <CardDescription>
                    Subscription vs Booking revenue over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={revenueData?.subscriptionRevenue.monthly.map(sub => {
                        const booking = revenueData?.bookingRevenue.monthly.find(b => b.month === sub.month);
                        return {
                          month: sub.month,
                          subscriptions: sub.amount,
                          bookings: booking?.amount || 0
                        };
                      }) || []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => formatDate(value)}
                      />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'subscriptions' ? 'Subscription Revenue' : 'Booking Revenue'
                        ]}
                        labelFormatter={(label) => formatDate(label)}
                      />
                      <Legend />
                      <Bar dataKey="subscriptions" fill="#3B82F6" name="subscriptions" />
                      <Bar dataKey="bookings" fill="#10B981" name="bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Distribution</CardTitle>
                    <CardDescription>Active subscriptions by plan type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subscriptionData?.distribution.map((plan) => (
                        <div key={plan.planName} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: plan.color }}
                            />
                            <div>
                              <p className="font-medium">{plan.planName}</p>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(plan.price)}/month
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{plan.activeCount}</p>
                            <p className="text-sm text-gray-500">
                              {((plan.activeCount / (subscriptionData.totalActiveSubscriptions || 1)) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Subscription Activity</CardTitle>
                    <CardDescription>Latest subscription changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subscriptionData?.recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{activity.merchantName}</p>
                            <p className="text-sm text-gray-500">
                              {activity.planName} - {formatCurrency(activity.planPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={activity.status === 'active' ? 'default' : 'secondary'}
                            >
                              {activity.status}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(activity.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>City Distribution</CardTitle>
                    <CardDescription>Bookings by city</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={bookingData?.cityDistribution || []}
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                        <YAxis dataKey="city" type="category" width={80} />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Trends</CardTitle>
                    <CardDescription>Monthly booking volume and revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bookingData?.bookingTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={(value) => formatDate(value)}
                        />
                        <YAxis 
                          yAxisId="left"
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            name === 'revenue' ? formatCurrency(value) : value,
                            name === 'revenue' ? 'Revenue' : 'Bookings'
                          ]}
                          labelFormatter={(label) => formatDate(label)}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          name="revenue"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="bookingCount" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          name="bookingCount"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Screen Performance</CardTitle>
                  <CardDescription>Top performing screens by bookings and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Screen</th>
                          <th className="text-left py-2">City</th>
                          <th className="text-right py-2">Bookings</th>
                          <th className="text-right py-2">Revenue</th>
                          <th className="text-right py-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingData?.mostBookedScreens.slice(0, 10).map((screen) => (
                          <tr key={screen.screenId} className="border-b">
                            <td className="py-3 font-medium">{screen.screenName}</td>
                            <td className="py-3 text-gray-500">{screen.city}</td>
                            <td className="py-3 text-right">{screen.bookingCount}</td>
                            <td className="py-3 text-right font-semibold">
                              {formatCurrency(screen.totalRevenue)}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span>{screen.avgRating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}