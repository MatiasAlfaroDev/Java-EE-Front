import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { LoginRequest, RegisterRequest, BackendLoginResponse } from '@/types/auth.types';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<BackendLoginResponse>(ENDPOINTS.LOGIN, data),

  register: (data: RegisterRequest) =>
    api.post(ENDPOINTS.REGISTER, {
      nombre: data.username,
      email:  data.email,
      password: data.password,
      rol: 'USER',
    }),

  logout: (token: string) =>
    api.post(ENDPOINTS.LOGOUT, {}, {
      headers: { Authorization: token },
    }),
};
