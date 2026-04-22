import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ReporteUso } from '@/types/admin.types';

interface Props {
  datos: ReporteUso[];
}

export function UsageChart({ datos }: Props) {
  if (!datos.length) return null;

  const maxMensajes = Math.max(...datos.map(d => d.mensajes), 1);

  return (
    <View style={s.wrap}>
      <View style={s.barras}>
        {datos.map(d => {
          const pct = d.mensajes / maxMensajes;
          const dia = new Date(d.fecha).toLocaleDateString('es-PE', { weekday: 'short' });
          return (
            <View key={d.fecha} style={s.barCol}>
              <Text style={s.valor}>{d.mensajes}</Text>
              <View style={s.barBg}>
                <View style={[s.barFill, { height: `${Math.max(pct * 100, 4)}%` }]} />
              </View>
              <Text style={s.dia}>{dia}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:    { height: 140 },
  barras:  { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol:  { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  valor:   { ...typography.caption, color: theme.textMuted, marginBottom: 2 },
  barBg:   { width: '100%', flex: 1, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: theme.accent, borderRadius: 4 },
  dia:     { ...typography.caption, color: theme.textMuted, marginTop: 4 },
});
