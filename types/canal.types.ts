export type TipoChat = 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
export type ChatRol  = 'CREADOR' | 'ADMINISTRADOR' | 'MIEMBRO';

// Refleja lo que devuelve GET /chats (ChatDTO del backend)
export interface Canal {
  id: number;
  nombre: string;
  initials: string;
  lastMsg?: string;
  lastMsgTime?: string;   // ISO string del último mensaje
  unread?: number;
  online?: boolean;
  tipo?: 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
}

export interface CrearCanalRequest {
  nombre: string;
  tipo: TipoChat | string;
  usuarios?: number[];
}
