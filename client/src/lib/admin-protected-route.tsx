import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldX } from "lucide-react";
import { Redirect, Route } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
}

export function AdminProtectedRoute({ path, component: Component }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (user.role !== "admin") {
    return (
      <Route path={path}>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-600 dark:text-red-400">
                غير مخول للوصول
              </CardTitle>
              <CardDescription>
                هذه الصفحة متاحة للمديرين فقط
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                تحتاج إلى صلاحيات مدير للوصول إلى هذا القسم من النظام
              </p>
              <a 
                href="/" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                العودة للرئيسية
              </a>
            </CardContent>
          </Card>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}