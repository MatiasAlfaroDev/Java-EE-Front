import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { adminService } from '@/services/admin.service';
import { UsuarioAdmin } from '@/types/admin.types';
import { UserRow } from '@/components/admin/UserRow';

export default function UsuariosAdminScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await adminService.listarUsuarios();
      setUsuarios(res.data);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleStatus = (u: UsuarioAdmin) => {
    const esOnline = u.estado === 'ONLINE';
    const accion = esOnline ? 'desconectar' : 'reconectar';
    Alert.alert(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`, u.nombre, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: accion.charAt(0).toUpperCase() + accion.slice(1),
        style: esOnline ? 'destructive' : 'default',
        onPress: async () => {
          setUsuarios(prev => prev.map(x =>
            x.id === u.id ? { ...x, estado: esOnline ? 'OFFLINE' : 'ONLINE' } : x
          ));
        },
      },
    ]);
  };

  return (
    <View style={s.root}>
      <Text style={s.titulo}>Gestión de usuarios</Text>
      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={u => String(u.id)}
          renderItem={({ item }) => <UserRow usuario={item} onToggleStatus={() => toggleStatus(item)} />}
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
});
