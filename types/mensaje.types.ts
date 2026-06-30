export type EstadoMensaje = 'ENVIADO' | 'PENDIENTE' | 'RECHAZADO';

export interface Reaccion {
  emoji: string;
  usuarioId: string;
  usuarioNombre: string;
}

export interface ArchivoAdjunto {
  urlArchivo: string;
  nombreArchivo: string;
  tamanoArchivo: number;
  mimeType: string;
}

export interface OpcionEncuesta {
  id: string;
  texto: string;
  votos: number;
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

export interface Mensaje {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_initials: string;
  chatId: string;
  parent_id?: string;
  contenido: string;
  tipo: 'TEXTO' | 'ARCHIVO' | 'IMAGEN' | 'VIDEO' |'AUDIO';
  iv: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  edited_at?: string;
  deleted_at?: string;
  estado: EstadoMensaje;
  reacciones: Reaccion[];
  threads_count?: number;
  adjunto?: ArchivoAdjunto | null;
  encuesta?: Encuesta;
  entregado?: boolean; 
  leido?: boolean;     
  editado?: boolean;
  eliminado?: boolean;
  mensajeOrigenId?: number;
}
