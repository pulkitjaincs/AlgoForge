import axios from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

let csrfToken: string | null = null;

const fetchCsrfToken = async () => {
  if (!csrfToken) {
    const response = await axios.get('/api/v1/csrf-token', { withCredentials: true });
    csrfToken = response.data.token;
  }
  return csrfToken;
};

apiClient.interceptors.request.use(async (config) => {
  if (config.method && !['get', 'head', 'options'].includes(config.method)) {
    const token = await fetchCsrfToken();
    if (token) {
      config.headers['x-csrf-token'] = token;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Return just the data part of the envelope if it matches the success envelope format
    if (response.data && response.data.success !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      try {
        await apiClient.post('/auth/refresh');
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      if (error.response.status !== 401) {
        const message = error.response.data?.error || error.message;
        toast.error(message);
      }
    } else {
      toast.error('Network error or server is down');
    }
    return Promise.reject(error);
  }
);
