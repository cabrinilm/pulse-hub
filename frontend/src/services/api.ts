import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: '/api',  // Ajuste se backend tiver base diferente
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor para errors (opcional, para handling global)
api.interceptors.response.use((response) => response, (error) => {
  // Ex.: if (error.response.status === 401) { signOut(); }
  return Promise.reject(error);
});

export default api;