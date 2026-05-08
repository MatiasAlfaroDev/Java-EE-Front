import { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  const handleChange = (t: string) => { setTexto(t); onChangeText?.(t); };

  const handleSend = () => {
    if (!texto.trim()) return;
    onSend(texto.trim());
    setTexto('');
  };

  const tieneTexto = texto.trim().length > 0;

  return (
    <View style={[s.root, { paddingBottom: insets.bottom + 10 }]}>
      <View style={s.row}>

        {/* + abre adjuntos, polls, etc. */}
        <TouchableOpacity style={s.sideBtn} onPress={() => setEmojiVisible(true)}>
          <Ionicons name="add-circle-outline" size={30} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Campo de texto — mismo estilo que el buscador del tab Chats */}
        <View style={s.inputPill}>
          <TextInput
            style={s.input}
            placeholder="Mensaje"
            placeholderTextColor={theme.textMuted}
            value={texto}
            onChangeText={handleChange}
            multiline
            maxLength={4000}
            autoComplete="off"
            autoCorrect={false}
          />
        </View>

        {/* Cámara (se oculta cuando hay texto) */}
        {!tieneTexto && (
          <TouchableOpacity style={s.sideBtn}>
            <Ionicons name="camera-outline" size={28} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        {/* Enviar */}
        <TouchableOpacity
          style={[s.sendBtn, tieneTexto ? s.sendActive : s.sendInactive]}
          onPress={handleSend}
        >
          <Ionicons
            name="paper-plane-outline"
            size={18}
            color={tieneTexto ? '#fff' : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      <EmojiPicker
        visible={emojiVisible}
        onSelect={e => setTexto(t => t + e)}
        onClose={() => setEmojiVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    backgroundColor: theme.panelBg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },

  sideBtn: {
    paddingBottom: 6,
    paddingHorizontal: 2,
  },

  /* Mismo estilo que el buscador del tab Chats */
  inputPill: {
    flex: 1,
    backgroundColor: theme.listBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 130,
    justifyContent: 'center',
  },

  input: {
    ...typography.body,
    color: theme.text,
    paddingVertical: 0,
    maxHeight: 110,
  },

  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendActive:   { backgroundColor: theme.accent },
  sendInactive: { backgroundColor: theme.accent + '4D' },
});
