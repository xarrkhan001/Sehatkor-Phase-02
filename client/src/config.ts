const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Default to localhost for local development if not set
  return 'http://localhost:4000';
};

export const API_BASE_URL = getApiBaseUrl();
