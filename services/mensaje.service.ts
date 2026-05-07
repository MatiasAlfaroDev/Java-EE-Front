import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';

export interface EnviarMensajeBackend {
  chatId:    number;
  contenido: string;
  tipo:      'TEXTO' | 'IMAGEN' | 'VIDEO' | 'ARCHIVO';
}

export const mensajeService = {
  // El backend solo tiene POST enviar — no hay GET de mensajes por canal
  enviar: (chatId: string, contenido: string, tipo: EnviarMensajeBackend['tipo'] = 'TEXTO') =>
    api.post(ENDPOINTS.MENSAJE_ENVIAR, {
      chatId:    Number(chatId),
      contenido,
      tipo,
    }),
};
