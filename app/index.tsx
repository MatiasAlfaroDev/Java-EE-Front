import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { Usuario } from '@/types/auth.types';
import { theme } from '@/constants/theme';

// DEV_BYPASS: true = saltar login y usar usuario mock
// Cambiar a false cuando el backend esté disponible
const DEV_BYPASS = true;

const MOCK_USUARIO: Usuario = {
  id:         '1',
  username:   'Dev User',
  email:      'dev@chatee.com',
  rol:        'ADMIN',
  status:     'ACTIVE',
  public_key: '',
  initials:   'DU',
  created_at: new Date().toISOString(),
};

export default function Index() {
  const router = useRouter();
  const isAutenticado = useAuthStore(s => s.isAutenticado);

  useEffect(() => {
    if (DEV_BYPASS) {
      if (!isAutenticado) {
        useAuthStore.setState({ usuario: MOCK_USUARIO, accessToken: 'dev-token', isAutenticado: true });
      }
      router.replace('/(tabs)');
      return;
    }

    router.replace(isAutenticado ? '/(tabs)' : '/(auth)/login');
  }, [isAutenticado]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}
