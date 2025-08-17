// Centralized service management system

export interface ServiceImage {
  file: File;
  preview: string;
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
}

export interface DoctorService extends BaseService {
  providerType: 'doctor';
  specialization?: string;
  duration?: string;
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
        // @ts-expect-error: extra field for consumers using any-mapping
        location: (svc as any).location ?? cityOptions[locIdx],
        // @ts-expect-error: extra field for consumers using any-mapping
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
          // @ts-expect-error: extra field for consumers using any-mapping
          location: altLoc,
          // @ts-expect-error: extra field for consumers using any-mapping
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

  // Fetch all services from server and sync to local storage
  static async syncServicesFromServer(): Promise<Service[]> {
    try {
      console.log('Syncing services from server...');
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
        providerType: service.providerType,
        providerId: service.providerId,
        providerName: service.providerName,
        image: service.imageUrl,
        duration: service.duration,
        city: service.city,
        detailAddress: service.detailAddress,
        googleMapLink: service.googleMapLink,
        providerPhone: service.providerPhone,
        ...(service.stock != null && { stock: service.stock }),
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      }));
      
      // Save to local storage
      this.saveServices(localServices);
      console.log('Services synced to local storage:', localServices.length);
      
      return localServices;
    } catch (error) {
      console.error('Error syncing services from server:', error);
      // Return existing local services if server fails
      return this.getAllServices();
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