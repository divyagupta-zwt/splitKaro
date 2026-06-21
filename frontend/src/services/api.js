import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

export const getGroups = (signal) => api.get('/groups', { signal });
export const getGroup = (id, signal) => api.get(`/groups/${id}`, { signal });
export const createGroup = (data) => api.post('/groups', data);

export const getGroupExpenses = (groupId, signal) => api.get(`/groups/${groupId}/expenses`, { signal });
export const addExpense = (groupId, data) => api.post(`/groups/${groupId}/expenses`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const getGroupBalances = (groupId, signal) => api.get(`/groups/${groupId}/balances`, { signal });

export const suggestSettlements = (groupId, signal) => api.get(`/groups/${groupId}/settlements/suggest`, { signal });
export const recordSettlements = (groupId, data) => api.post(`/groups/${groupId}/settlements`, data);
export const getGroupSettlements = (groupId, signal) => api.get(`/groups/${groupId}/settlements`, { signal });

export default api;
