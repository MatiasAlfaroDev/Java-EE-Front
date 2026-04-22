import { useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/chat.store';
import { useNotifStore } from '@/store/notif.store';
import { useAuthStore } from '@/store/auth.store';
import { mensajeService } from '@/services/mensaje.service';
import { cryptoService } from '@/services/crypto.service';
import { conectarWebSocket, desconectarWebSocket, ws } from '@/services/websocket.service';
import { Mensaje } from '@/types/mensaje.types';

export const useChat = (canalId: string, claveCanal?: CryptoKey) => {
  const accessToken = useAuthStore(s => s.accessToken);
  const {
    mensajes,
    agregarMensaje,
    editarMensaje,
    marcarEliminado,
    actualizarReacciones,
    setTyping,
    setMensajes,
    prependMensajes,
    setCanalActivo,
    marcarLeidos,
  } = useChatStore();
  const { agregar: agregarNotif } = useNotifStore();

  const descifrar = useCallback(async (msg: Mensaje): Promise<Mensaje> => {
    if (!claveCanal || !msg.content_enc) return msg;
    try {
      const content = await cryptoService.descifrarMensaje(msg.content_enc, msg.iv, claveCanal);
      return { ...msg, content };
    } catch {
      return msg;
    }
  }, [claveCanal]);

  const cargarMensajes = useCallback(async (before?: string) => {
    const res = await mensajeService.listar(canalId, { before });
    const descifrados = await Promise.all(res.data.data.map(descifrar));
    if (before) {
      prependMensajes(canalId, descifrados);
    } else {
      setMensajes(canalId, descifrados);
    }
    return res.data;
  }, [canalId, descifrar, setMensajes, prependMensajes]);

  useEffect(() => {
    if (!accessToken) return;
    setCanalActivo(canalId);
    cargarMensajes();
    marcarLeidos(canalId);

    const manejarEvento = async (tipo: string, payload: unknown) => {
      const data = payload as Record<string, unknown>;
      switch (tipo) {
        case 'MESSAGE_NEW': {
          const msg = await descifrar(data as unknown as Mensaje);
          agregarMensaje(msg);
          if (msg.channel_id === canalId) ws.confirmarRecibo({ message_id: msg.id });
          break;
        }
        case 'MESSAGE_EDITED':
        case 'MESSAGE_DELIVERED':
        case 'MESSAGE_READ':
          editarMensaje(data as Partial<Mensaje> & { id: string });
          break;
        case 'MESSAGE_DELETED':
          marcarEliminado(data.id as string, data.deleted_at as string);
          break;
        case 'REACTION_UPDATED':
          actualizarReacciones(data.message_id as string, data.reacciones as Mensaje['reacciones']);
          break;
        case 'TYPING':
          setTyping(data.channel_id as string, data.username as string, data.activo as boolean);
          break;
        case 'NOTIFICATION_NEW':
          agregarNotif(data as unknown as Parameters<typeof agregarNotif>[0]);
          break;
      }
    };

    conectarWebSocket(accessToken, manejarEvento);
    return () => {
      desconectarWebSocket();
      setCanalActivo(null);
    };
  }, [canalId, accessToken]);

  return {
    mensajes: mensajes[canalId] ?? [],
    cargarMensajes,
  };
};
