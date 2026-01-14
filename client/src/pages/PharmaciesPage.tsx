import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import ServiceManager from "@/lib/serviceManager";
import { Service } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Minimize2, Maximize2, X, Search, Home, Clock, Star } from "lucide-react";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "../context/SocketContext";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import RatingBadge from "@/components/RatingBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import RatingModal from "@/components/RatingModal";
import BookingOptionsModal from "@/components/BookingOptionsModal";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import EmptyState from "@/components/EmptyState";
import PageSearchHeader from "@/components/PageSearchHeader";

const PharmaciesPage = () => {
  const navigate = useNavigate();
  const [pharmacyServices, setPharmacyServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean | undefined>(true);

  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingService, setSelectedRatingService] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<any>(null);

  const { user, mode } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    let isMounted = true;
    const loadPage = async (nextPage: number) => {
      setIsLoading(true);
      try {
        const { services, hasMore: more } = await ServiceManager.fetchPublicServices({
          type: 'pharmacy',
          page: nextPage,
          limit: 12,
        });
        if (!isMounted) return;
        const mapped = services.map((service: any) => {
          const isOwn = String((service as any).providerId) === String(user?.id || '');
          const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Pharmacy') : ((service as any).providerName || 'Pharmacy');
          const s = {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            rating: service.averageRating || service.rating || 0,
            location: (service as any).city || "Karachi",
            type: (service as any).category || "Pharmacy",
            homeService: false,
            image: service.image,
            provider: resolvedProviderName,
            createdAt: (service as any).createdAt,
            _providerId: (service as any).providerId,
            _providerType: (service as any).providerType ?? 'pharmacy',
            googleMapLink: (service as any).googleMapLink,
            detailAddress: (service as any).detailAddress,
            providerPhone: (service as any).providerPhone,
            totalRatings: (service as any).totalRatings,
            ratingBadge: (service as any).ratingBadge || null,
            availability: (service as any).availability || 'Physical',
            serviceType: (service as any).serviceType || undefined,
            homeDelivery: Boolean((service as any).homeDelivery) === true,
            recommended: Boolean((service as any).recommended),
            // Provider verification propagated from API or fallback to current user for own services
            _providerVerified: typeof (service as any)._providerVerified !== 'undefined'
              ? Boolean((service as any)._providerVerified)
              : (isOwn && Boolean((user as any)?.isVerified) && Boolean((user as any)?.licenseNumber) && String((user as any)?.licenseNumber).trim() !== ''),
          } as Service;
          // Hydrate user's own badge from localStorage
          try {
            const uid = (user as any)?.id || (user as any)?._id || 'anon';
            const key = `myRating:${uid}:pharmacy:${service.id}`;
            const my = localStorage.getItem(key);
            if (my) (s as any).myBadge = my as any;
          } catch { }
          return s;
        });
        setPharmacyServices(prev => {
          const byId = new Map(prev.map(s => [s.id, s] as const));
          for (const s of mapped) byId.set(s.id, s);
          const arr = Array.from(byId.values());
          arr.sort((a: any, b: any) => {
            const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
            const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
            if (aOwn !== bOwn) return aOwn ? -1 : 1;

            // Recommended services priority (recommended services appear first)
            const aRecommended = Boolean((a as any).recommended);
            const bRecommended = Boolean((b as any).recommended);
            if (aRecommended !== bRecommended) return bRecommended ? 1 : -1;

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
    setPharmacyServices([]);
    setPage(1);
    loadPage(1);
    return () => { isMounted = false; };
  }, [user?.id, user?.name]);

  useEffect(() => {
    if (!socket) return;

    const handleRatingUpdate = (data: { serviceId: string; averageRating: number; totalRatings: number; ratingBadge: 'excellent' | 'good' | 'fair' | 'poor' }) => {
      setPharmacyServices(prevServices => {
        const updated = prevServices.map(service =>
          service.id === data.serviceId
            ? { ...service, rating: data.averageRating, totalRatings: data.totalRatings, ratingBadge: data.ratingBadge }
            : service
        );
        updated.sort((a: any, b: any) => {
          const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
          const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
          if (aOwn !== bOwn) return aOwn ? -1 : 1;

          // Recommended services priority (recommended services appear first)
          const aRecommended = Boolean((a as any).recommended);
          const bRecommended = Boolean((b as any).recommended);
          if (aRecommended !== bRecommended) return bRecommended ? 1 : -1;

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
      if (!data || data.providerType !== 'pharmacy') return;
      setPharmacyServices(prev => prev.map(s => s.id === data.serviceId ? ({ ...s, recommended: Boolean(data.recommended) } as any) : s));
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
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent' | 'good' | 'normal' | 'poor' } | undefined;
      if (!detail) return;
      if (detail.serviceType !== 'pharmacy') return;
      setPharmacyServices(prev => prev.map(s => s.id === detail.serviceId ? ({ ...s, myBadge: detail.yourBadge } as any) : s));
    };
    window.addEventListener('my_rating_updated', handler as EventListener);
    return () => window.removeEventListener('my_rating_updated', handler as EventListener);
  }, []);

  // React to live provider profile updates (e.g., name change) and patch visible cards immediately
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { providerId: string; name?: string } | undefined;
      if (!detail) return;
      setPharmacyServices(prev => prev.map(s => {
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
    setPharmacyServices(prev => prev.map(s => {
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
      const { services, hasMore: more } = await ServiceManager.fetchPublicServices({ type: 'pharmacy', page: next, limit: 12 });
      const mapped = services.map((service: any) => {
        const isOwn = String((service as any).providerId) === String(user?.id || '');
        const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Pharmacy') : ((service as any).providerName || 'Pharmacy');
        const s = {
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          rating: service.averageRating || service.rating || 0,
          location: (service as any).city || "Karachi",
          type: (service as any).category || "Pharmacy",
          homeService: false,
          image: service.image,
          provider: resolvedProviderName,
          createdAt: (service as any).createdAt,
          _providerId: (service as any).providerId,
          _providerType: (service as any).providerType ?? 'pharmacy',
          googleMapLink: (service as any).googleMapLink,
          detailAddress: (service as any).detailAddress,
          providerPhone: (service as any).providerPhone,
          totalRatings: (service as any).totalRatings,
          ratingBadge: (service as any).ratingBadge || null,
          availability: (service as any).availability || 'Physical',
          serviceType: (service as any).serviceType || undefined,
          homeDelivery: Boolean((service as any).homeDelivery) === true,
          recommended: Boolean((service as any).recommended),
          // Provider verification propagated from API or fallback to current user for own services
          _providerVerified: typeof (service as any)._providerVerified !== 'undefined'
            ? Boolean((service as any)._providerVerified)
            : (isOwn && Boolean((user as any)?.isVerified) && Boolean((user as any)?.licenseNumber) && String((user as any)?.licenseNumber).trim() !== ''),
        } as Service;
        // Hydrate user's own badge from localStorage
        try {
          const uid = (user as any)?.id || (user as any)?._id || 'anon';
          const key = `myRating:${uid}:pharmacy:${service.id}`;
          const my = localStorage.getItem(key);
          if (my) (s as any).myBadge = my as any;
        } catch { }
        return s;
      });
      setPharmacyServices(prev => {
        const byId = new Map(prev.map(s => [s.id, s] as const));
        for (const s of mapped) byId.set(s.id, s);
        const arr = Array.from(byId.values());
        arr.sort((a: any, b: any) => {
          const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
          const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
          if (aOwn !== bOwn) return aOwn ? -1 : 1;

          // Recommended services priority (recommended services appear first)
          const aRecommended = Boolean((a as any).recommended);
          const bRecommended = Boolean((b as any).recommended);
          if (aRecommended !== bRecommended) return bRecommended ? 1 : -1;

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
    return pharmacyServices.filter(service => {
      return service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [pharmacyServices, searchTerm]);

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

    // Prepare service data for booking modal
    const bookingService = {
      id: service.id,
      name: service.name,
      provider: service.provider,
      price: Number((service as any).price ?? 0),
      image: service.image,
      location: service.location,
      _providerId: (service as any)._providerId || service.id,
      _providerType: 'pharmacy',
      providerPhone: (service as any).providerPhone,
    };

    setSelectedBookingService(bookingService);
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
      const svc = pharmacyServices.find(s => s.id === showLocationMap);
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
              <h1 className="text-3xl font-bold mb-2">Find Pharmacies</h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Search from our network of pharmacies and medicine providers
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
      <Helmet>
        <title>{
          searchTerm
            ? `${searchTerm} - Online Pharmacy & Medicines | Sehatkor`
            : `Online Pharmacy in Pakistan | Buy Medicine Online | Home Delivery`
        }</title>
        <meta name="description" content={
          searchTerm
            ? `Buy ${searchTerm} online in Pakistan. Check price, availability and get home delivery from trusted pharmacies. Genuine medicines, 100% authentic.`
            : `Pakistan's most trusted online pharmacy. Buy medicines, vitamins, and healthcare products with fast home delivery. Upload prescription and get medicines at your doorstep.`
        } />
        <meta name="keywords" content={(() => {
          const baseKeywords = [
            // Core Pharmacy Terms
            "online pharmacy Pakistan", "buy medicine online", "medicine delivery",
            "medical store near me", "pharmacy near me", "home delivery pharmacy",
            "discount pharmacy", "authentic medicine",

            // Major Brands & Chains (Contextual)
            "HealthPlus", "Dvago", "Servaid", "Clinix", "Fazal Din",

            // High Volume Medicine Names
            "Panadol", "Panadol Extra", "Brufen", "Disprin", "Arinac",
            "Augmentin", "Azomax", "Ciproxin", "Antibiotics",
            "Insulin", "Lantus", "Humulin", "Glucophage", "Diabetes medicine",
            "Ventolin Inhaler", "Cough syrup", "Surbex Z", "Calcium tablets",

            // Categories & Personal Care
            "Vitamins", "Multivitamins", "Food Supplements", "Protein powder",
            "Skin care products", "Face wash", "Sunblock", "Acne cream",
            "Baby care", "Pampers", "Baby milk", "Feeder",
            "Sexual health", "Contraceptives", "Condoms",

            // Devices & Surgical
            "Blood pressure monitor", "BP apparatus", "Glucometer", "Sugar check machine",
            "Thermometer", "Oximeter", "Nebulizer machine", "Wheelchair",
            "Surgical mask", "Gloves", "Bandages",

            // Urdu Keywords
            "آنلائن فارمیسی", "ادویات گھر منگوائیں", "میڈیکل سٹور", "دوائیاں",
            "شوگر کی دوائی", "بلڈ پریشر کی مشین", "طاقت کی دوائی"
          ];

          let dynamicKeywords = [];

          if (searchTerm) {
            dynamicKeywords.push(
              `price of ${searchTerm}`,
              `buy ${searchTerm} online`,
              `${searchTerm} side effects`,
              `${searchTerm} uses`,
              `${searchTerm} dosage`,
              `${searchTerm} in Pakistan`,
              `${searchTerm} ki qeemat` // Urdu
            );
          }

          return Array.from(new Set([...dynamicKeywords, ...baseKeywords])).join(", ");
        })()} />
        <link rel="canonical" href={`https://sehatkor.pk/pharmacies${searchTerm ? `?search=${searchTerm}` : ''}`} />
      </Helmet>
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <PageSearchHeader
            title={
              <span className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Find Pharmacies
              </span>
            }
            subtitle="Search from our network of pharmacies and medicine providers"
            rightContent={
              <div className="flex flex-col items-end">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-600 font-nastaliq leading-normal pb-2" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}>
                  بہترین فارمیسی تلاش کریں
                </h1>
                <p className="mt-1 text-sm md:text-base text-slate-500 font-nastaliq text-right" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}>
                  آن لائن ادویات آرڈر کریں اور گھر منگوائیں
                </p>
              </div>
            }
            label="Search pharmacies"
            placeholder="Search pharmacies by name, medicine, or location..."
            value={searchTerm}
            onChange={(v) => setSearchTerm(v)}
            resultsCount={filteredServices.length}
          />
        </div>

        {/* Results */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 rounded-none border border-gray-300 hover:border-gray-400 transition-colors bg-gradient-to-br from-gray-100 via-gray-100 to-gray-200"
            >
              <CardContent className="p-3 flex flex-col h-full">
                {/* Image */}
                <div className="w-full h-40 md:h-48 bg-gray-100 rounded-none flex items-center justify-center overflow-hidden mb-2 relative">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'text-gray-400 text-4xl';
                        fallback.textContent = '💊';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">💊</span>
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

                  {/* Top-right corner badges */}
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end">
                    {(service as any)._providerVerified ? (
                      <Badge className="text-[8px] px-1 py-0.5 bg-green-600 text-white border-0 shadow-lg">
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="text-[8px] px-1 py-0.5 bg-red-600 text-white border-0 shadow-lg">
                        Unverified
                      </Badge>
                    )}
                    <Badge className="text-[8px] px-1 py-0.5 bg-blue-600 text-white border-0 shadow-lg">
                      Pharmacy
                    </Badge>
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
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 border-rose-100"
                    >
                      {service.type}
                    </Badge>
                  </div>
                </div>

                {/* Address */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 mb-3">
                  <span className="text-xs text-gray-600 truncate">
                    {(service as any).detailAddress || service.location || 'Address not specified'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {service.description}
                </p>

                {/* 3 fixed rows: match DoctorsPage layout */}
                <div className="space-y-2 mb-3 text-sm">
                  {/* Row 1: Rating (start) and Location (end) */}
                  <div className="flex justify-between items-center min-h-[24px]">
                    <div className="flex-shrink-0">
                      <RatingBadge
                        rating={service.rating}
                        totalRatings={(service as any).totalRatings || 0}
                        ratingBadge={(service as any).ratingBadge}
                        yourBadge={(service as any).myBadge || null}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">{service.location}</span>
                    </div>
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

                  {/* Row 3: Home Delivery (start), Availability (center), WhatsApp + Rate (end) */}
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
                      {(service as any).availability ? (
                        <AvailabilityBadge availability={(service as any).availability} size="sm" />
                      ) : (
                        <div className="h-6"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(service as any).providerPhone && (
                        <ServiceWhatsAppButton
                          phoneNumber={(service as any).providerPhone}
                          serviceName={service.name}
                          providerName={service.provider}
                          serviceId={service.id}
                          providerId={(service as any)._providerId}
                        />
                      )}
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
                    onClick={() => navigate(`/service/${service.id}`, { state: { service, fromPharmacies: true } })}
                    className="col-span-2 sm:col-span-1 sm:flex-1 sm:min-w-[80px] h-8 text-xs"
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <EmptyState
            variant="pharmacy"
            title="No pharmacies found"
            message="Try different keywords or adjust filters to broaden your search"
            actionLabel={searchTerm ? "Clear search" : undefined}
            onAction={searchTerm ? () => setSearchTerm("") : undefined}
          />
        )}
        {filteredServices.length > 0 && hasMore && (
          <div className="col-span-full flex justify-center mt-8">
            <Button
              onClick={loadMore}
              disabled={isLoading}
              className="relative overflow-hidden rounded-full px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-purple-500/40 ring-2 ring-white/20 hover:ring-white/30 transition-all duration-300 group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="font-semibold tracking-wide">{isLoading ? 'Loading...' : 'Load More'}</span>
                {!isLoading && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="opacity-90 animate-bounce">
                    <path d="M12 16l-5-5h10l-5 5z"></path>
                  </svg>
                )}
              </span>
              <span className="absolute inset-0 bg-white/10 blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></span>
            </Button>
          </div>
        )}
      </div>

      {/* Location Modal */}
      {!!showLocationMap && !!currentMapService && (
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
      {selectedRatingService && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedRatingService(null);
          }}
          serviceId={selectedRatingService.id}
          serviceType="pharmacy"
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

export default PharmaciesPage;