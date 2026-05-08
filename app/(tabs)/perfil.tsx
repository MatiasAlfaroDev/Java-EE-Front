import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';

const ROL_COLOR: Record<string, string> = {
  ADMIN:   theme.accent,
  MANAGER: theme.online,
  USER:    theme.textMuted,
};

export default function PerfilScreen() {
  const usuario = useAuthStore(s => s.usuario);
  const { cerrarSesion } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);

  if (!usuario) return null;

  const confirmarLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.titulo}>Perfil</Text>

      {/* Avatar + nombre */}
      <View style={s.avatarWrap}>
        <Avatar initials={usuario.initials} online={usuario.status === 'ACTIVE'} size={72} />
        <Text style={s.nombre}>{usuario.username}</Text>
        <Text style={s.email}>{usuario.email}</Text>
        <Tag label={usuario.rol} color={ROL_COLOR[usuario.rol] ?? theme.textMuted} style={s.rolTag} />
      </View>

      {/* Información */}
      <Card style={s.card}>
        <Text style={s.seccion}>INFORMACIÓN</Text>
        <View style={s.fila}>
          <Ionicons name="person-outline" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Usuario</Text>
          <Text style={s.filaValor}>{usuario.username}</Text>
        </View>
        <View style={s.fila}>
          <Ionicons name="mail-outline" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Email</Text>
          <Text style={s.filaValor}>{usuario.email}</Text>
        </View>
        <View style={[s.fila, s.filaUltima]}>
          <Ionicons name="pulse-outline" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Estado</Text>
          <Text style={[s.filaValor, { color: usuario.status === 'ACTIVE' ? theme.online : theme.textMuted }]}>
            {usuario.status === 'ACTIVE' ? 'En línea' : 'Desconectado'}
          </Text>
        </View>
      </Card>

      {/* Seguridad */}
      <Card style={s.card}>
        <Text style={s.seccion}>SEGURIDAD</Text>
        <TouchableOpacity style={[s.fila, s.filaUltima]}>
          <Ionicons name="shield-outline" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Reconfigurar MFA</Text>
          <Ionicons name="chevron-forward-outline" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </Card>

      {/* Notificaciones */}
      <Card style={s.card}>
        <Text style={s.seccion}>NOTIFICACIONES</Text>
        <View style={[s.fila, s.filaUltima]}>
          <Ionicons name="notifications-outline" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Notificaciones push</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      {/* Sobre la app */}
      <Card style={s.card}>
        <Text style={s.seccion}>SOBRE LA APP</Text>
        <View style={s.fila}>
          <Text style={s.filaLabel}>Versión</Text>
          <Text style={s.filaValor}>1.0.0</Text>
        </View>
        <View style={[s.fila, s.filaUltima]}>
          <Text style={s.filaLabel}>Equipo</Text>
          <Text style={s.filaValor}>Grupo 5 · UTEC</Text>
        </View>
      </Card>

      {/* Cerrar sesión — siempre al final */}
      <Button label="Cerrar sesión" variant="danger" onPress={confirmarLogout} style={s.logoutBtn} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: theme.bg },
  content:    { padding: 16, paddingTop: 60, paddingBottom: 100 },
  titulo:     { ...typography.heading, color: theme.text, marginBottom: 24 },
  avatarWrap: { alignItems: 'center', marginBottom: 24, gap: 8 },
  nombre:     { ...typography.title, color: theme.text },
  email:      { ...typography.body, color: theme.textMuted },
  rolTag:     { marginTop: 4 },
  card:       { marginBottom: 16 },
  seccion:    { ...typography.label, color: theme.textMuted, marginBottom: 12, textTransform: 'uppercase' },
  fila:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  filaUltima: { borderBottomWidth: 0 },
  filaLabel:  { ...typography.body, color: theme.text, flex: 1 },
  filaValor:  { ...typography.body, color: theme.textMuted },
  logoutBtn:  { marginTop: 8 },
});
