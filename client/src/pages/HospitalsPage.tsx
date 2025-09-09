import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ServiceManager from "@/lib/serviceManager";
import { Service } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Minimize2, Maximize2, X, Search, Star, Home, Clock } from "lucide-react";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "../context/SocketContext";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import RatingBadge from "@/components/RatingBadge";
import RatingModal from "@/components/RatingModal";
import BookingOptionsModal from "@/components/BookingOptionsModal";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";

const HospitalsPage = () => {
  const navigate = useNavigate();
  const [hospitalServices, setHospitalServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean | undefined>(true);

  const { user, mode } = useAuth();
  const { socket } = useSocket();
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingService, setSelectedRatingService] = useState<Service | null>(null);
  const [priceCache, setPriceCache] = useState<Record<string, number>>({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPage = async (nextPage: number) => {
      setIsLoading(true);
      try {
        const { services, hasMore: more } = await ServiceManager.fetchPublicServices({
          type: 'clinic',
          page: nextPage,
          limit: 6,
        });
        if (!isMounted) return;
        const mapped = services.map((service: any) => {
          const isOwn = String((service as any).providerId) === String(user?.id || '');
          const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Hospital') : ((service as any).providerName || 'Hospital');
          return ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            rating: service.averageRating || service.rating || 0,
            location: (service as any).city || "Karachi",
            type: service.category === "Surgery" ? "Surgery" : "Treatment",
            category: (service as any).category,
            homeService: false,
            image: service.image,
            provider: resolvedProviderName,
            createdAt: (service as any).createdAt,
            _providerId: (service as any).providerId,
            _providerType: ((service as any).providerType === 'hospital' ? 'clinic' : (service as any).providerType) || 'clinic',
            googleMapLink: (service as any).googleMapLink,
            city: (service as any).city,
            detailAddress: (service as any).detailAddress,
            providerPhone: (service as any).providerPhone,
            totalRatings: (service as any).totalRatings,
            ratingBadge: (service as any).ratingBadge || null,
            _providerVerified: typeof (service as any)._providerVerified !== 'undefined'
              ? Boolean((service as any)._providerVerified)
              : (isOwn && Boolean((user as any)?.isVerified) && Boolean((user as any)?.licenseNumber) && String((user as any)?.licenseNumber).trim() !== ''),
            recommended: Boolean((service as any).recommended),
            availability: (service as any).availability,
            serviceType: (service as any).serviceType,
            homeDelivery: Boolean((service as any).homeDelivery) || false,
            ...(function () {
              try {
                const uid = user?.id || (user as any)?._id || 'anon';
                const key = `myRating:${uid}:clinic:${service.id}`;
                const my = localStorage.getItem(key) as 'excellent' | 'good' | 'fair' | 'poor' | null;
                return my ? { myBadge: my } : {};
              } catch { return {}; }
            })(),
          }) as unknown as Service;
        });
        setHospitalServices(prev => {
          const byId = new Map(prev.map(s => [s.id, s] as const));
          for (const s of mapped) byId.set(s.id, s);
          const arr = Array.from(byId.values());
          arr.sort((a: any, b: any) => {
            const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
            const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
            if (aOwn !== bOwn) return aOwn ? -1 : 1;
            // Badge priority: excellent > good > fair > others
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
    setHospitalServices([]);
    setPage(1);
    loadPage(1);
    return () => { isMounted = false; };
  }, [user?.id, user?.name]);

  // Backfill exact prices for zero-priced cards
  useEffect(() => {
    const fillPrices = async () => {
      const updates: Record<string, number> = {};
      for (const s of hospitalServices) {
        if ((s.price ?? 0) > 0) continue;
        const type = ((s as any)?._providerType ?? 'clinic') as 'clinic' | 'doctor' | 'laboratory' | 'pharmacy';
        if (!type) continue;
        try {
          const svc = await ServiceManager.fetchServiceById(String(s.id), type);
          const p = Number((svc as any)?.price ?? 0);
          if (p > 0) updates[s.id] = p;
        } catch { }
      }
      if (Object.keys(updates).length) {
        setPriceCache(prev => ({ ...prev, ...updates }));
        setHospitalServices(prev => prev.map(s => updates[s.id] ? ({ ...s, price: updates[s.id] }) as Service : s));
      }
    };
    if (hospitalServices.length) void fillPrices();
  }, [hospitalServices]);

  useEffect(() => {
    if (!socket) return;

    const handleRatingUpdate = (data: { serviceId: string; averageRating: number; totalRatings: number; ratingBadge: 'excellent' | 'good' | 'fair' | 'poor' }) => {
      setHospitalServices(prevServices => {
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

    // Live update: recommended flag toggled by admin
    const handleRecommendedToggle = (data: { serviceId: string; providerType: string; recommended: boolean }) => {
      if (!data || data.providerType !== 'clinic') return;
      setHospitalServices(prev => prev.map(s => s.id === data.serviceId ? ({ ...s, recommended: Boolean(data.recommended) } as any) : s));
    };
    socket.on('service_recommendation_toggled', handleRecommendedToggle);

    return () => {
      socket.off('rating_updated', handleRatingUpdate);
      socket.off('service_recommendation_toggled', handleRecommendedToggle);
    };
  }, [socket]);

  // Listen for per-user immediate badge updates
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent' | 'good' | 'fair' | 'poor' } | undefined;
      if (!detail) return;
      if (detail.serviceType !== 'clinic') return;
      setHospitalServices(prev => prev.map(s => s.id === detail.serviceId ? ({ ...s, myBadge: detail.yourBadge } as any) : s));
    };
    window.addEventListener('my_rating_updated', handler as EventListener);
    return () => window.removeEventListener('my_rating_updated', handler as EventListener);
  }, []);

  // React to live provider profile updates and patch visible cards
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { providerId: string; name?: string } | undefined;
      if (!detail) return;
      setHospitalServices(prev => prev.map(s => {
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

  // Fallback: when current user's name changes, patch own cards
  useEffect(() => {
    if (!user?.id || !user?.name) return;
    setHospitalServices(prev => prev.map(s => {
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
    setIsLoading(true);
    try {
      const { services, hasMore: more } = await ServiceManager.fetchPublicServices({ type: 'clinic', page: next, limit: 9 });
      const mapped = services.map((service: any) => {
        const isOwn = String((service as any).providerId) === String(user?.id || '');
        const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Hospital') : ((service as any).providerName || 'Hospital');
        return ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          rating: service.averageRating || service.rating || 0,
          location: (service as any).city || "Karachi",
          type: service.category === "Surgery" ? "Surgery" : "Treatment",
          category: (service as any).category,
          homeService: false,
          image: service.image,
          provider: resolvedProviderName,
          createdAt: (service as any).createdAt,
          _providerId: (service as any).providerId,
          _providerType: ((service as any).providerType === 'hospital' ? 'clinic' : (service as any).providerType) || 'clinic',
          googleMapLink: (service as any).googleMapLink,
          city: (service as any).city,
          detailAddress: (service as any).detailAddress,
          providerPhone: (service as any).providerPhone,
          totalRatings: (service as any).totalRatings,
          ratingBadge: (service as any).ratingBadge || null,
          availability: (service as any).availability,
          serviceType: (service as any).serviceType,
          homeDelivery: Boolean((service as any).homeDelivery) || false,
          // Provider verification propagated from API or fallback to current user for own services
          _providerVerified: typeof (service as any)._providerVerified !== 'undefined'
            ? Boolean((service as any)._providerVerified)
            : (isOwn && Boolean((user as any)?.isVerified) && Boolean((user as any)?.licenseNumber) && String((user as any)?.licenseNumber).trim() !== ''),
        }) as unknown as Service;
      });
      setHospitalServices(prev => {
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
    return hospitalServices.filter(service => {
      return service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [hospitalServices, searchTerm]);

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

    // Prepare service data with required fields
    const serviceWithProviderInfo = {
      ...service,
      provider: service.provider || (service as any).providerName || 'Unknown Provider',
      _providerType: 'clinic',
      _providerId: (service as any)._providerId || service.id,
      providerPhone: (service as any).providerPhone
    };

    setSelectedBookingService(serviceWithProviderInfo);
    setIsBookingModalOpen(true);
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
    // Always use real address data from dashboard
    if (service.detailAddress) {
      return service.detailAddress;
    }
    // Fallback to city only if no detailed address
    return service.location || service.city || "Location not specified";
  };

  const currentMapService = showLocationMap
    ? (() => {
      const svc = hospitalServices.find(s => s.id === showLocationMap);
      if (!svc) return null;
      const coordinates = getCoordinatesForLocation(svc.location || "Karachi");
      const address = getServiceAddress(svc);
      return { ...svc, coordinates, address } as any;
    })()
    : null;

  if (isLoading && hospitalServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Find Hospitals & Clinics</h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Search from our network of healthcare facilities
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
              <h1 className="text-3xl font-bold mb-1">Find Hospitals & Clinics</h1>
              <p className="text-base md:text-lg text-gray-500">
                Search from our network of healthcare facilities
              </p>
            </div>

            {/* Right: Search */}
            <div className="w-full md:w-auto">
              {/* Top row: label (left) and results (right) */}
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-base md:text-lg font-semibold text-gray-700">Search hospitals</span>
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
                  id="hospital-search"
                  placeholder="Search hospitals by name, location, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-[360px] pl-9 h-11 rounded-md border border-gray-300 bg-white/90 text-gray-800 placeholder:text-gray-400 shadow-sm transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl border border-gray-200 bg-gray-50"
            >
              <CardContent className="p-5 flex flex-col h-full">
                {/* Image */}
                <div className="w-full h-48 md:h-56 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-4 relative">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // prevent infinite loop
                        target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'text-gray-400 text-4xl';
                        fallback.textContent = '🏥';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                ) : (
                  <span className="text-gray-400 text-4xl">🏥</span>
                )}

                {/* Top-left recommended overlay */}
                {(service as any).recommended && (
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <div className="px-3 py-1.5 text-[11px] shadow-lg bg-gradient-to-r from-slate-400 via-gray-300 to-slate-500 border border-slate-400/60 rounded-md flex items-center gap-1.5 backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="text-slate-800">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-900 text-[10px] tracking-wider">RECOMMENDED</span>
                        <span className="font-medium text-slate-700 text-[8px]">by SehatKor</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute top-1.5 right-1.5 z-10 flex flex-col items-end gap-0.5">
                  {((service as any)._providerVerified === true) ? (
                    <Badge className="text-[9px] px-1.5 py-0.5 bg-green-600 text-white border-0 shadow-lg">Verified</Badge>
                  ) : (
                    <Badge className="text-[9px] px-1.5 py-0.5 bg-red-600 text-white border-0 shadow-lg">Unverified</Badge>
                  )}
                  <Badge className="text-[9px] px-1.5 py-0.5 bg-blue-600 text-white border-0 shadow-lg">Hospital</Badge>
                </div>
              </div>

                {/* Title and Provider */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
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
                      {service.price === 0
                        ? "Free"
                        : (
                          <>
                            <span className="text-xs">PKR </span>
                            <span className="text-sm">{service.price.toLocaleString()}</span>
                          </>
                        )}
                    </div>
                    <div className="flex gap-1 justify-end mt-1">
                      <Badge
                        variant="outline"
                        className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-600 border-rose-100"
                      >
                        {(service as any).category || service.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Address + Disease (badge on right) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 mb-4">
                  <span className="text-xs text-gray-600 truncate">
                    {(service as any).detailAddress || service.location || 'Address not specified'}
                  </span>
                  {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap self-start sm:self-center">
                      {((service as any).diseases as string[])[0]}
                    </Badge>
                  )}
                </div>

                {/* Rating, Location, WhatsApp, Availability, Service Type */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 text-sm">
                  <RatingBadge
                    rating={service.rating}
                    totalRatings={(service as any).totalRatings || 0}
                    ratingBadge={(service as any).ratingBadge}
                    yourBadge={(service as any).myBadge || null}
                  />
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                  {(service as any).homeDelivery && (
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                      <span className="leading-none">🏠</span>
                      <span className="leading-none">Home Delivery</span>
                    </Badge>
                  )}
                  
                  {(service as any).providerPhone && (
                    <ServiceWhatsAppButton
                      phoneNumber={(service as any).providerPhone}
                      serviceName={service.name}
                      providerName={service.provider}
                      providerId={(service as any)._providerId}
                    />
                  )}
                  {(service as any).availability && (
                    <AvailabilityBadge availability={(service as any).availability} size="sm" />
                  )}
                  {(service as any).serviceType && (
                    <ServiceTypeBadge serviceType={(service as any).serviceType} size="sm" />
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-auto grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    className="col-span-1 sm:flex-1 sm:min-w-[80px] h-8 text-xs bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-300/30 hover:shadow-blue-400/40 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-blue-400"
                    onClick={() => handleBookNow(service)}
                  >
                    <Clock className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Book</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowLocationMap(service.id)}
                    className="col-span-1 sm:flex-1 sm:min-w-[80px] h-8 text-xs bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800"
                  >
                    <MapPin className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Location</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/service/${service.id}`, { state: { service: { ...service, clinicCategory: (service as any).category }, fromHospitals: true } })}
                    className="col-span-2 sm:col-span-1 sm:flex-1 sm:min-w-[80px] h-8 text-xs"
                  >
                    Details
                  </Button>
                  {user && (user.role === 'patient' || mode === 'patient') && (user?.id !== (service as any)._providerId) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRateService(service)}
                      className="col-span-2 sm:col-span-1 sm:flex-1 sm:min-w-[80px] h-8 text-xs"
                    >
                      <Star className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Rate</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No hospitals found</p>
                <p>Try adjusting your search criteria</p>
              </div>
            </CardContent>
          </Card>
        )}
        {filteredServices.length > 0 && hasMore && (
          <div className="col-span-full flex justify-center mt-8">
            <Button onClick={loadMore} disabled={isLoading} variant="outline">
              {isLoading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </div>

      {/* Location Modal */}
      {showLocationMap && currentMapService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{currentMapService.name}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowLocationMap(null)}>
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
                <Button className="w-full mt-4" onClick={() => window.open(currentMapService.googleMapLink, '_blank')}>
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
          serviceType="clinic"
          serviceName={selectedRatingService.name}
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

export default HospitalsPage;