import { create } from 'zustand';
import { Chat } from '@/types/chat.types';
import { Mensaje } from '@/types/mensaje.types';
import { useAuthStore } from './auth.store';

interface TypingState {
  [chatId: string]: string[];
}

interface EditarMensajePayload {
  id: string;
  contenido: string;
  editado: boolean;
}

interface ChatState {
  chats: Chat[];
  mensajes: Record<string, Mensaje[]>;
  typing: TypingState;
  chatActivo: string | null;
  wsReconectado: number;
  
  notificarReconnect: () => void;

  setchats: (chats : Chat[]) => void;
  setchatActivo: (id: string | null) => void;
  renombrarChat: (chatId: string, nombre: string) => void;

  setMensajes: (chatId: string, mensajes: Mensaje[]) => void;

  editarMensaje: (data: EditarMensajePayload) => void;

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
    usuarioId: string,
    usuarioNombre: string,
    emoji: string | null
  ) => void;

  marcarMensajeEntregado: (mensajeId: string) => void;

  marcarMensajeLeido: (mensajeId: string) => void;
  eliminarMensajeParaMi: (chatId: string, mensajeId: string | number) => void;
  eliminarMensajeParaTodos: (chatId: string, mensajeId: string) => void;
}

const recalcularUltimoMensaje = (
  chats: Chat[],
  mensajes: Record<string, Mensaje[]>,
  chatId: string
): Chat[] => {

  const visibles = (mensajes[chatId] ?? [])
    .filter(m => !m.eliminado);

  const ultimo = visibles.at(-1);

  return chats.map(c =>
    String(c.id) === chatId
      ? {
          ...c,
          lastMsg: ultimo?.contenido ?? '',
          lastMsgTime: ultimo?.sent_at,
        }
      : c
  );
};

