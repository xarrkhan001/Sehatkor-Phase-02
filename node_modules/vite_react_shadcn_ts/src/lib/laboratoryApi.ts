export type LaboratoryTestDoc = {
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
  providerType: 'laboratory';
  createdAt: string;
  updatedAt: string;
};

function authHeaders() {
  const token = localStorage.getItem('sehatkor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

import { API_BASE_URL } from '@/config';

const BASE = `${API_BASE_URL}/api/laboratory`;

export async function listTests(): Promise<LaboratoryTestDoc[]> {
  try {
    console.log('Making request to:', `${BASE}/tests`);
    const res = await fetch(`${BASE}/tests`, { 
      headers: { 
        'Content-Type': 'application/json', 
        ...authHeaders() 
      } 
    });
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData?.message || `HTTP ${res.status}: Failed to fetch tests`);
    }
    
    const data = await res.json();
    console.log('Tests data received:', data);
    return data.tests as LaboratoryTestDoc[];
  } catch (error) {
    console.error('Error in listTests:', error);
    throw error;
  }
}

export async function createTest(payload: Partial<LaboratoryTestDoc> & { name: string }): Promise<LaboratoryTestDoc> {
  try {
    console.log('Creating test with payload:', payload);
    const res = await fetch(`${BASE}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Create test error:', errorData);
      throw new Error(errorData?.message || `HTTP ${res.status}: Failed to create test`);
    }
    
    const data = await res.json();
    console.log('Test created:', data);
    return data.test as LaboratoryTestDoc;
  } catch (error) {
    console.error('Error in createTest:', error);
    throw error;
  }
}

export async function updateTest(id: string, updates: Partial<LaboratoryTestDoc>): Promise<LaboratoryTestDoc> {
  try {
    console.log('Updating test:', id, 'with updates:', updates);
    const res = await fetch(`${BASE}/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Update test error:', errorData);
      throw new Error(errorData?.message || `HTTP ${res.status}: Failed to update test`);
    }
    
    const data = await res.json();
    console.log('Test updated:', data);
    return data.test as LaboratoryTestDoc;
  } catch (error) {
    console.error('Error in updateTest:', error);
    throw error;
  }
}

export async function deleteTest(id: string): Promise<void> {
  try {
    console.log('Deleting test:', id);
    const res = await fetch(`${BASE}/tests/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    
    if (!res.ok) {
      let data: any = {};
      try { data = await res.json(); } catch {}
      console.error('Delete test error:', data);
      throw new Error(data?.message || `HTTP ${res.status}: Failed to delete test`);
    }
    
    console.log('Test deleted successfully');
  } catch (error) {
    console.error('Error in deleteTest:', error);
    throw error;
  }
}
