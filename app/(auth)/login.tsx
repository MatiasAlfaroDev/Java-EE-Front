import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Tab = 'login' | 'register';

export default function LoginScreen() {
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const handleLogin = loginForm.handleSubmit(async data => {
    setLoading(true); setError(null);
    try { await login(data); }
    catch (e: unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al iniciar sesión'); }
    finally { setLoading(false); }
  });

  const handleRegister = registerForm.handleSubmit(async data => {
    setLoading(true); setError(null);
    try { await register({ nombre: data.username, email: data.email, password: data.password }); }
    catch (e: unknown) { setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al registrarse'); }
    finally { setLoading(false); }
  });

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.glow} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.logo}>ChatEE</Text>
          <Text style={s.subtitle}>Mensajería Empresarial Segura</Text>

          {/* Tabs */}
          <View style={s.tabs}>
            {(['login', 'register'] as Tab[]).map(t => (
              <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabActive]} onPress={() => { setTab(t); setError(null); }}>
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                  {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && <Text style={s.errorMsg}>{error}</Text>}

          {tab === 'login' ? (
            <View style={s.form}>
              <Input control={loginForm.control} name="email" label="EMAIL" placeholder="usuario@empresa.com" keyboardType="email-address" autoCapitalize="none" />
              <Input control={loginForm.control} name="password" label="CONTRASEÑA" placeholder="••••••••" secureTextEntry />
              <Button label="Iniciar sesión" onPress={handleLogin} loading={loading} style={s.btnPrimary} />
              <Button label="Iniciar sesión con SSO" variant="ghost" onPress={() => {}} style={s.btnSso} />
            </View>
          ) : (
            <View style={s.form}>
              <Input control={registerForm.control} name="username" label="USUARIO" placeholder="nombre.apellido" autoCapitalize="none" />
              <Input control={registerForm.control} name="email" label="EMAIL" placeholder="usuario@empresa.com" keyboardType="email-address" autoCapitalize="none" />
              <Input control={registerForm.control} name="password" label="CONTRASEÑA" placeholder="Mín. 8 chars, mayús., número, símbolo" secureTextEntry />
              <Input control={registerForm.control} name="confirmar" label="CONFIRMAR" placeholder="Repetir contraseña" secureTextEntry />
              <Button label="Crear cuenta" onPress={handleRegister} loading={loading} style={s.btnPrimary} />
            </View>
          )}

          <Text style={s.footer}>Jakarta EE 10 · WildFly 31 · AES-256-GCM E2E</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: theme.bg },
  glow:         { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(59,125,255,0.12)' },
  scroll:       { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card:         { backgroundColor: theme.panelBg, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  logo:         { ...typography.heading, color: theme.text, textAlign: 'center', marginBottom: 4 },
  subtitle:     { ...typography.caption, color: theme.textMuted, textAlign: 'center', marginBottom: 24 },
  tabs:         { flexDirection: 'row', backgroundColor: theme.bg, borderRadius: 8, padding: 4, marginBottom: 20 },
  tabBtn:       { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  tabActive:    { backgroundColor: theme.accent },
  tabTxt:       { ...typography.bodyBold, color: theme.textMuted },
  tabTxtActive: { color: '#fff' },
  form:         { gap: 12 },
  btnPrimary:   { marginTop: 8 },
  btnSso:       { marginTop: 4 },
  errorMsg:     { ...typography.caption, color: theme.error, textAlign: 'center', marginBottom: 8 },
  footer:       { ...typography.caption, color: theme.textMuted, textAlign: 'center', marginTop: 20 },
});
