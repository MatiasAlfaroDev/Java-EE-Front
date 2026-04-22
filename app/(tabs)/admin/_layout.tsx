import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { theme } from '@/constants/theme';

export default function AdminLayout() {
  const usuario = useAuthStore(s => s.usuario);

  useEffect(() => {
    if (usuario && usuario.rol !== 'ADMIN') router.replace('/(tabs)');
  }, [usuario]);

  if (!usuario || usuario.rol !== 'ADMIN') return null;

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.bg },
    }} />
  );
}
