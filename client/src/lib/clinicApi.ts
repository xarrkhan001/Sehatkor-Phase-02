import { apiUrl } from '@/config/api';

export type ClinicServiceDoc = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  department?: string;
  category?: string;
  duration?: string;
  imageUrl?: string;
  imagePublicId?: string;
  // Optional location and availability fields used in ClinicDashboard
  googleMapLink?: string;
  city?: string;
  detailAddress?: string;
  availability?: string;
  serviceType?: string[];
  homeDelivery?: boolean;
  providerId: string;
  providerName: string;
  providerType: 'clinic';
  createdAt: string;
  updatedAt: string;
};

function authHeaders() {
  const token = localStorage.getItem('sehatkor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = apiUrl('/api/clinic');

export async function listServices(): Promise<ClinicServiceDoc[]> {
  const res = await fetch(`${BASE}/services`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch services');
  return data.services as ClinicServiceDoc[];
}

export async function createService(payload: Partial<ClinicServiceDoc> & { name: string }): Promise<ClinicServiceDoc> {
  const res = await fetch(`${BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to create service');
  return data.service as ClinicServiceDoc;
}

export async function updateService(id: string, updates: Partial<ClinicServiceDoc>): Promise<ClinicServiceDoc> {
  const res = await fetch(`${BASE}/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to update service');
  return data.service as ClinicServiceDoc;
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${BASE}/services/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
  if (!res.ok) {
    let data: any = {};
    try { data = await res.json(); } catch {}
    throw new Error(data?.message || 'Failed to delete service');
  }
}