export const useChatStore = create<ChatState>()((set) => ({
  chats: [],
  mensajes: {},
  typing: {},
  chatActivo: null,
  wsReconectado: 0,

  notificarReconnect: () =>
    set((s) => ({ wsReconectado: s.wsReconectado + 1 })),

  setchats: (chats) => set({ chats }),

  setchatActivo: (id) => set({ chatActivo: id }),

  renombrarChat: (chatId, nombre) =>
    set(s => ({
      chats: s.chats.map(c =>
        String(c.id) === chatId
          ? { ...c, nombre, initials: nombre.slice(0, 2).toUpperCase() }
          : c
      ),
    })),

  setMensajes: (chatId, mensajes) =>
    set((s) => {
      const ordenados = [...mensajes]
        .filter((m) => m?.contenido?.trim().length > 0) // 🔴 evita mensajes vacíos
        .sort(
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
  if (!mensaje?.contenido || !mensaje.contenido.trim()) {
    return;
  }

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

    const miId = String(useAuthStore.getState().usuario?.id);

    const esMio = String(mensaje.sender_id) === miId;

    const chatsActualizados = existeChat
      ? s.chats.map((c) =>
          String(c.id) === chatId
            ? {
                ...c,
                lastMsg: mensaje.contenido,
                lastMsgTime: mensaje.sent_at,
                unread: esMio
                  ? c.unread
                  : (c.unread ?? 0) + 1,
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

    editarMensaje: (data) =>
      set((s) => {

        let chatIdEditado: string | null = null;

        const nuevosMensajes = Object.fromEntries(
          Object.entries(s.mensajes).map(([chatId, mensajes]) => {

            const existe = mensajes.some(
              m => String(m.id) === data.id
            );

            if (existe) {
              chatIdEditado = chatId;
            }

            return [
              chatId,
              mensajes.map((m) =>
                String(m.id) === data.id
                  ? {
                      ...m,
                      contenido: data.contenido,
                      editado: true
                    }
                  : m
              ),
            ];
          })
        );

        return {
          mensajes: nuevosMensajes,
          chats: chatIdEditado
            ? recalcularUltimoMensaje(
                s.chats,
                nuevosMensajes,
                chatIdEditado
              )
            : s.chats,
        };
      }),

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

  actualizarReacciones: (
  mensajeId: string,
  usuarioId: string,
  usuarioNombre: string,
  emoji: string | null
) =>
  set((state) => {
    const mensajes = state.mensajes ?? {};
    const nuevosMensajes = Object.fromEntries(
      Object.entries(mensajes).map(([chatId, lista]) => {
        const safeLista = Array.isArray(lista) ? lista : [];
        return [
          chatId,
          safeLista.map((m) => {
            if (String(m.id) !== String(mensajeId)) return m;
            const actuales = Array.isArray(m.reacciones)
              ? m.reacciones
              : [];
     // ❌ REMOVE reacción
            if (!emoji) {
              return {
                ...m,
                reacciones: actuales.filter(
                  (r) => String(r.usuarioId) !== String(usuarioId)
                ),
              };
            }

            // 🔁 REPLACE (1 reacción por usuario)
            const filtradas = actuales.filter(
              (r) => String(r.usuarioId) !== String(usuarioId)
            );

            return {
              ...m,
              reacciones: [
                ...filtradas,
                {
                  emoji,
                  usuarioId,
                  usuarioNombre,
                },
              ],
            };
          }),
        ];
      })
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

    marcarMensajeEntregado: (mensajeId) =>
    set((s) => {
      const nuevosMensajes = Object.fromEntries(
        Object.entries(s.mensajes).map(([chatId, mensajes]) => [
          chatId,
          mensajes.map((m) =>
            String(m.id) === mensajeId
              ? {
                  ...m,
                  entregado: true,
                }
              : m
          ),
        ])
      );

      return {
        mensajes: nuevosMensajes,
      };
    }),

  marcarMensajeLeido: (mensajeId) =>
  set((s) => {
    const nuevosMensajes = Object.fromEntries(
      Object.entries(s.mensajes).map(([chatId, mensajes]) => [
        chatId,
        mensajes.map((m) =>
          String(m.id) === mensajeId
            ? {
                ...m,
                leido: true,
                entregado: true,
              }
            : m
        ),
      ])
    );

    return {
      mensajes: nuevosMensajes,
    };
  }),

    eliminarMensajeParaMi: (chatId, mensajeId) =>
      set(state => {

        const nuevosMensajes = {
          ...state.mensajes,
          [chatId]:
            (state.mensajes[chatId] ?? [])
              .filter(m => String(m.id) !== String(mensajeId))
        };

        return {
          mensajes: nuevosMensajes,
          chats: recalcularUltimoMensaje(
            state.chats,
            nuevosMensajes,
            chatId
          )
        };
      }),

 /* eliminarMensajeParaTodos: (
    chatId: string,
    mensajeId: string | number
  ) =>
    set(state => ({
      mensajes: {
        ...state.mensajes,
        [chatId]:
          (state.mensajes[chatId] ?? []).map(m =>
            String(m.id) === String(mensajeId)
              ? { ...m, eliminado: true }
              : m
          )
      }
    })), */

    eliminarMensajeParaTodos: (
      chatId,
      mensajeId
    ) =>
      set(state => {

        const mensajesActualizados =
          (state.mensajes[chatId] ?? []).map(m =>
            String(m.id) === String(mensajeId)
              ? { ...m, eliminado: true }
              : m
          );

        const ultimoMensaje =
          mensajesActualizados[mensajesActualizados.length - 1];

        return {
          mensajes: {
            ...state.mensajes,
            [chatId]: mensajesActualizados,
          },

          chats: state.chats.map(c =>
            String(c.id) === String(chatId)
              ? {
                  ...c,
                  lastMsg:
                    ultimoMensaje?.eliminado
                      ? 'Mensaje eliminado'
                      : ultimoMensaje?.contenido,
                }
              : c
          ),
        };
      }),
}));