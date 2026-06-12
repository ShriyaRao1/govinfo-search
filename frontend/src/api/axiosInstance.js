import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('govinfo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear stale token
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('govinfo_token');
      localStorage.removeItem('govinfo_user');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
