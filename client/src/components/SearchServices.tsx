import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchIcon, MapPin, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import ServiceManager, { Service } from "@/lib/serviceManager";
import { useAuth } from "@/contexts/AuthContext";

interface SearchService {
  id: string;
  name: string;
  category: string; // Doctor | Lab Test | Medicine | Surgery
  description: string;
  icon: string; // emoji fallback
  image?: string;
  variants?: Array<{
    imageUrl?: string;
    price?: number;
    city?: string;
    detailAddress?: string;
    googleMapLink?: string;
    timeLabel?: string;
    startTime?: string;
    endTime?: string;
    days?: string;
    availability?: "Online" | "Physical" | "Online and Physical";
  }>;
  providerName: string;
  providerId: string;
  city?: string;
  providerType: Service['providerType'];
  price?: number;
  rating?: number;
  ratingBadge?: "excellent" | "good" | "fair" | "poor" | null;
  providerPhone?: string;
  googleMapLink?: string;
  detailAddress?: string;
  _providerVerified?: boolean;
  availability?: "Online" | "Physical" | "Online and Physical";
  serviceType?: "Sehat Card" | "Private" | "Charity" | "Public" | "NPO" | "NGO";
}

// No fallback or mock data. We will only show real services from backend.

type SearchServicesProps = {
  hideCategory?: boolean;
  hideLocationIcon?: boolean;
  light?: boolean; // lighten whites/opacity for hero usage
};

