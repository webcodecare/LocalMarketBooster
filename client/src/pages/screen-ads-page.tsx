import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ReviewDisplay } from "@/components/reviews/review-display";
import { ReviewForm } from "@/components/reviews/review-form";
import { ScreenFilters, type FilterOptions } from "@/components/screen-filters";
import type { ScreenLocation, ScreenAdWithRelations } from "@shared/schema";

// Google Maps component with interactive markers
function InteractiveMap({ locations, onLocationSelect }: {
  locations: ScreenLocation[];
  onLocationSelect: (location: ScreenLocation) => void;
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !locations.length) return;

    const mapContainer = document.getElementById('screen-ads-map');
    if (!mapContainer) return;

    // Initialize map centered between Riyadh and Jeddah
    const mapInstance = new window.google.maps.Map(mapContainer, {
      center: { lat: 23.5, lng: 42.5 }, // Center between Riyadh and Jeddah
      zoom: 6,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "road",
          elementType: "labels",
          stylers: [{ visibility: "simplified" }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
    });

    setMap(mapInstance);

    // Create custom marker icon
    const createMarkerIcon = (price: string) => ({
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" fill="#10B981"/>
          <circle cx="20" cy="20" r="12" fill="white"/>
          <text x="20" y="26" text-anchor="middle" fill="#10B981" font-size="16" font-weight="bold">📺</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(40, 50),
      anchor: new window.google.maps.Point(20, 50)
    });

    // Create markers for each location
    const newMarkers = locations.map(location => {
      const marker = new window.google.maps.Marker({
        position: { 
          lat: parseFloat(location.latitude), 
          lng: parseFloat(location.longitude) 
        },
        map: mapInstance,
        title: location.nameAr,
        icon: createMarkerIcon(location.dailyPrice),
        animation: window.google.maps.Animation.DROP
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">${location.nameAr}</h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">${location.name}</p>
            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px;">${location.addressAr}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="color: #10b981; font-weight: bold; font-size: 18px;">${location.dailyPrice} ريال/يوم</span>
              <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${location.city === 'Riyadh' ? 'الرياض' : 'جدة'}</span>
            </div>
            <button 
              onclick="window.selectScreenLocation(${location.id})" 
              style="width: 100%; background: #10b981; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; transition: background 0.2s;"
              onmouseover="this.style.background='#059669'"
              onmouseout="this.style.background='#10b981'"
            >
              احجز هذا الموقع
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close all other info windows
        markers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        infoWindow.open(mapInstance, marker);
        
        // Center map on clicked marker
        mapInstance.panTo(marker.getPosition()!);
        mapInstance.setZoom(14);
      });

      // Store info window reference
      (marker as any).infoWindow = infoWindow;

      return marker;
    });

    setMarkers(newMarkers);

    // Global function for location selection from info window
    (window as any).selectScreenLocation = (locationId: number) => {
      const location = locations.find(l => l.id === locationId);
      if (location) {
        onLocationSelect(location);
      }
    };

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => {
        if ((marker as any).infoWindow) {
          (marker as any).infoWindow.close();
        }
        marker.setMap(null);
      });
    };
  }, [locations, onLocationSelect]);

  useEffect(() => {
    // Listen for Google Maps loaded event
    const handleMapsLoaded = () => {
      // Trigger a re-render when maps is loaded
      setMap(null);
    };

    if (window.googleMapsLoaded) {
      handleMapsLoaded();
    } else {
      window.addEventListener('google-maps-loaded', handleMapsLoaded);
      return () => window.removeEventListener('google-maps-loaded', handleMapsLoaded);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">الخريطة التفاعلية</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (map) {
                map.setCenter({ lat: 24.7136, lng: 46.6753 });
                map.setZoom(11);
              }
            }}
          >
            الرياض
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (map) {
                map.setCenter({ lat: 21.5755, lng: 39.1380 });
                map.setZoom(11);
              }
            }}
          >
            جدة
          </Button>
        </div>
      </div>
      
      <div 
        id="screen-ads-map" 
        className="w-full h-96 rounded-lg border border-gray-300 shadow-sm"
        style={{ minHeight: '400px' }}
      />
      
      <div className="text-sm text-gray-600 text-center">
        انقر على أي علامة على الخريطة لعرض تفاصيل الموقع وإمكانية الحجز
      </div>
    </div>
  );
}

