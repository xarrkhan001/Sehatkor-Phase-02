import { useState, useRef, useEffect, useMemo } from "react";
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
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  // Keep an unfiltered copy to build location options
  const [allFetchedServices, setAllFetchedServices] = useState<SearchService[]>([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [customLocation, setCustomLocation] = useState("");

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
        setAllFetchedServices(mapped);
        // If a location is selected, filter by city or variant city
        const filteredByLoc = (selectedLocation && selectedLocation !== 'all')
          ? mapped.filter(s => {
              const city = (getDisplayCity(s) || s.city || '').toString().toLowerCase();
              return city.includes(String(selectedLocation).toLowerCase());
            })
          : mapped;
        setRealServices(filteredByLoc);
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
  }, [searchTerm, selectedCategory, selectedLocation]);

  // Prefetch a larger pool of services once to build a complete location list (independent of search term)
  useEffect(() => {
    const prefetchLocations = async () => {
      try {
        const { services } = await ServiceManager.fetchPublicServices({ page: 1, limit: 500 });
        const mapped = mapServices(services);
        setAllFetchedServices(mapped);
      } catch {}
    };
    prefetchLocations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Build unique location options with counts from all fetched services (base + variants)
  const locationOptions = (() => {
    const counts = new Map<string, number>();
    for (const s of allFetchedServices) {
      const base = (s.city || '').toString().trim();
      const vs = Array.isArray(s.variants) ? s.variants : [];
      const variantCities = vs.map(v => (v?.city || '').toString().trim()).filter(Boolean);
      const all = [base, ...variantCities].filter(Boolean) as string[];
      const uniq = Array.from(new Set(all.map(x => x.toLowerCase())));
      for (const key of uniq) {
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    // Convert back to displayable items (capitalize as-is from one sample in list if available)
    const items: { label: string; count: number }[] = [];
    for (const [key, count] of counts.entries()) {
      // find original casing example
      const sample = allFetchedServices.find(s =>
        (s.city && s.city.toLowerCase() === key) ||
        (Array.isArray(s.variants) && s.variants.some(v => (v.city || '').toLowerCase() === key))
      );
      const label = (sample && ((sample.city && sample.city.toLowerCase() === key) ? sample.city : (sample.variants || []).find(v => (v.city || '').toLowerCase() === key)?.city)) || key;
      items.push({ label: String(label), count });
    }
    // Sort by count desc then alpha
    items.sort((a, b) => (b.count - a.count) || a.label.localeCompare(b.label));
    // Apply search filter
    const q = locationQuery.trim().toLowerCase();
    const filtered = q ? items.filter(it => it.label.toLowerCase().includes(q)) : items;
    return filtered;
  })();

  // Count how many services exist for the currently selected location (from prefetch stash)
  const locationServiceCount = useMemo(() => {
    if (!allFetchedServices?.length) return 0;
    if (!selectedLocation || selectedLocation === 'all') return allFetchedServices.length;
    const target = String(selectedLocation).toLowerCase();
    return allFetchedServices.filter(s => {
      const base = (s.city || '').toString().toLowerCase();
      const variantCities = Array.isArray(s.variants) ? s.variants.map(v => (v?.city || '').toString().toLowerCase()) : [];
      const all = [base, ...variantCities].filter(Boolean) as string[];
      return all.some(c => c.includes(target));
    }).length;
  }, [allFetchedServices, selectedLocation]);

  // Unified badge style for counts (same color and full circle)
  const getCountBadgeClass = () => 'bg-emerald-500/30 text-emerald-50 border-emerald-400/60';

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
    const matchesLocation = !selectedLocation || selectedLocation === 'all' ||
      (getDisplayCity(service) || service.city || '').toLowerCase().includes(String(selectedLocation).toLowerCase());
    return matchesSearch && matchesCategory && matchesLocation;
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
      // append to unfiltered stash
      setAllFetchedServices(prev => [...prev, ...mapped]);
      const filteredByLoc = (selectedLocation && selectedLocation !== 'all')
        ? mapped.filter(s => {
            const city = (getDisplayCity(s) || s.city || '').toString().toLowerCase();
            return city.includes(String(selectedLocation).toLowerCase());
          })
        : mapped;
      setRealServices(prev => [...prev, ...filteredByLoc]);
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
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedLocation && selectedLocation !== 'all') params.set('loc', String(selectedLocation));
    window.location.href = `/search${params.toString() ? `?${params.toString()}` : ''}`;
  };

  // Geolocation + reverse geocoding helpers
  const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.suburb || data?.address?.state || null;
      return city;
    } catch {
      return null;
    }
  };

  const detectLocation = async () => {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation not supported');
      return;
    }
    setIsDetectingLocation(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const name = await reverseGeocode(latitude, longitude);
      const finalLoc = name || 'Karachi';
      setSelectedLocation(finalLoc);
      try { localStorage.setItem('selectedLocation', finalLoc); } catch {}
      setIsLocationModalOpen(false);
      setIsDetectingLocation(false);
    }, (err) => {
      setGeoError(err.message || 'Failed to detect location');
      setIsDetectingLocation(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  // Initialize selected location from localStorage or auto-detect once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedLocation');
      if (saved) {
        setSelectedLocation(saved);
        return;
      }
    } catch {}
    // Auto-detect silently; do not block UI
    detectLocation();
  }, []);

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
          <div className="flex-1 relative flex items-center gap-2">
            {/* Location trigger at the start (now visible on mobile too) */
            }
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1 px-2 h-9 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition text-xs sm:text-sm"
              title="Select Location"
            >
              {/* Mobile: show only a pin icon; Desktop: chevron + label */}
              <MapPin className="w-4 h-4 sm:hidden text-gray-700" aria-hidden="true" />
              <ChevronDown className="w-4 h-4 hidden sm:inline" />
              <span className="sr-only">{selectedLocation || 'Detecting location'}</span>
              <span className="hidden sm:inline max-w-[140px] truncate">{selectedLocation || 'Detecting...'}</span>
            </button>
            {/* Removed count pill from the search bar as requested */}
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

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100003] flex items-start justify-center pt-20 md:pt-24 pb-8 px-4">
          {/* Dimmed + stronger-blurred overlay for readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md backdrop-saturate-150" onClick={() => setIsLocationModalOpen(false)} />
          {/* Compact glass container with better contrast */}
          <div className="relative w-full max-w-xl mx-4">
            <div className="relative rounded-2xl p-4 sm:p-5 bg-white/12 backdrop-blur-2xl border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Choose Location</h3>
                  <p className="text-[11px] text-white/70">Filter by your city or search across Pakistan</p>
                </div>
                <button onClick={() => setIsLocationModalOpen(false)} className="text-white/80 hover:text-white text-lg leading-none">×</button>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={detectLocation}
                  className="flex-1 h-9 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm shadow shadow-blue-900/20 flex items-center justify-center gap-2"
                  disabled={isDetectingLocation}
                >
                  {/* Mobile: icon only; Desktop: text */}
                  <MapPin className="w-4 h-4 sm:hidden text-white" aria-hidden="true" />
                  <span className="hidden sm:inline">{isDetectingLocation ? 'Detecting...' : 'Use Current Location'}</span>
                  <span className="sr-only">Use Current Location</span>
                </button>
                <button
                  onClick={() => { setSelectedLocation('all'); try { localStorage.setItem('selectedLocation', 'all'); } catch {}; setIsLocationModalOpen(false); }}
                  className="flex-1 h-9 rounded-md border border-white/30 text-white/90 hover:bg-white/10 text-sm"
                >
                  All Pakistan
                </button>
              </div>

              {/* Search and custom entry */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 mb-2">
                <div className="sm:col-span-3 min-w-0">
                  <input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full h-11 px-3 rounded-none bg-white/20 text-white placeholder-white/80 border border-white/30 focus:outline-none"
                    placeholder="Search cities (e.g. Karachi, Lahore)"
                  />
                </div>
                <div className="sm:col-span-3 min-w-0">
                  <div className="flex items-center min-w-0">
                    <input
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="flex-1 h-11 px-3 rounded-none bg-white/20 text-white placeholder-white/80 border border-white/30 focus:outline-none min-w-0"
                      placeholder="Enter custom city"
                    />
                    <button
                      onClick={() => {
                        const v = customLocation.trim();
                        if (!v) return;
                        setSelectedLocation(v);
                        try { localStorage.setItem('selectedLocation', v); } catch {}
                        setIsLocationModalOpen(false);
                      }}
                      className="w-10 h-11 rounded-none text-green-600 border border-l-0 border-green-500 bg-green-700/20 hover:bg-green-700/30 flex items-center justify-center -ml-px shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                      aria-label="Apply custom city"
                    >
                      {/* Bolder check icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="text-green-600 drop-shadow" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic locations list (slightly taller) */}
              <div className="max-h-72 overflow-y-auto rounded-none border border-white/30 bg-white/10 glass-scroll">
                {locationOptions.length ? (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 p-2">
                    {locationOptions.map(({ label, count }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setSelectedLocation(label);
                          try { localStorage.setItem('selectedLocation', label); } catch {}
                          setIsLocationModalOpen(false);
                        }}
                        className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-none border text-sm transition ${selectedLocation === label ? 'bg-blue-500/30 border-blue-300/60 text-white' : 'bg-white/15 hover:bg-white/25 border-white/30 text-white'}`}
                      >
                        <span className="truncate">{label}</span>
                        <span className={`inline-flex items-center justify-center w-6 h-6 text-[10px] font-semibold rounded-full border ${getCountBadgeClass()}`}>{count}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center text-white/70 text-sm">No matching cities</div>
                )}
              </div>

              {geoError ? (
                <div className="mt-2 text-[11px] text-red-300">{geoError}</div>
              ) : (
                <div className="mt-2 text-[11px] text-white/70">Tip: Choose "All Pakistan" to see services across all cities.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && (
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

      {/* Local scrollbar styling for the modal list (transparent track like modal) */}
      <style>
        {`
          .glass-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.25) transparent;
          }
          .glass-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .glass-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .glass-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.25);
            border-radius: 9999px;
            border: 1px solid rgba(255,255,255,0.35);
          }
          .glass-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.35);
          }
        `}
      </style>
    </div>

  );
};

export default SearchServices;

