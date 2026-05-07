export type TipoChat = 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
export type ChatRol  = 'CREADOR' | 'ADMINISTRADOR' | 'MIEMBRO';

// Refleja lo que devuelve GET /chats (ChatDTO del backend)
export interface Canal {
  id: number;
  nombre: string;
  initials: string;   // derivado en cliente
  lastMsg?: string;   // estado UI local
  unread?: number;    // estado UI local
  online?: boolean;   // estado UI local
}

export interface CrearCanalRequest {
  nombre: string;
  tipo: TipoChat | string;
  usuarios?: number[];
}
