import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL; // Cambiado para ser más específico

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export * from './request';
export default api;
