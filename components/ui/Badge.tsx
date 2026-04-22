import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  count: number;
  style?: ViewStyle;
}

export function Badge({ count, style }: Props) {
  if (count <= 0) return null;
  const label = count > 99 ? '99+' : String(count);

  return (
    <View style={[s.badge, style]}>
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.unreadBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: { color: '#fff', fontSize: 10, fontFamily: 'IBMPlexSans_600SemiBold' },
});
