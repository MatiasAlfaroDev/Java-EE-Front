import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: Props) {
  return (
    <View style={[s.card, style]}>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: theme.panelBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
});
