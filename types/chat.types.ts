export type TipoChat = 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
export type ChatRol  = 'CREADOR' | 'ADMINISTRADOR' | 'MIEMBRO';

// Refleja lo que devuelve GET /chats (ChatDTO del backend)
export interface Chat {
  id: string;
  nombre: string;
  contenido?: string;  // último mensaje o descripción
  initials: string;
  lastMsg?: string;
  lastMsgTime?: string;   // ISO string del último mensaje
  unread?: number;
  online?: boolean;
  tipo?: 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
  miembros?: number;
}

export interface CrearchatRequest {
  nombre: string;
  tipo: TipoChat | string;
  miembros?: number[];
}

export interface MiembroChat {
  id: number;
  nombre: string;
  email: string;
  rol?: ChatRol;
  estado?: 'ONLINE' | 'OFFLINE';
  initials: string;
}
