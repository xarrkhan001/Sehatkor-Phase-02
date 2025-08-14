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
  createdAt: string;
  updatedAt: string;
};

function authHeaders() {
  const token = localStorage.getItem('sehatkor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = 'http://localhost:4000/api/doctor';

export async function listServices(): Promise<DoctorServiceDoc[]> {
  const res = await fetch(`${BASE}/services`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch services');
  return data.services as DoctorServiceDoc[];
}

export async function createService(payload: Partial<DoctorServiceDoc> & { name: string }): Promise<DoctorServiceDoc> {
  const res = await fetch(`${BASE}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to create service');
  return data.service as DoctorServiceDoc;
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


