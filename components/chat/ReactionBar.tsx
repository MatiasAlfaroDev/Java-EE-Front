import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface Reaccion {
  emoji: string;
  count: number;
}

interface Props {
  reacciones: Reaccion[];
  esMio?: boolean;
}

export function ReactionBar({ reacciones, esMio }: Props) {
  if (!reacciones.length) return null;

  return (
    <View style={[s.wrap, esMio ? s.wrapMio : s.wrapOtro]}>
      {reacciones.map(r => (
        <View key={r.emoji} style={s.pill}>
          <Text style={s.emoji}>{r.emoji}</Text>
          <Text style={s.count}>{r.count}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  wrapMio:  { justifyContent: 'flex-end' },
  wrapOtro: { justifyContent: 'flex-start' },
  pill:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12, backgroundColor: theme.panelBg, borderWidth: 1, borderColor: theme.border },
  emoji:    { fontSize: 13 },
  count:    { fontSize: 11, color: theme.textMuted, fontFamily: 'IBMPlexSans_500Medium' },
});
