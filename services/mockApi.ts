// Mock API — imita la interfaz de los servicios reales devolviendo datos locales.
// Simula latencia de red con un delay de 300-500ms.

import {
  mockUsuarios,
  mockChatsDB,
  mockMensajesDB,
  UsuarioMock,
  ChatMockDB,
  MensajeMock,
} from './mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MockResponse<T> = Promise<{ data: T; status: number }>;

const delay = (ms = 350) => new Promise<void>(res => setTimeout(res, ms));

const ok = async <T>(data: T): MockResponse<T> => {
  await delay(300 + Math.random() * 200);
  return { data, status: 200 };
};

const fail = async (msg: string, status = 400): Promise<never> => {
  await delay(200);
  throw { response: { data: msg, status } };
};

// ─── Estado mutable en memoria ────────────────────────────────────────────────

// Clonamos los datos para que sean mutables durante la sesión
const usuarios: UsuarioMock[] = [...mockUsuarios];
let nextUsuarioId = 5;

const chats: ChatMockDB[] = [...mockChatsDB];
let nextChatId = 5;

// Los mensajes son mutables — se acumulan durante la sesión
const mensajes: Record<number, MensajeMock[]> = Object.fromEntries(
  Object.entries(mockMensajesDB).map(([k, v]) => [Number(k), [...v]])
);
let nextMsgId = 1000;

const getMensajesDeChat = (chatId: number): MensajeMock[] => {
  if (!mensajes[chatId]) mensajes[chatId] = [];
  return mensajes[chatId];
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const mockAuthService = {
  login: (email: string, password: string) => {
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (!usuario) return fail('Credenciales incorrectas', 401);
    return ok({
      token:   `${usuario.id}-token`,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
        estado: usuario.estado,
      },
    });
  },

  register: (nombre: string, email: string, password: string, _rol = 'USER') => {
    if (usuarios.find(u => u.email === email)) {
      return fail('El email ya está registrado', 409);
    }
    const nuevo: UsuarioMock = {
      id:       nextUsuarioId++,
      nombre,
      email,
      password,
      rol:      'USER',
      estado:   'ONLINE',
    };
    usuarios.push(nuevo);
    return ok('Usuario registrado');
  },

  logout: () => ok('Logout exitoso'),
};

// ─── Canales ─────────────────────────────────────────────────────────────────

export const mockCanalService = {
  listar: (userId: number) => {
    const miChats = chats
      .filter(c => c.miembros.includes(userId))
      .map(c => ({ id: c.id, nombre: c.nombre }));
    return ok(miChats);
  },

  crear: (nombre: string, tipo: ChatMockDB['tipo'], miembrosIds: number[]) => {
    const nuevo: ChatMockDB = {
      id:       nextChatId++,
      nombre,
      tipo:     tipo ?? 'GRUPO',
      miembros: miembrosIds,
    };
    chats.push(nuevo);
    mensajes[nuevo.id] = [];
    return ok('Chat creado correctamente');
  },

  agregarMiembro: (_chatId: number, _usuarioId: number) =>
    ok('Miembro agregado correctamente'),

  eliminarMiembro: (_chatId: number, _usuarioId: number) =>
    ok('Miembro eliminado'),
};

// ─── Mensajes ─────────────────────────────────────────────────────────────────

export const mockMensajeService = {
  listar: (chatId: number) => {
    // Ordena ascendente (más antiguo primero) — el store invertirá para la FlatList
    const lista = [...getMensajesDeChat(chatId)].sort(
      (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
    );
    return ok(lista);
  },

  enviar: (
    chatId: number,
    contenido: string,
    senderId: number,
    senderNombre: string
  ) => {
    const nuevo: MensajeMock = {
      id:              `mock-${nextMsgId++}`,
      sender_id:       String(senderId),
      sender_username: senderNombre,
      sender_initials: senderNombre.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      channel_id:      String(chatId),
      content:         contenido,
      content_enc:     contenido,
      iv:              '',
      sent_at:         new Date().toISOString(),
      estado:          'ENVIADO',
      reacciones:      [],
      threads_count:   0,
    };
    getMensajesDeChat(chatId).push(nuevo);
    return ok('Mensaje enviado');
  },
};
