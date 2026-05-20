import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TextInput,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { chatService } from '@/services/chat.service';
import { Chat } from '@/types/chat.types';
import { ChatRow } from '@/components/chat/ChatRow';
import { Avatar } from '@/components/ui/Avatar';

export default function ChatsScreen() {
  const usuario  = useAuthStore(s => s.usuario);
  const { chats, setchats } = useChatStore();
  const [query, setQuery]          = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);

  const cargar = useCallback(async () => {
    try {
      const res = await chatService.listar();
      const mapeados: Chat[] = res.data.map(c => ({
        id:          String(c.id),
        nombre:      c.nombre,
        tipo:        c.tipo,
        initials:    c.nombre.slice(0, 2).toUpperCase(),
        lastMsg:     c.lastMsg     ?? undefined,
        lastMsgTime: c.lastMsgTime ?? undefined,
      }));
      setchats(mapeados);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [setchats]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = chats.filter(c =>
    c.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const secciones = filtrados.length
    ? [{ title: 'CHATS', data: filtrados }]
    : [];

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.empresa}>Terotalk</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
          <Avatar initials={usuario?.initials ?? '??'} online={usuario?.status === 'ACTIVE'} size={34} />
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color={theme.textMuted} style={s.searchIcon} />
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
      ) : secciones.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="chatbubble-outline" size={48} color={theme.textMuted} />
          <Text style={s.emptyTitle}>Sin conversaciones</Text>
          <Text style={s.emptySubtitle}>Toca + para iniciar un chat</Text>
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <ChatRow chat={item} onPress={() => router.push(`/(tabs)/chat/${item.id}`)} />
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
      <TouchableOpacity style={s.fab} onPress={() => router.push('/(tabs)/nuevo-chat')}>
        <Ionicons name="add-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: theme.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  empresa:       { ...typography.heading, color: theme.text },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: theme.listBg, borderRadius: 20, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 12, height: 40 },
  searchIcon:    { marginRight: 8 },
  searchInput:   { flex: 1, ...typography.body, color: theme.text },
  sectionHeader: { ...typography.label, color: theme.textMuted, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, textTransform: 'uppercase' },
  fab:           { position: 'absolute', bottom: 110, right: 32, width: 46, height: 46, borderRadius: 28, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: theme.accent, shadowOpacity: 0.4, shadowRadius: 8 },
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle:    { ...typography.title, color: theme.textMuted },
  emptySubtitle: { ...typography.body, color: theme.textMuted },
});
