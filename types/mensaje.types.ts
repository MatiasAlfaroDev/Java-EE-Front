export type EstadoMensaje = 'ENVIADO' | 'PENDIENTE' | 'RECHAZADO';
export type TipoMensaje  = 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'ARCHIVO';

// Refleja la entidad Mensaje del backend
export interface Mensaje {
  id: number;
  contenido: string;
  tipo: TipoMensaje;
  estado: EstadoMensaje;
  fechaEnviado: string;
  editado: boolean;
  chatId: number;
  emisor: {
    id: number;
    nombre: string;
    initials: string;
  };
  mensajeReferenciaId?: number;
}

export interface EnviarMensajeRequest {
  chatId: number;
  contenido: string;
  tipo: TipoMensaje;
}
