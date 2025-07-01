import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function AdminProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح</h1>
            <p className="text-gray-600 mb-6">ليس لديك صلاحيات للوصول إلى لوحة الإدارة</p>
            <button
              onClick={() => window.history.back()}
              className="bg-saudi-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              العودة
            </button>
          </div>
        </div>
      </Route>
    );
  }

  return <Component />;
}