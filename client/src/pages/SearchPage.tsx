import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";

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

import { Star, MapPin, Home, Filter, Search, Clock, X, Maximize2, Minimize2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

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

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

import { useSocket } from "@/context/SocketContext";

import BookingOptionsModal from "@/components/BookingOptionsModal";

import EmptyState from "@/components/EmptyState";

import PageSearchHeader from "@/components/PageSearchHeader";



// Map rating badge to tailwind classes used for small label chips

const getRatingBadgeClass = (badge: "excellent" | "good" | "fair" | "poor" | null | undefined): string => {

  switch (badge) {

    case "excellent":

      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "good":

      return "bg-blue-50 text-blue-700 border-blue-200";

    case "fair":

      return "bg-yellow-50 text-yellow-700 border-yellow-200";

    case "poor":

      return "bg-red-50 text-red-700 border-red-200";

    default:

      return "bg-gray-50 text-gray-600 border-gray-200";

  }

};



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

  homeDelivery?: boolean;

  // Backend service type for pricing/coverage category

  serviceType?: "Sehat Card" | "Private" | "Charity" | "Public" | "NPO" | "NGO";

  // For pharmacy cards: show real medicine category (Tablets, Capsules, etc.)

  pharmacyCategory?: string;

  // For doctor cards: show real category from backend (Consultation, Therapy, etc.)

  doctorCategory?: string;

  // For clinic/hospital cards: real category from backend (e.g., Emergency Care, Blood Bank)

  clinicCategory?: string;

  // Optional fields referenced in sorting or mapping

  createdAt?: string;

  category?: string;

  providerName?: string;

  providerId?: string;

}



