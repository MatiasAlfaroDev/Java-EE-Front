import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { isAutenticado, usuario } = useAuthStore();

  if (!isAutenticado) return <Redirect href="/auth/login" />;
  if (usuario?.status === 'PENDING_MFA') return <Redirect href="/auth/mfa" />;
  return <Redirect href="/(tabs)" />;
}
