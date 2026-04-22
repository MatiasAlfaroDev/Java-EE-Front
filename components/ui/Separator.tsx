import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface Props {
  label?: string;
}

export function Separator({ label }: Props) {
  if (!label) return <View style={s.line} />;

  return (
    <View style={s.row}>
      <View style={s.line} />
      <Text style={s.text}>{label}</Text>
      <View style={s.line} />
    </View>
  );
}

const s = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', marginVertical: 8, paddingHorizontal: 16 },
  line: { flex: 1, height: 1, backgroundColor: theme.border },
  text: { ...typography.caption, color: theme.textMuted, marginHorizontal: 12 },
});
