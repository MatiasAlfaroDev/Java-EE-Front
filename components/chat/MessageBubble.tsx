import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Mensaje } from '@/types/mensaje.types';
import { Avatar } from '@/components/ui/Avatar';
import { horaCorta } from '@/utils/fecha';
import { useEffect, useState } from 'react';
import { mensajeService } from '@/services/mensaje.service';

interface Props {
  mensaje: Mensaje;
  esMio: boolean;
  onLongPress?: () => void;
  editing?: boolean;
}

export function MessageBubble({ mensaje, esMio, onLongPress, editing=false }: Props) {
 const estadoIcon = () => {
  if (!esMio) return null;

  if (mensaje.estado === 'PENDIENTE')
    return <Ionicons name="time-outline" size={12} color={theme.textMuted} />;

  if (mensaje.estado === 'RECHAZADO')
    return <Ionicons name="alert-circle-outline" size={12} color={theme.error} />;

  if (!mensaje.entregado)
    return <Ionicons name="checkmark" size={12} color={theme.textMuted} />;

  if (!mensaje.leido)
    return <Ionicons name="checkmark-done-outline" size={12} color={theme.textMuted} />;

  return <Ionicons name="checkmark-done" size={12} color={theme.accent} />;
};
  
  

  
  return (
    <View style={[s.wrap, esMio ? s.wrapMio : s.wrapOtro, editing && s.bubbleEditing]}>
      {!esMio && <Avatar initials={mensaje.sender_initials} size={28} style={s.avatar} />}
      <View style={s.col}>
        {!esMio && <Text style={s.senderName}>{mensaje.sender_username}</Text>}
        <TouchableOpacity
          onLongPress={onLongPress}
          delayLongPress={300}
          activeOpacity={0.85}
          style={[s.bubble, esMio ? s.bubbleMio : s.bubbleOtro]}
        >
           {(mensaje.mensajeOrigenId ?? 0) > 0 && (
              <Text style={s.reenviadoTxt}>
                ↪ Reenviado
              </Text>
            )}
          {mensaje.eliminado
            ? <Text style={[s.content, s.deletedTxt]}>Mensaje eliminado</Text>
            : <Text style={s.content}>{mensaje.contenido ?? ''}</Text>
          }
          <View style={s.meta}>
            {mensaje.editado && <Text style={s.editadoTxt}>editado</Text>}
            <Text style={s.hora}>{horaCorta(mensaje.sent_at)}</Text>
            {esMio && estadoIcon()}
          </View>

        </TouchableOpacity>
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
  meta:       { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  hora:       { ...typography.caption, color: theme.textMuted },
  editadoTxt:  { ...typography.caption, color: theme.textMuted, fontStyle: 'italic' },
  deletedTxt:  { ...typography.body, color: theme.textMuted, fontStyle: 'italic' },
  reenviadoTxt: { ...typography.caption, color: theme.accent, marginBottom: 4, fontStyle: 'italic' },
  bubbleEditing: { borderWidth: 1, borderColor: theme.accent },
});
