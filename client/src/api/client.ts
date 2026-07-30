import axios from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    // Return just the data part of the envelope if it matches the success envelope format
    if (response.data && response.data.success !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        const message = error.response.data?.error || error.message;
        toast.error(message);
      }
    } else {
      toast.error('Network error or server is down');
    }
    return Promise.reject(error);
  }
);
