import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '@/utils/validators';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Usuario } from '@/types/auth.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Tab = 'login' | 'register';

const mapearUsuario = (u: {
  id: number; nombre: string; email: string; rol: string; estado?: string; bloqueado?: boolean;
}): Usuario => ({
  id:         String(u.id),
  username:   u.nombre,
  email:      u.email,
  rol:        (u.rol as Usuario['rol']) ?? 'USER',
  status:     u.estado === 'OFFLINE' ? 'OFFLINE' : 'ACTIVE',
  public_key: '',
  initials:   u.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
  created_at: new Date().toISOString(),
  bloqueado: u.bloqueado?? false,
});

function LoginForm({ onError }: { onError: (msg: string | null) => void }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setLoading(true); onError(null);
    try {
      const res = await authService.login(data);
      const { token, usuario: u } = res.data as {
        token: string;
        usuario: { id: number; nombre: string; email: string; rol: string; estado?: string };
      };
      useAuthStore.getState().setSession(mapearUsuario(u), token);
      if (u.rol === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
        onError(
          e?.response?.data ?? 'Credenciales incorrectas'
        );
      } finally {
      setLoading(false);
    }
  });

  return (
    <View style={s.form}>
      <Input control={form.control} name="email"    label="EMAIL"      placeholder="usuario@empresa.com" keyboardType="email-address" autoCapitalize="none" />
      <Input control={form.control} name="password" label="CONTRASEÑA" placeholder="••••••••" secureTextEntry />
      <Button label="Iniciar sesión"          onPress={handleSubmit} loading={loading} style={s.btnPrimary} />
      <Button label="Iniciar sesión con SSO"  variant="ghost" onPress={() => {}}       style={s.btnSso} />
    </View>
  );
}

// ── Formulario de registro ───────────────────────────────────────────────────

function RegisterForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string | null) => void }) {
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmar: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setLoading(true); onError(null);
    try {
      await authService.register({nombre: data.username, email: data.email, password: data.password,
  rol: 'USER',});
      form.reset();
      onSuccess();
    } catch (e: unknown) {
      onError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al registrarse',
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <View style={s.form}>
      <Input control={form.control} name="username" label="USUARIO"    placeholder="nombre.apellido"                    autoCapitalize="none" />
      <Input control={form.control} name="email"    label="EMAIL"      placeholder="usuario@empresa.com" keyboardType="email-address" autoCapitalize="none" />
      <Input control={form.control} name="password" label="CONTRASEÑA" placeholder="Mín. 8 chars, mayús., número, símbolo" secureTextEntry />
      <Input control={form.control} name="confirmar" label="CONFIRMAR" placeholder="Repetir contraseña" secureTextEntry />
      <Button label="Crear cuenta" onPress={handleSubmit} loading={loading} style={s.btnPrimary} />
    </View>
  );
}

// ── Pantalla principal ───────────────────────────────────────────────────────

export default function LoginScreen() {
  const [tab, setTab] = useState<Tab>('login');
  const [error, setError] = useState<string | null>(null);

  const switchTab = (t: Tab) => { setTab(t); setError(null); };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="always">
        <View style={s.card}>
          <Text style={s.logo}>Terotalk</Text>
          <Text style={s.subtitle}>Mensajería Empresarial Segura</Text>

          <View style={s.tabs}>
            {(['login', 'register'] as Tab[]).map(t => (
              <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabActive]} onPress={() => switchTab(t)}>
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                  {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!error && <Text style={s.errorMsg}>{error}</Text>}

          {tab === 'login'
            ? <LoginForm    onError={setError} />
            : <RegisterForm onError={setError} onSuccess={() => switchTab('login')} />
          }

          <Text style={s.footer}>Jakarta EE 10 · WildFly 31 · AES-256-GCM E2E</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: theme.bg },
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
