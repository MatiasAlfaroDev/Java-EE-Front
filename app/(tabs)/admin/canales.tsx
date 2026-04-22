import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { canalService } from '@/services/canal.service';
import { Canal } from '@/types/canal.types';
import { Avatar } from '@/components/ui/Avatar';
import { Tag } from '@/components/ui/Tag';

export default function CanalesAdminScreen() {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await canalService.listar();
      setCanales(res.data);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const eliminar = (canal: Canal) => {
    Alert.alert('Eliminar canal', `¿Eliminar "${canal.nombre}"? Esta acción es irreversible.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await canalService.eliminar(canal.id);
          setCanales(prev => prev.filter(c => c.id !== canal.id));
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
      <Text style={s.titulo}>Gestión de canales</Text>
      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={canales}
          keyExtractor={c => c.id}
          renderItem={({ item }) => (
            <View style={s.row}>
              <Avatar initials={item.initials} size={40} />
              <View style={s.info}>
                <Text style={s.nombre}>{item.nombre}</Text>
                <Text style={s.meta}>{item.members_count ?? 0} miembros</Text>
              </View>
              <Tag label={item.tipo} color={TIPO_COLOR[item.tipo]} />
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
