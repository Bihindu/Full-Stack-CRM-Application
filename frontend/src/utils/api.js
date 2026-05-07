import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

export const getUsers = () => api.get('/auth/users');

// ─── Leads ───────────────────────────────────────────────
export const getLeads = (params = {}) =>
  api.get('/leads', { params });

export const getLead = (id) => api.get(`/leads/${id}`);

export const createLead = (data) => api.post('/leads', data);

export const updateLead = (id, data) => api.put(`/leads/${id}`, data);

export const updateLeadStatus = (id, status) =>
  api.patch(`/leads/${id}/status`, { status });

export const deleteLead = (id) => api.delete(`/leads/${id}`);

// ─── Notes ───────────────────────────────────────────────
export const addNote = (leadId, content) =>
  api.post(`/leads/${leadId}/notes`, { content });

export const deleteNote = (leadId, noteId) =>
  api.delete(`/leads/${leadId}/notes/${noteId}`);

// ─── Dashboard ───────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard');

export default api;
