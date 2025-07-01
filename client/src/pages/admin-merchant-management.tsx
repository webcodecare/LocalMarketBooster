import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  TrendingUp,
  Package,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface Merchant {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  subscriptionPlan?: {
    id: number;
    name: string;
    nameAr: string;
    price: number;
    currency: string;
    billingPeriod: string;
    isActive: boolean;
  };
  stats?: {
    totalOffers: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
  };
}

export default function AdminMerchantManagement() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    setLocation('/auth');
    return null;
  }

  const { data: merchants, isLoading } = useQuery<Merchant[]>({
    queryKey: ['/api/admin/merchants'],
    enabled: !!user && user.role === 'admin'
  });

  const { data: subscriptionPlans } = useQuery({
    queryKey: ['/api/admin/subscription-plans'],
    enabled: !!user && user.role === 'admin'
  });

  const toggleMerchantStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/merchants/${id}/status`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/merchants'] });
      toast({
        title: "Success",
        description: "Merchant status updated successfully"
      });
    }
  });

  const deleteMerchantMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/merchants/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/merchants'] });
      toast({
        title: "Success",
        description: "Merchant deleted successfully"
      });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ merchantId, subject, message }: { merchantId: number; subject: string; message: string }) => {
      const response = await apiRequest("POST", `/api/admin/merchants/${merchantId}/email`, { subject, message });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email sent successfully"
      });
    }
  });

  const filteredMerchants = merchants?.filter(merchant => {
    const matchesSearch = 
      merchant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && merchant.isActive) ||
      (filterStatus === "inactive" && !merchant.isActive) ||
      (filterStatus === "verified" && merchant.isEmailVerified) ||
      (filterStatus === "unverified" && !merchant.isEmailVerified);

    const matchesPlan = filterPlan === "all" || 
      (filterPlan === "none" && !merchant.subscriptionPlan) ||
      (merchant.subscriptionPlan?.id.toString() === filterPlan);

    return matchesSearch && matchesStatus && matchesPlan;
  }) || [];

  const getStatusColor = (merchant: Merchant) => {
    if (!merchant.isActive) return "bg-red-100 text-red-800";
    if (!merchant.isEmailVerified) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (merchant: Merchant) => {
    if (!merchant.isActive) return "Inactive";
    if (!merchant.isEmailVerified) return "Unverified";
    return "Active";
  };

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Merchant Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage merchant accounts, subscriptions, and business operations
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              {filteredMerchants.length} merchants
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search merchants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="none">No Plan</SelectItem>
                  {subscriptionPlans?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Merchants List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No merchants found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm || filterStatus !== "all" || filterPlan !== "all" 
                  ? "No merchants match your search criteria." 
                  : "No merchants have registered yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMerchants.map((merchant) => (
              <Card key={merchant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${merchant.fullName}`} />
                        <AvatarFallback>
                          {merchant.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {merchant.fullName}
                          </h3>
                          <Badge className={getStatusColor(merchant)}>
                            {getStatusText(merchant)}
                          </Badge>
                          {merchant.subscriptionPlan && (
                            <Badge variant="outline">
                              {merchant.subscriptionPlan.name}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{merchant.email}</span>
                          </div>
                          
                          {merchant.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{merchant.phoneNumber}</span>
                            </div>
                          )}
                          
                          {merchant.businessName && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{merchant.businessName}</span>
                            </div>
                          )}
                          
                          {merchant.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{merchant.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats Row */}
                        {merchant.stats && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-blue-600">{merchant.stats.totalOffers}</div>
                              <div className="text-xs text-gray-500">Offers</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-green-600">{merchant.stats.totalBookings}</div>
                              <div className="text-xs text-gray-500">Bookings</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-purple-600">
                                {formatCurrency(merchant.stats.totalRevenue)}
                              </div>
                              <div className="text-xs text-gray-500">Revenue</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-yellow-600 flex items-center justify-center gap-1">
                                <Star className="h-3 w-3" />
                                {merchant.stats.averageRating.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-500">Rating</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedMerchant(merchant);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleMerchantStatusMutation.mutate({
                          id: merchant.id,
                          isActive: !merchant.isActive
                        })}
                      >
                        {merchant.isActive ? (
                          <UserX className="h-4 w-4 text-red-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMerchantMutation.mutate(merchant.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Merchant Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Merchant Details</DialogTitle>
              <DialogDescription>
                View and manage merchant account information
              </DialogDescription>
            </DialogHeader>

            {selectedMerchant && (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={selectedMerchant.fullName} readOnly />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input value={selectedMerchant.username} readOnly />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={selectedMerchant.email} readOnly />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input value={selectedMerchant.phoneNumber || "Not provided"} readOnly />
                    </div>
                    <div>
                      <Label>Business Name</Label>
                      <Input value={selectedMerchant.businessName || "Not provided"} readOnly />
                    </div>
                    <div>
                      <Label>Business Type</Label>
                      <Input value={selectedMerchant.businessType || "Not provided"} readOnly />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={selectedMerchant.city || "Not provided"} readOnly />
                    </div>
                    <div>
                      <Label>Account Status</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(selectedMerchant)}>
                          {getStatusText(selectedMerchant)}
                        </Badge>
                        {selectedMerchant.isEmailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm text-gray-600">
                          {selectedMerchant.isEmailVerified ? "Email Verified" : "Email Not Verified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="subscription" className="space-y-4">
                  {selectedMerchant.subscriptionPlan ? (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Current Subscription</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Plan Name</Label>
                          <div className="mt-1 font-medium">{selectedMerchant.subscriptionPlan.name}</div>
                        </div>
                        <div>
                          <Label>Price</Label>
                          <div className="mt-1 font-medium">
                            {formatCurrency(selectedMerchant.subscriptionPlan.price)} / {selectedMerchant.subscriptionPlan.billingPeriod}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="font-semibold text-gray-900 mb-2">No Active Subscription</h4>
                      <p className="text-gray-600">This merchant doesn't have an active subscription plan.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Member Since</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(selectedMerchant.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Last Login</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {selectedMerchant.lastLoginAt 
                            ? new Date(selectedMerchant.lastLoginAt).toLocaleDateString()
                            : "Never logged in"
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedMerchant.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedMerchant.stats.totalOffers}</div>
                          <div className="text-sm text-gray-600">Total Offers</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{selectedMerchant.stats.totalBookings}</div>
                          <div className="text-sm text-gray-600">Total Bookings</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(selectedMerchant.stats.totalRevenue)}
                          </div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                            <Star className="h-5 w-5" />
                            {selectedMerchant.stats.averageRating.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Average Rating</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => toggleMerchantStatusMutation.mutate({
                        id: selectedMerchant.id,
                        isActive: !selectedMerchant.isActive
                      })}
                    >
                      {selectedMerchant.isActive ? (
                        <>
                          <UserX className="h-4 w-4" />
                          Deactivate Account
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Activate Account
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Send Email
                    </Button>

                    <Button variant="outline" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>

                    <Button 
                      variant="destructive" 
                      className="flex items-center gap-2"
                      onClick={() => deleteMerchantMutation.mutate(selectedMerchant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}