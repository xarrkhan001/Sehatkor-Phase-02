import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ServiceManager from "@/lib/serviceManager";
import { mockServices, Service as MockService } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, ArrowLeft, Home, Clock, AlertTriangle, Calendar } from "lucide-react";
import BookingOptionsModal from "@/components/BookingOptionsModal";
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
  _providerVerified?: boolean;
  hospitalClinicName?: string | null;
  timeLabel?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  days?: string | null;
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
    const validIndex = typeof initialIndex === 'number' && Number.isFinite(initialIndex)
      ? Math.max(0, Math.floor(initialIndex))
      : 0;
    console.log('🔧 ServiceDetailPage: Initializing activeVariantIndex:', validIndex, 'from initialIndex:', initialIndex);
    return validIndex;
  });
  const [resolvedServiceType, setResolvedServiceType] = useState<Unified['serviceType'] | undefined>(undefined);
  const [resolvedPharmacyCategory, setResolvedPharmacyCategory] = useState<string | undefined>(undefined);
  const [resolvedLabCategory, setResolvedLabCategory] = useState<string | undefined>(undefined);
  const [resolvedDoctorCategory, setResolvedDoctorCategory] = useState<string | undefined>(undefined);
  const [resolvedClinicCategory, setResolvedClinicCategory] = useState<string | undefined>(undefined);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [expandedDiseases, setExpandedDiseases] = useState<string | null>(null);
  const [fetchedService, setFetchedService] = useState<Unified | null>(null);
  const [isLoadingService, setIsLoadingService] = useState(false);
  const [serviceNotFound, setServiceNotFound] = useState(false);

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

    // If we have a fetched service from server, use it
    if (fetchedService && fetchedService.id === id) {
      console.log('Using fetched service from server:', fetchedService);
      return fetchedService;
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
  }, [id, stateService, fetchedService]);

  // Fetch service from server if not found locally (e.g., direct link from WhatsApp)
  useEffect(() => {
    const fetchServiceFromServer = async () => {
      // Skip if we already have the service or already tried fetching
      if (item || isLoadingService || serviceNotFound || fetchedService) return;

      // Skip if we have state service
      if (stateService && stateService.id === id) return;

      console.log('🔍 Service not found locally, fetching from server for ID:', id);
      setIsLoadingService(true);
      setServiceNotFound(false);

      // Try all provider types to find the service
      const providerTypes: Array<'doctor' | 'clinic' | 'laboratory' | 'pharmacy'> = ['doctor', 'clinic', 'laboratory', 'pharmacy'];

      for (const type of providerTypes) {
        try {
          console.log(`🔍 Trying to fetch service as ${type}...`);
          const service = await ServiceManager.fetchServiceById(id, type);

          if (service) {
            console.log('✅ Service found on server:', service);

            // Map to Unified format
            const unified: Unified = {
              id: service.id,
              name: service.name,
              description: service.description,
              price: Number(service.price ?? 0),
              rating: (service as any)?.averageRating ?? (service as any)?.rating ?? 0,
              location: (service as any)?.city ?? (service as any)?.location ?? "Karachi",
              provider: service.providerName,
              image: service.image,
              type: service.providerType === "doctor" ? "Treatment" : service.providerType === "pharmacy" ? "Medicine" : service.providerType === "laboratory" ? "Test" : "Treatment",
              providerType: service.providerType,
              isReal: true,
              _providerVerified: Boolean((service as any)._providerVerified),
              providerId: (service as any).providerId,
              totalRatings: (service as any).totalRatings ?? 0,
              providerPhone: (service as any).providerPhone,
              googleMapLink: (service as any).googleMapLink,
              coordinates: (service as any).coordinates ?? null,
              address: (service as any).detailAddress ?? null,
              hospitalClinicName: (service as any).hospitalClinicName ?? null,
              ratingBadge: (service as any).ratingBadge ?? null,
              myBadge: null,
              homeService: service.providerType === 'doctor',
              homeDelivery: Boolean((service as any).homeDelivery),
              availability: (service as any).availability,
              serviceType: (service as any).serviceType,
              pharmacyCategory: service.providerType === 'pharmacy' ? ((service as any).category || undefined) : undefined,
              labCategory: service.providerType === 'laboratory' ? ((service as any).category || undefined) : undefined,
              doctorCategory: service.providerType === 'doctor' ? ((service as any).category || undefined) : undefined,
              clinicCategory: service.providerType === 'clinic' ? ((service as any).category || undefined) : undefined,
              variants: (service as any).variants || [],
              diseases: Array.isArray((service as any).diseases) ? (service as any).diseases : [],
              timeLabel: (service as any).timeLabel || null,
              startTime: (service as any).startTime || null,
              endTime: (service as any).endTime || null,
              days: (service as any).days || null,
            };

            setFetchedService(unified);
            setIsLoadingService(false);
            return; // Exit the loop once found
          }
        } catch (error) {
          console.log(`❌ Service not found as ${type}:`, error);
          // Continue to next type
        }
      }

      // If we reach here, service was not found in any type
      console.log('❌ Service not found in any provider type');
      setServiceNotFound(true);
      setIsLoadingService(false);
    };

    fetchServiceFromServer();
  }, [id, item, stateService, isLoadingService, serviceNotFound, fetchedService]);

  // Hydrate user's own badge for this item from localStorage on mount/item change
  useEffect(() => {
    if (!item?.isReal || !item?.providerType) return;
    try {
      const uid = (user as any)?.id || (user as any)?._id || 'anon';
      const key = `myRating:${uid}:${item.providerType}:${item.id}`;
      const my = localStorage.getItem(key);
      if (my) setYourBadge(my as any);
    } catch { }
  }, [item?.id, item?.providerType, user?.id]);

  // Listen for immediate badge updates from RatingModal (optimistic UI)
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent' | 'good' | 'fair' | 'poor' } | undefined;
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
      } catch { }
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
    if (user && svc.providerId && (svc.providerId === (user as any).id)) {
      toast.error('You cannot book your own service.');
      return;
    }
    // Always open the booking options modal first
    setIsBookingModalOpen(true);
  };

  // Enhanced Dynamic SEO Logic - Comprehensive tags for maximum search visibility
  const seoData = useMemo(() => {
    if (!item) return null;

    const city = item.location || "Pakistan";
    const priceDisplay = item.price === 0 ? "Free" : `PKR ${item.price}`;
    const providerName = item.provider || "Sehatkor Provider";
    const serviceName = item.name;
    const rating = item.rating || 0;
    const totalRatings = item.totalRatings || 0;
    const category = item.doctorCategory || item.pharmacyCategory || (item as any).labCategory || (item as any).clinicCategory || "";

    let title = "";
    let description = "";
    let keywords = "";
    let schemaType = "MedicalProcedure"; // Default
    let providerSchemaType = "Organization";

    // Logic based on Provider Type
    switch (item.providerType) {
      case "doctor":
        title = `${serviceName} by ${providerName} in ${city} | Best Doctor in ${city}`;
        description = `Book an appointment for ${serviceName} with ${providerName} in ${city}. Fee: ${priceDisplay}. ${rating > 0 ? `Rated ${rating.toFixed(1)}/5.` : ''} Verified PMDC doctor. Get instant confirmation on Sehatkor.`;
        keywords = `${serviceName}, ${serviceName} in ${city}, ${serviceName} by ${providerName}, ${providerName} ${city}, ${providerName} appointment, Best ${category || "Doctor"} in ${city}, Online Doctor Booking Pakistan, Sehatkor`;
        schemaType = "MedicalProcedure";
        providerSchemaType = "Physician";
        break;

      case "pharmacy":
        title = `${serviceName} by ${providerName} in ${city} | Online Medicine Delivery`;
        description = `Buy ${serviceName} online from ${providerName} in ${city}. Price: ${priceDisplay}. ${item.homeDelivery ? 'Home delivery available.' : ''} Check availability and order now on Sehatkor.`;
        keywords = `${serviceName}, ${serviceName} price in ${city}, ${serviceName} by ${providerName}, ${providerName} pharmacy ${city}, Medicine delivery ${city}, Buy ${serviceName} online, Online Pharmacy Pakistan, Sehatkor`;
        schemaType = "Product";
        providerSchemaType = "Organization";
        break;

      case "laboratory":
        title = `${serviceName} Test by ${providerName} in ${city} | Lab Tests at Home`;
        description = `Book ${serviceName} test at ${providerName} in ${city}. Test Price: ${priceDisplay}. ${item.homeDelivery ? 'Home sample collection available.' : ''} Get accurate results online via Sehatkor.`;
        keywords = `${serviceName} test, ${serviceName} price in ${city}, ${serviceName} by ${providerName}, ${providerName} lab ${city}, Lab test ${city}, Chughtai Lab ${city}, Dow Lab ${city}, Essa Lab ${city}, Sehatkor`;
        schemaType = "MedicalTest";
        providerSchemaType = "Organization";
        break;

      case "clinic":
      default:
        title = `${serviceName} by ${providerName} in ${city} | Best Clinic in ${city}`;
        description = `Book ${serviceName} at ${providerName} in ${city}. Charges: ${priceDisplay}. Verified medical services with instant online booking on Sehatkor.`;
        keywords = `${serviceName}, ${serviceName} charges in ${city}, ${serviceName} cost, ${serviceName} by ${providerName}, ${providerName} ${city}, Hospital in ${city}, Clinic appointment ${city}, Sehatkor`;
        schemaType = "MedicalProcedure";
        providerSchemaType = "Organization";
        break;
    }

    // Enhanced Keywords - Add more variations
    keywords += `, ${serviceName} near me, ${providerName} appointment, ${providerName} online booking, Best ${serviceName} ${city}, Affordable ${serviceName}, ${serviceName} Pakistan, Healthcare ${city}, Medical services Pakistan, Sehatkor Pakistan, صحت کار پاکستان`;

    // Comprehensive JSON-LD Schema with multiple entities
    const jsonLdGraph: any[] = [];

    // 1. Main Service/Procedure Schema
    const mainSchema: any = {
      "@type": schemaType,
      "name": serviceName,
      "description": description,
      "image": item.image ? (item.image.startsWith('http') ? item.image : `https://sehatkor.pk${item.image}`) : undefined,
    };

    // Add provider information
    const providerSchema: any = {
      "@type": providerSchemaType,
      "name": providerName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressCountry": "PK"
      }
    };

    // Add rating if available
    if (rating > 0 && totalRatings > 0) {
      providerSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": rating.toFixed(1),
        "reviewCount": totalRatings,
        "bestRating": "5",
        "worstRating": "1"
      };
    }

    // Add contact info if available
    if (item.providerPhone) {
      providerSchema.telephone = item.providerPhone;
    }

    // Add coordinates if available
    if (item.coordinates) {
      providerSchema.geo = {
        "@type": "GeoCoordinates",
        "latitude": item.coordinates.lat,
        "longitude": item.coordinates.lng
      };
    }

    mainSchema.provider = providerSchema;

    // Add offer details
    mainSchema.offers = {
      "@type": "Offer",
      "price": item.price,
      "priceCurrency": "PKR",
      "availability": item.availability === 'Online'
        ? "https://schema.org/OnlineOnly"
        : item.availability === 'Physical'
          ? "https://schema.org/InStock"
          : "https://schema.org/InStock",
      "url": `https://sehatkor.pk/service/${item.id}`,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
    };

    jsonLdGraph.push(mainSchema);

    // 2. Breadcrumb Schema
    const breadcrumbSchema = {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://sehatkor.pk"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": item.providerType === 'doctor' ? 'Doctors' :
            item.providerType === 'pharmacy' ? 'Pharmacies' :
              item.providerType === 'laboratory' ? 'Labs' : 'Services',
          "item": `https://sehatkor.pk/${item.providerType === 'doctor' ? 'doctors' :
            item.providerType === 'pharmacy' ? 'pharmacies' :
              item.providerType === 'laboratory' ? 'labs' : 'services'}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": serviceName,
          "item": `https://sehatkor.pk/service/${item.id}`
        }
      ]
    };
    jsonLdGraph.push(breadcrumbSchema);

    // 3. FAQ Logic (Reusable for Schema and UI)
    const faqList: Array<{ question: string; answer: string }> = [];

    if (serviceName) {
      faqList.push({
        question: `What is the ${item.providerType === 'doctor' ? 'consultation fee' : 'price'} for ${serviceName}?`,
        answer: `The ${item.providerType === 'doctor' ? 'consultation fee' : 'price'} for ${serviceName} is ${priceDisplay}.`
      });
    }

    if (serviceName) {
      faqList.push({
        question: `Is ${item.homeDelivery ? 'home delivery' : 'online booking'} available for ${serviceName}?`,
        answer: item.homeDelivery
          ? `Yes, home delivery is available for ${serviceName} in ${city}.`
          : item.availability === 'Online'
            ? `Yes, ${serviceName} is available online.`
            : `${serviceName} is available at ${providerName} in ${city}. You can book online through Sehatkor.`
      });
    }

    if (serviceName && providerName) {
      faqList.push({
        question: `How can I book ${serviceName} at ${providerName}?`,
        answer: `You can book ${serviceName} at ${providerName} online through Sehatkor. Simply click the "Book Now" button on this page for instant booking confirmation.`
      });
    }

    if (providerName && (city || item.address)) {
      faqList.push({
        question: `What is the location of ${providerName}?`,
        answer: `${providerName} is located in ${city}, Pakistan.${item.address ? ` Address: ${item.address}` : ''}`
      });
    }

    // Generate FAQ Schema from faqList
    if (faqList.length > 0) {
      const faqSchema = {
        "@type": "FAQPage",
        "mainEntity": faqList.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      };
      jsonLdGraph.push(faqSchema);
    }

    // 4. Review Schema - Add individual reviews if available
    if (rating > 0 && totalRatings > 0 && freshCounts) {
      // Create sample reviews based on rating distribution
      const reviews: any[] = [];

      // Add excellent reviews
      for (let i = 0; i < Math.min(freshCounts.excellent || 0, 3); i++) {
        reviews.push({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Verified Patient"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5",
            "worstRating": "1"
          },
          "reviewBody": `Excellent ${item.providerType === 'doctor' ? 'doctor' : 'service'}. Highly recommended!`
        });
      }

      // Add good reviews
      for (let i = 0; i < Math.min(freshCounts.good || 0, 2); i++) {
        reviews.push({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Verified Patient"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "4",
            "bestRating": "5",
            "worstRating": "1"
          },
          "reviewBody": `Good experience with ${serviceName}.`
        });
      }

      // Add reviews to provider schema
      if (reviews.length > 0) {
        providerSchema.review = reviews;
      }
    }

    // 5. Organization/Website Schema
    const organizationSchema = {
      "@type": "Organization",
      "name": "Sehatkor",
      "url": "https://sehatkor.pk",
      "logo": "https://sehatkor.pk/logo.png",
      "sameAs": [
        "https://www.facebook.com/sehatkor",
        "https://twitter.com/sehatkor"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": ["English", "Urdu"]
      }
    };
    jsonLdGraph.push(organizationSchema);

    // Final JSON-LD with @graph
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": jsonLdGraph
    };

    // Additional meta tags
    const additionalMeta = {
      author: providerName,
      publisher: "Sehatkor",
      "article:author": providerName,
      "geo.position": item.coordinates ? `${item.coordinates.lat};${item.coordinates.lng}` : undefined,
      "geo.placename": city,
      "geo.region": "PK"
    };

    // Canonical URL for direct indexing
    const canonical = `https://sehatkor.pk/service/${item.id}`;

    return { title, description, keywords, jsonLd, image: item.image, additionalMeta, faqList, canonical };
  }, [item]);

  if (!item) {
    console.log('No item found, navigation state:', locationHook.state);
    console.log('Service ID from URL:', id);

    // Show loading state while fetching
    if (isLoadingService) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading service...</p>
            </div>
          </div>
        </div>
      );
    }

    // Show not found only after we've tried fetching
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-xl mb-4">Service not found.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
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
    <div className="min-h-screen bg-gray-50/30">
      {/* Enhanced Dynamic SEO Component */}
      {seoData && (
        <SEO
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          image={seoData.image}
          jsonLd={seoData.jsonLd}
          additionalMeta={seoData.additionalMeta}
          canonical={seoData.canonical}
          type="article"
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-24 md:pb-8">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="md:col-span-1 border border-purple-200/60 shadow-md bg-gradient-to-br from-rose-100/80 via-purple-100/40 to-sky-100/60 h-full">
            <CardContent className="p-3 sm:p-4">
              <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-xl bg-white/60 overflow-hidden flex items-center justify-center relative border border-white/50 shadow-sm">
                {activeSlide.image ? (
                  <img src={activeSlide.image} alt={activeSlide.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground">No Image</span>
                )}

                {/* Schedule overlays: days (top-left) and time (bottom-left) */}
                {(() => {
                  const formatTo12Hour = (time24?: string): string => {
                    if (!time24) return "";
                    const [hours, minutes] = time24.split(':');
                    const hour24 = parseInt(hours, 10);
                    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                    const ampm = hour24 >= 12 ? 'PM' : 'AM';
                    return `${hour12}:${minutes} ${ampm}`;
                  };

                  const isMain = activeVariantIndex === -1;
                  const itemAny = item as any;
                  // Handle schedule display logic same as before...
                  const sched = isMain ? itemAny.schedule : (slides[activeVariantIndex] as any)?.schedule;
                  const days = sched?.days || [];
                  const timeLabel = sched?.timeLabel;
                  const startTime = sched?.startTime;
                  const endTime = sched?.endTime;

                  const daysText = Array.isArray(days) && days.length > 0 ? days.join(',') : "";
                  const range = (startTime && endTime) ? `${formatTo12Hour(String(startTime))} - ${formatTo12Hour(String(endTime))}` : "";

                  const timeText = (() => {
                    // Logic to derive period if missing
                    const derivePeriod = (t?: string) => {
                      if (!t) return "";
                      const h = parseInt(String(t).split(":")[0] || "0", 10);
                      if (h >= 20 || h < 4) return "Night";      // 8 PM - 3:59 AM
                      if (h >= 16) return "Evening";             // 4 PM - 7:59 PM
                      if (h >= 12) return "Afternoon";           // 12 PM - 3:59 PM
                      return "Morning";                           // 4 AM - 11:59 AM
                    };
                    const derived = startTime ? derivePeriod(String(startTime)) : (endTime ? derivePeriod(String(endTime)) : "");
                    // Prefer the label coming from the slide (variant/main); fallback to derived if missing
                    const effectiveLabel = (timeLabel ? String(timeLabel) : (derived || ""));

                    if (effectiveLabel && range) return `${effectiveLabel} — ${range}`;
                    return String(effectiveLabel || range || "");
                  })();

                  return (
                    <>
                      {daysText && (
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] sm:text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="truncate max-w-[220px] sm:max-w-[280px]">{daysText}</span>
                        </div>
                      )}
                      {timeText && (
                        <div className="absolute left-2 bottom-2 bg-black/60 text-white text-[10px] sm:text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="truncate max-w-[220px] sm:max-w-[280px]">{timeText}</span>
                        </div>
                      )}
                    </>
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
                        className={`w-2 h-2 rounded-full transition-all ${activeVariantIndex === index
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
          <Card className="md:col-span-2 border border-purple-200/60 shadow-md bg-gradient-to-br from-rose-100/80 via-purple-100/40 to-sky-100/60">
            <CardHeader className="pb-3 sm:pb-4 border-b border-slate-50/50">
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
                  {/* Price */}
                  <div className="text-primary font-bold text-xl mb-4">{activeSlide.price === 0 ? "Free" : `PKR ${Number(activeSlide.price || 0).toLocaleString()}`}</div>

                  {/* Hospital/Clinic Name */}
                  {(() => {
                    // Prefer active slide; if empty on main slide, fallback to first variant that has a name
                    const variantsArr: any[] = Array.isArray((item as any)?.variants) ? (item as any).variants : [];
                    const firstVariantWithName = variantsArr.find(v => v?.hospitalClinicName);
                    const displayHospitalClinicName = (activeSlide as any).hospitalClinicName
                      || (item as any).hospitalClinicName
                      || (firstVariantWithName ? firstVariantWithName.hospitalClinicName : undefined);
                    return displayHospitalClinicName ? (
                      <div className="text-sm text-blue-600 font-medium mb-3 flex items-center gap-2">
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

                  {/* Category Badge */}
                  <div className="mb-4">
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
                    {/* Department badge for clinic services */}
                    {item.providerType === 'clinic' && (item as any).department && (
                      <Badge className="mt-2 w-1/2 flex items-center gap-3 bg-purple-50 text-purple-700 border-purple-200 text-[11px] px-2 py-0.5">
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
                  </div>

                  {/* Unified 3-row badge layout */}
                  <div className="space-y-3 mb-4 text-sm">
                    {/* Row 1: Rating ↔ Location */}
                    <div className="flex justify-between items-center min-h-[24px]">
                      <div className="flex-shrink-0">
                        <RatingBadge
                          rating={item.rating}
                          ratingBadge={item.ratingBadge as any}
                          totalRatings={item.totalRatings}
                          yourBadge={(yourBadge ?? item.myBadge) || null}
                          size="sm"
                          layout="column-compact"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                        <span>{activeSlide.location}</span>
                      </div>
                    </div>

                    {/* Row 2: Service Type only */}
                    <div className="flex justify-start items-center min-h-[24px]">
                      <div className="flex-shrink-0">
                        {(item.serviceType ?? resolvedServiceType) ? (
                          <ServiceTypeBadge serviceType={item.serviceType ?? resolvedServiceType} size="sm" />
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Home Delivery ↔ Availability ↔ WhatsApp */}
                    <div className="flex justify-between items-center min-h-[24px]">
                      <div className="flex-shrink-0">
                        {(item.homeDelivery === true) && (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[12px]">
                            <span className="leading-none">🏠</span>
                            <span className="leading-none">Home Delivery</span>
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {activeSlide.availability ? (
                          <AvailabilityBadge availability={activeSlide.availability} size="sm" />
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {item.providerPhone && (
                          <ServiceWhatsAppButton
                            phoneNumber={item.providerPhone}
                            serviceName={item.name}
                            providerName={item.provider}
                            providerId={item.providerId}
                            serviceId={item.id}
                          />
                        )}
                      </div>
                    </div>

                    {/* Row 4: Diseases (for doctor services) */}
                    {item.providerType === 'doctor' && (
                      <div className="flex justify-start items-center min-h-[24px] mt-3">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(() => {
                            const diseases = (hydratedDiseases ?? ((item as any)?.diseases || [])) as string[];
                            return Array.isArray(diseases) && diseases.length > 0 ? (
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
                                          // Toggle diseases visibility for small screens
                                          setExpandedDiseases(expandedDiseases === item.id ? null : item.id);
                                        }}
                                      >
                                        <VirusIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">Diseases</span>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs hidden sm:block">
                                      <div className="text-xs text-emerald-800">
                                        <div className="mb-1 font-medium">Diseases</div>
                                        <div className="flex flex-col gap-1">
                                          {diseases.map((d, i) => (
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
                                        {diseases.map((d, i) => (
                                          <span key={`${d}-${i}`} className="flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {d}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rating counts */}
                  {freshCounts && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                      <span>Excellent: {freshCounts.excellent}</span>
                      <span>Good: {freshCounts.good}</span>
                      <span>Fair: {freshCounts.fair}</span>
                    </div>
                  )}
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
                <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-orange-50/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Service Price</div>
                    <div className="text-xl font-bold text-gray-900">
                      {activeSlide.price === 0 ? "Free" : `PKR ${Number(activeSlide.price || 0).toLocaleString()}`}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Patient Rating</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-gray-900">{item.rating > 0 ? item.rating.toFixed(1) : "N/A"}</span>
                      {item.rating > 0 && <span className="text-yellow-500 text-lg">★</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Visible FAQ Section for SEO Compliance */}
        {seoData?.faqList && seoData.faqList.length > 0 && (
          <div className="mt-8">
            <Card className="border-none shadow-md bg-gradient-to-br from-teal-50 via-cyan-50/30 to-white overflow-hidden">
              <CardHeader className="bg-transparent border-b border-teal-100/50 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                    <CardDescription>Common questions about this service</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {seoData.faqList.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-teal-100/50 last:border-0 px-6 bg-white/50 hover:bg-white/80 transition-colors duration-200">
                      <AccordionTrigger className="text-left font-semibold text-slate-700 hover:text-emerald-700 hover:no-underline py-5 text-[15px]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 leading-relaxed pb-6 text-[15px]">
                        <div className="pl-4 border-l-2 border-emerald-500/30">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {
        item.isReal && item.providerType && (
          <RatingModal
            isOpen={isRatingModalOpen}
            onClose={() => setIsRatingModalOpen(false)}
            serviceId={item.id}
            serviceType={item.providerType}
            serviceName={item.name}
          />
        )
      }

      {/* Booking Options Modal (opens first on Book Now) */}
      <BookingOptionsModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={{
          id: item.id,
          name: item.name,
          provider: item.provider,
          price: Number(item.price ?? 0),
          image: item.image,
          location: item.location,
          _providerId: item.providerId,
          _providerType: item.providerType,
          providerPhone: item.providerPhone,
        }}
      />

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-b border-yellow-100">
            <div className="mx-auto w-16 h-16 rounded-full bg-white shadow flex items-center justify-center ring-8 ring-yellow-100">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <DialogHeader className="text-center mt-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">Admin Payment — Coming Soon</DialogTitle>
              <p className="text-gray-600 text-sm mt-1">JazzCash and EasyPaisa integration is under development</p>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-700 text-base text-center font-semibold">
              We're finalizing secure payments via SehatKor Admin. Until then, please book manually and coordinate payment directly with the provider.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-sm text-gray-800 font-semibold">Secure & Verified</p>
                <p className="text-xs text-gray-500 mt-1">Admin payment will include receipts and verified tracking.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-sm text-gray-800 font-semibold">JazzCash • EasyPaisa</p>
                <p className="text-xs text-gray-500 mt-1">Local wallet support planned for fast and easy checkout.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-sm text-gray-800 font-semibold">Timeline</p>
                <p className="text-xs text-gray-500 mt-1">Feature will appear here automatically once live.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-[13px] text-gray-600 font-semibold">
                جیز کیش/ایزی پیسہ کے ذریعے آن لائن ادائیگیاں جلد دستیاب ہوں گی۔ فی الحال براہِ کرم دستی بکنگ استعمال کریں۔
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button onClick={() => setShowComingSoon(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Got it
              </Button>
              <Button variant="outline" onClick={() => setShowComingSoon(false)} className="flex-1">
                Use Manual Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default ServiceDetailPage;


