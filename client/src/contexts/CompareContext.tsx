import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import ServiceManager, { Service as RealService } from "@/lib/serviceManager";
import { mockServices, Service as MockService } from "@/data/mockData";

export type UnifiedService = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  // display-friendly combined location, but keep granular fields too
  location: string;
  city?: string;
  detailAddress?: string;
  googleMapLink?: string;
  type: "Treatment" | "Medicine" | "Test" | "Surgery";
  homeService: boolean;
  image?: string;
  provider: string;
  isReal?: boolean;
  // provider + ratings
  ratingBadge?: "excellent" | "good" | "fair" | "poor" | null;
  totalRatings?: number;
  providerPhone?: string;
  _providerId?: string;
  _providerType?: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  createdAt?: string;
  updatedAt?: string;
  // variants (doctor services primarily)
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

type CompareContextValue = {
  selectedIds: string[];
  items: UnifiedService[];
  add: (serviceId: string) => void;
  remove: (serviceId: string) => void;
  toggle: (serviceId: string) => void;
  clear: () => void;
  maxItems: number;
};

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

const STORAGE_KEY = "sehatkor_compare_selection";

function mapRealToUnified(service: RealService): UnifiedService {
  const type: UnifiedService["type"] =
    service.providerType === "doctor"
      ? "Treatment"
      : service.providerType === "pharmacy"
      ? "Medicine"
      : service.providerType === "laboratory"
      ? "Test"
      : service.category === "Surgery"
      ? "Surgery"
      : "Treatment";

  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: (service as any)?.price ?? 0,
    rating: (service as any)?.averageRating || (service as any)?.rating || 0,
    location: ((service as any)?.detailAddress && (service as any)?.city)
      ? `${(service as any).detailAddress}, ${(service as any).city}`
      : ((service as any)?.city || (service as any)?.location || "Karachi"),
    city: (service as any)?.city,
    detailAddress: (service as any)?.detailAddress,
    googleMapLink: (service as any)?.googleMapLink,
    type,
    homeService: service.providerType === "doctor",
    image: service.image,
    provider: service.providerName,
    isReal: true,
    ratingBadge: (service as any)?.ratingBadge ?? null,
    totalRatings: (service as any)?.totalRatings ?? 0,
    providerPhone: (service as any)?.providerPhone,
    _providerId: (service as any)?.providerId,
    _providerType: (service as any)?.providerType,
    createdAt: (service as any)?.createdAt,
    updatedAt: (service as any)?.updatedAt,
    variants: (service as any)?.variants || [],
  };
}

function mapMockToUnified(service: MockService): UnifiedService {
  return {
    ...service,
    isReal: false,
  } as UnifiedService;
}

export function CompareProvider({ children, maxItems = 4 }: { children: ReactNode; maxItems?: number }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const allUnified: UnifiedService[] = useMemo(() => {
    const real = (ServiceManager as any).getAllServicesWithVariants
      ? (ServiceManager as any).getAllServicesWithVariants().map(mapRealToUnified)
      : ServiceManager.getAllServices().map(mapRealToUnified);
    const mocks = mockServices.map(mapMockToUnified);
    return [...real, ...mocks];
  }, []);

  const items = useMemo(() => allUnified.filter(s => selectedIds.includes(s.id)), [allUnified, selectedIds]);

  const add = (serviceId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(serviceId)) return prev;
      if (prev.length >= maxItems) return prev;
      return [...prev, serviceId];
    });
  };

  const remove = (serviceId: string) => setSelectedIds(prev => prev.filter(id => id !== serviceId));
  const toggle = (serviceId: string) => setSelectedIds(prev => (prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : prev.length < maxItems ? [...prev, serviceId] : prev));
  const clear = () => setSelectedIds([]);

  const value: CompareContextValue = { selectedIds, items, add, remove, toggle, clear, maxItems };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}


