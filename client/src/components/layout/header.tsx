import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Search, LogOut, Settings } from "lucide-react";

export default function Header() {
  const { user, logoutMutation, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    return user.businessName || user.fullName || user.username || "مستخدم";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center group cursor-pointer" onClick={() => setLocation("/")}>
            <img
              src="/baraq-logo.png"
              alt="Baraq Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mr-3 object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-saudi-green group-hover:text-green-700 transition-colors duration-300">
                براق 🇸🇦
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">أفضل العروض والخصومات في المملكة</p>
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-reverse space-x-2">
            {!isLoading && user ? (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-reverse space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-saudi-green text-white">
                          {getUserDisplayName().charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 hidden sm:block">{getUserDisplayName()}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => setLocation("/merchant")}>
                      <Settings className="ml-2 h-4 w-4" />
                      الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-red-600">
                      <LogOut className="ml-2 h-4 w-4" />
                      تسجيل خروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : !isLoading && (
              <div className="hidden lg:flex items-center space-x-reverse space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/auth")}
                  className="text-sm lg:text-base font-medium"
                >
                  تسجيل الدخول
                </Button>
                <Button
                  onClick={() => setLocation("/merchant-register")}
                  className="bg-gradient-to-r from-saudi-green to-green-600 text-white hover:from-green-700 hover:to-green-800 font-semibold text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  انضم كتاجر
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center space-x-reverse space-x-8 mt-4">
          <Link href="/" className="text-gray-700 hover:text-saudi-green font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-50">
            الرئيسية
          </Link>
          <Link href="/offers" className="text-gray-700 hover:text-saudi-green font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-50">
            جميع العروض
          </Link>
          <Link href="/categories" className="text-gray-700 hover:text-saudi-green font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-50">
            الفئات
          </Link>
          <Link href="/packages" className="text-gray-700 hover:text-saudi-green font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-50">
            باقات التجار
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-saudi-green font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-green-50">
            تواصل معنا
          </Link>
        </nav>

        {/* Universal Search Bar */}
        <div className="mt-4">
          <form onSubmit={handleSearch}>
            <div className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="🔍 ابحث عن العروض والخصومات في مدينتك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 lg:h-14 px-4 lg:px-6 pr-14 lg:pr-16 text-right bg-gradient-to-r from-gray-50 to-white border-2 border-gray-300 rounded-xl lg:rounded-2xl focus:bg-white focus:border-saudi-green focus:ring-2 lg:focus:ring-4 focus:ring-saudi-green/20 transition-all duration-300 placeholder:text-gray-500 text-base lg:text-lg shadow-sm hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-3 lg:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-saudi-green transition-all duration-200"
              >
                <Search className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}