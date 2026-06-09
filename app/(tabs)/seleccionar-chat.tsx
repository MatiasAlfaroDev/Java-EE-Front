import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';

import { chatService } from '@/services/chat.service';
import { mensajeService } from '@/services/mensaje.service';

import { Chat } from '@/types/chat.types';

import { ChatRow } from '@/components/chat/ChatRow';

export default function SeleccionarChatScreen() {
  const { mensajeId } = useLocalSearchParams<{
    mensajeId: string;
  }>();

  const [chats, setChats] = useState<Chat[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await chatService.listar();

      const mapeados: Chat[] = res.data.map(c => ({
        id: String(c.id),
        nombre: c.nombre,
        tipo: c.tipo,
        initials: c.nombre.slice(0, 2).toUpperCase(),
        lastMsg: c.lastMsg ?? undefined,
        lastMsgTime: c.lastMsgTime ?? undefined,
        unread: c.unread ?? 0,
      }));

      setChats(mapeados);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const reenviar = async (chatId: string) => {
    try {
      await mensajeService.reenviar(
        mensajeId,
        Number(chatId)
      );

      router.replace(`/(tabs)/chat/${chatId}`);
    } catch (e) {
      console.log('Error reenviando', e);
    }
  };

  const filtrados = chats.filter(c =>
    c.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const secciones = filtrados.length
    ? [{ title: 'CHATS', data: filtrados }]
    : [];

  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        <Text style={s.title}>
          Seleccionar chat
        </Text>
      </View>

      <View style={s.searchWrap}>
        <Ionicons
          name="search-outline"
          size={16}
          color={theme.textMuted}
          style={s.searchIcon}
        />

        <TextInput
          style={s.searchInput}
          placeholder="Buscar..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          color={theme.accent}
          style={{ marginTop: 40 }}
        />
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <ChatRow
              chat={item}
              onPress={() => reenviar(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                cargar();
              }}
            />
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  title: {
    ...typography.heading,
    color: theme.text,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: theme.listBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 40,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    ...typography.body,
    color: theme.text,
  },
});