const SearchServices = ({ hideCategory = false, hideLocationIcon = false, light = false }: SearchServicesProps) => {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [realServices, setRealServices] = useState<SearchService[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [activeIdxById, setActiveIdxById] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = ["All Categories", "Doctor", "Lab Test", "Medicine", "Surgery"];

  useEffect(() => {
    const loadInitialServices = async () => {
      setIsLoading(true);
      setPage(1);
      setRealServices([]);
      try {
        const { services, hasMore: more } = await ServiceManager.fetchPublicServices({
          page: 1,
          limit: 6,
          query: searchTerm || undefined,
          category: selectedCategory === "All Categories" ? undefined : selectedCategory,
        });
        const mapped = mapServices(services);
        setRealServices(mapped);
        setHasMore(more);
      } catch (e) {
        console.error("Failed to load services:", e);
        setRealServices([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialServices();
  }, [searchTerm, selectedCategory]);

  // Live update provider name in dropdown when profile changes
  useEffect(() => {
    const handleProviderProfileUpdated = (e: any) => {
      const detail = e?.detail as { providerId?: string; id?: string; name?: string } | undefined;
      if (!detail) return;
      const pid = detail.providerId || detail.id;
      if (!pid) return;
      setRealServices(prev => prev.map(s => {
        if (s.providerId && String(s.providerId) === String(pid)) {
          return { ...s, providerName: typeof detail.name === 'string' ? detail.name : s.providerName };
        }
        return s;
      }));
    };
    window.addEventListener('provider_profile_updated', handleProviderProfileUpdated as EventListener);
    return () => window.removeEventListener('provider_profile_updated', handleProviderProfileUpdated as EventListener);
  }, []);

  // Fallback: if logged-in user's name changes, patch their own services in place
  useEffect(() => {
    if (!user?.id) return;
    setRealServices(prev => prev.map(s => String(s.providerId) === String(user.id) ? { ...s, providerName: user.name || s.providerName } : s));
  }, [user?.name, user?.id]);

  const mapServices = (services: Service[]): SearchService[] => {
    return (services || []).map((s: Service) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: mapServiceToSearchCategory(s),
      icon: getServiceIcon(s),
      image: (s as any).image,
      variants: Array.isArray((s as any).variants) ? (s as any).variants : [],
      // Override provider name for logged-in user's own services
      providerName: (user && String(s.providerId) === String(user.id) ? (user.name || s.providerName) : s.providerName),
      providerId: s.providerId,
      city: (s as any).city,
      providerType: s.providerType,
      price: s.price,
      rating: (s as any).averageRating ?? (s as any).rating ?? 0,
      ratingBadge: (s as any).ratingBadge ?? null,
      providerPhone: (s as any).providerPhone,
      googleMapLink: (s as any).googleMapLink,
      detailAddress: (s as any).detailAddress,
      _providerVerified: (s as any)._providerVerified,
      availability: (s as any).availability || "Physical",
      serviceType: (s as any).serviceType || "Private",
    }));
  };

  const mapServiceToSearchCategory = (service: Service): string => {
    switch (service.providerType) {
      case 'doctor':
        return 'Doctor';
      case 'laboratory':
        return 'Lab Test';
      case 'pharmacy':
        return 'Medicine';
      case 'clinic':
        return 'Surgery';
      default:
        return 'Other';
    }
  };

  const getServiceIcon = (service: Service): string => {
    switch (service.providerType) {
      case 'doctor':
        return '🩺';
      case 'laboratory':
        return '🔬';
      case 'pharmacy':
        return '💊';
      case 'clinic':
        return '🏥';
      default:
        return '⚕️';
    }
  };

  const filteredServices = realServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setIsLoading(true);
    try {
      const { services, hasMore: more } = await ServiceManager.fetchPublicServices({
        page: nextPage,
        limit: 9,
        query: searchTerm || undefined,
        category: selectedCategory === "All Categories" ? undefined : selectedCategory,
      });
      const mapped = mapServices(services);
      setRealServices(prev => [...prev, ...mapped]);
      setPage(nextPage);
      setHasMore(more);
    } catch (e) {
      console.error("Failed to load more services:", e);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Variant helpers (match Compare/Search pages minimal subset)
  const getSlides = (svc: SearchService) => {
    const base = {
      imageUrl: svc.image,
      price: svc.price,
      city: svc.city,
      detailAddress: svc.detailAddress,
      googleMapLink: svc.googleMapLink,
      timeLabel: undefined as string | undefined,
      startTime: undefined as string | undefined,
      endTime: undefined as string | undefined,
      days: undefined as string | undefined,
      availability: svc.availability,
    };
    const variants = Array.isArray(svc.variants) ? svc.variants : [];
    return [base, ...variants];
  };
  const getActiveSlide = (svc: SearchService) => {
    const slides = getSlides(svc);
    const raw = activeIdxById[svc.id] ?? 0;
    if (!slides.length) return undefined;
    const safe = ((raw % slides.length) + slides.length) % slides.length;
    return slides[safe];
  };
  const getDisplayImage = (svc: SearchService) => getActiveSlide(svc)?.imageUrl || svc.image;
  const getDisplayPrice = (svc: SearchService) => {
    const p = getActiveSlide(svc)?.price;
    return p != null && !Number.isNaN(Number(p)) ? Number(p) : svc.price;
  };
  const getDisplayCity = (svc: SearchService) => getActiveSlide(svc)?.city || svc.city;
  const getDisplayTimeInfo = (svc: SearchService): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    const label = v.timeLabel || (v.startTime && v.endTime ? `${formatTime(v.startTime)} - ${formatTime(v.endTime)}` : "");
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  const getDisplayTimeRange = (svc: SearchService): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    if (v.startTime && v.endTime) return `${formatTime(v.startTime)} - ${formatTime(v.endTime)}`;
    return v.timeLabel ? String(v.timeLabel) : null;
  };
  const nextVariant = (id: string) => setActiveIdxById(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const prevVariant = (id: string) => setActiveIdxById(prev => ({ ...prev, [id]: (prev[id] ?? 0) - 1 }));

  const getBadgeStyles = (badge?: SearchService['ratingBadge']) => {
    switch (badge) {
      case 'excellent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'good':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'fair':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'poor':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getAvailabilityBadgeStyles = (availability?: SearchService['availability']) => {
    switch (availability) {
      case 'Online':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Physical':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'Online and Physical':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getAvailabilityIcon = (availability?: SearchService['availability']) => {
    switch (availability) {
      case 'Online':
        return '💻';
      case 'Physical':
        return '🏥';
      case 'Online and Physical':
        return '🌐';
      default:
        return '🏥';
    }
  };

  const formatPrice = (price?: number) => {
    if (price == null) return '';
    try {
      return `Rs ${price.toLocaleString()}`;
    } catch {
      return `Rs ${price}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleServiceClick = (service: SearchService) => {
    setSearchTerm(service.name);
    setIsOpen(false);
    // Navigate directly to detail page with state for fidelity
    const slides = getSlides(service);
    const rawIdx = activeIdxById[service.id] ?? 0;
    const activeIdx = slides.length ? (((rawIdx % slides.length) + slides.length) % slides.length) : 0;
    const timeLabel = getDisplayTimeInfo(service);
    const timeRange = getDisplayTimeRange(service);
    navigate(`/service/${service.id}`, {
      state: {
        from: locationHook.pathname + locationHook.search,
        fromSearch: true,
        activeVariantIndex: activeIdx,
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          price: getDisplayPrice(service) ?? service.price ?? 0,
          rating: service.rating ?? 0,
          provider: service.providerName,
          providerId: service.providerId,
          image: getDisplayImage(service) ?? service.image,
          type: service.category === 'Lab Test' ? 'Test' : service.category === 'Medicine' ? 'Medicine' : service.category === 'Surgery' ? 'Surgery' : 'Treatment',
          providerType: service.providerType,
          isReal: true,
          ratingBadge: service.ratingBadge ?? null,
          availability: service.availability,
          location: getDisplayCity(service) ?? service.city ?? undefined,
          address: service.detailAddress ?? undefined,
          providerPhone: service.providerPhone ?? undefined,
          googleMapLink: service.googleMapLink ?? undefined,
          variants: service.variants || [],
          variantIndex: activeIdx,
          variantLabel: timeLabel ?? undefined,
          variantTimeRange: timeRange ?? undefined,
          serviceType: service.serviceType,
        }
      }
    });
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="relative w-full max-w-[1100px] mx-auto z-[100000]" ref={searchRef}>
      {/* Search Bar */}
      <Card className={`p-1.5 sm:p-2 ${light ? 'bg-white/80' : 'bg-white/90'} backdrop-blur-md shadow-lg border ${light ? 'border-white/15' : 'border-white/20'} relative z-[100000]`}>
        <div className="flex flex-row lg:flex-row gap-1.5 sm:gap-0 sm:items-center sm:space-x-1.5">
          {/* Category Dropdown */}
          {!hideCategory && (
            <div className="relative hidden sm:block">
              <Button
                variant="ghost"
                className="h-9 px-3 text-gray-600 hover:text-gray-900 border-r border-gray-200 text-sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {selectedCategory}
                <ChevronDown className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}

          {/* Search Input */}
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search doctors, hospital/clinic, medicines, lab tests..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className={`h-9 sm:h-10 pl-3 pr-9 border ${light ? 'border-white/30' : 'border-gray-200'} sm:border-0 focus:ring-0 text-sm sm:text-base bg-transparent rounded-md sm:rounded-none placeholder:text-gray-400 ${light ? 'text-gray-800' : ''}`}
            />
            {!hideLocationIcon && (
              <MapPin className="absolute right-2 sm:right-14 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="h-9 sm:h-10 px-3 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md transition-all duration-300 text-sm"
          >
            <SearchIcon className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </Card>

      {/* Dropdown Results */}
      {isOpen && (searchTerm || selectedCategory !== "All Categories") && (
        <Card className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-xl max-h-[28rem] overflow-hidden z-[100000]">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-3 py-2 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">Top results</span>
            <span className="text-[11px] text-gray-400">{filteredServices.length} found</span>
          </div>
          <div className="max-h-[24rem] overflow-y-auto">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="px-3 py-2.5 hover:bg-gray-50/80 cursor-pointer text-sm transition-colors group active:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {getDisplayImage(service) ? (
                        <img
                          src={getDisplayImage(service)!}
                          alt={service.name}
                          className="w-12 h-12 rounded-md object-cover shadow-sm ring-1 ring-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md flex items-center justify-center text-base ring-1 ring-gray-100">
                          {service.icon}
                        </div>
                      )}
                      
                      {/* Top-right corner badges */}
                      <div className="absolute -top-1 -right-1 flex flex-col gap-0.5 items-end">
                        {service._providerVerified ? (
                          <Badge className="text-[7px] px-1 py-0.5 bg-green-600 text-white border-0 shadow-lg">
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="text-[7px] px-1 py-0.5 bg-red-600 text-white border-0 shadow-lg">
                            Not Verified
                          </Badge>
                        )}
                        <Badge className="text-[7px] px-1 py-0.5 bg-blue-600 text-white border-0 shadow-lg">
                          {service.providerType === 'doctor' ? 'Doctor' : 
                           service.providerType === 'laboratory' ? 'Lab' :
                           service.providerType === 'pharmacy' ? 'Pharmacy' : 
                           service.providerType === 'clinic' ? 'Hospital' : 'Service'}
                        </Badge>
                      </div>
                      
                      {getSlides(service).length > 1 && (
                        <div className="absolute -bottom-1 right-0 flex items-center gap-0.5">
                          <button
                            className="px-1 py-0.5 text-[10px] rounded bg-white/90 border border-gray-200 shadow"
                            onClick={(e) => { e.stopPropagation(); prevVariant(service.id); }}
                            aria-label="Prev"
                          >
                            ‹
                          </button>
                          <button
                            className="px-1 py-0.5 text-[10px] rounded bg-white/90 border border-gray-200 shadow"
                            onClick={(e) => { e.stopPropagation(); nextVariant(service.id); }}
                            aria-label="Next"
                          >
                            ›
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate" title={service.name}>{service.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-rose-50 text-rose-600 border-rose-100 whitespace-nowrap">
                          {service.category}
                        </span>
                        {(() => {
                          // Get variant-aware availability
                          const activeSlide = getActiveSlide(service);
                          const availability = activeSlide?.availability || service.availability;
                          
                          if (!availability) return null;
                          
                          return (
                            <AvailabilityBadge availability={availability} size="sm" />
                          );
                        })()}
                        {service.providerType === 'pharmacy' && service.serviceType && (
                          <ServiceTypeBadge serviceType={service.serviceType} size="sm" />
                        )}
                        {service.ratingBadge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border whitespace-nowrap ${getBadgeStyles(service.ratingBadge)}`}>
                            {service.ratingBadge}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-600 truncate">
                        <button
                          className="text-gray-600 hover:text-primary hover:underline text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Provider clicked:', service.providerId, service.providerName);
                            if (service.providerId) {
                              navigate(`/provider/${service.providerId}`);
                            }
                          }}
                        >
                          {service.providerName}
                        </button>
                        {getDisplayCity(service) ? <span className="text-gray-400"> • {getDisplayCity(service)}</span> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDisplayPrice(service) != null && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap">
                          {formatPrice(getDisplayPrice(service)!)}
                        </span>
                      )}
                      <button
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                        onClick={(e) => { e.stopPropagation(); handleServiceClick(service); }}
                      >
                        View Details
                      </button>
                      {!hideLocationIcon && (
                        <MapPin className="w-4 h-4 text-gray-400 opacity-80 group-hover:text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                <SearchIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>No services found for "{searchTerm}"</p>
                <p className="text-[11px] text-gray-400 mt-1">Try different keywords or categories</p>
              </div>
            )}
          </div>
          {/* Footer CTA */}
          {hasMore && (
            <div className="border-t border-gray-100 bg-white/80 backdrop-blur px-3 py-2 text-center">
              <button
                className="text-[12px] text-rose-600 hover:text-rose-700 font-medium"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </Card>
      )}
    </div>

  );
};

export default SearchServices;

