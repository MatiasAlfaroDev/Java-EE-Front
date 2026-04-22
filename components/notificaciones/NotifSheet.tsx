import { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useNotifStore } from '@/store/notif.store';
import { notifService } from '@/services/notif.service';
import { fechaRelativa } from '@/utils/fecha';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NotifSheet({ visible, onClose }: Props) {
  const { notificaciones, setNotificaciones, marcarLeida, marcarTodasLeidas } = useNotifStore();

  useEffect(() => {
    if (!visible) return;
    notifService.listar().then(r => setNotificaciones(r.data));
  }, [visible]);

  const handleLeer = async (id: string) => {
    await notifService.marcarLeida(id);
    marcarLeida(id);
  };

  const handleLeerTodas = async () => {
    await notifService.marcarTodasLeidas();
    marcarTodasLeidas();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.titulo}>Notificaciones</Text>
            <TouchableOpacity onPress={handleLeerTodas}>
              <Text style={s.leerTodas}>Leer todas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 8 }}>
              <Feather name="x" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={notificaciones}
            keyExtractor={n => n.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[s.item, !item.leida && s.itemNoLeida]} onPress={() => handleLeer(item.id)}>
                {!item.leida && <View style={s.dot} />}
                <View style={s.itemBody}>
                  <Text style={s.itemTitulo}>{item.titulo}</Text>
                  <Text style={s.itemCuerpo}>{item.cuerpo}</Text>
                  <Text style={s.itemFecha}>{fechaRelativa(item.created_at)}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={s.vacia}>Sin notificaciones</Text>}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: theme.panelBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '75%' },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: 'center', marginTop: 10 },
  header:       { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  titulo:       { ...typography.title, color: theme.text, flex: 1 },
  leerTodas:    { ...typography.caption, color: theme.accent },
  item:         { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 10 },
  itemNoLeida:  { backgroundColor: theme.activeRow },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent, marginTop: 4 },
  itemBody:     { flex: 1 },
  itemTitulo:   { ...typography.bodyBold, color: theme.text },
  itemCuerpo:   { ...typography.body, color: theme.textMuted, marginTop: 2 },
  itemFecha:    { ...typography.caption, color: theme.textMuted, marginTop: 4 },
  vacia:        { ...typography.body, color: theme.textMuted, textAlign: 'center', padding: 32 },
});
