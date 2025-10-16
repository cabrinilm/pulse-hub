import axios from 'axios';
import { supabase } from './supabaseClient'; 


const BACKEND_BASE_URL = 'https://pulse-hub-backend.vercel.app/api';



const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(async (config) => {

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
     
    }
    return Promise.reject(error);
  }
);

export default api;
