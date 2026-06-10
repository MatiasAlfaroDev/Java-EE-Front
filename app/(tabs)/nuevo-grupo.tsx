import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { usuarioService } from '@/services/usuario.service';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/store/chat.store';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  initials: string;
}

export default function NuevoGrupoScreen() {

  const [query, setQuery] = useState('');
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const usuarioLogueado =
    useAuthStore(s => s.usuario);

  const { setchats } =
    useChatStore();

  useEffect(() => {

    const cargar = async () => {

      try {

        const res =
          await usuarioService.listar();

        const mapeados: Usuario[] =
          res.data.map(u => ({
            ...u,
            initials: u.nombre
              .slice(0, 2)
              .toUpperCase(),
          }));

        setUsuarios(mapeados);

      } catch (e) {

        console.log(
          'error usuarios:',
          e
        );

      } finally {

        setLoading(false);
      }
    };

    cargar();

  }, []);

  const contactos = useMemo(() => {

    return usuarios.filter(
      u =>
        u.id !== Number(usuarioLogueado?.id) &&
        u.nombre
          .toLowerCase()
          .includes(
            query.toLowerCase()
          ),
    );

  }, [
    usuarios,
    query,
    usuarioLogueado,
  ]);

  const toggleUsuario = (
    id: number
  ) => {

    if (
      seleccionados.includes(id)
    ) {

      setSeleccionados(
        seleccionados.filter(
          x => x !== id
        )
      );

    } else {

      setSeleccionados([
        ...seleccionados,
        id,
      ]);
    }
  };

  const crearGrupo = async () => {

    if (!usuarioLogueado) {
      return;
    }

    if (
      !nombreGrupo.trim()
    ) {

      Alert.alert(
        'Error',
        'Ingrese un nombre para el grupo'
      );

      return;
    }

    if (
      seleccionados.length < 1
    ) {

      Alert.alert(
        'Error',
        'Seleccione al menos un usuario'
      );

      return;
    }

    try {

      const res =
        await chatService.crear({

          nombre: nombreGrupo,

          tipo: 'GRUPO',

          miembros: [
            Number(
              usuarioLogueado.id
            ),
            ...seleccionados,
          ],
        });

      const chatCreado =
        res.data as {
          id: number;
        };

      const chatsRes =
        await chatService.listar();

      const chatsMapeados =
        chatsRes.data.map(
          (c: any) => ({
            id: String(c.id),
            nombre: c.nombre,
            tipo: c.tipo,
            initials:
              c.nombre
                .slice(0, 2)
                .toUpperCase(),
            lastMsg:
              c.lastMsg ??
              undefined,
            lastMsgTime:
              c.lastMsgTime ??
              undefined,
            unread:
              c.unread ?? 0,
          })
        );

      setchats(
        chatsMapeados
      );

      router.push({
        pathname: '/(tabs)/chat/[id]',
        params: {
          id:     String(chatCreado.id),
          nombre: nombreGrupo,
          tipo:   'GRUPO',
        },
      });

    } catch (e) {

      console.log(
        'error creando grupo:',
        e
      );

      Alert.alert(
        'Error',
        'No se pudo crear el grupo'
      );
    }
  };

  return (
    <View style={s.root}>

      <View style={s.handle} />

      <View style={s.header}>

        <Text style={s.titulo}>
          Nuevo grupo
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="close-outline"
            size={22}
            color={
              theme.textMuted
            }
          />
        </TouchableOpacity>

      </View>

      <TextInput
        style={s.inputGrupo}
        placeholder="Nombre del grupo"
        placeholderTextColor={theme.textMuted}
        value={nombreGrupo}
        onChangeText={setNombreGrupo}
      />

      <View style={s.searchWrap}>

        <Ionicons
          name="search-outline"
          size={15}
          color={
            theme.textMuted
          }
        />

        <TextInput
          style={s.searchInput}
          placeholder="Buscar usuarios..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
        />

      </View>

        <FlatList
            data={contactos}
            keyExtractor={item =>
                String(item.id)
            }
            contentContainerStyle={{
                paddingBottom: 100,
            }}
            ListEmptyComponent={
                <View style={s.empty}>
                <Text style={s.emptyTxt}>
                    {loading
                    ? 'Cargando...'
                    : 'No hay usuarios'}
                </Text>
                </View>
            }
            renderItem={({ item }) => (

                <TouchableOpacity
                style={s.row}
                onPress={() =>
                    toggleUsuario(item.id)
                }
                >
                <Avatar
                    initials={item.initials}
                    size={44}
                />

                <View style={s.rowInfo}>
                    <Text style={s.rowNombre}>
                    {item.nombre}
                    </Text>

                    <Text style={s.rowNuevo}>
                    {item.email}
                    </Text>
                </View>

                {seleccionados.includes(item.id) && (
                    <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.accent}
                    />
                )}
                </TouchableOpacity>

            )}
            

            ListFooterComponent={
                <TouchableOpacity
                style={s.boton}
                onPress={crearGrupo}
                >
                <Text style={s.botonText}>
                    Crear grupo
                </Text>
                </TouchableOpacity>
            }
            />
        </View>
    );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  handle: {
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginTop: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor:
      theme.border,
  },

  titulo: {
    ...typography.heading,
    color: theme.text,
  },

  inputGrupo: {
    margin: 16,
    backgroundColor:
      theme.inputBg,
    borderWidth: 1,
    borderColor:
      theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor:
      theme.panelBg,
    borderBottomWidth: 1,
    borderBottomColor:
      theme.border,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    backgroundColor:
      theme.inputBg,
    color: theme.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor:
      theme.border,
  },

  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  emptyTxt: {
    color: theme.textMuted,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor:
      theme.border,
    gap: 12,
  },

  rowInfo: {
    flex: 1,
  },

  rowNombre: {
    ...typography.bodyBold,
    color: theme.text,
  },

  rowNuevo: {
    ...typography.caption,
    color:
      theme.textMuted,
  },

  boton: {
    margin: 16,
    backgroundColor: theme.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },

  botonText: {
    color: '#fff',
    fontWeight: '600',
  },
});