import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ServiceManager, { Service } from "@/lib/serviceManager";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Home, Star, Minimize2, Maximize2, X, User, Award, Calendar, Phone, Search, Filter } from "lucide-react";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import RatingBadge from "@/components/RatingBadge";
import RatingModal from "@/components/RatingModal";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { apiUrl } from "@/config/api";

interface ProviderUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  specialization?: string;
  isVerified?: boolean;
  createdAt: string;
}

const ProviderProfilePage = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { user, mode } = useAuth();
  const { socket } = useSocket();
  const [services, setServices] = useState<Service[]>([]);
  const [providerUser, setProviderUser] = useState<ProviderUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingService, setSelectedRatingService] = useState<Service | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [priceFilter, setPriceFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean | undefined>(true);
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const providerName = useMemo(() => services[0]?.providerName || "Provider", [services]);
  const providerType = useMemo(() => services[0]?.providerType || undefined, [services]);

  // Normalize avatar URL: if it's relative (e.g., "/uploads/..."), prefix with API base
  const avatarSrc = useMemo(() => {
    const src = providerUser?.avatar || "";
    if (!src) return undefined;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
    try { return apiUrl(src); } catch { return src; }
  }, [providerUser?.avatar]);

  // Filter services based on search and price filters
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query)
      );
    }

    // Apply price filter
    if (priceFilter && priceFilter !== "all") {
      filtered = filtered.filter(service => {
        const price = Number((service as any).price) || 0;
        
        switch (priceFilter) {
          case "free":
            return price === 0;
          case "0-500":
            return price >= 0 && price <= 500;
          case "500-1000":
            return price > 500 && price <= 1000;
          case "1000-2000":
            return price > 1000 && price <= 2000;
          case "2000-5000":
            return price > 2000 && price <= 5000;
          case "5000+":
            return price > 5000;
          case "custom":
            const min = Number(minPrice) || 0;
            const max = Number(maxPrice) || Infinity;
            return price >= min && price <= max;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [services, searchQuery, priceFilter, minPrice, maxPrice]);

  // Fetch provider user data
  useEffect(() => {
    const fetchProviderUser = async () => {
      if (!providerId) {
        console.log('No providerId provided');
        return;
      }
      
      console.log('Fetching provider data for ID:', providerId);
      setUserLoading(true);
      try {
        const response = await fetch(`/api/user/public/${providerId}`);
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Provider user data fetched:', userData);
          console.log('Avatar URL from API:', userData.avatar);
          setProviderUser(userData);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch provider user data", response.status, errorText);
        }
      } catch (error) {
        console.error("Error fetching provider user:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchProviderUser();
  }, [providerId]);

  useEffect(() => {
    let isMounted = true;
    const load = async (p: number) => {
      setIsLoading(true);
      try {
        const { services: batch, hasMore: more } = await ServiceManager.fetchPublicServices({ page: p, limit: 24 });
        if (!isMounted) return;
        const filtered = (batch || []).filter((s) => String((s as any).providerId) === String(providerId));
        setServices((prev) => {
          const byId = new Map(prev.map((s) => [s.id, s] as const));
          for (const s of filtered) byId.set(s.id, s);
          return Array.from(byId.values());
        });
        setHasMore(more);
      } catch (e) {
        console.error("Failed to load provider services:", e);
        setHasMore(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    setServices([]);
    setPage(1);
    if (providerId) void load(1);
    return () => { isMounted = false; };
  }, [providerId]);

  // Socket listener for rating updates
  useEffect(() => {
    if (!socket) return;

    const handleRatingUpdate = (data: { serviceId: string; averageRating: number; totalRatings: number; ratingBadge: 'excellent' | 'good' | 'normal' | 'poor' }) => {
      setServices(prevServices => {
        return prevServices.map(service =>
          service.id === data.serviceId
            ? { ...service, rating: data.averageRating, totalRatings: data.totalRatings, ratingBadge: data.ratingBadge }
            : service
        );
      });
    };

    socket.on('rating_updated', handleRatingUpdate);

    return () => {
      socket.off('rating_updated', handleRatingUpdate);
    };
  }, [socket]);

  // React to live provider profile updates (name, avatar, specialization)
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { providerId: string; name?: string; avatar?: string; specialization?: string } | undefined;
      if (!detail) return;
      if (String(detail.providerId) !== String(providerId)) return;
      // Update header user info
      setProviderUser((prev) => ({ ...(prev || { _id: detail.providerId, name: '', email: '', role: providerType || 'doctor', createdAt: new Date().toISOString() }), ...detail, _id: detail.providerId } as any));
      // Patch services providerName locally for immediate UI consistency
      setServices((prev) => prev.map((s) => ({ ...s, providerName: detail.name || s.providerName })));
    };
    window.addEventListener('provider_profile_updated', handler as EventListener);
    return () => window.removeEventListener('provider_profile_updated', handler as EventListener);
  }, [providerId, providerType]);

  // Listen for per-user immediate badge updates
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent'|'good'|'normal'|'poor' } | undefined;
      if (!detail) return;
      setServices(prev => prev.map(s => s.id === detail.serviceId ? ({ ...s, myBadge: detail.yourBadge } as any) : s));
    };
    window.addEventListener('my_rating_updated', handler as EventListener);
    return () => window.removeEventListener('my_rating_updated', handler as EventListener);
  }, []);

  const loadMore = async () => {
    if (isLoading || hasMore === false) return;
    const next = page + 1;
    setPage(next);
    setIsLoading(true);
    try {
      const { services: batch, hasMore: more } = await ServiceManager.fetchPublicServices({ page: next, limit: 24 });
      const filtered = (batch || []).filter((s) => String((s as any).providerId) === String(providerId));
      setServices((prev) => {
        const byId = new Map(prev.map((s) => [s.id, s] as const));
        for (const s of filtered) byId.set(s.id, s);
        return Array.from(byId.values());
      });
      setHasMore(more);
    } catch (e) {
      console.error("Failed to load more services:", e);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (service: Service) => {
    if (user && user.role !== 'patient' && mode !== 'patient') {
      toast.error('Providers must switch to Patient Mode to book services.', {
        description: 'Click your profile icon and use the toggle to switch modes.',
      });
      return;
    }

    if (user && (service as any).providerId === user.id) {
      toast.error("You cannot book your own service.");
      return;
    }

    navigate('/payment', {
      state: {
        serviceId: service.id,
        serviceName: service.name,
        providerId: (service as any).providerId || service.id,
        providerName: service.providerName,
        providerType: service.providerType,
        price: Number((service as any).price ?? 0),
        image: service.image,
        location: (service as any).city,
        phone: (service as any).providerPhone
      }
    });
  };

  const handleRateService = (service: Service) => {
    if (!user) {
      toast.error('Please login to rate services');
      return;
    }
    if (user.role !== 'patient' && mode !== 'patient') {
      toast.error('Only patients can rate services');
      return;
    }
    setSelectedRatingService(service);
    setRatingModalOpen(true);
  };

  const getCoordinatesForLocation = (location: string) => {
    const locationCoordinates: Record<string, { lat: number; lng: number }> = {
      "Clifton": { lat: 24.8265, lng: 67.0274 },
      "Defence": { lat: 24.8008, lng: 67.0114 },
      "Gulshan": { lat: 24.9130, lng: 67.0983 },
      "North Nazimabad": { lat: 24.9342, lng: 67.0558 },
      "PECHS": { lat: 24.8760, lng: 67.0647 },
      "Bahadurabad": { lat: 24.8744, lng: 67.0469 },
      "Lahore": { lat: 31.5204, lng: 74.3587 },
      "Islamabad": { lat: 33.6844, lng: 73.0479 },
      "Karachi": { lat: 24.8607, lng: 67.0011 }
    };
    return locationCoordinates[location] || locationCoordinates["Karachi"];
  };

  const currentMapService = showLocationMap
    ? (() => {
        const svc = services.find(s => s.id === showLocationMap);
        if (!svc) return null;
        const coordinates = getCoordinatesForLocation((svc as any).city || "Karachi");
        const address = (svc as any).detailAddress || (svc as any).city || "Location not specified";
        return { ...svc, coordinates, address } as any;
      })()
    : null;

  const headingByType = (t?: Service["providerType"]) => {
    switch (t) {
      case "doctor":
        return { label: "Doctor", badgeClass: "bg-green-50 text-green-600 border-green-100" };
      case "laboratory":
        return { label: "Lab", badgeClass: "bg-orange-50 text-orange-600 border-orange-100" };
      case "pharmacy":
        return { label: "Pharmacy", badgeClass: "bg-blue-50 text-blue-600 border-blue-100" };
      case "clinic":
        return { label: "Clinic", badgeClass: "bg-rose-50 text-rose-600 border-rose-100" };
      default:
        return { label: "Provider", badgeClass: "bg-gray-50 text-gray-600 border-gray-100" };
    }
  };

  if ((isLoading && services.length === 0) || userLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Provider Profile</h1>
              <p className="text-lg text-gray-500 max-w-2xl">Loading provider information…</p>
            </div>
          </div>
          <ServiceCardSkeleton count={6} />
        </div>
      </div>
    );
  }

  const meta = headingByType(providerType);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 ring-2 ring-white shadow-lg">
                    <AvatarImage
                      src={avatarSrc}
                      alt={providerUser?.name || providerName}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                      {(providerUser?.name || providerName).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{providerUser?.name || providerName}</h1>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`text-sm px-3 py-1 ${meta.badgeClass} font-semibold`}>
                      <User className="w-4 h-4 mr-1" />
                      {meta.label}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1 bg-green-50 text-green-700 border-green-200">
                      <Award className="w-4 h-4 mr-1" />
                      Verified Provider
                    </Badge>
                  </div>
                  {providerUser?.specialization && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="px-2 py-0.5 text-[12px] bg-gray-100 text-gray-700 border-gray-200">
                        {providerUser.specialization} Specialist
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Active since 2023</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{services.length} Services</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white rounded-xl p-4 shadow-md border">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{filteredServices.length}</div>
                  <div className="text-sm text-gray-600">{filteredServices.length === services.length ? 'Total Services' : `Showing ${filteredServices.length} of ${services.length}`}</div>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm bg-white border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          {/* Price Filter */}
          <div className="flex gap-2 items-center">
            <Filter className="text-gray-400 w-4 h-4" />
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[140px] h-10 text-sm bg-white border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="0-500">PKR 0-500</SelectItem>
                <SelectItem value="500-1000">PKR 500-1K</SelectItem>
                <SelectItem value="1000-2000">PKR 1K-2K</SelectItem>
                <SelectItem value="2000-5000">PKR 2K-5K</SelectItem>
                <SelectItem value="5000+">PKR 5K+</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Custom Range Inputs */}
          {priceFilter === "custom" && (
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 h-10 text-sm bg-white border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 h-10 text-sm bg-white border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* No Results Message */}
      {filteredServices.length === 0 && services.length > 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No services found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setPriceFilter("all");
              setMinPrice("");
              setMaxPrice("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

        {/* Services Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl border border-gray-200 bg-gray-50 h-full flex flex-col">
              <CardContent className="p-5 h-full flex flex-col">
                <div className="w-full h-48 md:h-56 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                  {service.image ? (
                    <img
                      src={(service as any).image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">⚕️</span>
                  )}
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {service.name}
                      <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${meta.badgeClass}`}>{meta.label}</Badge>
                    </h3>
                    <p className="text-sm text-gray-500">{providerUser?.name || service.providerName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {(service as any).price === 0 ? 'Free' : `PKR ${(service as any).price?.toLocaleString?.() || (service as any).price}`}
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-100">
                      {(service as any).category || 'Service'}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                  <RatingBadge 
                    rating={(service as any).averageRating ?? (service as any).rating ?? 0} 
                    totalRatings={(service as any).totalRatings || 0}
                    ratingBadge={(service as any).ratingBadge}
                    yourBadge={(service as any).myBadge || null}
                  />
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{(service as any).city || (service as any).location}</span>
                  </div>
                  {service.providerType === 'doctor' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Home className="w-4 h-4" />
                      <span>Home service</span>
                    </div>
                  )}
                  {(service as any).providerPhone && (
                    <ServiceWhatsAppButton 
                      phoneNumber={(service as any).providerPhone}
                      serviceName={service.name}
                      providerName={service.providerName}
                      providerId={(service as any).providerId}
                    />
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button 
                    className="flex-1 min-w-[100px] bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-300/30 hover:shadow-blue-400/40 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-blue-400"
                    onClick={() => handleBookNow(service)}
                  >
                    <Clock className="w-4 h-4 mr-1" /> Book Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLocationMap(service.id)}
                    className="flex-1 min-w-[100px] bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800"
                  >
                    <MapPin className="w-4 h-4 mr-1" /> Location
                  </Button>
                  {user && user.role === 'patient' && (
                    <Button
                      variant="outline"
                      onClick={() => handleRateService(service)}
                      className="flex-1 min-w-[100px]"
                    >
                      <Star className="w-4 h-4 mr-1" /> Rate
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/service/${service.id}`, { state: { service } })}
                    className="flex-1 min-w-[100px]"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length > 0 && hasMore && (
          <div className="col-span-full flex justify-center mt-8">
            <Button onClick={loadMore} disabled={isLoading} variant="outline">
              {isLoading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}

        {services.length === 0 && !isLoading && (
          <div className="text-center text-gray-600 py-16">No services found for this provider.</div>
        )}

        {/* Location Map Modal */}
        {showLocationMap && currentMapService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-sm w-full">
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{currentMapService.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLocationMap(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
                    <p className="text-sm text-gray-600">{currentMapService.address}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
                    <p className="text-sm text-gray-600">{currentMapService.providerName}</p>
                  </div>
                  
                  {((currentMapService as any).googleMapLink) && (
                    <Button 
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                      onClick={() => window.open((currentMapService as any).googleMapLink as string, '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingModalOpen && selectedRatingService && (
          <RatingModal
            isOpen={ratingModalOpen}
            onClose={() => {
              setRatingModalOpen(false);
              setSelectedRatingService(null);
            }}
            serviceId={selectedRatingService.id}
            serviceName={selectedRatingService.name}
            serviceType={selectedRatingService.providerType}
          />
        )}
      </div>
    </div>
  );
};

export default ProviderProfilePage;

