import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { USE_MOCK_API } from '@/constants/dev';
import { mockMensajeService } from './mockApi';
import { MensajeMock } from './mockData';
import { useAuthStore } from '@/store/auth.store';
import { Mensaje } from '@/types/mensaje.types';

export interface EnviarMensajeBackend {
  chatId: number;
  contenido: string;
  tipo: 'TEXTO' | 'IMAGEN' | 'VIDEO' | 'ARCHIVO' |'AUDIO';

  nombreArchivo?: string;
  tamanoArchivo?: number;
}

const mockToMensaje = (m: MensajeMock): Mensaje => ({
  id:              m.id,
  sender_id:       m.sender_id,
  sender_username: m.sender_username,
  sender_initials: m.sender_initials,
  chatId:      m.channel_id,
  contenido:     m.content_enc,
  iv:              m.iv,
  sent_at:         m.sent_at,
  estado:          m.estado,
  reacciones:      [],
  tipo: 'TEXTO',
  adjunto: null,

}); 

export const mensajeService = {
  // listar solo existe en el mock — el backend real no tiene GET de mensajes por chat
  listar: async (chatId: string): Promise<Mensaje[]> => {
    if (USE_MOCK_API) {
      const res =
        await mockMensajeService.listar(
          Number(chatId)
        );
      return (res.data as MensajeMock[])
        .map(mockToMensaje);
    }

    const response = await api.get(
      ENDPOINTS.MENSAJES_CHAT(chatId)
    );

    return response.data;

  }, 

  enviar: (chatId: string, contenido: string, tipo: EnviarMensajeBackend['tipo'] = 'TEXTO', nombreArchivo?: string, tamanoArchivo?: number, mimeType?: string) => {
    if (USE_MOCK_API) {
      const usuario = useAuthStore.getState().usuario;
      return mockMensajeService.enviar(
        Number(chatId),
        contenido,
        Number(usuario?.id ?? 0),
        usuario?.username ?? 'Usuario'
      );
    }

    console.log('ENVIAR PAYLOAD', {
      chatId,
      chatIdConvertido: Number(chatId),
      contenido,
      tipo,
      nombreArchivo,
      tamanoArchivo,
      mimeType,
    });

    return api.post(ENDPOINTS.MENSAJE_ENVIAR, {
      chatId: Number(chatId),
      contenido,
      tipo,
      nombreArchivo,
      tamanoArchivo,
      mimeType,
    });
  },

  marcarEntregado: (mensajeId: number) => {
    return api.post(ENDPOINTS.MENSAJE_ENTREGADO(mensajeId));
  },

  marcarLeido: (chatId: number) => {
    return api.post(ENDPOINTS.MENSAJE_LEIDO(chatId));
  },

  editar: (mensajeId: string, nuevoContenido: string) => {
    return api.put(ENDPOINTS.MENSAJE_EDITAR(mensajeId), {
      contenido: nuevoContenido,
    });
  },

  eliminarParaMi: (mensajeId: string | number) => {
    return api.put(
      ENDPOINTS.MENSAJE_ELIMINAR_PARA_MI(mensajeId)
    );
  },

  eliminarParaTodos: (mensajeId: string | number) => {
    return api.put(
      ENDPOINTS.MENSAJE_ELIMINAR_PARA_TODOS(mensajeId)
    );
  },

  reenviar: (mensajeId: string | number, chatId: string | number) => {
    return api.post(
      ENDPOINTS.MENSAJE_REENVIAR(mensajeId),
      {
        chatId,
      }
    );
  },
};
