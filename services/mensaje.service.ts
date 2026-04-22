import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { Mensaje, MensajesPaginados, EnviarMensajePayload } from '@/types/mensaje.types';

export const mensajeService = {
  listar: (canalId: string, params?: { before?: string; limit?: number }) =>
    api.get<MensajesPaginados>(ENDPOINTS.MENSAJES(canalId), { params: { limit: 50, ...params } }),

  enviarOffline: (data: EnviarMensajePayload) =>
    api.post<Mensaje>(ENDPOINTS.MENSAJE_OFFLINE, data),

  editar: (id: string, content_enc: string, iv: string) =>
    api.patch<Mensaje>(ENDPOINTS.MENSAJE(id), { content_enc, iv }),

  eliminar: (id: string) =>
    api.delete(ENDPOINTS.MENSAJE(id)),

  reaccionar: (msgId: string, emoji: string) =>
    api.post(ENDPOINTS.REACTIONS(msgId), { emoji }),

  quitarReaccion: (msgId: string, emoji: string) =>
    api.delete(`${ENDPOINTS.REACTIONS(msgId)}/${encodeURIComponent(emoji)}`),

  listarHilo: (parentId: string) =>
    api.get<Mensaje[]>(`${ENDPOINTS.MENSAJE(parentId)}/thread`),
};
