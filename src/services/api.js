import axios from 'axios';

// Create Axios instance pointing to your live Render backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://timevolt-api.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to headers if user is logged in
API.interceptors.request.use(
  (config) => {
    // Check both standard 'token' and legacy 'timevolt_token'
    const token = localStorage.getItem('token') || localStorage.getItem('timevolt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear all possible token storage keys if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('timevolt_token');
    }
    return Promise.reject(error);
  }
);

export default API;