// Centralized service management system

export interface ServiceImage {
  file: File;
  preview: string;
}

export interface ServiceVariant {
  id: string;
  timeLabel?: string;
  startTime?: string;
  endTime?: string;
  days?: string[];
  price?: number;
  imageUrl?: string;
  imagePublicId?: string;
  googleMapLink?: string;
  city?: string;
  detailAddress?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  providerId: string;
  providerName: string;
  providerType: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  image?: string;
  createdAt: string;
  updatedAt: string;
  totalRatings?: number;
  ratingBadge?: 'excellent' | 'good' | 'fair' | 'poor' | null;
  city?: string;
  detailAddress?: string;
  googleMapLink?: string;
  location?: string;
  rating?: number;
  providerPhone?: string;
  averageRating?: number;
  ratingCounts?: { excellent: number; good: number; fair: number } | null;
  hospitalClinic?: string;
  recommended?: boolean;
  [key: string]: any; // Allow additional properties
}

export interface DoctorService extends BaseService {
  providerType: 'doctor';
  specialization?: string;
  duration?: string;
  variants?: ServiceVariant[];
  diseases?: string[];
}

export interface ClinicService extends BaseService {
  providerType: 'clinic';
  department?: string;
  duration?: string;
}

export interface LabService extends BaseService {
  providerType: 'laboratory';
  duration?: string;
  category: 'Blood Test' | 'Urine Test' | 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'Other';
}

export interface PharmacyService extends BaseService {
  providerType: 'pharmacy';
  stock?: number;
  duration?: string;
  category: 'Tablets' | 'Capsules' | 'Syrups' | 'Injections' | 'Ointments' | 'Drops' | 'Other';
}

export type Service = DoctorService | ClinicService | LabService | PharmacyService;

class ServiceManager {
  private static STORAGE_KEY = 'sehatkor_services';

