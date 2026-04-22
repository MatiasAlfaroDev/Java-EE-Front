import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Encuesta } from '@/types/mensaje.types';
import { encuestaService } from '@/services/encuesta.service';
import { fechaRelativa } from '@/utils/fecha';

interface Props {
  encuesta: Encuesta;
  canalId: string;
}

export function PollBubble({ encuesta: inicial, canalId }: Props) {
  const [enc, setEnc] = useState(inicial);

  const votar = async (opcionId: string) => {
    if (enc.myVote) return;
    await encuestaService.votar(enc.id, opcionId);
    const res = await encuestaService.resultados(enc.id);
    setEnc(res.data);
  };

  return (
    <View style={s.wrap}>
      <Text style={s.label}>ENCUESTA</Text>
      <Text style={s.pregunta}>{enc.pregunta}</Text>

      {enc.opciones.map(op => {
        const pct = enc.total > 0 ? op.votos / enc.total : 0;
        const seleccionada = enc.myVote === op.id;

        return (
          <TouchableOpacity key={op.id} style={s.opcion} onPress={() => votar(op.id)} activeOpacity={0.7} disabled={!!enc.myVote}>
            <View style={s.radioRow}>
              <View style={[s.radio, seleccionada && s.radioActive]}>
                {seleccionada && <View style={s.radioDot} />}
              </View>
              <Text style={s.opcionTxt}>{op.texto}</Text>
              <Text style={s.pct}>{Math.round(pct * 100)}%</Text>
            </View>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${pct * 100}%` }]} />
            </View>
          </TouchableOpacity>
        );
      })}

      <Text style={s.pie}>{enc.total} votos · vence {fechaRelativa(enc.expires_at)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:       { backgroundColor: theme.bubbleRecv, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 14, maxWidth: 300 },
  label:      { ...typography.label, color: theme.accent, textTransform: 'uppercase', marginBottom: 6 },
  pregunta:   { ...typography.bodyBold, color: theme.text, marginBottom: 12 },
  opcion:     { marginBottom: 10 },
  radioRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  radio:      { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: theme.textMuted, alignItems: 'center', justifyContent: 'center' },
  radioActive:{ borderColor: theme.accent },
  radioDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent },
  opcionTxt:  { ...typography.body, color: theme.text, flex: 1 },
  pct:        { ...typography.caption, color: theme.textMuted },
  barBg:      { height: 4, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  barFill:    { height: 4, backgroundColor: theme.accent, borderRadius: 2 },
  pie:        { ...typography.caption, color: theme.textMuted, marginTop: 8 },
});
