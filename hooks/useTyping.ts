import { useRef, useCallback } from 'react';
import { ws } from '@/services/websocket.service';

const DEBOUNCE_MS = 500;
const STOP_DELAY_MS = 2000;

export const useTyping = (canalId: string) => {
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping     = useRef(false);

  const iniciarTyping = useCallback(() => {
    if (!isTyping.current) {
      isTyping.current = true;
      ws.typing({ channel_id: canalId, activo: true });
    }
    if (stopRef.current) clearTimeout(stopRef.current);
    stopRef.current = setTimeout(() => {
      isTyping.current = false;
      ws.typing({ channel_id: canalId, activo: false });
    }, STOP_DELAY_MS);
  }, [canalId]);

  const onChangeText = useCallback((_: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(iniciarTyping, DEBOUNCE_MS);
  }, [iniciarTyping]);

  const detenerTyping = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (stopRef.current)    clearTimeout(stopRef.current);
    if (isTyping.current) {
      isTyping.current = false;
      ws.typing({ channel_id: canalId, activo: false });
    }
  }, [canalId]);

  return { onChangeText, detenerTyping };
};
