import { useChatStore } from '@/store/chat.store';

// El backend no tiene GET mensajes ni WebSocket.
// Este hook expone los mensajes del store local (enviados en la sesión actual).
export const useChat = (chatId: string) => {
  const mensajes = useChatStore(s => s.mensajes[chatId] ?? []);
  return { mensajes };
};
