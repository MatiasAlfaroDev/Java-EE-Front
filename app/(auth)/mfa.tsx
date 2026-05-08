import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAuth } from '@/hooks/useAuth';

const TOTAL = 6;
const COUNTDOWN = 29;

export default function MfaScreen() {
  const { challenge_token } = useLocalSearchParams<{ challenge_token: string }>();
  const [digits, setDigits] = useState<string[]>(Array(TOTAL).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(COUNTDOWN);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { verificarMfa } = useAuth();

  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  const verificar = async (code: string) => {
    if (!challenge_token) return;
    setLoading(true); setError(null);
    try { await verificarMfa(challenge_token, code); }
    catch { setError('Código incorrecto. Intentá de nuevo.'); setDigits(Array(TOTAL).fill('')); inputs.current[0]?.focus(); }
    finally { setLoading(false); }
  };

  const handleChange = (text: string, idx: number) => {
    if (!/^\d?$/.test(text)) return;
    const next = [...digits];
    next[idx] = text;
    setDigits(next);
    if (text && idx < TOTAL - 1) inputs.current[idx + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === TOTAL) verificar(next.join(''));
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={s.root}>
      <View style={s.iconWrap}>
        <Ionicons name="key-outline" size={28} color={theme.accent} />
      </View>
      <Text style={s.titulo}>Verificación en dos pasos</Text>
      <Text style={s.subtitulo}>Ingresá el código de 6 dígitos de tu autenticador</Text>

      <View style={s.inputs}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={r => { inputs.current[i] = r; }}
            style={[s.digitInput, d ? s.digitFilled : null]}
            value={d}
            onChangeText={t => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={i === 0}
          />
        ))}
      </View>

      {error && <Text style={s.error}>{error}</Text>}

      <Text style={s.countdown}>
        {segundos > 0 ? `00:${pad(segundos)}` : 'Código expirado'}
      </Text>

      {loading && <ActivityIndicator color={theme.accent} style={{ marginTop: 16 }} />}

      <TouchableOpacity style={s.linkWrap}>
        <Text style={s.link}>Usar código de recuperación</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap:    { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(59,125,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  titulo:      { ...typography.heading, color: theme.text, marginBottom: 8 },
  subtitulo:   { ...typography.body, color: theme.textMuted, textAlign: 'center', marginBottom: 32 },
  inputs:      { flexDirection: 'row', gap: 10, marginBottom: 24 },
  digitInput:  { width: 44, height: 52, borderRadius: 8, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.inputBg, color: theme.text, textAlign: 'center', ...typography.mono, fontSize: 20 },
  digitFilled: { borderColor: theme.accent },
  error:       { ...typography.caption, color: theme.error, marginBottom: 12 },
  countdown:   { ...typography.bodyBold, color: theme.accent },
  linkWrap:    { marginTop: 32 },
  link:        { ...typography.body, color: theme.textMuted },
});
