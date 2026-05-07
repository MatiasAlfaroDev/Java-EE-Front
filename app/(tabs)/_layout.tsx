import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/auth.store';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={s.iconWrap}>
      <Feather name={name} size={24} color={color} />
      {focused && <View style={s.activeDot} />}
    </View>
  );
}

export default function TabsLayout() {
  const usuario = useAuthStore(s => s.usuario);
  const isAdmin = usuario?.rol === 'ADMIN';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'IBMPlexSans_500Medium',
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(13,28,48,0.97)',
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 62,
          paddingBottom: Platform.OS === 'ios' ? 12 : 8,
          paddingTop: 6,
        },
      }}
      screenListeners={{ tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="message-square" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="user" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="settings" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="shield" color={color} focused={focused} />,
          tabBarButton: isAdmin ? undefined : () => <View style={{ width: 0 }} />,
        }}
      />
      <Tabs.Screen name="chat/[id]" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="nueva-sala" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  iconWrap: { alignItems: 'center' },
  activeDot: {
    marginTop: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.accent,
  },
});
