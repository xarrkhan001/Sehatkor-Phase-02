import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import ServiceManager from "@/lib/serviceManager";
import { Service } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Minimize2, Maximize2, X, Search, Star, Home, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import RatingBadge from "@/components/RatingBadge";
import RatingModal from "@/components/RatingModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "../context/SocketContext";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";

const DoctorsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctorServices, setDoctorServices] = useState<Service[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDisease = searchParams.get('disease') || "";
  const [searchTerm, setSearchTerm] = useState(initialDisease);

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean | undefined>(true);

  const { user, mode } = useAuth();
  const { socket } = useSocket();
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingService, setSelectedRatingService] = useState<Service | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState<Record<string, number>>({});
  useEffect(() => {
    let isMounted = true;
    const loadPage = async (nextPage: number) => {
      setIsLoading(true);
      try {
        const { services, hasMore: more } = await ServiceManager.fetchPublicServices({
          type: 'doctor',
          page: nextPage,
          limit: 6,
          disease: initialDisease || undefined,
        });
        if (!isMounted) return;
        const mapped = services.map((service: any) => {
          const isOwn = String((service as any).providerId) === String(user?.id || '');
          const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Doctor') : ((service as any).providerName || 'Doctor');
          return ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            rating: service.averageRating || service.rating || 0,
            location: (service as any).city || "Karachi",
            type: service.category === "Surgery" ? "Surgery" : "Treatment",
            homeService: true,
            image: service.image,
            provider: resolvedProviderName,
            createdAt: (service as any).createdAt,
            _providerId: (service as any).providerId,
            googleMapLink: (service as any).googleMapLink,
            detailAddress: (service as any).detailAddress,
            providerPhone: (service as any).providerPhone,
            totalRatings: (service as any).totalRatings || 0,
            ratingBadge: (service as any).ratingBadge || null,
            ...(Array.isArray((service as any).diseases) && (service as any).diseases.length > 0
              ? { diseases: (service as any).diseases }
              : {}),
            // Preserve variants from backend if available
            ...(Array.isArray((service as any).variants) && (service as any).variants.length > 0
              ? { variants: (service as any).variants }
              : {}),
            ...(service.availability ? { availability: service.availability } : {}),
          }) as Service;
        });
        setDoctorServices(prev => {
          const byId = new Map(prev.map(s => [s.id, s] as const));
          for (const s of mapped) byId.set(s.id, s);
          const arr = Array.from(byId.values());
          arr.sort((a: any, b: any) => {
            const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
            const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
            if (aOwn !== bOwn) return aOwn ? -1 : 1;
            const rank = (s: any) => {
              const badge = ((s as any)?.ratingBadge || '').toString().toLowerCase();
              if (badge === 'excellent') return 3;
              if (badge === 'good') return 2;
              if (badge === 'normal') return 1;
              return 0;
            };
            const rb = rank(b) - rank(a);
            if (rb !== 0) return rb;
            const ar = (a as any).rating ?? 0;
            const br = (b as any).rating ?? 0;
            if (br !== ar) return br - ar;
            const ad = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
            const bd = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
            return bd - ad;
          });
          return arr;
        });
        setHasMore(more);
      } catch (e) {
        console.error('Failed to load services:', e);
        if (isMounted) setHasMore(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    // initial load
    setDoctorServices([]);
    setPage(1);
    loadPage(1);
    return () => { isMounted = false; };
  }, [user?.id, user?.name, initialDisease]);

  useEffect(() => {
    if (!socket) return;

    const handleRatingUpdate = (data: { serviceId: string; averageRating: number; totalRatings: number; ratingBadge: 'excellent' | 'good' | 'fair' | 'poor' }) => {
      setDoctorServices(prevServices => {
        const updated = prevServices.map(service =>
          service.id === data.serviceId
            ? { ...service, rating: data.averageRating, totalRatings: data.totalRatings, ratingBadge: data.ratingBadge }
            : service
        );
        updated.sort((a: any, b: any) => {
          const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
          const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
          if (aOwn !== bOwn) return aOwn ? -1 : 1;
          const rank = (s: any) => {
            const badge = ((s as any)?.ratingBadge || '').toString().toLowerCase();
            if (badge === 'excellent') return 3;
            if (badge === 'good') return 2;
            if (badge === 'normal') return 1;
            return 0;
          };
          const rb = rank(b) - rank(a);
          if (rb !== 0) return rb;
          const ar = (a as any).rating ?? 0;
          const br = (b as any).rating ?? 0;
          if (br !== ar) return br - ar;
          const ad = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
          const bd = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
          return bd - ad;
        });
        return updated;
      });
    };

    socket.on('rating_updated', handleRatingUpdate);

    return () => {
      socket.off('rating_updated', handleRatingUpdate);
    };
  }, [socket]);

  // React to live provider profile updates (e.g., name change) and patch visible cards immediately
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { providerId: string; name?: string } | undefined;
      if (!detail) return;
      setDoctorServices(prev => prev.map(s => {
        const pid = (s as any)._providerId;
        if (String(pid) === String(detail.providerId)) {
          return { ...s, provider: detail.name || s.provider } as any;
        }
        return s;
      }));
    };
    window.addEventListener('provider_profile_updated', handler as EventListener);
    return () => window.removeEventListener('provider_profile_updated', handler as EventListener);
  }, []);

  // Fallback: if current user's name changes, patch own cards
  useEffect(() => {
    if (!user?.id || !user?.name) return;
    setDoctorServices(prev => prev.map(s => {
      const pid = (s as any)._providerId;
      if (String(pid) === String(user.id)) {
        return { ...s, provider: user.name } as any;
      }
      return s;
    }));
  }, [user?.id, user?.name]);

  const loadMore = async () => {
    if (isLoading || hasMore === false) return;
    const next = page + 1;
    setPage(next);
    // reuse effect's loader logic inline
    setIsLoading(true);
    try {
      const { services, hasMore: more } = await ServiceManager.fetchPublicServices({ type: 'doctor', page: next, limit: 9, disease: initialDisease || undefined });
      const mapped = services.map((service: any) => {
        const isOwn = String((service as any).providerId) === String(user?.id || '');
        const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Doctor') : ((service as any).providerName || 'Doctor');
        return ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          rating: service.averageRating || service.rating || 0,
          location: (service as any).city || "Karachi",
          type: service.category === "Surgery" ? "Surgery" : "Treatment",
          homeService: true,
          image: service.image,
          provider: resolvedProviderName,
          createdAt: (service as any).createdAt,
          _providerId: (service as any).providerId,
          googleMapLink: (service as any).googleMapLink,
          detailAddress: (service as any).detailAddress,
          providerPhone: (service as any).providerPhone,
          totalRatings: (service as any).totalRatings || 0,
          ratingBadge: (service as any).ratingBadge || null,
          ...(Array.isArray((service as any).diseases) && (service as any).diseases.length > 0
            ? { diseases: (service as any).diseases }
            : {}),
        }) as Service;
      });

      setDoctorServices(prev => {
        const byId = new Map(prev.map(s => [s.id, s] as const));
        for (const s of mapped) byId.set(s.id, s);
        const arr = Array.from(byId.values());
        arr.sort((a: any, b: any) => {
          const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
          const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
          if (aOwn !== bOwn) return aOwn ? -1 : 1;
          const rank = (s: any) => {
            const badge = ((s as any)?.ratingBadge || '').toString().toLowerCase();
            if (badge === 'excellent') return 3;
            if (badge === 'good') return 2;
            if (badge === 'normal') return 1;
            return 0;
          };
          const rb = rank(b) - rank(a);
          if (rb !== 0) return rb;
          const ar = (a as any).rating ?? 0;
          const br = (b as any).rating ?? 0;
          if (br !== ar) return br - ar;
          const ad = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
          const bd = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
          return bd - ad;
        });
        return arr;
      });
      setHasMore(more);
    } catch (e) {
      console.error('Failed to load more services:', e);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    if (!q) return doctorServices;
    return doctorServices.filter((service: any) => {
      const inText = service.name.toLowerCase().includes(q)
        || service.provider.toLowerCase().includes(q)
        || service.description.toLowerCase().includes(q);
      const inDiseases = Array.isArray(service.diseases)
        && service.diseases.some((d: string) => (d || "").toLowerCase().includes(q));
      return inText || inDiseases;
    });
  }, [doctorServices, searchTerm]);

  const handleBookNow = (service: Service) => {
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

    navigate('/payment', {
      state: {
        serviceId: service.id,
        serviceName: service.name,
        providerId: (service as any)._providerId || service.id,
        providerName: service.provider,
        providerType: 'doctor',
        price: Number((service as any).price ?? 0),
        image: service.image,
        location: (service as any).location,
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

  const getServiceAddress = (service: any): string => {
    // Determine address using active variant if available
    const variants = (service as any).variants as any[] | undefined;
    const idx = activeVariantIndex[service.id] ?? 0;
    const v = variants && variants.length > 0 ? variants[Math.max(0, Math.min(idx, variants.length - 1))] : undefined;
    const detail = v?.detailAddress || service.detailAddress;
    if (detail) return detail;
    return v?.city || service.location || service.city || "Location not specified";
  };

  const getDisplayForService = (service: Service) => {
    const variantIndex = activeVariantIndex[service.id] ?? 0;
    const variants = (service as any).variants as any[] | undefined;
    
    if (!Array.isArray(variants) || variants.length === 0 || variantIndex === 0) {
      return {
        name: service.name,
        price: service.price,
        image: service.image,
        location: service.location,
        detailAddress: (service as any).detailAddress,
        description: service.description,
        googleMapLink: (service as any).googleMapLink
      };
    }
    
    const variant = variants[variantIndex - 1];
    if (!variant) return {
      name: service.name,
      price: service.price,
      image: service.image,
      location: service.location,
      detailAddress: (service as any).detailAddress,
      description: service.description,
      googleMapLink: (service as any).googleMapLink
    };
    
    return {
      name: variant.name || service.name,
      price: variant.price ?? service.price,
      image: variant.image || service.image,
      location: variant.location || service.location,
      detailAddress: variant.detailAddress || (service as any).detailAddress,
      description: variant.description || service.description,
      googleMapLink: variant.googleMapLink || (service as any).googleMapLink
    };
  };

  const getSlides = (service: Service) => {
    const variants = (service as any).variants as any[] | undefined;
    const slides = [service];
    if (Array.isArray(variants)) {
      slides.push(...variants);
    }
    return slides;
  };

  const getDisplayTimeInfo = (service: Service) => {
    const variantIndex = activeVariantIndex[service.id] ?? 0;
    const variants = (service as any).variants as any[] | undefined;
    
    if (!Array.isArray(variants) || variants.length === 0 || variantIndex === 0) {
      return (service as any).timeLabel || 'Available';
    }
    
    const variant = variants[variantIndex - 1];
    return variant?.timeLabel || (service as any).timeLabel || 'Available';
  };

  const getDisplayTimeRange = (service: Service) => {
    const variantIndex = activeVariantIndex[service.id] ?? 0;
    const variants = (service as any).variants as any[] | undefined;
    
    if (!Array.isArray(variants) || variants.length === 0 || variantIndex === 0) {
      return (service as any).timeRange || '9:00 AM - 5:00 PM';
    }
    
    const variant = variants[variantIndex - 1];
    return variant?.timeRange || (service as any).timeRange || '9:00 AM - 5:00 PM';
  };

  // Build display time label for the active variant (timeLabel or start-end + days)
  const getTimeInfoForService = (service: any): string | null => {
    const variants = (service as any).variants as any[] | undefined;
    const vlen = Array.isArray(variants) ? variants.length : 0;
    const totalSlides = 1 + vlen;
    const rawIdx = activeVariantIndex[service.id] ?? 0;
    const idx = ((rawIdx % totalSlides) + totalSlides) % totalSlides;
    // For base (idx===0), only show if top-level time fields exist (rare)
    if (idx === 0) {
      const formatTime = (t?: string) => (t ? String(t) : "");
      const label = (service as any).timeLabel || ((service as any).startTime && (service as any).endTime ? `${formatTime((service as any).startTime)} - ${formatTime((service as any).endTime)}` : "");
      const days = (service as any).days ? String((service as any).days) : "";
      const parts = [label, days].filter(Boolean);
      return parts.length ? parts.join(" · ") : null;
    }
    const v = variants && variants[idx - 1];
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    const label = v.timeLabel || (v.startTime && v.endTime ? `${formatTime(v.startTime)} - ${formatTime(v.endTime)}` : "");
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };

  // Build numeric time range for the active variant (e.g., 7:00 PM - 10:00 PM)
  const getTimeRangeForService = (service: any): string | null => {
    const variants = (service as any).variants as any[] | undefined;
    const vlen = Array.isArray(variants) ? variants.length : 0;
    const totalSlides = 1 + vlen;
    const rawIdx = activeVariantIndex[service.id] ?? 0;
    const idx = ((rawIdx % totalSlides) + totalSlides) % totalSlides;
    const formatTime = (t?: string) => (t ? String(t) : "");
    if (idx === 0) {
      const hasBase = (service as any).startTime && (service as any).endTime;
      if (hasBase) return `${formatTime((service as any).startTime)} - ${formatTime((service as any).endTime)}`;
      // fallback to label only if numeric range missing
      return (service as any).timeLabel ? String((service as any).timeLabel) : null;
    }
    const v = variants && variants[idx - 1];
    if (!v) return null;
    if (v.startTime && v.endTime) return `${formatTime(v.startTime)} - ${formatTime(v.endTime)}`;
    return v.timeLabel ? String(v.timeLabel) : null;
  };

  const currentMapService = showLocationMap
    ? (() => {
      const svc = doctorServices.find(s => s.id === showLocationMap);
      if (!svc) return null;
      const coordinates = getCoordinatesForLocation(svc.location || "Karachi");
      const address = getServiceAddress(svc);
      return { ...svc, coordinates, address } as any;
    })()
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Find Your Doctor</h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Search from our network of qualified healthcare professionals
              </p>
            </div>
          </div>
          <ServiceCardSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            {/* Left: Title + Subtitle */}
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-1">Find Your Doctor</h1>
              <p className="text-base md:text-lg text-gray-500">
                Search from our network of qualified healthcare professionals
              </p>
              {initialDisease && (
                <div className="mt-2 text-sm text-gray-600">
                  Filtering for disease: <span className="font-semibold">{initialDisease}</span>
                  <button
                    className="ml-2 text-primary underline"
                    onClick={() => {
                      setSearchTerm("");
                      searchParams.delete('disease');
                      setSearchParams(searchParams, { replace: true });
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Right: Search */}
            <div className="w-full md:w-auto">
              {/* Top row: label (left) and results (right) */}
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-base md:text-lg font-semibold text-gray-700">Search doctors</span>
                {filteredServices.length > 0 && (
                  <span className="text-xs font-light text-gray-700">
                    Showing {filteredServices.length} {filteredServices.length === 1 ? 'result' : 'results'}
                  </span>
                )}
              </div>
              {/* Input aligned to the right on md+ */}
              <div className="relative md:self-end md:ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="doctor-search"
                  placeholder="Search doctors by name, specialty, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-[360px] pl-9 h-11 rounded-md border border-gray-300 bg-white/90 text-gray-800 placeholder:text-gray-400 shadow-sm transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl border border-gray-200 bg-gray-50"
            >
              <CardContent className="p-5 flex flex-col h-full">
                {/* Image */}
                <div className="w-full h-48 md:h-56 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-4 relative">
                  {getDisplayForService(service).image ? (
                    <img
                      src={getDisplayForService(service).image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // prevent infinite loop
                        target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'text-gray-400 text-4xl';
                        fallback.textContent = '🩺';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">🩺</span>
                  )}
                  
                  {/* Top-right corner badges */}
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end">
                    {(service as any)._providerVerified ? (
                      <Badge className="text-[8px] px-1 py-0.5 bg-green-600 text-white border-0 shadow-lg">
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="text-[8px] px-1 py-0.5 bg-red-600 text-white border-0 shadow-lg">
                        Not Verified
                      </Badge>
                    )}
                    <Badge className="text-[8px] px-1 py-0.5 bg-blue-600 text-white border-0 shadow-lg">
                      Doctor
                    </Badge>
                  </div>
                  {/* Variant slider controls */}
                  {(() => { const v = (service as any).variants as any[] | undefined; const total = 1 + (Array.isArray(v) ? v.length : 0); return total > 1; })() && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const v = (service as any).variants as any[] | undefined;
                          const total = 1 + (Array.isArray(v) ? v.length : 0);
                          const curr = activeVariantIndex[service.id] ?? 0;
                          setActiveVariantIndex(prev => ({ ...prev, [service.id]: (curr - 1 + total) % total }));
                        }}
                        className="h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white"
                        aria-label="Previous variant"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const v = (service as any).variants as any[] | undefined;
                          const total = 1 + (Array.isArray(v) ? v.length : 0);
                          const curr = activeVariantIndex[service.id] ?? 0;
                          setActiveVariantIndex(prev => ({ ...prev, [service.id]: (curr + 1) % total }));
                        }}
                        className="h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white"
                        aria-label="Next variant"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {/* Time info badge */}
                  {getTimeInfoForService(service) && (
                    <div className="absolute left-2 bottom-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeInfoForService(service)}</span>
                    </div>
                  )}
                  {getTimeRangeForService(service) && (
                    <div className="absolute right-2 bottom-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeRangeForService(service)}</span>
                    </div>
                  )}
                </div>

                {/* Title and Provider */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {service.name}
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
                      {getDisplayForService(service).price === 0
                        ? "Free"
                        : (
                          <>
                            <span className="text-xs">PKR </span>
                            <span className="text-sm">{Number(getDisplayForService(service).price).toLocaleString()}</span>
                          </>
                        )}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 border-rose-100"
                    >
                      Treatment
                    </Badge>
                    {(service as any).availability && (
                      <Badge
                        className={`${
                          (service as any).availability === 'Online'
                            ? 'bg-emerald-600'
                            : (service as any).availability === 'Physical'
                            ? 'bg-purple-600'
                            : 'bg-teal-600'
                        } text-white border-0 rounded-full px-2 py-0.5 text-[10px] leading-none whitespace-nowrap`}
                      >
                        {(service as any).availability === 'Online and Physical' ? 'Online & Physical' : (service as any).availability}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Address + Disease (badge on right) */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs text-gray-600 truncate">
                    {getDisplayForService(service).detailAddress || getDisplayForService(service).location || 'Address not specified'}
                  </span>
                  {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap">
                      {((service as any).diseases as string[])[0]}
                    </Badge>
                  )}
                </div>

                {/* Rating, Location, Home Service, WhatsApp */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                  <RatingBadge
                    rating={service.rating}
                    totalRatings={(service as any).totalRatings || 0}
                    ratingBadge={(service as any).ratingBadge}
                    yourBadge={(service as any).myBadge || null}
                  />
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{getDisplayForService(service).location}</span>
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
                </div>

                {/* Buttons */}
                <div className="mt-auto flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    className="flex-1 min-w-[80px] h-8 text-xs bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-300/30 hover:shadow-blue-400/40 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-blue-400"
                    onClick={() => {
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

                      const disp = getDisplayForService(service);
                      const slides = getSlides(service);
                      const rawIdx = activeVariantIndex[service.id] ?? 0;
                      const activeIdx = slides.length ? (((rawIdx % slides.length) + slides.length) % slides.length) : 0;
                      const timeLabel = getDisplayTimeInfo(service);
                      const timeRange = getDisplayTimeRange(service);

                      navigate('/payment', {
                        state: {
                          serviceId: service.id,
                          serviceName: service.name,
                          providerId: (service as any)._providerId || service.id,
                          providerName: service.provider,
                          providerType: 'doctor',
                          price: Number(disp.price ?? 0),
                          currency: 'PKR',
                          image: disp.image,
                          location: disp.location,
                          phone: (service as any).providerPhone,
                          variantIndex: activeIdx,
                          variantLabel: timeLabel,
                          variantTimeRange: timeRange,
                        }
                      });
                    }}
                  >
                    <Clock className="w-3 h-3 mr-1" /> Book
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
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
                      navigate(`/service/${service.id}`, {
                        state: {
                          from: `${location.pathname}${location.search}`,
                          fromDoctors: true,
                          service: {
                            ...service,
                            ...getDisplayForService(service),
                            providerType: 'doctor',
                            providerId: (service as any)._providerId,
                            totalRatings: (service as any).totalRatings,
                            providerPhone: (service as any).providerPhone,
                            coordinates: (service as any).coordinates,
                            ratingBadge: (service as any).ratingBadge,
                            myBadge: (service as any).myBadge,
                            timeInfo,
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
                      onClick={() => {
                        setSelectedRatingService(service);
                        setRatingModalOpen(true);
                      }}
                      className="flex-1 min-w-[80px] h-8 text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" /> Rate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} disabled={isLoading} variant="outline">
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {filteredServices.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-xl">No doctors found</p>
              <p>Try adjusting your search criteria</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>

      {/* Location Map Card */}
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
                <p className="text-base">{getDisplayForService(currentMapService).location}</p>
              </div>

              {getServiceAddress(currentMapService) && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-base">{getServiceAddress(currentMapService)}</p>
                </div>
              )}

              {(getDisplayForService(currentMapService).googleMapLink) && (
                <Button
                  className="w-full mt-4"
                  onClick={() => window.open(getDisplayForService(currentMapService).googleMapLink as string, '_blank')}
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
      {selectedRatingService && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedRatingService(null);
          }}
          serviceId={selectedRatingService.id}
          serviceName={selectedRatingService.name}
          serviceType="doctor"
        />
      )}
    </div>
  );
};

export default DoctorsPage;