import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AjustesScreen() {
  const { cerrarSesion } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);

  const confirmarLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.titulo}>Ajustes</Text>

      <Card style={s.card}>
        <Text style={s.seccion}>CUENTA</Text>
        <Button label="Cerrar sesión" variant="danger" onPress={confirmarLogout} />
      </Card>

      <Card style={s.card}>
        <Text style={s.seccion}>SEGURIDAD</Text>
        <TouchableOpacity style={s.fila}>
          <Feather name="shield" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Reconfigurar MFA</Text>
          <Feather name="chevron-right" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </Card>

      <Card style={s.card}>
        <Text style={s.seccion}>NOTIFICACIONES</Text>
        <View style={s.fila}>
          <Feather name="bell" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Notificaciones push</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      <Card style={s.card}>
        <Text style={s.seccion}>SOBRE LA APP</Text>
        <View style={s.fila}>
          <Text style={s.filaLabel}>Versión</Text>
          <Text style={s.filaValor}>1.0.0</Text>
        </View>
        <View style={[s.fila, { borderBottomWidth: 0 }]}>
          <Text style={s.filaLabel}>Equipo</Text>
          <Text style={s.filaValor}>Grupo 5 · UTEC</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: theme.bg },
  content:   { padding: 16, paddingTop: 60, paddingBottom: 100 },
  titulo:    { ...typography.heading, color: theme.text, marginBottom: 24 },
  card:      { marginBottom: 16 },
  seccion:   { ...typography.label, color: theme.textMuted, marginBottom: 12, textTransform: 'uppercase' },
  fila:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  filaLabel: { ...typography.body, color: theme.text, flex: 1 },
  filaValor: { ...typography.body, color: theme.textMuted },
});
