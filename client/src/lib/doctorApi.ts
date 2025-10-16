import { apiUrl } from '@/config/api';

export interface VariantDoc {
  _id: string;
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
  availability?: string;
  notes?: string;
  isActive?: boolean;
}

export type DoctorServiceDoc = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  duration?: string;
  imageUrl?: string;
  imagePublicId?: string;
  providerId: string;
  providerName: string;
  providerType: 'doctor';
  availability?: 'Online' | 'Physical' | 'Online and Physical';
  serviceType?: 'Sehat Card' | 'Private' | 'Charity' | 'Public' | 'NPO' | 'NGO';
  homeDelivery?: boolean;
  // Top-level base schedule (main service)
  timeLabel?: string;
  startTime?: string;
  endTime?: string;
  days?: string[];
  variants?: VariantDoc[];
  diseases?: string[];
  createdAt: string;
  updatedAt: string;
  hospitalClinic?: string;
  googleMapLink?: string;
  city?: string;
  detailAddress?: string;
  [key: string]: any; // Allow additional properties
};

function authHeaders() {
  const token = localStorage.getItem('sehatkor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = apiUrl('/api/doctor');

export async function listServices(): Promise<DoctorServiceDoc[]> {
  try {
    console.log('Making request to:', `${BASE}/services`);
    const res = await fetch(`${BASE}/services`, { 
      headers: { 
        'Content-Type': 'application/json', 
        ...authHeaders() 
      } 
    });
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData?.message || `HTTP ${res.status}: Failed to fetch services`);
    }
    
    const data = await res.json();
    console.log('Services data received:', data);
    return data.services as DoctorServiceDoc[];
  } catch (error) {
    console.error('Error in listServices:', error);
    throw error;
  }
}

export async function createService(payload: Partial<DoctorServiceDoc> & { name: string }): Promise<DoctorServiceDoc> {
  try {
    console.log('Creating service with payload:', payload);
    const res = await fetch(`${BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    console.log('Create service response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Create service API Error:', errorData);
      throw new Error(errorData?.message || `HTTP ${res.status}: Failed to create service`);
    }
    
    const data = await res.json();
    console.log('Service created successfully:', data);
    return data.service as DoctorServiceDoc;
  } catch (error) {
    console.error('Error in createService:', error);
    throw error;
  }
}

export async function updateService(id: string, updates: Partial<DoctorServiceDoc>): Promise<DoctorServiceDoc> {
  console.log('Updating service with ID:', id, 'Updates:', JSON.stringify(updates, null, 2));
  const res = await fetch(`${BASE}/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  console.log('Update service response:', JSON.stringify(data, null, 2));
  if (!res.ok) throw new Error(data?.message || 'Failed to update service');
  return data.service as DoctorServiceDoc;
}

export async function deleteService(id: string): Promise<void> {
  try {
    console.log('Deleting service with ID:', id);
    const res = await fetch(`${BASE}/services/${id}`, { 
      method: 'DELETE', 
      headers: { ...authHeaders() } 
    });
    console.log('Delete service response status:', res.status);
    
    if (!res.ok) {
      let data: any = {};
      try { 
        data = await res.json(); 
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(data?.message || 'Failed to delete service');
    }
    
    // Read the response body to properly complete the request
    try {
      const data = await res.json();
      console.log('Delete service response:', data);
    } catch (e) {
      // Response might be empty or not JSON, which is fine for DELETE
      console.log('Delete successful (no JSON response)');
    }
  } catch (error) {
    console.error('Error in deleteService:', error);
    throw error;
  }
}


