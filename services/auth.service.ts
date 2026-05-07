import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { LoginRequest, RegisterRequest, BackendLoginResponse } from '@/types/auth.types';
import { USE_MOCK_API } from '@/constants/dev';
import { mockAuthService } from './mockApi';

export const authService = {
  login: (data: LoginRequest) =>
    USE_MOCK_API
      ? mockAuthService.login(data.email, data.password) as Promise<{ data: BackendLoginResponse; status: number }>
      : api.post<BackendLoginResponse>(ENDPOINTS.LOGIN, data),

  register: (data: RegisterRequest) =>
    USE_MOCK_API
      ? mockAuthService.register(data.username, data.email, data.password)
      : api.post(ENDPOINTS.REGISTER, {
          nombre:   data.username,
          email:    data.email,
          password: data.password,
          rol:      'USER',
        }),

  logout: () =>
    USE_MOCK_API
      ? mockAuthService.logout()
      : api.post(ENDPOINTS.LOGOUT),
};
