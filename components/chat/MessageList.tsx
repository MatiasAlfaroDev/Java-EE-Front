import { FlatList, StyleSheet, View } from 'react-native';
import { Mensaje } from '@/types/mensaje.types';
import { MessageBubble } from './MessageBubble';
import { Separator } from '@/components/ui/Separator';
import { useEffect, useRef } from 'react';


interface Props {
  mensajes: Mensaje[];
  usuarioId: string | number;
  onEndReached?: () => void;
  chatId?: string;
  onLongPressMessage?: (mensaje: Mensaje) => void;
  onReactionPress?: (
  emoji: string,
  usuarios: any[]
) => void;
}

const shouldShowDate = (cur: Mensaje, prev?: Mensaje): boolean => {
  if (!prev) return true;
  const a = new Date(cur.sent_at).toDateString();
  const b = new Date(prev.sent_at).toDateString();
  return a !== b;
};

export function MessageList({ mensajes, usuarioId, onEndReached, onLongPressMessage, onReactionPress }: Props) {
  
  const listRef = useRef<FlatList<Mensaje>>(null);

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({
          animated: false,
        });
      }, 50);
    }
  }, [mensajes.length]);

  
  return (
    <FlatList
      ref={listRef}
      data={mensajes}
      keyExtractor={m => String(m.id)}
      //inverted
      renderItem={({ item, index }) => {
        const prev     = index > 0
          ? mensajes[index - 1]
          : undefined;
        const esMio    = String(item.sender_id) === String(usuarioId);
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
            <MessageBubble mensaje={item} esMio={esMio} onLongPress={() => onLongPressMessage?.(item)} onReactionPress={onReactionPress} />
          </View>
        );
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      contentContainerStyle={s.list}
      onContentSizeChange={() =>
        listRef.current?.scrollToEnd({
          animated: false,
        })
      }
    />
  );
}

const s = StyleSheet.create({
  list: { paddingVertical: 8 },
});
