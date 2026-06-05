import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';

import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';

import { mensajeService } from '@/services/mensaje.service';

import { MessageList } from '@/components/chat/MessageList';
import { InputComposer } from '@/components/chat/InputComposer';
import { Avatar } from '@/components/ui/Avatar';

import { Mensaje } from '@/types/mensaje.types';
import NetInfo from '@react-native-community/netinfo';
import { chatService } from '@/services/chat.service';

export default function ChatScreen() {
  const {
    id,
    nombre,
    email,
  } = useLocalSearchParams<{
    id: string;
    nombre?: string;
    email?: string;
  }>();

  const chat = useChatStore(s =>
    s.chats.find(c => String(c.id) === id),
  );

  const usuario = useAuthStore(s => s.usuario);

  const mensajes = useChatStore(s => s.mensajes[id] ?? []);

  const agregarMensaje = useChatStore(s => s.agregarMensaje);

  const actualizarEstadoMensaje = useChatStore(s => s.actualizarEstadoMensaje);

  const setchatActivo = useChatStore(s => s.setchatActivo);

  const setMensajes = useChatStore(s => s.setMensajes);

  const [enviando, setEnviando] = useState(false);

  const [editingMessage, setEditingMessage] = useState<Mensaje | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Mensaje | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const abrirMenuMensaje = (mensaje: Mensaje) => { setSelectedMessage(mensaje); setMenuVisible(true);};

  // BACK ANDROID
  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.replace('/(tabs)');
        return true;
      },
    );

    return () => sub.remove();
  }, []);

  // CARGAR MENSAJES
  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
        try {
          const lista = await mensajeService.listar(id);

          console.log(
            'MENSAJES BACK:',
            JSON.stringify(lista, null, 2)
          );

          setMensajes(id, lista);
        } catch (e) {
          console.log(e);
        }
      };

      cargar();
    }, [id])
  );

  // WEBSOCKET

useFocusEffect(
  useCallback(() => {
    if (!id || !usuario) return;

    const marcar = async () => {
      try {
        await mensajeService.marcarLeido(Number(id));
      } catch (e) {
        console.log('error marcando leido', e);
      }
    };

    marcar();
  }, [id, usuario])
);

  useEffect(() => {

    const unsubscribe =
      NetInfo.addEventListener(
        async state => {

          if (state.isConnected) {

            const mensajes =
              useChatStore
                .getState()
                .mensajes;

            for (const chatId in mensajes) {

              for (const mensaje of mensajes[chatId]) {

                if (
                  mensaje.estado === 'RECHAZADO'
                ) {

                  try {

                    await mensajeService.enviar(
                      chatId,
                      mensaje.contenido
                    );

                    actualizarEstadoMensaje(
                      chatId,
                      mensaje.id,
                      'ENVIADO'
                    );

                    const chatActivo = useChatStore.getState().chatActivo;

                  if (chatActivo === chatId) {
                    const lista = await mensajeService.listar(chatId);
                    useChatStore.getState().setMensajes(chatId, lista);
                  }

                  } catch (e) {

                    console.log(
                      'Sigue sin conexión'
                    );

                  }

                }

              }

            }

          }

        }
      );

    return unsubscribe;

  }, []);

  // ENVIAR MENSAJE
