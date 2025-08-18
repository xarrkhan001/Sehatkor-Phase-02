import { API_BASE_URL } from '@/config';

export interface Booking {
  _id: string;
  buyer: any; // Populate with user name, avatar
  provider: any; // Populate with provider name, businessName, avatar, role
  serviceId: string;
  serviceModel: string;
  serviceSnapshot: {
    name: string;
    price: number;
    description?: string;
  };
  paymentMethod: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  paymentStatus: 'pending' | 'completed' | 'failed';
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  providerId: string;
  serviceId: string;
  serviceModel: string;
  paymentMethod: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  serviceSnapshot: {
    name: string;
    price: number;
    description?: string;
  };
}

function authHeaders() {
  const token = localStorage.getItem('sehatkor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const BASE = `${API_BASE_URL}/api/bookings`;

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to create booking');
  }
  return data.booking as Booking;
}

export async function getMyBookings(): Promise<Booking[]> {
  const res = await fetch(`${BASE}/my-bookings`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch your bookings');
  }
  return data.bookings as Booking[];
}

export async function getProviderBookings(): Promise<Booking[]> {
  const res = await fetch(`${BASE}/provider-bookings`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch provider bookings');
  }
  return data.bookings as Booking[];
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  const res = await fetch(`${BASE}/${bookingId}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch booking details');
  }
  return data.booking as Booking;
}

export async function deleteBooking(bookingId: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/${bookingId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to delete booking');
  }
  return data;
}

export async function deleteAllBookings(): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/my-bookings/delete-all`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to delete all bookings');
  }
  return data;
}
