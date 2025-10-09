import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, CheckCircle, ArrowRight, X, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button as UIButton } from "@/components/ui/button";
import ServiceManager from "@/lib/serviceManager";
import { useNavigate } from "react-router-dom";
import RatingBadge from "@/components/RatingBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import RatingModal from "@/components/RatingModal";
import BookingOptionsModal from "@/components/BookingOptionsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

type Unified = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  location: string; // Combined for display
  city?: string;
  detailAddress?: string;
  hospitalClinicName?: string;
  googleMapLink?: string;
  provider: string;
  image?: string;
  type: "Treatment" | "Medicine" | "Test" | "Surgery";
  // Real pharmacy category (e.g., Tablets, Capsules) when providerType is pharmacy
  pharmacyCategory?: string;
  // Real lab category (e.g., Blood Test, Urine Test, X-Ray) when providerType is laboratory
  labCategory?: string;
  // Real doctor category (e.g., Consultation, Therapy) when providerType is doctor
  doctorCategory?: string;
  // Real clinic/hospital category when providerType is clinic
  clinicCategory?: string;
  // Department field for hospital services
  department?: string;
  createdAt?: string;
  updatedAt?: string;
  ratingBadge?: string | null;
  providerPhone?: string;
  _providerId?: string;
  _providerType?: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  _providerVerified?: boolean;
  totalRatings?: number;
  // base time fields (optional) in case backend sends them for base service
  timeLabel?: string;
  startTime?: string;
  endTime?: string;
  days?: string;
  // availability of service
  availability?: 'Online' | 'Physical' | 'Online and Physical';
  // service type for pharmacy services
  serviceType?: "Sehat Card" | "Private" | "Charity" | "Public" | "NPO" | "NGO";
  // pharmacy flag
  homeDelivery?: boolean;
  // diseases list (doctor services)
  diseases?: string[];
  // variants array (doctor services primarily)
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
  // recommended flag
  recommended?: boolean;
};

