import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { InputComposer } from './InputComposer';

interface Props {
  parentId: number | null;
  chatId: string;
  usuarioId: number;
  onClose: () => void;
  onSend: (texto: string, parentId: number) => void;
}

export function ThreadSheet({ parentId, chatId, usuarioId, onClose, onSend }: Props) {
  if (!parentId) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <KeyboardAvoidingView style={s.sheet} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.header}>
            <Text style={s.titulo}>Hilo de respuestas</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-outline" size={20} color={theme.textMuted} /></TouchableOpacity>
          </View>
          <Text style={s.empty}>Hilos no disponibles aún.</Text>
          <InputComposer chatId={chatId} onSend={t => onSend(t, parentId)} />
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
  empty:   { ...typography.body, color: theme.textMuted, textAlign: 'center', padding: 24 },
});
