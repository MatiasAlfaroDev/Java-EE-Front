import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { CrearchatRequest } from '@/types/chat.types';
import { USE_MOCK_API } from '@/constants/dev';
import { mockchatService } from './mockApi';
import { useAuthStore } from '@/store/auth.store';

export interface chatBackend {
  id:          number;
  nombre:      string;
  tipo?:       'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
  lastMsg?:    string | null;
  lastMsgTime?: string | null;
  miembros?:   number;
}

export const chatService = {
  listar: () => {
    if (USE_MOCK_API) {
      const usuario = useAuthStore.getState().usuario;
      return mockchatService.listar(Number(usuario?.id ?? 0));
    }
    return api.get<chatBackend[]>(ENDPOINTS.CHATS);
  },

  eliminar: (chatId: string) =>
  USE_MOCK_API
    ? mockchatService.eliminar(Number(chatId))
    : api.delete(`${ENDPOINTS.CHATS}/${chatId}`),

  crear: (data: CrearchatRequest) => {
    if (USE_MOCK_API) {
      return mockchatService.crear(
        data.nombre,
        (data.tipo as 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO') ?? 'GRUPO',
        (data.miembros ?? []).map(Number)
      );
    }
    return api.post<chatBackend>(ENDPOINTS.CHATS, {
      nombre:   data.nombre,
      tipo:     data.tipo,
      miembros: (data.miembros ?? []).map(Number),
    });
  },

  agregarMiembro: (chatId: string, usuarioId: string) =>
    USE_MOCK_API
      ? mockchatService.agregarMiembro(Number(chatId), Number(usuarioId))
      : api.post(ENDPOINTS.AGREGAR_MIEMBRO, {
          chatId:    Number(chatId),
          usuarioId: Number(usuarioId),
        }),

  eliminarMiembro: (chatId: string, usuarioId: string) =>
    USE_MOCK_API
      ? mockchatService.eliminarMiembro(Number(chatId), Number(usuarioId))
      : api.post(ENDPOINTS.ELIMINAR_MIEMBRO, {
          chatId:    Number(chatId),
          usuarioId: Number(usuarioId),
        }),
};
