import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { chatService } from '@/services/chat.service';
import { Chat } from '@/types/chat.types';
import { Avatar } from '@/components/ui/Avatar';
import { Tag } from '@/components/ui/Tag';

export default function chatesAdminScreen() {
  const [chates, setchates] = useState<Chat[]>([]);
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
      miembros: c.miembros ?? 0,
}));
  

setchates(mapeados);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const eliminar = (chat: Chat) => {
    Alert.alert('Eliminar chat', `¿Eliminar "${chat.nombre}"? Esta acción es irreversible.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await chatService.eliminar(chat.id);
          setchates(prev => prev.filter(c => c.id !== chat.id));
        },
      },
    ]);
  };

  const TIPO_COLOR: Record<string, string> = {
    INDIVIDUAL: theme.textMuted,
    GRUPO:      theme.accent,
    PRIVADO:    theme.online,
  };

  return (
    <View style={s.root}>
      <Text style={s.titulo}>Gestión de chates</Text>
      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={chates}
          keyExtractor={c => c.id}
          renderItem={({ item }) => (
            <View style={s.row}>
              <Avatar initials={item.initials} size={40} />
              <View style={s.info}>
                <Text style={s.nombre}>{item.nombre}</Text>
                <Text style={s.meta}>{item.miembros ?? 0} miembros</Text>
              </View>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={theme.accent} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: theme.bg, paddingTop: 60 },
  titulo: { ...typography.heading, color: theme.text, paddingHorizontal: 16, marginBottom: 16 },
  row:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12 },
  info:   { flex: 1 },
  nombre: { ...typography.bodyBold, color: theme.text },
  meta:   { ...typography.caption, color: theme.textMuted, marginTop: 2 },
});
