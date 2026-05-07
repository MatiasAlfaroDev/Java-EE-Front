import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { mensajeService } from '@/services/mensaje.service';
import { suscribirCanal, desuscribirCanal } from '@/services/websocket.service';
import { MessageList } from '@/components/chat/MessageList';
import { InputComposer } from '@/components/chat/InputComposer';
import { Avatar } from '@/components/ui/Avatar';
import { Mensaje } from '@/types/mensaje.types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const canal   = useChatStore(s => s.canales.find(c => String(c.id) === id));
  const usuario = useAuthStore(s => s.usuario);

  const mensajes        = useChatStore(s => s.mensajes[id] ?? []);
  const agregarMensaje  = useChatStore(s => s.agregarMensaje);
  const setCanalActivo  = useChatStore(s => s.setCanalActivo);
  const marcarLeidos    = useChatStore(s => s.marcarLeidos);

  const [enviando, setEnviando] = useState(false);
  const setMensajes = useChatStore(s => s.setMensajes);

  // Cargar historial de mensajes al abrir el canal (mock devuelve datos; real no tiene GET)
  useEffect(() => {
    mensajeService.listar(id).then(lista => {
      if (lista.length > 0) setMensajes(id, lista);
    }).catch(() => {/* sin historial disponible */});
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Registrar canal activo y suscribirse al topic WebSocket
  useEffect(() => {
    setCanalActivo(id);
    marcarLeidos(id);

    suscribirCanal(id, (payload) => {
      const data = payload as Record<string, unknown>;
      const mensaje: Mensaje = {
        id:              String(data.id ?? `ws-${Date.now()}`),
        sender_id:       String(data.remitenteId   ?? data.sender_id       ?? ''),
        sender_username: String(data.remitente     ?? data.sender_username ?? ''),
        sender_initials: String(data.remitente     ?? '').slice(0, 2).toUpperCase(),
        channel_id:      id,
        content_enc:     '',
        iv:              '',
        content:         String(data.contenido     ?? data.content         ?? ''),
        sent_at:         String(data.timestamp     ?? data.sent_at         ?? new Date().toISOString()),
        estado:          'ENVIADO',
        reacciones:      [],
      };
      agregarMensaje(mensaje);
    });

    return () => {
      desuscribirCanal(id);
      setCanalActivo(null);
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = useCallback(async (texto: string) => {
    if (!texto.trim() || !usuario) return;
    setEnviando(true);

    const optimista: Mensaje = {
      id:              `pending-${Date.now()}`,
      sender_id:       usuario.id,
      sender_username: usuario.username,
      sender_initials: usuario.initials,
      channel_id:      id,
      content_enc:     '',
      iv:              '',
      content:         texto.trim(),
      sent_at:         new Date().toISOString(),
      estado:          'PENDIENTE',
      reacciones:      [],
    };
    agregarMensaje(optimista);

    try {
      await mensajeService.enviar(id, texto.trim());
    } catch (e) {
      console.error('Error al enviar mensaje:', e);
    } finally {
      setEnviando(false);
    }
  }, [id, usuario, agregarMensaje]);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>
        <Avatar initials={canal?.initials ?? '??'} online={canal?.online} size={32} />
        <View style={s.headerInfo}>
          <Text style={s.headerNombre}>{canal?.nombre ?? 'Chat'}</Text>
          <Text style={s.headerEstado}>{canal?.online ? 'En línea' : 'Desconectado'}</Text>
        </View>
        <TouchableOpacity style={s.headerIcon}><Feather name="phone" size={20} color={theme.textMuted} /></TouchableOpacity>
        <TouchableOpacity style={s.headerIcon}><Feather name="video" size={20} color={theme.textMuted} /></TouchableOpacity>
        <TouchableOpacity style={s.headerIcon}><Feather name="more-vertical" size={20} color={theme.textMuted} /></TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <MessageList
          mensajes={mensajes}
          usuarioId={usuario?.id ?? ''}
          onEndReached={() => {}}
          canalId={id}
        />

        <InputComposer
          canalId={id}
          onSend={enviar}
          onChangeText={() => {}}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: theme.bg },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 12, paddingHorizontal: 12, backgroundColor: theme.panelBg, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 8 },
  backBtn:      { padding: 4 },
  headerInfo:   { flex: 1 },
  headerNombre: { ...typography.title, color: theme.text },
  headerEstado: { ...typography.caption, color: theme.textMuted },
  headerIcon:   { padding: 4 },
});
