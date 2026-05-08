import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { theme } from '@/constants/theme';

// DEV_BYPASS: true = saltar login y usar usuario mock
// Cambiar a false cuando el backend esté disponible
const DEV_BYPASS = false;

const MOCK_USUARIO = {
  id: 'dev-001',
  username: 'dev.user',
  email: 'dev@chatee.com',
  rol: 'ADMIN' as const,
  status: 'ACTIVE' as const,
  public_key: '',
  initials: 'DU',
  created_at: new Date().toISOString(),
};

export default function Index() {
  const router = useRouter();
  const { isAutenticado, usuario } = useAuthStore();

  useEffect(() => {
    if (DEV_BYPASS) {
      useAuthStore.setState({
        usuario: MOCK_USUARIO,
        accessToken: 'dev-token',
        isAutenticado: true,
      });
      router.replace('/(tabs)');
      return;
    }

    if (!isAutenticado) {
      router.replace('/(auth)/login');
    } else if (usuario?.status === 'PENDING_MFA') {
      router.replace('/(auth)/mfa');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAutenticado, usuario?.status]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}
