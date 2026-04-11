import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getGroups= ()=> api.get('/groups');
export const getGroup = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post('/groups', data);

export const getGroupExpenses = (groupId) => api.get(`/groups/${groupId}/expenses`);
export const addExpense = (groupId, data) => api.post(`/groups/${groupId}/expenses`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const getGroupBalances = (groupId) => api.get(`/groups/${groupId}/balances`);

export const suggestSettlements= (groupId) => api.get(`/groups/${groupId}/settlements/suggest`);
export const recordSettlements= (groupId, data) => api.post(`/groups/${groupId}/settlements`, data);
export const getGroupSettlements= (groupId) => api.get(`/groups/${groupId}/settlements`);

export default api;
