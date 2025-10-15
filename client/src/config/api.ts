// Centralized API configuration
// Prefer VITE_API_BASE_URL; otherwise use VITE_API_URL and strip trailing /api

const raw = (import.meta as any)?.env?.VITE_API_BASE_URL || (import.meta as any)?.env?.VITE_API_URL || '';
const normalized = typeof raw === 'string' && raw
  ? raw.replace(/\/$/, '').replace(/\/api$/, '')
  : '';

// Force localhost for development
export const API_BASE_URL = 'https://sehatkor.pk';

export const apiUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
};

// Socket configuration: prefer explicit VITE_SOCKET_URL, otherwise reuse API base
const socketRaw = (import.meta as any)?.env?.VITE_SOCKET_URL || API_BASE_URL;
export const SOCKET_BASE_URL = 'https://sehatkor.pk';

// Helper to call API using the base URL
export async function apiFetch(inputPath: string, init?: RequestInit) {
  return fetch(apiUrl(inputPath), init);
}

// Centralized endpoints. Only define what the app uses; add more as needed.
export const ENDPOINTS = {
  chat: {
    verifiedUsers: '/api/chat/users/verified',
    conversations: '/api/chat/conversations',
    messages: (conversationId: string) => `/api/chat/messages/${conversationId}`,
    conversationMessages: (conversationId: string) => `/api/chat/conversations/${conversationId}/messages`,
    markRead: '/api/chat/conversations/read',
  },
  upload: '/api/upload',
  profile: {
    root: '/api/profile',
    image: '/api/profile/image',
    uploadImage: '/api/profile/upload-image',
  },
  payments: {
    invoicesProvider: (providerId: string) => `/api/payments/invoices/provider/${providerId}`,
    bulkDeletePayments: (providerId: string) => `/api/payments/provider/${providerId}/payments/bulk-delete`,
    deletePayment: (providerId: string, paymentId: string) => `/api/payments/provider/${providerId}/payment/${paymentId}`,
    wallet: (providerId: string) => `/api/payments/wallet/${providerId}`,
    withdrawals: (providerId: string) => `/api/payments/withdrawals/${providerId}`,
    withdraw: (providerId: string) => `/api/payments/withdraw/${providerId}`,
    deleteWithdrawal: (providerId: string, withdrawalId: string) => `/api/payments/withdrawals/${providerId}/${withdrawalId}`,
    bulkWithdrawalsDelete: '/api/payments/withdrawals/bulk-delete',
    deleteAllWithdrawalsForProvider: (providerId: string) => `/api/payments/withdrawals/provider/${providerId}`,
  },
} as const;

export default {
  API_BASE_URL,
  SOCKET_BASE_URL,
  apiUrl,
  apiFetch,
  ENDPOINTS,
};
