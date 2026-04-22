import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '@/constants/theme';
import { QUICK_EMOJIS } from '@/constants/emojis';

interface Props {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ visible, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.picker}>
          {QUICK_EMOJIS.map(e => (
            <TouchableOpacity key={e} style={s.emojiBtn} onPress={() => { onSelect(e); onClose(); }}>
              <Text style={s.emoji}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', paddingBottom: 120 },
  picker:  { flexDirection: 'row', justifyContent: 'center', gap: 8, backgroundColor: theme.panelBg, marginHorizontal: 16, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.border },
  emojiBtn:{ padding: 6 },
  emoji:   { fontSize: 26 },
});
