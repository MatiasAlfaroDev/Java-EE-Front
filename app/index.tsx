import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { theme } from '@/constants/theme';

// DEV_BYPASS: true = saltar login y usar usuario mock
// Cambiar a false cuando el backend esté disponible
const DEV_BYPASS = true;

const MOCK_USUARIO = {
  id:       1,
  nombre:   'Dev User',
  email:    'dev@chatee.com',
  rol:      'ADMIN',
  estado:   'ONLINE' as const,
  initials: 'DU',
};

export default function Index() {
  const router = useRouter();
  const { isAutenticado } = useAuthStore();

  useEffect(() => {
    if (DEV_BYPASS) {
      useAuthStore.setState({
        usuario:       MOCK_USUARIO,
        accessToken:   'dev-token',
        isAutenticado: true,
      });
      router.replace('/(tabs)');
      return;
    }

    if (!isAutenticado) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAutenticado]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}
