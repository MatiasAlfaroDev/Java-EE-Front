import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
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
        tabBarStyle: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: 'transparent', elevation: 0 },
        tabBarBackground: () => (
          Platform.OS === 'ios'
            ? <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.panelBg }]} />
        ),
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
          tabBarItemStyle: isAdmin ? undefined : { display: 'none' },
        }}
      />
      <Tabs.Screen name="chat/[id]" options={{ href: null }} />
      <Tabs.Screen name="nueva-sala" options={{ href: null }} />
    </Tabs>
  );
}
