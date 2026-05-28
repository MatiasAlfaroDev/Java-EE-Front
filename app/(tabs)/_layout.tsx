import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { useEffect } from 'react';
import { conectarWebSocket, desconectarWebSocket } from '@/services/websocket.service';
import { useChatStore } from '@/store/chat.store';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, { icon: IoniconName; label: string }> = {
  'nuevo-chat': { icon: 'create-outline',     label: 'Mensaje'  },
  'index':      { icon: 'chatbubbles-outline', label: 'Chats'   },
  'perfil':     { icon: 'person-outline',      label: 'Perfil'  },
  'admin':      { icon: 'shield-outline',      label: 'Admin'   },
};

const HIDDEN_ROUTES = new Set(['chat/[id]']);

function FloatingTabBar({ state, navigation }: {
  state: { routes: { key: string; name: string }[]; index: number };
  descriptors: Record<string, unknown>;
  navigation: { emit: (e: object) => { defaultPrevented: boolean }; navigate: (name: string) => void };
}) {
  const usuario   = useAuthStore(s => s.usuario);
  const isAdmin   = usuario?.rol === 'ADMIN';
  const insets    = useSafeAreaInsets();

  // Ocultar tab bar completamente dentro de un chat
  if (state.routes[state.index].name === 'chat/[id]') return null;

  const visibleRoutes = state.routes.filter(route => {
    if (HIDDEN_ROUTES.has(route.name)) return false;
    if (route.name === 'admin' && !isAdmin) return false;
    return true;
  });

  return (
    <View style={[s.wrapper, { paddingBottom: insets.bottom + 6 }]} pointerEvents="box-none">
      {/* capa de blur — liquid glass */}
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />

      {/* capa de color semi-transparente encima del blur */}
      <View style={[StyleSheet.absoluteFill, s.glassOverlay]} />

      {/* borde superior sutil */}
      <View style={s.topBorder} />

      {/* tabs */}
      <View style={s.row}>
        {visibleRoutes.map((route) => {
          const focused = state.routes[state.index].name === route.name;
          const config  = TAB_CONFIG[route.name];
          if (!config) return null;

          const color = focused ? theme.accent : theme.textMuted;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} style={s.tabBtn} onPress={onPress}>
              {route.name === 'perfil' ? (
                <View style={[s.avatarWrap, focused && s.avatarWrapFocused]}>
                  <Avatar
                    initials={usuario?.initials ?? '??'}
                    online={usuario?.status === 'ACTIVE'}
                    size={26}
                  />
                </View>
              ) : (
                <Ionicons name={config.icon} size={24} color={color} />
              )}
              {focused && <View style={s.activeDot} />}
              <Text style={[s.label, { color }]}>{config.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {

  const agregarMensaje =
    useChatStore(s => s.agregarMensaje);

  const usuario =
    useAuthStore(s => s.usuario);

  useEffect(() => {

    if (!usuario) return;

    conectarWebSocket(
      
      useAuthStore.getState().accessToken!,
      
      (data: any) => {

      // ignorar mensajes propios
    /*  if (
        String(data.remitenteId) ===
        String(usuario.id)
      ) { 
        return;
      } */

      agregarMensaje({
        id: String(data.id),

        chatId: String(data.chatId),

        sender_id: String(data.remitenteId),

        sender_username: data.remitente,

        sender_initials:
          data.remitente?.slice(0, 2)?.toUpperCase(),

        contenido: data.contenido,

        iv: '',

        sent_at: new Date().toISOString(),

        estado: 'ENVIADO',

        reacciones: [],
      });

    });

    return () => {
      desconectarWebSocket();
    };

  }, [usuario?.id]);

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as Parameters<typeof FloatingTabBar>[0])} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="nuevo-chat" />
      <Tabs.Screen name="ajustes"   />
      <Tabs.Screen name="index"     />
      <Tabs.Screen name="perfil"    />
      <Tabs.Screen name="admin"     />
      <Tabs.Screen name="chat/[id]" />
    </Tabs>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',         // contiene el BlurView
  },

  glassOverlay: {
    backgroundColor: 'rgba(9,21,37,1)',
  },

  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  row: {
    flexDirection: 'row',
    height: 58,
    paddingTop: 6,
  },

  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
  },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.accent,
  },

  avatarWrap:        { borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  avatarWrapFocused: { borderColor: theme.accent },

  label: {
    fontSize: 10,
    fontFamily: 'IBMPlexSans_500Medium',
    textAlign: 'center',
  },
});
