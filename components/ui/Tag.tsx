import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { typography } from '@/constants/typography';

interface Props {
  label: string;
  color: string;
  style?: ViewStyle;
}

export function Tag({ label, color, style }: Props) {
  return (
    <View style={[s.wrap, { borderColor: color + '40', backgroundColor: color + '20' }, style]}>
      <Text style={[s.text, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, alignSelf: 'flex-start' },
  text: { ...typography.label, textTransform: 'uppercase' },
});
