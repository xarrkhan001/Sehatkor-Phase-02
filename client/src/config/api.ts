// Centralized API configuration
// Reads from Vite env var VITE_API_BASE_URL, falls back to localhost

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiUrl = (path: string) => {
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
};

export default {
  API_BASE_URL,
  apiUrl,
};
