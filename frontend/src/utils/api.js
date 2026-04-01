import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err.response?.data || err);
  }
);

export const saveSimulation = (data) => api.post('/simulations', data);
export const getSimulations = (type) =>
  api.get('/simulations', { params: type ? { type } : {} });
export const getSimulation = (id) => api.get(`/simulations/${id}`);
export const deleteSimulation = (id) => api.delete(`/simulations/${id}`);

export default api;