  // Get all services
  static getAllServices(): Service[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading services:', error);
      return [];
    }
  }

  // Return services plus a synthetic competitor per service name
  static getAllServicesWithVariants(): Service[] {
    const base = this.getAllServices();
    const variants: Service[] = [];

    const seenByName: Record<string, number> = {};
    const cityOptions = [
      'Clifton',
      'Defence',
      'Gulshan',
      'North Nazimabad',
      'PECHS',
      'Bahadurabad',
      'Karachi',
      'Lahore',
      'Islamabad'
    ];
    for (const svc of base) {
      const count = (seenByName[svc.name] ?? 0) + 1;
      seenByName[svc.name] = count;
      // Enrich original with synthetic location/rating if missing
      const locIdx = Math.floor(Math.random() * cityOptions.length);
      const enriched: Service = {
        ...(svc as Service),
        location: (svc as any).location ?? cityOptions[locIdx],
        rating: (svc as any).rating ?? (4 + Math.random() * 1),
      };
      variants.push(enriched);

      // Only add one synthetic competitor per unique name and providerType
      if (count === 1) {
        const priceMultiplier = 0.8 + Math.random() * 0.6; // 0.8x - 1.4x
        const adjustedPrice = Math.max(0, Math.round((svc.price || 0) * priceMultiplier));
        const providerSuffix = [' Plus', ' Express', ' Care', ' Center'][Math.floor(Math.random() * 4)];
        const altProvider = `${svc.providerName}${providerSuffix}`;
        const altId = `${svc.id}_v2`;
        const now = new Date().toISOString();
        const altLoc = cityOptions[(locIdx + 3) % cityOptions.length];
        const altRating = 4 + Math.random() * 1; // 4.0 - 5.0

        const alt: Service = {
          ...(svc as Service),
          id: altId,
          price: adjustedPrice,
          providerName: altProvider,
          // keep same name/category/providerType to ensure "same product"
          createdAt: now,
          updatedAt: now,
          location: altLoc,
          rating: altRating,
        };

        variants.push(alt);
      }
    }

    return variants;
  }

  // Get services by provider
  static getServicesByProvider(providerId: string): Service[] {
    const allServices = this.getAllServices();
    return allServices.filter(service => service.providerId === providerId);
  }

  // Get services by type
  static getServicesByType(providerType: Service['providerType']): Service[] {
    const allServices = this.getAllServices();
    return allServices.filter(service => service.providerType === providerType);
  }

  // Get services by provider type with proper filtering
  static getServicesByProviderType(providerType: Service['providerType']): Service[] {
    const allServices = this.getAllServices();
    return allServices.filter(service => service.providerType === providerType);
  }

  // Get doctor services only
  static getDoctorServices(): Service[] {
    return this.getServicesByProviderType('doctor');
  }

  // Get clinic services only
  static getClinicServices(): Service[] {
    return this.getServicesByProviderType('clinic');
  }

  // Get pharmacy services only
  static getPharmacyServices(): Service[] {
    return this.getServicesByProviderType('pharmacy');
  }

  // Get laboratory services only
  static getLaboratoryServices(): Service[] {
    return this.getServicesByProviderType('laboratory');
  }

  // Fetch public services with optional type/page/limit (no localStorage write)
  static async fetchPublicServices(params?: { type?: Service['providerType']; page?: number; limit?: number; disease?: string; query?: string; category?: string; }): Promise<{
    services: Service[];
    total: number;
    byType?: { doctor: number; clinic: number; pharmacy: number; laboratory: number };
    page?: number;
    limit?: number;
    hasMore?: boolean;
  }> {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.disease) query.set('disease', params.disease);
    if (params?.query) query.set('q', params.query);
    if (params?.category) query.set('category', params.category);

    const url = `http://localhost:4000/api/user/services/public${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch services`);
    }
    const data = await res.json();
    console.debug('🧪 ServiceManager.fetchPublicServices raw[0..2]:', (data.services || []).slice(0,2).map((s:any)=>({
      _id: s?._id,
      name: s?.name,
      hospitalClinicName: s?.hospitalClinicName,
      hospitalClinic: s?.hospitalClinic,
      variantsHos: Array.isArray(s?.variants)? s.variants.map((v:any)=>v?.hospitalClinicName ?? v?.hospitalClinic) : null,
    })));

    const services: Service[] = (data.services || []).map((service: any) => ({
      id: String(service._id),
      name: service.name,
      description: service.description || '',
      price: service.price || 0,
      category: service.category || 'Treatment',
      providerType: service.providerType,
      providerId: service.providerId?._id || service.providerId,
      providerName: service.providerName || service.providerId?.name || 'Provider',
      image: service.imageUrl,
      duration: service.duration,
      // Map hospital/clinic name (backend may send either hospitalClinic or hospitalClinicName)
      ...(service.hospitalClinicName ? { hospitalClinicName: service.hospitalClinicName } : {}),
      ...(service.hospitalClinic ? { hospitalClinicName: service.hospitalClinic } : {}),
      ...(service.department ? { department: service.department } : {}),
      city: service.city,
      detailAddress: service.detailAddress,
      googleMapLink: service.googleMapLink,
      providerPhone: service.providerPhone,
      availability: service.availability,
      serviceType: service.serviceType,
      homeDelivery: Boolean(service.homeDelivery) === true,
      recommended: Boolean(service.recommended) === true,
      totalRatings: service.totalRatings ?? service.ratingsCount ?? 0,
      ratingBadge: service.ratingBadge ?? null,
      rating: service.averageRating ?? service.rating ?? 0,
      averageRating: service.averageRating ?? service.rating ?? 0,
      // Provider verification flag (server should compute based on isVerified and license presence)
      ...(typeof service._providerVerified !== 'undefined' ? { _providerVerified: Boolean(service._providerVerified) } : {}),
      // Main service schedule fields
      ...(service.timeLabel ? { timeLabel: service.timeLabel } : {}),
      ...(service.startTime ? { startTime: service.startTime } : {}),
      ...(service.endTime ? { endTime: service.endTime } : {}),
      ...(Array.isArray(service.days) ? { days: service.days } : {}),
      ...(Array.isArray(service.diseases) ? { diseases: service.diseases } : {}),
      ...(service.stock != null && { stock: service.stock }),
      ...(Array.isArray(service.variants) && service.variants.length > 0
        ? {
            variants: service.variants.map((v: any) => ({
              id: String(v._id),
              timeLabel: v.timeLabel,
              startTime: v.startTime,
              endTime: v.endTime,
              days: v.days,
              price: v.price,
              imageUrl: v.imageUrl,
              imagePublicId: v.imagePublicId,
              googleMapLink: v.googleMapLink,
              city: v.city,
              detailAddress: v.detailAddress,
              // Variant hospital/clinic name
              hospitalClinicName: v.hospitalClinicName ?? v.hospitalClinic,
              notes: v.notes,
              availability: v.availability,
              isActive: v.isActive,
              createdAt: v.createdAt,
              updatedAt: v.updatedAt,
            })) as ServiceVariant[]
          }
        : {}),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    const mappedResult = {
      services,
      total: data.total ?? services.length,
      byType: data.byType,
      page: data.page,
      limit: data.limit,
      hasMore: data.hasMore,
    };
    console.debug('✅ ServiceManager.fetchPublicServices mapped[0..2]:', mappedResult.services.slice(0,2).map((s:any)=>({
      id: s?.id,
      name: s?.name,
      hospitalClinicName: s?.hospitalClinicName,
      variantsHos: Array.isArray(s?.variants)? s.variants.map((v:any)=>v?.hospitalClinicName) : null,
    })));
    return mappedResult;
  }

  // Fetch a single public service by ID
  static async fetchServiceById(serviceId: string, type: Service['providerType']): Promise<Service> {
    const url = `http://localhost:4000/api/user/services/public/${serviceId}?type=${type}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch service ${serviceId}`);
    }
    const service = await res.json();
    console.debug('🧪 ServiceManager.fetchServiceById raw:', {
      _id: service?._id,
      name: service?.name,
      hospitalClinicName: service?.hospitalClinicName,
      hospitalClinic: service?.hospitalClinic,
      variantsHos: Array.isArray(service?.variants)? service.variants.map((v:any)=>v?.hospitalClinicName ?? v?.hospitalClinic) : null,
    });

    const mappedOne = {
      id: String(service._id),
      name: service.name,
      description: service.description || '',
      price: service.price || 0,
      category: service.category || 'Treatment',
      providerType: service.providerType,
      providerId: service.providerId?._id || service.providerId,
      providerName: service.providerName || service.providerId?.name || 'Provider',
      image: service.imageUrl,
      duration: service.duration,
      // Map hospital/clinic name
      ...(service.hospitalClinicName ? { hospitalClinicName: service.hospitalClinicName } : {}),
      ...(service.hospitalClinic ? { hospitalClinicName: service.hospitalClinic } : {}),
      ...(service.department ? { department: service.department } : {}),
      city: service.city,
      detailAddress: service.detailAddress,
      googleMapLink: service.googleMapLink,
      providerPhone: service.providerPhone,
      availability: service.availability,
      serviceType: service.serviceType,
      homeDelivery: Boolean(service.homeDelivery) === true,
      totalRatings: service.totalRatings ?? service.ratingsCount ?? 0,
      ratingBadge: service.ratingBadge ?? null,
      rating: service.averageRating ?? service.rating ?? 0,
      averageRating: service.averageRating ?? service.rating ?? 0,
      ratingCounts: service.ratingCounts ?? null,
      // Provider verification flag (server should compute based on isVerified and license presence)
      ...(typeof service._providerVerified !== 'undefined' ? { _providerVerified: Boolean(service._providerVerified) } : {}),
      // Main service schedule fields
      ...(service.timeLabel ? { timeLabel: service.timeLabel } : {}),
      ...(service.startTime ? { startTime: service.startTime } : {}),
      ...(service.endTime ? { endTime: service.endTime } : {}),
      ...(Array.isArray(service.days) ? { days: service.days } : {}),

      ...(service.stock != null && { stock: service.stock }),
      ...(Array.isArray(service.variants) && service.variants.length > 0
        ? {
            variants: service.variants.map((v: any) => ({
              id: String(v._id),
              timeLabel: v.timeLabel,
              startTime: v.startTime,
              endTime: v.endTime,
              days: v.days,
              price: v.price,
              imageUrl: v.imageUrl,
              imagePublicId: v.imagePublicId,
              googleMapLink: v.googleMapLink,
              city: v.city,
              detailAddress: v.detailAddress,
              hospitalClinicName: v.hospitalClinicName ?? v.hospitalClinic,
              notes: v.notes,
              availability: v.availability,
              isActive: v.isActive,
              createdAt: v.createdAt,
              updatedAt: v.updatedAt,
            })) as ServiceVariant[]
          }
        : {}),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    } as Service;
    console.debug('✅ ServiceManager.fetchServiceById mapped:', {
      id: (mappedOne as any).id,
      name: (mappedOne as any).name,
      hospitalClinicName: (mappedOne as any).hospitalClinicName,
      variantsHos: Array.isArray((mappedOne as any).variants)? (mappedOne as any).variants.map((v:any)=>v?.hospitalClinicName) : null,
    });
    return mappedOne;
  }

  // Fetch all services from server (removed local storage sync)
  static async syncServicesFromServer(): Promise<Service[]> {
    try {
      console.log('Fetching services from server...');
      const response = await fetch('http://localhost:4000/api/user/services/public');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch services`);
      }
      
      const data = await response.json();

      console.log('Server services received:', data);
      
      // Convert server data to local format
      const localServices: Service[] = data.services.map((service: any) => ({
        id: String(service._id),
        name: service.name,
        description: service.description || '',
        price: service.price || 0,
        category: service.category || 'Treatment',

        totalRatings: service.totalRatings ?? service.ratingsCount ?? 0,
        ratingBadge: service.ratingBadge ?? null,
        rating: service.averageRating ?? service.rating ?? 0,
        averageRating: service.averageRating ?? service.rating ?? 0,

        ...(service.stock != null && { stock: service.stock }),

        ...(Array.isArray(service.variants) && service.variants.length > 0
          ? {
              variants: service.variants.map((v: any) => ({
                id: String(v._id),
                timeLabel: v.timeLabel,
                startTime: v.startTime,
                endTime: v.endTime,
                days: v.days,
                price: v.price,
                imageUrl: v.imageUrl,
                imagePublicId: v.imagePublicId,
                googleMapLink: v.googleMapLink,
                city: v.city,
                detailAddress: v.detailAddress,
                hospitalClinicName: v.hospitalClinicName ?? v.hospitalClinic,
                notes: v.notes,
                availability: v.availability,
                isActive: v.isActive,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt,
              })) as ServiceVariant[]
            }
          : {}),
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      }));
      
      console.log('Services fetched from server:', localServices.length);
      
      return localServices;
    } catch (error) {
      console.error('Error fetching services from server:', error);
      throw error; // Don't fallback to local storage
    }
  }

  // Add service
  static addService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
    const allServices = this.getAllServices();
    const newService = {
      ...service,
      id: `${service.providerType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Service;

    allServices.push(newService);
    this.saveServices(allServices);
    return newService;
  }

  // Update service
  static updateService(serviceId: string, updates: Partial<Service>): Service | null {
    const allServices = this.getAllServices();
    const index = allServices.findIndex(service => service.id === serviceId);
    
    if (index === -1) return null;

    const updatedService = {
      ...allServices[index],
      ...updates,
      id: allServices[index].id, // Preserve original ID
      createdAt: allServices[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    } as Service;

    allServices[index] = updatedService;
    this.saveServices(allServices);
    return updatedService;
  }

  // Delete service
  static deleteService(serviceId: string): boolean {
    const allServices = this.getAllServices();
    const filteredServices = allServices.filter(service => service.id !== serviceId);
    
    if (filteredServices.length === allServices.length) return false;
    
    this.saveServices(filteredServices);
    return true;
  }

  // Search services
  static searchServices(query: string, category?: string): Service[] {
    const allServices = this.getAllServices();
    const lowerQuery = query.toLowerCase();
    
    return allServices.filter(service => {
      const matchesQuery = 
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery) ||
        service.category.toLowerCase().includes(lowerQuery) ||
        service.providerName.toLowerCase().includes(lowerQuery);
      
      const matchesCategory = !category || 
        category === 'All Categories' || 
        this.mapServiceToSearchCategory(service) === category;
      
      return matchesQuery && matchesCategory;
    });
  }

  // Map service to search category
  private static mapServiceToSearchCategory(service: Service): string {
    switch (service.providerType) {
      case 'doctor':
        return 'Doctor';
      case 'laboratory':
        return 'Lab Test';
      case 'pharmacy':
        return 'Medicine';
      case 'clinic':
        return service.category || 'Surgery';
      default:
        return 'Other';
    }
  }

  // Save services to localStorage
  private static saveServices(services: Service[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(services));
    } catch (error) {
      console.error('Error saving services:', error);
    }
  }

  // Image handling utilities
  static async processServiceImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get service statistics
  static getProviderStats(providerId: string) {
    const services = this.getServicesByProvider(providerId);
    return {
      totalServices: services.length,
      totalRevenue: services.reduce((sum, service) => sum + (service.price || 0), 0),
      avgPrice: services.length > 0 
        ? services.reduce((sum, service) => sum + (service.price || 0), 0) / services.length 
        : 0,
      categoryCounts: services.reduce((acc, service) => {
        acc[service.category] = (acc[service.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export default ServiceManager;