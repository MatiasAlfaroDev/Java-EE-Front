import { create } from 'zustand';
import { Canal } from '@/types/canal.types';
import { Mensaje, Reaccion } from '@/types/mensaje.types';

interface TypingState {
  [canalId: string]: string[];
}

interface ChatState {
  canales: Canal[];
  mensajes: Record<string, Mensaje[]>;
  typing: TypingState;
  canalActivo: string | null;

  setCanales: (canales: Canal[]) => void;
  setCanalActivo: (id: string | null) => void;
  setMensajes: (canalId: string, mensajes: Mensaje[]) => void;
  prependMensajes: (canalId: string, mensajes: Mensaje[]) => void;
  agregarMensaje: (mensaje: Mensaje) => void;
  editarMensaje: (actualizado: Partial<Mensaje> & { id: string }) => void;
  marcarEliminado: (id: string, deleted_at: string) => void;
  actualizarReacciones: (msgId: string, reacciones: Reaccion[]) => void;
  setTyping: (canalId: string, username: string, activo: boolean) => void;
  marcarLeidos: (canalId: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  canales: [],
  mensajes: {},
  typing: {},
  canalActivo: null,

  setCanales: (canales) => set({ canales }),

  setCanalActivo: (id) => set({ canalActivo: id }),

  setMensajes: (canalId, mensajes) =>
    set(s => ({ mensajes: { ...s.mensajes, [canalId]: mensajes } })),

  prependMensajes: (canalId, nuevos) =>
    set(s => ({
      mensajes: {
        ...s.mensajes,
        [canalId]: [...nuevos, ...(s.mensajes[canalId] ?? [])],
      },
    })),

  agregarMensaje: (mensaje) =>
    set(s => ({
      mensajes: {
        ...s.mensajes,
        [mensaje.channel_id]: [
          mensaje,
          ...(s.mensajes[mensaje.channel_id] ?? []),
        ],
      },
      canales: s.canales.map(c =>
        c.id === mensaje.channel_id
          ? { ...c, lastMsg: mensaje.content ?? '…', lastMsgTime: mensaje.sent_at }
          : c
      ),
    })),

  editarMensaje: (actualizado) =>
    set(s => {
      const lista = s.mensajes[actualizado.channel_id ?? ''] ?? [];
      return {
        mensajes: {
          ...s.mensajes,
          [actualizado.channel_id ?? '']: lista.map(m =>
            m.id === actualizado.id ? { ...m, ...actualizado } : m
          ),
        },
      };
    }),

  marcarEliminado: (id, deleted_at) =>
    set(s => {
      const updated: Record<string, Mensaje[]> = {};
      for (const [cid, lista] of Object.entries(s.mensajes)) {
        updated[cid] = lista.map(m => m.id === id ? { ...m, deleted_at } : m);
      }
      return { mensajes: updated };
    }),

  actualizarReacciones: (msgId, reacciones) =>
    set(s => {
      const updated: Record<string, Mensaje[]> = {};
      for (const [cid, lista] of Object.entries(s.mensajes)) {
        updated[cid] = lista.map(m => m.id === msgId ? { ...m, reacciones } : m);
      }
      return { mensajes: updated };
    }),

  setTyping: (canalId, username, activo) =>
    set(s => {
      const actuales = s.typing[canalId] ?? [];
      const siguientes = activo
        ? actuales.includes(username) ? actuales : [...actuales, username]
        : actuales.filter(u => u !== username);
      return { typing: { ...s.typing, [canalId]: siguientes } };
    }),

  marcarLeidos: (canalId) =>
    set(s => ({
      canales: s.canales.map(c => c.id === canalId ? { ...c, unread: 0 } : c),
    })),
}));
