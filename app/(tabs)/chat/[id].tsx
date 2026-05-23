import { useState, useEffect, useCallback } from 'react';
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

  const marcarLeidos = useChatStore(s => s.marcarLeidos);

  const setMensajes = useChatStore(s => s.setMensajes);

  const [enviando, setEnviando] = useState(false);

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
  useEffect(() => {
    mensajeService
      .listar(id)
      .then(lista => {
        if (lista.length > 0) {

          const actuales =
            useChatStore.getState().mensajes[id] ?? [];

          if (actuales.length === 0) {
            setMensajes(id, lista);
          }
        }
      })
      .catch(() => {});
  }, [id]);

  // WEBSOCKET
  useEffect(() => {

    setchatActivo(id);

    marcarLeidos(id);

    return () => {
      setchatActivo(null);
    };

  }, [id]);

  // ENVIAR MENSAJE
  const enviar = useCallback(
    async (texto: string) => {

      if (!texto.trim() || !usuario) return;

      setEnviando(true);

      try {

        await mensajeService.enviar(
          id,
          texto.trim()
        );

      } catch (e) {

        console.error(
          'Error al enviar mensaje:',
          e
        );

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
            {email ?? 'Desconectado'}
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
        />

        <InputComposer
          chatId={id}
          onSend={enviar}
          onChangeText={() => {}}
        />
      </KeyboardAvoidingView>
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
});