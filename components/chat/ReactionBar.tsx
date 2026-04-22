import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { Reaccion } from '@/types/mensaje.types';
import { mensajeService } from '@/services/mensaje.service';

interface Props {
  reacciones: Reaccion[];
  msgId: string;
  esMio: boolean;
}

export function ReactionBar({ reacciones, msgId, esMio }: Props) {
  const toggle = async (r: Reaccion) => {
    if (r.mine) await mensajeService.quitarReaccion(msgId, r.emoji);
    else        await mensajeService.reaccionar(msgId, r.emoji);
  };

  return (
    <View style={[s.wrap, esMio ? s.wrapMio : s.wrapOtro]}>
      {reacciones.map(r => (
        <TouchableOpacity key={r.emoji} style={[s.pill, r.mine && s.pillMine]} onPress={() => toggle(r)} activeOpacity={0.7}>
          <Text style={s.emoji}>{r.emoji}</Text>
          <Text style={s.count}>{r.count}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  wrapMio:  { justifyContent: 'flex-end' },
  wrapOtro: { justifyContent: 'flex-start' },
  pill:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12, backgroundColor: theme.panelBg, borderWidth: 1, borderColor: theme.border },
  pillMine: { borderColor: theme.accent, backgroundColor: theme.accent + '20' },
  emoji:    { fontSize: 13 },
  count:    { fontSize: 11, color: theme.textMuted, fontFamily: 'IBMPlexSans_500Medium' },
});
