import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { notifService } from '@/services/notif.service';
import { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { router } from 'expo-router';

const registrarPushToken = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    const { data } = await Notifications.getExpoPushTokenAsync();
    await notifService.registrarPushToken(data);
  } catch { /* push opcional, no bloquear el login */ }
};

const hidratar = async (accessToken: string, refreshToken: string, expiresIn: number) => {
  const { setSession, setUsuario } = useAuthStore.getState();
  useAuthStore.setState({ accessToken });
  try {
    const meRes = await authService.me();
    await setSession(meRes.data, { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn });
  } catch {
    useAuthStore.setState({ accessToken: null });
    throw new Error('No se pudo obtener el perfil de usuario.');
  }
  registrarPushToken();
};

export const useAuth = () => {
  const { usuario, isAutenticado, logout } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    if (res.data.mfa_required && res.data.challenge_token) {
      router.replace({ pathname: '/auth/mfa', params: { challenge_token: res.data.challenge_token } });
      return;
    }
    if (res.data.access_token && res.data.refresh_token) {
      await hidratar(res.data.access_token, res.data.refresh_token, res.data.expires_in ?? 900);
      router.replace('/(tabs)');
    }
  };

  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    if (res.data.mfa_required && res.data.challenge_token) {
      router.replace({ pathname: '/auth/mfa', params: { challenge_token: res.data.challenge_token } });
    }
  };

  const verificarMfa = async (challenge_token: string, code: string) => {
    const res = await authService.mfaVerify(challenge_token, code);
    await hidratar(res.data.access_token, res.data.refresh_token, res.data.expires_in);
    router.replace('/(tabs)');
  };

  const cerrarSesion = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return { usuario, isAutenticado, login, register, verificarMfa, cerrarSesion };
};
