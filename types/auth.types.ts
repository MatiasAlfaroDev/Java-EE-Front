export interface Usuario {
  id: string;
  username: string;
  email: string;
  rol: 'USER' | 'MANAGER' | 'ADMIN';
  status: 'PENDING_MFA' | 'ACTIVE' | 'SUSPENDED' | 'OFFLINE';
  public_key: string;
  initials: string;
  created_at: string;
}

export interface SesionTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  mfa_required?: boolean;
  challenge_token?: string;
}

export interface MfaVerifyRequest {
  challenge_token: string;
  code: string;
}
