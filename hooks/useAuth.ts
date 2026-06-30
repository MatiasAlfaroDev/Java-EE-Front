import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginRequest, RegisterRequest, Usuario } from '@/types/auth.types';
import { router } from 'expo-router';

const mapearUsuario = (u: { id: number; nombre: string; email: string; rol: string; estado?: string; bloqueado?: boolean }): Usuario => ({
  id:         String(u.id),
  username:   u.nombre,
  email:      u.email,
  rol:        (u.rol as Usuario['rol']) ?? 'USER',
  status:     u.estado === 'OFFLINE' ? 'OFFLINE' : 'ACTIVE',
  public_key: '',
  initials:   u.nombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
  created_at: new Date().toISOString(),
  bloqueado: u.bloqueado ?? false,
});

export const useAuth = () => {
  const { usuario, isAutenticado, logout } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    const { token, usuario: u } = res.data;
    useAuthStore.getState().setSession(mapearUsuario(u), token);
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

  return { usuario, isAutenticado, login, register, cerrarSesion };
};
