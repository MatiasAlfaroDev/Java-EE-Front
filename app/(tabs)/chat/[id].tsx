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
import { usuarioService } from '@/services/usuario.service';

import { MessageList } from '@/components/chat/MessageList';
import { InputComposer } from '@/components/chat/InputComposer';
import { Avatar } from '@/components/ui/Avatar';

import { Mensaje } from '@/types/mensaje.types';
import NetInfo from '@react-native-community/netinfo';
import { chatService } from '@/services/chat.service';
import { QUICK_EMOJIS } from '@/constants/emojis';
import { reaccionService } from '@/services/reaccion.service';

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

  const irAInfoGrupo = () => {
    console.log('[GrupoInfo] navegando → id:', id);
    router.push({
      pathname: '/(tabs)/grupo-info/[id]' as any,
      params: { id, nombre: nombre ?? chat?.nombre },
    });
  };

  

  const usuario = useAuthStore(s => s.usuario);

  const mensajes = useChatStore(s => s.mensajes[id] ?? []);

  const agregarMensaje = useChatStore(s => s.agregarMensaje);

  const actualizarEstadoMensaje = useChatStore(s => s.actualizarEstadoMensaje);

  const setchatActivo = useChatStore(s => s.setchatActivo);

  const setMensajes = useChatStore(s => s.setMensajes);

  const [enviando, setEnviando] = useState(false);
  const [estadoUsuario, setEstadoUsuario] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [editingMessage, setEditingMessage] = useState<Mensaje | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Mensaje | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reactionInfo, setReactionInfo] = useState<{emoji: string; usuarios: any[];} | null>(null);

  const abrirMenuMensaje = (mensaje: Mensaje) => { setSelectedMessage(mensaje); setMenuVisible(true);};
  const eliminado = selectedMessage?.eliminado;

 const reaccionar = async (emoji: string) => {
  if (!selectedMessage) return;

  try {

    await reaccionService.reaccionar(
      selectedMessage.id,
      emoji
    );

    setSelectedMessage(null);
    setMenuVisible(false);

  } catch (e) {

    console.log(
      'Error reaccionando',
      e
    );

  }
};

  useEffect(() => {

    if (!email) return;

    const cargarEstado = async () => {

      try {

        const res =
          await usuarioService.listar();

        const usuarioChat =
          res.data.find(
            u => u.email === email
          );

        if (usuarioChat) {

          setEstadoUsuario(
            usuarioChat.estado
          );
          
          console.log(
            'ESTADO USUARIO',
            estadoUsuario
          );


        }

      } catch (e) {

        console.log(
          'Error cargando estado',
          e
        );

      }

    };

    cargarEstado();

    const interval =
      setInterval(
        cargarEstado,
        5000
      );

    return () =>
      clearInterval(interval);

  }, [email]);


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

        useChatStore
          .getState()
          .marcarLeidos(id);
          
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
  
  async (
    contenido: string,
    tipo: 'TEXTO' | 'ARCHIVO' |'AUDIO' | 'IMAGEN' | 'VIDEO' = 'TEXTO',
    nombreArchivo?: string,
    tamanoArchivo?: number,
    mimeType?: string,
  ) => {
    if (!contenido.trim() || !usuario) return;
  console.log("ENVIAR CALL:", JSON.stringify(contenido));
    setEnviando(true);

    const tempId = `pending-${Date.now()}`;

    const optimista: Mensaje = {
      id: tempId,
      chatId: id,
      sender_id: usuario.id,
      sender_username: usuario.username,
      sender_initials: usuario.initials,
      contenido: contenido.trim(),
      tipo,
      sent_at: new Date().toISOString(),
      estado: 'PENDIENTE',
      iv: ' ',
      reacciones: [],
      mensajeOrigenId: undefined,
    };

    agregarMensaje(optimista); 

    try {
      await mensajeService.enviar(
        id,
        contenido.trim(),
        tipo,
        nombreArchivo,
        tamanoArchivo,
        mimeType
      );

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

        <TouchableOpacity
          style={s.headerCenter}
          onPress={irAInfoGrupo}
          activeOpacity={0.65}
        >
          <Avatar
            initials={nombre ? nombre.slice(0, 2).toUpperCase() : chat?.initials ?? '??'}
            online={chat?.estado === 'ONLINE'}
            size={32}
          />
          <View style={s.headerInfo}>
            <Text style={s.headerNombre}>{nombre ?? chat?.nombre ?? 'Chat'}</Text>
            <Text style={s.headerEstado}>
              {chat?.estado == null
                ? 'Grupo'
                : chat.estado === 'ONLINE'
                  ? 'En línea'
                  : 'Desconectado'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={s.headerIcon}>
          <Ionicons name="call-outline" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.headerIcon}>
          <Ionicons name="videocam-outline" size={20} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.headerIcon} onPress={irAInfoGrupo}>
          <Ionicons name="people-outline" size={20} color={theme.accent} />
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
  onReactionPress={(emoji, usuarios) =>
    setReactionInfo({
      emoji,
      usuarios,
    })
  }
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
          onSendAdjunto={async (archivo) => {
  try {
    const tipo =
      archivo.mimeType.startsWith('audio')
        ? 'AUDIO'
        : 'ARCHIVO';

    await enviar(
      archivo.urlArchivo,
      tipo,
      archivo.nombreArchivo,
      archivo.tamanoArchivo,
      archivo.mimeType
    );
  } catch (e) {
    console.log("Error enviando adjunto", e);
  }
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
            <View style={s.emojiBar}>
          {QUICK_EMOJIS.map((emoji) => (
       <TouchableOpacity
          key={emoji}
          style={s.emojiButton}
          onPress={() => reaccionar(emoji)}
        >
        <Text style={s.emojiText}>
          {emoji}
        </Text>
      </TouchableOpacity>
        ))}
      </View>
            <View style={s.menuBox}>
          {String(selectedMessage.sender_id) === String(usuario?.id) &&
            !selectedMessage.eliminado &&
            selectedMessage.tipo === "TEXTO" && (
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
                onPress={async () => {
                  try {
                    await mensajeService.eliminarParaMi(
                      selectedMessage.id
                    );
                    useChatStore.getState().eliminarMensajeParaMi(
                      id,
                      selectedMessage.id
                    );
                  } catch (e) {

                    console.log(
                      'Error eliminando mensaje',
                      e
                    );

                  }

                  setSelectedMessage(null);
                  setMenuVisible(false);
                }}
              >
                <Text>Eliminar para mí</Text>
              </TouchableOpacity>

              {String(selectedMessage.sender_id) === String(usuario?.id) && (
                <TouchableOpacity
                  style={s.menuItem}
                  onPress={async () => {
                    try {
                      await mensajeService.eliminarParaTodos(selectedMessage.id);

                      useChatStore.getState().eliminarMensajeParaTodos(
                        id,
                        selectedMessage.id
                      );
                    } catch (e) {
                      console.log('Error eliminando para todos', e);
                    }

                    setSelectedMessage(null);
                    setMenuVisible(false);
                  }}
                >
                  <Text>Eliminar para todos</Text>
                </TouchableOpacity>
              )}

              {String(selectedMessage.sender_id) === String(usuario?.id) && !selectedMessage.eliminado && (
                 <TouchableOpacity
                    style={s.menuItem}
                    onPress={async () => {
                      router.push({
                        pathname: '/(tabs)/seleccionar-chat',
                        params: {
                          mensajeId: String(selectedMessage.id),
                        },
                      });
                      setSelectedMessage(null);
                      setMenuVisible(false);
                    }}
                  >
                    <Text>Reenviar</Text>
                  </TouchableOpacity>
              )}

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
      {reactionInfo && (
  <TouchableOpacity
    activeOpacity={1}
    style={s.menuOverlay}
    onPress={() => setReactionInfo(null)}
  >
    <TouchableOpacity
      activeOpacity={1}
      style={s.reactionModal}
    >
      <Text style={s.reactionTitle}>
        {reactionInfo.emoji} {reactionInfo.usuarios.length}
      </Text>

      {reactionInfo.usuarios.map((u: any) => (
        <View
          key={u.usuarioId}
          style={s.reactionUser}
        >
          <Text>
            {u.usuarioNombre}
          </Text>
        </View>
      ))}
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

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

emojiBar: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  borderRadius: 24,
  paddingHorizontal: 8,
  paddingVertical: 6,
  marginBottom: 12,
  alignSelf: 'center',
},

emojiButton: {
  paddingHorizontal: 6,
  paddingVertical: 4,
},

emojiText: {
  fontSize: 28,
},

reactionModal: {
  width: 280,
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
},

reactionTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 12,
},

reactionUser: {
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

});