// Location grid component
function LocationGrid({ locations, onLocationSelect }: {
  locations: ScreenLocation[];
  onLocationSelect: (location: ScreenLocation) => void;
}) {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  const filteredLocations = locations.filter(location => {
    if (selectedCity !== "all" && location.city !== selectedCity) return false;
    if (priceFilter === "budget" && parseFloat(location.dailyPrice) > 100) return false;
    if (priceFilter === "premium" && parseFloat(location.dailyPrice) <= 100) return false;
    return true;
  });

  const cities = Array.from(new Set(locations.map(l => l.city)));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="اختر المدينة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المدن</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>
                {city === "Riyadh" ? "الرياض" : "جدة"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فلترة السعر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأسعار</SelectItem>
            <SelectItem value="budget">اقتصادي (أقل من 100 ريال)</SelectItem>
            <SelectItem value="premium">مميز (أكثر من 100 ريال)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>النتائج: {filteredLocations.length} موقع</span>
        </div>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map(location => (
          <Card key={location.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📺</span>
                    <Badge variant="outline" className="text-xs">
                      {location.city === "Riyadh" ? "الرياض" : "جدة"}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-900">{location.nameAr}</h3>
                  <p className="text-sm text-gray-600 mb-2">{location.name}</p>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{location.addressAr}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {location.dailyPrice} ريال
                  </div>
                  <div className="text-xs text-gray-500">يوميا</div>
                </div>
                <Button 
                  onClick={() => onLocationSelect(location)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                >
                  احجز الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📺</div>
          <p className="text-gray-500 text-lg">لا توجد مواقع متاحة حسب الفلاتر المختارة</p>
        </div>
      )}
    </div>
  );
}

// Enhanced booking modal with file upload and price calculation
function BookingModal({ location, isOpen, onClose }: {
  location: ScreenLocation | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    mediaType: "image",
    duration: 0,
    totalCost: 0
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/screen-ads", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال طلب الحجز بنجاح",
        description: "سيتم مراجعة طلبك من قبل الإدارة قريباً",
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/screen-ads"] });
      setSelectedFile(null);
      setFormData({
        startDate: "",
        endDate: "",
        mediaType: "image",
        duration: 0,
        totalCost: 0
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إرسال الطلب",
        description: error.message || "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    }
  });

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleDateChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    
    if (field === "startDate" || field === "endDate") {
      const duration = calculateDuration(
        field === "startDate" ? value : formData.startDate,
        field === "endDate" ? value : formData.endDate
      );
      updatedData.duration = duration;
      const numberOfScreens = location?.numberOfScreens || 1;
      updatedData.totalCost = duration * parseFloat(location?.dailyPrice || "0") * numberOfScreens;
    }
    
    setFormData(updatedData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "الملف كبير جداً",
          description: "يجب أن يكون حجم الملف أقل من 20 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى رفع ملف بصيغة JPG، PNG، أو MP4",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      // Auto-detect media type
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      setFormData({ ...formData, mediaType });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !selectedFile) return;

    const formDataToSend = new FormData();
    formDataToSend.append("locationId", location.id.toString());
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("mediaType", formData.mediaType);
    formDataToSend.append("duration", formData.duration.toString());
    formDataToSend.append("totalCost", formData.totalCost.toString());
    formDataToSend.append("mediaFile", selectedFile);

    bookingMutation.mutate(formDataToSend);
  };

  if (!location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>📺</span>
            حجز مساحة إعلانية - {location.nameAr}
          </DialogTitle>
          <DialogDescription>
            املأ النموذج أدناه لحجز مساحة إعلانية في هذا الموقع
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Details */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">تفاصيل الموقع</h3>
                  <p className="text-sm text-gray-600 mb-1">{location.addressAr}</p>
                  <p className="text-sm text-gray-500">{location.neighborhoodAr}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    ساعات العمل: {location.workingHoursAr || "9:00 ص - 12:00 ص"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{location.screenTypeAr || "شاشة LED"}</Badge>
                    <Badge variant="secondary">{location.numberOfScreens || 1} شاشة</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{location.dailyPrice} ريال</p>
                  <p className="text-sm text-gray-500">يومياً لكل شاشة</p>
                </div>
              </div>
              {location.specialNotesAr && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>ملاحظات خاصة:</strong> {location.specialNotesAr}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">تاريخ البداية</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">تاريخ النهاية</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label>رفع الملف الإعلاني</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                accept="image/*,video/mp4"
                onChange={handleFileChange}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-4xl text-gray-400">
                    {selectedFile ? (
                      selectedFile.type.startsWith('video/') ? '🎥' : '🖼️'
                    ) : '📁'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="font-medium text-green-600">✓ تم اختيار الملف</p>
                        <p>{selectedFile.name}</p>
                        <p className="text-xs">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>انقر لرفع الملف أو اسحب الملف هنا</p>
                        <p className="text-xs text-gray-500">
                          الحد الأقصى: 20 ميجابايت | الصيغ المقبولة: JPG, PNG, MP4
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Media Type Selection */}
          <div>
            <Label htmlFor="mediaType">نوع المحتوى</Label>
            <Select
              value={formData.mediaType}
              onValueChange={(value) => setFormData({ ...formData, mediaType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">صورة</SelectItem>
                <SelectItem value="video">فيديو</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost Summary */}
          {formData.duration > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>💰</span>
                  ملخص التكلفة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>المدة:</span>
                    <span className="font-semibold">{formData.duration} يوم</span>
                  </div>
                  <div className="flex justify-between">
                    <span>السعر اليومي:</span>
                    <span>{location.dailyPrice} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الشاشات:</span>
                    <span>{location.numberOfScreens || 1} شاشة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نوع المحتوى:</span>
                    <span>{formData.mediaType === 'video' ? 'فيديو' : 'صورة'}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-xl font-bold text-green-600">
                    <span>إجمالي التكلفة:</span>
                    <span>{formData.totalCost.toFixed(2)} ريال</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.duration} يوم × {location.dailyPrice} ريال × {location.numberOfScreens || 1} شاشة
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={bookingMutation.isPending || !formData.startDate || !formData.endDate || !selectedFile}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {bookingMutation.isPending ? "جاري الإرسال..." : "إرسال طلب الحجز"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ScreenAdsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<ScreenLocation | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Build query string for filters
  const buildQueryString = (filterOptions: FilterOptions) => {
    const params = new URLSearchParams();
    Object.entries(filterOptions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return params.toString();
  };

  // Fetch screen locations with filtering
  const queryString = buildQueryString(filters);
  const { data: locationsData, isLoading: locationsLoading } = useQuery<{
    locations: ScreenLocation[];
    total: number;
    filters: FilterOptions;
  }>({
    queryKey: ["/api/screen-locations", queryString],
    queryFn: async () => {
      const url = queryString ? `/api/screen-locations?${queryString}` : '/api/screen-locations';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return response.json();
    },
  });

  const locations = locationsData?.locations || [];
  const totalResults = locationsData?.total || 0;

  // Fetch user's screen ads
  const { data: userAds = [], isLoading: adsLoading } = useQuery<ScreenAdWithRelations[]>({
    queryKey: ["/api/screen-ads"],
  });

  const handleLocationSelect = (location: ScreenLocation) => {
    setSelectedLocation(location);
    setIsBookingModalOpen(true);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (!user) {
    return <div>يرجى تسجيل الدخول</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🖥️ حجز الشاشات الإعلانية</h1>
            <p className="text-xl text-green-100 mb-6">
              اعرض إعلاناتك على الشاشات في أفضل المواقع التجارية في السعودية
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {user.businessName || user.username}
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                باقة {user.subscriptionPlan || 'مجانية'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="locations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="locations">مواقع الشاشات</TabsTrigger>
            <TabsTrigger value="bookings">حجوزاتي ({userAds.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-6">
            <Tabs defaultValue="map" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map">خريطة تفاعلية</TabsTrigger>
                <TabsTrigger value="grid">قائمة المواقع</TabsTrigger>
              </TabsList>

              <TabsContent value="map">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🗺️</span>
                      الخريطة التفاعلية
                    </CardTitle>
                    <p className="text-gray-600">
                      انقر على علامات الموقع لعرض التفاصيل والحجز مباشرة
                    </p>
                  </CardHeader>
                  <CardContent>
                    {locationsLoading ? (
                      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">جاري تحميل المواقع...</p>
                        </div>
                      </div>
                    ) : (
                      <InteractiveMap 
                        locations={locations} 
                        onLocationSelect={handleLocationSelect}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grid">
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Filtering Sidebar */}
                  <div className="lg:col-span-1">
                    <ScreenFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      totalResults={totalResults}
                      isLoading={locationsLoading}
                    />
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-3">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <span className="text-2xl">📋</span>
                              قائمة المواقع المتاحة
                            </CardTitle>
                            <p className="text-gray-600 mt-1">
                              {locationsLoading ? "جاري البحث..." : `${totalResults} موقع متاح`}
                            </p>
                          </div>
                          
                          {/* Quick Filter Summary */}
                          {Object.keys(filters).length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <span>تم التصفية</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {locationsLoading ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                              <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-lg"></div>
                              </div>
                            ))}
                          </div>
                        ) : locations.length > 0 ? (
                          <LocationGrid 
                            locations={locations} 
                            onLocationSelect={handleLocationSelect}
                          />
                        ) : (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
                            <p className="text-gray-600 mb-4">
                              لم نجد مواقع تطابق معايير البحث المحددة
                            </p>
                            <Button 
                              variant="outline" 
                              onClick={() => setFilters({})}
                            >
                              مسح المرشحات
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>حجوزاتي الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                {adsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
                    ))}
                  </div>
                ) : userAds.length > 0 ? (
                  <div className="space-y-4">
                    {userAds.map(ad => (
                      <div key={ad.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{ad.location?.name}</h3>
                            <p className="text-sm text-gray-600">{ad.location?.address}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(ad.startDate).toLocaleDateString('ar')} - {new Date(ad.endDate).toLocaleDateString('ar')}
                            </p>
                          </div>
                          <div className="text-left">
                            <Badge 
                              variant={
                                ad.status === 'approved' ? 'default' : 
                                ad.status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {ad.status === 'approved' ? 'معتمد' : 
                               ad.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                            </Badge>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              {ad.totalCost} ريال
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-lg mb-4">لا توجد حجوزات حتى الآن</p>
                    <Button 
                      onClick={() => document.querySelector('[value="locations"]')?.click()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ابدأ الحجز الآن
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <LocationDetailsModal
        location={selectedLocation}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}

// Location Details Modal with Reviews and Booking
function LocationDetailsModal({ location, isOpen, onClose }: {
  location: ScreenLocation | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("details");
  const { user } = useAuth();

  if (!location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>📺</span>
            {location.nameAr}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{location.addressAr}</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">تفاصيل الموقع</TabsTrigger>
            <TabsTrigger value="reviews">التقييمات</TabsTrigger>
            <TabsTrigger value="booking">الحجز</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">معلومات الموقع</h3>
                      <p className="text-sm text-gray-600 mb-1">{location.addressAr}</p>
                      <p className="text-sm text-gray-500">{location.neighborhoodAr}</p>
                      <p className="text-sm text-gray-500">{location.city === "Riyadh" ? "الرياض" : "جدة"}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">ساعات العمل</h4>
                      <p className="text-sm text-gray-600">
                        {location.workingHoursAr || "9:00 ص - 12:00 ص"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">مواصفات الشاشة</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{location.screenTypeAr || "شاشة LED"}</Badge>
                        <Badge variant="secondary">{location.numberOfScreens || 1} شاشة</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        الحجم: {location.screenSizeAr || "كبير"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">السعر</h4>
                      <p className="text-2xl font-bold text-green-600">{location.dailyPrice} ريال</p>
                      <p className="text-sm text-gray-500">يومياً لكل شاشة</p>
                    </div>
                  </div>
                </div>

                {location.specialNotesAr && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>ملاحظات خاصة:</strong> {location.specialNotesAr}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <ReviewDisplay locationId={location.id} />
            {user && (
              <div className="mt-6">
                <ReviewForm
                  locationId={location.id}
                  locationName={location.nameAr}
                  onSuccess={() => {
                    setActiveTab("reviews");
                  }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="booking" className="space-y-4">
            <BookingForm location={location} onClose={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Booking Form Component
function BookingForm({ location, onClose }: {
  location: ScreenLocation;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    mediaType: "image" as "image" | "video",
    duration: 7,
    totalCost: 0
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/screen-ads/book", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screen-ads/user"] });
      toast({
        title: "تم إرسال طلب الحجز بنجاح",
        description: "سيتم مراجعة طلبك والرد عليك خلال 24 ساعة",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحجز",
        description: error.message || "حدث خطأ أثناء إرسال طلب الحجز",
        variant: "destructive",
      });
    },
  });

  const calculateTotalCost = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays * parseFloat(location.dailyPrice);
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    if (newFormData.startDate && newFormData.endDate) {
      const cost = calculateTotalCost();
      setFormData(prev => ({ ...prev, totalCost: cost }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يجب أن يكون حجم الملف أقل من 50 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      setFormData({ ...formData, mediaType });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formDataToSend = new FormData();
    formDataToSend.append("locationId", location.id.toString());
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("mediaType", formData.mediaType);
    formDataToSend.append("duration", formData.duration.toString());
    formDataToSend.append("totalCost", formData.totalCost.toString());
    formDataToSend.append("mediaFile", selectedFile);

    bookingMutation.mutate(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">ملخص الحجز</h3>
              <p className="text-sm text-gray-600 mb-1">{location.addressAr}</p>
              <p className="text-sm text-gray-500">{location.neighborhoodAr}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{location.screenTypeAr || "شاشة LED"}</Badge>
                <Badge variant="secondary">{location.numberOfScreens || 1} شاشة</Badge>
              </div>
              <p className="text-2xl font-bold text-green-600">{location.dailyPrice} ريال</p>
              <p className="text-sm text-gray-500">يومياً لكل شاشة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">تاريخ البداية</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">تاريخ النهاية</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <Label htmlFor="mediaFile">تحميل المحتوى الإعلاني</Label>
        <Input
          id="mediaFile"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          الحد الأقصى: 50 ميجابايت | الصيغ المدعومة: JPG, PNG, MP4, MOV
        </p>
        
        {selectedFile && (
          <div className="mt-2 p-2 bg-gray-50 rounded border">
            <p className="text-sm">
              <strong>الملف المحدد:</strong> {selectedFile.name}
            </p>
            <p className="text-sm text-gray-600">
              الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} ميجابايت
            </p>
          </div>
        )}
      </div>

      {/* Media Type Selection */}
      <div>
        <Label>نوع المحتوى</Label>
        <Select value={formData.mediaType} onValueChange={(value: "image" | "video") => setFormData({...formData, mediaType: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">صورة</SelectItem>
            <SelectItem value="video">فيديو</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Duration Selection */}
      <div>
        <Label htmlFor="duration">مدة العرض (ثواني)</Label>
        <Input
          id="duration"
          type="number"
          min="3"
          max="30"
          value={formData.duration}
          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          المدة المثلى: 7-10 ثواني للصور، 15-30 ثانية للفيديو
        </p>
      </div>

      {/* Cost Summary */}
      {formData.totalCost > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">إجمالي التكلفة:</span>
              <span className="text-2xl font-bold text-green-600">
                {formData.totalCost} ريال
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          إلغاء
        </Button>
        <Button 
          type="submit" 
          disabled={bookingMutation.isPending || !selectedFile}
          className="flex-1"
        >
          {bookingMutation.isPending ? "جاري الإرسال..." : "تأكيد الحجز"}
        </Button>
      </div>
    </form>
  );
}