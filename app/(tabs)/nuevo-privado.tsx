import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { usuarioService } from '@/services/usuario.service';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { chatService } from '@/services/chat.service';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  initials: string;
}

export default function NuevoMensajeScreen() {
  const [query, setQuery] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const usuarioLogueado = useAuthStore(s => s.usuario);
  

  // 🔥 TRAER USUARIOS DEL BACKEND
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await usuarioService.listar();

        const mapeados: Usuario[] = res.data.map(u => ({
          ...u,
          initials: u.nombre.slice(0, 2).toUpperCase(),
        }));

        setUsuarios(mapeados);
      } catch (e) {
        console.log('error usuarios:', e);
      } finally {
        setLoading(false);
      }
    };

    cargar(); // primera carga

   /* const interval = setInterval(() => {
      cargar(); // se actualiza cada X tiempo
    }, 3000); // 3 segundos

    return () => clearInterval(interval); */
  }, []);

  const contactos = useMemo(() => {
  return usuarios.filter(
    u =>
      u.id !== Number(usuarioLogueado?.id) &&
      u.nombre.toLowerCase().includes(query.toLowerCase()),
  );
}, [usuarios, query, usuarioLogueado]);

 const abrirChat = async (usuario: Usuario) => {
  try {
    if (!usuarioLogueado) return;

    const res = await chatService.crear({
      nombre: usuario.nombre,
      tipo: 'PRIVADO',
      miembros: [
        Number(usuarioLogueado.id),
        usuario.id,
      ],
    });

    const chatCreado = res.data as {
      id: number;
      nombre: string;
    };

    const chatId = chatCreado.id;

    router.push({
      pathname: '/(tabs)/chat/[id]',
      params: {
        id: String(chatId),
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (e) {
    console.log('error creando chat:', e);
  }
};
  return (
    <View style={s.root}>
      <View style={s.handle} />

      <View style={s.header}>
        <Text style={s.titulo}>Nuevo mensaje</Text>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="close-outline"
            size={22}
            color={theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={s.searchWrap}>
        <Ionicons
          name="search-outline"
          size={15}
          color={theme.textMuted}
        />

        <TextInput
          style={s.searchInput}
          placeholder="Buscar contacto…"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* LISTA */}
      <FlatList
        data={contactos}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTxt}>
              {loading ? 'Cargando...' : 'No hay usuarios'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() => abrirChat(item)}
          >
            <Avatar initials={item.initials} size={44} />

            <View style={s.rowInfo}>
              <Text style={s.rowNombre}>{item.nombre}</Text>

              <Text style={s.rowNuevo}>
                {item.email}
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },

  titulo: {
    ...typography.heading,
    color: theme.text,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.panelBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    backgroundColor: theme.inputBg,
    color: theme.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    ...typography.body,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyTxt: {
    ...typography.body,
    color: theme.textMuted,
  },

  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    alignItems: 'center',
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
    color: theme.textMuted,
    marginTop: 2,
  },
});