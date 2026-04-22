export type EstadoMensaje = 'ENVIADO' | 'PENDIENTE' | 'RECHAZADO';

export interface Mensaje {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_initials: string;
  channel_id: string;
  parent_id?: string;
  content_enc: string;
  iv: string;
  content?: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  edited_at?: string;
  deleted_at?: string;
  estado: EstadoMensaje;
  reacciones: Reaccion[];
  threads_count?: number;
  archivo?: ArchivoAdjunto;
  encuesta?: Encuesta;
}

export interface Reaccion {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface ArchivoAdjunto {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  scan_result: 'PENDING' | 'CLEAN' | 'INFECTED';
}

export interface Encuesta {
  id: string;
  pregunta: string;
  opciones: OpcionEncuesta[];
  total: number;
  myVote?: string;
  anonima: boolean;
  expires_at: string;
}

export interface OpcionEncuesta {
  id: string;
  texto: string;
  votos: number;
}

export interface MensajesPaginados {
  data: Mensaje[];
  cursor_next: string | null;
  cursor_prev: string | null;
  total: number;
}

export interface EnviarMensajePayload {
  channel_id: string;
  content_enc: string;
  iv: string;
  parent_id?: string | null;
}
