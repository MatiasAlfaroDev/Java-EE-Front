import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Modal, TextInput, Alert, ActivityIndicator, ScrollView, Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Avatar } from '@/components/ui/Avatar';
import { chatService } from '@/services/chat.service';
import { usuarioService, UsuarioBackend } from '@/services/usuario.service';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { MiembroChat } from '@/types/chat.types';

// ─────────────────────────────────────────────────────────────────────────────

export default function GrupoInfoScreen() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre?: string }>();
  const usuario       = useAuthStore(s => s.usuario);
  const renombrarChat = useChatStore(s => s.renombrarChat);

  // nombre
  const [nombreActual, setNombreActual]       = useState(nombre ?? 'Grupo');
  const [editandoNombre, setEditandoNombre]   = useState(false);
  const [nuevoNombre, setNuevoNombre]         = useState(nombre ?? 'Grupo');
  const [guardando, setGuardando]             = useState(false);
  const inputRef = useRef<TextInput>(null);

  // miembros
  const [miembros, setMiembros]               = useState<MiembroChat[]>([]);
  const [loadingMiembros, setLoadingMiembros] = useState(true);

  // modal agregar
  const [modalVisible, setModalVisible]       = useState(false);
  const [disponibles, setDisponibles]         = useState<UsuarioBackend[]>([]);
  const [query, setQuery]                     = useState('');
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [agregando, setAgregando]             = useState<number | null>(null);

  // ── cargar miembros ────────────────────────────────────────────────────────
  const cargarMiembros = useCallback(async () => {
    try {
      setLoadingMiembros(true);
      const res = await chatService.obtenerMiembros(id);
      setMiembros(
        res.data.map(m => ({
          ...m,
          initials: m.initials ?? m.nombre.slice(0, 2).toUpperCase(),
        }))
      );
    } catch {
      // backend pendiente — lista vacía
    } finally {
      setLoadingMiembros(false);
    }
  }, [id]);

  useEffect(() => { cargarMiembros(); }, [cargarMiembros]);

  // ── editar nombre ──────────────────────────────────────────────────────────
  const iniciarEdicion = () => {
    setNuevoNombre(nombreActual);
    setEditandoNombre(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const cancelarEdicion = () => {
    setEditandoNombre(false);
    setNuevoNombre(nombreActual);
  };

  const guardarNombre = async () => {
    const trimmed = nuevoNombre.trim();
    if (!trimmed) { Alert.alert('Error', 'El nombre no puede estar vacío'); return; }
    if (trimmed === nombreActual) { setEditandoNombre(false); return; }
    try {
      setGuardando(true);
      await chatService.renombrar(id, trimmed);
      setNombreActual(trimmed);
      renombrarChat(id, trimmed);
      setEditandoNombre(false);
    } catch {
      Alert.alert('Error', 'No se pudo cambiar el nombre');
    } finally {
      setGuardando(false);
    }
  };

  // ── agregar miembro ────────────────────────────────────────────────────────
  const abrirModal = async () => {
    setLoadingUsuarios(true);
    setQuery('');
    setModalVisible(true);
    try {
      const res = await usuarioService.listar();
      const ids = new Set(miembros.map(m => m.id));
      setDisponibles(
        res.data
          .filter(u => !ids.has(u.id))
          .map(u => ({ ...u, initials: u.nombre.slice(0, 2).toUpperCase() }))
      );
    } catch {
      Alert.alert('Error', 'No se pudo cargar los usuarios');
      setModalVisible(false);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const agregarMiembro = async (uid: number) => {
    try {
      setAgregando(uid);
      await chatService.agregarMiembro(id, String(uid));
      await cargarMiembros();
      setDisponibles(prev => prev.filter(u => u.id !== uid));
    } catch {
      Alert.alert('Error', 'No se pudo agregar el participante');
    } finally {
      setAgregando(null);
    }
  };

  // ── eliminar miembro ───────────────────────────────────────────────────────
  const confirmarEliminar = (m: MiembroChat) =>
    Alert.alert(
      'Eliminar participante',
      `¿Eliminar a ${m.nombre} del grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.eliminarMiembro(id, String(m.id));
              setMiembros(prev => prev.filter(x => x.id !== m.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el participante');
            }
          },
        },
      ]
    );

  // ── salir del grupo ────────────────────────────────────────────────────────
  const salirDelGrupo = () =>
    Alert.alert(
      'Salir del grupo',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.eliminarMiembro(id, String(usuario?.id));
              router.replace('/(tabs)');
            } catch {
              Alert.alert('Error', 'No se pudo salir del grupo');
            }
          },
        },
      ]
    );

  const usuariosFiltrados = disponibles.filter(u =>
    u.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const initials = nombreActual.slice(0, 2).toUpperCase();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBack} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={s.headerTitle}>Información del grupo</Text>

        {editandoNombre && (
          <TouchableOpacity
            style={s.headerSave}
            onPress={guardarNombre}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator size="small" color={theme.accent} />
              : <Ionicons name="checkmark-outline" size={24} color={theme.accent} />
            }
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── FOTO + NOMBRE ── */}
        <View style={s.topCard}>
          {/* Avatar con overlay de cámara (estilo WhatsApp) */}
          <View style={s.avatarWrap}>
            <Avatar initials={initials} size={96} />
            <View style={s.cameraOverlay}>
              <Ionicons name="camera-outline" size={18} color="#fff" />
            </View>
          </View>

          {/* Nombre editable */}
          {editandoNombre ? (
            <View style={s.nameEditWrap}>
              <TextInput
                ref={inputRef}
                style={s.nameInput}
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                maxLength={50}
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={guardarNombre}
                selectionColor={theme.accent}
                underlineColorAndroid={theme.accent}
              />
              <TouchableOpacity onPress={cancelarEdicion} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.nameRow} onPress={iniciarEdicion} activeOpacity={0.7}>
              <Text style={s.groupName}>{nombreActual}</Text>
              <Ionicons name="pencil" size={15} color={theme.textMuted} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}

          <Text style={s.memberCount}>
            {loadingMiembros ? 'Cargando...' : `${miembros.length} participantes`}
          </Text>
        </View>

        {/* ── PARTICIPANTES ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {miembros.length} PARTICIPANTE{miembros.length !== 1 ? 'S' : ''}
          </Text>

          {/* Agregar participante */}
          <TouchableOpacity style={s.addRow} onPress={abrirModal} activeOpacity={0.7}>
            <View style={s.addIcon}>
              <Ionicons name="person-add-outline" size={20} color="#fff" />
            </View>
            <Text style={s.addText}>Agregar participante</Text>
          </TouchableOpacity>

          {/* Lista de miembros */}
          {loadingMiembros ? (
            <ActivityIndicator color={theme.accent} style={{ paddingVertical: 24 }} />
          ) : (
            miembros.map((m, idx) => {
              const isMe = String(m.id) === String(usuario?.id);
              const isLast = idx === miembros.length - 1;
              return (
                <View
                  key={String(m.id)}
                  style={[s.memberRow, isLast && s.memberRowLast]}
                >
                  <Avatar
                    initials={m.initials}
                    online={m.estado === 'ONLINE'}
                    size={46}
                  />
                  <View style={s.memberInfo}>
                    <Text style={s.memberNombre}>
                      {isMe ? 'Tú' : m.nombre}
                    </Text>
                    <Text style={s.memberEmail}>{m.email}</Text>
                  </View>

                  {m.rol && m.rol !== 'MIEMBRO' && (
                    <View style={[
                      s.rolBadge,
                      m.rol === 'CREADOR' && s.rolCreador,
                    ]}>
                      <Text style={s.rolText}>
                        {m.rol === 'CREADOR' ? 'Creador' : 'Admin'}
                      </Text>
                    </View>
                  )}

                  {!isMe && (
                    <TouchableOpacity
                      onPress={() => confirmarEliminar(m)}
                      hitSlop={8}
                      style={s.removeBtn}
                    >
                      <Ionicons name="person-remove-outline" size={18} color={theme.error} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* ── SALIR ── */}
        <View style={s.section}>
          <TouchableOpacity style={s.exitRow} onPress={salirDelGrupo} activeOpacity={0.7}>
            <Ionicons name="exit-outline" size={20} color={theme.error} />
            <Text style={s.exitText}>Salir del grupo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL AGREGAR ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={s.modalBg} onPress={() => setModalVisible(false)}>
          <Pressable style={s.modalBox} onPress={() => {}}>

            <View style={s.modalHandle} />

            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Agregar participante</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close-outline" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={s.searchBar}>
              <Ionicons name="search-outline" size={15} color={theme.textMuted} />
              <TextInput
                style={s.searchInput}
                placeholder="Buscar..."
                placeholderTextColor={theme.textMuted}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            {loadingUsuarios ? (
              <ActivityIndicator color={theme.accent} style={{ paddingVertical: 32 }} />
            ) : (
              <FlatList
                data={usuariosFiltrados}
                keyExtractor={item => String(item.id)}
                style={{ maxHeight: 420 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={s.emptyWrap}>
                    <Text style={s.emptyText}>
                      {disponibles.length === 0
                        ? 'Todos ya son participantes'
                        : 'Sin resultados'}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.modalRow}
                    onPress={() => agregarMiembro(item.id)}
                    disabled={agregando !== null}
                    activeOpacity={0.7}
                  >
                    <Avatar
                      initials={item.nombre.slice(0, 2).toUpperCase()}
                      online={item.estado === 'ONLINE'}
                      size={46}
                    />
                    <View style={s.modalRowInfo}>
                      <Text style={s.memberNombre}>{item.nombre}</Text>
                      <Text style={s.memberEmail}>{item.email}</Text>
                    </View>
                    {agregando === item.id
                      ? <ActivityIndicator size="small" color={theme.accent} />
                      : <View style={s.addCircle}>
                          <Ionicons name="add" size={18} color="#fff" />
                        </View>
                    }
                  </TouchableOpacity>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.panelBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerBack:  { padding: 4 },
  headerTitle: { ...typography.title, color: theme.text, flex: 1, marginLeft: 10 },
  headerSave:  { padding: 4 },

  // top card (avatar + name)
  topCard: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.panelBg,
    borderBottomWidth: 8,
    borderBottomColor: theme.bg,
  },
  avatarWrap: {
    marginBottom: 16,
    position: 'relative',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.panelBg,
  },

  // name display / edit
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  groupName: {
    ...typography.heading,
    color: theme.text,
  },
  nameEditWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.accent,
    marginBottom: 6,
    paddingBottom: 2,
    width: '80%',
    gap: 6,
  },
  nameInput: {
    flex: 1,
    ...typography.heading,
    color: theme.text,
    textAlign: 'center',
    padding: 0,
  },
  memberCount: {
    ...typography.caption,
    color: theme.textMuted,
  },

  // section
  section: {
    backgroundColor: theme.panelBg,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  sectionTitle: {
    ...typography.label,
    color: theme.textMuted,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  // agregar participante row
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  addIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    ...typography.bodyBold,
    color: theme.accent,
  },

  // member row
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  memberRowLast: {
    borderBottomWidth: 0,
  },
  memberInfo: { flex: 1 },
  memberNombre: { ...typography.bodyBold, color: theme.text },
  memberEmail:  { ...typography.caption, color: theme.textMuted },

  rolBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: theme.online + '22',
  },
  rolCreador: {
    backgroundColor: theme.accent + '22',
  },
  rolText: {
    ...typography.label,
    fontSize: 10,
    color: theme.online,
  },
  removeBtn: { padding: 4 },

  // exit row
  exitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  exitText: {
    ...typography.bodyBold,
    color: theme.error,
  },

  // modal
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalBox: {
    backgroundColor: theme.panelBg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '82%',
    paddingBottom: 24,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: { ...typography.heading, color: theme.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    gap: 8,
    backgroundColor: theme.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: theme.text,
    padding: 0,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 12,
  },
  modalRowInfo: { flex: 1 },
  addCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: { ...typography.body, color: theme.textMuted },
});
