// Misma forma que UsuarioDTO del backend
export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'ONLINE' | 'OFFLINE';
  bloqueado?: boolean;
  initials: string;
}

export interface AuditLog {
  id: number;
  usuario: string;
  accion: string;
  entidad: string;
  ip: string;
  old_value?: string;
  new_value?: string;
  fechaCreacion: string;
}

export interface ReporteUso {
  fecha: string;
  mensajes: number;
  usuarios_activos: number;
  chats_activos: number;
}
  