const CompareExplorer = () => {
  const navigate = useNavigate();
  const { user, mode } = useAuth();
  const { socket } = useSocket();
  const [selectedName, setSelectedName] = useState<string>("");
  const [nameQuery, setNameQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [services, setServices] = useState<Unified[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingService, setSelectedRatingService] = useState<Unified | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<Unified | null>(null);
  const [expandedDiseases, setExpandedDiseases] = useState<string | null>(null);

  // Inline Virus icon to match other pages
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

  // Listen for rating updates from RatingModal and refresh the targeted service
  useEffect(() => {
    const onMyRatingUpdated = async (evt: Event) => {
      try {
        const anyEvt = evt as CustomEvent<{ serviceId: string; serviceType?: Unified['_providerType'] }>;
        const { serviceId, serviceType } = anyEvt.detail || ({} as any);
        if (!serviceId) return;
        const updated = await ServiceManager.fetchServiceById(serviceId, serviceType || 'doctor');
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...updated, rating: (updated as any)?.averageRating ?? (s as any)?.rating } as Unified : s));
      } catch (e) {
        console.error('Failed to refresh service after rating update', e);
      }
    };
    window.addEventListener('my_rating_updated', onMyRatingUpdated as EventListener);
    return () => window.removeEventListener('my_rating_updated', onMyRatingUpdated as EventListener);
  }, []);

  // Fetch live services from backend only (no localStorage/mocks)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await ServiceManager.fetchPublicServices({ limit: 500 });
        const unified: Unified[] = (res.services || []).map((s: any) => {
          const isOwn = String((s as any)?.providerId) === String((user as any)?.id || '');
          const resolvedProviderName = isOwn ? ((user as any)?.name || (s as any)?.providerName) : (s as any)?.providerName;
          return {
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            rating: (s as any)?.averageRating || (s as any)?.rating || 0,
            location: [s.detailAddress, s.city].filter(Boolean).join(', ') || 'Location not provided',
            city: s.city,
            detailAddress: s.detailAddress,
            hospitalClinicName: s.hospitalClinicName,
            googleMapLink: s.googleMapLink,
            provider: resolvedProviderName,
            image: (s as any)?.image,
            type: s.providerType === "doctor" ? "Treatment" : s.providerType === "pharmacy" ? "Medicine" : s.providerType === "laboratory" ? "Test" : (s as any)?.category === "Surgery" ? "Surgery" : "Treatment",
            // Preserve real pharmacy category
            pharmacyCategory: (s as any)?.providerType === 'pharmacy' ? ((s as any)?.category || undefined) : undefined,
            // Preserve real lab category
            labCategory: (s as any)?.providerType === 'laboratory' ? ((s as any)?.category || undefined) : undefined,
            // Preserve real doctor category
            doctorCategory: (s as any)?.providerType === 'doctor' ? ((s as any)?.category || undefined) : undefined,
            // Preserve real clinic category
            clinicCategory: (s as any)?.providerType === 'clinic' ? ((s as any)?.category || undefined) : undefined,
            // Preserve department field for hospital services
            department: (s as any)?.providerType === 'clinic' ? ((s as any)?.department || undefined) : undefined,
            createdAt: (s as any)?.createdAt,
            updatedAt: (s as any)?.updatedAt,
            ratingBadge: (s as any)?.ratingBadge || null,
            providerPhone: (s as any)?.providerPhone,
            _providerId: (s as any)?.providerId,
            _providerType: (s as any)?.providerType,
            // Verification: prefer backend `_providerVerified`; if missing and it's your own card, fallback to AuthContext
            _providerVerified: (typeof (s as any)?._providerVerified !== 'undefined')
              ? Boolean((s as any)?._providerVerified)
              : (isOwn && Boolean((user as any)?.isVerified) && Boolean((user as any)?.licenseNumber) && String((user as any)?.licenseNumber).trim() !== ''),
            totalRatings: (s as any)?.totalRatings || 0,
            timeLabel: (s as any)?.timeLabel,
            startTime: (s as any)?.startTime,
            endTime: (s as any)?.endTime,
            days: (s as any)?.days,
            availability: (s as any)?.availability as any,
            serviceType: (s as any)?.serviceType,
            homeDelivery: ((s as any)?.providerType === 'pharmacy' || (s as any)?.providerType === 'laboratory' || (s as any)?.providerType === 'clinic' || (s as any)?.providerType === 'doctor') ? Boolean((s as any)?.homeDelivery) : undefined,
            diseases: Array.isArray((s as any)?.diseases) ? (s as any).diseases : undefined,
            variants: (s as any)?.variants || [],
            recommended: Boolean((s as any)?.recommended),
          } as Unified;
        });
        if (isMounted) setServices(unified);
      } catch (e) {
        console.error("Failed to fetch services for CompareExplorer", e);
        if (isMounted) setServices([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.id, user?.name]);

  // React to live provider profile updates (e.g., name change) and patch visible cards immediately
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { providerId: string; name?: string } | undefined;
      if (!detail) return;
      setServices(prev => prev.map(svc => {
        const pid = (svc as any)._providerId;
        if (String(pid) === String(detail.providerId)) {
          return { ...svc, provider: detail.name || svc.provider } as Unified;
        }
        return svc;
      }));
    };
    window.addEventListener('provider_profile_updated', handler as EventListener);
    return () => window.removeEventListener('provider_profile_updated', handler as EventListener);
  }, []);

  // Fallback: if current user's name changes, patch own cards
  useEffect(() => {
    if (!user?.id || !user?.name) return;
    setServices(prev => prev.map(svc => {
      const pid = (svc as any)._providerId;
      if (String(pid) === String(user.id)) {
        return { ...svc, provider: user.name } as Unified;
      }
      return svc;
    }));
  }, [user?.id, user?.name]);

  const allItems: Unified[] = useMemo(() => services, [services]);

  const names = useMemo(() => Array.from(new Set(allItems.map(i => i.name))).sort(), [allItems]);
  const filteredNames = useMemo(() => {
    const q = nameQuery.toLowerCase();
    const subset = names.filter(n => n.toLowerCase().includes(q));
    // Prioritize names that start with the query, then by earliest match position, then alphabetical
    return subset.sort((a, b) => {
      const al = a.toLowerCase();
      const bl = b.toLowerCase();
      const aStarts = al.startsWith(q) ? 0 : 1;
      const bStarts = bl.startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      const ai = al.indexOf(q);
      const bi = bl.indexOf(q);
      if (ai !== bi) return ai - bi;
      return al.localeCompare(bl);
    });
  }, [names, nameQuery]);
  const effectiveSelectedName = useMemo(() => selectedName || (nameQuery ? filteredNames[0] : ""), [selectedName, nameQuery, filteredNames]);
  const offerings = useMemo(() => (effectiveSelectedName ? allItems.filter(i => i.name === effectiveSelectedName) : []), [allItems, effectiveSelectedName]);

  // Filters: location + price range
  const [locFilter, setLocFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");

  // Static location list mirroring SearchPage.tsx
  const LOCATION_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Locations' },
    // Sindh
    { value: 'Karachi', label: 'Karachi (Sindh)' },
    { value: 'Hyderabad', label: 'Hyderabad (Sindh)' },
    { value: 'Sukkur', label: 'Sukkur (Sindh)' },
    { value: 'Larkana', label: 'Larkana (Sindh)' },
    { value: 'Nawabshah', label: 'Nawabshah (Sindh)' },
    { value: 'Mirpur Khas', label: 'Mirpur Khas (Sindh)' },
    // Punjab
    { value: 'Lahore', label: 'Lahore (Punjab)' },
    { value: 'Faisalabad', label: 'Faisalabad (Punjab)' },
    { value: 'Rawalpindi', label: 'Rawalpindi (Punjab)' },
    { value: 'Multan', label: 'Multan (Punjab)' },
    { value: 'Gujranwala', label: 'Gujranwala (Punjab)' },
    { value: 'Sialkot', label: 'Sialkot (Punjab)' },
    { value: 'Bahawalpur', label: 'Bahawalpur (Punjab)' },
    { value: 'Sargodha', label: 'Sargodha (Punjab)' },
    { value: 'Gujrat', label: 'Gujrat (Punjab)' },
    { value: 'Sheikhupura', label: 'Sheikhupura (Punjab)' },
    // Khyber Pakhtunkhwa
    { value: 'Peshawar', label: 'Peshawar (KPK)' },
    { value: 'Mardan', label: 'Mardan (KPK)' },
    { value: 'Lund Khwar', label: 'Lund Khwar (KPK)' },
    { value: 'Shergarh', label: 'Shergarh (KPK)' },
    { value: 'Abbottabad', label: 'Abbottabad (KPK)' },
    { value: 'Swat', label: 'Swat/Mingora (KPK)' },
    { value: 'Kohat', label: 'Kohat (KPK)' },
    { value: 'Dera Ismail Khan', label: 'Dera Ismail Khan (KPK)' },
    { value: 'Mansehra', label: 'Mansehra (KPK)' },
    { value: 'Bannu', label: 'Bannu (KPK)' },
    // Balochistan
    { value: 'Quetta', label: 'Quetta (Balochistan)' },
    { value: 'Gwadar', label: 'Gwadar (Balochistan)' },
    { value: 'Khuzdar', label: 'Khuzdar (Balochistan)' },
    { value: 'Turbat', label: 'Turbat (Balochistan)' },
    { value: 'Chaman', label: 'Chaman (Balochistan)' },
    { value: 'Sibi', label: 'Sibi (Balochistan)' },
    { value: 'Zhob', label: 'Zhob (Balochistan)' },
    { value: 'Hub', label: 'Hub (Balochistan)' },
    // Capital Territory
    { value: 'Islamabad', label: 'Islamabad (ICT)' },
  ];

  // Recompute max price and reset range when offerings change
  useEffect(() => {
    if (!offerings.length) {
      setMaxPrice(100000);
      setPriceRange([0, 100000]);
      setLocFilter('all');
      setPriceFilter('all');
      setCustomFrom("");
      setCustomTo("");
      return;
    }
    const computedMax = Math.max(0, ...offerings.map(o => Number(o.price) || 0));
    const safeMax = Number.isFinite(computedMax) && computedMax > 0 ? computedMax : 100000;
    setMaxPrice(safeMax);
    setPriceRange([0, safeMax]);
    setLocFilter('all');
    setPriceFilter('all');
    setCustomFrom("");
    setCustomTo("");
  }, [offerings]);

  const filteredOfferings = useMemo(() => {
    return offerings.filter(o => {
      const byLoc = locFilter === 'all' || (o.city ? String(o.city) === locFilter : false);
      const p = Number(o.price) || 0;
      const byPrice = p >= priceRange[0] && p <= priceRange[1];
      return byLoc && byPrice;
    });
  }, [offerings, locFilter, priceRange]);

  const limitedOfferings = useMemo(() => filteredOfferings.slice(0, 6), [filteredOfferings]);
  const selected = useMemo(() => offerings.filter(i => selectedIds.includes(i.id)), [offerings, selectedIds]);

  // Variant slider state and helpers
  const [activeIdxById, setActiveIdxById] = useState<Record<string, number>>({});

  const getVariants = (svc: Unified) => Array.isArray(svc.variants) ? svc.variants : [];
  const getSlides = (svc: Unified) => {
    const base = {
      imageUrl: svc.image,
      price: svc.price,
      city: svc.city,
      detailAddress: svc.detailAddress,
      googleMapLink: svc.googleMapLink,
      timeLabel: svc.timeLabel,
      startTime: svc.startTime,
      endTime: svc.endTime,
      days: svc.days,
      availability: svc.availability,
    };
    return [base, ...getVariants(svc)];
  };
  const getActiveSlide = (svc: Unified) => {
    const slides = getSlides(svc);
    const idx = activeIdxById[svc.id] ?? 0;
    if (!slides.length) return undefined;
    const safe = ((idx % slides.length) + slides.length) % slides.length;
    return slides[safe];
  };
  const getDisplayImage = (svc: Unified) => getActiveSlide(svc)?.imageUrl || svc.image;
  const getDisplayPrice = (svc: Unified) => {
    const p = getActiveSlide(svc)?.price;
    return (p != null && !Number.isNaN(Number(p))) ? Number(p) : svc.price;
  };
  const getDisplayLocation = (svc: Unified) => getActiveSlide(svc)?.city || svc.city || svc.location;
  const getDisplayAddress = (svc: Unified) => getActiveSlide(svc)?.detailAddress || svc.detailAddress;
  const getDisplayMapLink = (svc: Unified) => getActiveSlide(svc)?.googleMapLink || svc.googleMapLink;
  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTo12Hour = (time24?: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDisplayTimeInfo = (svc: Unified): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const range = v.startTime && v.endTime ? `${formatTo12Hour(v.startTime)} - ${formatTo12Hour(v.endTime)}` : "";
    const baseLabel = v.timeLabel ? String(v.timeLabel) : "";
    // If we have both a label (e.g., "Morning") and a concrete time range, show both: "Morning — 9:00 AM - 5:00 PM"
    const label = baseLabel && range ? `${baseLabel} — ${range}` : (baseLabel || range);
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  const getDisplayTimeRange = (svc: Unified): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    if (v.startTime && v.endTime) return `${formatTo12Hour(v.startTime)} - ${formatTo12Hour(v.endTime)}`;
    return v.timeLabel ? String(v.timeLabel) : null;
  };
  const nextVariant = (id: string) => setActiveIdxById(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const prevVariant = (id: string) => setActiveIdxById(prev => ({ ...prev, [id]: (prev[id] ?? 0) - 1 }));

  // Auto-advance variants every 10 seconds for visible offerings that have multiple slides
  useEffect(() => {
    const ids = limitedOfferings
      .filter(s => getSlides(s).length > 1)
      .map(s => s.id);
    if (ids.length === 0) return;
    const t = setInterval(() => {
      setActiveIdxById(prev => {
        const next = { ...prev } as Record<string, number>;
        ids.forEach(id => {
          next[id] = (next[id] ?? 0) + 1;
        });
        return next;
      });
    }, 10000);
    return () => clearInterval(t);
  }, [limitedOfferings]);

  // Real-time: Listen for recommended flag toggles and patch matching item
  useEffect(() => {
    if (!socket) return;
    const handleRecommendedToggle = (data: { serviceId: string; providerType?: string; recommended: boolean }) => {
      setServices(prev => prev.map(s => s.id === data.serviceId ? ({ ...s, recommended: Boolean(data.recommended) }) as Unified : s));
    };
    socket.on('service_recommendation_toggled', handleRecommendedToggle);
    return () => {
      socket.off('service_recommendation_toggled', handleRecommendedToggle);
    };
  }, [socket]);

  // Auto-select when only one match, and support Enter-to-select
  useEffect(() => {
    if (!selectedName && nameQuery && filteredNames.length === 1) {
      setSelectedName(filteredNames[0]);
    }
  }, [filteredNames, nameQuery, selectedName]);



  const currentMapService = useMemo(() => {
    if (!showLocationMap) return null;
    return allItems.find(s => s.id === showLocationMap) || null;
  }, [showLocationMap, allItems]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 4 ? prev : [...prev, id]));
  };

  const handleBookNow = (service: Unified) => {
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
    if (user && service._providerId && user.id === service._providerId) {
      toast.error('You cannot book your own service.');
      return;
    }
    // Always open the booking options modal first
    setSelectedBookingService(service);
    setIsBookingModalOpen(true);
  };

  const handleRateService = (service: Unified) => {
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



  const cheapest = useMemo(() => (selected.length ? [...selected].sort((a, b) => {
    // Recommended services priority (recommended services appear first)
    const aRecommended = Boolean((a as any).recommended);
    const bRecommended = Boolean((b as any).recommended);
    if (aRecommended !== bRecommended) return bRecommended ? 1 : -1;
    
    return a.price - b.price;
  })[0] : undefined), [selected]);
  const bestRated = useMemo(() => (selected.length ? [...selected].sort((a, b) => {
    // Recommended services priority (recommended services appear first)
    const aRecommended = Boolean((a as any).recommended);
    const bRecommended = Boolean((b as any).recommended);
    if (aRecommended !== bRecommended) return bRecommended ? 1 : -1;
    
    return b.rating - a.rating;
  })[0] : undefined), [selected]);

  return (
    <div 
      className="p-0 rounded-2xl"
    >
      <div className="container mx-auto max-w-7xl">
          {/* Centered Search Section */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-xl">
              <div className="space-y-3">
                <div className="relative w-11/12 mx-auto">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    placeholder="Search service name"
                    value={nameQuery}
                    onChange={(e) => { setNameQuery(e.target.value); setIsSuggestionsOpen(true); }}
                    onFocus={() => setIsSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredNames.length > 0) {
                        setSelectedName(filteredNames[0]);
                        setNameQuery(filteredNames[0]);
                        setIsSuggestionsOpen(false);
                      }
                    }}
                    className="pl-10 h-12 rounded-none w-full bg-gradient-to-br from-slate-50 via-zinc-50 to-white border border-gray-400/60 hover:from-slate-100 hover:via-zinc-50 hover:to-white focus:border-gray-500/70 focus:ring-0 focus-visible:ring-0 outline-none shadow-sm transition-all placeholder:text-gray-400"
                  />
                  {isSuggestionsOpen && nameQuery && filteredNames.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200/50 bg-white/90 backdrop-blur shadow-xl max-h-60 overflow-auto divide-y">
                      {filteredNames.slice(0, 8).map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedName(n);
                            setNameQuery(n);
                            setIsSuggestionsOpen(false);
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Inline filters: Location + Price */}
                {effectiveSelectedName && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end w-11/12 mx-auto">
                    {/* Location Filter */}
                    <div>
                      <label className="text-xs text-gray-600">Location</label>
                      <Select value={locFilter} onValueChange={setLocFilter}>
                        <SelectTrigger className="mt-1 h-10 w-full rounded-none bg-gradient-to-br from-slate-50 via-zinc-50 to-white border border-gray-400/60 hover:from-slate-100 hover:via-zinc-50 hover:to-white focus:ring-0 focus-visible:ring-0 focus:border-gray-500/70 outline-none">
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Price Filter (Preset Ranges + Custom) */}
                    <div>
                      <label className="text-xs text-gray-600">Price Range</label>
                      <Select
                        value={priceFilter}
                        onValueChange={(value) => {
                          setPriceFilter(value);
                          if (value === 'all') setPriceRange([0, maxPrice]);
                          else if (value === 'free') setPriceRange([0, 0]);
                          else if (value === '0-500') setPriceRange([0, 500]);
                          else if (value === '500-1000') setPriceRange([500, 1000]);
                          else if (value === '1000-2000') setPriceRange([1000, 2000]);
                          else if (value === '2000-5000') setPriceRange([2000, 5000]);
                          else if (value === '5000+') setPriceRange([5000, maxPrice]);
                          // For custom, keep current range; inputs below will commit
                          else if (value === 'custom') {
                            setCustomFrom("");
                            setCustomTo("");
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1 h-10 w-full rounded-none bg-gradient-to-br from-slate-50 via-zinc-50 to-white border border-gray-400/60 hover:from-slate-100 hover:via-zinc-50 hover:to-white focus:ring-0 focus-visible:ring-0 focus:border-gray-500/70 outline-none">
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
                      {priceFilter === 'custom' && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[11px] text-gray-600">From (PKR)</div>
                            <Input
                              type="number"
                              min={0}
                              max={maxPrice}
                              value={customFrom}
                              placeholder={String(0)}
                              onChange={(e) => setCustomFrom(e.target.value)}
                              onBlur={() => {
                                const parsed = customFrom.trim() === '' ? null : Number(customFrom);
                                const n = parsed != null && Number.isFinite(parsed) ? parsed : 0;
                                const clamped = Math.max(0, Math.min(n, maxPrice));
                                const newFrom = Math.min(clamped, priceRange[1]);
                                setPriceRange([newFrom, priceRange[1]]);
                                setCustomFrom(String(newFrom));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              className="h-9 rounded-none"
                            />
                          </div>
                          <div>
                            <div className="text-[11px] text-gray-600">To (PKR)</div>
                            <Input
                              type="number"
                              min={0}
                              max={maxPrice}
                              value={customTo}
                              placeholder={String(maxPrice)}
                              onChange={(e) => setCustomTo(e.target.value)}
                              onBlur={() => {
                                const parsed = customTo.trim() === '' ? null : Number(customTo);
                                const n = parsed != null && Number.isFinite(parsed) ? parsed : maxPrice;
                                const clamped = Math.max(0, Math.min(n, maxPrice));
                                const newTo = Math.max(clamped, priceRange[0]);
                                setPriceRange([priceRange[0], newTo]);
                                setCustomTo(String(newTo));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              }}
                              className="h-9 rounded-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <Select value={effectiveSelectedName} onValueChange={(v) => { setSelectedName(v); setNameQuery(v); }}>
                  <SelectTrigger className="h-12 rounded-none w-11/12 mx-auto bg-gradient-to-br from-slate-50 via-zinc-50 to-white border border-gray-400/60 hover:from-slate-100 hover:via-zinc-50 hover:to-white focus:ring-0 focus-visible:ring-0 focus:border-gray-500/70 outline-none shadow-sm transition-colors">
                    <SelectValue placeholder="Select service name" />
                  </SelectTrigger>
                  <SelectContent>
                    {names.map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-600 text-center h-4">{effectiveSelectedName ? `Showing ${offerings.length} providers` : ""}</div>
              </div>
            </div>
          </div>
          {/* Offerings shown only after selection/search */}
          {effectiveSelectedName && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {limitedOfferings.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200 rounded-none border border-gray-300 hover:border-gray-400 transition-colors bg-gradient-to-br from-gray-100 via-gray-100 to-gray-200 ${isSelected ? 'ring-2 ring-blue-400/60' : ''}`}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Image with variant slider */}
                      <div className="relative w-full h-48 md:h-56 bg-gray-100 rounded-none flex items-center justify-center overflow-hidden mb-4">
                        {getDisplayImage(item) ? (
                          <img src={getDisplayImage(item)!} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200">
                            <span className="text-gray-400 text-sm">No Image Available</span>
                          </div>
                        )}
                        {/* Top-right time/date overlay to match doctors services style */}
                        {(() => {
                          const info = getDisplayTimeInfo(item);
                          return info ? (
                            <div className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-md text-[11px] bg-black/60 text-white shadow-md backdrop-blur-sm flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden className="shrink-0">
                                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.25" />
                                <path d="M12 7v5l4 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className="leading-none">{info}</span>
                            </div>
                          ) : null;
                        })()}
                        
                        {/* Top-left recommended overlay */}
                        {item.recommended && (
                          <div className="absolute top-1.5 left-1.5 z-10">
                            <div className="px-3 py-1.5 text-[11px] shadow-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border border-amber-400/60 rounded-md flex items-center gap-1.5 backdrop-blur-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className="text-amber-900">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              <div className="flex flex-col leading-tight">
                                <span className="font-black text-amber-900 text-[11px] tracking-wider font-extrabold">RECOMMENDED</span>
                                <span className="font-bold text-amber-800 text-[10px]">by SehatKor</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Availability badge moved to action row below */}
                        {getSlides(item).length > 1 && (
                          <>
                            <button
                              type="button"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-7 h-7 flex items-center justify-center"
                              onClick={(e) => { e.stopPropagation(); prevVariant(item.id); }}
                              aria-label="Previous variant"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-7 h-7 flex items-center justify-center"
                              onClick={(e) => { e.stopPropagation(); nextVariant(item.id); }}
                              aria-label="Next variant"
                            >
                              ›
                            </button>
                           
                          </>
                        )}
                      </div>

                      {/* Title and Provider */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {item.name}
                            {item._providerVerified ? (
                              <Badge className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 border-green-100">Verified</Badge>
                            ) : (
                              <Badge className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 border-red-100">Unverified</Badge>
                            )}
                            {isSelected && (
                              <Badge className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border-blue-100">Selected</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{item.provider}</p>
                          {/* Department Display for Hospital Services */}
                          {item._providerType === 'clinic' && item.department && (
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
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H6v-2h4V7h4v4h4v2h-4v4z"/>
                              </svg>
                              <span className="truncate">{item.department}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {getDisplayPrice(item) === 0 ? 'Free' : `PKR ${getDisplayPrice(item).toLocaleString()}`}
                          </div>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-rose-50 text-rose-600 border-rose-100">
                            {(item._providerType === 'pharmacy' && item.pharmacyCategory)
                              ? item.pharmacyCategory
                              : (item._providerType === 'laboratory' && item.labCategory)
                                ? item.labCategory
                                : (item._providerType === 'doctor' && item.doctorCategory)
                                  ? item.doctorCategory
                                  : (item._providerType === 'clinic' && item.clinicCategory)
                                    ? item.clinicCategory
                                    : item.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                      {/* Hospital/Clinic Name */}
                      {(() => {
                        const activeSlide = getActiveSlide(item);
                        const hospitalClinicName = activeSlide?.hospitalClinicName || item.hospitalClinicName;
                        return hospitalClinicName ? (
                          <div className="text-sm text-blue-600 font-medium mb-2 flex items-center gap-2">
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
                            <span className="truncate">{hospitalClinicName}</span>
                          </div>
                        ) : null;
                      })()}

                      {/* Badges and actions – unified 3-row layout */}
                      <div className="space-y-3 mb-4 text-sm">
                        {/* Row 1: Rating ↔ Location */}
                        <div className="flex justify-between items-center min-h-[24px]">
                          <div className="flex-shrink-0">
                            <RatingBadge rating={item.rating} totalRatings={item.totalRatings} size="sm" ratingBadge={item.ratingBadge as any} />
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                            <MapPin className="w-4 h-4" />
                            <span>{getDisplayLocation(item)}</span>
                          </div>
                        </div>

                        {/* Row 2: Service Type */}
                        <div className="flex justify-start items-center min-h-[24px]">
                          <div className="flex-shrink-0">
                            {(item._providerType === 'pharmacy' || item._providerType === 'laboratory' || item._providerType === 'clinic' || item._providerType === 'doctor') && item.serviceType ? (
                              <ServiceTypeBadge serviceType={item.serviceType} size="sm" />
                            ) : (
                              <div className="h-6"></div>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Home Delivery ↔ Availability */}
                        <div className="flex justify-between items-center min-h-[24px]">
                          <div className="flex-shrink-0">
                            {(item._providerType === 'pharmacy' || item._providerType === 'laboratory' || item._providerType === 'clinic' || item._providerType === 'doctor') && item.homeDelivery && (
                              <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[12px]">
                                <span className="leading-none">🏠</span>
                                <span className="leading-none">Home Delivery</span>
                              </span>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {(() => {
                              // Variant-aware availability
                              const activeSlide = getActiveSlide(item);
                              const availability = activeSlide?.availability || item.availability;
                              if (!availability) return <div className="h-6"></div>;
                              return <AvailabilityBadge availability={availability} size="sm" />;
                            })()}
                          </div>
                        </div>

                        {/* Row 4: Diseases ↔ Rate Button + WhatsApp */}
                        <div className="flex justify-between items-center min-h-[24px]">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {Array.isArray((item as any).diseases) && (item as any).diseases.length > 0 && (
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
                                          setExpandedDiseases(expandedDiseases === item.id ? null : item.id);
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
                                          {((item as any).diseases as string[]).map((d, i) => (
                                            <span key={`${d}-${i}`} className="flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                              {d}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {/* Mobile click-to-show diseases list as tooltip/popover */}
                                {expandedDiseases === item.id && (
                                  <div className="absolute sm:hidden left-0 top-[110%] z-50 w-56 p-2 bg-white border border-emerald-200 rounded-md shadow-lg">
                                    <div className="text-xs text-emerald-800">
                                      <div className="mb-1 font-medium">Diseases</div>
                                      <div className="flex flex-col gap-1">
                                        {((item as any).diseases as string[]).map((d, i) => (
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
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {user && (user.role === 'patient' || mode === 'patient') && (user?.id !== item._providerId) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRateService(item); }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-white hover:bg-yellow-50 text-yellow-600 border-yellow-200 shadow-sm"
                                title="Rate this service"
                              >
                                <Star className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs font-medium">Rate</span>
                              </button>
                            )}
                            {item.providerPhone && (
                              <ServiceWhatsAppButton phoneNumber={item.providerPhone} serviceName={item.name} providerName={item.provider} providerId={item._providerId} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-auto space-y-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 h-9 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center gap-1.5"
                            onClick={(e) => { e.stopPropagation(); handleBookNow(item); }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            Book
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-9 text-xs border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-full flex items-center justify-center gap-1.5"
                            onClick={(e) => { e.stopPropagation(); setShowLocationMap(item.id); }}
                          >
                            <MapPin className="w-4 h-4" />
                            Location
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 h-9 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentVariantIndex = activeIdxById[item.id] ?? 0;
                              navigate(`/service/${item.id}`, {
                                state: {
                                  from: window.location.pathname + window.location.search,
                                  fromCompare: true,
                                  initialVariantIndex: currentVariantIndex,
                                  service: {
                                    id: item.id,
                                    name: item.name,
                                    description: item.description,
                                    price: item.price,
                                    rating: item.rating,
                                    provider: item.provider,
                                    image: item.image,
                                    type: item.type,
                                    providerType: item._providerType,
                                    _providerVerified: item._providerVerified,
                                    isReal: true,
                                    ratingBadge: item.ratingBadge ?? null,
                                    location: item.city ?? item.location,
                                    address: item.detailAddress ?? undefined,
                                    hospitalClinicName: item.hospitalClinicName ?? undefined,
                                    providerPhone: item.providerPhone ?? undefined,
                                    googleMapLink: item.googleMapLink ?? undefined,
                                    availability: item.availability ?? undefined,
                                    serviceType: item.serviceType,
                                    homeDelivery: item.homeDelivery,
                                    timeLabel: item.timeLabel || null,
                                    startTime: item.startTime || null,
                                    endTime: item.endTime || null,
                                    days: item.days || null,
                                    variants: item.variants || [],
                                    diseases: Array.isArray((item as any).diseases) ? (item as any).diseases : [],
                                    department: (item._providerType === 'clinic') ? (item.department || undefined) : undefined,
                                  }
                                }
                              });
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Loading state - show only during search */}
          {loading && (effectiveSelectedName || nameQuery) && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gray-100">
                  <CardContent className="p-4">
                    <Skeleton className="h-28 w-full rounded mb-3" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selected.length >= 2 && (
            <div className="mt-8">
              <Card className="bg-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Comparison
                  </CardTitle>
                  <CardDescription>Side-by-side comparison of your selected services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-4 text-left">Field</th>
                          {selected.map(s => (
                            <th key={s.id} className="p-4 text-left min-w-56">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="font-semibold line-clamp-1">{s.name}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">{s.provider}</div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => toggleSelect(s.id)}>Remove</Button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Price</td>
                          {selected.map(s => (
                            <td key={s.id} className={`p-4 font-semibold ${cheapest?.id === s.id ? 'text-primary' : ''}`}>{s.price === 0 ? "Free" : `PKR ${s.price.toLocaleString()}`}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Rating</td>
                          {selected.map(s => (
                            <td key={s.id} className={`p-4 ${bestRated?.id === s.id ? 'bg-yellow-50/60 rounded' : ''}`}>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                {s.rating}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Location</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{s.location}</span>
                                <UIButton
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 ml-2"
                                  onClick={() => {
                                    if (s.googleMapLink) {
                                      window.open(s.googleMapLink, '_blank', 'noopener,noreferrer');
                                    } else {
                                      setShowLocationMap(s.id);
                                    }
                                  }}>
                                  View Location
                                </UIButton>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Type</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <Badge variant="outline">{s.type}</Badge>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Schedule</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <div className="text-sm">
                                {getDisplayTimeInfo(s) || 'Not specified'}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Action</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <Button size="sm" className="w-full bg-primary/90 hover:bg-primary" onClick={() => {
                                const currentVariantIndex = activeIdxById[s.id] ?? 0;
                                console.log('🔍 CompareExplorer: Navigating to service detail:', s.id, 'with variant index:', currentVariantIndex);
                                console.log('🔍 CompareExplorer: Service data:', s);
                                console.log('🔍 CompareExplorer: Main service schedule fields:');
                                console.log('  - timeLabel:', s.timeLabel);
                                console.log('  - startTime:', s.startTime);
                                console.log('  - endTime:', s.endTime);
                                console.log('  - days:', s.days);
                                console.log('  - variants:', s.variants);
                                
                                // Check if main service has schedule data, if not get from first variant
                                let mainTimeLabel = s.timeLabel;
                                let mainStartTime = s.startTime;
                                let mainEndTime = s.endTime;
                                let mainDays = s.days;
                                
                                if (!mainTimeLabel && !mainStartTime && !mainEndTime && !mainDays && s.variants && s.variants.length > 0) {
                                  console.log('🔍 CompareExplorer: Main service has no schedule, checking variants...');
                                  const firstVariant = s.variants[0];
                                  console.log('🔍 CompareExplorer: First variant schedule:', firstVariant);
                                  
                                  // If we're on main slide (index 0), use main service schedule if available
                                  // If main service has no schedule, keep it null to show proper fallback in ServiceDetailPage
                                  if (currentVariantIndex === 0) {
                                    console.log('🔍 CompareExplorer: On main slide, keeping main schedule as null for proper fallback');
                                  } else {
                                    // If we're on variant slide, we'll use variant schedule anyway
                                    console.log('🔍 CompareExplorer: On variant slide, will use variant schedule');
                                  }
                                }
                                navigate(`/service/${s.id}`, {
                                state: {
                                  from: window.location.pathname + window.location.search,
                                  fromCompare: true,
                                  initialVariantIndex: currentVariantIndex,
                                  service: {
                                    id: s.id,
                                    name: s.name,
                                    description: s.description,
                                    price: s.price,
                                    rating: s.rating,
                                    provider: s.provider,
                                    image: s.image,
                                    type: s.type,
                                    providerType: s._providerType,
                                    isReal: true,
                                    ratingBadge: s.ratingBadge ?? null,
                                    location: s.city ?? s.location,
                                    address: s.detailAddress ?? undefined,
                                    providerPhone: s.providerPhone ?? undefined,
                                    googleMapLink: s.googleMapLink ?? undefined,
                                    availability: s.availability ?? undefined,
                                    serviceType: s.serviceType,
                                    homeDelivery: s.homeDelivery,
                                    variants: s.variants || [],
                                    // Pass main service schedule fields
                                    timeLabel: s.timeLabel || null,
                                    startTime: s.startTime || null,
                                    endTime: s.endTime || null,
                                    days: s.days || null,
                                    // Pass department field to detail page for clinic/hospital services
                                    department: (s._providerType === 'clinic') ? (s.department || undefined) : undefined,
                                  }
                                }
                              });
                              }}>
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {bestRated && (
                      <div className="p-3 rounded border bg-green-50/80">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <div className="font-semibold">Best Overall (Rating)</div>
                        </div>
                        <div className="text-sm mt-1">{bestRated.name} — {bestRated.provider} ({bestRated.location})</div>
                      </div>
                    )}
                    {cheapest && (
                      <div className="p-3 rounded border bg-blue-50/80">
                        <div className="flex items-center gap-2 text-blue-700">
                          <CheckCircle className="w-4 h-4" />
                          <div className="font-semibold">Cheapest</div>
                        </div>
                        <div className="text-sm mt-1">{cheapest.name} — {cheapest.provider} ({cheapest.location})</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </div>
      {showLocationMap && currentMapService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowLocationMap(null)}
        >
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentMapService.name}</span>
                <Button variant="ghost" size="icon" onClick={() => setShowLocationMap(null)} className="h-7 w-7">
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
              <CardDescription>{currentMapService.provider}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold text-sm">City</h4>
                  <p className="text-muted-foreground">{currentMapService.city || 'Not available'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Address</h4>
                  <p className="text-muted-foreground">{currentMapService.detailAddress || 'Not available'}</p>
                </div>
              </div>
              {currentMapService.googleMapLink && (
                <Button
                  className="w-full mt-4"
                  onClick={() => window.open(currentMapService.googleMapLink, '_blank', 'noopener,noreferrer')}
                >
                  Open in Google Maps
                </Button>
              )}
            </CardContent>
          </Card>
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
          serviceType={(selectedRatingService as any)._providerType as 'doctor' | 'clinic' | 'laboratory' | 'pharmacy'}
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
          service={{
            id: selectedBookingService.id,
            name: selectedBookingService.name,
            provider: selectedBookingService.provider,
            price: Number(getDisplayPrice(selectedBookingService) ?? selectedBookingService.price ?? 0),
            image: getDisplayImage(selectedBookingService) || selectedBookingService.image,
            location: getDisplayLocation(selectedBookingService) || selectedBookingService.city || selectedBookingService.location,
            _providerId: selectedBookingService._providerId,
            _providerType: selectedBookingService._providerType,
            providerPhone: selectedBookingService.providerPhone,
            // For search page variant support
            variantIndex: activeIdxById[selectedBookingService.id] ?? 0,
            variantLabel: getDisplayTimeInfo(selectedBookingService),
            variantTimeRange: getDisplayTimeRange(selectedBookingService),
          }}
        />
      )}
    </div>
  );
};

export default CompareExplorer;



