export interface Usuario {
  id: string;
  username: string;
  email: string;
  rol: 'USER' | 'ADMIN';
  status: 'PENDING_MFA' | 'ACTIVE' | 'SUSPENDED' | 'OFFLINE';
  public_key: string;
  bloqueado?: boolean;
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
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

// Respuesta del backend (o mock) al hacer login
export interface BackendLoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    estado?: string;
    bloqueado?: boolean;
  };
}
