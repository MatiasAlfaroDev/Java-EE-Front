import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';

export interface UsuarioBackend {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'ONLINE' | 'OFFLINE';
  bloqueado: boolean; 
  initials: string;
}

export const usuarioService = {
  listar: () => api.get<UsuarioBackend[]>(ENDPOINTS.USUARIOS),
  
  guardarPushToken: (token: string) => api.post(ENDPOINTS.PUSH_TOKEN, { token }),

  bloquear: (id: number | string) => api.put(ENDPOINTS.BLOQUEAR_USUARIO(id)),

  desbloquear: (id: number | string) => api.put(ENDPOINTS.DESBLOQUEAR_USUARIO(id)),
};

