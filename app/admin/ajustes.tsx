import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AjustesAdminScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const confirmarLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que querés cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: cerrarSesion,
        },
      ]
    );
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.titulo}>Administrador</Text>

      <Card style={s.card}>
        <Text style={s.seccion}>CUENTA</Text>

        <View style={s.fila}>
          <Text style={s.label}>Nombre</Text>
          <Text style={s.valor}>{usuario?.username}</Text>
        </View>

        <View style={s.fila}>
          <Text style={s.label}>Email</Text>
          <Text style={s.valor}>{usuario?.email}</Text>
        </View>

        <View style={s.fila}>
          <Text style={s.label}>Rol</Text>
          <Text style={s.valor}>{usuario?.rol}</Text>
        </View>

        <Button
          label="Cerrar sesión"
          variant="danger"
          onPress={confirmarLogout}
          style={{ marginTop: 20 }}
        />
      </Card>

      <Card style={s.card}>
        <Text style={s.seccion}>SOBRE</Text>

        <View style={s.fila}>
          <Text style={s.label}>Versión</Text>
          <Text style={s.valor}>1.0.0</Text>
        </View>

        <View style={[s.fila, { borderBottomWidth: 0 }]}>
          <Text style={s.label}>Equipo</Text>
          <Text style={s.valor}>Grupo 5 · UTEC</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingTop: 60, paddingBottom: 100 },

  titulo: {
    ...typography.heading,
    color: theme.text,
    marginBottom: 24,
  },

  card: {
    marginBottom: 16,
  },

  seccion: {
    ...typography.label,
    color: theme.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  label: {
    ...typography.body,
    color: theme.text,
  },

  valor: {
    ...typography.body,
    color: theme.textMuted,
  },
});