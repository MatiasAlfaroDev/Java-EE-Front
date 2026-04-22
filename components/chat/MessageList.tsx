import { FlatList, StyleSheet, View } from 'react-native';
import { Mensaje } from '@/types/mensaje.types';
import { MessageBubble } from './MessageBubble';
import { FileBubble } from './FileBubble';
import { PollBubble } from './PollBubble';
import { Separator } from '@/components/ui/Separator';
import { horaCorta } from '@/utils/fecha';

interface Props {
  mensajes: Mensaje[];
  usuarioId: string;
  onEndReached?: () => void;
  canalId?: string;
}

const shouldShowDate = (cur: Mensaje, prev?: Mensaje): boolean => {
  if (!prev) return true;
  const a = new Date(cur.sent_at).toDateString();
  const b = new Date(prev.sent_at).toDateString();
  return a !== b;
};

export function MessageList({ mensajes, usuarioId, onEndReached, canalId }: Props) {
  return (
    <FlatList
      data={mensajes}
      keyExtractor={m => m.id}
      inverted
      renderItem={({ item, index }) => {
        const prev = mensajes[index + 1];
        const esMio = item.sender_id === usuarioId;
        const showDate = shouldShowDate(item, prev);

        return (
          <View>
            {showDate && <Separator label={new Date(item.sent_at).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })} />}
            {item.encuesta && canalId
              ? <View style={{ paddingHorizontal: 12, marginVertical: 4 }}><PollBubble encuesta={item.encuesta} canalId={canalId} /></View>
              : item.archivo
              ? <View style={[{ paddingHorizontal: 12, marginVertical: 4 }, esMio ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                  <FileBubble archivo={item.archivo} esMio={esMio} />
                </View>
              : <MessageBubble mensaje={item} esMio={esMio} />
            }
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
