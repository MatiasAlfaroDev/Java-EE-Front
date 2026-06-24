/*import axios from 'axios';
import { API_BASE_URL } from '@/constants/endpoints';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  // El backend espera el token directamente sin prefijo "Bearer"
  if (token) config.headers.Authorization = token;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      await useAuthStore.getState().refreshTokens();
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) error.config.headers.Authorization = newToken;
      return api(error.config);
    }
    return Promise.reject(error);
  }
); */

import axios from 'axios';
import { API_BASE_URL } from '@/constants/endpoints';
import { useAuthStore } from '@/store/auth.store';

console.log('API_BASE_URL =', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;

  console.log(
    'FULL URL:',
    `${config.baseURL ?? ''}${config.url ?? ''}`
  );

  if (token) config.headers.Authorization = token;

  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {

    console.log(
      'FULL URL:',
      error.config?.baseURL + error.config?.url
    );

    console.log(
      'STATUS:',
      error.response?.status
    );

    console.log(
      'DATA:',
      error.response?.data
    );

    return Promise.reject(error);
  }
);