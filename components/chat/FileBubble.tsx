import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { ArchivoAdjunto } from '@/types/mensaje.types';

interface Props {
  archivo: ArchivoAdjunto;
  esMio: boolean;
  onPress?: () => void;
}

const formatBytes = (b: number): string => {
  if (b < 1024)        return `${b} B`;
  if (b < 1048576)     return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const SCAN_ICON: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  CLEAN:    'check-circle',
  INFECTED: 'alert-triangle',
  PENDING:  'loader',
};
const SCAN_COLOR: Record<string, string> = {
  CLEAN:    theme.online,
  INFECTED: theme.error,
  PENDING:  theme.textMuted,
};

export function FileBubble({ archivo, esMio, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[s.wrap, esMio ? s.wrapMio : s.wrapOtro]}
      onPress={archivo.scan_result === 'CLEAN' ? onPress : undefined}
      activeOpacity={0.8}
    >
      <View style={s.iconWrap}>
        <Feather name="file" size={24} color={theme.accent} />
      </View>
      <View style={s.info}>
        <Text style={s.nombre} numberOfLines={1}>{archivo.file_name}</Text>
        <Text style={s.meta}>{formatBytes(archivo.size_bytes)}</Text>
      </View>
      <Feather
        name={SCAN_ICON[archivo.scan_result]}
        size={16}
        color={SCAN_COLOR[archivo.scan_result]}
      />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border, gap: 10, maxWidth: 280 },
  wrapMio: { backgroundColor: theme.bubbleSent },
  wrapOtro:{ backgroundColor: theme.bubbleRecv },
  iconWrap:{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.accent + '20', alignItems: 'center', justifyContent: 'center' },
  info:    { flex: 1 },
  nombre:  { ...typography.bodyMd, color: theme.text },
  meta:    { ...typography.caption, color: theme.textMuted, marginTop: 2 },
});
