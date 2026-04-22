import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { EmojiPicker } from './EmojiPicker';

interface Props {
  canalId: string;
  onSend: (texto: string) => void;
  onChangeText?: (text: string) => void;
}

export function InputComposer({ canalId, onSend, onChangeText }: Props) {
  const [texto, setTexto] = useState('');
  const [emojiVisible, setEmojiVisible] = useState(false);

  const handleChange = (t: string) => { setTexto(t); onChangeText?.(t); };

  const handleSend = () => {
    if (!texto.trim()) return;
    onSend(texto.trim());
    setTexto('');
  };

  const tieneTexto = texto.trim().length > 0;

  return (
    <View style={s.root}>
      <View style={s.composer}>
        <TouchableOpacity style={s.actionBtn}><Feather name="paperclip" size={20} color={theme.textMuted} /></TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}><Feather name="image" size={20} color={theme.textMuted} /></TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => setEmojiVisible(true)}>
          <Feather name="smile" size={20} color={theme.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}><Feather name="bar-chart-2" size={20} color={theme.textMuted} /></TouchableOpacity>

        <TextInput
          style={s.input}
          placeholder="Escribe un mensaje… (E2E cifrado)"
          placeholderTextColor={theme.textMuted}
          value={texto}
          onChangeText={handleChange}
          multiline
          maxLength={4000}
        />

        <TouchableOpacity
          style={[s.sendBtn, tieneTexto ? s.sendBtnActive : s.sendBtnInactive]}
          onPress={handleSend}
        >
          <Feather name="send" size={18} color={tieneTexto ? '#fff' : theme.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={s.e2eLabel}>🔒 Cifrado de extremo a extremo · AES-256-GCM</Text>
      <EmojiPicker
        visible={emojiVisible}
        onSelect={e => setTexto(t => t + e)}
        onClose={() => setEmojiVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:           { backgroundColor: theme.panelBg, borderTopWidth: 1, borderTopColor: theme.border },
  composer:       { flexDirection: 'row', alignItems: 'flex-end', padding: 8, gap: 6 },
  actionBtn:      { padding: 6 },
  input:          { flex: 1, ...typography.body, color: theme.text, maxHeight: 120, paddingVertical: 8 },
  sendBtn:        { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendBtnActive:  { backgroundColor: theme.accent },
  sendBtnInactive:{ backgroundColor: theme.accent + '4D' },
  e2eLabel:       { ...typography.caption, color: theme.textMuted, textAlign: 'center', paddingBottom: 8 },
});
