import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';

const ROL_COLOR: Record<string, string> = {
  ADMIN:   theme.accent,
  MANAGER: theme.online,
  USER:    theme.textMuted,
};

export default function PerfilScreen() {
  const usuario = useAuthStore(s => s.usuario);
  if (!usuario) return null;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.titulo}>Perfil</Text>

      <View style={s.avatarWrap}>
        <Avatar initials={usuario.initials} online={usuario.estado === 'ONLINE'} size={72} />
        <Text style={s.nombre}>{usuario.nombre}</Text>
        <Text style={s.email}>{usuario.email}</Text>
        <Tag label={usuario.rol} color={ROL_COLOR[usuario.rol] ?? theme.textMuted} style={s.rolTag} />
      </View>

      <Card style={s.card}>
        <Text style={s.seccion}>INFORMACIÓN</Text>
        <View style={s.fila}>
          <Feather name="user" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Nombre</Text>
          <Text style={s.filaValor}>{usuario.nombre}</Text>
        </View>
        <View style={s.fila}>
          <Feather name="mail" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Email</Text>
          <Text style={s.filaValor}>{usuario.email}</Text>
        </View>
        <View style={s.fila}>
          <Feather name="activity" size={16} color={theme.textMuted} />
          <Text style={s.filaLabel}>Estado</Text>
          <Text style={[s.filaValor, { color: usuario.estado === 'ONLINE' ? theme.online : theme.textMuted }]}>
            {usuario.estado === 'ONLINE' ? 'En línea' : 'Desconectado'}
          </Text>
        </View>
      </Card>
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
  fila:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  filaLabel:  { ...typography.body, color: theme.textMuted, flex: 1 },
  filaValor:  { ...typography.bodyMd, color: theme.text },
});
