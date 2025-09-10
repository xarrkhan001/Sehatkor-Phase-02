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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
  homeDelivery?: boolean;
  availability?: 'Online' | 'Physical' | 'Online and Physical' | string;
  serviceType?: "Sehat Card" | "Private" | "Charity" | "Public" | "NPO" | "NGO";
  // Real pharmacy category (e.g., Tablets, Capsules) when providerType is pharmacy
  pharmacyCategory?: string;
  // Real doctor category (e.g., Consultation, Therapy) when providerType is doctor
  doctorCategory?: string;
  // Real clinic/hospital category (e.g., Emergency Care, Blood Bank) when providerType is clinic
  clinicCategory?: string;
  variants?: ServiceVariant[];
  diseases?: string[];
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
  const [hydratedDiseases, setHydratedDiseases] = useState<string[] | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(() => {
    // Initialize with variant index from navigation state if available
    const initialIndex = (locationHook.state as any)?.initialVariantIndex;
    const validIndex = typeof initialIndex === 'number' ? Math.max(0, Math.min(initialIndex, 1)) : 0;
    console.log('🔧 ServiceDetailPage: Initializing activeVariantIndex:', validIndex, 'from initialIndex:', initialIndex);
    return validIndex;
  });
  const [resolvedServiceType, setResolvedServiceType] = useState<Unified['serviceType'] | undefined>(undefined);
  const [resolvedPharmacyCategory, setResolvedPharmacyCategory] = useState<string | undefined>(undefined);
  const [resolvedLabCategory, setResolvedLabCategory] = useState<string | undefined>(undefined);
  const [resolvedDoctorCategory, setResolvedDoctorCategory] = useState<string | undefined>(undefined);
  const [resolvedClinicCategory, setResolvedClinicCategory] = useState<string | undefined>(undefined);

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
      address: service.address,
      hospitalClinicName: (service as any).hospitalClinicName,
      timeLabel: (service as any).timeLabel,
      startTime: (service as any).startTime,
      endTime: (service as any).endTime,
      days: (service as any).days
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
          hospitalClinicName: (variant as any).hospitalClinicName || (service as any).hospitalClinicName,
          address: variant.detailAddress || service.address,
          timeLabel: (variant as any).timeLabel,
          startTime: (variant as any).startTime,
          endTime: (variant as any).endTime,
          days: (variant as any).days
        });
      });
    }
    console.log('🧪 ServiceDetailPage.getSlides result:', slides.map((s, i) => ({ index: i, name: s.name, hospitalClinicName: (s as any).hospitalClinicName })));
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
      // Preserve pharmacy category if present in navigation state or derive from category field
      pharmacyCategory: rawStateService.pharmacyCategory ?? ((rawStateService.providerType ?? rawStateService._providerType) === 'pharmacy' ? (rawStateService.category || undefined) : undefined),
      // Preserve lab category if present in navigation state or derive from category field
      labCategory: (rawStateService.providerType ?? rawStateService._providerType) === 'laboratory' ? (rawStateService.labCategory || rawStateService.category || undefined) : undefined,
      // Preserve doctor category if present in navigation state or derive from category field
      doctorCategory: (rawStateService.providerType ?? rawStateService._providerType) === 'doctor' ? (rawStateService.doctorCategory || rawStateService.category || undefined) : undefined,
      // Preserve clinic category if present in navigation state or derive from category field
      clinicCategory: (rawStateService.providerType ?? rawStateService._providerType) === 'clinic' ? (rawStateService.clinicCategory || rawStateService.category || undefined) : undefined,
      variants: rawStateService.variants || [],
      // Ensure boolean coercion for homeDelivery in case it comes as string/undefined
      homeDelivery: typeof rawStateService.homeDelivery !== 'undefined' ? Boolean(rawStateService.homeDelivery) : undefined,
      // Preserve main service schedule fields from navigation state
      timeLabel: rawStateService.timeLabel || null,
      startTime: rawStateService.startTime || null,
      endTime: rawStateService.endTime || null,
      days: rawStateService.days || null,
      diseases: Array.isArray(rawStateService.diseases) ? rawStateService.diseases : [],
    };
    console.log('🧬 ServiceDetailPage: diseases from navigation state:', Array.isArray((rawStateService as any).diseases) ? (rawStateService as any).diseases : undefined);
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
      console.log('🔍 Navigation State Service Schedule Fields:');
      console.log('  - timeLabel:', (stateService as any)?.timeLabel);
      console.log('  - startTime:', (stateService as any)?.startTime);
      console.log('  - endTime:', (stateService as any)?.endTime);
      console.log('  - days:', (stateService as any)?.days);
      console.log('  - variants:', (stateService as any)?.variants);
      return stateService;
    }
    
    console.log('Service not found in navigation state, falling back to ServiceManager');
    const source = (ServiceManager as any).getAllServicesWithVariants
      ? (ServiceManager as any).getAllServicesWithVariants()
      : ServiceManager.getAllServices();
    const realMapped = source.map((s: any) => {
      console.log('🔍 ServiceDetailPage Backend Mapping for service:', s.id);
      console.log('  - Raw backend service data:', s);
      console.log('  - Main service schedule from backend:');
      console.log('    - timeLabel:', (s as any).timeLabel);
      console.log('    - startTime:', (s as any).startTime);
      console.log('    - endTime:', (s as any).endTime);
      console.log('    - days:', (s as any).days);
      console.log('  - hospitalClinicName (backend):', (s as any).hospitalClinicName);
      console.log('  - Variants from backend:', (s as any).variants);
      if (Array.isArray((s as any).variants)) {
        console.log('    - Variant hospitalClinicNames:', ((s as any).variants as any[]).map(v => v?.hospitalClinicName));
      }
      
      const mapped = {
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
        _providerVerified: Boolean((s as any)._providerVerified),
        providerId: (s as any).providerId,
        totalRatings: (s as any).totalRatings ?? 0,
        providerPhone: (s as any).providerPhone,
        googleMapLink: (s as any).googleMapLink,
        coordinates: (s as any).coordinates ?? null,
        address: (s as any).detailAddress ?? null,
        hospitalClinicName: (s as any).hospitalClinicName ?? null,
        ratingBadge: (s as any).ratingBadge ?? null,
        myBadge: null,
        homeService: s.providerType === 'doctor',
        homeDelivery: (s.providerType === 'pharmacy' || s.providerType === 'laboratory' || s.providerType === 'clinic' || s.providerType === 'doctor') ? Boolean((s as any).homeDelivery) : undefined,
        availability: (s as any).availability,
        serviceType: (s as any).serviceType,
        // Preserve real pharmacy category from backend response
        pharmacyCategory: s.providerType === 'pharmacy' ? ((s as any).category || undefined) : undefined,
        // Preserve real lab category from backend response
        labCategory: s.providerType === 'laboratory' ? ((s as any).category || undefined) : undefined,
        // Preserve real doctor category from backend response
        doctorCategory: s.providerType === 'doctor' ? ((s as any).category || undefined) : undefined,
        // Preserve real clinic category from backend response
        clinicCategory: s.providerType === 'clinic' ? ((s as any).category || undefined) : undefined,
        variants: (s as any).variants || [],
        diseases: Array.isArray((s as any).diseases) ? (s as any).diseases : [],
        // Include main service schedule fields from backend
        timeLabel: (s as any).timeLabel || null,
        startTime: (s as any).startTime || null,
        endTime: (s as any).endTime || null,
        days: (s as any).days || null,
      } as Unified;
      console.log('✅ ServiceDetailPage mapped service:', {
        id: mapped.id,
        name: mapped.name,
        hospitalClinicName: (mapped as any).hospitalClinicName,
        variantsHospitalClinicNames: Array.isArray((mapped as any).variants) ? ((mapped as any).variants as any[]).map(v => v?.hospitalClinicName) : null,
      });
      return mapped;
    });
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
        // Hydrate pharmacy category if missing on item
        if ((item as any)?.providerType === 'pharmacy') {
          const incomingCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration check (pharmacyCategory): fromFetch:', incomingCat, 'fromItem:', (item as any)?.pharmacyCategory);
          if (incomingCat && !(item as any)?.pharmacyCategory) {
            setResolvedPharmacyCategory(incomingCat);
          }
        }
        if ((item as any)?.providerType === 'laboratory') {
          const incomingLabCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration check (labCategory): fromFetch:', incomingLabCat, 'fromItem:', (item as any)?.labCategory);
          if (incomingLabCat && !(item as any)?.labCategory) {
            setResolvedLabCategory(incomingLabCat);
          }
        }
        if ((item as any)?.providerType === 'doctor') {
          const incomingDocCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration check (doctorCategory): fromFetch:', incomingDocCat, 'fromItem:', (item as any)?.doctorCategory);
          if (incomingDocCat && !(item as any)?.doctorCategory) {
            setResolvedDoctorCategory(incomingDocCat);
          }
        }
        if ((item as any)?.providerType === 'clinic') {
          const incomingClinicCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration check (clinicCategory): fromFetch:', incomingClinicCat, 'fromItem:', (item as any)?.clinicCategory);
          if (incomingClinicCat && !(item as any)?.clinicCategory) {
            setResolvedClinicCategory(incomingClinicCat);
          }
        }
        // Hydrate diseases if missing or empty
        const incomingDiseases = Array.isArray((svc as any)?.diseases) ? (svc as any).diseases : [];
        const current = Array.isArray((item as any)?.diseases) ? (item as any).diseases : [];
        console.log('🧬 Diseases hydration check:', { fromFetch: incomingDiseases, fromItem: current });
        if (incomingDiseases.length && !current.length) {
          setHydratedDiseases(incomingDiseases);
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
        // Also hydrate pharmacy category if applicable
        if ((inferredType as any) === 'pharmacy') {
          const incomingCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration (infer path) pharmacyCategory:', incomingCat);
          if (incomingCat && !(item as any)?.pharmacyCategory) {
            setResolvedPharmacyCategory(incomingCat);
          }
        }
        if ((inferredType as any) === 'laboratory') {
          const incomingLabCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration (infer path) labCategory:', incomingLabCat);
          if (incomingLabCat && !(item as any)?.labCategory) {
            setResolvedLabCategory(incomingLabCat);
          }
        }
        if ((inferredType as any) === 'doctor') {
          const incomingDocCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration (infer path) doctorCategory:', incomingDocCat);
          if (incomingDocCat && !(item as any)?.doctorCategory) {
            setResolvedDoctorCategory(incomingDocCat);
          }
        }
        if ((inferredType as any) === 'clinic') {
          const incomingClinicCat = (svc as any)?.category as string | undefined;
          console.log('🧪 Hydration (infer path) clinicCategory:', incomingClinicCat);
          if (incomingClinicCat && !(item as any)?.clinicCategory) {
            setResolvedClinicCategory(incomingClinicCat);
          }
        }
        // Also try diseases hydration in this path
        const incomingDiseases = Array.isArray((svc as any)?.diseases) ? (svc as any).diseases : [];
        const current = Array.isArray((item as any)?.diseases) ? (item as any).diseases : [];
        console.log('🧬 Diseases hydration (infer path):', { fromFetch: incomingDiseases, fromItem: current });
        if (incomingDiseases.length && !current.length) {
          setHydratedDiseases(incomingDiseases);
        }
      } catch (e) {
        console.warn('Failed to hydrate missing serviceType', e);
      }
    };
    hydrateServiceType();
  }, [item?.id, item?.isReal, item?.serviceType, item?.providerType, item?.type]);

  // Log final diseases list that will render
  useEffect(() => {
    const arr = (hydratedDiseases ?? ((item as any)?.diseases || [])) as string[];
    console.log('🧬 ServiceDetailPage: final diseases to render:', arr);
  }, [hydratedDiseases, item?.id]);

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

  // Inline Virus icon component for diseases tooltip
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
                
                {/* Schedule label overlay */}
                {(() => {
                  const formatTo12Hour = (time24?: string): string => {
                    if (!time24) return "";
                    const [hours, minutes] = time24.split(':');
                    const hour24 = parseInt(hours, 10);
                    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                    const ampm = hour24 >= 12 ? 'PM' : 'AM';
                    return `${hour12}:${minutes} ${ampm}`;
                  };

                  const getScheduleLabel = () => {
                    console.log('ServiceDetailPage Debug:', {
                      activeVariantIndex,
                      itemSchedule: {
                        timeLabel: (item as any).timeLabel,
                        startTime: (item as any).startTime,
                        endTime: (item as any).endTime,
                        days: (item as any).days
                      },
                      variants: (item as any).variants
                    });

                    if (activeVariantIndex === 0) {
                      // Main service schedule - use item directly (not activeSlide to avoid confusion)
                      const timeLabel = (item as any).timeLabel;
                      const startTime = (item as any).startTime;
                      const endTime = (item as any).endTime;
                      const days = (item as any).days;
                      
                      console.log('🔍 Main Service Schedule Debug:');
                      console.log('  - timeLabel:', timeLabel);
                      console.log('  - startTime:', startTime);
                      console.log('  - endTime:', endTime);
                      console.log('  - days:', days);
                      console.log('  - Full item object:', item);
                      
                      const range = startTime && endTime ? `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}` : "";
                      const baseLabel = timeLabel ? String(timeLabel) : "";
                      const label = baseLabel && range ? `${baseLabel} — ${range}` : (baseLabel || range);
                      const daysStr = days ? String(days) : "";
                      const parts = [label, daysStr].filter(Boolean);
                      let result = parts.length ? parts.join(" · ") : null;
                      
                      console.log('  - range:', range);
                      console.log('  - baseLabel:', baseLabel);
                      console.log('  - label:', label);
                      console.log('  - daysStr:', daysStr);
                      console.log('  - parts:', parts);
                      console.log('  - Final result:', result);
                      
                      // NEVER show variant schedule on main service slide - show null instead
                      if (!result && !timeLabel && !startTime && !endTime && !days) {
                        console.log('Main service has no schedule data - showing null instead of variant fallback');
                        result = null;
                      } else if (timeLabel || startTime || endTime || days) {
                        console.log('Main service has its own schedule data, not using fallback');
                      }
                      
                      return result;
                    } else {
                      // Variant schedule
                      const variant = (item as any).variants?.[activeVariantIndex - 1];
                      if (!variant) return null;
                      const range = variant.startTime && variant.endTime ? `${formatTo12Hour(variant.startTime)} - ${formatTo12Hour(variant.endTime)}` : "";
                      const baseLabel = variant.timeLabel ? String(variant.timeLabel) : "";
                      const label = baseLabel && range ? `${baseLabel} — ${range}` : (baseLabel || range);
                      const days = variant.days ? String(variant.days) : "";
                      const parts = [label, days].filter(Boolean);
                      const result = parts.length ? parts.join(" · ") : null;
                      console.log('Variant schedule result:', result);
                      return result;
                    }
                  };

                  const scheduleLabel = getScheduleLabel();
                  console.log('Final scheduleLabel:', scheduleLabel);
                  
                  // Only show overlay if there's a schedule
                  return scheduleLabel && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{scheduleLabel}</span>
                    </div>
                  );
                })()}

                {/* Variant slider controls */}
                {hasVariants && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          console.log('🔧 ServiceDetailPage: Setting activeVariantIndex to:', index);
                          setActiveVariantIndex(index);
                        }}
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
    {(item as any)._providerVerified ? (
      <Badge className="px-1.5 py-0.5 text-[10px] bg-green-50 text-green-600 border border-green-100">
        Verified
      </Badge>
    ) : (
      <Badge className="px-1.5 py-0.5 text-[10px] bg-red-50 text-red-600 border border-red-100">
        Unverified
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
                {(item as any)._providerVerified ? (
                  <Badge className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 border-green-100">Verified</Badge>
                ) : (
                  <Badge className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 border-red-100">Unverified</Badge>
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
                    {(() => {
                      // Prefer active slide; if empty on main slide, fallback to first variant that has a name
                      const variantsArr: any[] = Array.isArray((item as any)?.variants) ? (item as any).variants : [];
                      const firstVariantWithName = variantsArr.find(v => v?.hospitalClinicName);
                      const displayHospitalClinicName = (activeSlide as any).hospitalClinicName
                        || (item as any).hospitalClinicName
                        || (firstVariantWithName ? firstVariantWithName.hospitalClinicName : undefined);
                      return displayHospitalClinicName ? (
                        <div className="text-sm text-blue-600 font-medium mb-1 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            aria-hidden="true"
                            className="shrink-0"
                          >
                            <circle cx="12" cy="12" r="11" fill="#ef4444" />
                            <rect x="11" y="6" width="2" height="12" fill="#ffffff" rx="1" />
                            <rect x="6" y="11" width="12" height="2" fill="#ffffff" rx="1" />
                          </svg>
                          <span className="truncate">{displayHospitalClinicName}</span>
                        </div>
                      ) : null;
                    })()}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {activeSlide.location}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-600 border-rose-100"
                    >
                      {(item.providerType === 'pharmacy' && (item.pharmacyCategory || resolvedPharmacyCategory))
                        ? (item.pharmacyCategory || resolvedPharmacyCategory)
                        : (item.providerType === 'laboratory' && ((item as any).labCategory || resolvedLabCategory))
                          ? (((item as any).labCategory || resolvedLabCategory) as string)
                          : (item.providerType === 'doctor' && ((item as any).doctorCategory || resolvedDoctorCategory))
                            ? (((item as any).doctorCategory || resolvedDoctorCategory) as string)
                            : (item.providerType === 'clinic' && ((item as any).clinicCategory || resolvedClinicCategory))
                              ? (((item as any).clinicCategory || resolvedClinicCategory) as string)
                              : item.type}
                    </Badge>
                    {activeSlide.availability && (
                      <AvailabilityBadge availability={activeSlide.availability} size="sm" />
                    )}
                    {(item.serviceType ?? resolvedServiceType) && (
                      <ServiceTypeBadge serviceType={item.serviceType ?? resolvedServiceType} size="sm" />
                    )}
                    {/* Department badge for clinic services */}
                    {item.providerType === 'clinic' && (item as any).department && (
                      <Badge className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 text-[11px] px-2 py-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="12"
                          height="12"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="11" fill="#8b5cf6" />
                          <rect x="11" y="6" width="2" height="12" fill="#ffffff" rx="1" />
                          <rect x="6" y="11" width="12" height="2" fill="#ffffff" rx="1" />
                        </svg>
                        {(item as any).department}
                      </Badge>
                    )}
                    {(() => {
                      const list = (hydratedDiseases ?? ((item as any).diseases || [])) as string[];
                      return Array.isArray(list) && list.length > 0;
                    })() && (
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
                                {((hydratedDiseases ?? ((item as any).diseases || [])) as string[]).map((d, i) => (
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
                    {(item.homeDelivery === true) && ((item.providerType === 'pharmacy') || (item.providerType === 'laboratory') || (item.providerType === 'clinic') || (item.type === 'Medicine') || (item.type === 'Test') || (item.type === 'Treatment')) && (
                      <Badge className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                        <span className="leading-none">🏠</span>
                        <span className="leading-none">Home Delivery</span>
                      </Badge>
                    )}
                    {freshCounts && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Excellent: {freshCounts.excellent}</span>
                        <span>Good: {freshCounts.good}</span>
                        <span>Fair: {freshCounts.fair}</span>
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


