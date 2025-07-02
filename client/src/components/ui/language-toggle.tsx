import { Button } from "./button";
import { useLanguage } from "@/contexts/language-context";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 min-w-[80px] border-gray-300 hover:border-blue-500 transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {language === 'ar' ? 'English' : 'العربية'}
      </span>
    </Button>
  );
}