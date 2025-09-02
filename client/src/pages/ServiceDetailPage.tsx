import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ServiceManager from "@/lib/serviceManager";
import { mockServices, Service as MockService } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowLeft, Home, Clock } from "lucide-react";
import RatingModal from "@/components/RatingModal";
import { useAuth } from "@/contexts/AuthContext";
import RatingBadge from "@/components/RatingBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import { toast } from "sonner";

type ServiceVariant = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  city?: string;
  detailAddress?: string;
  googleMapLink?: string;
  availability: 'Online' | 'Physical' | 'Online and Physical';
};

type Unified = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  location: string;
  provider: string;
  image?: string;
  type: "Treatment" | "Medicine" | "Test" | "Surgery";
  providerType?: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  isReal?: boolean;
  providerId?: string;
  totalRatings?: number;
  providerPhone?: string;
  googleMapLink?: string;
  coordinates?: { lat: number; lng: number } | null;
  address?: string | null;
  ratingBadge?: 'excellent' | 'good' | 'fair' | 'poor' | null;
  myBadge?: 'excellent' | 'good' | 'fair' | 'poor' | null;
  homeService?: boolean;
  availability?: 'Online' | 'Physical' | 'Online and Physical' | string;
  serviceType?: "Sehat Card" | "Private" | "Charity" | "Public" | "NPO" | "NGO";
  variants?: ServiceVariant[];
};

const ServiceDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const locationHook = useLocation();
  const navigate = useNavigate();
  const { user, mode } = useAuth();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [yourBadge, setYourBadge] = useState<Unified['myBadge']>((locationHook.state as any)?.service?.myBadge ?? null);
  const [freshCounts, setFreshCounts] = useState<{ excellent: number; good: number; fair: number } | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState((locationHook.state as any)?.activeVariantIndex ?? 0);
  const [resolvedServiceType, setResolvedServiceType] = useState<Unified['serviceType'] | undefined>(undefined);

  // Helper functions for variant display
  const getSlides = (service: Unified) => {
    const slides = [{
      name: service.name,
      price: service.price,
      image: service.image,
      location: service.location,
      availability: service.availability,
      description: service.description,
      googleMapLink: service.googleMapLink,
      address: service.address
    }];
    
    if (service.variants && Array.isArray(service.variants)) {
      service.variants.forEach(variant => {
        slides.push({
          name: variant.name || service.name,
          price: variant.price ?? service.price,
          image: variant.imageUrl || service.image,
          location: variant.city || service.location,
          availability: variant.availability,
          description: variant.description || service.description,
          googleMapLink: variant.googleMapLink || service.googleMapLink,
          address: variant.detailAddress || service.address
        });
      });
    }
    
    return slides;
  };

  const getActiveSlide = (service: Unified) => {
    const slides = getSlides(service);
    return slides[activeVariantIndex] || slides[0];
  };

  // Prefer service passed in via navigation state for full fidelity
  const rawStateService = (locationHook.state as any)?.service as any | undefined;
  const stateService: Unified | undefined = useMemo(() => {
    if (!rawStateService) return undefined;
    const normalized: Unified = {
      ...(rawStateService as any),
      // Normalize providerType coming from list pages where it may be `_providerType`
      providerType: (rawStateService.providerType ?? rawStateService._providerType) as Unified['providerType'],
      // Treat real services coming from API as real unless explicitly stated otherwise
      isReal: (rawStateService.isReal ?? true),
      // Normalize common optional fields
      providerId: rawStateService.providerId ?? rawStateService._providerId,
      address: rawStateService.detailAddress ?? rawStateService.address ?? null,
      availability: rawStateService.availability,
      serviceType: rawStateService.serviceType,
      variants: rawStateService.variants || [],
    };
    return normalized;
  }, [rawStateService]);
  const fromPath = (locationHook.state as any)?.from as string | undefined;

  const handleBack = () => {
    if (fromPath) {
      navigate(fromPath);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  const item: Unified | undefined = useMemo(() => {
    // Always prefer service from navigation state if available
    if (stateService && stateService.id === id) {
      console.log('Using service from navigation state:', stateService);
      console.log('Debug serviceType/providerType from state:', {
        providerType: (stateService as any)?.providerType ?? (stateService as any)?._providerType,
        serviceType: (stateService as any)?.serviceType,
      });
      return stateService;
    }
    
    console.log('Service not found in navigation state, falling back to ServiceManager');
    const source = (ServiceManager as any).getAllServicesWithVariants
      ? (ServiceManager as any).getAllServicesWithVariants()
      : ServiceManager.getAllServices();
    const realMapped = source.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: Number(s.price ?? 0),
      rating: s?.averageRating ?? s?.rating ?? 0,
      location: s?.city ?? s?.location ?? "Karachi",
      provider: s.providerName,
      image: s.image,
      type: s.providerType === "doctor" ? "Treatment" : s.providerType === "pharmacy" ? "Medicine" : s.providerType === "laboratory" ? "Test" : s.category === "Surgery" ? "Surgery" : "Treatment",
      providerType: s.providerType as Unified['providerType'],
      isReal: true,
      providerId: (s as any).providerId,
      totalRatings: (s as any).totalRatings ?? 0,
      providerPhone: (s as any).providerPhone,
      googleMapLink: (s as any).googleMapLink,
      coordinates: (s as any).coordinates ?? null,
      address: (s as any).detailAddress ?? null,
      ratingBadge: (s as any).ratingBadge ?? null,
      myBadge: null,
      homeService: s.providerType === 'doctor',
      availability: (s as any).availability,
      serviceType: (s as any).serviceType,
      variants: (s as any).variants || [],
    } as Unified));
    const mockMapped = mockServices.map((m: MockService) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      price: m.price,
      rating: m.rating,
      location: m.location,
      provider: m.provider,
      image: m.image,
      type: m.type,
      isReal: false,
      homeService: m.homeService,
      variants: [],
    }));
    const combined = [...realMapped, ...mockMapped];
    const foundItem = combined.find(x => x.id === id);
    console.log('Found item from ServiceManager:', foundItem);
    if (foundItem) {
      console.log('Debug serviceType/providerType from fallback:', {
        providerType: (foundItem as any)?.providerType,
        serviceType: (foundItem as any)?.serviceType,
      });
    }
    return foundItem;
  }, [id, stateService]);

  // Hydrate user's own badge for this item from localStorage on mount/item change
  useEffect(() => {
    if (!item?.isReal || !item?.providerType) return;
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anon';
      const key = `myRating:${uid}:${item.providerType}:${item.id}`;
      const my = localStorage.getItem(key);
      if (my) setYourBadge(my as any);
    } catch {}
  }, [item?.id, item?.providerType, user?.id]);

  // Listen for immediate badge updates from RatingModal (optimistic UI)
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent'|'good'|'fair'|'poor' } | undefined;
      if (!detail) return;
      if (detail.serviceId === item?.id && detail.serviceType === item?.providerType) {
        setYourBadge(detail.yourBadge);
      }
    };
    window.addEventListener('my_rating_updated', handler as EventListener);
    return () => window.removeEventListener('my_rating_updated', handler as EventListener);
  }, [item?.id, item?.providerType]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!item?.isReal || !item?.providerType || !item?.id) return;
      // If counts already present from list payload, reuse
      if ((stateService as any)?.ratingCounts) {
        setFreshCounts((stateService as any).ratingCounts);
        return;
      }
      try {
        const svc = await ServiceManager.fetchServiceById(String(item.id), item.providerType);
        setFreshCounts(((svc as any).ratingCounts) ?? null);
        if (!item.serviceType && (svc as any)?.serviceType) {
          console.log('Hydrated missing serviceType from fetch:', (svc as any).serviceType);
          setResolvedServiceType((svc as any).serviceType as any);
        }
      } catch {}
    };
    fetchCounts();
  }, [item?.id, item?.providerType]);

  // Fallback: if serviceType is missing entirely (e.g., state lacked it), try to fetch by inferring type
  useEffect(() => {
    const hydrateServiceType = async () => {
      if (!item?.isReal || item?.serviceType) return;
      try {
        let inferredType = item?.providerType;
        if (!inferredType) {
          inferredType = item?.type === 'Medicine' ? 'pharmacy' : item?.type === 'Test' ? 'laboratory' : 'doctor';
        }
        if (!inferredType) return;
        const svc = await ServiceManager.fetchServiceById(String(item.id), inferredType as any);
        if ((svc as any)?.serviceType) {
          console.log('Hydrated missing serviceType via inferred type:', (svc as any).serviceType, inferredType);
          setResolvedServiceType((svc as any).serviceType as any);
        }
      } catch (e) {
        console.warn('Failed to hydrate missing serviceType', e);
      }
    };
    hydrateServiceType();
  }, [item?.id, item?.isReal, item?.serviceType, item?.providerType, item?.type]);

  const handleBookNow = (svc: Unified) => {
    if (user && user.role !== 'patient' && mode !== 'patient') {
      toast.error('Providers must switch to Patient Mode to book services.', {
        description: 'Click your profile icon and use the toggle to switch modes.',
      });
      return;
    }
    if (user && svc.providerId && (svc.providerId === (user as any).id)) {
      toast.error('You cannot book your own service.');
      return;
    }
    navigate('/payment', {
      state: {
        serviceId: svc.id,
        serviceName: svc.name,
        providerId: svc.providerId || svc.id,
        providerName: svc.provider,
        providerType: svc.providerType,
        price: Number(svc.price ?? 0),
        image: svc.image,
        location: svc.location,
        phone: svc.providerPhone,
      }
    });
  };

  if (!item) {
    console.log('No item found, navigation state:', locationHook.state);
    console.log('Service ID from URL:', id);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">Service not found.</div>
        </div>
      </div>
    );
  }

  const activeSlide = getActiveSlide(item);
  const slides = getSlides(item);
  const hasVariants = slides.length > 1;

  const canRate = item.isReal && user && (user.role === 'patient' || mode === 'patient') && (item.providerId !== (user as any)?.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-xl bg-muted overflow-hidden flex items-center justify-center relative">
                {activeSlide.image ? (
                  <img src={activeSlide.image} alt={activeSlide.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground">No Image</span>
                )}
                
                {/* Variant slider controls */}
                {hasVariants && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveVariantIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeVariantIndex === index
                            ? 'bg-white shadow-lg'
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Footer info under image */}
              <div className="mt-8 hidden md:block">
  <div className="flex items-center gap-2">
    <h2 className="text-3xl font-semibold text-gray-600 truncate" title={activeSlide.name}>
      {activeSlide.name}
    </h2>
    {item.isReal && (
      <Badge className="px-1.5 py-0.5 text-[10px] bg-green-50 text-green-600 border border-green-100">
        Verified
      </Badge>
    )}
  </div>
  <div className="text-sm text-muted-foreground">
    {item.providerType === 'laboratory' ? 'Lab' :
      item.providerType === 'pharmacy' ? 'Pharmacy' :
      item.providerType === 'doctor' ? 'Doctor' :
      item.providerType === 'clinic' ? 'Clinic' :
      item.type}
  </div>
</div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2 min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl leading-tight break-words">{activeSlide.name}</CardTitle>
                {item.isReal ? (
                  <Badge className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 border-green-100">Verified</Badge>
                ) : (
                  <Badge className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 border-red-100">Not Verified</Badge>
                )}
              </div>
              <CardDescription className="break-words leading-snug text-sm sm:text-base">{item.provider}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0 pb-4 sm:pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-5">
                <div className="space-y-2 min-w-0">
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                    <div className="text-primary font-bold text-xl">{activeSlide.price === 0 ? "Free" : `PKR ${Number(activeSlide.price || 0).toLocaleString()}`}</div>
                    <RatingBadge
                      rating={item.rating}
                      ratingBadge={item.ratingBadge as any}
                      totalRatings={item.totalRatings}
                      yourBadge={(yourBadge ?? item.myBadge) || null}
                      size="sm"
                      layout="column-compact"
                    />
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {activeSlide.location}
                    </div>
                    <Badge variant="outline">{item.type}</Badge>
                    {activeSlide.availability && (
                      <AvailabilityBadge availability={activeSlide.availability} size="sm" />
                    )}
                    {(item.serviceType ?? resolvedServiceType) && (
                      <ServiceTypeBadge serviceType={item.serviceType ?? resolvedServiceType} size="sm" />
                    )}
                    {freshCounts && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Excellent: {freshCounts.excellent}</span>
                        <span>Good: {freshCounts.good}</span>
                        <span>Fair: {freshCounts.fair}</span>
                      </div>
                    )}
                    {item.homeService && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Home className="w-4 h-4" />
                        <span>Home service</span>
                      </div>
                    )}
                  </div>
                  {activeSlide.address && (
                    <div className="text-sm text-muted-foreground">{activeSlide.address}</div>
                  )}
                  {activeSlide.googleMapLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full sm:w-auto bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800"
                      onClick={() => window.open(activeSlide.googleMapLink!, '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-1" /> Open in Google Maps
                    </Button>
                  )}
                  {item.providerPhone && (
                    <div className="pt-1">
                      <ServiceWhatsAppButton
                        phoneNumber={item.providerPhone}
                        serviceName={item.name}
                        providerName={item.provider}
                        providerId={item.providerId}
                      />
                    </div>
                  )}
                </div>
                <div className="flex w-full md:w-auto gap-2">
                  <Button
                    className="flex-1 min-w-[100px] bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-300/30 hover:shadow-blue-400/40 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-blue-400 md:flex-none"
                    onClick={() => handleBookNow(item)}
                  >
                    <Clock className="w-4 h-4 mr-1" /> Book Now
                  </Button>
                  {canRate && (
                    <Button
                      variant="outline"
                      className="flex-1 min-w-[100px] md:flex-none"
                      onClick={() => setIsRatingModalOpen(true)}
                    >
                      Rate
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-3 sm:mt-4 text-muted-foreground leading-relaxed break-words">{activeSlide.description}</p>
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-sm text-muted-foreground">Best Price Nearby</div>
                    <div className="text-lg font-semibold mt-1">PKR {Math.max(0, Math.round((Number(activeSlide.price || 0)) * 0.85)).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-sm text-muted-foreground">Top Rated Alternative</div>
                    <div className="text-lg font-semibold mt-1">4.9 ★</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rating Modal */}
      {item.isReal && item.providerType && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          serviceId={item.id}
          serviceType={item.providerType}
          serviceName={item.name}
        />
      )}
    </div>
  );
};

export default ServiceDetailPage;


