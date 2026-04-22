import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TextInput,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { useNotifStore } from '@/store/notif.store';
import { canalService } from '@/services/canal.service';
import { Canal } from '@/types/canal.types';
import { ChatRow } from '@/components/chat/ChatRow';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { NotifSheet } from '@/components/notificaciones/NotifSheet';

export default function ChatsScreen() {
  const usuario  = useAuthStore(s => s.usuario);
  const { canales, setCanales } = useChatStore();
  const noLeidas = useNotifStore(s => s.noLeidas);
  const [query, setQuery]          = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [notifVisible, setNotifVisible] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await canalService.listar();
      setCanales(res.data);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [setCanales]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = canales.filter(c => c.nombre.toLowerCase().includes(query.toLowerCase()));

  const reuniones  = filtrados.filter(c => c.is_ephemeral);
  const directos   = filtrados.filter(c => c.tipo === 'INDIVIDUAL' && !c.is_ephemeral);
  const grupales   = filtrados.filter(c => c.tipo !== 'INDIVIDUAL' && !c.is_ephemeral);

  const secciones = [
    ...(reuniones.length ? [{ title: 'SALAS DE REUNIÓN', data: reuniones }] : []),
    ...(directos.length  ? [{ title: 'MENSAJES DIRECTOS', data: directos }] : []),
    ...(grupales.length  ? [{ title: 'CANALES GRUPALES', data: grupales }] : []),
  ];

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.empresa}>ChatEE</Text>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={() => setNotifVisible(true)} style={s.bellBtn}>
            <Feather name="bell" size={20} color={theme.textMuted} />
            {noLeidas > 0 && <Badge count={noLeidas} style={s.notifBadge} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
            <Avatar initials={usuario?.initials ?? '??'} online={usuario?.status === 'ACTIVE'} size={34} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <Feather name="search" size={16} color={theme.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar conversaciones…"
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatRow canal={item} onPress={() => router.push(`/(tabs)/chat/${item.id}`)} />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={s.sectionHeader}>{section.title}</Text>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={theme.accent} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/(tabs)/nueva-sala')}>
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>

      <NotifSheet visible={notifVisible} onClose={() => setNotifVisible(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: theme.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  empresa:     { ...typography.heading, color: theme.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellBtn:     { position: 'relative' },
  notifBadge:  { position: 'absolute', top: -4, right: -4 },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: theme.listBg, borderRadius: 10, paddingHorizontal: 12, height: 40 },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, ...typography.body, color: theme.text },
  sectionHeader: { ...typography.label, color: theme.textMuted, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, textTransform: 'uppercase' },
  fab:         { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: theme.accent, shadowOpacity: 0.4, shadowRadius: 8 },
});
