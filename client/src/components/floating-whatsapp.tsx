import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface SiteSettings {
  whatsappNumber: string;
  whatsappEnabled: boolean;
  whatsappPosition: string;
}

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const response = await fetch("/api/site-settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!settings?.whatsappEnabled || !settings?.whatsappNumber) {
    return null;
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("مرحباً، أريد الاستفسار عن خدمات منصة براق");
    const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <div className={`fixed ${positionClasses[settings.whatsappPosition as keyof typeof positionClasses] || positionClasses['bottom-right']} z-50`}>
      <div className={`transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <Button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="lg"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="sr-only">تواصل عبر واتساب</span>
        </Button>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30 -z-10"></div>
        
        {/* Tooltip */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          تحدث معنا على واتساب
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
}