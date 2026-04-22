import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Mensaje } from '@/types/mensaje.types';
import { Avatar } from '@/components/ui/Avatar';
import { ReactionBar } from './ReactionBar';
import { horaCorta } from '@/utils/fecha';

interface Props {
  mensaje: Mensaje;
  esMio: boolean;
  onLongPress?: () => void;
  onThreadPress?: () => void;
}

export function MessageBubble({ mensaje, esMio, onLongPress, onThreadPress }: Props) {
  const eliminado = !!mensaje.deleted_at;
  const editado   = !!mensaje.edited_at;

  const estadoIcon = () => {
    if (mensaje.read_at)      return <Feather name="check-circle" size={12} color={theme.accent} />;
    if (mensaje.delivered_at) return <Feather name="check" size={12} color={theme.textMuted} />;
    if (mensaje.estado === 'PENDIENTE')  return <Feather name="clock" size={12} color={theme.textMuted} />;
    if (mensaje.estado === 'RECHAZADO')  return <Feather name="alert-circle" size={12} color={theme.error} />;
    return null;
  };

  return (
    <View style={[s.wrap, esMio ? s.wrapMio : s.wrapOtro]}>
      {!esMio && <Avatar initials={mensaje.sender_initials} size={28} style={s.avatar} />}
      <View style={s.col}>
        {!esMio && <Text style={s.senderName}>{mensaje.sender_username}</Text>}
        <TouchableOpacity
          onLongPress={onLongPress}
          delayLongPress={300}
          activeOpacity={0.85}
          style={[s.bubble, esMio ? s.bubbleMio : s.bubbleOtro]}
        >
          {eliminado
            ? <Text style={s.deletedTxt}>Mensaje eliminado</Text>
            : <Text style={s.content}>{mensaje.content ?? '…'}</Text>
          }
          <View style={s.meta}>
            {editado && !eliminado && <Text style={s.editadoTxt}>editado</Text>}
            <Text style={s.hora}>{horaCorta(mensaje.sent_at)}</Text>
            {esMio && estadoIcon()}
          </View>
        </TouchableOpacity>

        {mensaje.reacciones.length > 0 && (
          <ReactionBar reacciones={mensaje.reacciones} msgId={mensaje.id} esMio={esMio} />
        )}

        {(mensaje.threads_count ?? 0) > 0 && (
          <TouchableOpacity style={s.threadBtn} onPress={onThreadPress}>
            <Text style={s.threadTxt}>{mensaje.threads_count} respuestas en hilo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:       { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  wrapMio:    { justifyContent: 'flex-end' },
  wrapOtro:   { justifyContent: 'flex-start', gap: 8 },
  avatar:     { marginTop: 4 },
  col:        { maxWidth: '75%' },
  senderName: { ...typography.caption, color: theme.textMuted, marginBottom: 4, marginLeft: 4 },
  bubble:     { padding: 10, gap: 4 },
  bubbleMio:  { backgroundColor: theme.bubbleSent, borderRadius: 16, borderBottomRightRadius: 4 },
  bubbleOtro: { backgroundColor: theme.bubbleRecv, borderRadius: 16, borderTopLeftRadius: 4 },
  content:    { ...typography.body, color: theme.text },
  deletedTxt: { ...typography.body, color: theme.textMuted, fontStyle: 'italic' },
  meta:       { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  hora:       { ...typography.caption, color: theme.textMuted },
  editadoTxt: { ...typography.caption, color: theme.textMuted, fontStyle: 'italic' },
  threadBtn:  { marginTop: 4, marginLeft: 4 },
  threadTxt:  { ...typography.caption, color: theme.accent },
});
