import { Pressable, View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Chat } from '@/types/chat.types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { horaCorta } from '@/utils/fecha';

interface Props {
  chat: Chat;
  onPress: () => void;
  activo?: boolean;
  onLongPress?: () => void;
}

export function ChatRow({ chat, onPress, activo, onLongPress }: Props) {

  // 🧠 nombre seguro (fallback incluido)
  const nombreMostrado =
    chat.nombre && chat.nombre.trim().length > 0
      ? chat.nombre
      : 'Chat sin nombre';

  // 🧠 preview de último mensaje
  const previewMensaje =
    chat.lastMsg && chat.lastMsg.trim().length > 0
      ? chat.lastMsg
      : 'Sin mensajes aún';

  return (
    <Pressable
      style={({ pressed }) => [
        s.row,
        activo && s.rowActive,
        pressed && s.rowPressed
      ]}
      onPress={onPress}
      onLongPress={onLongPress}   

    >
      {/* Avatar */}
      <Avatar
        initials={chat.initials}
        online={chat.online}
        size={44}
      />

      {/* Contenido */}
      <View style={s.body}>

        {/* TOP: nombre + hora */}
        <View style={s.top}>
          <Text style={s.nombre} numberOfLines={1}>
            {nombreMostrado}
          </Text>

          <Text style={s.hora}>
            {chat.lastMsgTime ? horaCorta(chat.lastMsgTime) : ''}
          </Text>
        </View>

        {/* BOTTOM: mensaje + badge */}
        <View style={s.bottom}>
          <Text style={s.lastMsg} numberOfLines={1}>
            {previewMensaje}
          </Text>

          <Badge count={chat.unread ?? 0} />
        </View>

      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
  },

  rowActive: {
    backgroundColor: theme.activeRow,
  },

  rowPressed: {
    backgroundColor: theme.activeRow,
  },

  body: {
    flex: 1,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
    paddingBottom: 12,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  nombre: {
    ...typography.bodyBold,
    color: theme.text,
    flex: 1,
    marginRight: 8,
  },

  hora: {
    ...typography.caption,
    color: theme.textMuted,
  },

  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  lastMsg: {
    ...typography.body,
    color: theme.textMuted,
    flex: 1,
    marginRight: 8,
  },
});