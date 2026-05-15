import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { useChatStore } from '@/store/chat.store';
import { Avatar } from '@/components/ui/Avatar';

export default function NuevoMensajeScreen() {
  const [query, setQuery] = useState('');
  const chats = useChatStore(s => s.chats);

  // Contactos: chates individuales ya existentes + todos los chates como fallback
  const contactos = useMemo(() => {
    const individuales = chats.filter(c => c.tipo === 'INDIVIDUAL');
    return (individuales.length > 0 ? individuales : chats).filter(c =>
      c.nombre.toLowerCase().includes(query.toLowerCase()),
    );
  }, [chats, query]);

  const abrirChat = (id: string | number) => {
    router.push(`/(tabs)/chat/${id}`);
  };

  return (
    <View style={s.root}>
      {/* Handle */}
      <View style={s.handle} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.titulo}>Nuevo mensaje</Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close-outline" size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={15} color={theme.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar contacto…"
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle-outline" size={15} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de contactos */}
      <FlatList
        data={contactos}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={40} color={theme.textMuted} />
            <Text style={s.emptyTxt}>No se encontraron contactos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.row} onPress={() => abrirChat(item.id)} activeOpacity={0.7}>
            <Avatar initials={item.initials} online={item.online} size={44} />
            <View style={s.rowInfo}>
              <Text style={s.rowNombre}>{item.nombre ?? item.initials}</Text>
              {item.lastMsg ? (
                <Text style={s.rowUltimo} numberOfLines={1}>{item.lastMsg}</Text>
              ) : (
                <Text style={s.rowNuevo}>Iniciar conversación</Text>
              )}
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: theme.panelBg, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: 'center', marginTop: 10 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  titulo:      { ...typography.title, color: theme.text },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 12, height: 40, backgroundColor: theme.listBg, borderRadius: 20, borderWidth: 1, borderColor: theme.border, gap: 8 },
  searchIcon:  {},
  searchInput: { flex: 1, ...typography.body, color: theme.text },
  list:        { paddingBottom: 32 },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  rowInfo:     { flex: 1 },
  rowNombre:   { ...typography.bodyBold, color: theme.text },
  rowUltimo:   { ...typography.caption, color: theme.textMuted, marginTop: 2 },
  rowNuevo:    { ...typography.caption, color: theme.accent, marginTop: 2 },
  separator:   { height: 1, backgroundColor: theme.border, marginLeft: 72 },
  empty:       { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTxt:    { ...typography.body, color: theme.textMuted },
});
