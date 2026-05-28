import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { conectarWebSocket, desconectarWebSocket } from '@/services/websocket.service';
import { USE_MOCK_API } from '@/constants/dev'; 
import { Mensaje, Reaccion } from '@/types/mensaje.types';
import { mensajeService } from '@/services/mensaje.service';
import { chatService } from '@/services/chat.service';

SplashScreen.preventAutoHideAsync();

/**
 * Convierte el payload del evento WebSocket del backend al tipo Mensaje del store.
 * El backend Jakarta EE envía: { id, chatId, contenido, remitente, remitenteId, tipo, timestamp }
 */
function mapearMensajeWS(data: Record<string, unknown>): Mensaje {
  return {
    id:              String(data.id ?? `ws-${Date.now()}`),
    sender_id:       String(data.remitenteId    ?? data.sender_id       ?? ''),
    sender_username: String(data.remitente      ?? data.sender_username ?? ''),
    sender_initials: String(data.remitente      ?? '').slice(0, 2).toUpperCase(),
    chatId:      String(data.chatId         ?? data.channel_id      ?? ''),
    contenido:         String(data.contenido      ?? data.content         ?? ''),
    iv:              '',
    sent_at:         String(data.timestamp      ?? data.sent_at         ?? new Date().toISOString()),
    estado:          'ENVIADO',
    reacciones:      [],
  };
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_400Regular,
  });

  const isAutenticado = useAuthStore(s => s.isAutenticado);
  const accessToken   = useAuthStore(s => s.accessToken);
  const agregarMensaje      = useChatStore(s => s.agregarMensaje);
  const editarMensaje       = useChatStore(s => s.editarMensaje);
  const marcarEliminado     = useChatStore(s => s.marcarEliminado);
  const actualizarReacciones = useChatStore(s => s.actualizarReacciones);
  const setTyping           = useChatStore(s => s.setTyping);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Conectar/desconectar WebSocket según estado de autenticación
  useEffect(() => {

    if (!isAutenticado || !accessToken || USE_MOCK_API) {

      desconectarWebSocket();

      return;
    }

    conectarWebSocket(

      accessToken,
       (payload) => {

        const data =
          (payload ?? {}) as Record<string, unknown>;

        agregarMensaje(
          mapearMensajeWS(data)
        );

        const chatActivo =
          useChatStore
            .getState()
            .chatActivo;

        if (
          chatActivo ===
          String(data.chatId)
        ) {

          mensajeService
            .marcarComoLeido(
              String(data.chatId)
            );
        } 
      },

      () => {

        console.log('WS reconectado');

      }

    );

   /* return () => {
      desconectarWebSocket();
    }; */

  }, [isAutenticado, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
