import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginRequest, RegisterRequest, Usuario } from '@/types/auth.types';
import { router } from 'expo-router';

const mapearUsuario = (u: { id: number; nombre: string; email: string; rol: string; estado?: string }): Usuario => ({
  id:         String(u.id),
  username:   u.nombre,
  email:      u.email,
  rol:        (u.rol as Usuario['rol']) ?? 'USER',
  status:     u.estado === 'OFFLINE' ? 'OFFLINE' : 'ACTIVE',
  public_key: '',
  initials:   u.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
  created_at: new Date().toISOString(),
});

export const useAuth = () => {
  const { usuario, isAutenticado, logout } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    const { token, usuario: u } = res.data;
    const { setSession } = useAuthStore.getState();
    await setSession(mapearUsuario(u), {
      access_token:  token,
      refresh_token: '',
      expires_in:    86400,
    });
    router.replace('/(tabs)');
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    router.replace('/(auth)/login');
  };

  const cerrarSesion = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  // MFA y SSO no implementados en el backend actual
  const verificarMfa = async (_challenge_token: string, _code: string) => {
    throw new Error('MFA no implementado en el backend.');
  };

  return { usuario, isAutenticado, login, register, verificarMfa, cerrarSesion };
};
