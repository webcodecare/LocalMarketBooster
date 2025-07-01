import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export default function Header() {
  const { user, logoutMutation, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDashboardRoute = () => {
    if (!user) return "/auth";
    
    switch (user.role) {
      case "admin":
        return "/admin";
      case "business":
        return "/merchant";
      default:
        return "/dashboard";
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    return user.businessName || user.username || "المستخدم";
  };

  // Handle click outside to close mobile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setMobileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-lg border-b-2 border-saudi-green/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-3 lg:py-4">
          {/* Top row: Logo and Navigation */}
          <div className="flex justify-between items-center mb-3 lg:mb-0">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer group" onClick={() => setLocation("/")}>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-saudi-green group-hover:text-green-700 transition-colors duration-300">
                لقطها 🇸🇦
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">أفضل العروض والخصومات في المملكة</p>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-reverse space-x-2 lg:hidden">
              {!isLoading && user ? (
                <div className="relative" ref={mobileDropdownRef}>
                  <button 
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="flex items-center bg-green-50 text-saudi-green px-3 py-2 rounded-lg text-sm font-medium border border-green-200 hover:bg-green-100 transition-all duration-200"
                  >
                    <i className={`${user.role === "admin" ? "fas fa-crown" : user.role === "business" ? "fas fa-store" : "fas fa-user"} ml-1 text-xs`}></i>
                    <span className="max-w-20 truncate">{getUserDisplayName()}</span>
                    <i className={`fas fa-chevron-down mr-1 text-xs transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 transition-all duration-300 ${mobileDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setLocation(getDashboardRoute());
                          setMobileDropdownOpen(false);
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-saudi-green transition-colors duration-200"
                      >
                        <i className="fas fa-tachometer-alt ml-2"></i>
                        {user.role === "admin" ? "لوحة الإدارة" : user.role === "business" ? "لوحة التاجر" : "الحساب"}
                      </button>
                      {user.role === "business" && (
                        <button
                          onClick={() => {
                            setLocation("/dashboard");
                            setMobileDropdownOpen(false);
                          }}
                          className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-saudi-green transition-colors duration-200"
                        >
                          <i className="fas fa-plus ml-2"></i>
                          إدارة العروض
                        </button>
                      )}
                      {user.role === "admin" && (
                        <button
                          onClick={() => {
                            setLocation("/subscription-management");
                            setMobileDropdownOpen(false);
                          }}
                          className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-saudi-green transition-colors duration-200"
                        >
                          <i className="fas fa-credit-card ml-2"></i>
                          إدارة الباقات
                        </button>
                      )}
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileDropdownOpen(false);
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <i className="fas fa-sign-out-alt ml-2"></i>
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              ) : !isLoading && (
                <button
                  onClick={() => setLocation("/auth")}
                  className="bg-saudi-green text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  دخول
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-reverse space-x-8">
            <button
              onClick={() => setLocation("/")}
              className="text-gray-700 hover:text-saudi-green font-semibold text-lg px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
            >
              الرئيسية
            </button>
            
            <button
              onClick={() => setLocation("/categories")}
              className="text-gray-700 hover:text-saudi-green font-semibold text-lg px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
            >
              الفئات
            </button>

            {!isLoading && user ? (
              <div className="flex items-center space-x-reverse space-x-4">
                {user.role === "business" && (
                  <Button
                    className="bg-gradient-to-r from-saudi-green to-green-600 text-white hover:from-green-700 hover:to-green-800 font-semibold px-4 lg:px-6 py-2 lg:py-3 text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setLocation("/dashboard")}
                  >
                    <i className="fas fa-plus ml-2"></i>
                    <span className="hidden sm:inline">اضف عرضك</span>
                    <span className="sm:hidden">إضافة</span>
                  </Button>
                )}
                
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-saudi-green font-semibold px-3 lg:px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200">
                    <i className={`${user.role === "admin" ? "fas fa-crown" : user.role === "business" ? "fas fa-store" : "fas fa-user"} ml-2 text-base lg:text-lg`}></i>
                    <span className="inline text-sm lg:text-base font-bold text-saudi-green">
                      {getUserDisplayName()}
                    </span>
                    <i className="fas fa-chevron-down mr-2 text-xs"></i>
                  </button>
                  
                  <div className="absolute left-0 mt-2 w-48 lg:w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-3">
                      <button
                        onClick={() => setLocation(getDashboardRoute())}
                        className="block w-full text-right px-4 lg:px-5 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-green-50 hover:text-saudi-green transition-colors duration-200"
                      >
                        <i className="fas fa-tachometer-alt ml-2 lg:ml-3"></i>
                        {user.role === "admin" ? "لوحة الإدارة" : user.role === "business" ? "لوحة التاجر" : "الحساب"}
                      </button>
                      
                      {user.role === "business" && (
                        <button
                          onClick={() => setLocation("/dashboard")}
                          className="block w-full text-right px-4 lg:px-5 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-green-50 hover:text-saudi-green transition-colors duration-200"
                        >
                          <i className="fas fa-plus ml-2 lg:ml-3"></i>
                          إدارة العروض
                        </button>
                      )}
                      
                      {user.role === "admin" && (
                        <>
                          <button
                            onClick={() => setLocation("/subscription-management")}
                            className="block w-full text-right px-4 lg:px-5 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-green-50 hover:text-saudi-green transition-colors duration-200"
                          >
                            <i className="fas fa-credit-card ml-2 lg:ml-3"></i>
                            إدارة الباقات
                          </button>
                          <button
                            onClick={() => setLocation("/admin")}
                            className="block w-full text-right px-4 lg:px-5 py-2 lg:py-3 text-sm lg:text-base text-gray-700 hover:bg-green-50 hover:text-saudi-green transition-colors duration-200"
                          >
                            <i className="fas fa-cog ml-2 lg:ml-3"></i>
                            إدارة النظام
                          </button>
                        </>
                      )}
                      
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 lg:px-5 py-2 lg:py-3 text-sm lg:text-base text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <i className="fas fa-sign-out-alt ml-2 lg:ml-3"></i>
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : !isLoading ? (
              <div className="flex items-center space-x-reverse space-x-4">
                <Button
                  className="bg-gradient-to-r from-saudi-green to-green-600 text-white hover:from-green-700 hover:to-green-800 font-semibold px-4 lg:px-6 py-2 lg:py-3 text-base lg:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setLocation("/auth")}
                >
                  <i className="fas fa-plus ml-2"></i>
                  <span className="hidden sm:inline">اضف عرضك</span>
                  <span className="sm:hidden">إضافة</span>
                </Button>
                
                <button
                  onClick={() => setLocation("/auth")}
                  className="text-gray-700 hover:text-saudi-green font-semibold text-base lg:text-lg px-3 lg:px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                >
                  <i className="fas fa-user ml-2"></i>
                  <span className="hidden md:inline">دخول التجار</span>
                  <span className="md:hidden">دخول</span>
                </button>
              </div>
            ) : null}
          </nav>
        </div>

        {/* Universal Search Bar */}
        <div className="mt-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث عن العروض والخصومات... 🔍"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 lg:h-14 px-4 lg:px-6 pr-14 lg:pr-16 text-right bg-gradient-to-r from-gray-50 to-white border-2 border-gray-300 rounded-xl lg:rounded-2xl focus:bg-white focus:border-saudi-green focus:ring-2 lg:focus:ring-4 focus:ring-saudi-green/20 transition-all duration-300 placeholder:text-gray-500 text-base lg:text-lg shadow-sm hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-3 lg:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-saudi-green transition-all duration-200"
              >
                <i className="fas fa-search text-sm lg:text-base"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
