import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Monitor, 
  Code, 
  Database, 
  Server, 
  Globe, 
  Users, 
  Settings, 
  FileText,
  ArrowLeft,
  ExternalLink,
  Play,
  Terminal,
  Folder,
  Book,
  Shield,
  Download
} from "lucide-react";

export default function DeveloperDocs() {
  const { user } = useAuth();
  const handlePrintToPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/business-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Book className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">API Documentation</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Complete reference for Baraq Platform API</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handlePrintToPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <a href="#overview" className="block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">Overview</a>
                    <a href="#authentication" className="block text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">Authentication</a>
                    <a href="#endpoints" className="block text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">API Endpoints</a>
                    <a href="#data-models" className="block text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">Data Models</a>
                    <a href="#roles-permissions" className="block text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">Roles & Permissions</a>
                    <a href="#rate-limiting" className="block text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">Rate Limiting</a>
                    <a href="#examples" className="block text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400">Code Examples</a>
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Documentation */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <section id="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    API Overview
                  </CardTitle>
                  <CardDescription>
                    The Baraq Platform API provides comprehensive access to business management, offer creation, analytics, and subscription features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Base URL</h4>
                      <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm">
                        https://your-domain.replit.app/api
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Response Format</h4>
                      <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-sm">
                        application/json
                      </code>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span>User Management & Authentication</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-500" />
                        <span>Business & Offer Management</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-purple-500" />
                        <span>Analytics & Reporting</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-orange-500" />
                        <span>Subscription Management</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Session-based authentication with secure login/logout flow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Authentication Flow</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>POST credentials to <code>/api/login</code></li>
                        <li>Session cookie is automatically set</li>
                        <li>Include cookie in subsequent requests</li>
                        <li>Use <code>/api/logout</code> to end session</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Session Management</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sessions are automatically managed via secure HTTP-only cookies. No manual token handling required.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="endpoints">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    API Endpoints
                  </CardTitle>
                  <CardDescription>
                    Complete reference of available endpoints organized by functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Authentication</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">POST</Badge>
                            <code>/api/register</code>
                          </div>
                          <span className="text-muted-foreground">Create new user account</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">POST</Badge>
                            <code>/api/login</code>
                          </div>
                          <span className="text-muted-foreground">Authenticate user</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">POST</Badge>
                            <code>/api/logout</code>
                          </div>
                          <span className="text-muted-foreground">End user session</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/user</code>
                          </div>
                          <span className="text-muted-foreground">Get current user info</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">Business Management</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/offers</code>
                          </div>
                          <span className="text-muted-foreground">Get user offers</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">POST</Badge>
                            <code>/api/offers</code>
                          </div>
                          <span className="text-muted-foreground">Create new offer</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">PUT</Badge>
                            <code>/api/offers/:id</code>
                          </div>
                          <span className="text-muted-foreground">Update offer</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">DELETE</Badge>
                            <code>/api/offers/:id</code>
                          </div>
                          <span className="text-muted-foreground">Delete offer</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-indigo-600 dark:text-indigo-400">Categories & Data</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/categories</code>
                          </div>
                          <span className="text-muted-foreground">Get business categories</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/subscription-plans</code>
                          </div>
                          <span className="text-muted-foreground">Get available plans</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-teal-600 dark:text-teal-400">AI Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">POST</Badge>
                            <code>/api/offers/:id/analyze</code>
                          </div>
                          <span className="text-muted-foreground">Request AI analysis</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/offers/:id/analysis</code>
                          </div>
                          <span className="text-muted-foreground">Get analysis results</span>
                        </div>
                      </div>
                    </div>

                    <>
                      {user?.role === 'admin' && (
                        <div>
                          <h4 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">Screen Ads & Bookings</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">GET</Badge>
                                <code>/api/screen-locations</code>
                              </div>
                              <span className="text-muted-foreground">Get screen locations with pricing</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">POST</Badge>
                                <code>/api/screen-bookings</code>
                              </div>
                              <span className="text-muted-foreground">Create screen booking</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">GET</Badge>
                                <code>/api/screen-bookings</code>
                              </div>
                              <span className="text-muted-foreground">Get user bookings</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">PUT</Badge>
                                <code>/api/screen-bookings/:id/approve</code>
                              </div>
                              <span className="text-muted-foreground">Approve booking (Admin)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold mb-3 text-orange-600 dark:text-orange-400">Admin Operations</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/admin/merchant-registrations</code>
                            </div>
                            <span className="text-muted-foreground">Get pending merchants</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/admin/contact-forms</code>
                            </div>
                            <span className="text-muted-foreground">Get contact submissions</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/admin/analytics</code>
                            </div>
                            <span className="text-muted-foreground">Get platform analytics</span>
                          </div>
                        </div>
                      </div>
                    </>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold mb-2">Sample API Response</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "data": {
    "id": 1,
    "title": "Special Discount",
    "description": "Get 50% off on all items",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Offer retrieved successfully"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Models */}
            <section id="data-models">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Models
                  </CardTitle>
                  <CardDescription>
                    Tables, collections, key fields and relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Core Tables</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">users</h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>username</code> - Unique identifier</div>
                            <div><code>email</code> - Contact email</div>
                            <div><code>role</code> - User permissions</div>
                            <div><code>businessName</code> - Business name</div>
                            <div><code>businessCategory</code> - Business type</div>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">offers</h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>userId</code> - FK to users</div>
                            <div><code>title</code> - Offer headline</div>
                            <div><code>description</code> - Detailed info</div>
                            <div><code>validUntil</code> - Expiration date</div>
                            <div><code>status</code> - approval status</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {user?.role === 'admin' && (
                      <div>
                        <h4 className="font-semibold mb-3">Screen Ads Tables</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4">
                            <h5 className="font-medium mb-2">screen_locations</h5>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div><code>id</code> - Primary key</div>
                              <div><code>name</code> - Location name</div>
                              <div><code>city</code> - City name</div>
                              <div><code>latitude</code> - GPS coordinate</div>
                              <div><code>longitude</code> - GPS coordinate</div>
                              <div><code>dailyPrice</code> - Cost per day</div>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4">
                            <h5 className="font-medium mb-2">screen_bookings</h5>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div><code>id</code> - Primary key</div>
                              <div><code>userId</code> - FK to users</div>
                              <div><code>locationId</code> - FK to locations</div>
                              <div><code>startDate</code> - Campaign start</div>
                              <div><code>endDate</code> - Campaign end</div>
                              <div><code>status</code> - Booking status</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {user?.role === 'admin' && (
                      <div>
                        <h4 className="font-semibold mb-3">AI Analysis</h4>
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">ai_analyses</h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>offerId</code> - FK to offers</div>
                            <div><code>overallScore</code> - AI score</div>
                            <div><code>suggestions</code> - Improvement tips</div>
                            <div><code>marketingTips</code> - Marketing advice</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3">Additional Tables</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">categories</h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>name</code> - Category name</div>
                            <div><code>nameAr</code> - Arabic name</div>
                            <div><code>icon</code> - Icon reference</div>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">subscription_plans</h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>name</code> - Plan name</div>
                            <div><code>price</code> - Monthly price</div>
                            <div><code>offerLimit</code> - Max offers</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Key Relationships</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div>• <strong>users</strong> → <strong>businesses</strong> (One-to-Many)</div>
                          <div>• <strong>businesses</strong> → <strong>offers</strong> (One-to-Many)</div>
                          <div>• <strong>offers</strong> → <strong>ai_analyses</strong> (One-to-One)</div>
                          <div>• <strong>users</strong> → <strong>screen_bookings</strong> (One-to-Many)</div>
                          <div>• <strong>screen_locations</strong> → <strong>screen_bookings</strong> (One-to-Many)</div>
                          <div>• <strong>screen_locations</strong> → <strong>screen_pricing_options</strong> (One-to-Many)</div>
                          <div>• <strong>screen_bookings</strong> → <strong>booking_content</strong> (One-to-Many)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Roles & Permissions */}
            <section id="roles-permissions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Roles & Permissions
                  </CardTitle>
                  <CardDescription>
                    User roles and their associated permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Business User</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Create and manage offers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Request AI analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Book screen advertising</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Business profile management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>View analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Subscription management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Admin operations</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Administrator</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>All business user permissions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Approve/reject offers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Manage screen locations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Platform analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>User management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>System configuration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Rate Limiting */}
            <section id="rate-limiting">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Rate Limiting
                  </CardTitle>
                  <CardDescription>
                    API usage limits and throttling policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">General Limits</h4>
                      <div className="space-y-2 text-sm">
                        <div>• 100 requests per minute per user</div>
                        <div>• 1000 requests per hour per user</div>
                        <div>• 10,000 requests per day per user</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Special Endpoints</h4>
                      <div className="space-y-2 text-sm">
                        <div>• AI Analysis: 10 per hour</div>
                        <div>• Offer Creation: 50 per day</div>
                        <div>• Screen Bookings: 20 per day</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> Rate limits are enforced per authenticated user. Exceeding limits will result in HTTP 429 responses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Examples */}
            <section id="examples">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Examples
                  </CardTitle>
                  <CardDescription>
                    Sample implementations in various languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">JavaScript/TypeScript</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Create a new offer
const createOffer = async (offerData) => {
  const response = await fetch('/api/offers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include session cookie
    body: JSON.stringify(offerData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create offer');
  }
  
  return await response.json();
};

// Get user offers
const getOffers = async () => {
  const response = await fetch('/api/offers', {
    credentials: 'include'
  });
  
  return await response.json();
};`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Python</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import requests

# Login to get session
def login(username, password):
    response = requests.post('https://your-domain.replit.app/api/login', {
        'username': username,
        'password': password
    })
    return response.cookies

# Create offer with session
def create_offer(cookies, offer_data):
    response = requests.post(
        'https://your-domain.replit.app/api/offers',
        json=offer_data,
        cookies=cookies
    )
    return response.json()`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">cURL</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# Login
curl -X POST https://your-domain.replit.app/api/login \\
  -H "Content-Type: application/json" \\
  -d '{"username": "your-username", "password": "your-password"}' \\
  -c cookies.txt

# Create offer
curl -X POST https://your-domain.replit.app/api/offers \\
  -H "Content-Type: application/json" \\
  -b cookies.txt \\
  -d '{
    "title": "Special Discount",
    "description": "Get 50% off on all items",
    "validUntil": "2024-12-31"
  }'`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}