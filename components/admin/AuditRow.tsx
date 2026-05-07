import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { AuditLog } from '@/types/admin.types';
import { fechaRelativa } from '@/utils/fecha';

interface Props { log: AuditLog }

export function AuditRow({ log }: Props) {
  return (
    <View style={s.row}>
      <View style={s.accionChip}>
        <Text style={s.accion}>{log.accion}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.entidad}>{log.entidad}</Text>
        <Text style={s.meta}>{log.usuario} · {log.ip}</Text>
        <Text style={s.fecha}>{fechaRelativa(log.fechaCreacion)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row:        { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12, alignItems: 'flex-start' },
  accionChip: { backgroundColor: theme.accent + '26', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  accion:     { ...typography.mono, color: theme.accent, textTransform: 'uppercase' },
  info:       { flex: 1, gap: 2 },
  entidad:    { ...typography.bodyMd, color: theme.text },
  meta:       { ...typography.caption, color: theme.textMuted },
  fecha:      { ...typography.caption, color: theme.textMuted },
});
