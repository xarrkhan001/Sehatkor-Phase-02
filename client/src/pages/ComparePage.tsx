import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowUpDown, Trash2, Minimize2, Maximize2, X } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import BookingOptionsModal from "@/components/BookingOptionsModal";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";

type SortKey = "price" | "rating" | "location";

const ComparePage = () => {
  const { items, remove, clear } = useCompare();
  const navigate = useNavigate();
  const { user, mode } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  // Tick to trigger rerender on provider profile updates
  const [profileTick, setProfileTick] = useState(0);
  // Cache latest provider names from live updates (keyed by providerId)
  const [latestProviderNames, setLatestProviderNames] = useState<Record<string, string>>({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<any>(null);

  // Variant slider state per item
  const [activeIdxById, setActiveIdxById] = useState<Record<string, number>>({});

  // Slides helpers (match Search/Explorer)
  const getSlides = (svc: any) => {
    const base = {
      imageUrl: (svc as any).image,
      price: (svc as any).price,
      city: (svc as any).city,
      detailAddress: (svc as any).detailAddress,
      googleMapLink: (svc as any).googleMapLink,
      timeLabel: (svc as any).timeLabel,
      startTime: (svc as any).startTime,
      endTime: (svc as any).endTime,
      days: (svc as any).days,
    };
    const variants = Array.isArray((svc as any).variants) ? (svc as any).variants : [];
    return [base, ...variants];
  };

  // Compute display provider: override if this is the logged-in user's own service,
  // otherwise return any latest name we have for that provider, falling back to item's provider
  const getDisplayProvider = (svc: any): string => {
    const providerId = (svc as any)._providerId;
    if (user?.id && providerId && String(user.id) === String(providerId)) {
      return user.name || (svc as any).provider;
    }
    if (providerId && latestProviderNames[providerId]) {
      return latestProviderNames[providerId] || (svc as any).provider;
    }
    return (svc as any).provider;
  };

  const handleViewDetails = (item: any) => {
    const slides = getSlides(item);
    const rawIdx = activeIdxById[item.id] ?? 0;
    const activeIdx = slides.length ? (((rawIdx % slides.length) + slides.length) % slides.length) : 0;
    const timeLabel = getDisplayTimeInfo(item);
    const timeRange = getDisplayTimeRange(item);
    navigate(`/service/${item.id}`, {
      state: {
        from: window.location.pathname + window.location.search,
        fromCompare: true,
        service: {
          id: item.id,
          name: item.name,
          description: (item as any).description,
          price: Number(getDisplayPrice(item) ?? (item as any).price ?? 0),
          rating: (item as any).rating ?? 0,
          provider: getDisplayProvider(item),
          image: getDisplayImage(item) || (item as any).image,
          type: (item as any).type,
          providerType: (item as any)._providerType,
          isReal: true,
          ratingBadge: (item as any).ratingBadge ?? null,
          location: getDisplayLocation(item) || (item as any).location,
          address: (item as any).detailAddress ?? undefined,
          providerPhone: (item as any).providerPhone ?? undefined,
          googleMapLink: getDisplayMapLink(item) ?? (item as any).googleMapLink ?? undefined,
          variantIndex: activeIdx,
          variantLabel: timeLabel ?? undefined,
          variantTimeRange: timeRange ?? undefined,
        },
      },
    });
  };
  const getActiveSlide = (svc: any) => {
    const slides = getSlides(svc);
    const raw = activeIdxById[svc.id] ?? 0;
    if (!slides.length) return undefined;
    const safe = ((raw % slides.length) + slides.length) % slides.length;
    return slides[safe];
  };
  const getDisplayImage = (svc: any) => getActiveSlide(svc)?.imageUrl || (svc as any).image;
  const getDisplayPrice = (svc: any) => {
    const p = getActiveSlide(svc)?.price;
    return p != null && !Number.isNaN(Number(p)) ? Number(p) : (svc as any).price;
  };
  const getDisplayLocation = (svc: any) => getActiveSlide(svc)?.city || (svc as any).city || (svc as any).location;
  const getDisplayAddress = (svc: any) => getActiveSlide(svc)?.detailAddress || (svc as any).detailAddress;
  const getDisplayMapLink = (svc: any) => getActiveSlide(svc)?.googleMapLink || (svc as any).googleMapLink;
  const getDisplayTimeInfo = (svc: any): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    const label = v.timeLabel || (v.startTime && v.endTime ? `${formatTime(v.startTime)} - ${formatTime(v.endTime)}` : "");
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  const getDisplayTimeRange = (svc: any): string | null => {
    const v: any = getActiveSlide(svc);
    if (!v) return null;
    const formatTime = (t?: string) => (t ? String(t) : "");
    if (v.startTime && v.endTime) return `${formatTime(v.startTime)} - ${formatTime(v.endTime)}`;
    return v.timeLabel ? String(v.timeLabel) : null;
  };
  const nextVariant = (id: string) => setActiveIdxById(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const prevVariant = (id: string) => setActiveIdxById(prev => ({ ...prev, [id]: (prev[id] ?? 0) - 1 }));

  // Auto-advance variants every 10 seconds for items with multiple slides
  useEffect(() => {
    const ids = items
      .filter(s => getSlides(s).length > 1)
      .map(s => s.id);
    if (ids.length === 0) return;
    const t = setInterval(() => {
      setActiveIdxById(prev => {
        const next = { ...prev } as Record<string, number>;
        ids.forEach(id => { next[id] = (next[id] ?? 0) + 1; });
        return next;
      });
    }, 10000);
    return () => clearInterval(t);
  }, [items]);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      if (sortKey === "location") {
        return (getDisplayLocation(a) || "").localeCompare(getDisplayLocation(b) || "");
      }
      const av = sortKey === 'price' ? getDisplayPrice(a) : (a as any)[sortKey] as number;
      const bv = sortKey === 'price' ? getDisplayPrice(b) : (b as any)[sortKey] as number;
      return av - bv;
    });
    return sortAsc ? copy : copy.reverse();
  }, [items, sortKey, sortAsc, activeIdxById]);

  // Default select first service for details if none selected
  useEffect(() => {
    if (!detailId && sorted.length > 0) {
      setDetailId(sorted[0].id);
    }
  }, [sorted, detailId]);

  const currentDetail = useMemo(() => {
    if (!detailId) return null;
    const svc = items.find(s => s.id === detailId);
    return svc || null;
  }, [detailId, items]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(prev => !prev);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
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

  const getMockAddress = (provider: string, name: string, location: string): string => {
    const street = Math.floor(Math.random() * 100) + 1;
    return `${provider}, ${street} ${location}, ${location}`;
  };

  const currentMapService = useMemo(() => {
    if (!showLocationMap) return null;
    const svc = items.find(s => s.id === showLocationMap);
    if (!svc) return null;
    const loc = getDisplayLocation(svc) || (svc as any).location || "Karachi";
    const provider = getDisplayProvider(svc) || "Provider";
    const coordinates = getCoordinatesForLocation(loc);
    const address = getDisplayAddress(svc) || getMockAddress(provider, (svc as any).name || "Service", loc);
    const googleMapLink = getDisplayMapLink(svc);
    return { ...svc, location: loc, provider, coordinates, address, googleMapLink } as any;
  }, [showLocationMap, items, activeIdxById, user?.id, user?.name, profileTick, latestProviderNames]);

  const handleBookNow = (item: any) => {
    if (user && user.role !== 'patient' && mode !== 'patient') {
      toast.error('Providers must switch to Patient Mode to book services.', {
        description: 'Click your profile icon and use the toggle to switch modes.',
      });
      return;
    }
    if (user && (item as any)._providerId && String(user.id) === String((item as any)._providerId)) {
      toast.error('You cannot book your own service.');
      return;
    }
    
    // Prepare service data with required fields
    const serviceWithProviderInfo = {
      ...item,
      provider: getDisplayProvider(item) || item.provider || 'Unknown Provider',
      _providerType: (item as any)._providerType || 'unknown',
      _providerId: (item as any)._providerId || item.id,
      providerPhone: (item as any).providerPhone
    };

    setSelectedBookingService(serviceWithProviderInfo);
    setIsBookingModalOpen(true);
  };

  // Listen for provider profile update events; store latest names and trigger re-render
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { providerId?: string; id?: string; name?: string } | undefined;
      if (!detail) return;
      const pid = detail.providerId || detail.id;
      if (!pid) return;
      // Save latest provider name if provided
      if (typeof detail.name === 'string' && detail.name.length > 0) {
        setLatestProviderNames(prev => ({ ...prev, [pid]: detail.name! }));
      }
      // Rerender when this tab's logged-in user id matches, or any compared item matches
      if ((user?.id && String(pid) === String(user.id)) || items.some(it => String((it as any)._providerId) === String(pid))) {
        setProfileTick(t => t + 1);
      }
    };
    window.addEventListener('provider_profile_updated', handler as EventListener);
    return () => window.removeEventListener('provider_profile_updated', handler as EventListener);
  }, [items, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50 bg-fixed">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle>Compare Services</CardTitle>
              <CardDescription>Select up to 4 services to compare side-by-side</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toggleSort("price")} className="gap-1">
                Price
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => toggleSort("rating")} className="gap-1">
                Rating
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => toggleSort("location")} className="gap-1">
                Location
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button variant="destructive" onClick={clear} className="gap-1">
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">No items selected for comparison.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left">Field</th>
                      {sorted.map(item => (
                        <th key={item.id} className="p-4 text-left min-w-56">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold leading-tight flex items-center gap-2">
                                <span>{item.name}</span>
                                {getSlides(item).length > 1 && (
                                  <div className="inline-flex items-center gap-1">
                                    <button className="px-1 py-0.5 rounded bg-gray-100" onClick={() => prevVariant(item.id)} aria-label="Prev">‹</button>
                                    <button className="px-1 py-0.5 rounded bg-gray-100" onClick={() => nextVariant(item.id)} aria-label="Next">›</button>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{getDisplayProvider(item)}</div>
                              {getDisplayTimeInfo(item) && (
                                <div className="text-[11px] text-muted-foreground mt-1">{getDisplayTimeInfo(item)}</div>
                              )}
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>Remove</Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Price</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4 font-semibold text-blue-600">
                          {getDisplayPrice(item) === 0 ? "Free" : (
                            <>
                              <span className="text-xs">PKR </span>
                              <span className="text-sm">{getDisplayPrice(item).toLocaleString()}</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Rating</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {item.rating}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Availability</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          {((item as any).availability) ? (
                            <Badge
                              variant="outline"
                              className={
                                `text-xs px-2 py-0.5 ` +
                                (((item as any).availability) === 'Online'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : ((item as any).availability) === 'Physical'
                                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200')
                              }
                            >
                              {(item as any).availability}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Service Type</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          {((item as any)._providerType === 'pharmacy' || (item as any)._providerType === 'laboratory' || (item as any)._providerType === 'clinic' || (item as any)._providerType === 'doctor') && (item as any).serviceType ? (
                            <ServiceTypeBadge serviceType={(item as any).serviceType} size="sm" />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Location</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {getDisplayLocation(item)}
                            <Button size="sm" variant="ghost" className="h-7 px-2 ml-1" onClick={() => setShowLocationMap(item.id)}>View Location</Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Type</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <Badge variant="outline">{item.type}</Badge>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Action</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <div className="flex flex-col gap-2">
                            <Button size="sm" className="w-full h-7 text-xs" onClick={() => handleBookNow(item)}>Book</Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full"
                              onClick={() => handleViewDetails(item)}
                            >
                              View Details
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {showLocationMap && currentMapService && (
        <div
          className={`fixed z-50 bg-background shadow-xl rounded-lg border transition-all duration-300
            ${isMapExpanded ?
              'w-[calc(100vw-2rem)] h-[80vh] top-4 left-4 right-4 bottom-auto md:w-[calc(100vw-4rem)] md:left-8 md:right-8 lg:w-[720px] lg:h-[80vh] lg:top-1/2 lg:left-1/2 lg:right-auto lg:bottom-auto lg:-translate-x-1/2 lg:-translate-y-1/2'
              :
              'w-[calc(100vw-2rem)] h-64 bottom-4 left-4 right-4 md:w-80 md:right-4 md:left-auto'
            }
          `}
        >
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 right-0 bg-background z-10 p-3 flex justify-between items-center border-b">
              <div className="max-w-[70%]">
                <h3 className="font-semibold truncate">{(currentMapService as any).name}</h3>
                <p className="text-sm text-muted-foreground truncate">{(currentMapService as any).address}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsMapExpanded(!isMapExpanded)} className="h-8 w-8">
                  {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setShowLocationMap(null); setIsMapExpanded(false); }} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="absolute top-12 bottom-0 left-0 right-0 bg-muted flex items-center justify-center">
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 bg-gray-200 relative">
                  <MapPin
                    className="w-12 h-12 text-red-500 absolute"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                </div>
                <div className="p-4 bg-white border-t">
                  <p className="font-medium">{(currentMapService as any).location}</p>
                  <p className="text-sm text-muted-foreground">{(currentMapService as any).address}</p>
                  <p className="text-xs mt-2">
                    Coordinates: {(currentMapService as any).coordinates.lat.toFixed(4)}, {(currentMapService as any).coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default ComparePage;


