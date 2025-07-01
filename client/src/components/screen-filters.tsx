import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, MapPin, Monitor, DollarSign, Star, Calendar, X } from "lucide-react";

export interface FilterOptions {
  city?: string;
  screenType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  category?: string;
  availability?: string;
}

interface ScreenFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  totalResults: number;
  isLoading?: boolean;
}

export function ScreenFilters({ 
  filters, 
  onFiltersChange, 
  totalResults, 
  isLoading = false 
}: ScreenFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0, 
    filters.maxPrice || 10000
  ]);

  // City options (you could fetch these from an API)
  const cityOptions = [
    { value: "الرياض", label: "الرياض", labelEn: "Riyadh" },
    { value: "جدة", label: "جدة", labelEn: "Jeddah" },
    { value: "الدمام", label: "الدمام", labelEn: "Dammam" },
    { value: "مكة", label: "مكة المكرمة", labelEn: "Makkah" },
    { value: "المدينة", label: "المدينة المنورة", labelEn: "Madinah" },
    { value: "الطائف", label: "الطائف", labelEn: "Taif" },
    { value: "تبوك", label: "تبوك", labelEn: "Tabuk" },
    { value: "أبها", label: "أبها", labelEn: "Abha" }
  ];

  const screenTypeOptions = [
    { value: "LED", label: "شاشة LED", labelEn: "LED Screen" },
    { value: "LCD", label: "شاشة LCD", labelEn: "LCD Screen" },
    { value: "OLED", label: "شاشة OLED", labelEn: "OLED Screen" },
    { value: "TV", label: "تلفزيون", labelEn: "TV Screen" },
    { value: "Tablet", label: "جهاز لوحي", labelEn: "Tablet" }
  ];

  const categoryOptions = [
    { value: "shopping", label: "مراكز تجارية", labelEn: "Shopping Centers" },
    { value: "restaurant", label: "مطاعم", labelEn: "Restaurants" },
    { value: "hospital", label: "مستشفيات", labelEn: "Hospitals" },
    { value: "gym", label: "صالات رياضية", labelEn: "Gyms" },
    { value: "office", label: "مكاتب", labelEn: "Offices" },
    { value: "hotel", label: "فنادق", labelEn: "Hotels" }
  ];

  const availabilityOptions = [
    { value: "available", label: "متاح الآن", labelEn: "Available Now" },
    { value: "upcoming", label: "متاح قريباً", labelEn: "Available Soon" },
    { value: "all", label: "الكل", labelEn: "All" }
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    const newFilters = { 
      ...localFilters, 
      minPrice: values[0], 
      maxPrice: values[1] 
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    setPriceRange([0, 10000]);
    onFiltersChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => 
      localFilters[key as keyof FilterOptions] !== undefined && 
      localFilters[key as keyof FilterOptions] !== ""
    ).length;
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">تصفية النتائج</CardTitle>
          </div>
          {getActiveFiltersCount() > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 ml-1" />
              مسح الكل
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>النتائج الموجودة:</span>
          <Badge variant="secondary" className="px-2 py-1">
            {isLoading ? "جاري البحث..." : `${totalResults} موقع`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* City Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label>المدينة</Label>
          </div>
          <Select
            value={localFilters.city || ""}
            onValueChange={(value) => handleFilterChange('city', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع المدن</SelectItem>
              {cityOptions.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Screen Type Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <Label>نوع الشاشة</Label>
          </div>
          <Select
            value={localFilters.screenType || ""}
            onValueChange={(value) => handleFilterChange('screenType', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الشاشة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الأنواع</SelectItem>
              {screenTypeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Label>نطاق السعر (ريال/يوم)</Label>
          </div>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              min={0}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{priceRange[0]} ريال</span>
              <span>{priceRange[1]} ريال</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">الحد الأدنى</Label>
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value) || 0;
                  handlePriceRangeChange([newMin, priceRange[1]]);
                }}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">الحد الأقصى</Label>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value) || 10000;
                  handlePriceRangeChange([priceRange[0], newMax]);
                }}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rating Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <Label>التقييم الأدنى</Label>
          </div>
          <Select
            value={localFilters.minRating?.toString() || ""}
            onValueChange={(value) => handleFilterChange('minRating', value ? parseFloat(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر التقييم الأدنى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع التقييمات</SelectItem>
              <SelectItem value="4">4+ نجوم</SelectItem>
              <SelectItem value="3">3+ نجوم</SelectItem>
              <SelectItem value="2">2+ نجوم</SelectItem>
              <SelectItem value="1">1+ نجوم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>فئة الموقع</Label>
          <Select
            value={localFilters.category || ""}
            onValueChange={(value) => handleFilterChange('category', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر فئة الموقع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الفئات</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Availability Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label>التوفر</Label>
          </div>
          <Select
            value={localFilters.availability || ""}
            onValueChange={(value) => handleFilterChange('availability', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر حالة التوفر" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4">
            <Label className="text-sm font-medium mb-2 block">المرشحات النشطة</Label>
            <div className="flex flex-wrap gap-1">
              {Object.entries(localFilters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <Badge 
                    key={key} 
                    variant="secondary" 
                    className="text-xs px-2 py-1"
                  >
                    {typeof value === 'string' ? value : `${value}`}
                    <button
                      onClick={() => handleFilterChange(key as keyof FilterOptions, undefined)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}