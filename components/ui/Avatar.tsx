import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { avatarColor } from '@/utils/avatar';

interface Props {
  initials: string;
  size?: number;
  online?: boolean;
  style?: ViewStyle;
}

export function Avatar({ initials, size = 40, online, style }: Props) {
  const bg = avatarColor(initials);
  const fontSize = size * 0.38;

  return (
    <View style={[s.wrap, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <View style={[s.circle, { backgroundColor: bg, width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[s.initials, { fontSize }]}>{initials}</Text>
      </View>
      {online !== undefined && (
        <View style={[s.dot, online ? s.dotOnline : s.dotOffline, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14, bottom: 0, right: 0 }]} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap:       { position: 'relative' },
  circle:     { alignItems: 'center', justifyContent: 'center' },
  initials:   { ...typography.bodyBold, color: '#fff', fontFamily: 'IBMPlexSans-SemiBold' },
  dot:        { position: 'absolute', borderWidth: 2, borderColor: theme.bg },
  dotOnline:  { backgroundColor: theme.online },
  dotOffline: { backgroundColor: theme.textMuted },
});
