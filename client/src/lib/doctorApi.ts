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

const BASE = 'http://localhost:4000/api/doctor';

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
  const res = await fetch(`${BASE}/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to update service');
  return data.service as DoctorServiceDoc;
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${BASE}/services/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!res.ok) {
    let data: any = {};
    try { data = await res.json(); } catch {}
    throw new Error(data?.message || 'Failed to delete service');
  }
}


