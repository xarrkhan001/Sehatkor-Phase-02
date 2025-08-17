export type MedicineDoc = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock?: number;
  imageUrl?: string;
  imagePublicId?: string;
  providerId: string;
  providerName: string;
  providerType: 'pharmacy';
  createdAt: string;
  updatedAt: string;
};

function authHeaders() {
  const token = localStorage.getItem('sehatkor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = 'http://localhost:4000/api/pharmacy';

export async function listMedicines(): Promise<MedicineDoc[]> {
  const res = await fetch(`${BASE}/medicines`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to load medicines');
  return data.medicines as MedicineDoc[];
}

export async function createMedicine(payload: Partial<MedicineDoc> & { name: string }): Promise<MedicineDoc> {
  const res = await fetch(`${BASE}/medicines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to create medicine');
  return data.medicine as MedicineDoc;
}

export async function updateMedicine(id: string, updates: Partial<MedicineDoc>): Promise<MedicineDoc> {
  const res = await fetch(`${BASE}/medicines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to update medicine');
  return data.medicine as MedicineDoc;
}

export async function deleteMedicine(id: string): Promise<void> {
  const res = await fetch(`${BASE}/medicines/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    let data: any = {};
    try { data = await res.json(); } catch {}
    throw new Error(data?.message || 'Failed to delete medicine');
  }
}


