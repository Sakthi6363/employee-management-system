import axios from 'axios';

// Both frontend and backend are on the same Netlify domain
// /api/* → /.netlify/functions/api/* (via netlify.toml redirect)
// In local dev, Vite proxy handles /api → localhost:5000
const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
