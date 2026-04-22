import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { useChat } from '@/hooks/useChat';
import { useTyping } from '@/hooks/useTyping';
import { ws } from '@/services/websocket.service';
import { mensajeService } from '@/services/mensaje.service';
import { cryptoService } from '@/services/crypto.service';
import { MessageList } from '@/components/chat/MessageList';
import { InputComposer } from '@/components/chat/InputComposer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Avatar } from '@/components/ui/Avatar';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const canal   = useChatStore(s => s.canales.find(c => c.id === id));
  const typing  = useChatStore(s => s.typing[id] ?? []);
  const usuario = useAuthStore(s => s.usuario);

  const [claveCanal, setClaveCanal] = useState<CryptoKey | undefined>(undefined);
  const [cursor, setCursor]           = useState<string | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);

  useEffect(() => {
    cryptoService.obtenerClaveCanal(id).then(setClaveCanal);
  }, [id]);

  const { mensajes, cargarMensajes } = useChat(id, claveCanal);
  const { onChangeText, detenerTyping } = useTyping(id);

  const cargarMas = async () => {
    if (!cursor || cargandoMas) return;
    setCargandoMas(true);
    const res = await cargarMensajes(cursor);
    setCursor(res.cursor_next);
    setCargandoMas(false);
  };

  const enviar = async (texto: string) => {
    if (!texto.trim() || !claveCanal) return;
    detenerTyping();
    const { content_enc, iv } = await cryptoService.cifrarMensaje(texto, claveCanal);
    const payload = { channel_id: id, content_enc, iv, parent_id: null };

    if (ws.enviarMensaje(payload) === undefined) {
      // WS desconectado — enviar por REST
      await mensajeService.enviarOffline(payload);
    }
  };

  const typingOtros = typing.filter(u => u !== usuario?.username);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>
        <Avatar initials={canal?.initials ?? '??'} online={canal?.online ?? false} size={32} />
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
          onEndReached={cargarMas}
          canalId={id}
        />

        {typingOtros.length > 0 && <TypingIndicator nombres={typingOtros} />}

        <InputComposer
          canalId={id}
          onSend={enviar}
          onChangeText={onChangeText}
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
