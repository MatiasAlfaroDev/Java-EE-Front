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
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { usuarioService } from '@/services/usuario.service';

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
     mensajeOrigenId:
      data.originalMessageId
        ? Number(data.originalMessageId)
        : 0,
  };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
  const eliminarMensajeParaTodos = useChatStore(s => s.eliminarMensajeParaTodos);
  const setTyping           = useChatStore(s => s.setTyping);
  const marcarMensajeEntregado =
    useChatStore(s => s.marcarMensajeEntregado);
  const marcarMensajeLeido =
    useChatStore(s => s.marcarMensajeLeido);

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
    async (payload) => {
    const data = (payload ?? {}) as Record<string, unknown>;

    console.log('WS EVENT', data);

    if (data.type === 'message_delivered') {
      console.log('WS DELIVERED', data);
      marcarMensajeEntregado(String(data.messageId));
      return;
    }

    if (data.type === 'message_read') {
      console.log('WS DELIVERED', data);
      marcarMensajeLeido(String(data.messageId));
      return;
    }

    if (data.type === 'message_edited') {
      console.log('WS EDITED', data);
      editarMensaje({
        id: String(data.messageId),
        contenido: String(data.contenido),
        editado: true,
      });
      return;
    }

    if (data.type === 'message_deleted') {

      eliminarMensajeParaTodos(
        String(data.chatId),
        String(data.messageId)
      );

      chatService.listar()
        .then(res => {

          const chats = res.data.map(c => ({
            id: String(c.id),
            nombre: c.nombre,
            tipo: c.tipo,
            initials: c.nombre.slice(0, 2).toUpperCase(),
            lastMsg: c.lastMsg ?? undefined,
            lastMsgTime: c.lastMsgTime ?? undefined,
            estado: c.estado ?? undefined,
            unread: c.unread ?? 0,
          }));

          useChatStore
            .getState()
            .setchats(chats);

        });

      return;
    }
    if (data.type === 'MESSAGE_REACTION') {
      actualizarReacciones(
        String(data.mensajeId),
        String(data.usuarioId),
        String(data.usuarioNombre),
        data.emoji ? String(data.emoji) : null
      );
        return;
      }

    const userId = useAuthStore.getState().usuario?.id;

    const mensaje = mapearMensajeWS(data);

    agregarMensaje(mensaje);

    if (data.chatId) {

      console.log(
        'REFRESH CHATS',
        data.chatId,
        data.id
      );

      chatService.listar()
        .then(res => {

          console.log(
            'CHATS RECIBIDOS',
            JSON.stringify(res.data, null, 2)
          );

          const chats = res.data.map(c => ({
            id: String(c.id),
            nombre: c.nombre,
            tipo: c.tipo,
            initials: c.nombre.slice(0, 2).toUpperCase(),
            lastMsg: c.lastMsg ?? undefined,
            lastMsgTime: c.lastMsgTime ?? undefined,
            estado: c.estado ?? undefined,
            unread: c.unread ?? 0,
          }));

          useChatStore
            .getState()
            .setchats(chats);

          console.log('CHATS ACTUALIZADOS');
        })
        .catch(console.error);
      }
   
    // SOLO mensajes de otros
    if (String(data.remitenteId) !== String(userId) && data.id) {
      mensajeService.marcarEntregado(Number(data.id));
    }
  },

      () => {

        console.log('WS reconectado');

      }

      
    );

  }, [isAutenticado, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

      useEffect(() => {

      Notifications.requestPermissionsAsync()
        .then(r => {
          console.log('PERMISOS NOTIF', r);
        })
        .catch(console.error);

    }, []);

    useEffect(() => {

      if (!isAutenticado || !accessToken) {
        return;
      }

      async function registrarPush() {

        const permisos =
          await Notifications.requestPermissionsAsync();

        if (permisos.status !== 'granted') {
          return;
        }

        try {

          const token =
            await Notifications.getExpoPushTokenAsync({
              projectId:
                Constants.expoConfig?.extra?.eas?.projectId,
            });

          console.log('TOKEN', token.data);

          await usuarioService.guardarPushToken(
            token.data
          );

          console.log('TOKEN GUARDADO');

        } catch (e) {

          console.log('ERROR TOKEN', e);

        }
      }

      registrarPush();

    }, [isAutenticado, accessToken]);


  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
