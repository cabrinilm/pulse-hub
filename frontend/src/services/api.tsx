// src/services/api.ts
import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: '/api',  // Ajuste se o backend tiver base diferente
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adicionar token automaticamente em todas as requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor para handling de errors global (opcional, ex.: redirect on 401)
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    // Ex.: supabase.auth.signOut(); ou redirect to login
  }
  return Promise.reject(error);
});

export default api;