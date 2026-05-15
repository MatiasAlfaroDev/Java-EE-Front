import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { USE_MOCK_API } from '@/constants/dev';
import { mockMensajeService } from './mockApi';
import { MensajeMock } from './mockData';
import { useAuthStore } from '@/store/auth.store';
import { Mensaje } from '@/types/mensaje.types';

export interface EnviarMensajeBackend {
  chatId:    number;
  contenido: string;
  tipo:      'TEXTO' | 'IMAGEN' | 'VIDEO' | 'ARCHIVO';
}

const mockToMensaje = (m: MensajeMock): Mensaje => ({
  id:              m.id,
  sender_id:       m.sender_id,
  sender_username: m.sender_username,
  sender_initials: m.sender_initials,
  chatId:      m.channel_id,
  contenido:     m.content_enc,
  iv:              m.iv,
  content:         m.content,
  sent_at:         m.sent_at,
  estado:          m.estado,
  reacciones:      [],
});

export const mensajeService = {
  // listar solo existe en el mock — el backend real no tiene GET de mensajes por chat
  listar: async (chatId: string): Promise<Mensaje[]> => {
    if (!USE_MOCK_API) return [];
    const res = await mockMensajeService.listar(Number(chatId));
    return (res.data as MensajeMock[]).map(mockToMensaje);
  },

  enviar: (chatId: string, contenido: string, tipo: EnviarMensajeBackend['tipo'] = 'TEXTO') => {
    if (USE_MOCK_API) {
      const usuario = useAuthStore.getState().usuario;
      return mockMensajeService.enviar(
        Number(chatId),
        contenido,
        Number(usuario?.id ?? 0),
        usuario?.username ?? 'Usuario'
      );
    }
    return api.post(ENDPOINTS.MENSAJE_ENVIAR, {
      chatId:    Number(chatId),
      contenido,
      tipo,
    });
  },
};
