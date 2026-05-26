import { create } from 'zustand';
import { Chat } from '@/types/chat.types';
import { Mensaje } from '@/types/mensaje.types';

interface TypingState {
  [chatId: string]: string[];
}

interface EditarMensajePayload {
  id: string;
  channel_id: string;
  contenido: string;
  edited_at: string;
}

interface ChatState {
  chats: Chat[];
  mensajes: Record<string, Mensaje[]>;
  typing: TypingState;
  chatActivo: string | null;

  setchats: (chats : Chat[]) => void;
  setchatActivo: (id: string | null) => void;

  setMensajes: (chatId: string, mensajes: Mensaje[]) => void;

  editarMensaje: (payload: EditarMensajePayload) => void;

  agregarMensaje: (mensaje: Mensaje) => void;

  actualizarEstadoMensaje: (
    chatId: string,
    mensajeId: string,
    estado: 'PENDIENTE' | 'ENVIADO' | 'RECHAZADO'
  ) => void;

  setTyping: (
    chatId: string,
    username: string,
    activo: boolean
  ) => void;

  marcarLeidos: (chatId: string) => void;

  marcarEliminado: (
    mensajeId: string,
    deletedAt: string
  ) => void;

  actualizarReacciones: (
    mensajeId: string,
    reacciones: Mensaje['reacciones']
  ) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  chats: [],
  mensajes: {},
  typing: {},
  chatActivo: null,

  setchats: (chats) => set({ chats }),

  setchatActivo: (id) => set({ chatActivo: id }),

  setMensajes: (chatId, mensajes) =>
  set((s) => {
    const ordenados = [...mensajes].sort(
      (a, b) =>
        new Date(a.sent_at).getTime() -
        new Date(b.sent_at).getTime()
    );

    return {
      mensajes: {
        ...s.mensajes,
        [chatId]: ordenados,
      },
    };
  }),

  agregarMensaje: (mensaje) => {
  const chatId = String(mensaje.chatId);

  set((s) => {
    const mensajesChat = s.mensajes[chatId] ?? [];

    // 🔥 DEDUPE REAL (ID + fallback por contenido/tiempo)
    const yaExiste = mensajesChat.some((m) => {
      if (String(m.id) === String(mensaje.id)) return true;

      return (
        m.contenido === mensaje.contenido &&
        m.sender_id === mensaje.sender_id &&
        Math.abs(
          new Date(m.sent_at).getTime() -
          new Date(mensaje.sent_at).getTime()
        ) < 1500
      );
    });

    if (yaExiste) {
      return s;
    }

    const existeChat = s.chats.some(
      (c) => String(c.id) === chatId
    );

    const chatsActualizados = existeChat
      ? s.chats.map((c) =>
          String(c.id) === chatId
            ? {
                ...c,
                lastMsg: mensaje.contenido,
                lastMsgTime: mensaje.sent_at,
              }
            : c
        )
      : [
          {
            id: chatId,
            nombre: mensaje.sender_username,
            initials: mensaje.sender_initials,
            lastMsg: mensaje.contenido,
            lastMsgTime: mensaje.sent_at,
            unread: 1,
            tipo: 'INDIVIDUAL',
          } as Chat,
          ...s.chats,
        ];

    return {
      mensajes: {
        ...s.mensajes,
        [chatId]: [...mensajesChat, mensaje],
      },
      chats: chatsActualizados,
    };
  });
},

    actualizarEstadoMensaje: (
    chatId,
    mensajeId,
    estado
  ) =>
    set((s) => ({
      mensajes: {
        ...s.mensajes,

        [chatId]: (s.mensajes[chatId] ?? []).map((m) =>
          String(m.id) === mensajeId
            ? {
                ...m,
                estado,
              }
            : m
        ),
      },
    })),

  editarMensaje: ({
    id,
    channel_id,
    contenido,
    edited_at,
  }) =>
    set((s) => ({
      mensajes: {
        ...s.mensajes,

        [channel_id]: (s.mensajes[channel_id] ?? []).map((m) =>
          String(m.id) === id
            ? {
                ...m,
                contenido: contenido,
                edited_at,
              }
            : m
        ),
      },
    })),

  marcarEliminado: (mensajeId, deletedAt) =>
    set((s) => {
      const nuevosMensajes = Object.fromEntries(
        Object.entries(s.mensajes).map(([chatId, mensajes]) => [
          chatId,

          mensajes.map((m) =>
            String(m.id) === mensajeId
              ? {
                  ...m,
                  deleted_at: deletedAt,
                  eliminado: true,
                }
              : m
          ),
        ])
      );

      return {
        mensajes: nuevosMensajes,
      };
    }),

  actualizarReacciones: (mensajeId, reacciones) =>
    set((s) => {
      const nuevosMensajes = Object.fromEntries(
        Object.entries(s.mensajes).map(([chatId, mensajes]) => [
          chatId,

          mensajes.map((m) =>
            String(m.id) === mensajeId
              ? {
                  ...m,
                  reacciones,
                }
              : m
          ),
        ])
      );

      return {
        mensajes: nuevosMensajes,
      };
    }),

  setTyping: (chatId, username, activo) =>
    set((s) => {
      const actuales = s.typing[chatId] ?? [];

      const siguientes = activo
        ? actuales.includes(username)
          ? actuales
          : [...actuales, username]
        : actuales.filter((u) => u !== username);

      return {
        typing: {
          ...s.typing,
          [chatId]: siguientes,
        },
      };
    }),

  marcarLeidos: (chatId) =>
    set((s) => ({
      chats: s.chats.map((c) =>
        String(c.id) === chatId
          ? {
              ...c,
              unread: 0,
            }
          : c
      ),
    })),
}));