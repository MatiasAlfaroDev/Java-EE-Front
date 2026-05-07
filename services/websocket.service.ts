import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL } from '@/constants/endpoints';

let stompClient: Client | null = null;
let globalHandler: ((tipo: string, payload: unknown) => void) | null = null;

// Suscripciones activas por canalId
const suscripciones: Record<string, StompSubscription> = {};

export const conectarWebSocket = (
  token: string,
  onEvento: (tipo: string, payload: unknown) => void
) => {
  globalHandler = onEvento;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    onConnect: () => {
      // Cola de notificaciones personales
      stompClient?.subscribe('/user/queue/notifications', frame => {
        const data = JSON.parse(frame.body);
        globalHandler?.('NOTIFICATION_NEW', data);
      });
      // Cola de mensajes personales (fallback / eventos del sistema)
      stompClient?.subscribe('/user/queue/messages', frame => {
        const data = JSON.parse(frame.body);
        globalHandler?.(data.type ?? 'MESSAGE_NEW', data);
      });
    },
    onStompError: frame => console.error('STOMP error', frame),
    onWebSocketClose: (event) => {
      if (event.code === 4001) globalHandler?.('WS_AUTH_ERROR', null);
      if (event.code === 4003) globalHandler?.('WS_SUSPENDED', null);
    },
  });
  stompClient.activate();
};

export const desconectarWebSocket = () => {
  // Cancelar todas las suscripciones de canal antes de desconectar
  Object.values(suscripciones).forEach(sub => {
    try { sub.unsubscribe(); } catch { /* ignorar */ }
  });
  Object.keys(suscripciones).forEach(k => delete suscripciones[k]);

  stompClient?.deactivate();
  stompClient = null;
  globalHandler = null;
};

/**
 * Suscribirse al topic de un canal específico.
 * El backend Jakarta EE publica en /topic/chat.{chatId}
 * El callback recibe el objeto de mensaje parseado.
 */
export const suscribirCanal = (
  chatId: string,
  onMensaje: (payload: unknown) => void
): void => {
  if (!stompClient?.connected) return;
  if (suscripciones[chatId]) return; // ya suscrito

  const sub = stompClient.subscribe(`/topic/chat.${chatId}`, frame => {
    const data = JSON.parse(frame.body);
    onMensaje(data);
  });
  suscripciones[chatId] = sub;
};

/**
 * Desuscribirse del topic de un canal específico.
 */
export const desuscribirCanal = (chatId: string): void => {
  if (suscripciones[chatId]) {
    try { suscripciones[chatId].unsubscribe(); } catch { /* ignorar */ }
    delete suscripciones[chatId];
  }
};

export const ws = {
  enviarMensaje:   (p: object) => stompClient?.publish({ destination: '/app/chat.message', body: JSON.stringify(p) }),
  confirmarRecibo: (p: object) => stompClient?.publish({ destination: '/app/chat.ack',     body: JSON.stringify(p) }),
  confirmarLeido:  (p: object) => stompClient?.publish({ destination: '/app/chat.read',    body: JSON.stringify(p) }),
  typing:          (p: object) => stompClient?.publish({ destination: '/app/chat.typing',  body: JSON.stringify(p) }),
};
