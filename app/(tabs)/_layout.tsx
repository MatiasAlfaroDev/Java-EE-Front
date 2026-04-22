import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/auth.store';

function TabBarIcon({ name, color }: { name: React.ComponentProps<typeof Feather>['name']; color: string }) {
  return <Feather name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  const usuario = useAuthStore(s => s.usuario);
  const isAdmin = usuario?.rol === 'ADMIN';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.panelBg,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
      }}
      screenListeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ color }) => <TabBarIcon name="message-square" color={color} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{ tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} /> }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="shield" color={color} />,
          tabBarButton: isAdmin ? undefined : () => <View style={{ width: 0 }} />,
        }}
      />
      <Tabs.Screen name="chat/[id]" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="nueva-sala" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}
