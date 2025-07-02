import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('ar');

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ar', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Default to Arabic for Saudi market
      const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
      setLanguageState(browserLang);
    }
  }, []);

  // Update document direction and font when language changes
  useEffect(() => {
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update font family based on language
    if (isRTL) {
      document.documentElement.style.fontFamily = '"Tajawal", "Inter", "Cairo", "Noto Sans Arabic", system-ui, sans-serif';
    } else {
      document.documentElement.style.fontFamily = '"Inter", "Roboto", "Segoe UI", system-ui, sans-serif';
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translation hook
export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: string, translations: { ar: string; en: string }) => {
    return translations[language] || translations.ar;
  };

  return { t, language };
}