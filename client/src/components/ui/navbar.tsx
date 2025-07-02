import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, useTranslation } from "@/contexts/language-context";
import { Button } from "./button";
import { LanguageToggle } from "./language-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { translations } from "@/translations";
import { 
  Menu, 
  User, 
  LogOut, 
  Settings, 
  BarChart3,
  Package,
  Home,
  Tag,
  Grid3X3,
  Phone
} from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const { isRTL, dir } = useLanguage();
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { 
      href: "/", 
      label: t("nav.home", translations.nav.home),
      icon: Home,
      active: location === "/"
    },
    { 
      href: "/offers", 
      label: t("nav.offers", translations.nav.offers),
      icon: Tag,
      active: location === "/offers"
    },
    { 
      href: "/categories", 
      label: t("nav.categories", translations.nav.categories),
      icon: Grid3X3,
      active: location === "/categories"
    },
    { 
      href: "/packages", 
      label: t("nav.packages", translations.nav.packages),
      icon: Package,
      active: location === "/packages"
    },
    { 
      href: "/contact", 
      label: t("nav.contact", translations.nav.contact),
      icon: Phone,
      active: location === "/contact"
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ب</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                براق
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.businessLogo} alt={user.businessName || user.username} />
                      <AvatarFallback>
                        {(user.businessName || user.username)?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align={isRTL ? "start" : "end"} forceMount>
                  <div className="flex items-center justify-start space-x-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.businessName || user.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      {t("nav.dashboard", translations.nav.dashboard)}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t("common.profile", { ar: "الملف الشخصي", en: "Profile" })}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      {t("common.settings", { ar: "الإعدادات", en: "Settings" })}
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    {t("common.logout", { ar: "تسجيل الخروج", en: "Logout" })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/auth">
                    {t("nav.login", translations.nav.login)}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">
                    {t("nav.register", translations.nav.register)}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-[280px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={item.active ? "default" : "ghost"}
                        className={`w-full justify-start ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}