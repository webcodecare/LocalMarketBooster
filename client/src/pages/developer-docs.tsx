import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
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
  Map,
  Mail,
  Shield,
  Download
} from "lucide-react";

export default function DeveloperDocs() {
  const handlePrintToPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  <span className="text-sm text-muted-foreground hover:text-foreground">Back to Platform</span>
                </div>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Code className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Developer Documentation</h1>
                  <p className="text-xs text-muted-foreground">Laqtoha Platform - لقطها</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handlePrintToPDF}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download as PDF
              </Button>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <nav className="space-y-1 p-4">
                    <a href="#overview" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      1. Overview
                    </a>
                    <a href="#tech-stack" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      2. Tech Stack
                    </a>
                    <a href="#installation" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      3. Installation & Setup
                    </a>
                    <a href="#project-structure" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      4. Project Structure
                    </a>
                    <a href="#frontend-routes" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      5. Frontend Routes
                    </a>
                    <a href="#api-endpoints" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      6. API Endpoints
                    </a>
                    <a href="#database-schema" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      7. Database Schema
                    </a>
                    <a href="#roles-permissions" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      8. Roles & Permissions
                    </a>
                    <a href="#screen-filtering" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      9. Advanced Screen Filtering
                    </a>
                    <a href="#integrations" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      10. External Integrations
                    </a>
                    <a href="#upcoming-enhancements" className="block py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      11. Upcoming Enhancements
                    </a>
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <section id="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    1. Overview
                  </CardTitle>
                  <CardDescription>
                    Brief about Laqtoha and its core purpose
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    <strong>Laqtoha (لقطها)</strong> is a comprehensive promotional platform designed specifically for Saudi Arabian businesses. 
                    The platform focuses on dynamic screen advertising management with advanced location discovery and merchant engagement tools.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Core Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Interactive screen advertising booking system</li>
                      <li>Real-time Google Maps integration for location selection</li>
                      <li>Multi-role dashboard (Admin, Merchant, Public)</li>
                      <li>AI-powered offer analysis and optimization</li>
                      <li>Bilingual support (Arabic and English)</li>
                      <li>Advanced booking calendar and pricing calculator</li>
                      <li>Email notifications and approval workflows</li>
                      <li>Analytics and reporting dashboard</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Tech Stack */}
            <section id="tech-stack">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    2. Tech Stack
                  </CardTitle>
                  <CardDescription>
                    Technologies and frameworks used in the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Frontend
                      </h4>
                      <div className="space-y-2">
                        <Badge variant="outline">React 18 + TypeScript</Badge>
                        <Badge variant="outline">Vite</Badge>
                        <Badge variant="outline">Tailwind CSS</Badge>
                        <Badge variant="outline">Shadcn/ui Components</Badge>
                        <Badge variant="outline">Wouter (Routing)</Badge>
                        <Badge variant="outline">TanStack Query</Badge>
                        <Badge variant="outline">React Hook Form</Badge>
                        <Badge variant="outline">Framer Motion</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Backend & Database
                      </h4>
                      <div className="space-y-2">
                        <Badge variant="outline">Node.js + Express</Badge>
                        <Badge variant="outline">TypeScript</Badge>
                        <Badge variant="outline">PostgreSQL</Badge>
                        <Badge variant="outline">Drizzle ORM</Badge>
                        <Badge variant="outline">Passport.js (Auth)</Badge>
                        <Badge variant="outline">Express Sessions</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        External Services
                      </h4>
                      <div className="space-y-2">
                        <Badge variant="outline">Google Maps API</Badge>
                        <Badge variant="outline">OpenAI API</Badge>
                        <Badge variant="outline">SendGrid Email</Badge>
                        <Badge variant="outline">Neon Database</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Development Tools
                      </h4>
                      <div className="space-y-2">
                        <Badge variant="outline">ESLint + Prettier</Badge>
                        <Badge variant="outline">Drizzle Kit</Badge>
                        <Badge variant="outline">TSX</Badge>
                        <Badge variant="outline">PostCSS</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Installation */}
            <section id="installation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    3. Installation & Local Setup
                  </CardTitle>
                  <CardDescription>
                    How to run the project locally and required environment variables
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Quick Start
                    </h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                      <div># Clone the repository</div>
                      <div>git clone https://github.com/your-org/laqtoha-platform.git</div>
                      <div>cd laqtoha-platform</div>
                      <div></div>
                      <div># Install dependencies</div>
                      <div>npm install</div>
                      <div></div>
                      <div># Set up environment variables</div>
                      <div>cp .env.example .env</div>
                      <div></div>
                      <div># Run database migrations</div>
                      <div>npm run db:push</div>
                      <div></div>
                      <div># Start development server</div>
                      <div>npm run dev</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Environment Variables</h4>
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                      <div className="font-mono text-sm space-y-1">
                        <div><strong>DATABASE_URL</strong>=postgresql://username:password@host:port/database</div>
                        <div><strong>SESSION_SECRET</strong>=your-session-secret-key</div>
                        <div><strong>GOOGLE_MAPS_API_KEY</strong>=your-google-maps-api-key</div>
                        <div><strong>OPENAI_API_KEY</strong>=your-openai-api-key</div>
                        <div><strong>SENDGRID_API_KEY</strong>=your-sendgrid-api-key</div>
                        <div><strong>NODE_ENV</strong>=development</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Development vs Production</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Development</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Hot reload enabled</li>
                          <li>• Debug logging active</li>
                          <li>• CORS relaxed</li>
                          <li>• Development database</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Production</h5>
                        <ul className="text-sm space-y-1">
                          <li>• Optimized builds</li>
                          <li>• Error tracking</li>
                          <li>• HTTPS enforced</li>
                          <li>• Production database</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Project Structure */}
            <section id="project-structure">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    4. Project Structure
                  </CardTitle>
                  <CardDescription>
                    Folder organization and key files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="space-y-1">
                      <div>laqtoha-platform/</div>
                      <div>├── client/</div>
                      <div>│   ├── src/</div>
                      <div>│   │   ├── components/          # Reusable UI components</div>
                      <div>│   │   ├── hooks/               # Custom React hooks</div>
                      <div>│   │   ├── lib/                 # Utility functions</div>
                      <div>│   │   ├── pages/               # Route pages</div>
                      <div>│   │   ├── App.tsx              # Main app component</div>
                      <div>│   │   └── main.tsx             # React entry point</div>
                      <div>│   └── index.html</div>
                      <div>├── server/</div>
                      <div>│   ├── auth.ts                  # Authentication logic</div>
                      <div>│   ├── db.ts                    # Database connection</div>
                      <div>│   ├── routes.ts                # API routes</div>
                      <div>│   ├── storage.ts               # Data access layer</div>
                      <div>│   ├── ai-service.ts            # OpenAI integration</div>
                      <div>│   ├── email.ts                 # Email service</div>
                      <div>│   └── index.ts                 # Server entry point</div>
                      <div>├── shared/</div>
                      <div>│   └── schema.ts                # Database schema & types</div>
                      <div>├── package.json</div>
                      <div>├── tailwind.config.ts</div>
                      <div>├── vite.config.ts</div>
                      <div>└── drizzle.config.ts</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Key Files Explained</h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-medium">shared/schema.ts</h5>
                        <p className="text-sm text-muted-foreground">
                          Central schema definition using Drizzle ORM. Contains all database tables, relationships, and TypeScript types.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-medium">server/routes.ts</h5>
                        <p className="text-sm text-muted-foreground">
                          All API endpoints including authentication, offers, bookings, admin operations, and screen location management.
                        </p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-medium">client/src/App.tsx</h5>
                        <p className="text-sm text-muted-foreground">
                          Main routing configuration with protected routes, authentication providers, and theme management.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Frontend Routes */}
            <section id="frontend-routes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    5. Frontend Routes
                  </CardTitle>
                  <CardDescription>
                    Public pages, merchant dashboard, and admin dashboard routes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Public Routes</h4>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/</code>
                          <span className="text-sm text-muted-foreground">Landing page</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/offers</code>
                          <span className="text-sm text-muted-foreground">Browse all offers</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/offer/:id</code>
                          <span className="text-sm text-muted-foreground">Offer details page</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/screen-locations</code>
                          <span className="text-sm text-muted-foreground">Interactive Google Maps</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/categories</code>
                          <span className="text-sm text-muted-foreground">Category browsing</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/contact</code>
                          <span className="text-sm text-muted-foreground">Contact form</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/merchant-register</code>
                          <span className="text-sm text-muted-foreground">Merchant registration</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/auth</code>
                          <span className="text-sm text-muted-foreground">Login/Register</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">Merchant Dashboard (Protected)</h4>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/home</code>
                          <span className="text-sm text-muted-foreground">Merchant dashboard</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/business-dashboard</code>
                          <span className="text-sm text-muted-foreground">Business management</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/business-profile</code>
                          <span className="text-sm text-muted-foreground">Profile management</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/screen-ads</code>
                          <span className="text-sm text-muted-foreground">Screen ads booking</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/analytics-dashboard</code>
                          <span className="text-sm text-muted-foreground">Analytics & reports</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/subscription-management</code>
                          <span className="text-sm text-muted-foreground">Subscription plans</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400">Admin Dashboard (Admin Only)</h4>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/admin/dashboard</code>
                          <span className="text-sm text-muted-foreground">Admin overview</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/admin/bookings</code>
                          <span className="text-sm text-muted-foreground">Booking management</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/admin/merchants</code>
                          <span className="text-sm text-muted-foreground">Merchant approvals</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <code className="text-sm">/admin/contacts</code>
                          <span className="text-sm text-muted-foreground">Contact form management</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="api-endpoints">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    6. API Endpoints
                  </CardTitle>
                  <CardDescription>
                    Complete list of backend endpoints with methods and parameters
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
                          <span className="text-muted-foreground">User registration</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">POST</Badge>
                            <code>/api/login</code>
                          </div>
                          <span className="text-muted-foreground">User login</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">POST</Badge>
                            <code>/api/logout</code>
                          </div>
                          <span className="text-muted-foreground">User logout</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/user</code>
                          </div>
                          <span className="text-muted-foreground">Get current user</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">Offers Management</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/offers</code>
                          </div>
                          <span className="text-muted-foreground">Get all offers with filters</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">GET</Badge>
                            <code>/api/offers/:id</code>
                          </div>
                          <span className="text-muted-foreground">Get offer by ID</span>
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
                            <Badge variant="destructive">PUT</Badge>
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
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold mb-2">Sample API Response</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// GET /api/offers
{
  "offers": [
    {
      "id": 1,
      "title": "50% خصم على جميع المنتجات",
      "description": "خصم خاص لفترة محدودة",
      "businessId": 123,
      "categoryId": 1,
      "discountPercentage": 50,
      "validFrom": "2024-01-01",
      "validTo": "2024-01-31",
      "isActive": true,
      "business": {
        "name": "متجر الإلكترونيات",
        "location": "الرياض، المملكة العربية السعودية"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Database Schema */}
            <section id="database-schema">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    7. Database Schema
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
                          <div className="text-sm space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>username</code> - Unique username</div>
                            <div><code>password</code> - Hashed password</div>
                            <div><code>email</code> - User email</div>
                            <div><code>role</code> - user/admin</div>
                            <div><code>isActive</code> - Account status</div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">businesses</h5>
                          <div className="text-sm space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>userId</code> - FK to users</div>
                            <div><code>name</code> - Business name</div>
                            <div><code>description</code> - Business info</div>
                            <div><code>category</code> - Business category</div>
                            <div><code>location</code> - Address</div>
                            <div><code>contactInfo</code> - Contact details</div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">offers</h5>
                          <div className="text-sm space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>businessId</code> - FK to businesses</div>
                            <div><code>title</code> - Offer title</div>
                            <div><code>description</code> - Offer details</div>
                            <div><code>discountPercentage</code> - Discount</div>
                            <div><code>validFrom/validTo</code> - Validity period</div>
                            <div><code>isActive</code> - Status</div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">screen_locations</h5>
                          <div className="text-sm space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>name/nameAr</code> - Location names</div>
                            <div><code>latitude/longitude</code> - GPS coordinates</div>
                            <div><code>address/addressAr</code> - Addresses</div>
                            <div><code>category</code> - Location type</div>
                            <div><code>features</code> - Available features</div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">screen_bookings</h5>
                          <div className="text-sm space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>userId</code> - FK to users</div>
                            <div><code>locationId</code> - FK to screen_locations</div>
                            <div><code>startDate/endDate</code> - Booking period</div>
                            <div><code>totalPrice</code> - Booking cost</div>
                            <div><code>status</code> - pending/approved/rejected</div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">ai_analyses</h5>
                          <div className="text-sm space-y-1">
                            <div><code>id</code> - Primary key</div>
                            <div><code>offerId</code> - FK to offers</div>
                            <div><code>overallScore</code> - AI score</div>
                            <div><code>suggestions</code> - Improvement tips</div>
                            <div><code>marketingTips</code> - Marketing advice</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Additional Tables</h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm">categories</h5>
                          <p className="text-xs text-muted-foreground">Business categories</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm">merchant_registrations</h5>
                          <p className="text-xs text-muted-foreground">Pending merchant signups</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm">contact_forms</h5>
                          <p className="text-xs text-muted-foreground">Contact form submissions</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm">screen_pricing_options</h5>
                          <p className="text-xs text-muted-foreground">Pricing tiers per location</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm">booking_content</h5>
                          <p className="text-xs text-muted-foreground">Media files for bookings</p>
                        </div>
                        <div className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm">subscriptions</h5>
                          <p className="text-xs text-muted-foreground">User subscription plans</p>
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
                    <Shield className="h-5 w-5" />
                    8. Roles & Permissions
                  </CardTitle>
                  <CardDescription>
                    User roles and their access levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Guest
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Browse offers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>View screen locations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Contact forms</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Merchant registration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Create offers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Book screen ads</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        Merchant
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>All guest permissions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Create/edit offers</span>
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

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-red-500" />
                        Admin
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>All merchant permissions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Approve/reject bookings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Merchant approval</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Platform analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Content moderation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>System configuration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>User management</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Authentication Flow</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div>1. <strong>Registration:</strong> Users register with email, username, and password</div>
                        <div>2. <strong>Login:</strong> Passport.js handles authentication with local strategy</div>
                        <div>3. <strong>Session:</strong> Express sessions store user data with PostgreSQL store</div>
                        <div>4. <strong>Route Protection:</strong> ProtectedRoute and AdminProtectedRoute components</div>
                        <div>5. <strong>Role Check:</strong> Server-side role validation for admin operations</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Advanced Screen Filtering */}
            <section id="screen-filtering">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    9. Advanced Screen Filtering System
                  </CardTitle>
                  <CardDescription>
                    Real-time filtering functionality for dynamic screen location browsing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">
                      ✅ Implementation Status: Completed
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Advanced Screen Filtering system is fully operational with real-time API integration,
                      comprehensive filtering options, and seamless user experience across multiple pages.
                    </p>
                  </div>

                  {/* Filter Options */}
                  <div>
                    <h4 className="font-semibold mb-3">Available Filter Criteria</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm">Location Filters</h5>
                          <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                            <li>• City selection (Riyadh, Jeddah, Dammam)</li>
                            <li>• Neighborhood filtering</li>
                            <li>• Geographic proximity search</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm">Technical Specifications</h5>
                          <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                            <li>• Screen type (LED, LCD, Digital Billboard)</li>
                            <li>• Display resolution categories</li>
                            <li>• Screen size classifications</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm">Business Parameters</h5>
                          <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                            <li>• Price range (min/max daily rates)</li>
                            <li>• Business category filtering</li>
                            <li>• Real-time availability status</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm">Quality Metrics</h5>
                          <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                            <li>• Average customer rating (1-5 stars)</li>
                            <li>• Review count thresholds</li>
                            <li>• Merchant verification status</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Implementation */}
                  <div>
                    <h4 className="font-semibold mb-3">Technical Architecture</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Frontend Components</h5>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs">
                          <div className="space-y-1">
                            <div><strong>ScreenFilters:</strong> <code>client/src/components/screen-filters.tsx</code></div>
                            <div><strong>Integration Pages:</strong> Screen Ads, Map View, Public Browser</div>
                            <div><strong>State Management:</strong> React useState with real-time API calls</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">API Enhancement</h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">GET</Badge>
                            <code className="text-sm">/api/screen-locations</code>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs">
                            <div><strong>Supported Parameters:</strong></div>
                            <div>• <code>city</code> - Filter by city name</div>
                            <div>• <code>screenType</code> - Technology type filter</div>
                            <div>• <code>minPrice/maxPrice</code> - Price range filtering</div>
                            <div>• <code>minRating</code> - Minimum rating threshold</div>
                            <div>• <code>category</code> - Business category</div>
                            <div>• <code>availability</code> - Real-time availability</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Response Structure</h5>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs">
                          <pre className="whitespace-pre-wrap">{`{
  "locations": ScreenLocation[],
  "total": number,
  "filters": FilterOptions
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Experience */}
                  <div>
                    <h4 className="font-semibold mb-3">User Experience Features</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Real-time Functionality</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Instant results as filters change</li>
                          <li>• Dynamic result counter display</li>
                          <li>• Loading states with skeleton UI</li>
                          <li>• Error handling with user feedback</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Interface Design</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Responsive sidebar filter panel</li>
                          <li>• Active filter indicators</li>
                          <li>• One-click clear all filters</li>
                          <li>• Empty state with helpful guidance</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Performance Optimizations */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Performance Features</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• React Query caching for filtered results</li>
                        <li>• Optimized database queries with proper indexing</li>
                        <li>• Debounced input to prevent excessive API calls</li>
                        <li>• Efficient cache invalidation strategies</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Security Measures</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Input validation and sanitization</li>
                        <li>• Parameterized queries preventing SQL injection</li>
                        <li>• Rate limiting on filter endpoints</li>
                        <li>• Access control for sensitive data</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* External Integrations */}
            <section id="integrations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    10. External Integrations
                  </CardTitle>
                  <CardDescription>
                    Third-party services and their implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Map className="h-4 w-4 text-blue-500" />
                          Google Maps API
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Purpose:</strong> Interactive location display and selection</div>
                          <div><strong>Features:</strong></div>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Custom map markers for screen locations</li>
                            <li>Location clustering and zoom controls</li>
                            <li>Geocoding for address validation</li>
                            <li>Interactive info windows</li>
                          </ul>
                          <div><strong>API Key:</strong> <code>GOOGLE_MAPS_API_KEY</code></div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-green-500" />
                          SendGrid Email
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Purpose:</strong> Transactional email notifications</div>
                          <div><strong>Email Types:</strong></div>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Welcome emails for new merchants</li>
                            <li>Booking approval/rejection notifications</li>
                            <li>Contact form submissions</li>
                            <li>Password reset emails</li>
                          </ul>
                          <div><strong>API Key:</strong> <code>SENDGRID_API_KEY</code></div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Code className="h-4 w-4 text-purple-500" />
                          OpenAI API
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Purpose:</strong> AI-powered offer analysis and optimization</div>
                          <div><strong>Features:</strong></div>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Content quality scoring</li>
                            <li>Marketing improvement suggestions</li>
                            <li>Category matching analysis</li>
                            <li>Performance optimization tips</li>
                          </ul>
                          <div><strong>Model:</strong> GPT-4o (latest)</div>
                          <div><strong>API Key:</strong> <code>OPENAI_API_KEY</code></div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Database className="h-4 w-4 text-orange-500" />
                          Neon Database
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Purpose:</strong> Serverless PostgreSQL hosting</div>
                          <div><strong>Features:</strong></div>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Auto-scaling PostgreSQL</li>
                            <li>Built-in connection pooling</li>
                            <li>Automatic backups</li>
                            <li>Point-in-time recovery</li>
                          </ul>
                          <div><strong>Connection:</strong> <code>DATABASE_URL</code></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Environment Configuration</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                        <div className="space-y-1">
                          <div># Required API Keys</div>
                          <div>GOOGLE_MAPS_API_KEY=your_google_maps_key</div>
                          <div>OPENAI_API_KEY=your_openai_key</div>
                          <div>SENDGRID_API_KEY=your_sendgrid_key</div>
                          <div></div>
                          <div># Database Connection</div>
                          <div>DATABASE_URL=postgresql://user:pass@host:port/db</div>
                          <div></div>
                          <div># Authentication</div>
                          <div>SESSION_SECRET=your_session_secret</div>
                          <div></div>
                          <div># Environment</div>
                          <div>NODE_ENV=development</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Integration Notes</h4>
                      <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                        <ul className="space-y-2 text-sm">
                          <li>• <strong>Google Maps:</strong> Requires billing account for production use</li>
                          <li>• <strong>OpenAI:</strong> Monitor token usage to control costs</li>
                          <li>• <strong>SendGrid:</strong> Verify sender domain for deliverability</li>
                          <li>• <strong>Neon:</strong> Connection pooling handled automatically</li>
                          <li>• <strong>CORS:</strong> Properly configured for cross-origin requests</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Upcoming Enhancements */}
            <section id="upcoming-enhancements">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    10. Upcoming Enhancements
                  </CardTitle>
                  <CardDescription>
                    Planned feature extensions and system upgrades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Enhancement 1: Merchant Subscription Plans - IMPLEMENTED */}
                    <div className="border-l-4 border-green-500 pl-6 bg-green-50 dark:bg-green-950 rounded-r-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-lg font-semibold text-green-600 dark:text-green-400">
                          1. Merchant Subscription Plans
                        </h4>
                        <Badge className="bg-green-600 text-white">IMPLEMENTED</Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">✅ Implementation Status</h5>
                          <p className="text-sm text-muted-foreground mb-4">
                            Fully implemented with three-tier subscription system: Free (0 SAR), Standard (99 SAR), 
                            and Premium (199 SAR). Includes complete database schema, API endpoints, and frontend interface.
                          </p>
                          
                          <h5 className="font-medium mb-2">✅ Database Models</h5>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                            <div className="text-green-600">✓ subscription_plans</div>
                            <div>- id, name, nameAr, price</div>
                            <div>- maxBookings, premiumSupport</div>
                            <div>- advancedReports, features[]</div>
                            <div>- isActive, displayOrder</div>
                            <br />
                            <div className="text-green-600">✓ merchant_subscriptions</div>
                            <div>- id, merchantId, planId</div>
                            <div>- startDate, endDate, status</div>
                            <div>- autoRenew, cancelledAt</div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">✅ API Endpoints</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-green-600 border-green-600">GET</Badge>
                              <code>/api/subscription/plans</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-600 text-white">POST</Badge>
                              <code>/api/merchant/subscribe</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-green-600 border-green-600">GET</Badge>
                              <code>/api/merchant/subscription</code>
                            </div>
                          </div>

                          <h5 className="font-medium mb-2 mt-4">✅ Frontend Views</h5>
                          <div className="space-y-1 text-sm">
                            <div className="text-green-600">✓ Subscription plans page (/subscription-plans)</div>
                            <div className="text-green-600">✓ Plan comparison with features matrix</div>
                            <div className="text-green-600">✓ Current subscription status display</div>
                            <div className="text-green-600">✓ One-click plan subscription</div>
                            <div className="text-green-600">✓ Merchant dashboard integration</div>
                          </div>

                          <h5 className="font-medium mb-2 mt-4">🚀 Live Features</h5>
                          <div className="space-y-1 text-sm">
                            <div>• Free: 1 booking, community support</div>
                            <div>• Standard: 5 bookings, premium support</div>
                            <div>• Premium: Unlimited, advanced reports</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhancement 2: Screen Ratings & Reviews */}
                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">
                        2. Screen Ratings & Reviews
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">Feature Purpose</h5>
                          <p className="text-sm text-muted-foreground mb-4">
                            Allow merchants to rate and review screen locations after campaigns, 
                            providing valuable feedback for location quality and helping other merchants make informed decisions.
                          </p>
                          
                          <h5 className="font-medium mb-2">Data Models</h5>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                            <div>screen_reviews</div>
                            <div>- id, locationId, userId</div>
                            <div>- bookingId, rating (1-5)</div>
                            <div>- title, comment</div>
                            <div>- visibility, performance</div>
                            <div>- traffic, value_for_money</div>
                            <div>- isVerified, createdAt</div>
                            <br />
                            <div>review_responses</div>
                            <div>- id, reviewId, responderId</div>
                            <div>- response, isAdminResponse</div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Admin/Merchant Flows</h5>
                          <div className="space-y-2 text-sm">
                            <div><strong>Merchant:</strong> Submit reviews after campaign completion</div>
                            <div><strong>Merchant:</strong> View location ratings before booking</div>
                            <div><strong>Admin:</strong> Moderate and respond to reviews</div>
                            <div><strong>Admin:</strong> Flag inappropriate content</div>
                          </div>

                          <h5 className="font-medium mb-2 mt-4">API Endpoints</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">POST</Badge>
                              <code>/api/reviews/submit</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/locations/:id/reviews</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/merchant/reviewable-bookings</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">PUT</Badge>
                              <code>/api/admin/reviews/:id/moderate</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhancement 3: Advanced Screen Filtering */}
                    <div className="border-l-4 border-purple-500 pl-6">
                      <h4 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">
                        3. Advanced Screen Filtering
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">Feature Purpose</h5>
                          <p className="text-sm text-muted-foreground mb-4">
                            Implement sophisticated filtering system for screen locations based on demographics, 
                            foot traffic, target audience, budget ranges, and performance metrics.
                          </p>
                          
                          <h5 className="font-medium mb-2">Data Models</h5>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                            <div>location_demographics</div>
                            <div>- locationId, ageGroups</div>
                            <div>- genderDistribution</div>
                            <div>- avgFootTraffic, peakHours</div>
                            <div>- businessTypes, incomeLevel</div>
                            <br />
                            <div>location_performance</div>
                            <div>- locationId, avgRating</div>
                            <div>- totalCampaigns, successRate</div>
                            <div>- avgEngagement, conversionRate</div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Frontend Views</h5>
                          <div className="space-y-1 text-sm">
                            <div>• Advanced filter sidebar with multiple criteria</div>
                            <div>• Map view with filter overlays</div>
                            <div>• Location comparison tool</div>
                            <div>• Saved filter preferences</div>
                            <div>• Filter recommendation engine</div>
                          </div>

                          <h5 className="font-medium mb-2 mt-4">Filter Categories</h5>
                          <div className="space-y-1 text-sm">
                            <div>• Price range and budget constraints</div>
                            <div>• Target demographics and age groups</div>
                            <div>• Foot traffic and peak hours</div>
                            <div>• Screen type and resolution</div>
                            <div>• Location ratings and reviews</div>
                            <div>• Distance from merchant location</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhancement 4: Payment Gateway Integration */}
                    <div className="border-l-4 border-orange-500 pl-6">
                      <h4 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">
                        4. Payment Gateway Integration
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">Feature Purpose</h5>
                          <p className="text-sm text-muted-foreground mb-4">
                            Integrate secure payment processing for screen bookings and subscriptions, 
                            supporting multiple payment methods including credit cards, digital wallets, and local payment systems.
                          </p>
                          
                          <h5 className="font-medium mb-2">Data Models</h5>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                            <div>invoices</div>
                            <div>- id, merchantId, planId</div>
                            <div>- amount, currency, status</div>
                            <div>- moyasarPaymentId, description</div>
                            <div>- paidAt, dueDate, failureReason</div>
                            <div>- createdAt, updatedAt</div>
                            <br />
                            <div>merchant_subscriptions</div>
                            <div>- id, merchantId, planId</div>
                            <div>- startDate, endDate, status</div>
                            <div>- autoRenew, cancelReason</div>
                            <div>- createdAt, updatedAt</div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Payment Gateways</h5>
                          <div className="space-y-2 text-sm">
                            <div><strong>Primary:</strong> Moyasar for Saudi Arabian market</div>
                            <div><strong>Credit Cards:</strong> Visa, Mastercard, Amex</div>
                            <div><strong>Local:</strong> mada cards and STC Pay</div>
                            <div><strong>Digital:</strong> Apple Pay, Google Pay support</div>
                            <div><strong>Banking:</strong> Direct bank transfer integration</div>
                          </div>

                          <h5 className="font-medium mb-2 mt-4">Moyasar Integration</h5>
                          <div className="space-y-1 text-sm">
                            <div>• Test mode for development</div>
                            <div>• Live mode for production</div>
                            <div>• Automatic subscription activation</div>
                            <div>• Invoice tracking and management</div>
                            <div>• Payment failure handling</div>
                            <div>• Webhook notifications</div>
                          </div>

                          <h5 className="font-medium mb-2 mt-4">Payment Flow</h5>
                          <div className="space-y-1 text-sm">
                            <div>1. User selects subscription plan</div>
                            <div>2. Payment form captures card details</div>
                            <div>3. Moyasar processes payment</div>
                            <div>4. Invoice updated with payment status</div>
                            <div>5. Subscription activated on success</div>
                            <div>6. Email confirmation sent</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhancement 5: Admin Revenue & Booking Analytics */}
                    <div className="border-l-4 border-red-500 pl-6">
                      <h4 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">
                        5. Admin Revenue & Booking Analytics
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">Feature Purpose</h5>
                          <p className="text-sm text-muted-foreground mb-4">
                            Comprehensive analytics dashboard for administrators to track revenue, booking patterns, 
                            merchant behavior, and platform performance with detailed reporting and forecasting capabilities.
                          </p>
                          
                          <h5 className="font-medium mb-2">Analytics Categories</h5>
                          <div className="space-y-1 text-sm">
                            <div>• Revenue tracking and commission analysis</div>
                            <div>• Booking trends and seasonal patterns</div>
                            <div>• Merchant acquisition and retention metrics</div>
                            <div>• Location performance and utilization rates</div>
                            <div>• Subscription plan conversion analytics</div>
                            <div>• Geographic and demographic insights</div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2">Dashboard Components</h5>
                          <div className="space-y-1 text-sm">
                            <div>• Real-time revenue charts and KPIs</div>
                            <div>• Interactive booking calendar heatmaps</div>
                            <div>• Merchant performance leaderboards</div>
                            <div>• Predictive analytics and forecasting</div>
                            <div>• Custom report builder and exports</div>
                            <div>• Automated alert system for anomalies</div>
                          </div>

                          <h5 className="font-medium mb-2 mt-4">API Endpoints</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/admin/analytics/revenue</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/admin/analytics/bookings</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">GET</Badge>
                              <code>/api/admin/analytics/merchants</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Future Enhancements Placeholder */}
                    <div className="border-l-4 border-gray-300 pl-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-400">
                        6. Future Enhancements
                      </h4>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          Additional features will be documented here as they are planned and implemented:
                        </p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>• Campaign performance tracking and optimization</div>
                          <div>• Multi-language content management system</div>
                          <div>• Mobile app for merchant management</div>
                          <div>• API for third-party integrations</div>
                          <div>• Automated campaign scheduling and rotation</div>
                          <div>• Social media integration and sharing</div>
                          <div>• Advanced notification and alert system</div>
                        </div>
                      </div>
                    </div>

                    {/* Implementation Notes */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                      <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">
                        Implementation Guidelines
                      </h4>
                      <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                        <div><strong>Database Migrations:</strong> All new features require proper migration scripts using Drizzle</div>
                        <div><strong>API Versioning:</strong> New endpoints should maintain backward compatibility</div>
                        <div><strong>Security:</strong> All payment and sensitive data must be encrypted and audited</div>
                        <div><strong>Testing:</strong> Each feature requires comprehensive unit and integration tests</div>
                        <div><strong>Documentation:</strong> Update this section when features are implemented</div>
                        <div><strong>Performance:</strong> Monitor database queries and API response times</div>
                      </div>
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