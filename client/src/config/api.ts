// Centralized API configuration
// Prefer VITE_API_BASE_URL; otherwise use VITE_API_URL and strip trailing /api

const raw = (import.meta as any)?.env?.VITE_API_BASE_URL || (import.meta as any)?.env?.VITE_API_URL || '';
const normalized = typeof raw === 'string' && raw
  ? raw.replace(/\/$/, '').replace(/\/api$/, '')
  : '';

export const API_BASE_URL = normalized || 'http://localhost:4000';

export const apiUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
};

export default {
  API_BASE_URL,
  apiUrl,
};