const SearchPage = () => {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const routerLocation = useLocation();



  const [searchTerm, setSearchTerm] = useState("");

  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);

  const [location, setLocation] = useState<string>("all");

  const [priceRange, setPriceRange] = useState([0, 50000]);

  const [maxPrice, setMaxPrice] = useState(50000);

  const [minRating, setMinRating] = useState(0);

  const [homeServiceOnly, setHomeServiceOnly] = useState(false);

  const [priceFilter, setPriceFilter] = useState("all");

  // New: Availability filter (All, Online, Physical, Online and Physical)

  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

  // New: All Categories hierarchical filter (Doctors/Hospitals/Labs/Pharmacies and sub-categories)

  // Encoded values: "all" | "doctor" | "doctor:Consultation" | "clinic:Surgery" | "laboratory:Blood Test" | "pharmacy:Tablets" etc.

  const [categoryFilter, setCategoryFilter] = useState<string>("all");



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

  const [visibleCount, setVisibleCount] = useState(12);

  const [expandedDiseases, setExpandedDiseases] = useState<string | null>(null);



  // Small inline virus icon to match DoctorsPage

  const VirusIcon = ({ className }: { className?: string }) => (

    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>

      <circle cx="32" cy="32" r="14" fill="#22c55e" />

      {Array.from({ length: 12 }).map((_, i) => {

        const angle = (i * Math.PI * 2) / 12;

        const x2 = 32 + Math.cos(angle) * 22;

        const y2 = 32 + Math.sin(angle) * 22;

        const x1 = 32 + Math.cos(angle) * 14;

        const y1 = 32 + Math.sin(angle) * 14;

        return (

          <g key={i} stroke="#22c55e" strokeWidth="3" strokeLinecap="round">

            <line x1={x1} y1={y1} x2={x2} y2={y2} />

            <circle cx={x2} cy={y2} r="2.5" fill="#22c55e" />

          </g>

        );

      })}

      <circle cx="26" cy="30" r="2.5" fill="#16a34a" />

      <circle cx="36" cy="35" r="3" fill="#16a34a" />

      <circle cx="32" cy="26" r="2" fill="#16a34a" />

    </svg>

  );



  // Track active variant index per service id

  const [activeVariantIndex, setActiveVariantIndex] = useState<Record<string, number>>({});



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

      hospitalClinicName: (service as any).hospitalClinicName,

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

    const idx = activeVariantIndex[service.id] ?? 0;

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

  // Convert 24-hour time to 12-hour format with AM/PM

  const formatTo12Hour = (time24?: string): string => {

    if (!time24) return "";

    const [hours, minutes] = time24.split(':');

    const hour24 = parseInt(hours, 10);

    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;

  };



  // Build display time label for the active slide (timeLabel or start-end + days)

  const getDisplayTimeInfo = (service: any): string | null => {

    const v = getActiveSlide(service);

    if (!v) return null;

    const label = (v as any).timeLabel || ((v as any).startTime && (v as any).endTime ? `${formatTo12Hour((v as any).startTime)} - ${formatTo12Hour((v as any).endTime)}` : "");

    const days = (v as any).days ? String((v as any).days) : "";

    const parts = [label, days].filter(Boolean);

    return parts.length ? parts.join(" · ") : null;

  };

  // Numeric time range badge for right side (prefer start-end, fallback to timeLabel)

  const getDisplayTimeRange = (service: any): string | null => {

    const v = getActiveSlide(service);

    if (!v) return null;

    if ((v as any).startTime && (v as any).endTime) return `${formatTo12Hour((v as any).startTime)} - ${formatTo12Hour((v as any).endTime)}`;

    return (v as any).timeLabel ? String((v as any).timeLabel) : null;

  };

  const nextVariant = (serviceId: string) => {

    setActiveVariantIndex(prev => ({ ...prev, [serviceId]: ((prev[serviceId] ?? 0) + 1) }));

  };

  const prevVariant = (serviceId: string) => {

    setActiveVariantIndex(prev => ({ ...prev, [serviceId]: ((prev[serviceId] ?? 0) - 1) }));

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



    // Live update: recommended flag toggled by admin

    const handleRecommendedToggle = (data: { serviceId: string; providerType: string; recommended: boolean }) => {

      setAllServices(prev => prev.map(s => {

        const matches = s.id === data.serviceId && String((s as any)._providerType) === String(data.providerType);

        return matches ? ({ ...s, recommended: Boolean(data.recommended) } as any) : s;

      }));

    };

    socket.on('service_recommendation_toggled', handleRecommendedToggle);



    return () => {

      socket.off("rating_updated", handleRatingUpdate);

      socket.off('service_recommendation_toggled', handleRecommendedToggle);

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

  }, [user?.id]);



  // Auto-advance variant/base slides every 10 seconds for services with multiple slides

  useEffect(() => {

    if (!allServices.length) return;

    const timer = setInterval(() => {

      setActiveVariantIndex(prev => {

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
      "pindi": { lat: 33.5651, lng: 73.0169 }, // Rawalpindi
      "Faisalabad": { lat: 31.4504, lng: 73.1350 },
      "Mardan": { lat: 34.1989, lng: 72.0231 },
      "Peshawar": { lat: 34.0151, lng: 71.5249 },
      "Swat": { lat: 35.2227, lng: 72.4258 },
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

          // Address and Maps support for Location modal

          address: (service as any).detailAddress || undefined,

          googleMapLink: (service as any).googleMapLink || undefined,

          hospitalClinicName: (service as any).hospitalClinicName || undefined,

          rating: Number((service as any).rating) || 0,

          ratingBadge: (service as any).ratingBadge ?? null,

          diseases: Array.isArray((service as any).diseases) ? (service as any).diseases : undefined,

          availability: (service as any).availability as any,

          createdAt: (service as any).createdAt,

          // meta for navigation and actions

          _providerId: (service as any).providerId,

          _providerType: (service as any).providerType,

          providerPhone: (service as any).providerPhone,

          // Preserve real pharmacy category from backend for badge display

          pharmacyCategory: ((service as any).providerType === 'pharmacy') ? ((service as any).category || undefined) : undefined,

          // Preserve real lab category from backend for badge display

          labCategory: ((service as any).providerType === 'laboratory') ? ((service as any).category || undefined) : undefined,

          // Preserve real doctor category from backend for badge display

          doctorCategory: ((service as any).providerType === 'doctor') ? ((service as any).category || undefined) : undefined,

          // Preserve real clinic/hospital category from backend for badge display

          clinicCategory: ((service as any).providerType === 'clinic') ? ((service as any).category || undefined) : undefined,

          // Preserve department field for hospital services

          department: ((service as any).providerType === 'clinic') ? ((service as any).department || undefined) : undefined,

          // include pharmacy service type (and pass-through if present on others)

          serviceType: (service as any).serviceType || undefined,

          // include homeDelivery from backend

          homeDelivery: Boolean((service as any).homeDelivery),

          // Add main service schedule fields

          timeLabel: (service as any).timeLabel || null,

          startTime: (service as any).startTime || null,

          endTime: (service as any).endTime || null,

          days: Array.isArray((service as any).days) ? (service as any).days : null,

          // include recommended flag for overlay tag

          recommended: Boolean((service as any).recommended),

          // Verification: trust backend `_providerVerified`; if missing and it's your own service, fallback to AuthContext

          _providerVerified: (typeof (service as any)._providerVerified !== 'undefined')

            ? Boolean((service as any)._providerVerified)

            : (user && String((service as any).providerId) === String(user.id)

              && Boolean((user as any)?.isVerified)

              && Boolean((user as any)?.licenseNumber)

              && String((user as any)?.licenseNumber).trim() !== ''),

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



      // Sort: own services first, then recommended services, then by rating badge priority, then by rating (highest first), then by creation date

      formattedRealServices.sort((a: any, b: any) => {

        const aOwn = a._providerId && user?.id && String(a._providerId) === String(user.id);

        const bOwn = b._providerId && user?.id && String(b._providerId) === String(user.id);

        if (aOwn !== bOwn) return aOwn ? -1 : 1;



        // Recommended services priority (recommended services appear first)

        const aRecommended = Boolean(a.recommended);

        const bRecommended = Boolean(b.recommended);

        if (aRecommended !== bRecommended) return bRecommended ? 1 : -1;



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
      // Enhanced search matching for better doctor discoverability
      const searchLower = searchTerm.toLowerCase().trim();

      // 1. Provider name matching (highest priority)
      const providerNameMatch = service.provider.toLowerCase().includes(searchLower);

      // 2. Service name matching
      const serviceNameMatch = service.name.toLowerCase().includes(searchLower);

      // 3. Specialization matching (for doctors)
      const specializationMatch = (service as any).specialization
        ? String((service as any).specialization).toLowerCase().includes(searchLower)
        : false;

      // 4. Disease matching (for doctor services)
      const diseaseMatch = Array.isArray((service as any).diseases)
        ? (service as any).diseases.some((d: string) =>
          (d || '').toLowerCase().includes(searchLower)
        )
        : false;

      // 5. Lab category matching
      const labCategoryMatch = String((service as any).labCategory || '').toLowerCase().includes(searchLower);

      // 6. Description matching (lower priority)
      const descriptionMatch = service.description
        ? service.description.toLowerCase().includes(searchLower)
        : false;

      const matchesSearch = !searchTerm ||
        providerNameMatch ||
        serviceNameMatch ||
        specializationMatch ||
        diseaseMatch ||
        labCategoryMatch ||
        descriptionMatch;

      // Service Type filter now uses backend serviceType (Sehat Card, Private, Charity, Public, NPO, NGO)

      const matchesType = (() => {

        // If no service types selected, show all services

        if (selectedServiceTypes.length === 0) return true;



        const svcType = (service as any).serviceType;



        // If serviceType is undefined or null, don't show when filters are applied

        if (!svcType) return false;



        // Handle array of service types - include if ANY selected type matches (OR logic)

        if (Array.isArray(svcType)) {

          return svcType.some((type: string) => selectedServiceTypes.includes(String(type)));

        }



        // Handle single service type

        return selectedServiceTypes.includes(String(svcType));

      })();

      const matchesLocation = location === "all" || service.location?.includes(location);

      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];

      const matchesRating = service.rating >= minRating;

      // When "Home service available" filter is enabled, only include services with homeDelivery=true

      const matchesHomeService = !homeServiceOnly || service.homeDelivery === true;

      // New: Availability filter condition

      const matchesAvailability = availabilityFilter === 'all'

        || (service.availability && String(service.availability) === availabilityFilter);



      // New: Hierarchical All Categories filter

      let matchesAllCategory = true;

      if (categoryFilter !== 'all') {

        const [type, sub] = categoryFilter.split(":");

        const svcType = String((service as any)._providerType || '').toLowerCase();

        if (!type || svcType !== type.toLowerCase()) {

          matchesAllCategory = false;

        } else if (sub) {

          // Determine the service's subcategory based on provider type

          let svcCategory = '';

          if (svcType === 'pharmacy') {

            svcCategory = String(((service as any).pharmacyCategory ?? service.category) || '');

          } else if (svcType === 'laboratory') {

            svcCategory = String(((service as any).labCategory ?? (service as any).category ?? service.type) || '');

          } else if (svcType === 'clinic') {

            svcCategory = String(((service as any).clinicCategory ?? (service as any).category ?? service.type) || '');

          } else {

            svcCategory = String(((service as any).doctorCategory ?? (service as any).category ?? service.type) || '');

          }

          matchesAllCategory = svcCategory === sub;

        }

      }



      return matchesSearch && matchesType && matchesLocation && matchesPrice && matchesRating && matchesHomeService && matchesAvailability && matchesAllCategory;

    });



    // Sort so that highlighted service appears at the top, then multi-type services when filters are applied,

    // then services matching selected types, then real services before mock services

    if (highlightedService) {

      return filtered.sort((a, b) => {

        const aMatches = a.name.toLowerCase() === highlightedService.toLowerCase();

        const bMatches = b.name.toLowerCase() === highlightedService.toLowerCase();

        if (aMatches && !bMatches) return -1;

        if (!aMatches && bMatches) return 1;



        // When filters are applied, prefer services that have multiple service types

        if (selectedServiceTypes.length > 0) {

          const aSvcType = (a as any).serviceType;

          const bSvcType = (b as any).serviceType;

          const aMulti = Array.isArray(aSvcType);

          const bMulti = Array.isArray(bSvcType);

          if (aMulti !== bMulti) return aMulti ? -1 : 1;



          // Check if service matches ALL selected service types (highest priority)

          const aMatchesAllSelected = (() => {

            if (!aSvcType) return false;

            const serviceTypes = Array.isArray(aSvcType) ? aSvcType : [aSvcType];

            return selectedServiceTypes.every(selectedType => serviceTypes.includes(String(selectedType)));

          })();



          const bMatchesAllSelected = (() => {

            if (!bSvcType) return false;

            const serviceTypes = Array.isArray(bSvcType) ? bSvcType : [bSvcType];

            return selectedServiceTypes.every(selectedType => serviceTypes.includes(String(selectedType)));

          })();



          // Services matching ALL selected types come first

          if (aMatchesAllSelected && !bMatchesAllSelected) return -1;

          if (!aMatchesAllSelected && bMatchesAllSelected) return 1;



          // Then services matching ANY selected types

          const aMatchesSelected = (() => {

            if (!aSvcType) return false;

            if (Array.isArray(aSvcType)) {

              return aSvcType.some(type => selectedServiceTypes.includes(String(type)));

            }

            return selectedServiceTypes.includes(String(aSvcType));

          })();



          const bMatchesSelected = (() => {

            if (!bSvcType) return false;

            if (Array.isArray(bSvcType)) {

              return bSvcType.some(type => selectedServiceTypes.includes(String(type)));

            }

            return selectedServiceTypes.includes(String(bSvcType));

          })();



          if (aMatchesSelected && !bMatchesSelected) return -1;

          if (!aMatchesSelected && bMatchesSelected) return 1;

        }



        // If neither matches highlight, prioritize real services

        if (a.isReal && !b.isReal) return -1;

        if (!a.isReal && b.isReal) return 1;

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

    }

    // No highlighted service: when service type filters are applied, prefer multi-type services first

    if (selectedServiceTypes.length > 0) {

      return filtered.sort((a, b) => {

        const aSvcType = (a as any).serviceType;

        const bSvcType = (b as any).serviceType;

        const aMulti = Array.isArray(aSvcType);

        const bMulti = Array.isArray(bSvcType);

        if (aMulti !== bMulti) return aMulti ? -1 : 1;



        // Then services matching ALL selected types

        const aMatchesAllSelected = (() => {

          if (!aSvcType) return false;

          const serviceTypes = Array.isArray(aSvcType) ? aSvcType : [aSvcType];

          return selectedServiceTypes.every(selectedType => serviceTypes.includes(String(selectedType)));

        })();

        const bMatchesAllSelected = (() => {

          if (!bSvcType) return false;

          const serviceTypes = Array.isArray(bSvcType) ? bSvcType : [bSvcType];

          return selectedServiceTypes.every(selectedType => serviceTypes.includes(String(selectedType)));

        })();

        if (aMatchesAllSelected && !bMatchesAllSelected) return -1;

        if (!aMatchesAllSelected && bMatchesAllSelected) return 1;



        // Then services matching ANY selected types

        const aMatchesAnySelected = (() => {

          if (!aSvcType) return false;

          if (Array.isArray(aSvcType)) return aSvcType.some(type => selectedServiceTypes.includes(String(type)));

          return selectedServiceTypes.includes(String(aSvcType));

        })();

        const bMatchesAnySelected = (() => {

          if (!bSvcType) return false;

          if (Array.isArray(bSvcType)) return bSvcType.some(type => selectedServiceTypes.includes(String(type)));

          return selectedServiceTypes.includes(String(bSvcType));

        })();

        if (aMatchesAnySelected && !bMatchesAnySelected) return -1;

        if (!aMatchesAnySelected && bMatchesAnySelected) return 1;



        // Then real services first

        if (a.isReal && !b.isReal) return -1;

        if (!a.isReal && b.isReal) return 1;



        // Then by rating badge priority

        const rank = (s: any) => {

          const badge = (s?.ratingBadge || '').toString().toLowerCase();

          if (badge === 'excellent') return 3;

          if (badge === 'good') return 2;

          if (badge === 'fair') return 1;

          return 0;

        };

        const rb = rank(b) - rank(a);

        if (rb !== 0) return rb;



        // Then by rating (highest first), then by createdAt desc

        if (a.rating !== b.rating) return b.rating - a.rating;

        const ad = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;

        const bd = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;

        return bd - ad;

      });

    }

    // Enhanced default sorting: prioritize search relevance when search term is present
    if (searchTerm && searchTerm.trim()) {
      return filtered.sort((a, b) => {
        const searchLower = searchTerm.toLowerCase().trim();

        // 1. Exact provider name match (highest priority)
        const aProviderExact = a.provider.toLowerCase() === searchLower;
        const bProviderExact = b.provider.toLowerCase() === searchLower;
        if (aProviderExact && !bProviderExact) return -1;
        if (!aProviderExact && bProviderExact) return 1;

        // 2. Provider name starts with search term
        const aProviderStarts = a.provider.toLowerCase().startsWith(searchLower);
        const bProviderStarts = b.provider.toLowerCase().startsWith(searchLower);
        if (aProviderStarts && !bProviderStarts) return -1;
        if (!aProviderStarts && bProviderStarts) return 1;

        // 3. Provider name contains search term
        const aProviderContains = a.provider.toLowerCase().includes(searchLower);
        const bProviderContains = b.provider.toLowerCase().includes(searchLower);
        if (aProviderContains && !bProviderContains) return -1;
        if (!aProviderContains && bProviderContains) return 1;

        // 4. Specialization match (for doctors)
        const aSpecMatch = (a as any).specialization
          ? String((a as any).specialization).toLowerCase().includes(searchLower)
          : false;
        const bSpecMatch = (b as any).specialization
          ? String((b as any).specialization).toLowerCase().includes(searchLower)
          : false;
        if (aSpecMatch && !bSpecMatch) return -1;
        if (!aSpecMatch && bSpecMatch) return 1;

        // 5. Service name exact match
        const aServiceExact = a.name.toLowerCase() === searchLower;
        const bServiceExact = b.name.toLowerCase() === searchLower;
        if (aServiceExact && !bServiceExact) return -1;
        if (!aServiceExact && bServiceExact) return 1;

        // 6. Service name contains search term
        const aServiceContains = a.name.toLowerCase().includes(searchLower);
        const bServiceContains = b.name.toLowerCase().includes(searchLower);
        if (aServiceContains && !bServiceContains) return -1;
        if (!aServiceContains && bServiceContains) return 1;

        // 7. Then by verification status (verified doctors first)
        const aVerified = (a as any)._providerVerified;
        const bVerified = (b as any)._providerVerified;
        if (aVerified && !bVerified) return -1;
        if (!aVerified && bVerified) return 1;

        // 8. Then by rating badge
        const rank = (s: any) => {
          const badge = (s?.ratingBadge || '').toString().toLowerCase();
          if (badge === 'excellent') return 3;
          if (badge === 'good') return 2;
          if (badge === 'fair') return 1;
          return 0;
        };
        const rb = rank(b) - rank(a);
        if (rb !== 0) return rb;

        // 9. Then by rating
        if (a.rating !== b.rating) return b.rating - a.rating;

        // 10. Finally by creation date
        const ad = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
        const bd = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
        return bd - ad;
      });
    }

    return filtered;

  }, [searchTerm, selectedServiceTypes, location, priceRange, minRating, homeServiceOnly, availabilityFilter, categoryFilter, highlightedService, allServices, user?.id]);



  const servicesToDisplay = useMemo(() => {

    return filteredServices.slice(0, visibleCount);

  }, [filteredServices, visibleCount]);



  // ...

  const handleBookNow = (service: SearchService) => {

    if (!user) {

      toast.error('Please login to book services');

      navigate('/login');

      return;

    }

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

    const rawIdx = activeVariantIndex[service.id] ?? 0;

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

    setSelectedServiceTypes([]);

    setLocation("all");

    setPriceRange([0, maxPrice]);

    setMinRating(0);

    setHomeServiceOnly(false);

    setAvailabilityFilter("all");

    setCategoryFilter("all");

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

  }, [showLocationMap, allServices, activeVariantIndex]);



  if (isLoading) {

    return <SearchPageSkeleton />;

  }



  return (
    <div className="min-h-screen bg-gray-100 relative">
      <Helmet>
        <title>{
          searchTerm
            ? `Sehatkor Services - ${searchTerm} | Pakistan's Best Healthcare Platform`
            : categoryFilter !== 'all'
              ? `Sehatkor Services - Best ${categoryFilter.split(':')[1] || categoryFilter.split(':')[0]} in ${location === 'all' ? 'Pakistan' : location}`
              : `Sehatkor Services - Search Doctors, Hospitals, Labs & Pharmacies | Pakistan Healthcare`
        }</title>
        <meta name="description" content={
          searchTerm
            ? `Sehatkor Services - Find ${searchTerm} in ${location === 'all' ? 'Pakistan' : location}. Book appointments with top rated doctors, hospitals, labs, pharmacies. 24/7 support, instant booking.`
            : `Sehatkor Services - Find and book the best ${categoryFilter !== 'all' ? (categoryFilter.split(':')[1] || categoryFilter.split(':')[0]) : 'doctors, hospitals, labs, and pharmacies'} in ${location === 'all' ? 'Pakistan' : location}. Read verified reviews, check fees, instant appointments.`
        } />
        <meta name="keywords" content={(() => {
          const loc = location === 'all' ? 'Pakistan' : location;
          // Clean category string (e.g. "doctor:Cardiologist" -> "Cardiologist")
          const rawCat = categoryFilter !== 'all' ? categoryFilter : '';
          const catParts = rawCat.split(':');
          const mainType = catParts[0]; // doctor, pharmacy, laboratory, clinic
          const subType = catParts[1] || ''; // Cardiologist, Tablets, Blood Test, Surgery

          const baseKeywords = [
            "sehatkor services", "sehatkor.pk", "sehatkor pakistan", "healthcare services pakistan",
            "online doctor Pakistan", "medical services", "health app Pakistan", "doctor booking",
            "hospital booking", "lab test booking", "pharmacy services", "آنلائن ڈاکٹر", "میڈیکل سروس",
            "book appointment online", "sehatkor doctors", "sehatkor hospitals", "sehatkor labs",
            "sehatkor pharmacy", "sehatkor medical", "sehatkor healthcare", "sehatkor consultation",
            "سیہت کور سروسز", "سیہت کور ڈاکٹر", "سیہت کور ہسپتال", "سیہت کور لیب", "سیہت کور فارمیسی",
            "پاکستان میڈیکل سروس", "آن لائن ہیلتھ کیر", "ڈاکٹر اپائنٹمنٹ", "ہسپتال بکنگ", "لیب ٹیسٹ",
            "فارمیسی سروس", "سیہت کور پاکستان", "آن لائن ڈاکٹر پاکستان", "ڈاکٹر بکنگ آن لائن",
            "ہسپتال بکنگ پاکستان", "لیب ٹیسٹ بکنگ", "فارمیسی ڈیلیوری", "میڈیکل کنسلٹیشن",
            "سیہت کور میڈیکل", "پاکستان ہیلتھ سروس", "آن لائن ہسپتال", "ڈاکٹر کنسلٹیشن",
            "لیبارٹری ٹیسٹ", "میڈیسن ڈیلیوری", "سیہت کور ہیلتھ پلیٹ فارم", "پاکستان ڈاکٹر"
          ];

          let dynamicKeywords = [];

          // 1. SPECIFIC SERVICE TYPE LOGIC
          if (mainType === 'doctor') {
            const docKey = subType || 'Doctor';
            dynamicKeywords.push(
              `sehatkor ${docKey.toLowerCase()}`,
              `best ${docKey} in ${loc}`,
              `${docKey} appointment ${loc}`,
              `consult ${docKey} online`,
              `top rated ${docKey} ${loc}`,
              `${docKey} fees`,
              `${docKey} near me`,
              `sehatkor doctor consultation`,
              `online doctor ${loc}`,
              `verified doctor ${loc}`,
              `${loc} میں ${docKey}`,
              `سیہت کور ${docKey.toLowerCase()}`,
              `بہترین ${docKey} ${loc} میں`,
              `${docKey} اپائنٹمنٹ ${loc}`,
              `آن لائن ${docKey} کنسلٹیشن`,
              `${docKey} فیس ${loc}`,
              `${docKey} میرے قریب`
            );
            if (subType) dynamicKeywords.push(`specialist for ${subType} in ${loc}`, `sehatkor ${subType.toLowerCase()} specialist`);
            dynamicKeywords.push(`${loc} میں ${subType || 'ڈاکٹر'}`, `سیہت کور ڈاکٹر`);
          }
          else if (mainType === 'pharmacy' || mainType === 'medicine') {
            const medKey = subType || 'Medicine';
            dynamicKeywords.push(
              `sehatkor pharmacy`,
              `sehatkor medicine`,
              `online pharmacy ${loc}`,
              `buy ${medKey} online ${loc}`,
              `medicine delivery ${loc}`,
              `${medKey} price in Pakistan`,
              `best pharmacy in ${loc}`,
              `sehatkor medical store`,
              `online medicine Pakistan`,
              `sehatkor drug delivery`,
              `${loc} میں فارمیسی`,
              `سیہت کور ادویات`,
              `آن لائن ادویات ${loc}`,
              `${medKey} آن لائن خریدیں ${loc}`,
              `ادویات ڈیلیوری ${loc}`,
              `${medKey} قیمت پاکستان`,
              `بہترین فارمیسی ${loc} میں`,
              `سیہت کور میڈیکل اسٹور`,
              `آنلائن فارمیسی ${loc}`,
              `ادویات کی ڈیلیوری`,
              `سیہت کور فارمیسی`
            );
          }
          else if (mainType === 'laboratory' || mainType === 'lab') {
            const labKey = subType || 'Lab Test';
            dynamicKeywords.push(
              `sehatkor lab`,
              `sehatkor laboratory`,
              `sehatkor diagnostic`,
              `book ${labKey} ${loc}`,
              `home sampling ${loc}`,
              `best diagnostic lab ${loc}`,
              `${labKey} price ${loc}`,
              `Chughtai Lab ${loc}`,
              `Excel Lab ${loc}`,
              `online lab test ${loc}`,
              `sehatkor pathology`,
              `لیب ٹیسٹ گھر پر`,
              `${loc} لیبارٹری`,
              `سیہت کور لیب`
            );
          }
          else if (mainType === 'clinic' || mainType === 'hospital') {
            const hospKey = subType || 'Hospital';
            dynamicKeywords.push(
              `sehatkor hospital`,
              `sehatkor medical center`,
              `best ${hospKey} in ${loc}`,
              `emergency ${hospKey} ${loc}`,
              `${hospKey} contact number`,
              `private hospital ${loc}`,
              `government hospital ${loc}`,
              `sehatkor emergency`,
              `hospital booking ${loc}`
            );
            dynamicKeywords.push(`${loc} ہسپتال`, `ایمرجنسی ڈاکٹر`, `سیہت کور ہسپتال`);
          }
          else if (categoryFilter === 'all' && !searchTerm) {
            // General generic keywords if nothing selected
            dynamicKeywords.push(
              `sehatkor all services`,
              `sehatkor complete healthcare`,
              `doctors in ${loc}`, `hospitals in ${loc}`, `labs in ${loc}`,
              `online medicine ${loc}`, `medical store ${loc}`,
              `sehatkor one stop healthcare`,
              `complete medical services ${loc}`
            );
          }

          // 2. SEARCH TERM & LOCATION COMBINATIONS
          if (searchTerm) {
            dynamicKeywords.push(
              `sehatkor ${searchTerm.toLowerCase()}`,
              `${searchTerm} treatment ${loc}`,
              `${searchTerm} specialist ${loc}`,
              `${searchTerm} medicine price`,
              `${searchTerm} test cost`,
              `sehatkor search ${searchTerm.toLowerCase()}`,
              `find ${searchTerm} on sehatkor`
            );
          }

          // 3. BRAND & INTENT KEYWORDS
          dynamicKeywords.push(
            `sehatkor ${loc}`,
            `sehatkor services ${loc}`,
            `marham alternative ${loc}`,
            `oladoc alternative ${loc}`,
            `PMDC verified`,
            `sehatkor verified doctors`,
            `sehatkor trusted healthcare`,
            `sehatkor 24/7 support`,
            `sehatkor instant booking`,
            `sehatkor lowest fees`
          );

          // 4. ADDITIONAL SERVICE KEYWORDS
          dynamicKeywords.push(
            "sehatkor emergency services", "sehatkor covid test", "sehatkor vaccination",
            "sehatkor blood test", "sehatkor ultrasound", "sehatkor x-ray", "sehatkor mri",
            "sehatkor ct scan", "sehatkor health checkup", "sehatkor full body checkup",
            "sehatkor diabetes test", "sehatkor pregnancy test", "sehatkor child vaccination",
            "sehatkor online prescription", "sehatkor video consultation", "sehatkor home visit",
            "sehatkor medical emergency", "sehatkor urgent care", "sehatkor same day appointment",
            "سیہت کور ایمرجنسی سروسز", "سیہت کور کووڈ ٹیسٹ", "سیہت کور ویکسینیشن",
            "سیہت کور بلڈ ٹیسٹ", "سیہت کور الٹراساؤنڈ", "سیہت کور ایکس رے", "سیہت کور ایم آر آئی",
            "سیہت کور سی ٹی اسکین", "سیہت کور ہیلتھ چیک اپ", "سیہت کور فل باڈی چیک اپ",
            "سیہت کور شوگر ٹیسٹ", "سیہت کور پریگننسی ٹیسٹ", "سیہت کور چائلڈ ویکسینیشن",
            "سیہت کور آن لائن پریسکرپشن", "سیہت کور ویڈیو کنسلٹیشن", "سیہت کور ہوم وزٹ",
            "سیہت کور میڈیکل ایمرجنسی", "سیہت کوررجنٹ کیر", "سیہت کور سیم ڈے اپائنٹمنٹ"
          );

          // Unique & Join
          return Array.from(new Set([...dynamicKeywords, ...baseKeywords])).join(", ");
        })()} />
        <link rel="canonical" href={`https://sehatkor.pk/search?q=${searchTerm}&location=${location}`} />
        <meta property="og:title" content={
          searchTerm
            ? `Sehatkor Services - ${searchTerm} | Pakistan Healthcare`
            : `Sehatkor Services - Complete Healthcare Platform | Pakistan`
        } />
        <meta property="og:description" content={
          searchTerm
            ? `Find ${searchTerm} on Sehatkor - Pakistan's trusted healthcare platform. Book doctors, hospitals, labs, pharmacies online.`
            : `Sehatkor Services - Complete healthcare solution. Find doctors, hospitals, labs, pharmacies in one place.`
        } />
        <meta property="og:url" content={`https://sehatkor.pk/search?q=${searchTerm}&location=${location}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Sehatkor Services - Pakistan Healthcare" />
      </Helmet>

      <div className="container mx-auto px-4 py-4">

        {/* Search Header */}

        <div className="mb-6">

          <PageSearchHeader
            title={
              <span className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Search Healthcare Services
              </span>
            }
            subtitle="Find doctors, hospitals, labs, and pharmacies across Pakistan"
            rightContent={
              <div className="flex flex-col gap-1">
                <span className="text-2xl md:text-3xl font-nastaliq text-blue-800" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}>
                  صحت کی خدمات تلاش کریں
                </span>
                <span className="font-nastaliq text-slate-500 text-lg" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}>
                  پاکستان بھر میں ڈاکٹرز، ہسپتال، لیز اور فارمیسی تلاش کریں
                </span>
              </div>
            }
            label="Search services"
            placeholder="Search for services, providers, or treatments..."
            value={searchTerm}
            onChange={(v) => setSearchTerm(v)}
            resultsCount={filteredServices.length}
          />

          {/* Mobile: Filters toggle */}

          <div className="flex justify-start mt-2 md:mt-3 lg:hidden">

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>

              <Filter className="w-4 h-4 mr-2" />

              Filters

            </Button>

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



        <div className="grid lg:grid-cols-8 gap-6">

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

                {/* All Categories (hierarchical) */}

                <div>

                  <Label className="text-base font-medium">All Categories</Label>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>

                    <SelectTrigger className="mt-2">

                      <SelectValue placeholder="Select category" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="all">All Categories</SelectItem>

                      {/* Doctors */}

                      <SelectItem value="doctor" className="font-semibold text-gray-800">Doctors (All)</SelectItem>

                      <SelectItem value="doctor:Consultation" className="pl-4 text-gray-600">• Consultation</SelectItem>

                      <SelectItem value="doctor:Check-up" className="pl-4 text-gray-600">• Check-up</SelectItem>

                      <SelectItem value="doctor:Treatment" className="pl-4 text-gray-600">• Treatment</SelectItem>

                      <SelectItem value="doctor:Surgery" className="pl-4 text-gray-600">• Surgery</SelectItem>

                      <SelectItem value="doctor:Therapy" className="pl-4 text-gray-600">• Therapy</SelectItem>

                      <SelectItem value="doctor:Diagnosis" className="pl-4 text-gray-600">• Diagnosis</SelectItem>

                      {/* Hospitals/Clinics */}

                      <SelectItem value="clinic" className="font-semibold text-gray-800">Hospitals (All)</SelectItem>

                      <SelectItem value="clinic:Consultation (OPD)" className="pl-4 text-gray-600">• Consultation (OPD)</SelectItem>

                      <SelectItem value="clinic:Emergency Care" className="pl-4 text-gray-600">• Emergency Care</SelectItem>

                      <SelectItem value="clinic:Follow-up Visit" className="pl-4 text-gray-600">• Follow-up Visit</SelectItem>

                      <SelectItem value="clinic:Diagnosis/Assessment" className="pl-4 text-gray-600">• Diagnosis/Assessment</SelectItem>

                      <SelectItem value="clinic:Minor Procedures (OPD)" className="pl-4 text-gray-600">• Minor Procedures (OPD)</SelectItem>

                      <SelectItem value="clinic:Surgery (Daycare)" className="pl-4 text-gray-600">• Surgery (Daycare)</SelectItem>

                      <SelectItem value="clinic:Surgery (Inpatient)" className="pl-4 text-gray-600">• Surgery (Inpatient)</SelectItem>

                      <SelectItem value="clinic:Maternity & Obstetrics" className="pl-4 text-gray-600">• Maternity & Obstetrics</SelectItem>

                      <SelectItem value="clinic:Pediatrics" className="pl-4 text-gray-600">• Pediatrics</SelectItem>

                      <SelectItem value="clinic:Physiotherapy & Rehabilitation" className="pl-4 text-gray-600">• Physiotherapy & Rehabilitation</SelectItem>

                      <SelectItem value="clinic:Dental Care" className="pl-4 text-gray-600">• Dental Care</SelectItem>

                      <SelectItem value="clinic:Mental Health & Counseling" className="pl-4 text-gray-600">• Mental Health & Counseling</SelectItem>

                      <SelectItem value="clinic:Vaccination & Immunization" className="pl-4 text-gray-600">• Vaccination & Immunization</SelectItem>

                      <SelectItem value="clinic:Telemedicine" className="pl-4 text-gray-600">• Telemedicine</SelectItem>

                      <SelectItem value="clinic:Home Visit / Home Care" className="pl-4 text-gray-600">• Home Visit / Home Care</SelectItem>

                      <SelectItem value="clinic:Wound Care & Dressings" className="pl-4 text-gray-600">• Wound Care & Dressings</SelectItem>

                      <SelectItem value="clinic:Endoscopy/Scopes" className="pl-4 text-gray-600">• Endoscopy/Scopes</SelectItem>

                      <SelectItem value="clinic:Blood Bank" className="pl-4 text-gray-600">• Blood Bank</SelectItem>

                      {/* Labs */}

                      <SelectItem value="laboratory" className="font-semibold text-gray-800">Labs (All)</SelectItem>

                      <SelectItem value="laboratory:Blood Test" className="pl-4 text-gray-600">• Blood Test</SelectItem>

                      <SelectItem value="laboratory:Urine Test" className="pl-4 text-gray-600">• Urine Test</SelectItem>

                      <SelectItem value="laboratory:X-Ray" className="pl-4 text-gray-600">• X-Ray</SelectItem>

                      <SelectItem value="laboratory:MRI" className="pl-4 text-gray-600">• MRI</SelectItem>

                      <SelectItem value="laboratory:CT Scan" className="pl-4 text-gray-600">• CT Scan</SelectItem>

                      <SelectItem value="laboratory:Ultrasound" className="pl-4 text-gray-600">• Ultrasound</SelectItem>

                      {/* Pharmacies */}

                      <SelectItem value="pharmacy" className="font-semibold text-gray-800">Pharmacies (All)</SelectItem>

                      <SelectItem value="pharmacy:Tablets" className="pl-4 text-gray-600">• Tablets</SelectItem>

                      <SelectItem value="pharmacy:Capsules" className="pl-4 text-gray-600">• Capsules</SelectItem>

                      <SelectItem value="pharmacy:Syrups" className="pl-4 text-gray-600">• Syrups</SelectItem>

                      <SelectItem value="pharmacy:Injections" className="pl-4 text-gray-600">• Injections</SelectItem>

                      <SelectItem value="pharmacy:Ointments" className="pl-4 text-gray-600">• Ointments</SelectItem>

                      <SelectItem value="pharmacy:Drops" className="pl-4 text-gray-600">• Drops</SelectItem>

                    </SelectContent>

                  </Select>

                </div>

                {/* Service Type (backend serviceType) - Multi-select Dropdown */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <Label className="text-base font-medium">Service Type</Label>

                    <div className="flex items-center gap-2">

                      {selectedServiceTypes.length > 0 && (

                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">

                          {selectedServiceTypes.length} selected

                        </span>

                      )}

                      <Button

                        variant="ghost"

                        size="sm"

                        className="h-6 px-2 text-xs"

                        onClick={() => setSelectedServiceTypes([])}

                      >

                        Clear

                      </Button>

                    </div>

                  </div>



                  <Select>

                    <SelectTrigger className="mt-2">

                      <SelectValue placeholder={

                        selectedServiceTypes.length === 0

                          ? "Select service types..."

                          : `${selectedServiceTypes.length} type${selectedServiceTypes.length > 1 ? 's' : ''} selected`

                      } />

                    </SelectTrigger>

                    <SelectContent>

                      <div className="p-2 space-y-2">

                        <div className="text-xs text-gray-500 mb-2">

                          Select multiple service types (optional)

                        </div>



                        {["Sehat Card", "Private", "Charity", "Public", "NPO", "NGO"].map((type) => (

                          <div key={type} className="flex items-center space-x-2 p-1 hover:bg-gray-50 hover:text-primary rounded">

                            <Checkbox

                              id={`dropdown-serviceType-${type}`}

                              checked={selectedServiceTypes.includes(type)}

                              onCheckedChange={(checked) => {

                                console.log(`Checkbox changed: ${type}, checked: ${checked}`);

                                if (checked) {

                                  const newTypes = [...selectedServiceTypes, type];

                                  console.log('New selected types:', newTypes);

                                  setSelectedServiceTypes(newTypes);

                                } else {

                                  const newTypes = selectedServiceTypes.filter(t => t !== type);

                                  console.log('New selected types after removal:', newTypes);

                                  setSelectedServiceTypes(newTypes);

                                }

                              }}

                            />

                            <Label htmlFor={`dropdown-serviceType-${type}`} className="text-sm cursor-pointer flex-1">

                              {type}

                            </Label>

                          </div>

                        ))}



                        <div className="border-t pt-2 mt-2 flex gap-2">

                          <Button

                            variant="ghost"

                            size="sm"

                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 flex-1"

                            onClick={() => setSelectedServiceTypes(["Sehat Card", "Private", "Charity", "Public", "NPO", "NGO"])}

                          >

                            Select All

                          </Button>

                          <Button

                            variant="ghost"

                            size="sm"

                            className="h-6 px-2 text-xs text-red-600 hover:text-red-800 flex-1"

                            onClick={() => setSelectedServiceTypes([])}

                          >

                            Clear All

                          </Button>

                        </div>

                      </div>

                    </SelectContent>

                  </Select>



                  {selectedServiceTypes.length > 0 && (

                    <div className="mt-2 flex flex-wrap gap-1">

                      {selectedServiceTypes.map((type) => (

                        <Badge

                          key={type}

                          variant="secondary"

                          className="text-xs px-2 py-1 cursor-pointer hover:bg-red-100 hover:text-red-700"

                          onClick={() => setSelectedServiceTypes(prev => prev.filter(t => t !== type))}

                        >

                          {type} ×

                        </Badge>

                      ))}

                    </div>

                  )}

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







                {/* Availability */}

                <div>

                  <Label className="text-base font-medium">Availability</Label>

                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>

                    <SelectTrigger className="mt-2">

                      <SelectValue placeholder="Select availability" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="all">All</SelectItem>

                      <SelectItem value="Online">Online</SelectItem>

                      <SelectItem value="Physical">Physical</SelectItem>

                      <SelectItem value="Online and Physical">Online and Physical</SelectItem>

                    </SelectContent>

                  </Select>

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

                      <div className="relative group">

                        {/* Enhanced Slider with Glow Effect */}

                        <div className="relative p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100/50 backdrop-blur-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-200/30">

                          <Slider

                            value={priceRange}

                            onValueChange={setPriceRange}

                            max={maxPrice}

                            min={0}

                            step={100}

                            className="w-full relative

                              [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 

                              [&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-blue-500 [&_[role=slider]]:via-blue-600 [&_[role=slider]]:to-purple-600 

                              [&_[role=slider]]:border-2 [&_[role=slider]]:border-white 

                              [&_[role=slider]]:shadow-xl [&_[role=slider]]:shadow-blue-500/30

                              [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200

                              [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:hover:shadow-2xl [&_[role=slider]]:hover:shadow-blue-500/50

                              [&_[role=slider]]:focus:scale-110 [&_[role=slider]]:focus:shadow-2xl [&_[role=slider]]:focus:shadow-purple-500/50

                              [&_[role=slider]]:active:scale-95

                              [&_.slider-track]:h-2 [&_.slider-track]:bg-gradient-to-r [&_.slider-track]:from-gray-200 [&_.slider-track]:to-gray-300

                              [&_.slider-range]:h-2 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-blue-500 [&_.slider-range]:to-purple-600

                              [&_.slider-range]:shadow-md [&_.slider-range]:shadow-blue-500/20"

                            style={{

                              background: `linear-gradient(to right, 

                                #e5e7eb 0%, 

                                #e5e7eb ${(priceRange[0] / maxPrice) * 100}%, 

                                #3b82f6 ${(priceRange[0] / maxPrice) * 100}%, 

                                #8b5cf6 ${(priceRange[1] / maxPrice) * 100}%, 

                                #e5e7eb ${(priceRange[1] / maxPrice) * 100}%, 

                                #e5e7eb 100%)`,

                              borderRadius: '6px',

                              height: '8px',

                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'

                            }}

                          />



                          {/* Animated Progress Indicators */}

                          <div className="absolute -top-1 left-0 w-full h-full pointer-events-none">

                            <div

                              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50 transition-all duration-300"

                              style={{ left: `${(priceRange[0] / maxPrice) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}

                            />

                            <div

                              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50 transition-all duration-300"

                              style={{ left: `${(priceRange[1] / maxPrice) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}

                            />

                          </div>

                        </div>



                        {/* Enhanced Price Display with Tooltips */}

                        <div className="flex justify-between items-center mt-4">

                          <div className="relative group/price">

                            <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md shadow-sm">

                              <span className="text-xs font-medium">PKR {priceRange[0].toLocaleString()}</span>

                            </div>

                          </div>



                          <div className="flex-1 mx-2 flex items-center justify-center">

                            <div className="h-px bg-gray-300 flex-1"></div>

                            <span className="mx-1 text-xs text-gray-500">to</span>

                            <div className="h-px bg-gray-300 flex-1"></div>

                          </div>



                          <div className="relative group/price">

                            <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md shadow-sm">

                              <span className="text-xs font-medium">PKR {priceRange[1].toLocaleString()}</span>

                            </div>

                          </div>

                        </div>



                        {/* Price Range Info */}

                        <div className="mt-3 text-center">

                          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200/50">

                            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2 animate-pulse"></span>

                            Range: PKR {(priceRange[1] - priceRange[0]).toLocaleString()}

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>

          </div>



          {/* Results */}

          <div className={`${isSidebarOpen ? 'lg:col-span-6' : 'lg:col-span-8'}`}>

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-4">

                {selectedServiceTypes.length > 0 && (

                  <div className="flex items-center gap-2">

                    <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">

                      Service Type Filter: {selectedServiceTypes.length} selected ({selectedServiceTypes.join(', ')})

                    </Badge>

                    <div className="text-sm text-gray-600">

                      Showing {filteredServices.length} results

                    </div>

                  </div>

                )}

                {selectedServiceTypes.length === 0 && (

                  <div className="text-sm text-gray-600">

                    Showing all {filteredServices.length} services (no filter applied)

                  </div>

                )}

              </div>



              {selectedServices.length > 0 && (

                <Badge variant="secondary" className="px-3 py-1">

                  {selectedServices.length} selected for comparison

                </Badge>

              )}

            </div>



            <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${isSidebarOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>

              {servicesToDisplay.map((service) => {

                const isHighlighted =

                  highlightedService &&

                  service.name.toLowerCase() === highlightedService.toLowerCase();



                return (

                  <Card

                    key={service.id}

                    className={`h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 rounded-none border border-gray-300 hover:border-gray-400 transition-colors bg-gradient-to-br from-gray-100 via-gray-100 to-gray-200 ${isHighlighted ? "ring-2 ring-primary" : ""

                      }`}

                  >

                    <CardContent className="p-3 flex flex-col h-full">

                      {/* Image with Variant Slider (if any) */}

                      <div className="relative w-full h-48 md:h-56 bg-gray-100 rounded-none flex items-center justify-center overflow-hidden mb-2">



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



                        {/* Top-left recommended overlay */}

                        {(service as any).recommended && (

                          <div className="absolute top-1.5 left-1.5 z-10">

                            <div className="px-3 py-1.5 text-[11px] shadow-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border border-amber-400/60 rounded-md flex items-center gap-1.5 backdrop-blur-sm">

                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="text-amber-900">

                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />

                              </svg>

                              <div className="flex flex-col leading-tight">

                                <span className="font-black text-amber-900 text-[11px] tracking-wider font-extrabold">RECOMMENDED</span>

                                <span className="font-bold text-amber-800 text-[10px]">by SehatKor</span>

                              </div>

                            </div>

                          </div>

                        )}



                        {/* Top-right corner badges (availability moved to action row) */}

                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end">

                          {(service as any)._providerVerified ? (

                            <Badge className="text-[9px] px-1.5 py-0.5 bg-green-600 text-white border-0 shadow-lg">

                              Verified

                            </Badge>

                          ) : (

                            <Badge className="text-[9px] px-1.5 py-0.5 bg-red-600 text-white border-0 shadow-lg">

                              Unverified

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



                        {((service as any)._providerType === 'doctor') ? (

                          (() => {

                            const slide = getActiveSlide(service) as any;

                            const formatTo12Hour = (time24?: string): string => {

                              if (!time24) return "";

                              const [hours, minutes] = String(time24).split(':');

                              const hour24 = parseInt(hours, 10);

                              const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

                              const ampm = hour24 >= 12 ? 'PM' : 'AM';

                              return `${hour12}:${minutes} ${ampm}`;

                            };

                            const daysText = slide?.days ? String(slide.days) : '';

                            const timeLabel = slide?.timeLabel;

                            const startTime = slide?.startTime;

                            const endTime = slide?.endTime;

                            const range = startTime && endTime ? `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}` : '';

                            const timeText = timeLabel && range ? `${String(timeLabel)} — ${range}` : String(timeLabel || range || '');



                            return (

                              <>

                                {daysText && (

                                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded flex items-center gap-1">

                                    <Calendar className="w-3 h-3" />

                                    <span className="truncate max-w-[220px] sm:max-w-[280px]">{daysText}</span>

                                  </div>

                                )}

                                {(getSlides(service).length > 1 || timeText) && (

                                  <div className="absolute left-2 bottom-2 flex items-center gap-2">

                                    {getSlides(service).length > 1 && (

                                      <div className="bg-black/50 text-white text-xs px-2 py-0.5 rounded">

                                        {((((activeVariantIndex[service.id] ?? 0) % getSlides(service).length) + getSlides(service).length) % getSlides(service).length) + 1}/{getSlides(service).length}

                                      </div>

                                    )}

                                    {timeText && (

                                      <div className="bg-black/60 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded flex items-center gap-1">

                                        <Clock className="w-3 h-3" />

                                        <span className="truncate max-w-[220px] sm:max-w-[280px]">{timeText}</span>

                                      </div>

                                    )}

                                  </div>

                                )}

                              </>

                            );

                          })()

                        ) : (

                          // Non-doctor: keep existing simple time badges

                          <>

                            {(getSlides(service).length > 1 || getDisplayTimeInfo(service)) && (

                              <div className="absolute left-2 bottom-2 flex items-center gap-2">

                                {getSlides(service).length > 1 && (

                                  <div className="bg-black/50 text-white text-xs px-2 py-0.5 rounded">

                                    {((((activeVariantIndex[service.id] ?? 0) % getSlides(service).length) + getSlides(service).length) % getSlides(service).length) + 1}/{getSlides(service).length}

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

                          </>

                        )}

                      </div>



                      {/* Title and Provider */}

                      <div className="flex justify-between items-start mb-2">

                        <div>

                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug flex items-center gap-2">

                            <span className="line-clamp-1">{service.name}</span>

                          </h3>

                          <button

                            className="text-sm text-gray-500 hover:text-primary hover:underline text-left"

                            onClick={() => {

                              const pid = (service as any)._providerId || (service as any).providerId;

                              if (!pid) return;

                              navigate(`/provider/${pid}`);

                            }}

                          >

                            {service.provider}

                          </button>

                          {(() => {

                            const activeIdx = activeVariantIndex[service.id] || 0;

                            const variants = getVariants(service);

                            const totalSlides = 1 + variants.length;

                            const slideIdx = ((activeIdx % totalSlides) + totalSlides) % totalSlides;



                            const firstVariantWithName = variants.find(v => v?.hospitalClinicName);

                            let hospitalClinicName = '';

                            if (slideIdx === 0) {

                              // Main service slide: prefer main; fallback to first variant with a name

                              hospitalClinicName = (service as any).hospitalClinicName

                                || (firstVariantWithName ? firstVariantWithName.hospitalClinicName : '');

                            } else if (variants[slideIdx - 1]) {

                              // Variant slide

                              hospitalClinicName = variants[slideIdx - 1].hospitalClinicName || '';

                            }



                            console.log('🔎 SearchPage hospitalClinicName render:', {

                              serviceId: service.id,

                              serviceName: service.name,

                              slideIdx,

                              hospitalClinicName,

                              serviceHospitalClinicName: (service as any).hospitalClinicName,

                              variantHospitalClinicName: variants[slideIdx - 1]?.hospitalClinicName,

                              firstVariantWithName: firstVariantWithName?.hospitalClinicName

                            });



                            return hospitalClinicName ? (

                              <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1.5">

                                <svg

                                  xmlns="http://www.w3.org/2000/svg"

                                  viewBox="0 0 24 24"

                                  width="12"

                                  height="12"

                                  aria-hidden="true"

                                  className="shrink-0"

                                >

                                  <circle cx="12" cy="12" r="11" fill="#ef4444" />

                                  <rect x="11" y="6" width="2" height="12" fill="#ffffff" rx="1" />

                                  <rect x="6" y="11" width="12" height="2" fill="#ffffff" rx="1" />

                                </svg>

                                <span className="truncate">{hospitalClinicName}</span>

                              </div>

                            ) : null;

                          })()}

                          {/* Department Display for Hospital Services */}

                          {(service as any)._providerType === 'clinic' && (service as any).department && (

                            <div className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1.5">

                              <svg

                                xmlns="http://www.w3.org/2000/svg"

                                viewBox="0 0 24 24"

                                width="12"

                                height="12"

                                fill="currentColor"

                                aria-hidden="true"

                                className="shrink-0"

                              >

                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H6v-2h4V7h4v4h4v2h-4v4z" />

                              </svg>

                              <span className="truncate">{(service as any).department}</span>

                            </div>

                          )}

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

                            {((service as any)._providerType === 'pharmacy' && (service as any).pharmacyCategory)

                              ? (service as any).pharmacyCategory

                              : ((service as any)._providerType === 'laboratory' && (service as any).labCategory)

                                ? (service as any).labCategory

                                : ((service as any)._providerType === 'doctor' && (service as any).doctorCategory)

                                  ? (service as any).doctorCategory

                                  : ((service as any)._providerType === 'clinic' && (service as any).clinicCategory)

                                    ? (service as any).clinicCategory

                                    : service.type}

                          </Badge>

                        </div>

                      </div>

                      {/* Badges and actions – unified 3-row layout for all provider types */}

                      <div className="space-y-2 mb-3 text-sm">

                        {/* Row 1: Rating ↔ Location */}

                        <div className="flex justify-between items-center min-h-[24px]">

                          <div className="flex-shrink-0">

                            <RatingBadge

                              rating={service.rating}

                              ratingBadge={service.ratingBadge}

                              totalRatings={(service as any).totalRatings}

                              yourBadge={(service as any).myBadge || null}

                              size="sm"

                            />

                          </div>

                          <button

                            type="button"

                            onClick={() => {

                              const augmented: any = {

                                ...service,

                                location: getDisplayLocation(service),

                                address: getDisplayAddress(service),

                                googleMapLink: getDisplayMapLink(service)

                              };

                              setCurrentMapService(augmented);

                              setShowLocationMap(service.id);

                            }}

                            title="View location"

                            className="flex items-center gap-1 text-gray-500 flex-shrink-0 hover:text-gray-700 transition-colors cursor-pointer"

                          >

                            <MapPin className="w-4 h-4" />

                            <span className="underline-offset-2 hover:underline">{getDisplayLocation(service)}</span>

                          </button>

                        </div>



                        {/* Row 2: Service Type only */}

                        <div className="flex justify-start items-center min-h-[24px]">

                          <div className="flex-shrink-0">

                            {(service as any).serviceType ? (

                              <ServiceTypeBadge serviceType={(service as any).serviceType} size="sm" />

                            ) : (

                              <div className="h-6"></div>

                            )}

                          </div>

                        </div>



                        {/* Row 3: Home Delivery ↔ Availability ↔ WhatsApp */}

                        <div className="flex justify-between items-center min-h-[24px]">

                          <div className="flex-shrink-0">

                            {(service as any).homeDelivery && (

                              <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[12px]">

                                <span className="leading-none">🏠</span>

                                <span className="leading-none">Home Delivery</span>

                              </span>

                            )}

                          </div>

                          <div className="flex-shrink-0">

                            {(() => {

                              const activeSlide = getActiveSlide(service);

                              const availability = activeSlide?.availability || (service as any).availability;

                              if (!availability) return <div className="h-6"></div>;

                              return <AvailabilityBadge availability={availability} size="sm" />;

                            })()}

                          </div>

                          <div className="flex-shrink-0">

                            {(service as any).providerPhone && (

                              <ServiceWhatsAppButton

                                phoneNumber={(service as any).providerPhone}

                                serviceName={service.name}

                                providerName={service.provider}

                                serviceId={service.id}

                                providerId={(service as any)._providerId}

                              />

                            )}

                          </div>

                        </div>



                        {/* Row 4: Diseases ↔ Rate button */}

                        <div className="flex justify-between items-center min-h-[24px]">

                          <div className="flex items-center gap-2 flex-shrink-0">

                            {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (

                              <div className="relative">

                                <TooltipProvider>

                                  <Tooltip>

                                    <TooltipTrigger asChild>

                                      <button

                                        type="button"

                                        title="View diseases"

                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"

                                        onClick={(e) => {

                                          e.stopPropagation();

                                          setExpandedDiseases(expandedDiseases === service.id ? null : service.id);

                                        }}

                                      >

                                        <VirusIcon className="w-4 h-4" />

                                        <span className="hidden sm:inline text-xs font-medium">Diseases</span>

                                      </button>

                                    </TooltipTrigger>

                                    <TooltipContent side="top" className="max-w-xs hidden sm:block">

                                      <div className="text-xs text-emerald-800">

                                        <div className="mb-1 font-medium">Diseases</div>

                                        <div className="flex flex-col gap-1">

                                          {((service as any).diseases as string[]).map((d, i) => (

                                            <span key={`${d}-${i}`} className="flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">

                                              {d}

                                            </span>

                                          ))}

                                        </div>

                                      </div>

                                    </TooltipContent>

                                  </Tooltip>

                                </TooltipProvider>

                                {expandedDiseases === service.id && (

                                  <div className="absolute sm:hidden left-0 top-[110%] z-50 w-56 p-2 bg-white border border-emerald-200 rounded-md shadow-lg">

                                    <div className="text-xs text-emerald-800">

                                      <div className="mb-1 font-medium">Diseases</div>

                                      <div className="flex flex-col gap-1">

                                        {((service as any).diseases as string[]).map((d, i) => (

                                          <span key={`${d}-${i}`} className="flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">

                                            {d}

                                          </span>

                                        ))}

                                      </div>

                                    </div>

                                  </div>

                                )}

                              </div>

                            )}

                          </div>

                          <div className="flex-shrink-0">

                            {user && (user.role === 'patient' || mode === 'patient') && (user?.id !== (service as any)._providerId) && (

                              <Button

                                size="sm"

                                variant="ghost"

                                onClick={() => handleRateService(service)}

                                className="h-6 w-6 p-0 hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700"

                                title="Rate this service"

                              >

                                <Star className="w-4 h-4" />

                              </Button>

                            )}

                          </div>

                        </div>

                      </div>



                      {/* Buttons */}

                      <div className="mt-auto space-y-2">

                        {/* Mobile: 2x2 grid, Desktop: flex row */}

                        <div className="grid grid-cols-2 gap-2 md:flex md:gap-1.5">

                          <Button

                            size="sm"

                            className="flex items-center justify-center gap-1 h-9 text-xs bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-300/30 hover:shadow-blue-400/40 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-blue-400 md:flex-1 md:min-w-[80px] md:h-8"

                            onClick={() => handleBookNow({ ...(service as any), price: getDisplayPrice(service), image: getDisplayImage(service), location: getDisplayLocation(service) } as any)}

                          >

                            <Clock className="w-3 h-3" />

                            <span className="text-xs">Book</span>

                          </Button>

                          <Button

                            size="sm"

                            variant="outline"

                            onClick={() => {

                              const augmented: any = { ...service, location: getDisplayLocation(service), address: getDisplayAddress(service), googleMapLink: getDisplayMapLink(service) };

                              setCurrentMapService(augmented);

                              setShowLocationMap(service.id);

                            }}

                            className="flex items-center justify-center gap-1 h-9 text-xs bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800 md:flex-1 md:min-w-[80px] md:h-8"

                          >

                            <MapPin className="w-3 h-3" />

                            <span className="text-xs">Location</span>

                          </Button>

                          <Button

                            size="sm"

                            variant="secondary"

                            onClick={() => {

                              const timeInfo = getDisplayTimeInfo(service);

                              const currentVariantIndex = activeVariantIndex[service.id] ?? 0;

                              const slides = getSlides(service);

                              const safeVariantIndex = slides.length ? (((currentVariantIndex % slides.length) + slides.length) % slides.length) : 0;

                              const activeSlide = getActiveSlide(service) as any;

                              const daysForSlide = activeSlide?.days ? String(activeSlide.days) : '';

                              const tl = activeSlide?.timeLabel;

                              const st = activeSlide?.startTime;

                              const et = activeSlide?.endTime;

                              console.log('Navigating to service detail:', service.id, 'safeVariantIndex:', safeVariantIndex, {

                                days: daysForSlide,

                                timeLabel: tl,

                                startTime: st,

                                endTime: et,

                              });

                              navigate(`/service/${service.id}`, {

                                state: {

                                  from: `${routerLocation.pathname}${routerLocation.search}`,

                                  fromSearch: true,

                                  initialVariantIndex: safeVariantIndex,

                                  service: {

                                    id: service.id,

                                    name: service.name,

                                    description: service.description,

                                    price: getDisplayPrice(service) ?? service.price,

                                    rating: service.rating ?? 0,

                                    provider: service.provider,

                                    // Ensure the detail page receives the provider's user id for messaging/requests

                                    providerId: (service as any)._providerId || (service as any).providerId,

                                    image: getDisplayImage(service) ?? (service as any).image,

                                    type: (service as any).category === 'Lab Test' ? 'Test' : (service as any).category === 'Medicine' ? 'Medicine' : (service as any).category === 'Surgery' ? 'Surgery' : 'Treatment',

                                    providerType: (service as any)._providerType || (service as any).providerType || 'doctor',

                                    // Ensure detail page shows the same verification badge

                                    _providerVerified: Boolean((service as any)._providerVerified),

                                    // Also pass through the internal key for compatibility

                                    _providerId: (service as any)._providerId,

                                    isReal: true,

                                    // Pass variants so detail page can show variant-specific schedules and data

                                    variants: Array.isArray((service as any).variants) ? (service as any).variants : [],

                                    // Location/address helpers

                                    location: getDisplayLocation(service) || (service as any).location,

                                    address: getDisplayAddress(service) || (service as any).address,

                                    googleMapLink: getDisplayMapLink(service) || (service as any).googleMapLink,

                                    // provider/meta

                                    providerPhone: (service as any).providerPhone,

                                    ratingBadge: (service as any).ratingBadge,

                                    myBadge: (service as any).myBadge,

                                    timeInfo,

                                    // Main service schedule fields

                                    timeLabel: (service as any).timeLabel || null,

                                    startTime: (service as any).startTime || null,

                                    endTime: (service as any).endTime || null,

                                    days: Array.isArray((service as any).days) ? (service as any).days : null,

                                    availability: (service as any).availability,

                                    homeDelivery: Boolean((service as any).homeDelivery),

                                    // Pass clinic category to detail page for clinic/hospital services

                                    clinicCategory: ((service as any)._providerType === 'clinic') ? ((service as any).clinicCategory || undefined) : undefined,

                                    // Pass department field to detail page for clinic/hospital services

                                    department: ((service as any)._providerType === 'clinic') ? ((service as any).department || undefined) : undefined,

                                    // Pass diseases field to detail page for doctor services

                                    diseases: Array.isArray((service as any).diseases) ? (service as any).diseases : [],

                                  }

                                },

                              });

                            }}

                            className="col-span-2 flex items-center justify-center gap-1 h-9 text-xs md:col-span-1 md:flex-1 md:min-w-[80px] md:h-8"

                          >

                            <span className="text-xs">Details</span>

                          </Button>

                        </div>

                      </div>

                    </CardContent>

                  </Card>

                );

              })}

            </div>



            {filteredServices.length > visibleCount && (

              <div className="col-span-full flex justify-center mt-8">

                <Button

                  onClick={() => setVisibleCount(prev => prev + 12)}

                  className="relative overflow-hidden rounded-full px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-purple-500/40 ring-2 ring-white/20 hover:ring-white/30 transition-all duration-300 group"

                >

                  <span className="relative z-10 flex items-center gap-2">

                    <span className="font-semibold tracking-wide">Load More</span>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="opacity-90 animate-bounce">

                      <path d="M12 16l-5-5h10l-5 5z"></path>

                    </svg>

                  </span>

                  <span className="absolute inset-0 bg-white/10 blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></span>

                </Button>

              </div>

            )}



            {filteredServices.length === 0 && (

              <EmptyState

                title="No services found"

                message="Try different keywords or adjust filters to broaden your search"

                actionLabel="Clear filters"

                onAction={clearFilters}

              />

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

                <p className="text-base">{currentMapService.location || '—'}</p>

              </div>



              {(currentMapService as any).address || (currentMapService as any).detailAddress ? (

                <div>

                  <p className="text-sm font-medium text-gray-600">Address</p>

                  <p className="text-base">{(currentMapService as any).address || (currentMapService as any).detailAddress}</p>

                </div>

              ) : null}



              <Button

                className="w-full mt-4"

                onClick={() => {

                  const addr = (currentMapService as any).address || (currentMapService as any).detailAddress;

                  const loc = (currentMapService as any).location;

                  const link = (currentMapService as any).googleMapLink

                    || (addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(addr))}`

                      : (loc ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(loc))}` : null));

                  if (link) window.open(link, '_blank');

                }}

              >

                <MapPin className="w-4 h-4 mr-2" />

                Open in Google Maps

              </Button>

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