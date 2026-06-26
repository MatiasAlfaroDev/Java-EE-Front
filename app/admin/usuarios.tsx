import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { adminService } from '@/services/admin.service';
import { UsuarioAdmin } from '@/types/admin.types';
import { UserRow } from '@/components/admin/UserRow';
import { usuarioService } from '@/services/usuario.service'; 

export default function UsuariosAdminScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await usuarioService.listar();

      setUsuarios(
        res.data.filter(u => u.rol === 'USER')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleStatus = (u: UsuarioAdmin) => {
    const accion = u.bloqueado ? 'desbloquear' : 'bloquear';

    Alert.alert(
      `${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario`,
      `¿Deseás ${accion} a ${u.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: accion.charAt(0).toUpperCase() + accion.slice(1),
          style: u.bloqueado ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (u.bloqueado) {
                await usuarioService.desbloquear(u.id);
              } else {
                await usuarioService.bloquear(u.id);
              }

              await cargar();
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el usuario.');
            }
          },
        },
      ]
    );
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
