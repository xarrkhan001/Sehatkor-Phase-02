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
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import RatingModal from "@/components/RatingModal";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import BookingOptionsModal from "@/components/BookingOptionsModal";
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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<any>(null);
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean | undefined>(true);
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const providerName = useMemo(() => services[0]?.providerName || "Provider", [services]);
  const providerType = useMemo(() => services[0]?.providerType || undefined, [services]);

  // Smart display name: show full if short; if long, at least show first word then ellipsis
  const getDisplayServiceName = (name?: string) => {
    if (!name) return "Service";
    const trimmed = name.trim();
    if (trimmed.length <= 22) return trimmed;
    const firstWord = trimmed.split(/\s+/)[0];
    return firstWord + (trimmed.length > firstWord.length ? " …" : "");
  };

  // Small inline virus icon for diseases tooltip
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

  // Normalize avatar URL: if it's relative (e.g., "/uploads/..."), prefix with API base
  const avatarSrc = useMemo(() => {
    const src = providerUser?.avatar || "";
    if (!src) return undefined;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
    try { return apiUrl(src); } catch { return src; }
  }, [providerUser?.avatar]);

  // Normalize service image URL similar to avatar handling
  const getServiceImage = (src?: string) => {
    if (!src) return undefined;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
    try { return apiUrl(src); } catch { return src; }
  };

  // Variant helpers for this page
  const [activeVariantIndex, setActiveVariantIndex] = useState<Record<string, number>>({});
  const getSlides = (svc: Service) => {
    const base = {
      imageUrl: (svc as any).image as string | undefined,
      price: (svc as any).price as number | undefined,
      city: (svc as any).city as string | undefined,
      detailAddress: (svc as any).detailAddress as string | undefined,
      googleMapLink: (svc as any).googleMapLink as string | undefined,
      timeLabel: (svc as any).timeLabel as string | undefined,
      startTime: (svc as any).startTime as string | undefined,
      endTime: (svc as any).endTime as string | undefined,
      days: (svc as any).days as string | undefined,
      availability: (svc as any).availability as ("Online" | "Physical" | "Online and Physical" | undefined),
      hospitalClinicName: (svc as any).hospitalClinicName as string | undefined,
    };
    const variants = Array.isArray((svc as any).variants) ? (svc as any).variants : [];
    return [base, ...variants];
  };
  const getActiveSlide = (svc: Service) => {
    const slides = getSlides(svc);
    if (!slides.length) return undefined as any;
    const raw = activeVariantIndex[svc.id] ?? 0;
    const idx = ((raw % slides.length) + slides.length) % slides.length;
    return slides[idx] as any;
  };
  const getDisplayImage = (svc: Service) => {
    const v: any = getActiveSlide(svc);
    return getServiceImage(v?.imageUrl) || getServiceImage((svc as any).image);
  };
  const getDisplayPrice = (svc: Service) => {
    const v: any = getActiveSlide(svc);
    const p = v?.price;
    return p != null && !Number.isNaN(Number(p)) ? Number(p) : (svc as any).price;
  };
  const getDisplayCity = (svc: Service) => {
    const v: any = getActiveSlide(svc);
    return v?.city || (svc as any).city;
  };
  const getDisplayHospitalClinicName = (svc: Service) => {
    const v: any = getActiveSlide(svc);
    return v?.hospitalClinicName || (svc as any).hospitalClinicName;
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

  const getDisplayTimeInfo = (svc: Service): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const label = v.timeLabel || (v.startTime && v.endTime ? `${formatTo12Hour(v.startTime)} - ${formatTo12Hour(v.endTime)}` : "");
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  const nextVariant = (id: string) => setActiveVariantIndex(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const prevVariant = (id: string) => setActiveVariantIndex(prev => ({ ...prev, [id]: (prev[id] ?? 0) - 1 }));

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

    const handleRatingUpdate = (data: { serviceId: string; averageRating: number; totalRatings: number; ratingBadge: 'excellent' | 'good' | 'fair' | 'poor' }) => {
      setServices(prevServices => {
        return prevServices.map(service =>
          service.id === data.serviceId
            ? { ...service, rating: data.averageRating, totalRatings: data.totalRatings, ratingBadge: data.ratingBadge }
            : service
        );
      });
    };

    socket.on('rating_updated', handleRatingUpdate);

    // Live update: recommended flag toggled by admin
    const handleRecommendedToggle = (data: { serviceId: string; providerType: string; recommended: boolean }) => {
      setServices(prev => prev.map(s => {
        const pType = (s as any).providerType || (s as any)._providerType;
        const matches = String(s.id) === String(data.serviceId) && (!data.providerType || String(pType) === String(data.providerType));
        return matches ? ({ ...s, recommended: Boolean(data.recommended) } as any) : s;
      }));
    };
    socket.on('service_recommendation_toggled', handleRecommendedToggle);

    return () => {
      socket.off('rating_updated', handleRatingUpdate);
      socket.off('service_recommendation_toggled', handleRecommendedToggle);
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

  const handleBookNow = (service: any) => {
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

    // Prepare service data with required fields
    const serviceWithProviderInfo = {
      ...service,
      provider: service.providerName || providerUser?.name || providerName || 'Unknown Provider',
      _providerType: providerType || service.providerType || 'doctor',
      _providerId: providerId || service._providerId,
      providerPhone: providerUser?.phone || service.providerPhone
    };

    setSelectedBookingService(serviceWithProviderInfo);
    setIsBookingModalOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Profile Hero Header */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 py-7">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm">
              <Award className="w-5 h-5" />
            </span>
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {(providerUser?.name || providerName)} — {meta.label} Profile
              </h1>
              <p className="mt-1 text-xs text-gray-600">Official provider profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto px-4 py-8">
        {/* Left Sidebar - Provider Information - Shows first on mobile */}
        <div className="w-full xl:w-96 xl:flex-shrink-0 xl:order-1">
          <div className="xl:sticky xl:top-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden md:min-h-[740px] xl:min-h-[880px] flex flex-col">
              {/* Header with grayish gradient (slightly darker) */}
              <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-blue-400 p-8 text-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 via-blue-700/22 to-blue-900/22"></div>
                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="p-1.5 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-2xl">
                        <Avatar className="w-24 h-24 rounded-full bg-white ring-2 ring-white">
                          <AvatarImage
                            src={avatarSrc}
                            alt={providerUser?.name || providerName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-white text-gray-700 text-2xl font-bold">
                            {(providerUser?.name || providerName).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-800">{providerUser?.name || providerName}</h1>
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium px-3 py-1">
                      <User className="w-4 h-4 mr-1" />
                      {meta.label}
                    </Badge>
                  </div>
                </div>
              </div>
              {/* Provider Details */}
              <div className="p-6 space-y-6 flex-1">
                {/* Verification Status */}
                <div className="flex items-center justify-center">
                  <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-2 font-semibold">
                    <Award className="w-4 h-4 mr-2" />
                    Verified Provider
                  </Badge>
                </div>
                {/* Specialization */}
                {providerUser?.specialization && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Specialization</h3>
                    <p className="text-gray-900 font-medium">{providerUser.specialization} Specialist</p>
                  </div>
                )}
                {/* Contact Information */}
                {(providerUser?.phone || providerUser?.email) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      {providerUser?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{providerUser.phone}</span>
                        </div>
                      )}
                      {providerUser?.email && (
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{providerUser.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{services.length}</div>
                    <div className="text-xs text-blue-700 font-medium">Total Services</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{filteredServices.length}</div>
                    <div className="text-xs text-green-700 font-medium">Showing</div>
                  </div>
                </div>
                {/* Member Since */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Member Since</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">2023</span>
                  </div>
                </div>
              </div>
              {/* Sidebar Bottom Tagline */}
              <div className="px-6 py-4 text-[11px] md:text-xs text-gray-500 text-center bg-gradient-to-r from-gray-50/70 via-white to-blue-50/60 border-t border-gray-100">
                Care you can count on — trusted, verified, and here for your wellbeing.
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Area - Shows second on mobile */}
        <div className="flex-1 min-w-0 xl:order-2">
          {/* Search and Filter Section */}
          <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 rounded-3xl shadow-xl border border-gray-100/50 backdrop-blur-sm p-6 md:p-8 mb-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-cyan-200/20 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Find Services</h2>
                  <p className="text-sm text-gray-600">Search and filter through available services</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Search Input */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200 group-focus-within:text-blue-500" />
                    <Input
                      type="text"
                      placeholder="Search for medical services, treatments, or specialties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 pr-6 h-14 text-base bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-lg focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 focus:bg-white focus:shadow-xl placeholder:text-gray-400"
                    />
                  </div>
                </div>
                {/* Filter Section */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-inner">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    {/* Price Filter */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md">
                          <Filter className="text-white w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Price Range</span>
                      </div>
                      <Select value={priceFilter} onValueChange={setPriceFilter}>
                        <SelectTrigger className="w-full lg:w-[180px] h-12 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl shadow-md focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 hover:shadow-lg">
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-gray-200/50 shadow-2xl rounded-xl">
                          <SelectItem value="all" className="hover:bg-blue-50">All Prices</SelectItem>
                          <SelectItem value="free" className="hover:bg-green-50">Free</SelectItem>
                          <SelectItem value="0-500" className="hover:bg-blue-50">PKR 0 - 500</SelectItem>
                          <SelectItem value="500-1000" className="hover:bg-blue-50">PKR 500 - 1,000</SelectItem>
                          <SelectItem value="1000-2000" className="hover:bg-blue-50">PKR 1,000 - 2,000</SelectItem>
                          <SelectItem value="2000-5000" className="hover:bg-blue-50">PKR 2,000 - 5,000</SelectItem>
                          <SelectItem value="5000+" className="hover:bg-blue-50">PKR 5,000+</SelectItem>
                          <SelectItem value="custom" className="hover:bg-purple-50">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Custom Range Inputs */}
                    {priceFilter === "custom" && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200/50">
                        <span className="text-sm font-medium text-purple-700">Custom:</span>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-28 h-10 text-sm bg-white border-2 border-purple-200 rounded-lg shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                        />
                        <span className="text-purple-400 font-bold">—</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-28 h-10 text-sm bg-white border-2 border-purple-200 rounded-lg shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-4 border border-gray-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">
                      Showing <span className="font-semibold text-blue-600">{filteredServices.length}</span> of <span className="font-semibold text-gray-800">{services.length}</span> services
                    </span>
                  </div>
                  {(searchQuery || priceFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setPriceFilter("all");
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* No Results Message */}
          {filteredServices.length === 0 && services.length > 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-gray-300 text-8xl mb-6">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No services found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your search or filter criteria to find what you're looking for</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setPriceFilter("all");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-6 py-3 rounded-xl"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="group relative z-10 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl border border-gray-100 bg-white hover:border-blue-200 flex flex-col overflow-visible hover:-translate-y-[3px] ring-1 ring-transparent hover:ring-blue-200/70 hover:z-50"
              >
                <CardContent className="p-0 h-full flex flex-col overflow-visible">
                  {/* Compact header with circular service image */}
                  <div className="p-6 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="relative">
                          <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-2 ring-white shadow-md border border-gray-200">
                            <AvatarImage
                              src={getDisplayImage(service) || '/placeholder.svg'}
                              alt={service.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/placeholder.svg';
                              }}
                            />
                            <AvatarFallback className="text-sm">{service.name?.[0]?.toUpperCase?.() || 'S'}</AvatarFallback>
                          </Avatar>
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
                          
                          {/* Top-left corner badges */}
                          <div className="absolute -top-0.5 -left-0.5 flex flex-col gap-0.5">
                            {(service as any).isVerified ? (
                              <Badge className="text-[7px] px-0.5 py-0.5 bg-green-400/70 text-white border-0 shadow-md backdrop-blur-sm">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="text-[7px] px-0.5 py-0.5 bg-red-400/70 text-white border-0 shadow-md backdrop-blur-sm">
                                Not Verified
                              </Badge>
                            )}
                            <Badge className="text-[7px] px-0.5 py-0.5 bg-indigo-400/70 text-white border-0 shadow-md backdrop-blur-sm">
                              {providerType === 'doctor' && 'Doctor'}
                              {providerType === 'clinic' && 'Hospital'}
                              {providerType === 'laboratory' && 'Lab'}
                              {providerType === 'pharmacy' && 'Pharmacy'}
                              {!providerType && 'Provider'}
                            </Badge>
                          </div>

                          {/* Top-right verification + provider-type badges for Clinic/Hospital (to match pharmacies UI) */}
                          {providerType === 'clinic' && (
                            <div className="absolute top-1.5 right-1.5 z-10 flex flex-col items-end gap-0.5">
                              {(((service as any)._providerVerified) || ((service as any).providerVerified) || (providerUser?.isVerified)) ? (
                                <Badge className="text-[9px] px-1.5 py-0.5 bg-green-500 text-white border-0 shadow-md">Verified</Badge>
                              ) : (
                                <Badge className="text-[9px] px-1.5 py-0.5 bg-red-500 text-white border-0 shadow-md">Not Verified</Badge>
                              )}
                              <Badge className="text-[9px] px-1.5 py-0.5 bg-indigo-500 text-white border-0 shadow-md">Hospital</Badge>
                            </div>
                          )}

                          {/* Badges moved to card body below */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[1.25rem] md:text-2xl font-semibold text-gray-900 mb-1 truncate flex items-center gap-2">
                            <span>{getDisplayServiceName(service.name)}</span>
                          </h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500 font-medium truncate max-w-[12rem] md:max-w-[16rem]">
                              {providerUser?.name || service.providerName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pt-3 pb-5 flex-1 flex flex-col">
                    <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs px-2 py-1 ${meta.badgeClass} font-medium`}>
                          <User className="w-3 h-3 mr-1" />
                          {meta.label}
                        </Badge>
                        <Badge className={(service as any).providerType === 'pharmacy' ? "text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100" : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm text-[10px] px-2 py-0.5 rounded-md"}>
                          {((service as any).providerType === 'pharmacy' && (service as any).category)
                            ? (service as any).category
                            : ((service as any).providerType === 'laboratory' && (service as any).category)
                              ? (service as any).category
                              : ((service as any).providerType === 'doctor' && (service as any).category)
                                ? (service as any).category
                                : ((service as any).providerType === 'clinic' && (service as any).category)
                                  ? (service as any).category
                                  : 'Service'}
                        </Badge>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm md:text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                          {(service as any).price === 0 ? 'PKR 0' : `PKR ${(service as any).price?.toLocaleString?.() || (service as any).price}`}
                        </div>
                        <div className="text-[10px] text-gray-400 leading-none">per service</div>
                      </div>
                    </div>

                    <p className="text-[0.95rem] text-gray-700 line-clamp-3 mt-3">{service.description || 'No description provided.'}</p>

                    {/* Hospital/Clinic Name */}
                    {getDisplayHospitalClinicName(service) && (
                      <div className="text-sm text-blue-600 font-medium mb-3 flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="11" fill="#ef4444" />
                          <rect x="11" y="6" width="2" height="12" fill="#ffffff" rx="1" />
                          <rect x="6" y="11" width="12" height="2" fill="#ffffff" rx="1" />
                        </svg>
                        <span className="truncate">{getDisplayHospitalClinicName(service)}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                      <RatingBadge 
                        rating={(service as any).averageRating ?? (service as any).rating ?? 0} 
                        totalRatings={(service as any).totalRatings || 0}
                        ratingBadge={(service as any).ratingBadge}
                        yourBadge={(service as any).myBadge || null}
                      />
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{(service as any).city || (service as any).location}</span>
                      </div>
                      
                      {(service as any).providerPhone && (
                        <div className="relative z-50">
                          <ServiceWhatsAppButton 
                            phoneNumber={(service as any).providerPhone}
                            serviceName={service.name}
                            providerName={service.providerName}
                            providerId={(service as any).providerId}
                          />
                        </div>
                      )}
                      {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                title="View diseases"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                              >
                                <VirusIcon className="w-4 h-4" />
                                <span className="hidden sm:inline text-[11px] font-medium">Diseases</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="text-xs text-emerald-800">
                                <div className="mb-1 font-medium">Diseases</div>
                                <div className="flex flex-wrap gap-1">
                                  {((service as any).diseases as string[]).map((d, i) => (
                                    <span key={`${d}-${i}`} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {/* Availability badge (moved from image) */}
                      {(() => {
                        const availability = (getActiveSlide(service) as any)?.availability || (service as any).availability;
                        return availability ? (
                          <AvailabilityBadge availability={availability} size="md" />
                        ) : null;
                      })()}
                      {/* Recommended badge */}
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <div className="px-3 py-1.5 text-[11px] shadow-lg bg-gradient-to-r from-slate-300 via-gray-200 to-slate-400 border border-slate-300/50 rounded-md flex items-center gap-1.5 backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="text-slate-700">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <div className="flex flex-col leading-tight">
                            <span className="font-black text-slate-800 text-[10px] tracking-wider">RECOMMENDED</span>
                            <span className="font-medium text-slate-600 text-[8px]">by SehatKor</span>
                          </div>
                        </div>
                      </div>
                      {/* Pharmacy serviceType badge (moved from image) */}
                      {((service as any).providerType === 'pharmacy' || (service as any).providerType === 'laboratory' || (service as any).providerType === 'clinic' || (service as any).providerType === 'doctor') && (service as any).serviceType && (
                        <ServiceTypeBadge serviceType={(service as any).serviceType} size="md" />
                      )}
                      {/* Home Delivery badge for pharmacy, laboratory, clinic, and doctor services */}
                      {((service as any).providerType === 'pharmacy' || (service as any).providerType === 'laboratory' || (service as any).providerType === 'clinic' || (service as any).providerType === 'doctor') && (service as any).homeDelivery && (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          🏠 Home Delivery
                        </Badge>
                      )}
                      {/* Removed duplicate clinic category badge to avoid double display */}
                    </div>

                    <div className="mt-auto space-y-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-200 rounded-xl font-semibold py-4 text-[15px]"
                        onClick={() => handleBookNow(service)}
                      >
                        <Clock className="w-5 h-5 mr-2" /> Book Now
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowLocationMap(service.id)}
                          className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800 rounded-xl font-medium py-3 text-[15px]"
                        >
                          <MapPin className="w-5 h-5 mr-1" /> Location
                        </Button>
                        {user && user.role === 'patient' ? (
                          <Button
                            variant="outline"
                            onClick={() => handleRateService(service)}
                            className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-pink-100 hover:text-purple-800 rounded-xl font-medium py-3 text-[15px]"
                          >
                            <Star className="w-5 h-5 mr-1" /> Rate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => toast.info('Login as patient to rate services')}
                            className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-pink-100 hover:text-purple-800 rounded-xl font-medium py-3 text-[15px]"
                          >
                            <Star className="w-5 h-5 mr-1" /> Rate
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const slides = getSlides(service);
                          const rawIdx = activeVariantIndex[service.id] ?? 0;
                          const activeIdx = slides.length ? (((rawIdx % slides.length) + slides.length) % slides.length) : 0;
                          navigate(`/service/${service.id}`, {
                            state: {
                              service: {
                                ...service,
                                diseases: Array.isArray((service as any).diseases) ? (service as any).diseases : [],
                                // Ensure providerType is present for detail page logic
                                _providerType: (service as any).providerType || providerType || 'doctor',
                                providerType: (service as any).providerType || providerType || 'doctor',
                                // Derive a normalized type for consistent badge conditions
                                type:
                                  ((service as any).providerType || providerType) === 'pharmacy' ? 'Medicine' :
                                  ((service as any).providerType || providerType) === 'laboratory' ? 'Test' :
                                  ((service as any).category === 'Surgery' ? 'Surgery' : 'Treatment'),
                                // Coerce homeDelivery to boolean to avoid falsy string issues
                                homeDelivery: Boolean((service as any).homeDelivery),
                                // Pass-through common optional fields
                                providerId: (service as any).providerId,
                                providerPhone: (service as any).providerPhone,
                                serviceType: (service as any).serviceType,
                                // Pass clinic category to detail page if clinic
                                clinicCategory: ((service as any).providerType || providerType) === 'clinic' ? ((service as any).category || undefined) : undefined,
                                variants: (service as any).variants || [],
                              },
                              initialVariantIndex: activeIdx,
                              from: window.location.pathname + window.location.search,
                            }
                          });
                        }}
                        className="w-full rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 py-3 text-[15px]"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {services.length > 0 && hasMore && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={loadMore} 
                disabled={isLoading} 
                variant="outline"
                className="bg-white border-gray-200 hover:bg-gray-50 px-8 py-3 rounded-xl font-medium shadow-sm"
              >
                {isLoading ? 'Loading...' : 'Load More Services'}
              </Button>
            </div>
          )}

          {services.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="text-gray-300 text-8xl mb-6">📋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No services available</h3>
              <p className="text-gray-500 max-w-md mx-auto">This provider hasn't added any services yet. Please check back later.</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Map Modal */}
      {showLocationMap && currentMapService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-800">{currentMapService.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationMap(null)}
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Location</p>
                  <p className="text-sm text-gray-900">{currentMapService.address}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Provider</p>
                  <p className="text-sm text-gray-900">{currentMapService.providerName}</p>
                </div>
                
                {((currentMapService as any).googleMapLink) && (
                  <Button 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl py-3 font-medium shadow-lg"
                    onClick={() => window.open((currentMapService as any).googleMapLink as string, '_blank')}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
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
    </div>
  );
};

export default ProviderProfilePage;

