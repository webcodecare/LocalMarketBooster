import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import type { ScreenLocation } from "@shared/schema";

export default function MerchantScreenLocations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [screenTypeFilter, setScreenTypeFilter] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<ScreenLocation | null>(null);

  const { data: locations = [], isLoading } = useQuery<ScreenLocation[]>({
    queryKey: ["/api/screen-locations"],
  });

  // Filter only active locations for merchants
  const activeLocations = locations.filter(location => location.isActive);

  const filteredLocations = activeLocations.filter(location => {
    const matchesSearch = searchTerm === "" || 
      location.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.cityAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = cityFilter === "all" || location.cityAr === cityFilter;
    const matchesScreenType = screenTypeFilter === "all" || location.screenTypeAr === screenTypeFilter;
    
    return matchesSearch && matchesCity && matchesScreenType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المواقع...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مواقع الشاشات الإعلانية</h1>
              <p className="text-gray-600 mt-1">اختر الموقع المناسب لإعلانك</p>
            </div>
            <Link href="/screen-ads">
              <Button variant="outline">
                العودة للخريطة
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <Input
              placeholder="البحث بالاسم أو المدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  <SelectItem value="الرياض">الرياض</SelectItem>
                  <SelectItem value="جدة">جدة</SelectItem>
                  <SelectItem value="الدمام">الدمام</SelectItem>
                </SelectContent>
              </Select>
              <Select value={screenTypeFilter} onValueChange={setScreenTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الشاشة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="شاشة LED">شاشة LED</SelectItem>
                  <SelectItem value="شاشة LCD">شاشة LCD</SelectItem>
                  <SelectItem value="شاشة OLED">شاشة OLED</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setCityFilter("all");
                  setScreenTypeFilter("all");
                }}
              >
                إعادة تعيين
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-center">
          <p className="text-gray-600">
            تم العثور على {filteredLocations.length} موقع من أصل {activeLocations.length} موقع متاح
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{location.nameAr}</CardTitle>
                    <p className="text-sm text-gray-500">{location.name}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {location.dailyPrice} ريال/يوم
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Photo */}
                {location.locationPhoto && (
                  <div className="h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={location.locationPhoto} 
                      alt={location.nameAr}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-location.jpg';
                      }}
                    />
                  </div>
                )}

                {/* Location Details */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                    {location.cityAr} - {location.neighborhoodAr}
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full ml-2"></span>
                    {location.screenTypeAr} ({location.numberOfScreens} شاشة)
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full ml-2"></span>
                    {location.workingHoursAr}
                  </div>
                </div>

                {/* Special Notes */}
                {location.specialNotesAr && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">{location.specialNotesAr}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLocation(location)}
                    className="flex-1"
                  >
                    عرض التفاصيل
                  </Button>
                  <Link href={`/screen-ads?location=${location.id}`}>
                    <Button size="sm" className="flex-1">
                      حجز إعلان
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواقع مطابقة</h3>
            <p className="text-gray-600 mb-4">جرب تغيير معايير البحث أو المرشحات</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCityFilter("all");
                setScreenTypeFilter("all");
              }}
            >
              عرض جميع المواقع
            </Button>
          </div>
        )}
      </div>

      {/* Location Details Modal */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedLocation?.nameAr}
            </DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-6">
              {/* Location Photo */}
              {selectedLocation.locationPhoto && (
                <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedLocation.locationPhoto} 
                    alt={selectedLocation.nameAr}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">معلومات الموقع</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">العنوان</p>
                      <p className="text-gray-600">{selectedLocation.addressAr}</p>
                      <p className="text-sm text-gray-500">{selectedLocation.address}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">المدينة والحي</p>
                      <p className="text-gray-600">{selectedLocation.cityAr} - {selectedLocation.neighborhoodAr}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">ساعات العمل</p>
                      <p className="text-gray-600">{selectedLocation.workingHoursAr}</p>
                    </div>
                  </div>
                </div>

                {/* Screen Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">معلومات الشاشة</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">نوع الشاشة</p>
                      <p className="text-gray-600">{selectedLocation.screenTypeAr}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">عدد الشاشات</p>
                      <p className="text-gray-600">{selectedLocation.numberOfScreens} شاشة</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">السعر اليومي</p>
                      <p className="text-2xl font-bold text-green-600">{selectedLocation.dailyPrice} ريال</p>
                      <p className="text-sm text-gray-500">لكل شاشة في اليوم الواحد</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              {selectedLocation.specialNotesAr && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">ملاحظات خاصة</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">{selectedLocation.specialNotesAr}</p>
                  </div>
                </div>
              )}

              {/* Google Maps Integration */}
              {selectedLocation.latitude && selectedLocation.longitude && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">موقع الشاشة</h3>
                  <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${selectedLocation.latitude},${selectedLocation.longitude}&zoom=15`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                {selectedLocation.googleMapsLink && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedLocation.googleMapsLink, '_blank')}
                  >
                    فتح في خرائط جوجل
                  </Button>
                )}
                <Button onClick={() => setSelectedLocation(null)} variant="outline">
                  إغلاق
                </Button>
                <Link href={`/screen-ads?location=${selectedLocation.id}`}>
                  <Button>
                    حجز إعلان في هذا الموقع
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}