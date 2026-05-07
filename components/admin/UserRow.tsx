import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { UsuarioAdmin } from '@/types/admin.types';
import { Avatar } from '@/components/ui/Avatar';
import { Tag } from '@/components/ui/Tag';

interface Props {
  usuario: UsuarioAdmin;
  onToggleStatus: () => void;
}

const ROL_COLOR: Record<string, string> = {
  ADMIN:   theme.accent,
  MANAGER: theme.online,
  USER:    theme.textMuted,
};

export function UserRow({ usuario, onToggleStatus }: Props) {
  return (
    <View style={s.row}>
      <Avatar initials={usuario.initials} online={usuario.estado === 'ONLINE'} size={42} />
      <View style={s.info}>
        <Text style={s.nombre}>{usuario.nombre}</Text>
        <Text style={s.email}>{usuario.email}</Text>
        <View style={s.tags}>
          <Tag label={usuario.rol} color={ROL_COLOR[usuario.rol] ?? theme.textMuted} />
          <Tag
            label={usuario.estado === 'ONLINE' ? 'En línea' : 'Desconectado'}
            color={usuario.estado === 'ONLINE' ? theme.online : theme.textMuted}
          />
        </View>
      </View>
      <TouchableOpacity style={s.actionBtn} onPress={onToggleStatus}>
        <Feather
          name={usuario.estado === 'ONLINE' ? 'user-x' : 'user-check'}
          size={18}
          color={usuario.estado === 'ONLINE' ? theme.error : theme.online}
        />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12 },
  info:      { flex: 1, gap: 3 },
  nombre:    { ...typography.bodyBold, color: theme.text },
  email:     { ...typography.caption, color: theme.textMuted },
  tags:      { flexDirection: 'row', gap: 6, marginTop: 4 },
  actionBtn: { padding: 8 },
});
