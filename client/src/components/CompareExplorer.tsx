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
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import RatingModal from "@/components/RatingModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Unified = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  location: string; // Combined for display
  city?: string;
  detailAddress?: string;
  googleMapLink?: string;
  provider: string;
  image?: string;
  type: "Treatment" | "Medicine" | "Test" | "Surgery";
  createdAt?: string;
  updatedAt?: string;
  ratingBadge?: string | null;
  providerPhone?: string;
  _providerId?: string;
  _providerType?: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  totalRatings?: number;
  // base time fields (optional) in case backend sends them for base service
  timeLabel?: string;
  startTime?: string;
  endTime?: string;
  days?: string;
  // variants array (doctor services primarily)
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
  }>;
};

const CompareExplorer = () => {
  const navigate = useNavigate();
  const { user, mode } = useAuth();
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
        const unified: Unified[] = (res.services || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          rating: (s as any)?.averageRating || (s as any)?.rating || 0,
          location: [s.detailAddress, s.city].filter(Boolean).join(', ') || 'Location not provided',
          city: s.city,
          detailAddress: s.detailAddress,
          googleMapLink: s.googleMapLink,
          provider: s.providerName,
          image: (s as any)?.image,
          type: s.providerType === "doctor" ? "Treatment" : s.providerType === "pharmacy" ? "Medicine" : s.providerType === "laboratory" ? "Test" : (s as any)?.category === "Surgery" ? "Surgery" : "Treatment",
          createdAt: (s as any)?.createdAt,
          updatedAt: (s as any)?.updatedAt,
          ratingBadge: (s as any)?.ratingBadge || null,
          providerPhone: (s as any)?.providerPhone,
          _providerId: (s as any)?.providerId,
          _providerType: (s as any)?.providerType,
          totalRatings: (s as any)?.totalRatings || 0,
          timeLabel: (s as any)?.timeLabel,
          startTime: (s as any)?.startTime,
          endTime: (s as any)?.endTime,
          days: (s as any)?.days,
          variants: (s as any)?.variants || [],
        }));
        if (isMounted) setServices(unified);
      } catch (e) {
        console.error("Failed to fetch services for CompareExplorer", e);
        if (isMounted) setServices([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

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
  const limitedOfferings = useMemo(() => offerings.slice(0, 6), [offerings]);
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
  const getDisplayTimeInfo = (svc: Unified): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    const label = v.timeLabel || (v.startTime && v.endTime ? `${formatTime(v.startTime)} - ${formatTime(v.endTime)}` : "");
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  const getDisplayTimeRange = (svc: Unified): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    if (v.startTime && v.endTime) return `${formatTime(v.startTime)} - ${formatTime(v.endTime)}`;
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
    const slides = getSlides(service);
    const rawIdx = activeIdxById[service.id] ?? 0;
    const activeIdx = slides.length ? (((rawIdx % slides.length) + slides.length) % slides.length) : 0;
    const timeLabel = getDisplayTimeInfo(service);
    const timeRange = getDisplayTimeRange(service);
    navigate('/payment', {
      state: {
        serviceId: service.id,
        serviceName: service.name,
        providerId: service._providerId || service.id,
        providerName: service.provider,
        providerType: service._providerType,
        price: Number(getDisplayPrice(service) ?? service.price ?? 0),
        currency: 'PKR',
        image: getDisplayImage(service) || service.image,
        location: getDisplayLocation(service) || service.city || service.location,
        phone: service.providerPhone,
        variantIndex: activeIdx,
        variantLabel: timeLabel,
        variantTimeRange: timeRange,
      },
    });
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

  

  const cheapest = useMemo(() => (selected.length ? [...selected].sort((a, b) => a.price - b.price)[0] : undefined), [selected]);
  const bestRated = useMemo(() => (selected.length ? [...selected].sort((a, b) => b.rating - a.rating)[0] : undefined), [selected]);

  return (
    <section className="mt-12 bg-gray-200 py-8 mx-[calc(50%-50vw)]">
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent>
          {/* Centered Search Section */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-xl">
              <div className="space-y-3">
                <div className="relative">
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
                    className="pl-10 h-12 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-white focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30 shadow-sm focus:shadow-md transition-all placeholder:text-gray-400"
                  />
                  {isSuggestionsOpen && nameQuery && filteredNames.length > 0 && (
                    <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200/70 bg-white/90 backdrop-blur shadow-xl max-h-60 overflow-auto divide-y">
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
                <Select value={effectiveSelectedName} onValueChange={(v) => { setSelectedName(v); setNameQuery(v); }}>
                  <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-white focus:ring-2 focus:ring-primary/30 shadow-sm transition-colors">
                    <SelectValue placeholder="Select service name" />
                  </SelectTrigger>
                  <SelectContent>
                    {names.map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-600 text-center">{effectiveSelectedName ? `Showing ${offerings.length} providers` : "Start typing to search a service name, or pick from the list"}</div>
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
                    className={`shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl border border-gray-200 bg-gray-300 ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="p-5 cursor-pointer" onClick={() => toggleSelect(item.id)}>
                      {/* Image with variant slider */}
                      <div className="relative w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                        {getDisplayImage(item) ? (
                          <img src={getDisplayImage(item)!} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-sm">No Image</span>
                        )}
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
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-2 py-0.5 rounded text-[11px] text-gray-700">
                              {getDisplayTimeInfo(item) || 'Variant'}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Title and Provider */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {item.name}
                            {item._providerId && (
                              <Badge className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 border-green-100">Verified</Badge>
                            )}
                            {isSelected && (
                              <Badge className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border-blue-100">Selected</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{item.provider}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {getDisplayPrice(item) === 0 ? 'Free' : `PKR ${getDisplayPrice(item).toLocaleString()}`}
                          </div>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-rose-50 text-rose-600 border-rose-100">
                            {item.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                      {/* Rating Badge, Location, Home Service, WhatsApp */}
                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                        <RatingBadge rating={item.rating} totalRatings={item.totalRatings} size="sm" ratingBadge={item.ratingBadge as any} />
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{getDisplayLocation(item)}</span>
                        </div>
                        {item.providerPhone && (
                          <ServiceWhatsAppButton phoneNumber={item.providerPhone} serviceName={item.name} providerName={item.provider} providerId={item._providerId} />
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button className="flex-1 min-w-[100px]" onClick={(e) => { e.stopPropagation(); handleBookNow(item); }}>
                          <ArrowRight className="w-4 h-4 mr-1" /> Book Now
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); setShowLocationMap(item.id); }}
                          className="flex-1 min-w-[100px]"
                        >
                          <MapPin className="w-4 h-4 mr-1" /> Location
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/service/${item.id}` , {
                              state: {
                                from: window.location.pathname + window.location.search,
                                fromCompare: true,
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
                                  isReal: true,
                                  ratingBadge: item.ratingBadge ?? null,
                                  location: item.city ?? item.location,
                                  address: item.detailAddress ?? undefined,
                                  providerPhone: item.providerPhone ?? undefined,
                                  googleMapLink: item.googleMapLink ?? undefined,
                                }
                              }
                            });
                          }}
                          className="flex-1 min-w-[100px]"
                        >
                          View Details
                        </Button>
                        {user && (user.role === 'patient' || mode === 'patient') && (user?.id !== item._providerId) && (
                          <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleRateService(item); }} className="flex-1 min-w-[100px]">
                            <Star className="w-4 h-4 mr-1" /> Rate
                          </Button>
                        )}
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
                <Card key={i} className="bg-white/60">
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
              <Card className="bg-white/80 backdrop-blur">
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
                        <tr>
                          <td className="p-4 font-medium">Action</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <Button size="sm" className="w-full bg-primary/90 hover:bg-primary" onClick={() => navigate(`/service/${s.id}` , {
                                state: {
                                  from: window.location.pathname + window.location.search,
                                  fromCompare: true,
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
                                  }
                                }
                              })}>
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
        </CardContent>
      </Card>
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
    </section>
  );
};

export default CompareExplorer;



