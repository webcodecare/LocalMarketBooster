import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
}

export function BackButton({ 
  fallbackPath = "/", 
  className = "mb-6",
  variant = "ghost"
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Always use fallback path for consistent navigation
    setLocation(fallbackPath);
  };

  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>الرجوع</span>
    </Button>
  );
}