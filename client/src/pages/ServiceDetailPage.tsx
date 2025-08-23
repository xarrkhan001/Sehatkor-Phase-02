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
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";
import { toast } from "sonner";

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
  ratingBadge?: 'excellent' | 'good' | 'normal' | 'poor' | null;
  myBadge?: 'excellent' | 'good' | 'normal' | 'poor' | null;
  homeService?: boolean;
};

const ServiceDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const locationHook = useLocation();
  const navigate = useNavigate();
  const { user, mode } = useAuth();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [yourBadge, setYourBadge] = useState<Unified['myBadge']>((locationHook.state as any)?.service?.myBadge ?? null);

  // Prefer service passed in via navigation state for full fidelity
  const stateService = (locationHook.state as any)?.service as Unified | undefined;
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
    if (stateService && stateService.id === id) return stateService;
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
    }));
    const combined = [...realMapped, ...mockMapped];
    return combined.find(x => x.id === id);
  }, [id]);

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
      const detail = e?.detail as { serviceId: string; serviceType: string; yourBadge: 'excellent'|'good'|'normal'|'poor' } | undefined;
      if (!detail) return;
      if (detail.serviceId === item?.id && detail.serviceType === item?.providerType) {
        setYourBadge(detail.yourBadge);
      }
    };
    window.addEventListener('my_rating_updated', handler as EventListener);
    return () => window.removeEventListener('my_rating_updated', handler as EventListener);
  }, [item?.id, item?.providerType]);

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
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">Service not found.</div>
        </div>
      </div>
    );
  }

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
              <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground">No Image</span>
                )}
              </div>
              {/* Footer info under image */}
              <div className="mt-8 hidden md:block">
  <div className="flex items-center gap-2">
    <h2 className="text-3xl font-semibold text-gray-600 truncate" title={item.name}>
      {item.name}
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
                <CardTitle className="text-xl sm:text-2xl md:text-3xl leading-tight break-words">{item.name}</CardTitle>
                {item.isReal && (
                  <Badge className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 border-green-100">Verified</Badge>
                )}
              </div>
              <CardDescription className="break-words leading-snug text-sm sm:text-base">{item.provider}</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0 pb-4 sm:pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-5">
                <div className="space-y-2 min-w-0">
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                    <div className="text-primary font-bold text-xl">{item.price === 0 ? "Free" : `PKR ${Number(item.price || 0).toLocaleString()}`}</div>
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
                      {item.location}
                    </div>
                    <Badge variant="outline">{item.type}</Badge>
                    {item.homeService && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Home className="w-4 h-4" />
                        <span>Home service</span>
                      </div>
                    )}
                  </div>
                  {item.address && (
                    <div className="text-sm text-muted-foreground">{item.address}</div>
                  )}
                  {item.googleMapLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full sm:w-auto bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-800"
                      onClick={() => window.open(item.googleMapLink!, '_blank')}
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
              <p className="mt-3 sm:mt-4 text-muted-foreground leading-relaxed break-words">{item.description}</p>
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-sm text-muted-foreground">Best Price Nearby</div>
                    <div className="text-lg font-semibold mt-1">PKR {Math.max(0, Math.round((Number(item.price || 0)) * 0.85)).toLocaleString()}</div>
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


