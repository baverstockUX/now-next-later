import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const login = (password) => api.post('/auth/login', { password });
export const verifyToken = () => api.get('/auth/verify');

// Initiative APIs
export const getInitiatives = () => api.get('/initiatives');
export const getAdminInitiatives = () => api.get('/initiatives/admin');
export const getInitiative = (id) => api.get(`/initiatives/${id}`);
export const updateInitiative = (id, data) => api.put(`/initiatives/${id}`, data);
export const deleteInitiative = (id) => api.delete(`/initiatives/${id}`);
export const deleteAllInitiatives = () => api.post('/initiatives/delete-all');

// Sync APIs
export const syncFromAha = () => api.post('/sync/refresh');
export const getSyncHistory = () => api.get('/sync/history');
export const getAvailableReleases = () => api.get('/sync/releases');

// Config APIs
export const getConfig = () => api.get('/config');
export const updateConfig = (data) => api.put('/config', data);

export default api;
