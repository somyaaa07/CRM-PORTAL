import axios from 'axios';

const API = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL:'https://crm-portal-production-eb7b.up.railway.app/api'
  // baseURL: import.meta.env.VITE_API_URL,
});

// Har request mein token automatically lagao
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;