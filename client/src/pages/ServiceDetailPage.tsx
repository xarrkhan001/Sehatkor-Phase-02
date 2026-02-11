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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, ArrowLeft, Home, Clock, AlertTriangle, Calendar, User, Building2, Banknote, Star, Activity, ShieldCheck, Layers, Crosshair } from "lucide-react";
import BookingOptionsModal from "@/components/BookingOptionsModal";
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
  const [relatedServices, setRelatedServices] = useState<Unified[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

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

  // Fetch Related Services
  useEffect(() => {
    const fetchRelated = async () => {
      if (!item?.id || !item?.providerType) return;

      setIsLoadingRelated(true);
      try {
        const category = item.doctorCategory || item.pharmacyCategory || (item as any).labCategory || (item as any).clinicCategory || item.type;
        const result = await ServiceManager.fetchPublicServices({
          type: item.providerType,
          category: category,
          limit: 4
        });

        // Filter out current service and map to Unified
        const filtered = result.services
          .filter(s => s.id !== item.id)
          .map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: Number(s.price || 0),
            rating: s.averageRating || s.rating || 0,
            location: s.city || s.location || "Karachi",
            provider: s.providerName,
            image: s.image,
            type: s.providerType === "doctor" ? "Treatment" : s.providerType === "pharmacy" ? "Medicine" : s.providerType === "laboratory" ? "Test" : "Treatment",
            providerType: s.providerType,
            isReal: true,
            providerId: s.providerId,
            totalRatings: s.totalRatings || 0,
            hospitalClinicName: (s as any).hospitalClinicName,
            availability: s.availability,
          } as Unified));

        setRelatedServices(filtered);
      } catch (error) {
        console.error("Error fetching related services:", error);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [item?.id, item?.providerType, item?.type, item?.doctorCategory, item?.pharmacyCategory]);

  const urduSummary = useMemo(() => {
    if (!item) return "";

    const city = item.location || "پاکستان";
    const priceDisplay = item.price === 0 ? "مفت" : `${Number(item.price).toLocaleString()} روپے`;
    const providerName = item.provider || "صحت کار فراہم کنندہ";
    const serviceName = item.name;
    const hospitalName = (item as any).hospitalClinicName || "";
    const hospitalPart = hospitalName ? ` جو کہ ${hospitalName} میں موجود ہیں،` : "";

    if (item.providerType === 'doctor') {
      return `${providerName}${hospitalPart} سے ${serviceName} کے لیے ابھی اپائنٹمنٹ بک کریں۔ اس مشورے کی فیس ${priceDisplay} ہے اور یہ ${city} میں دستیاب ہے۔`;
    } else if (item.providerType === 'pharmacy') {
      return `${providerName} سے ${serviceName} کے بارے میں معلومات حاصل کریں اور اسے ${city} میں حاصل کریں۔ اس کی قیمت ${priceDisplay} ہے۔`;
    } else if (item.providerType === 'laboratory') {
      return `${providerName} سے ${serviceName} ٹیسٹ بک کریں۔ اس ٹیسٹ کی قیمت ${priceDisplay} ہے اور یہ ${city} میں دستیاب ہے۔`;
    }
    return `${providerName} سے ${serviceName} کی خدمات حاصل کریں۔ فیس ${priceDisplay} ہے اور یہ ${city} میں دستیاب ہے۔`;
  }, [item]);

  const shortUrduSummary = useMemo(() => {
    if (!item) return "";
    const priceVal = Number(item.price).toLocaleString();
    const priceDisplay = item.price === 0 ? "مفت" : `${priceVal} روپے`;

    // Strict Truncation (Exactly 20 chars)
    let pRaw = item.provider || "فراہم کنندہ";
    let sRaw = item.name || "";
    const providerName = pRaw.length > 20 ? pRaw.substring(0, 20) + "..." : pRaw;
    const serviceName = sRaw.length > 20 ? sRaw.substring(0, 20) + "..." : sRaw;

    return `${serviceName} بذریعہ ${providerName} - فیس: ${priceDisplay}`;
  }, [item]);

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
    const priceDisplay = item.price === 0 ? "Free" : `PKR ${Number(item.price).toLocaleString()}`;
    const providerName = item.provider || "Sehatkor Provider";
    const serviceName = item.name;
    const rating = item.rating || 0;
    const totalRatings = item.totalRatings || 0;
    const category = item.doctorCategory || item.pharmacyCategory || (item as any).labCategory || (item as any).clinicCategory || "";

    // Resolve Hospital/Clinic Name for SEO
    const variantsArr: any[] = Array.isArray((item as any)?.variants) ? (item as any).variants : [];
    const firstVariantWithHospital = variantsArr.find(v => v?.hospitalClinicName);
    const hospitalName = (item as any).hospitalClinicName || (firstVariantWithHospital ? firstVariantWithHospital.hospitalClinicName : "");
    const hospitalSuffix = hospitalName ? ` at ${hospitalName}` : "";

    let title = "";
    let description = "";
    let keywords = "";
    let schemaType = "MedicalProcedure"; // Default
    let providerSchemaType = "Organization";

    // Logic based on Provider Type
    switch (item.providerType) {
      case "doctor":
        title = `${serviceName} by ${providerName}${hospitalSuffix} in ${city} | Fee: ${priceDisplay}`;
        description = `Book an appointment for ${serviceName} with ${providerName}${hospitalSuffix} in ${city}. Fee: ${priceDisplay}. ${rating > 0 ? `Rated ${rating.toFixed(1)}/5 by ${totalRatings} patients.` : ''} Verified PMDC doctor. Get instant confirmation on Sehatkor.`;
        keywords = `${serviceName}, ${serviceName} in ${city}, ${serviceName} by ${providerName}, ${providerName} ${city}, ${providerName} appointment, Best ${category || "Doctor"} in ${city}, Online Doctor Booking Pakistan, Sehatkor, ڈاکٹر بکنگ`;
        schemaType = "MedicalProcedure";
        providerSchemaType = "Physician";
        break;

      case "pharmacy":
        title = `${serviceName} at ${providerName} in ${city} | Price: ${priceDisplay}`;
        description = `Buy ${serviceName} online from ${providerName} in ${city}. Price: ${priceDisplay}. ${item.homeDelivery ? 'Home delivery available.' : ''} Check availability and order now on Sehatkor. Fast medicine delivery in ${city}.`;
        keywords = `${serviceName}, ${serviceName} price in ${city}, ${serviceName} at ${providerName}, ${providerName} pharmacy ${city}, Medicine delivery ${city}, Buy ${serviceName} online, Online Pharmacy Pakistan, Sehatkor, دوائی آنلائن`;
        schemaType = "Product";
        providerSchemaType = "Organization";
        break;

      case "laboratory":
        title = `${serviceName} at ${providerName} in ${city} | Fee: ${priceDisplay}`;
        description = `Book ${serviceName} test at ${providerName} in ${city}. Test Price: ${priceDisplay}. ${item.homeDelivery ? 'Home sample collection available.' : ''} Get accurate results online via Sehatkor. Reliable clinical laboratory in ${city}.`;
        keywords = `${serviceName} test, ${serviceName} price in ${city}, ${serviceName} at ${providerName}, ${providerName} lab ${city}, Lab test ${city}, Chughtai Lab ${city}, Dow Lab ${city}, Essa Lab ${city}, Sehatkor, لیب ٹیسٹ`;
        schemaType = "MedicalTest";
        providerSchemaType = "Organization";
        break;

      case "clinic":
      default:
        title = `${serviceName} at ${providerName}${hospitalSuffix} in ${city} | Fee: ${priceDisplay}`;
        description = `Book ${serviceName} at ${providerName}${hospitalSuffix} in ${city}. Charges: ${priceDisplay}. Verified medical services with instant online booking on Sehatkor. Healthcare in ${city}.`;
        keywords = `${serviceName}, ${serviceName} charges in ${city}, ${serviceName} cost, ${serviceName} at ${providerName}, ${providerName} ${city}, Hospital in ${city}, Clinic appointment ${city}, Sehatkor, ہسپتال`;
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
      "memberOf": hospitalName ? {
        "@type": "MedicalOrganization",
        "name": hospitalName
      } : undefined,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "streetAddress": item.address || undefined,
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
        answer: `The ${item.providerType === 'doctor' ? 'consultation fee' : 'price'} for ${serviceName}${hospitalSuffix} is ${priceDisplay}.`
      });
    }

    if (serviceName) {
      faqList.push({
        question: `Is ${item.homeDelivery ? 'home delivery' : 'online booking'} available for ${serviceName}?`,
        answer: item.homeDelivery
          ? `Yes, home delivery is available for ${serviceName} in ${city} via ${providerName}.`
          : item.availability === 'Online'
            ? `Yes, ${serviceName} is available online.`
            : `${serviceName} is available at ${providerName}${hospitalSuffix} in ${city}. You can book online through Sehatkor.`
      });
    }

    if (serviceName && providerName) {
      faqList.push({
        question: `How can I book ${serviceName} at ${providerName}?`,
        answer: `You can book ${serviceName} at ${providerName}${hospitalSuffix} online through Sehatkor. Simply click the "Book Now" button on this page for instant booking confirmation.`
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-20 relative">
        <div className="max-w-7xl mx-auto pt-6">
          {/* Unified Premium Service Detail Card - Shifted Higher */}
          <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white rounded-[2rem] mb-8 max-h-fit lg:max-h-[620px] lg:-mt-1">
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Column: Image/Visuals - Compact Height */}
              <div className="lg:w-[42%] relative bg-slate-100 flex items-center justify-center p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 left-4 bg-white/60 backdrop-blur-md text-slate-700 hover:bg-white/80 transition-all h-8 z-30 rounded-full shadow-sm"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Back</span>
                </Button>
                <div className="w-full h-full max-h-[380px] lg:max-h-full overflow-hidden relative rounded-xl">
                  {activeSlide.image ? (
                    <img
                      src={activeSlide.image}
                      alt={`${activeSlide.name} by ${item.provider}`}
                      className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      No Image Available
                    </div>
                  )}

                  {/* Overlays on Image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges on Image */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {(() => {
                      const isMain = activeVariantIndex === -1;
                      const itemAny = item as any;
                      const sched = isMain ? itemAny.schedule : (slides[activeVariantIndex] as any)?.schedule;
                      const days = sched?.days || [];
                      const daysText = Array.isArray(days) && days.length > 0 ? days.join(',') : "";

                      return daysText ? (
                        <div className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                          <Calendar className="w-3 h-3 text-primary" />
                          {daysText}
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Time Overlay */}
                  {(() => {
                    const isMain = activeVariantIndex === -1;
                    const itemAny = item as any;
                    const sched = isMain ? itemAny.schedule : (slides[activeVariantIndex] as any)?.schedule;
                    const startTime = sched?.startTime;
                    const endTime = sched?.endTime;

                    const formatTo12Hour = (time24?: string): string => {
                      if (!time24) return "";
                      const [hours, minutes] = time24.split(':');
                      const hour24 = parseInt(hours, 10);
                      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                      return `${hour12}:${minutes} ${hour24 >= 12 ? 'PM' : 'AM'}`;
                    };

                    const range = (startTime && endTime) ? `${formatTo12Hour(String(startTime))} - ${formatTo12Hour(String(endTime))}` : "";

                    return range ? (
                      <div className="absolute bottom-6 left-6 text-white z-10">
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
                          <Clock className="w-4 h-4" />
                          {range}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Variant Controls Component */}
                  {hasVariants && (
                    <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveVariantIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeVariantIndex === index
                            ? 'bg-white scale-125 shadow-lg'
                            : 'bg-white/40 hover:bg-white/60'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Info - Clean White Background */}
              <div className="lg:w-[58%] p-5 sm:p-6 lg:p-8 flex flex-col justify-center bg-white">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Header Area */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-100 hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all duration-300 cursor-default border border-emerald-400/20">
                        {item.providerType === 'doctor' ? <User className="w-4 h-4" /> :
                          item.providerType === 'pharmacy' ? <Activity className="w-4 h-4" /> :
                            <Building2 className="w-4 h-4" />}
                        <span className="text-[11px] font-black uppercase tracking-[0.05em]">
                          {item.providerType === 'doctor' ? 'Professional Doctor' :
                            item.providerType === 'pharmacy' ? 'Certified Pharmacy' :
                              item.providerType === 'laboratory' ? 'Medical Lab' :
                                item.providerType === 'clinic' ? 'Hospital / Clinic' : item.type}
                        </span>
                      </div>

                      {(item as any)._providerVerified && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-all duration-300 cursor-default">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-[11px] font-black uppercase tracking-[0.1em]">Verified</span>
                        </div>
                      )}
                    </div>

                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] leading-[1.1] mb-3 tracking-[-0.03em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] cursor-help" style={{ fontFamily: '"Plus Jakarta Sans", "Outfit", "Inter", sans-serif' }}>
                            {activeSlide.name.length > 20 ? activeSlide.name.substring(0, 20) + "..." : activeSlide.name}
                          </h1>
                        </TooltipTrigger>
                        {activeSlide.name.length > 20 && (
                          <TooltipContent side="bottom" align="start" sideOffset={10} className="bg-slate-900 text-white border-none px-4 py-2 rounded-xl shadow-xl max-w-[280px] z-50">
                            <p className="text-[13px] sm:text-xs font-bold leading-relaxed">{activeSlide.name}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>

                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm sm:text-[15px] text-slate-500 font-medium">
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <span className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-help">
                              <User className="w-3.5 h-3.5 opacity-60" />
                              {item.provider.length > 20 ? item.provider.substring(0, 20) + "..." : item.provider}
                            </span>
                          </TooltipTrigger>
                          {item.provider.length > 20 && (
                            <TooltipContent side="bottom" align="start" sideOffset={10} className="bg-indigo-600 text-white border-none px-4 py-2 rounded-xl shadow-xl max-w-[280px] z-50">
                              <p className="text-[13px] sm:text-xs font-bold leading-relaxed">{item.provider}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      {(() => {
                        const hospitalName = (activeSlide as any).hospitalClinicName || (item as any).hospitalClinicName;
                        return hospitalName ? (
                          <div className="flex items-center">
                            <span className="w-1 h-1 bg-slate-300 rounded-full mx-1.5 hidden sm:block" />
                            <span className="flex items-center gap-1.5 text-primary/80 hover:text-primary transition-colors">
                              <Building2 className="w-3.5 h-3.5 opacity-60" />
                              {hospitalName}
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Quick Stats Row - Premium Icon-Driven Design */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-y border-slate-100">
                    {/* Price Stat */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                        <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">
                          {activeSlide.price === 0 ? "Free" : `PKR ${Number(activeSlide.price).toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    {/* Rating Stat */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                        <div className="flex items-center gap-1">
                          <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">
                            {item.rating > 0 ? item.rating.toFixed(1) : "5.0"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">/ 5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Location Stat */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</span>
                        <span className="text-sm sm:text-base font-bold text-slate-700 truncate leading-none">
                          {activeSlide.location}
                        </span>
                      </div>
                    </div>

                    {/* Status Stat */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                        <span className="text-sm sm:text-base font-bold text-emerald-600 leading-none">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges/Tags Area - Premium Icon-Driven Design */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-slate-600 hover:bg-slate-200/80 transition-all duration-300">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {(item.providerType === 'pharmacy' && (item.pharmacyCategory || resolvedPharmacyCategory))
                          ? (item.pharmacyCategory || resolvedPharmacyCategory)
                          : (item.providerType === 'laboratory' && ((item as any).labCategory || resolvedLabCategory))
                            ? (((item as any).labCategory || resolvedLabCategory) as string)
                            : (item.providerType === 'doctor' && ((item as any).doctorCategory || resolvedDoctorCategory))
                              ? (((item as any).doctorCategory || resolvedDoctorCategory) as string)
                              : (item.providerType === 'clinic' && ((item as any).clinicCategory || resolvedClinicCategory))
                                ? (((item as any).clinicCategory || resolvedClinicCategory) as string)
                                : item.type}
                      </span>
                    </div>

                    {/* Service Type Badge (Private/Public) */}
                    {(item.serviceType ?? resolvedServiceType) && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100/80 transition-all duration-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {item.serviceType ?? resolvedServiceType}
                        </span>
                      </div>
                    )}

                    {/* Availability Badge */}
                    {item.availability && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100/80 transition-all duration-300">
                        <Crosshair className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {activeSlide.availability || item.availability}
                        </span>
                      </div>
                    )}

                    {/* Home Delivery Badge */}
                    {item.homeDelivery && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100/80 transition-all duration-300">
                        <Home className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Home Delivery</span>
                      </div>
                    )}
                  </div>

                  {/* Description & Urdu Summary - More integrated */}
                  <div className="space-y-3">
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-300">
                      {activeSlide.description}
                    </p>

                    {/* Urdu Quick Intro - Responsive Premium Design */}
                    <div className="flex justify-center sm:justify-end pt-2">
                      <div className="inline-flex relative group max-w-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 rounded-2xl sm:rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-700"></div>
                        <div className="relative px-5 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 backdrop-blur-xl border border-emerald-100/80 rounded-2xl sm:rounded-full shadow-sm flex items-start sm:items-center gap-3 group-hover:border-emerald-200/90 transition-all duration-500 h-auto">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse shrink-0 mt-2 sm:mt-0"></div>
                          <p className="text-emerald-950 text-sm sm:text-base lg:text-[17px] font-bold whitespace-normal sm:whitespace-nowrap tracking-normal leading-snug sm:leading-none text-right" dir="rtl" style={{ fontFamily: '"Noto Nastaliq Urdu", "Urdu Typesetting", "Jameel Noori Nastaleeq", serif' }}>
                            {shortUrduSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area - Better Mobile Layout - Clean Divider */}
                  <div className="flex flex-row items-center gap-2 pt-3 border-t border-slate-100">
                    <Button
                      size="lg"
                      className="flex-[2.5] sm:flex-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white shadow-[0_10px_30px_rgba(79,70,229,0.25)] hover:shadow-[0_15px_35px_rgba(139,92,246,0.35)] rounded-2xl font-extrabold h-14 text-sm sm:text-lg tracking-wide uppercase group px-2 border border-white/10"
                      onClick={() => handleBookNow(item)}
                    >
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:rotate-12 transition-transform" />
                      <span className="hidden sm:inline">Book Appointment</span>
                      <span className="sm:hidden">Book Now</span>
                    </Button>

                    <div className="flex flex-1 gap-1.5 justify-end">
                      {item.providerPhone && (
                        <ServiceWhatsAppButton
                          phoneNumber={item.providerPhone}
                          serviceName={item.name}
                          providerName={item.provider}
                          providerId={item.providerId}
                          serviceId={item.id}
                          className="h-14 w-14 rounded-2xl p-[2px] bg-gradient-to-br from-blue-500/20 via-primary/20 to-teal-500/20 border border-slate-200 hover:border-primary/30 transition-all shadow-sm"
                        />
                      )}
                      {activeSlide.googleMapLink && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-14 w-10 sm:w-14 rounded-2xl border border-slate-200 hover:bg-slate-100 shrink-0"
                          onClick={() => window.open(activeSlide.googleMapLink!, '_blank')}
                          title="Open in Maps"
                        >
                          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                        </Button>
                      )
                      }
                      {canRate && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="px-3 sm:px-8 rounded-2xl font-bold border-slate-200 h-14 text-xs sm:text-sm shrink-0"
                          onClick={() => setIsRatingModalOpen(true)}
                        >
                          Rate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Related Services Section - Premium Grid */}
        {relatedServices.length > 0 && (
          <div className="mt-20 mb-20">
            <div className="bg-slate-50/50 rounded-[3rem] p-8 sm:p-12 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-10 h-1 bg-indigo-600 rounded-full"></span>
                    <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase">Discover More</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight" style={{ fontFamily: '"Plus Jakarta Sans", "Outfit", "Inter", sans-serif' }}>
                    Similar Services Nearby
                  </h2>
                  <p className="text-slate-500 font-medium mt-3 text-lg max-w-2xl">Explore highly-rated healthcare providers in your area offering similar quality care.</p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-slate-200 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 rounded-full px-8 h-12 font-bold shadow-sm"
                  onClick={() => navigate('/services')}
                >
                  View All Services
                  <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                {relatedServices.map((svc) => (
                  <div
                    key={svc.id}
                    className="group cursor-pointer bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col h-full"
                    onClick={() => {
                      navigate(`/service/${svc.id}`, { state: { service: svc, from: locationHook.pathname } });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      {svc.image ? (
                        <img
                          src={svc.image}
                          alt={svc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ring-1 ring-black/5">
                          PKR {Number(svc.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full text-amber-600 text-[11px] font-bold border border-amber-100">
                          <span>{svc.rating > 0 ? svc.rating.toFixed(1) : "5.0"}</span>
                          <span className="text-amber-400 text-xs">★</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">({svc.totalRatings || 'New'})</span>
                      </div>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-[17px] leading-[1.3] line-clamp-2 mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>{svc.name}</h3>
                      <p className="text-xs text-slate-500 mb-5 flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        {svc.provider}
                      </p>
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500 max-w-[70%]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs font-bold truncate">{svc.location}</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-indigo-300 group-hover:shadow-lg">
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {seoData?.faqList && seoData.faqList.length > 0 && (
          <div className="mt-16 w-full mb-24">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 ring-4 ring-indigo-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans", "Outfit", "Inter", sans-serif' }}>Frequently Asked Questions</h2>
                    <p className="text-slate-500 font-medium mt-1.5 text-lg">Everything you need to know about this service</p>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {seoData.faqList.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-100 last:border-0 px-8 sm:px-10 hover:bg-slate-50/60 transition-colors duration-300 group">
                      <AccordionTrigger className="text-left font-bold text-slate-700 group-hover:text-indigo-700 hover:no-underline py-6 text-base sm:text-lg">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 leading-relaxed pb-8 text-[15px] sm:text-base">
                        <div className="pl-6 border-l-[3px] border-indigo-500/20 py-1">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
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


