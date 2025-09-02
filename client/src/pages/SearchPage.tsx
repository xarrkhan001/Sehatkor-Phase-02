import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Home, Filter, Search, Clock, X, Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react";
import RatingBadge from "@/components/RatingBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import RatingModal from "@/components/RatingModal";
import { Service } from "@/data/mockData";
import ServiceManager, { Service as RealService } from "@/lib/serviceManager";
import { useCompare } from "@/contexts/CompareContext";
import CompareTray from "@/components/CompareTray";
import SearchPageSkeleton from "@/components/skeletons/SearchPageSkeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import { useSocket } from "@/context/SocketContext";
import BookingOptionsModal from "@/components/BookingOptionsModal";

interface SearchService extends Service {
  isReal?: boolean;
  coordinates?: { lat: number; lng: number };
  address?: string;
  providerPhone?: string;
  googleMapLink?: string;
  ratingBadge?: "excellent" | "good" | "fair" | "poor" | null;
  totalRatings?: number;
  myBadge?: 'excellent' | 'good' | 'fair' | 'poor';
  diseases?: string[];
  availability?: "Online" | "Physical" | "Online and Physical";
}

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [homeServiceOnly, setHomeServiceOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");
  // Local states for manual custom price inputs (allow typing, including empty values)
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<any>(null);
  const { socket } = useSocket();
  const { user, mode } = useAuth();
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentMapService, setCurrentMapService] = useState<SearchService | null>(null);
  const [allServices, setAllServices] = useState<SearchService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [highlightedService, setHighlightedService] = useState<string | null>(null);
  const [priceCache, setPriceCache] = useState<Record<string, number>>({});
  const [visibleCount, setVisibleCount] = useState(6);

  // Track active variant index per service id
  const [activeVariantIndexByService, setActiveVariantIndexByService] = useState<Record<string, number>>({});

  // Variant helpers (variants exist primarily for doctor services)
  const getVariants = (service: any) => Array.isArray((service as any)?.variants) ? (service as any).variants : [];
  // Build slides array: base service first, then variants
  const getSlides = (service: any) => {
    const variants = getVariants(service);
    const base = {
      imageUrl: service.image,
      price: service.price,
      city: service.location,
      detailAddress: (service as any).address,
      googleMapLink: (service as any).googleMapLink,
      timeLabel: (service as any).timeLabel,
      startTime: (service as any).startTime,
      endTime: (service as any).endTime,
      days: (service as any).days,
    };
    return [base, ...variants];
  };
  const getActiveSlide = (service: any) => {
    const slides = getSlides(service);
    const idx = activeVariantIndexByService[service.id] ?? 0;
    const safe = slides.length ? (((idx % slides.length) + slides.length) % slides.length) : 0;
    return slides[safe];
  };
  const getDisplayImage = (service: any) => (getActiveSlide(service)?.imageUrl) || service.image;
  const getDisplayPrice = (service: any) => {
    const vp = getActiveSlide(service)?.price;
    return (vp != null && !Number.isNaN(Number(vp))) ? Number(vp) : service.price;
  };
  const getDisplayLocation = (service: any) => (getActiveSlide(service)?.city) || service.location;
  const getDisplayAddress = (service: any) => (getActiveSlide(service)?.detailAddress) || (service as any).address;
  const getDisplayMapLink = (service: any) => (getActiveSlide(service)?.googleMapLink) || (service as any).googleMapLink;
  // Build display time label for the active slide (timeLabel or start-end + days)
  const getDisplayTimeInfo = (service: any): string | null => {
    const v = getActiveSlide(service);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    const label = (v as any).timeLabel || ((v as any).startTime && (v as any).endTime ? `${formatTime((v as any).startTime)} - ${formatTime((v as any).endTime)}` : "");
    const days = (v as any).days ? String((v as any).days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  // Numeric time range badge for right side (prefer start-end, fallback to timeLabel)
  const getDisplayTimeRange = (service: any): string | null => {
    const v = getActiveSlide(service);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    if ((v as any).startTime && (v as any).endTime) return `${formatTime((v as any).startTime)} - ${formatTime((v as any).endTime)}`;
    return (v as any).timeLabel ? String((v as any).timeLabel) : null;
  };
  const nextVariant = (serviceId: string) => {
    setActiveVariantIndexByService(prev => ({ ...prev, [serviceId]: ((prev[serviceId] ?? 0) + 1) }));
  };
  const prevVariant = (serviceId: string) => {
    setActiveVariantIndexByService(prev => ({ ...prev, [serviceId]: ((prev[serviceId] ?? 0) - 1) }));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (!socket) return;

    type EventA = { serviceId: string; averageRating?: number; totalRatings?: number; ratingBadge?: string };
    type EventB = { serviceId: string; serviceType?: string; ratingBadge?: string; averageRating?: number; totalRatings?: number };
    const handleRatingUpdate = (data: EventA | EventB) => {
      setAllServices(prev =>
        prev.map(service => {
          const isSameService = service.id === (data as any).serviceId;
          const matchesType = (data as any).serviceType ? (service as any)._providerType === (data as any).serviceType : true;
          if (!isSameService || !matchesType) return service;

          const next: any = { ...service };
          if (typeof (data as any).averageRating === 'number') next.rating = (data as any).averageRating;
          if (typeof (data as any).totalRatings === 'number') next.totalRatings = (data as any).totalRatings;
          const incomingBadge = (data as any).ratingBadge as string | undefined;
          const allowed = ["excellent", "good", "fair", "poor"] as const;
          if (incomingBadge && (allowed as readonly string[]).includes(incomingBadge)) {
            next.ratingBadge = incomingBadge as typeof allowed[number];
          }
          return next as SearchService;
        })
      );
    };

    socket.on("rating_updated", handleRatingUpdate);

    return () => {
      socket.off("rating_updated", handleRatingUpdate);
    };
  }, [socket]);

  // If the logged-in user's name changes, update provider names of their services in-place
  useEffect(() => {
    if (!user?.id) return;
    setAllServices(prev => prev.map(s => {
      const pid = (s as any)._providerId;
      if (pid && String(pid) === String(user.id)) {
        return { ...s, provider: user.name || s.provider } as SearchService;
      }
      return s;
    }));
  }, [user?.id, user?.name]);

  // Auto-advance variant/base slides every 10 seconds for services with multiple slides
  useEffect(() => {
    if (!allServices.length) return;
    const timer = setInterval(() => {
      setActiveVariantIndexByService(prev => {
        const next: Record<string, number> = { ...prev };
        for (const svc of allServices) {
          const slides = getSlides(svc);
          if (slides.length > 1) {
            const curr = prev[svc.id] ?? 0;
            next[svc.id] = (curr + 1) % slides.length;
          }
        }
        return next;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [allServices]);

  // Listen for per-user immediate badge updates (optimistic UI)
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent' | 'good' | 'fair' | 'poor' } | undefined;
      if (!detail) return;
      setAllServices(prev => prev.map(s => {
        const matches = s.id === detail.serviceId && (s as any)._providerType === detail.serviceType;
        if (!matches) return s;
        return { ...s, myBadge: detail.yourBadge } as SearchService;
      }));
    };
    window.addEventListener('my_rating_updated', handler as EventListener);
    return () => window.removeEventListener('my_rating_updated', handler as EventListener);
  }, []);

  // Helper function to get coordinates based on location
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
      "Faisalabad": { lat: 31.4504, lng: 73.1350 },
      "Karachi": { lat: 24.8607, lng: 67.0011 }
    };

    return locationCoordinates[location] || locationCoordinates["Karachi"];
  };

  // Generate mock address based on provider and type
  const getMockAddress = (provider: string, type: string, location: string): string => {
    const street = Math.floor(Math.random() * 100) + 1;

    switch (type) {
      case 'Treatment':
      case 'Surgery':
        return `${street} ${location} Clinic, ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
      case 'Medicine':
        return `${provider} Pharmacy, ${street} ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
      case 'Test':
        return `${provider} Lab, ${street} Commercial, ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
      default:
        return `${street} ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
    }
  };

  // Map service types from real services to search types
  const mapServiceTypeToSearch = (service: RealService): "Treatment" | "Medicine" | "Test" | "Surgery" => {
    switch (service.providerType) {
      case 'doctor':
        return 'Treatment';
      case 'pharmacy':
        return 'Medicine';
      case 'laboratory':
        return 'Test';
      case 'clinic':
        return service.category === 'Surgery' ? 'Surgery' : 'Treatment';
      default:
        return 'Treatment';
    }
  };

  // Load real services directly from database
  const loadServices = async () => {
    try {
      setIsLoading(true);
      const { services: realServices } = await ServiceManager.fetchPublicServices({ limit: 500 });

      const formattedRealServices: SearchService[] = realServices.map((service: RealService) => {
        const s: any = {
          id: service.id,
          name: service.name,
          description: (service as any).description || "",
          price: Number((service as any).price) || 0,
          type: mapServiceTypeToSearch(service),
          provider: (service as any).providerName || "Provider",
          image: (service as any).image,
          location: (service as any).location || (service as any).city || "Karachi",
          rating: Number((service as any).rating) || 0,
          ratingBadge: (service as any).ratingBadge ?? null,
          totalRatings: (service as any).totalRatings ?? 0,
          isReal: true,
          // meta
          _providerId: (service as any).providerId,
          _providerType: (service as any).providerType,
          _providerVerified: Boolean((service as any).providerVerified),
          providerPhone: (service as any).providerPhone,
          address: (service as any).detailAddress,
          googleMapLink: (service as any).googleMapLink,
          diseases: Array.isArray((service as any).diseases) ? (service as any).diseases : undefined,
          availability: (service as any).availability as any,
          createdAt: (service as any).createdAt,
          // include pharmacy service type (and pass-through if present on others)
          serviceType: (service as any).serviceType || undefined,
        };

        // coordinates based on location
        if (s.location) s.coordinates = getCoordinatesForLocation(String(s.location));
        // variants passthrough if present (used by doctors)
        if (Array.isArray((service as any).variants)) s.variants = (service as any).variants;

        // restore my rating badge from localStorage
        try {
          const uid = user?.id ? String(user.id) : 'guest';
          const key = `myRating:${uid}:${(service as any).providerType}:${service.id}`;
          const my = localStorage.getItem(key);
          if (my) s.myBadge = my as any;
        } catch { }

        return s as SearchService;
      });

      // Sort: own services first, then by rating badge priority, then by rating (highest first), then by creation date
      formattedRealServices.sort((a: any, b: any) => {
        const aOwn = a._providerId && user?.id && String(a._providerId) === String(user.id);
        const bOwn = b._providerId && user?.id && String(b._providerId) === String(user.id);
        if (aOwn !== bOwn) return aOwn ? -1 : 1;
        // Badge priority: excellent > good > fair > others
        const rank = (s: any) => {
          const badge = (s?.ratingBadge || '').toString().toLowerCase();
          if (badge === 'excellent') return 3;
          if (badge === 'good') return 2;
          if (badge === 'fair') return 1;
          return 0;
        };
        const rb = rank(b) - rank(a);
        if (rb !== 0) return rb;
        // Sort by rating (highest first)
        if (a.rating !== b.rating) return b.rating - a.rating;
        const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bd - ad;
      });

      setAllServices(formattedRealServices);
      // Dynamically set the price slider max to include all services
      const computedMax = Math.max(
        50000,
        ...formattedRealServices.map((s: any) => Number(s?.price ?? 0)).filter((n) => Number.isFinite(n))
      );
      setMaxPrice(computedMax);
      setPriceRange([0, computedMax]);
      setIsLoading(false);
    } catch (error) {
      console.log('Backend is offline, no services available');
      setAllServices([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [user?.id]);

  // Initialize manual inputs when switching to custom price filter
  useEffect(() => {
    if (priceFilter === 'custom') {
      // Clear fields so placeholders (defaults) are visible
      setCustomFrom("");
      setCustomTo("");
    }
  }, [priceFilter]);

  // Helpers to commit manual input values with validation/clamping
  const commitCustomFrom = () => {
    const parsed = customFrom.trim() === '' ? null : Number(customFrom);
    const n = parsed != null && Number.isFinite(parsed) ? parsed : 0;
    const clamped = Math.max(0, Math.min(n, maxPrice));
    const newFrom = Math.min(clamped, priceRange[1]);
    setPriceRange([newFrom, priceRange[1]]);
    setCustomFrom(String(newFrom));
  };

  const commitCustomTo = () => {
    const parsed = customTo.trim() === '' ? null : Number(customTo);
    const n = parsed != null && Number.isFinite(parsed) ? parsed : maxPrice;
    const clamped = Math.max(0, Math.min(n, maxPrice));
    const newTo = Math.max(clamped, priceRange[0]);
    setPriceRange([priceRange[0], newTo]);
    setCustomTo(String(newTo));
  };

  // Backfill exact prices for cards that show 0
  useEffect(() => {
    const fillPrices = async () => {
      const updates: Record<string, number> = {};
      for (const s of allServices) {
        if (!s?.isReal) continue;
        if ((s.price ?? 0) > 0) continue;
        const type = (s as any)._providerType as any;
        if (!type) continue;
        try {
          const svc = await ServiceManager.fetchServiceById(String(s.id), type);
          if (svc?.price != null && Number(svc.price) > 0) {
            updates[s.id] = Number(svc.price);
          }
        } catch { }
      }
      if (Object.keys(updates).length) {
        setPriceCache(prev => ({ ...prev, ...updates }));
        setAllServices(prev => prev.map(s => updates[s.id] ? ({ ...s, price: updates[s.id] }) as any : s));
      }
    };
    if (allServices.length) fillPrices();
  }, [allServices]);

  // Trigger desktop sidebar slide-in
  useEffect(() => {
    const t = setTimeout(() => setSidebarReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Handle URL parameters on component mount
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const queryParam = searchParams.get('q');

    if (serviceParam) {
      setSearchTerm(serviceParam);
      setHighlightedService(serviceParam);
    } else if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [searchParams]);

  // Debounced sync of search term to the URL (?q=)
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(routerLocation.search);
      if (searchTerm?.trim()) params.set('q', searchTerm.trim());
      else params.delete('q');
      navigate({ pathname: routerLocation.pathname, search: params.toString() }, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Live update provider name on search cards when profile changes
  useEffect(() => {
    const handleProviderProfileUpdated = (e: any) => {
      const detail = e?.detail as { providerId?: string; id?: string; name?: string; avatar?: string; specialization?: string } | undefined;
      if (!detail) return;
      const pid = detail.providerId || detail.id;
      if (!pid) return;
      setAllServices(prev => prev.map(s => {
        const serviceProviderId = (s as any)._providerId;
        if (serviceProviderId && String(serviceProviderId) === String(pid)) {
          const next: any = { ...s };
          if (typeof detail.name === 'string') next.provider = detail.name;
          return next as SearchService;
        }
        return s;
      }));
    };
    window.addEventListener('provider_profile_updated', handleProviderProfileUpdated as EventListener);
    return () => window.removeEventListener('provider_profile_updated', handleProviderProfileUpdated as EventListener);
  }, []);

  const filteredServices = useMemo(() => {
    const filtered = allServices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = serviceType === "all" || service.type === serviceType;
      const matchesLocation = location === "all" || service.location?.includes(location);
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      const matchesRating = service.rating >= minRating;
      const matchesHomeService = !homeServiceOnly || service.homeService;

      return matchesSearch && matchesType && matchesLocation && matchesPrice && matchesRating && matchesHomeService;
    });

    // Sort so that highlighted service appears at the top, then real services before mock services
    if (highlightedService) {
      return filtered.sort((a, b) => {
        const aMatches = a.name.toLowerCase() === highlightedService.toLowerCase();
        const bMatches = b.name.toLowerCase() === highlightedService.toLowerCase();
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;

        // If neither matches highlight, prioritize real services
        if (a.isReal && !b.isReal) return -1;
        if (!a.isReal && b.isReal) return 1;
        return 0;
      });
    }

    // User's own items first (newest first), then other real items (newest), then mock
    return filtered.sort((a: any, b: any) => {
      const aOwn = a._providerId && user?.id && String(a._providerId) === String(user.id);
      const bOwn = b._providerId && user?.id && String(b._providerId) === String(user.id);
      if (aOwn !== bOwn) return aOwn ? -1 : 1;
      if (a.isReal !== b.isReal) return a.isReal ? -1 : 1;
      // Badge priority: excellent > good > fair > others
      const rank = (s: any) => {
        const badge = (s?.ratingBadge || '').toString().toLowerCase();
        if (badge === 'excellent') return 3;
        if (badge === 'good') return 2;
        if (badge === 'fair') return 1;
        return 0;
      };
      const rb = rank(b) - rank(a);
      if (rb !== 0) return rb;
      // Sort by rating (highest first)
      if (a.rating !== b.rating) return b.rating - a.rating;
      const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bd - ad;
    });
  }, [searchTerm, serviceType, location, priceRange, minRating, homeServiceOnly, highlightedService, allServices]);

  const servicesToDisplay = useMemo(() => {
    return filteredServices.slice(0, visibleCount);
  }, [filteredServices, visibleCount]);

  const handleBookNow = (service: SearchService) => {
    if (user && user.role !== 'patient' && mode !== 'patient') {
      toast.error('Providers must switch to Patient Mode to book services.', {
        description: 'Click your profile icon and use the toggle to switch modes.',
      });
      return;
    }

    if (user && (service as any)._providerId === user.id) {
      toast.error("You cannot book your own service.");
      return;
    }

    // Determine active slide index and time context
    const slides = getSlides(service);
    const rawIdx = activeVariantIndexByService[service.id] ?? 0;
    const activeIdx = slides.length ? (((rawIdx % slides.length) + slides.length) % slides.length) : 0;
    const timeLabel = getDisplayTimeInfo(service);
    const timeRange = getDisplayTimeRange(service);

    // Prepare service data for booking modal
    const bookingService = {
      id: service.id,
      name: service.name,
      provider: service.provider,
      price: Number(getDisplayPrice(service) ?? (service as any).price ?? 0),
      image: getDisplayImage(service) || service.image,
      location: getDisplayLocation(service) || service.location,
      _providerId: (service as any)._providerId || service.id,
      _providerType: (service as any)._providerType,
      providerPhone: (service as any).providerPhone,
      // variant context
      variantIndex: activeIdx,
      variantLabel: timeLabel,
      variantTimeRange: timeRange,
    } as any;

    setSelectedBookingService(bookingService);
    setIsBookingModalOpen(true);
  };

  const { toggle: toggleGlobalCompare } = useCompare();
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]);
    toggleGlobalCompare(serviceId);
  };

  const handleRateService = (service: SearchService) => {
    if (!user) {
      toast.error('Please login to rate services');
      return;
    }
    if (user.role !== 'patient' && mode !== 'patient') {
      toast.error('Only patients can rate services');
      return;
    }
    setSelectedService(service);
    setIsRatingModalOpen(true);
  };


  const selectedServicesData = allServices.filter(service =>
    selectedServices.includes(service.id)
  );

  const clearFilters = () => {
    setSearchTerm("");
    setServiceType("all");
    setLocation("all");
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setHomeServiceOnly(false);
  };

  // Get emoji for service type
  const getServiceEmoji = (type: string): string => {
    switch (type) {
      case 'Treatment':
        return '🩺';
      case 'Medicine':
        return '💊';
      case 'Test':
        return '🔬';
      case 'Surgery':
        return '🏥';
      default:
        return '⚕️';
    }
  };

  // Toggle location map view
  const toggleLocationMap = (serviceId: string) => {
    if (showLocationMap === serviceId) {
      setShowLocationMap(null);
      setIsMapExpanded(false);
    } else {
      setShowLocationMap(serviceId);
      setIsMapExpanded(false);
    }
  };

  // Update current service being shown on map when showLocationMap changes (variant-aware)
  useEffect(() => {
    if (showLocationMap) {
      const service = allServices.find(s => s.id === showLocationMap);
      if (service) {
        const augmented: any = {
          ...service,
          location: getDisplayLocation(service),
          address: getDisplayAddress(service),
          googleMapLink: getDisplayMapLink(service),
        };
        setCurrentMapService(augmented);
      } else {
        setCurrentMapService(null);
      }
    } else {
      setCurrentMapService(null);
    }
  }, [showLocationMap, allServices, activeVariantIndexByService]);

  if (isLoading) {
    return <SearchPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            {/* Left: Title above + Input below */}
            <div className="w-full md:max-w-[420px]">
              <h1 className="text-3xl font-bold mb-2">Search Healthcare Services</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for services, providers, or treatments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 h-12 rounded-2xl bg-white/70 border border-white/60 hover:bg-white focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30 shadow-sm focus:shadow-md transition-all placeholder:text-gray-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Mobile: Filters toggle */}
              <div className="flex justify-start mt-2 md:mt-3 lg:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            {/* Right: Results count */}
            <div className="w-full md:w-auto md:text-right">
              <span className="text-xs font-light text-gray-700">
                Showing {filteredServices.length} {filteredServices.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop: Large Filters icon trigger (click to open/close) */}
        <div className="hidden lg:flex items-center mb-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 shadow-sm px-4 py-2 text-gray-700 hover:border-primary hover:text-primary transition"
            onClick={toggleSidebar}
            aria-label="Toggle filters"
            aria-pressed={isSidebarOpen}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-6 gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${showFilters ? 'block lg:hidden' : 'hidden'} ${isSidebarOpen ? 'lg:block' : 'lg:hidden'} lg:col-span-2 lg:transform lg:transition-all lg:duration-300 lg:ease-out ${sidebarReady ? 'lg:opacity-100 lg:translate-x-0' : 'lg:opacity-0 lg:-translate-x-4'}`}
          >
            <Card className="sticky top-24 z-30 rounded-xl border border-gray-200 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Type */}
                <div>
                  <Label className="text-base font-medium">Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-base font-medium">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {/* Sindh */}
                      <SelectItem value="Karachi">Karachi (Sindh)</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad (Sindh)</SelectItem>
                      <SelectItem value="Sukkur">Sukkur (Sindh)</SelectItem>
                      <SelectItem value="Larkana">Larkana (Sindh)</SelectItem>
                      <SelectItem value="Nawabshah">Nawabshah (Sindh)</SelectItem>
                      <SelectItem value="Mirpur Khas">Mirpur Khas (Sindh)</SelectItem>
                      {/* Punjab */}
                      <SelectItem value="Lahore">Lahore (Punjab)</SelectItem>
                      <SelectItem value="Faisalabad">Faisalabad (Punjab)</SelectItem>
                      <SelectItem value="Rawalpindi">Rawalpindi (Punjab)</SelectItem>
                      <SelectItem value="Multan">Multan (Punjab)</SelectItem>
                      <SelectItem value="Gujranwala">Gujranwala (Punjab)</SelectItem>
                      <SelectItem value="Sialkot">Sialkot (Punjab)</SelectItem>
                      <SelectItem value="Bahawalpur">Bahawalpur (Punjab)</SelectItem>
                      <SelectItem value="Sargodha">Sargodha (Punjab)</SelectItem>
                      <SelectItem value="Gujrat">Gujrat (Punjab)</SelectItem>
                      <SelectItem value="Sheikhupura">Sheikhupura (Punjab)</SelectItem>
                      {/* Khyber Pakhtunkhwa */}
                      <SelectItem value="Peshawar">Peshawar (KPK)</SelectItem>
                      <SelectItem value="Mardan">Mardan (KPK)</SelectItem>
                      <SelectItem value="Lund Khwar">Lund Khwar (KPK)</SelectItem>
                      <SelectItem value="Shergarh">Shergarh (KPK)</SelectItem>
                      <SelectItem value="Abbottabad">Abbottabad (KPK)</SelectItem>
                      <SelectItem value="Swat">Swat/Mingora (KPK)</SelectItem>
                      <SelectItem value="Kohat">Kohat (KPK)</SelectItem>
                      <SelectItem value="Dera Ismail Khan">Dera Ismail Khan (KPK)</SelectItem>
                      <SelectItem value="Mansehra">Mansehra (KPK)</SelectItem>
                      <SelectItem value="Bannu">Bannu (KPK)</SelectItem>
                      {/* Balochistan */}
                      <SelectItem value="Quetta">Quetta (Balochistan)</SelectItem>
                      <SelectItem value="Gwadar">Gwadar (Balochistan)</SelectItem>
                      <SelectItem value="Khuzdar">Khuzdar (Balochistan)</SelectItem>
                      <SelectItem value="Turbat">Turbat (Balochistan)</SelectItem>
                      <SelectItem value="Chaman">Chaman (Balochistan)</SelectItem>
                      <SelectItem value="Sibi">Sibi (Balochistan)</SelectItem>
                      <SelectItem value="Zhob">Zhob (Balochistan)</SelectItem>
                      <SelectItem value="Hub">Hub (Balochistan)</SelectItem>
                      {/* Capital Territory */}
                      <SelectItem value="Islamabad">Islamabad (ICT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium">Price Range</Label>
                  <div className="mt-2">
                    <Select value={priceFilter} onValueChange={(value) => {
                      setPriceFilter(value);
                      if (value === "all") setPriceRange([0, maxPrice]);
                      else if (value === "free") setPriceRange([0, 0]);
                      else if (value === "0-500") setPriceRange([0, 500]);
                      else if (value === "500-1000") setPriceRange([500, 1000]);
                      else if (value === "1000-2000") setPriceRange([1000, 2000]);
                      else if (value === "2000-5000") setPriceRange([2000, 5000]);
                      else if (value === "5000+") setPriceRange([5000, maxPrice]);
                    }}>
                      <SelectTrigger className="bg-white border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                        <SelectValue placeholder="Select price range" />
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
                    {priceFilter === 'custom' && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="customPriceFrom" className="text-sm text-gray-600">From (PKR)</Label>
                          <Input
                            id="customPriceFrom"
                            type="number"
                            min={0}
                            max={maxPrice}
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            onBlur={commitCustomFrom}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                commitCustomFrom();
                              }
                            }}
                            className="mt-1"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customPriceTo" className="text-sm text-gray-600">To (PKR)</Label>
                          <Input
                            id="customPriceTo"
                            type="number"
                            min={0}
                            max={maxPrice}
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            onBlur={commitCustomTo}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                commitCustomTo();
                              }
                            }}
                            className="mt-1"
                            placeholder={String(maxPrice)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-4 px-2">
                      <div className="relative">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={maxPrice}
                          min={0}
                          step={100}
                          className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-blue-500 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-blue-200 [&_.slider-track]:to-purple-200 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-blue-500 [&_.slider-range]:to-purple-500"
                          style={{
                            background: `linear-gradient(to right, 
                              #e2e8f0 0%, 
                              #e2e8f0 ${(priceRange[0] / maxPrice) * 100}%, 
                              #3b82f6 ${(priceRange[0] / maxPrice) * 100}%, 
                              #8b5cf6 ${(priceRange[1] / maxPrice) * 100}%, 
                              #e2e8f0 ${(priceRange[1] / maxPrice) * 100}%, 
                              #e2e8f0 100%)`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">PKR {priceRange[0].toLocaleString()}</span>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">PKR {priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Service */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="homeService"
                    checked={homeServiceOnly}
                    onCheckedChange={(checked) => setHomeServiceOnly(checked === true)}
                  />
                  <Label htmlFor="homeService" className="text-base">
                    Home service available
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className={`${isSidebarOpen ? 'lg:col-span-4' : 'lg:col-span-6'}`}>
            <div className="flex items-center justify-between">

              {selectedServices.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedServices.length} selected for comparison
                </Badge>
              )}
            </div>

            <div className={`grid gap-6 sm:grid-cols-2 ${isSidebarOpen ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
              {servicesToDisplay.map((service) => {
                const isHighlighted =
                  highlightedService &&
                  service.name.toLowerCase() === highlightedService.toLowerCase();

                return (
                  <Card
                    key={service.id}
                    className={`h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl border border-gray-200 bg-gray-50 ${isHighlighted ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Image with Variant Slider (if any) */}
                      <div className="relative w-full h-48 md:h-56 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                        {getDisplayImage(service) ? (
                          <img
                            src={getDisplayImage(service)}
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // prevent infinite loop
                              target.style.display = 'none';
                              const fallback = document.createElement('span');
                              fallback.className = 'text-gray-400 text-4xl';
                              fallback.textContent = getServiceEmoji(service.type);
                              target.parentElement?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <span className="text-gray-400 text-4xl">{getServiceEmoji(service.type)}</span>
                        )}
                        
                        {/* Top-right corner badges (availability moved to action row) */}
                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end">
                          {(service as any)._providerVerified ? (
                            <Badge className="text-[9px] px-1.5 py-0.5 bg-green-600 text-white border-0 shadow-lg">
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="text-[9px] px-1.5 py-0.5 bg-red-600 text-white border-0 shadow-lg">
                              Not Verified
                            </Badge>
                          )}
                          <Badge className="text-[9px] px-1.5 py-0.5 bg-blue-600 text-white border-0 shadow-lg">
                            {(service as any)._providerType === 'doctor' && 'Doctor'}
                            {(service as any)._providerType === 'clinic' && 'Hospital'}
                            {(service as any)._providerType === 'laboratory' && 'Lab'}
                            {(service as any)._providerType === 'pharmacy' && 'Pharmacy'}
                            {!(service as any)._providerType && 'Provider'}
                          </Badge>
                          {/* Availability removed from image overlay */}
                        </div>

                        {getSlides(service).length > 1 && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                            <button
                              onClick={(e) => { e.stopPropagation(); prevVariant(service.id); }}
                              className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 shadow"
                              aria-label="Previous variant"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); nextVariant(service.id); }}
                              className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 shadow"
                              aria-label="Next variant"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {(getSlides(service).length > 1 || getDisplayTimeInfo(service)) && (
                          <div className="absolute left-2 bottom-2 flex items-center gap-2">
                            {getSlides(service).length > 1 && (
                              <div className="bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                                {((((activeVariantIndexByService[service.id] ?? 0) % getSlides(service).length) + getSlides(service).length) % getSlides(service).length) + 1}/{getSlides(service).length}
                              </div>
                            )}
                            {getDisplayTimeInfo(service) && (
                              <div className="bg-black/60 text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{getDisplayTimeInfo(service)}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {getDisplayTimeRange(service) && (
                          <div className="absolute right-2 bottom-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{getDisplayTimeRange(service)}</span>
                          </div>
                        )}
                      </div>

                      {/* Title and Provider */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {service.name}
                            {isHighlighted && (
                              <Badge className="text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border-blue-100">
                                Selected
                              </Badge>
                            )}
                          </h3>
                          <button
                            className="text-sm text-gray-500 hover:text-primary hover:underline text-left"
                            onClick={() => navigate(`/provider/${(service as any)._providerId}`)}
                          >
                            {service.provider}
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-blue-600">
                            {getDisplayPrice(service) === 0
                              ? "Free"
                              : (
                                <>
                                  <span className="text-xs">PKR </span>
                                  <span className="text-sm">{getDisplayPrice(service).toLocaleString()}</span>
                                </>
                              )}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-600 border-rose-100"
                          >
                            {service.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Rating Badge, Location, Availability, Home Service, WhatsApp */}
                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                        <RatingBadge
                          rating={service.rating}
                          ratingBadge={service.ratingBadge}
                          totalRatings={(service as any).totalRatings}
                          yourBadge={(service as any).myBadge || null}
                          size="sm"
                        />
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{getDisplayLocation(service)}</span>
                        </div>
                        {service.homeService && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Home className="w-4 h-4" />
                            <span>Home service</span>
                          </div>
                        )}
                        {(service as any).providerPhone && (
                          <ServiceWhatsAppButton
                            phoneNumber={(service as any).providerPhone}
                            serviceName={service.name}
                            providerName={service.provider}
                            providerId={(service as any)._providerId}
                          />
                        )}
                        {(() => {
                          // Get variant-aware availability
                          const activeSlide = getActiveSlide(service);
                          const availability = activeSlide?.availability || (service as any).availability;
                          
                          if (!availability) return null;
                          
                          return (
                            <AvailabilityBadge availability={availability} size="sm" />
                          );
                        })()}
                        {(service as any)._providerType === 'pharmacy' && (service as any).serviceType && (
                          <ServiceTypeBadge serviceType={(service as any).serviceType} size="sm" />
                        )}
                      </div>
                      {/* Address + Single Disease Badge */}
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 min-w-0">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate" title={getDisplayAddress(service) || getDisplayLocation(service)}>
                            {getDisplayAddress(service) || getDisplayLocation(service)}
                          </span>
                        </div>
                        {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 border-sky-100 whitespace-nowrap"
                            title={(service as any).diseases[0]}
                          >
                            {(service as any).diseases[0]}
                          </Badge>
                        )}
                      </div>
                      {/* Buttons */}
                      <div className="mt-auto flex flex-wrap items-center gap-1.5">
                        <Button
                          size="sm"
                          className="flex-1 min-w-[80px] h-8 text-xs bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-300/30 hover:shadow-blue-400/40 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-blue-400"
                          onClick={() => handleBookNow({ ...(service as any), price: getDisplayPrice(service), image: getDisplayImage(service), location: getDisplayLocation(service) } as any)}
                        >
                          <Clock className="w-3 h-3 mr-1" /> Book
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const augmented: any = { ...service, location: getDisplayLocation(service), address: getDisplayAddress(service), googleMapLink: getDisplayMapLink(service) };
                            setCurrentMapService(augmented);
                            setShowLocationMap(service.id);
                          }}
                          className="flex-1 min-w-[80px] h-8 text-xs bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800"
                        >
                          <MapPin className="w-3 h-3 mr-1" /> Location
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const timeInfo = getDisplayTimeInfo(service);
                            const currentVariantIndex = activeVariantIndexByService[service.id] ?? 0;
                            console.log('Navigating to service detail:', service.id, 'with variant index:', currentVariantIndex);
                            console.log('Service data being passed:', service);
                            navigate(`/service/${service.id}`, {
                              state: {
                                from: `${routerLocation.pathname}${routerLocation.search}`,
                                fromSearch: true,
                                activeVariantIndex: currentVariantIndex,
                                service: {
                                  id: service.id,
                                  name: service.name,
                                  description: service.description,
                                  price: getDisplayPrice(service) ?? service.price,
                                  rating: service.rating ?? 0,
                                  provider: service.provider,
                                  // active slide overrides
                                  image: getDisplayImage(service) || service.image,
                                  location: getDisplayLocation(service) || service.location,
                                  address: getDisplayAddress(service) || (service as any).address,
                                  googleMapLink: getDisplayMapLink(service) || (service as any).googleMapLink,
                                  // provider/meta
                                  providerType: (service as any)._providerType,
                                  providerId: (service as any)._providerId,
                                  totalRatings: (service as any).totalRatings,
                                  providerPhone: (service as any).providerPhone,
                                  coordinates: (service as any).coordinates,
                                  ratingBadge: (service as any).ratingBadge,
                                  myBadge: (service as any).myBadge,
                                  timeInfo,
                                  variants: (service as any).variants || [],
                                  isReal: true,
                                  type: (service as any).category === 'Lab Test' ? 'Test' : (service as any).category === 'Medicine' ? 'Medicine' : (service as any).category === 'Surgery' ? 'Surgery' : 'Treatment',
                                  availability: (service as any).availability,
                                }
                              }
                            });
                          }}
                          className="flex-1 min-w-[80px] h-8 text-xs"
                        >
                          Details
                        </Button>
                        {user && (user.role === 'patient' || mode === 'patient') && (user?.id !== (service as any)._providerId) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRateService(service)}
                            className="flex-1 min-w-[80px] h-8 text-xs"
                          >
                            <Star className="w-3 h-3 mr-1" /> Rate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredServices.length > visibleCount && (
              <div className="col-span-full flex justify-center mt-8">
                <Button onClick={() => setVisibleCount(prev => prev + 9)} variant="outline">
                  Load More
                </Button>
              </div>
            )}

            {filteredServices.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-muted-foreground mb-4">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">No services found</p>
                    <p>Try adjusting your search criteria</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedServicesData.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Service Comparison</CardTitle>
              <CardDescription>
                Compare selected services side by side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Service</th>
                      {selectedServicesData.map((service) => (
                        <th key={service.id} className="text-left p-4 min-w-48">
                          {service.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Provider</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">{service.provider}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Price</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4 font-semibold text-blue-600">
                          {service.price === 0 ? 'Free' : (
                            <>
                              <span className="text-xs">PKR </span>
                              <span className="text-sm">{service.price.toLocaleString()}</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Rating</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {service.rating}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Location</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          <div className="flex items-center gap-2">
                            {service.location}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleLocationMap(service.id)}
                            >
                              <MapPin className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Home Service</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          {service.homeService ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Not Available
                            </Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Action</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setSelectedService(service)}
                            >
                              View Details
                            </Button>
                            <Button
                              className="w-full"
                              onClick={() => {
                                setSelectedService(service);
                                setIsRatingModalOpen(true);
                              }}
                            >
                              Rate
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Location Modal */}
      {showLocationMap && currentMapService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{currentMapService.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLocationMap(null)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-base">{currentMapService.location}</p>
              </div>

              {currentMapService.address && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-base">{currentMapService.address}</p>
                </div>
              )}

              {currentMapService.googleMapLink && (
                <Button
                  className="w-full mt-4"
                  onClick={() => window.open(currentMapService.googleMapLink, '_blank')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Rating Modal */}
      {selectedService && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          serviceId={selectedService.id}
          serviceType={(selectedService as any)._providerType as 'doctor' | 'clinic' | 'laboratory' | 'pharmacy'}
          serviceName={selectedService.name}
        />
      )}

      {/* Booking Options Modal */}
      {selectedBookingService && (
        <BookingOptionsModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedBookingService(null);
          }}
          service={selectedBookingService}
        />
      )}

      <CompareTray />
    </div>
  );
};

export default SearchPage;