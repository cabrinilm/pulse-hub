// src/services/api.ts
import axios from 'axios';
import { supabase } from './supabaseClient'; // caso você use para auth

// URL do seu backend deployado (substitua pelo seu deploy real)
const BACKEND_BASE_URL = 'https://meu-backend.vercel.app/api';

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação (opcional)
api.interceptors.request.use(async (config) => {
  // Se você estiver usando autenticação via Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Interceptor para tratamento global de erros (ex.: logout em 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ex.: supabase.auth.signOut(); ou redirecionar para login
    }
    return Promise.reject(error);
  }
);

export default api;
