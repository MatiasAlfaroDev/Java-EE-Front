import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL } from '@/constants/endpoints';

let stompClient: Client | null = null;

export const conectarWebSocket = (
  token: string,
  onEvento: (tipo: string, payload: unknown) => void
) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws-chat`),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    onConnect: () => {
      stompClient?.subscribe('/user/queue/messages', frame => {
        const data = JSON.parse(frame.body);
        onEvento(data.type, data);
      });
      stompClient?.subscribe('/user/queue/notifications', frame => {
        const data = JSON.parse(frame.body);
        onEvento('NOTIFICATION_NEW', data);
      });
    },
    onStompError: frame => console.error('STOMP error', frame),
    onWebSocketClose: (event) => {
      if (event.code === 4001) onEvento('WS_AUTH_ERROR', null);
      if (event.code === 4003) onEvento('WS_SUSPENDED', null);
    },
  });
  stompClient.activate();
};

export const desconectarWebSocket = () => {
  stompClient?.deactivate();
  stompClient = null;
};

export const ws = {
  enviarMensaje:   (p: object) => stompClient?.publish({ destination: '/app/chat.message', body: JSON.stringify(p) }),
  confirmarRecibo: (p: object) => stompClient?.publish({ destination: '/app/chat.ack',     body: JSON.stringify(p) }),
  confirmarLeido:  (p: object) => stompClient?.publish({ destination: '/app/chat.read',    body: JSON.stringify(p) }),
  typing:          (p: object) => stompClient?.publish({ destination: '/app/chat.typing',  body: JSON.stringify(p) }),
};