const enviar = useCallback(
  
  async (texto: string) => {
    if (!texto.trim() || !usuario) return;
  console.log("ENVIAR CALL:", JSON.stringify(texto));
    setEnviando(true);

    const tempId = `pending-${Date.now()}`;

    const optimista: Mensaje = {
      id: tempId,
      chatId: id,
      sender_id: usuario.id,
      sender_username: usuario.username,
      sender_initials: usuario.initials,
      contenido: texto.trim(),
      sent_at: new Date().toISOString(),
      estado: 'PENDIENTE',
      iv: ' ',
      reacciones: [],
    };

    agregarMensaje(optimista); 

    try {
      await mensajeService.enviar(id, texto.trim());

// Recargar mensajes desde backend
      const lista = await mensajeService.listar(id);
      setMensajes(id, lista);

    } catch (e) {
      actualizarEstadoMensaje(id, tempId, 'RECHAZADO'); 

      console.error('Error al enviar mensaje:', e);
    } finally {
      setEnviando(false);
    }
  },
  [id, usuario],
);

  return (
    <View style={s.root}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={s.backBtn}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={theme.text}
          />
        </TouchableOpacity>

        <Avatar
          initials={
            nombre
              ? nombre.slice(0, 2).toUpperCase()
              : chat?.initials ?? '??'
          }
          online={chat?.online}
          size={32}
        />

        <View style={s.headerInfo}>
          <Text style={s.headerNombre}>
            {nombre ?? chat?.nombre ?? 'Chat'}
          </Text>

          <Text style={s.headerEstado}>
            {chat?.online ? 'En línea' : 'Desconectado'}
          </Text>
        </View>

        <TouchableOpacity style={s.headerIcon}>
          <Ionicons
            name="call-outline"
            size={20}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity style={s.headerIcon}>
          <Ionicons
            name="videocam-outline"
            size={20}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity style={s.headerIcon}>
          <Ionicons
            name="ellipsis-vertical-outline"
            size={20}
            color={theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* CHAT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <MessageList
          mensajes={mensajes}
          usuarioId={usuario?.id ?? ''}
          onEndReached={() => {}}
          chatId={id}
          onLongPressMessage={abrirMenuMensaje}
        />

        <InputComposer
          chatId={id}
          onSend={async (texto) => {
            if (editingMessage) {

              if (String(editingMessage.id).startsWith('pending-')) {
                console.log('No se puede editar un mensaje pendiente');
                setEditingMessage(null);
                return;
              }

              try {
                await mensajeService.editar(editingMessage.id, texto);

                useChatStore.getState().editarMensaje({
                  id: editingMessage.id,
                  contenido: texto,
                  editado: true,
                });

                setEditingMessage(null);

              } catch (e) {
                console.log('Error editando mensaje', e);
              }

              return;
            }

            enviar(texto);
          }}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </KeyboardAvoidingView>
      {menuVisible && selectedMessage && (
        <TouchableOpacity
          activeOpacity={1}
          style={s.menuOverlay}
          onPress={() => {
            setSelectedMessage(null);
            setMenuVisible(false);
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={s.menuBox}>

              {String(selectedMessage.sender_id) === String(usuario?.id) && (
                <TouchableOpacity
                  style={s.menuItem}
                  onPress={() => {
                    setEditingMessage(selectedMessage);
                    setSelectedMessage(null);
                    setMenuVisible(false);
                  }}
                >
                  <Text>Editar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={s.menuItem}
                onPress={() => {
                  console.log('Eliminar para mí');
                  setSelectedMessage(null);
                  setMenuVisible(false);
                }}
              >
                <Text>Eliminar para mí</Text>
              </TouchableOpacity>

              {String(selectedMessage.sender_id) === String(usuario?.id) && (
                <TouchableOpacity
                  style={s.menuItem}
                  onPress={() => {
                    console.log('Eliminar para todos');
                    setSelectedMessage(null);
                    setMenuVisible(false);
                  }}
                >
                  <Text>Eliminar para todos</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={s.menuItem}
                onPress={() => {
                  console.log('Reenviar');
                  setSelectedMessage(null);
                  setMenuVisible(false);
                }}
              >
                <Text>Reenviar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.menuItem}
                onPress={() => {
                  setSelectedMessage(null);
                  setMenuVisible(false);
                }}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.panelBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 8,
  },

  backBtn: {
    padding: 4,
  },

  headerInfo: {
    flex: 1,
  },

  headerNombre: {
    ...typography.title,
    color: theme.text,
  },

  headerEstado: {
    ...typography.caption,
    color: theme.textMuted,
  },

  headerIcon: {
    padding: 4,
  },

  menuOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},

menuBox: {
  width: 260,
  backgroundColor: "#2d24dd",
  overflow: 'hidden',
},

menuItem: {
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: theme.border,
},
});