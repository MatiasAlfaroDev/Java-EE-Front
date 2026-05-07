import { create } from 'zustand';
import { Canal } from '@/types/canal.types';
import { Mensaje } from '@/types/mensaje.types';

interface TypingState {
  [canalId: string]: string[];
}

interface ChatState {
  canales:      Canal[];
  mensajes:     Record<string, Mensaje[]>;
  typing:       TypingState;
  canalActivo:  string | null;

  setCanales:     (canales: Canal[]) => void;
  setCanalActivo: (id: string | null) => void;
  setMensajes:    (canalId: string, mensajes: Mensaje[]) => void;
  agregarMensaje: (mensaje: Mensaje) => void;
  setTyping:      (canalId: string, username: string, activo: boolean) => void;
  marcarLeidos:   (canalId: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  canales:     [],
  mensajes:    {},
  typing:      {},
  canalActivo: null,

  setCanales: (canales) => set({ canales }),

  setCanalActivo: (id) => set({ canalActivo: id }),

  setMensajes: (canalId, mensajes) =>
    set(s => ({ mensajes: { ...s.mensajes, [canalId]: mensajes } })),

  agregarMensaje: (mensaje) => {
    const key = String(mensaje.chatId);
    set(s => ({
      mensajes: {
        ...s.mensajes,
        [key]: [mensaje, ...(s.mensajes[key] ?? [])],
      },
      canales: s.canales.map(c =>
        c.id === mensaje.chatId
          ? { ...c, lastMsg: mensaje.contenido }
          : c
      ),
    }));
  },

  setTyping: (canalId, username, activo) =>
    set(s => {
      const actuales  = s.typing[canalId] ?? [];
      const siguientes = activo
        ? actuales.includes(username) ? actuales : [...actuales, username]
        : actuales.filter(u => u !== username);
      return { typing: { ...s.typing, [canalId]: siguientes } };
    }),

  marcarLeidos: (canalId) =>
    set(s => ({
      canales: s.canales.map(c => c.id === Number(canalId) ? { ...c, unread: 0 } : c),
    })),
}));
