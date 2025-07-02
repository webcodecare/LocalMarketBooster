import { useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

export function useScreenModuleAccess() {
  const { user } = useAuth();
  
  // Only admin users can access the Screen Ads module
  return {
    hasAccess: user?.role === "admin",
    isAdmin: user?.role === "admin"
  };
}

export function WithScreenAccess({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  const { hasAccess } = useScreenModuleAccess();
  
  if (!hasAccess) {
    return fallback;
  }
  
  return <>{children}</>;
}