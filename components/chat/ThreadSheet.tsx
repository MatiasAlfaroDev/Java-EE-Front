import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Mensaje } from '@/types/mensaje.types';
import { mensajeService } from '@/services/mensaje.service';
import { MessageBubble } from './MessageBubble';
import { InputComposer } from './InputComposer';

interface Props {
  parentId: string | null;
  canalId: string;
  usuarioId: string;
  onClose: () => void;
  onSend: (texto: string, parentId: string) => void;
}

export function ThreadSheet({ parentId, canalId, usuarioId, onClose, onSend }: Props) {
  const [hilo, setHilo] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parentId) return;
    setLoading(true);
    mensajeService.listarHilo(parentId)
      .then(r => setHilo(r.data))
      .finally(() => setLoading(false));
  }, [parentId]);

  if (!parentId) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <KeyboardAvoidingView style={s.sheet} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.header}>
            <Text style={s.titulo}>Hilo de respuestas</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color={theme.textMuted} /></TouchableOpacity>
          </View>
          {loading
            ? <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
            : <FlatList data={hilo} keyExtractor={m => m.id} renderItem={({ item }) => <MessageBubble mensaje={item} esMio={item.sender_id === usuarioId} />} contentContainerStyle={{ paddingVertical: 8 }} />
          }
          <InputComposer canalId={canalId} onSend={t => onSend(t, parentId)} />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: theme.panelBg, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  titulo:  { ...typography.title, color: theme.text },
});
