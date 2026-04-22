import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { LoginRequest, RegisterRequest, LoginResponse, SesionTokens, Usuario } from '@/types/auth.types';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>(ENDPOINTS.LOGIN, data),

  register: (data: RegisterRequest) =>
    api.post<LoginResponse>(ENDPOINTS.REGISTER, data),

  mfaVerify: (challenge_token: string, code: string) =>
    api.post<SesionTokens>(ENDPOINTS.MFA_VERIFY, { challenge_token, code }),

  mfaSetup: () =>
    api.post<{ qr_url: string; secret: string }>(ENDPOINTS.MFA_SETUP),

  refresh: (refresh_token: string) =>
    api.post<SesionTokens>(ENDPOINTS.REFRESH, { refresh_token }),

  logout: (refresh_token: string) =>
    api.post(ENDPOINTS.LOGOUT, { refresh_token }),

  sso: (token: string) =>
    api.post<SesionTokens>(ENDPOINTS.SSO, { token }),

  me: () =>
    api.get<Usuario>('/auth/me'),
};
