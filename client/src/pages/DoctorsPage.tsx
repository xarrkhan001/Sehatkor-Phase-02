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
import { MapPin, Minimize2, Maximize2, X, Search, Star, Home, Clock, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import RatingBadge from "@/components/RatingBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import RatingModal from "@/components/RatingModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "../context/SocketContext";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import BookingOptionsModal from "@/components/BookingOptionsModal";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import EmptyState from "@/components/EmptyState";
import PageSearchHeader from "@/components/PageSearchHeader";

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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState<any>(null);
  const [expandedDiseases, setExpandedDiseases] = useState<string | null>(null);

  // (no-op placeholder retained to keep patch minimal)

  const VirusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="32" cy="32" r="14" fill="#22c55e" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        const x1 = 32 + Math.cos(angle) * 14;
        const y1 = 32 + Math.sin(angle) * 14;
        const x2 = 32 + Math.cos(angle) * 22;
        const y2 = 32 + Math.sin(angle) * 22;
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

  // Debug log when variant index changes
  useEffect(() => {
    console.log('🔄 DoctorsPage: Active variant index changed:', activeVariantIndex);
  }, [activeVariantIndex]);
  useEffect(() => {
    let isMounted = true;
    const loadPage = async (nextPage: number) => {
      setIsLoading(true);
      try {
        const { services, hasMore: more } = await ServiceManager.fetchPublicServices({
          type: 'doctor',
          page: nextPage,
          limit: 12,
          disease: initialDisease || undefined,
        });
        if (!isMounted) return;
        const mapped = services.map((service: any) => {
          const isOwn = String((service as any).providerId) === String(user?.id || '');
          const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Doctor') : ((service as any).providerName || 'Doctor');
          const mappedItem = ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            // Preserve real doctor category
            category: service.category || 'Treatment',
            rating: service.averageRating || service.rating || 0,
            location: (service as any).city || "Karachi",
            type: service.category === "Surgery" ? "Surgery" : "Treatment",
            homeService: true,
            homeDelivery: Boolean((service as any).homeDelivery),
            image: service.image,
            provider: resolvedProviderName,
            createdAt: (service as any).createdAt,
            _providerId: (service as any).providerId,
            googleMapLink: (service as any).googleMapLink,
            detailAddress: (service as any).detailAddress,
            hospitalClinicName: (service as any).hospitalClinicName,
            providerPhone: (service as any).providerPhone,
            totalRatings: (service as any).totalRatings || 0,
            ratingBadge: (service as any).ratingBadge || null,
            myBadge: (service as any).myBadge || null,
            recommended: Boolean((service as any).recommended),
            // Provider verification propagated from API or fallback to current user for own services
            _providerVerified: typeof (service as any)._providerVerified !== 'undefined'
              ? Boolean((service as any)._providerVerified)
              : (isOwn && Boolean((user as any)?.isVerified) && Boolean((user as any)?.licenseNumber) && String((user as any)?.licenseNumber).trim() !== ''),
            ...(service.serviceType ? { serviceType: service.serviceType } : {}),
            ...(Array.isArray((service as any).diseases) && (service as any).diseases.length > 0
              ? { diseases: (service as any).diseases }
              : {}),
            // Preserve variants from backend if available
            ...(Array.isArray((service as any).variants) && (service as any).variants.length > 0
              ? { variants: (service as any).variants }
              : {}),
            ...(service.availability ? { availability: service.availability } : {}),
            // Preserve main service schedule fields
            ...(service.timeLabel ? { timeLabel: service.timeLabel } : {}),
            ...(service.startTime ? { startTime: service.startTime } : {}),
            ...(service.endTime ? { endTime: service.endTime } : {}),
            ...(Array.isArray(service.days) ? { days: service.days } : {}),
          }) as Service;
          // Restore patient's own rating badge from localStorage (survives refresh)
          try {
            const uid = (user as any)?.id ?? (user as any)?._id ?? 'anon';
            const key = `myRating:${uid}:doctor:${service.id}`;
            const my = localStorage.getItem(key);
            if (my) (mappedItem as any).myBadge = my as any;
          } catch {}
          console.log('🧪 DoctorsPage map:', {
            id: mappedItem.id,
            name: mappedItem.name,
            hospitalClinicName: (mappedItem as any).hospitalClinicName,
            variantsHospitalClinicNames: Array.isArray((mappedItem as any).variants)
              ? ((mappedItem as any).variants as any[]).map(v => v?.hospitalClinicName)
              : null,
          });
          return mappedItem;
        });

        // Debug logs for initial load
        console.log('🔍 DoctorsPage: Raw API services (initial load):', services.slice(0, 2).map((s: any) => ({
          id: s.id,
          name: s.name,
          timeLabel: s.timeLabel,
          startTime: s.startTime, 
          endTime: s.endTime,
          days: s.days,
          ratingBadge: s.ratingBadge,
          myBadge: s.myBadge,
          averageRating: s.averageRating,
          totalRatings: s.totalRatings,
          variants: s.variants?.map((v: any) => ({ timeLabel: v.timeLabel, startTime: v.startTime, endTime: v.endTime, days: v.days }))
        })));
        
        console.log('🔍 DoctorsPage: Mapped services (initial load):', mapped.slice(0, 2).map(s => ({ 
          id: s.id, 
          name: s.name,
          rating: s.rating,
          ratingBadge: (s as any).ratingBadge,
          myBadge: (s as any).myBadge,
          totalRatings: (s as any).totalRatings,
          mainSchedule: { timeLabel: (s as any).timeLabel, startTime: (s as any).startTime, endTime: (s as any).endTime, days: (s as any).days },
          variants: (s as any).variants?.map((v: any) => ({ timeLabel: v.timeLabel, startTime: v.startTime, endTime: v.endTime, days: v.days })) 
        })));

        setDoctorServices(prev => {
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
    // initial load
    setDoctorServices([]);
    setPage(1);
    loadPage(1);
    return () => { isMounted = false; };
  }, [user?.id, user?.name, initialDisease]);

  // Live per-user badge updates for optimistic UI after rating submit
  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent' | 'good' | 'fair' | 'poor' } | undefined;
      if (!detail) return;
      if (String(detail.serviceType) !== 'doctor') return;
      setDoctorServices(prev => prev.map(s => s.id === detail.serviceId ? ({ ...s, myBadge: detail.yourBadge } as any) : s));
    };
    window.addEventListener('my_rating_updated', handler as EventListener);
    return () => window.removeEventListener('my_rating_updated', handler as EventListener);
  }, []);

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
      if (!data || data.providerType !== 'doctor') return;
      setDoctorServices(prev => prev.map(s => s.id === data.serviceId ? ({ ...s, recommended: Boolean(data.recommended) } as any) : s));
    };
    socket.on('service_recommendation_toggled', handleRecommendedToggle);

    return () => {
      socket.off('rating_updated', handleRatingUpdate);
      socket.off('service_recommendation_toggled', handleRecommendedToggle);
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
      const { services, hasMore: more } = await ServiceManager.fetchPublicServices({ type: 'doctor', page: next, limit: 12, disease: initialDisease || undefined });
      const mapped = services.map((service: any) => {
        const isOwn = String((service as any).providerId) === String(user?.id || '');
        const resolvedProviderName = isOwn ? (user?.name || (service as any).providerName || 'Doctor') : ((service as any).providerName || 'Doctor');
        return ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          // Preserve real doctor category
          category: service.category || 'Treatment',
          rating: service.averageRating || service.rating || 0,
          location: (service as any).city || "Karachi",
          type: service.category === "Surgery" ? "Surgery" : "Treatment",
          homeService: true,
          homeDelivery: Boolean((service as any).homeDelivery),
          image: service.image,
          provider: resolvedProviderName,
          createdAt: (service as any).createdAt,
          _providerId: (service as any).providerId,
          googleMapLink: (service as any).googleMapLink,
          detailAddress: (service as any).detailAddress,
          hospitalClinicName: (service as any).hospitalClinicName,
          providerPhone: (service as any).providerPhone,
          totalRatings: (service as any).totalRatings || 0,
          ratingBadge: (service as any).ratingBadge || null,
          myBadge: (service as any).myBadge || null,
          recommended: Boolean((service as any).recommended),
          // Provider verification propagated from API or fallback to current user for own services
          _providerVerified: typeof (service as any)._providerVerified !== 'undefined'
            ? Boolean((service as any)._providerVerified)
            : (isOwn && Boolean((user as any)?.isVerified) && Boolean((user as any)?.licenseNumber) && String((user as any)?.licenseNumber).trim() !== ''),
          ...(service.serviceType ? { serviceType: service.serviceType } : {}),
          ...(Array.isArray((service as any).diseases) && (service as any).diseases.length > 0
            ? { diseases: (service as any).diseases }
            : {}),
          // Preserve variants from backend if available
          ...(Array.isArray((service as any).variants) && (service as any).variants.length > 0
            ? { variants: (service as any).variants }
            : {}),
          ...(service.availability ? { availability: service.availability } : {}),
          // Preserve main service schedule fields
          ...(service.timeLabel ? { timeLabel: service.timeLabel } : {}),
          ...(service.startTime ? { startTime: service.startTime } : {}),
          ...(service.endTime ? { endTime: service.endTime } : {}),
          ...(Array.isArray(service.days) ? { days: service.days } : {}),
        }) as Service;
      });
      // Restore user's own rating badge from localStorage for loadMore batch
      try {
        const uid = (user as any)?.id ?? (user as any)?._id ?? 'anon';
        for (const item of mapped as any[]) {
          const key = `myRating:${uid}:doctor:${item.id}`;
          const my = localStorage.getItem(key);
          if (my) item.myBadge = my as any;
        }
      } catch {}

      console.log('🔍 DoctorsPage: Raw services from API (loadMore):', services.slice(0, 2).map(s => ({
        id: s.id,
        name: s.name,
        availability: s.availability,
        ratingBadge: s.ratingBadge,
        myBadge: s.myBadge,
        averageRating: s.averageRating,
        totalRatings: s.totalRatings,
        variants: s.variants
      })));
      
      console.log('🔍 DoctorsPage: Mapped services with variants (loadMore):', mapped.slice(0, 3).map(s => ({ 
        id: s.id, 
        name: s.name,
        rating: s.rating,
        ratingBadge: (s as any).ratingBadge,
        myBadge: (s as any).myBadge,
        totalRatings: (s as any).totalRatings,
        availability: (s as any).availability,
        mainSchedule: { timeLabel: (s as any).timeLabel, startTime: (s as any).startTime, endTime: (s as any).endTime, days: (s as any).days },
        variants: (s as any).variants?.map((v: any) => ({ timeLabel: v.timeLabel, startTime: v.startTime, endTime: v.endTime, days: v.days })) 
      })));

      setDoctorServices(prev => {
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

    // Prepare service data with required fields
    const serviceWithProviderInfo = {
      ...service,
      provider: service.provider || (service as any).providerName || 'Unknown Provider',
      _providerType: 'doctor',
      _providerId: (service as any)._providerId || service.id,
      providerPhone: (service as any).providerPhone
    };

    setSelectedBookingService(serviceWithProviderInfo);
    setIsBookingModalOpen(true);
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
      const result = {
        name: service.name,
        price: service.price,
        image: service.image,
        location: service.location,
        detailAddress: (service as any).detailAddress,
        description: service.description,
        googleMapLink: (service as any).googleMapLink,
        hospitalClinicName: (service as any).hospitalClinicName
      } as any;
      console.log('🔎 DoctorsPage.getDisplayForService base', {
        id: service.id,
        name: service.name,
        hospitalClinicName: result.hospitalClinicName
      });
      return result;
    }
    
    const variant = variants[variantIndex - 1];
    if (!variant) {
      const result = {
      name: service.name,
      price: service.price,
      image: service.image,
      location: service.location,
      detailAddress: (service as any).detailAddress,
      description: service.description,
      googleMapLink: (service as any).googleMapLink,
      hospitalClinicName: (service as any).hospitalClinicName
    } as any;
      console.log('🔎 DoctorsPage.getDisplayForService no-variant-fallback', {
        id: service.id,
        name: service.name,
        hospitalClinicName: result.hospitalClinicName
      });
      return result;
    }
    
    const result = {
      name: variant.name || service.name,
      price: variant.price ?? service.price,
      image: variant.imageUrl || service.image,
      location: variant.city || service.location,
      detailAddress: variant.detailAddress || (service as any).detailAddress,
      description: variant.description || service.description,
      googleMapLink: variant.googleMapLink || (service as any).googleMapLink,
      hospitalClinicName: (variant as any).hospitalClinicName || (service as any).hospitalClinicName
    } as any;
    console.log('🔎 DoctorsPage.getDisplayForService variant', {
      id: service.id,
      name: result.name,
      activeVariantIndex: variantIndex,
      hospitalClinicName: result.hospitalClinicName
    });
    return result;
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
    // For specific variant
    const variant = variants[variantIndex - 1];
    return variant?.timeRange || (service as any).timeRange || '9:00 AM - 5:00 PM';
  };

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTo12Hour = (time24?: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Build display time label for current slide
  const getTimeInfoForService = (service: any): string | null => {
    const variants = (service as any).variants as any[] | undefined;
    const vlen = Array.isArray(variants) ? variants.length : 0;
    const totalSlides = 1 + vlen;
    const rawIdx = activeVariantIndex[service.id] ?? 0;
    const idx = ((rawIdx % totalSlides) + totalSlides) % totalSlides;
    // For base (idx===0), show ONLY top-level schedule; do not fallback to variants
    if (idx === 0) {
      const label = (service as any).timeLabel || ((service as any).startTime && (service as any).endTime ? `${formatTo12Hour((service as any).startTime)} - ${formatTo12Hour((service as any).endTime)}` : "");
      const days = (service as any).days ? String((service as any).days) : "";
      const parts = [label, days].filter(Boolean);
      return parts.length ? parts.join(" · ") : null;
    }

    const v = variants && variants[idx - 1];
    if (!v) return null;
    const label = v.timeLabel || (v.startTime && v.endTime ? `${formatTo12Hour(v.startTime)} - ${formatTo12Hour(v.endTime)}` : "");
    const days = v.days ? String(v.days) : "";
    const parts = [label, days].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };

  // Build numeric time range for current slide
  const getTimeRangeForService = (service: any): string | null => {
    const variants = (service as any).variants as any[] | undefined;
    const vlen = Array.isArray(variants) ? variants.length : 0;
    const totalSlides = 1 + vlen;
    const rawIdx = activeVariantIndex[service.id] ?? 0;
    const idx = ((rawIdx % totalSlides) + totalSlides) % totalSlides;
    if (idx === 0) {
      const hasBase = (service as any).startTime && (service as any).endTime;
      if (hasBase) return `${formatTo12Hour((service as any).startTime)} - ${formatTo12Hour((service as any).endTime)}`;
      // fallback to label only if numeric range missing; DO NOT fallback to variants
      return (service as any).timeLabel ? String((service as any).timeLabel) : null;
    }

    const v = variants && variants[idx - 1];
    if (!v) return null;
    if (v.startTime && v.endTime) return `${formatTo12Hour(v.startTime)} - ${formatTo12Hour(v.endTime)}`;
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
          <PageSearchHeader
            title="Find Your Doctor"
            subtitle="Search from our network of qualified healthcare professionals"
            label="Search doctors"
            placeholder="Search doctors by name, specialty, or location..."
            value={searchTerm}
            onChange={(v) => setSearchTerm(v)}
            resultsCount={filteredServices.length}
          />
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
                  
                  {/* Top-left recommended overlay */}
                  {(service as any).recommended && (
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
                          const newIndex = (curr + 1) % total;
                          console.log('➡️ DoctorsPage: Next variant clicked:', {
                            serviceId: service.id,
                            serviceName: service.name,
                            currentIndex: curr,
                            newIndex,
                            totalSlides: total,
                            variants: v?.map(variant => ({ name: variant.name, availability: variant.availability }))
                          });
                          setActiveVariantIndex(prev => ({ ...prev, [service.id]: newIndex }));
                        }}
                        className="h-8 w-8 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white"
                        aria-label="Next variant"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {/* Schedule overlays: days (top-left) and time (bottom-left) */}
                  {(() => {
                    // Determine slide index and variant
                    const variants = (service as any).variants as any[] | undefined;
                    const vlen = Array.isArray(variants) ? variants.length : 0;
                    const totalSlides = 1 + vlen;
                    const rawIdx = activeVariantIndex[service.id] ?? 0;
                    const idx = ((rawIdx % totalSlides) + totalSlides) % totalSlides;

                    // Extract days
                    const daysText = (() => {
                      if (idx === 0) {
                        return (service as any).days ? String((service as any).days) : "";
                      }
                      const v = variants && variants[idx - 1];
                      return v?.days ? String(v.days) : "";
                    })();

                    // Build time text from label and numeric range
                    const formatTo12Hour = (time24?: string): string => {
                      if (!time24) return "";
                      const [hours, minutes] = time24.split(':');
                      const hour24 = parseInt(hours, 10);
                      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                      const ampm = hour24 >= 12 ? 'PM' : 'AM';
                      return `${hour12}:${minutes} ${ampm}`;
                    };
                    const timeText = (() => {
                      if (idx === 0) {
                        const timeLabel = (service as any).timeLabel;
                        const startTime = (service as any).startTime;
                        const endTime = (service as any).endTime;
                        const range = startTime && endTime ? `${formatTo12Hour(String(startTime))} - ${formatTo12Hour(String(endTime))}` : "";
                        if (timeLabel && range) return `${String(timeLabel)} — ${range}`;
                        return String(timeLabel || range || "");
                      }
                      const v = variants && variants[idx - 1];
                      const timeLabel = v?.timeLabel;
                      const startTime = v?.startTime;
                      const endTime = v?.endTime;
                      const range = startTime && endTime ? `${formatTo12Hour(String(startTime))} - ${formatTo12Hour(String(endTime))}` : "";
                      if (timeLabel && range) return `${String(timeLabel)} — ${range}`;
                      return String(timeLabel || range || "");
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
                      {String(((service as any).category || 'Treatment'))}
                    </Badge>
                  </div>
                </div>

                {/* Hospital/Clinic Name */}
                {getDisplayForService(service).hospitalClinicName && (
                  <div className="text-xs text-blue-600 font-medium mb-2 truncate flex items-center gap-1.5">
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
                    <span className="truncate">{getDisplayForService(service).hospitalClinicName}</span>
                  </div>
                )}

                {/* Address and Description */}
                <div className="mb-3 space-y-1">
                  <div className="text-xs text-gray-600 truncate">
                    {getDisplayForService(service).detailAddress || getDisplayForService(service).location || 'Address not specified'}
                  </div>
                  {service.description && (
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {service.description}
                    </div>
                  )}
                </div>

                {/* Fixed Position Rows Layout */}
                <div className="space-y-2 mb-3">
                  {/* First Row: Ratings (start) and Location (end) */}
                  <div className="flex justify-between items-center min-h-[24px]">
                    <div className="flex-shrink-0">
                      <RatingBadge
                        rating={service.rating}
                        totalRatings={(service as any).totalRatings || 0}
                        ratingBadge={(service as any).ratingBadge}
                        yourBadge={(service as any).myBadge || null}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">{getDisplayForService(service).location}</span>
                    </div>
                  </div>

                  {/* Second Row: Service Type only */}
                  <div className="flex justify-start items-center min-h-[24px]">
                    <div className="flex-shrink-0">
                      {(service as any).serviceType ? (
                        <ServiceTypeBadge serviceType={(service as any).serviceType} size="sm" />
                      ) : (
                        <div className="h-6"></div>
                      )}
                    </div>
                  </div>

                  {/* Third Row: Home Delivery (start), Availability (center), WhatsApp (end) */}
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
                      {(() => {
                        const currentVariantIndex = activeVariantIndex[service.id] ?? 0;
                        const variants = (service as any).variants as any[] | undefined;
                        const hasVariants = Array.isArray(variants) && variants.length > 0;
                        let label: string | undefined;
                        if (hasVariants && currentVariantIndex > 0) {
                          const variant = variants[currentVariantIndex - 1];
                          label = variant?.availability;
                        } else {
                          label = (service as any).availability;
                        }
                        return label ? (<AvailabilityBadge availability={label} size="sm" />) : <div className="h-6"></div>;
                      })()}
                    </div>
                    <div className="flex-shrink-0">
                      {(service as any).providerPhone && (
                        <ServiceWhatsAppButton
                          phoneNumber={(service as any).providerPhone}
                          serviceName={service.name}
                          providerName={service.provider}
                          serviceId={service.id}
                          providerId={(service as any)._providerId}
                        />
                      )}
                    </div>
                  </div>

                  {/* Fourth Row: Diseases (start) and Rate button (end) */}
                  <div className="flex justify-between items-center min-h-[24px]">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (
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
                                    setExpandedDiseases(expandedDiseases === service.id ? null : service.id);
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
                                    {((service as any).diseases as string[]).map((d, i) => (
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
                          {expandedDiseases === service.id && (
                            <div className="absolute sm:hidden left-0 top-[110%] z-50 w-56 p-2 bg-white border border-emerald-200 rounded-md shadow-lg">
                              <div className="text-xs text-emerald-800">
                                <div className="mb-1 font-medium">Diseases</div>
                                <div className="flex flex-col gap-1">
                                  {((service as any).diseases as string[]).map((d, i) => (
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
                    <div className="flex-shrink-0">
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
                <div className="mt-auto space-y-2">
                  {/* Mobile: 2x2 grid, Desktop: flex row */}
                  <div className="grid grid-cols-2 gap-2 md:flex md:gap-1.5">
                    <Button
                      size="sm"
                      className="flex items-center justify-center gap-1 h-9 text-xs bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-300/30 hover:shadow-blue-400/40 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-blue-400 md:flex-1 md:min-w-[80px] md:h-8"
                      onClick={() => handleBookNow(service)}
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Book</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowLocationMap(service.id)}
                      className="flex items-center justify-center gap-1 h-9 text-xs md:col-span-1 md:flex-1 md:min-w-[80px] md:h-8"
                    >
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">Location</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const currentVariantIndex = activeVariantIndex[service.id] ?? 0;
                        const baseSlide: any = getDisplayForService(service);
                        const variants = (service as any).variants;
                        const payload: any = {
                          id: service.id,
                          name: baseSlide.name,
                          description: (service as any).description,
                          price: Number(baseSlide.price ?? (service as any).price ?? 0),
                          rating: (service as any).rating ?? 0,
                          provider: service.provider,
                          image: baseSlide.image,
                          type: (service as any).category === 'Surgery' ? 'Surgery' : 'Treatment',
                          providerType: 'doctor',
                          _providerVerified: Boolean((service as any)._providerVerified),
                          isReal: true,
                          location: baseSlide.location,
                          address: baseSlide.detailAddress ?? (service as any).detailAddress ?? null,
                          providerPhone: (service as any).providerPhone ?? undefined,
                          googleMapLink: baseSlide.googleMapLink ?? (service as any).googleMapLink ?? undefined,
                          homeDelivery: Boolean((service as any).homeDelivery),
                          availability: (service as any).availability,
                          variants: Array.isArray(variants) ? variants : [],
                          // Include main service schedule
                          timeLabel: (service as any).timeLabel || null,
                          startTime: (service as any).startTime || null,
                          endTime: (service as any).endTime || null,
                          days: Array.isArray((service as any).days) ? (service as any).days : null,
                          serviceType: (service as any).serviceType,
                          hospitalClinicName: baseSlide.hospitalClinicName || (service as any).hospitalClinicName || undefined,
                          diseases: Array.isArray((service as any).diseases) ? (service as any).diseases : [],
                        };
                        navigate(`/service/${service.id}`, {
                          state: {
                            service: payload,
                            fromDoctors: true,
                            initialVariantIndex: currentVariantIndex,
                          }
                        });
                      }}
                      className="col-span-2 flex items-center justify-center gap-1 h-9 text-xs md:col-span-1 md:flex-1 md:min-w-[80px] md:h-8"
                    >
                      <span className="text-xs">Details</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
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

      {filteredServices.length === 0 && (
        <EmptyState
          variant="doctor"
          title="No doctors found"
          message="Try adjusting your keywords, filters, or expand the price range"
          actionLabel={searchTerm ? "Clear search" : undefined}
          onAction={searchTerm ? () => setSearchTerm("") : undefined}
        />
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

      {/* Diseases tooltip shown inline via Tooltip; no modal needed */}
    </div>
  );
};

export default DoctorsPage;