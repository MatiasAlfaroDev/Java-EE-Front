export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'ONLINE' | 'OFFLINE';
  initials: string;  // derivado en cliente: nombre.slice(0, 2).toUpperCase()
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}

// Respuesta real del backend
export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    estado: string;
  };
}
