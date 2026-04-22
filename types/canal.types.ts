export type TipoChat = 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
export type ChatRol  = 'CREADOR' | 'ADMINISTRADOR' | 'MIEMBRO';

export interface Canal {
  id: string;
  nombre: string;
  tipo: TipoChat;
  is_ephemeral: boolean;
  expires_at?: string;
  fecha_creado: string;
  lastMsg?: string;
  lastMsgTime?: string;
  unread: number;
  online: boolean;
  members_count?: number;
  initials: string;
}

export interface MiembroCanal {
  usuario_id: string;
  canal_id: string;
  username: string;
  initials: string;
  rol: ChatRol;
  fecha_unido: string;
  online: boolean;
}

export interface CrearCanalRequest {
  nombre: string;
  tipo: TipoChat;
  is_ephemeral?: boolean;
  expires_at?: string;
  miembros?: string[];
}
