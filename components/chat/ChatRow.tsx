import { Pressable, View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Canal } from '@/types/canal.types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { horaCorta } from '@/utils/fecha';

interface Props {
  canal: Canal;
  onPress: () => void;
  activo?: boolean;
}

export function ChatRow({ canal, onPress, activo }: Props) {
  return (
    <Pressable style={({ pressed }) => [s.row, activo && s.rowActive, pressed && s.rowPressed]} onPress={onPress}>
      <Avatar initials={canal.initials} online={canal.online} size={44} />
      <View style={s.body}>
        <View style={s.top}>
          <Text style={s.nombre} numberOfLines={1}>{canal.nombre}</Text>
          <Text style={s.hora}>{canal.lastMsgTime ? horaCorta(canal.lastMsgTime) : ''}</Text>
        </View>
        <View style={s.bottom}>
          <Text style={s.lastMsg} numberOfLines={1}>{canal.lastMsg ?? ''}</Text>
          {canal.is_ephemeral
            ? <View style={s.enCurso}><Text style={s.enCursoTxt}>En curso</Text></View>
            : <Badge count={canal.unread} />
          }
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  rowActive:  { backgroundColor: theme.activeRow },
  rowPressed: { backgroundColor: theme.activeRow },
  body:       { flex: 1, gap: 4 },
  top:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre:     { ...typography.bodyBold, color: theme.text, flex: 1 },
  hora:       { ...typography.caption, color: theme.textMuted },
  bottom:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg:    { ...typography.body, color: theme.textMuted, flex: 1 },
  enCurso:    { backgroundColor: theme.online + '33', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  enCursoTxt: { fontSize: 10, fontFamily: 'IBMPlexSans-SemiBold', color: theme.online },
});
