import { FlatList, StyleSheet, View } from 'react-native';
import { Mensaje } from '@/types/mensaje.types';
import { MessageBubble } from './MessageBubble';
import { Separator } from '@/components/ui/Separator';

interface Props {
  mensajes: Mensaje[];
  usuarioId: number;
  onEndReached?: () => void;
  canalId?: string;
}

const shouldShowDate = (cur: Mensaje, prev?: Mensaje): boolean => {
  if (!prev) return true;
  const a = new Date(cur.fechaEnviado).toDateString();
  const b = new Date(prev.fechaEnviado).toDateString();
  return a !== b;
};

export function MessageList({ mensajes, usuarioId, onEndReached }: Props) {
  return (
    <FlatList
      data={mensajes}
      keyExtractor={m => String(m.id)}
      inverted
      renderItem={({ item, index }) => {
        const prev    = mensajes[index + 1];
        const esMio   = item.emisor.id === usuarioId;
        const showDate = shouldShowDate(item, prev);

        return (
          <View>
            {showDate && (
              <Separator
                label={new Date(item.fechaEnviado).toLocaleDateString('es-PE', {
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
