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
  pharmacyCategory?: string; // Real pharmacy category like Tablets/Capsules for pharmacy services
  labCategory?: string; // Real laboratory category like Blood Test, Urine Test for lab services
  doctorCategory?: string; // Real doctor category like Consultation/Treatment for doctor services
  clinicCategory?: string; // Real clinic/hospital category (e.g., Emergency Care, Blood Bank)
  variants?: Array<{
    imageUrl?: string;
    price?: number;
    city?: string;
    detailAddress?: string;
    hospitalClinicName?: string;
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
  hospitalClinicName?: string;
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
  homeDelivery?: boolean;
  diseases?: string[];
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
    console.log('🧪 SearchServices.mapServices input[0..2]:', (services || []).slice(0,2).map((s:any)=>({
      id: s?.id,
      name: s?.name,
      hospitalClinicName: s?.hospitalClinicName,
      variantsHos: Array.isArray(s?.variants)? s.variants.map((v:any)=>v?.hospitalClinicName) : null,
    })));
    const mapped = (services || []).map((s: Service) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: mapServiceToSearchCategory(s),
      // Keep real pharmacy category separately for badge display
      pharmacyCategory: s.providerType === 'pharmacy' ? ((s as any).category || undefined) : undefined,
      labCategory: s.providerType === 'laboratory' ? ((s as any).category || undefined) : undefined,
      doctorCategory: s.providerType === 'doctor' ? ((s as any).category || undefined) : undefined,
      clinicCategory: s.providerType === 'clinic' ? ((s as any).category || undefined) : undefined,
      icon: getServiceIcon(s),
      image: (s as any).image,
      variants: Array.isArray((s as any).variants) ? (s as any).variants : [],
      // Override provider name for logged-in user's own services
      providerName: (user && String(s.providerId) === String(user.id) ? (user.name || s.providerName) : s.providerName),
      providerId: s.providerId,
      city: (s as any).city,
      hospitalClinicName: (s as any).hospitalClinicName,
      providerType: s.providerType,
      price: s.price,
      rating: (s as any).averageRating ?? (s as any).rating ?? 0,
      ratingBadge: (s as any).ratingBadge ?? null,
      providerPhone: (s as any).providerPhone,
      googleMapLink: (s as any).googleMapLink,
      detailAddress: (s as any).detailAddress,
      // Use backend-provided verification; if missing and it's your own service, fall back to user verification + license
      _providerVerified: (typeof (s as any)._providerVerified !== 'undefined')
        ? Boolean((s as any)._providerVerified)
        : (user && String(s.providerId) === String(user.id)
            && Boolean((user as any)?.isVerified)
            && Boolean((user as any)?.licenseNumber)
            && String((user as any)?.licenseNumber).trim() !== ''),
      availability: (s as any).availability || "Physical",
      serviceType: (s as any).serviceType || undefined,
      homeDelivery: (s.providerType === 'pharmacy' || s.providerType === 'laboratory' || s.providerType === 'clinic' || s.providerType === 'doctor') ? Boolean((s as any).homeDelivery) : undefined,
      diseases: Array.isArray((s as any).diseases) ? ((s as any).diseases as string[]) : undefined,
      // Add main service schedule fields from backend (always include, even if null)
      timeLabel: (s as any).timeLabel || null,
      startTime: (s as any).startTime || null,
      endTime: (s as any).endTime || null,
      days: Array.isArray((s as any).days) ? (s as any).days : null,
    }));
    console.log('✅ SearchServices.mapServices output[0..2]:', mapped.slice(0,2).map((s:any)=>({
      id: s?.id,
      name: s?.name,
      hospitalClinicName: s?.hospitalClinicName,
      variantsHos: Array.isArray(s?.variants)? s.variants.map((v:any)=>v?.hospitalClinicName) : null,
    })));
    return mapped;
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

  // Variant helpers (match Compare/Search pages minimal subset) - Move these BEFORE filteredServices
  const getSlides = (svc: SearchService) => {
    const base = {
      imageUrl: svc.image,
      price: svc.price,
      city: svc.city,
      detailAddress: svc.detailAddress,
      googleMapLink: svc.googleMapLink,
      timeLabel: (svc as any).timeLabel,
      startTime: (svc as any).startTime,
      endTime: (svc as any).endTime,
      days: (svc as any).days,
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

  const filteredServices = realServices.filter(service => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = service.name.toLowerCase().includes(searchLower) ||
      service.category.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.providerName.toLowerCase().includes(searchLower) ||
      (service.city && service.city.toLowerCase().includes(searchLower)) ||
      (getDisplayCity(service) && getDisplayCity(service)!.toLowerCase().includes(searchLower));
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
  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTo12Hour = (time24?: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Build display time label for current slide (similar to DoctorsPage)
  const getDisplayTimeInfo = (svc: SearchService): string | null => {
    const variants = Array.isArray(svc.variants) ? svc.variants : [];
    const totalSlides = 1 + variants.length;
    const rawIdx = activeIdxById[svc.id] ?? 0;
    const idx = ((rawIdx % totalSlides) + totalSlides) % totalSlides;
    
    // For base slide (idx===0), show ONLY main service schedule; do not fallback to variants
    if (idx === 0) {
      const range = (svc as any).startTime && (svc as any).endTime ? `${formatTo12Hour((svc as any).startTime)} - ${formatTo12Hour((svc as any).endTime)}` : "";
      const baseLabel = (svc as any).timeLabel ? String((svc as any).timeLabel) : "";
      // If we have both a label (e.g., "Morning") and a concrete time range, show both: "Morning — 8:26 PM - 7:21 PM"
      const label = baseLabel && range ? `${baseLabel} — ${range}` : (baseLabel || range);
      const days = (svc as any).days ? String((svc as any).days) : "";
      const parts = [label, days].filter(Boolean);
      return parts.length ? parts.join(" · ") : null;
    }

    // For variant slides, show variant schedule
    const v = variants[idx - 1];
    if (!v) return null;
    const range = v.startTime && v.endTime ? `${formatTo12Hour(v.startTime)} - ${formatTo12Hour(v.endTime)}` : "";
    const baseLabel = v.timeLabel ? String(v.timeLabel) : "";
    // If we have both a label (e.g., "Evening") and a concrete time range, show both: "Evening — 8:21 PM - 8:21 PM"
    const label = baseLabel && range ? `${baseLabel} — ${range}` : (baseLabel || range);
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  const getDisplayTimeRange = (svc: SearchService): string | null => {
    const variants = Array.isArray(svc.variants) ? svc.variants : [];
    const totalSlides = 1 + variants.length;
    const rawIdx = activeIdxById[svc.id] ?? 0;
    const idx = ((rawIdx % totalSlides) + totalSlides) % totalSlides;
    
    // For base slide (idx===0), show ONLY main service time range
    if (idx === 0) {
      const hasBase = (svc as any).startTime && (svc as any).endTime;
      if (hasBase) return `${formatTo12Hour((svc as any).startTime)} - ${formatTo12Hour((svc as any).endTime)}`;
      return (svc as any).timeLabel ? String((svc as any).timeLabel) : null;
    }

    // For variant slides, show variant time range
    const v = variants[idx - 1];
    if (!v) return null;
    if (v.startTime && v.endTime) return `${formatTo12Hour(v.startTime)} - ${formatTo12Hour(v.endTime)}`;
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
    // Resolve hospital/clinic name for the active slide (base or variant)
    const resolvedHospitalClinicName = (() => {
      if (activeIdx === 0) return (service as any).hospitalClinicName || undefined;
      const v = Array.isArray(service.variants) ? service.variants[activeIdx - 1] : undefined;
      return v?.hospitalClinicName || (service as any).hospitalClinicName || undefined;
    })();
    navigate(`/service/${service.id}`, {
      state: {
        from: locationHook.pathname + locationHook.search,
        fromSearch: true,
        initialVariantIndex: activeIdx,
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
          _providerVerified: Boolean(service._providerVerified),
          ratingBadge: service.ratingBadge ?? null,
          availability: service.availability,
          location: getDisplayCity(service) ?? service.city ?? undefined,
          address: service.detailAddress ?? undefined,
          providerPhone: service.providerPhone ?? undefined,
          googleMapLink: service.googleMapLink ?? undefined,
          homeDelivery: (service.providerType === 'pharmacy' || service.providerType === 'laboratory' || service.providerType === 'clinic' || service.providerType === 'doctor') ? Boolean(service.homeDelivery) : undefined,
          variants: service.variants || [],
          // Pass main service schedule fields
          timeLabel: (service as any).timeLabel || null,
          startTime: (service as any).startTime || null,
          endTime: (service as any).endTime || null,
          days: Array.isArray((service as any).days) ? (service as any).days : null,
          serviceType: service.serviceType,
          // Ensure hospital/clinic name is available on detail page even without variants
          hospitalClinicName: resolvedHospitalClinicName,
          // Pass diseases for tooltip on detail page
          diseases: Array.isArray((service as any).diseases) ? (service as any).diseases : [],
          // Pass lab category if applicable
          labCategory: service.providerType === 'laboratory' ? (service as any).labCategory : undefined,
          // Pass clinic category if applicable
          clinicCategory: service.providerType === 'clinic' ? (service as any).clinicCategory : undefined,
          // Pass department field to detail page for clinic/hospital services
          department: service.providerType === 'clinic' ? (service as any).department : undefined,
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
      <Card className={`p-1.5 sm:p-2 ${light ? 'bg-white/80' : 'bg-white/90'} backdrop-blur-md shadow-lg border-0 relative z-[100000]`}>
        <div className="flex flex-row lg:flex-row gap-1.5 sm:gap-0 sm:items-center sm:space-x-1.5">
          {/* Category Dropdown */}
          {!hideCategory && (
            <div className="relative hidden sm:block">
              <Button
                variant="ghost"
                className="h-9 px-3 text-gray-600 hover:text-gray-900 text-sm"
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
              className={`h-9 sm:h-10 pl-3 pr-9 border-0 focus:border-transparent active:border-transparent focus:ring-0 focus-visible:ring-0 outline-none focus:outline-none active:outline-none text-sm sm:text-base bg-transparent rounded-md sm:rounded-none placeholder:text-gray-600 placeholder:opacity-100 ${light ? 'text-gray-800' : ''}`}
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
        <Card className="absolute top-full left-0 right-0 mt-2 bg-white/98 backdrop-blur-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border-0 rounded-2xl max-h-[32rem] overflow-hidden z-[100000] animate-in fade-in-0 zoom-in-95 duration-200">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50/90 to-purple-50/90 backdrop-blur-xl border-b border-blue-100/50 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Top results</span>
            <span className="text-xs text-blue-500 bg-blue-100/50 px-2 py-1 rounded-full">{filteredServices.length} found</span>
          </div>
          <div className="max-h-[24rem] overflow-y-auto">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 cursor-pointer text-sm transition-all duration-300 group active:bg-blue-100/50 border-b border-gray-100/50 last:border-b-0 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {getDisplayImage(service) ? (
                        <img
                          src={getDisplayImage(service)!}
                          alt={service.name}
                          className="w-14 h-14 rounded-xl object-cover shadow-lg ring-2 ring-white group-hover:ring-blue-200 transition-all duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-lg ring-2 ring-white group-hover:ring-blue-200 transition-all duration-300 group-hover:scale-105 shadow-lg">
                          {service.icon}
                        </div>
                      )}
                      
                      
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
                      <div className="flex items-center gap-3 min-w-0">
                        <h4 className="font-semibold text-gray-300 text-base truncate group-hover:text-blue-700 transition-colors duration-300" title={service.name}>{service.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm whitespace-nowrap font-medium">
                          {service.providerType === 'doctor' ? 'Doctor' : 
                           service.providerType === 'laboratory' ? 'Lab' :
                           service.providerType === 'pharmacy' ? 'Pharmacy' : 
                           service.providerType === 'clinic' ? 'Hospital' : 'Service'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600 truncate">
                        <button
                          className="text-gray-500 hover:text-blue-600 hover:underline text-left font-medium transition-colors duration-200"
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
                        {getDisplayCity(service) ? <span className="text-gray-400 ml-2">• {getDisplayCity(service)}</span> : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getDisplayPrice(service) != null && (
                        <span className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 whitespace-nowrap font-semibold shadow-sm">
                          {formatPrice(getDisplayPrice(service)!)}
                        </span>
                      )}
                      <button
                        className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        onClick={(e) => { e.stopPropagation(); handleServiceClick(service); }}
                      >
                        View Details
                      </button>
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
            <div className="border-t border-blue-100/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl px-4 py-3 text-center">
              <button
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold bg-white/80 hover:bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Services'}
              </button>
            </div>
          )}
        </Card>
      )}
    </div>

  );
};

export default SearchServices;

