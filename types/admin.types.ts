export interface UsuarioAdmin {
  id: string;
  username: string;
  email: string;
  rol: 'USER' | 'MANAGER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'OFFLINE' | 'PENDING_MFA';
  departamento: string;
  initials: string;
}

export interface AuditLog {
  id: string;
  usuario: string;
  accion: string;
  entidad: string;
  ip: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface ReporteUso {
  fecha: string;
  mensajes: number;
  usuarios_activos: number;
  canales_activos: number;
}

export interface CambiarStatusRequest {
  status: 'ACTIVE' | 'SUSPENDED';
}
