import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { CrearchatRequest } from '@/types/chat.types';

export interface chatBackend {
  id:          number;
  nombre:      string;
  tipo?:       'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
  lastMsg?:    string | null;
  lastMsgTime?: string | null;
  unread?: number;
  miembros?:   number;
}

export const chatService = {
  listar: () =>
    api.get<chatBackend[]>(ENDPOINTS.CHATS),

  eliminar: (chatId: string) =>
    api.delete(`${ENDPOINTS.CHATS}/${chatId}`),

  crear: (data: CrearchatRequest) => 
    api.post<chatBackend>(ENDPOINTS.CHATS, {
      nombre:   data.nombre,
      tipo:     data.tipo,
      usuarios: (data.miembros ?? []).map(Number),
    }),
  

  agregarMiembro: (chatId: string, usuarioId: string) =>
   api.post(ENDPOINTS.AGREGAR_MIEMBRO, {
          chatId:    Number(chatId),
          usuarioId: Number(usuarioId),
        }
      ),

  eliminarMiembro: (chatId: string, usuarioId: string) =>
    api.post(ENDPOINTS.ELIMINAR_MIEMBRO, {
          chatId:    Number(chatId),
          usuarioId: Number(usuarioId),
        }
      ),
};
