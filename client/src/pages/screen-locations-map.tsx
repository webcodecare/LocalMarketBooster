import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScreenFilters, type FilterOptions } from "@/components/screen-filters";
import type { ScreenLocation } from "@shared/schema";

function FilteredMap({ locations, filters }: {
  locations: ScreenLocation[];
  filters: FilterOptions;
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !locations.length) return;

    const mapContainer = document.getElementById('filtered-map');
    if (!mapContainer) return;

    // Initialize map
    const mapInstance = new window.google.maps.Map(mapContainer, {
      center: { lat: 23.5, lng: 42.5 },
      zoom: 6,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
    });

    setMap(mapInstance);

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create new markers for filtered locations
    const newMarkers = locations.map(location => {
      const marker = new window.google.maps.Marker({
        position: { 
          lat: parseFloat(location.latitude), 
          lng: parseFloat(location.longitude) 
        },
        map: mapInstance,
        title: location.nameAr,
        icon: {
          url: "data:image/svg+xml," + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#059669">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        }
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 300px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${location.nameAr}</h3>
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${location.addressAr}</p>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 12px; color: #374151;">
                ${location.screenTypeAr || 'شاشة LED'}
              </span>
              <span style="background: #dcfce7; padding: 2px 8px; border-radius: 12px; font-size: 12px; color: #166534;">
                ${location.dailyPrice} ريال/يوم
              </span>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              انقر لعرض التفاصيل والحجز
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Adjust map bounds to fit all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      mapInstance.fitBounds(bounds);
      
      // Set minimum zoom
      const listener = window.google.maps.event.addListener(mapInstance, "idle", () => {
        if (mapInstance.getZoom()! > 15) mapInstance.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }

    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [locations]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">خريطة المواقع المفلترة</h3>
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
        id="filtered-map" 
        className="w-full h-96 rounded-lg border border-gray-300 shadow-sm"
        style={{ minHeight: '500px' }}
      />
      
      <div className="text-sm text-gray-600 text-center">
        يتم عرض {locations.length} موقع على الخريطة وفقاً للمرشحات المحددة
      </div>
    </div>
  );
}

export default function ScreenLocationsMap() {
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
  const { data: locationsData, isLoading } = useQuery<{
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

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🗺️ خريطة مواقع الشاشات</h1>
            <p className="text-xl text-blue-100 mb-6">
              اكتشف مواقع الشاشات الإعلانية في جميع أنحاء المملكة مع إمكانيات التصفية المتقدمة
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {totalResults} موقع متاح
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filtering Sidebar */}
          <div className="lg:col-span-1">
            <ScreenFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalResults={totalResults}
              isLoading={isLoading}
            />
          </div>

          {/* Map Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  خريطة تفاعلية مع التصفية
                </CardTitle>
                <p className="text-gray-600">
                  {isLoading ? "جاري تحميل المواقع..." : `يتم عرض ${totalResults} موقع على الخريطة`}
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">جاري تحميل المواقع...</p>
                    </div>
                  </div>
                ) : locations.length > 0 ? (
                  <FilteredMap locations={locations} filters={filters} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">لا توجد مواقع</h3>
                    <p className="text-gray-600 mb-4">
                      لم نجد مواقع تطابق معايير البحث المحددة
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setFilters({})}
                    >
                      مسح جميع المرشحات
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filter Summary */}
            {Object.keys(filters).length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">ملخص المرشحات النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {filters.city && (
                      <div>
                        <span className="font-medium text-gray-700">المدينة:</span>
                        <p className="text-gray-600">{filters.city}</p>
                      </div>
                    )}
                    {filters.screenType && (
                      <div>
                        <span className="font-medium text-gray-700">نوع الشاشة:</span>
                        <p className="text-gray-600">{filters.screenType}</p>
                      </div>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <div>
                        <span className="font-medium text-gray-700">نطاق السعر:</span>
                        <p className="text-gray-600">
                          {filters.minPrice || 0} - {filters.maxPrice || '∞'} ريال
                        </p>
                      </div>
                    )}
                    {filters.minRating && (
                      <div>
                        <span className="font-medium text-gray-700">التقييم:</span>
                        <p className="text-gray-600">{filters.minRating}+ نجوم</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}