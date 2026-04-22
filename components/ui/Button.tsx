import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[s.base, s[variant], isDisabled && s.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator color={variant === 'ghost' ? theme.textMuted : '#fff'} />
        : <Text style={[s.label, s[`${variant}Label`]]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base:         { height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primary:      { backgroundColor: theme.accent },
  ghost:        { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  danger:       { backgroundColor: theme.error },
  disabled:     { opacity: 0.5 },
  label:        { ...typography.bodyBold },
  primaryLabel: { color: '#fff' },
  ghostLabel:   { color: theme.textMuted },
  dangerLabel:  { color: '#fff' },
});
