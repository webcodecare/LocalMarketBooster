import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Package, 
  FileText, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  MessageSquare,
  Shield,
  Globe,
  Monitor,
  ChevronRight,
  Activity,
  Target,
  Award,
  Zap
} from "lucide-react";

interface DashboardStats {
  totalMerchants: number;
  activeMerchants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  activeBookings: number;
  totalOffers: number;
  pendingOffers: number;
  totalPages: number;
  publishedPages: number;
  totalPlans: number;
  activePlans: number;
  unreadMessages: number;
  systemAlerts: number;
}

export default function AdminDashboardEnhanced() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== 'admin') {
    setLocation('/auth');
    return null;
  }

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard-stats'],
    enabled: !!user && user.role === 'admin'
  });

  const managementModules = [
    {
      title: "Analytics Dashboard",
      description: "View revenue, booking analytics, and platform performance metrics",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "bg-blue-500",
      stats: stats ? [
        { label: "Monthly Revenue", value: `${stats.monthlyRevenue.toLocaleString()} SAR` },
        { label: "Active Bookings", value: stats.activeBookings.toString() }
      ] : []
    },
    {
      title: "Merchant Management",
      description: "Manage merchant accounts, subscriptions, and business operations",
      icon: Users,
      path: "/admin/merchants",
      color: "bg-green-500",
      stats: stats ? [
        { label: "Total Merchants", value: stats.totalMerchants.toString() },
        { label: "Active Merchants", value: stats.activeMerchants.toString() }
      ] : []
    },
    {
      title: "Pricing & Packages",
      description: "Configure subscription plans, pricing tiers, and package features",
      icon: Package,
      path: "/admin/pricing",
      color: "bg-purple-500",
      stats: stats ? [
        { label: "Total Plans", value: stats.totalPlans.toString() },
        { label: "Active Plans", value: stats.activePlans.toString() }
      ] : []
    },
    {
      title: "Static Pages",
      description: "Manage website content, policies, and informational pages",
      icon: FileText,
      path: "/admin/pages",
      color: "bg-orange-500",
      stats: stats ? [
        { label: "Total Pages", value: stats.totalPages.toString() },
        { label: "Published", value: stats.publishedPages.toString() }
      ] : []
    },
    {
      title: "Contact Management",
      description: "Handle customer inquiries, support tickets, and communications",
      icon: MessageSquare,
      path: "/admin/contact",
      color: "bg-cyan-500",
      stats: stats ? [
        { label: "Unread Messages", value: stats.unreadMessages.toString() },
        { label: "System Alerts", value: stats.systemAlerts.toString() }
      ] : []
    },
    {
      title: "Platform Settings",
      description: "Configure system settings, permissions, and global configurations",
      icon: Settings,
      path: "/admin/settings",
      color: "bg-gray-500",
      stats: [
        { label: "Active Users", value: user ? "1" : "0" },
        { label: "System Status", value: "Online" }
      ]
    }
  ];

  const quickStats = [
    {
      title: "Total Revenue",
      value: stats ? `${stats.totalRevenue.toLocaleString()} SAR` : "0 SAR",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Merchants",
      value: stats?.activeMerchants.toString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings.toString() || "0",
      change: "+15.3%",
      trend: "up",
      icon: Monitor,
      color: "text-purple-600"
    },
    {
      title: "Platform Rating",
      value: "4.8",
      change: "+0.2",
      trend: "up",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  const recentActivities = [
    {
      type: "merchant",
      title: "New merchant registration",
      description: "Tech Solutions Co. joined the platform",
      time: "2 hours ago",
      icon: Users,
      color: "bg-green-100 text-green-600"
    },
    {
      type: "booking",
      title: "Screen booking completed",
      description: "Riyadh Mall - Screen #3 booking confirmed",
      time: "4 hours ago",
      icon: Monitor,
      color: "bg-blue-100 text-blue-600"
    },
    {
      type: "payment",
      title: "Payment received",
      description: "Premium plan subscription - 2,500 SAR",
      time: "6 hours ago",
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600"
    },
    {
      type: "alert",
      title: "System maintenance",
      description: "Scheduled maintenance completed successfully",
      time: "1 day ago",
      icon: Activity,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {user.fullName}. Here's your platform overview.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Shield className="h-4 w-4 mr-2" />
                Admin Access
              </Badge>
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                System Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${stat.color} flex items-center gap-1`}>
                      <TrendingUp className="h-3 w-3" />
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Management Modules */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Management Modules
                </CardTitle>
                <CardDescription>
                  Access all administrative tools and management features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {managementModules.map((module, index) => (
                    <Link key={index} href={module.path}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${module.color} text-white`}>
                              <module.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {module.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {module.description}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {module.stats.map((stat, statIndex) => (
                                  <div key={statIndex} className="text-xs">
                                    <span className="text-gray-500">{stat.label}:</span>
                                    <span className="font-medium ml-1">{stat.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest platform events and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${activity.color}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Gateway</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Service</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/merchants">
                      <Users className="h-4 w-4 mr-2" />
                      Add New Merchant
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/pricing">
                      <Package className="h-4 w-4 mr-2" />
                      Create Package
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/pages">
                      <FileText className="h-4 w-4 mr-2" />
                      Add Page
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/contact">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Messages
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}