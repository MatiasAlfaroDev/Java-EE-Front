import { FlatList, StyleSheet, View } from 'react-native';
import { Mensaje } from '@/types/mensaje.types';
import { MessageBubble } from './MessageBubble';
import { Separator } from '@/components/ui/Separator';

interface Props {
  mensajes: Mensaje[];
  usuarioId: string | number;
  onEndReached?: () => void;
  chatId?: string;
}

const shouldShowDate = (cur: Mensaje, prev?: Mensaje): boolean => {
  if (!prev) return true;
  const a = new Date(cur.sent_at).toDateString();
  const b = new Date(prev.sent_at).toDateString();
  return a !== b;
};

export function MessageList({ mensajes, usuarioId, onEndReached }: Props) {
  return (
    <FlatList
      data={mensajes}
      keyExtractor={m => String(m.id)}
      inverted
      renderItem={({ item, index }) => {
        const prev     = mensajes[index + 1];
        const esMio    = item.sender_id === String(usuarioId);
        const showDate = shouldShowDate(item, prev);

        return (
          <View>
            {showDate && (
              <Separator
                label={new Date(item.sent_at).toLocaleDateString('es-PE', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              />
            )}
            <MessageBubble mensaje={item} esMio={esMio} />
          </View>
        );
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      contentContainerStyle={s.list}
    />
  );
}

const s = StyleSheet.create({
  list: { paddingVertical: 8 },
});
