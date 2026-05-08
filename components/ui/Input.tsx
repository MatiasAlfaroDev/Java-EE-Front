import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';

interface Props<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label: string;
}

export function Input<T extends FieldValues>({ control, name, label, ...rest }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={s.wrap}>
          <Text style={s.label}>{label}</Text>
          <TextInput
            autoComplete="off"
            autoCorrect={false}
            importantForAutofill="no"
            placeholderTextColor={theme.textMuted}
            {...rest}
            style={[s.input, error && s.inputError, rest.style]}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value ?? ''}
          />
          {error && <Text style={s.errorTxt}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  wrap:       { gap: 6 },
  label:      { ...typography.label, color: theme.textMuted, textTransform: 'uppercase' },
  input:      { height: 44, backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 12, ...typography.body, color: theme.text },
  inputError: { borderColor: theme.error },
  errorTxt:   { ...typography.caption, color: theme.error },
});
