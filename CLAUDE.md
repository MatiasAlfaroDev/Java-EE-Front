# ChatEE Mobile — Documentación técnica para Claude Code
**Chat Empresarial · React Native · Grupo 5 UTEC**

> Este archivo es el punto de entrada para Claude Code.
> Leerlo completo antes de generar cualquier archivo del proyecto.

---

## Descripción del proyecto

Aplicación móvil de mensajería empresarial en **React Native + Expo**. Es el cliente Android/iOS del sistema **Chat Empresarial** cuyo backend ya está implementado en **Jakarta EE 10 / WildFly 31**.

Este repositorio es **exclusivamente el cliente móvil**. No genera ni modifica código del backend. Toda la lógica de negocio vive en el servidor; la app solo consume la API REST y la conexión WebSocket.

---

## Decisiones de diseño — DEFINITIVAS

| Decisión | Valor |
|----------|-------|
| Tema visual | **Navy Blue** — único tema, no hay selector de temas |
| Navegación principal | **Tab bar inferior** (Chats · Perfil · Ajustes) |
| Plataformas objetivo | **Android e iOS** |
| Tipografía | IBM Plex Sans + IBM Plex Mono |
| Idioma de la UI | Español |

---

## Tokens de diseño — Tema Navy Blue

Estos valores son los únicos colores válidos en toda la app. No usar colores hardcodeados fuera de este objeto.

```typescript
// constants/theme.ts  — NO hay otros temas, exportar directamente
export const theme = {
  // Fondos
  bg:          '#091525',   // fondo de pantalla
  panelBg:     '#0D1C30',   // cards, modales, headers
  sidebarBg:   '#070F1C',   // (reservado para layouts complejos)
  listBg:      '#0A1828',   // fondo de listas

  // Acento
  accent:      '#3B7DFF',   // botones primarios, links, bordes activos
  accentDark:  '#1D5FD8',   // gradiente secundario del acento

  // Texto
  text:        '#D4E2F4',   // texto principal
  textMuted:   '#6B84A0',   // texto secundario, placeholders, labels

  // Bordes
  border:      '#162540',   // bordes de cards, inputs, separadores

  // Burbujas de mensajes
  bubbleSent:  '#1B4AC8',   // burbuja propia
  bubbleRecv:  '#112030',   // burbuja recibida

  // Inputs
  inputBg:     '#091525',   // fondo de campos de texto

  // Estados
  online:      '#22C55E',   // indicador online / éxito
  error:       '#EF4444',   // errores, suspendido
  warning:     '#F59E0B',   // advertencias

  // Interacciones
  unreadBg:    '#3B7DFF',   // badge de no leídos
  activeRow:   'rgba(59,125,255,0.14)',  // fila seleccionada
  hover:       'rgba(59,125,255,0.08)', // fallback web
} as const;

export type Theme = typeof theme;
```

### Paleta de colores de avatares

```typescript
// utils/avatar.ts
const AVATAR_COLORS = [
  '#1A3558', '#2D1B69', '#0C3344', '#1B3A26',
  '#3B1F2B', '#1F2D3B', '#2B2600', '#1A2D44',
];

export const avatarColor = (str: string): string =>
  AVATAR_COLORS[(str || '').charCodeAt(0) % AVATAR_COLORS.length];
```

---

## Tipografía

```typescript
// constants/typography.ts
export const typography = {
  label:    { fontSize: 11, fontFamily: 'IBMPlexSans-SemiBold', letterSpacing: 0.7 },
  caption:  { fontSize: 11, fontFamily: 'IBMPlexSans-Regular' },
  body:     { fontSize: 13, fontFamily: 'IBMPlexSans-Regular',  lineHeight: 20 },
  bodyMd:   { fontSize: 13, fontFamily: 'IBMPlexSans-Medium' },
  bodyBold: { fontSize: 13, fontFamily: 'IBMPlexSans-SemiBold' },
  title:    { fontSize: 14, fontFamily: 'IBMPlexSans-SemiBold' },
  heading:  { fontSize: 18, fontFamily: 'IBMPlexSans-Bold',     letterSpacing: -0.3 },
  mono:     { fontSize: 12, fontFamily: 'IBMPlexMono-Regular' },
} as const;
```

Fuentes a cargar en el root layout con `expo-font`:
- `IBMPlexSans-Regular`, `IBMPlexSans-Medium`, `IBMPlexSans-SemiBold`, `IBMPlexSans-Bold`
- `IBMPlexMono-Regular`

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | React Native + Expo SDK 51 |
| Navegación | Expo Router v3 (file-based routing) |
| Estado global | Zustand |
| HTTP / REST | Axios con interceptores JWT |
| WebSocket | `@stomp/stompjs` + `sockjs-client` |
| Tokens seguros | `expo-secure-store` |
| Almacenamiento local | `@react-native-async-storage/async-storage` |
| Cifrado E2E | `expo-crypto` + `react-native-quick-crypto` |
| Notificaciones push | `expo-notifications` |
| Animaciones | `react-native-reanimated` v3 |
| Gestos | `react-native-gesture-handler` |
| Íconos | `@expo/vector-icons` — set Feather |
| Tipografía | `expo-font` — IBM Plex Sans + IBM Plex Mono |
| Formularios | `react-hook-form` + `zod` |
| Archivos / imágenes | `expo-image-picker`, `expo-document-picker`, `expo-file-system` |
| Feedback táctil | `expo-haptics` |
| Blur | `expo-blur` (tab bar) |
| Testing | Jest + `@testing-library/react-native` |

---

## Estructura de carpetas

```
chatee-mobile/
├── app/
│   ├── _layout.tsx              # Root layout: fuentes, Zustand, navegación global
│   ├── index.tsx                # Redirect: → /auth/login o → /(tabs)
│   ├── (auth)/
│   │   ├── _layout.tsx          # Stack sin header
│   │   ├── login.tsx            # Login + Registro (tabs internos)
│   │   └── mfa.tsx              # Verificación TOTP 6 dígitos
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigator inferior
│       ├── index.tsx            # Tab Chats — lista de conversaciones
│       ├── perfil.tsx           # Tab Perfil
│       ├── ajustes.tsx          # Tab Ajustes
│       ├── chat/
│       │   └── [id].tsx         # Conversación (stack sobre tabs, sin tab bar)
│       ├── nueva-sala.tsx       # Modal: crear chat / sala efímera
│       └── admin/
│           ├── _layout.tsx      # Solo accesible con rol ADMIN
│           ├── index.tsx        # Resumen métricas
│           ├── usuarios.tsx     # Gestión usuarios
│           ├── auditoria.tsx    # Log de auditoría + exportar
│           ├── canales.tsx      # Gestión canales
│           └── reportes.tsx     # Reportes de uso
├── components/
│   ├── ui/
│   │   ├── Avatar.tsx           # Círculo con iniciales + dot online
│   │   ├── Badge.tsx            # Número de no leídos
│   │   ├── Button.tsx           # Variantes: primary | ghost | danger
│   │   ├── Input.tsx            # TextInput con label y error
│   │   ├── Card.tsx             # Contenedor con panelBg + border
│   │   ├── Tag.tsx              # Chip de rol / estado
│   │   └── Separator.tsx        # Línea con texto de fecha centrada
│   ├── chat/
│   │   ├── ChatRow.tsx          # Fila lista de chats
│   │   ├── MessageBubble.tsx    # Burbuja texto con estado y acciones
│   │   ├── FileBubble.tsx       # Burbuja archivo adjunto
│   │   ├── PollBubble.tsx       # Encuesta interactiva con barras
│   │   ├── ReactionBar.tsx      # Emojis con contadores
│   │   ├── EmojiPicker.tsx      # Picker rápido de 8 emojis
│   │   ├── ThreadSheet.tsx      # Bottom sheet del hilo
│   │   ├── TypingIndicator.tsx  # Tres puntos animados
│   │   ├── InputComposer.tsx    # Barra de composición
│   │   └── MessageList.tsx      # FlatList invertida optimizada
│   ├── notificaciones/
│   │   └── NotifSheet.tsx       # Bottom sheet notificaciones
│   └── admin/
│       ├── AuditRow.tsx
│       ├── UserRow.tsx
│       └── UsageChart.tsx       # Gráfico barras (últimos 7 días)
├── store/
│   ├── auth.store.ts            # Sesión, tokens, usuario
│   ├── chat.store.ts            # Canales, mensajes, typing
│   └── notif.store.ts           # Notificaciones en-app
├── services/
│   ├── api.ts                   # Instancia axios + interceptores JWT
│   ├── auth.service.ts
│   ├── canal.service.ts
│   ├── mensaje.service.ts
│   ├── archivo.service.ts
│   ├── encuesta.service.ts
│   ├── notif.service.ts
│   ├── admin.service.ts
│   ├── websocket.service.ts     # Cliente STOMP/SockJS
│   └── crypto.service.ts        # AES-256-GCM cifrado/descifrado
├── hooks/
│   ├── useAuth.ts
│   ├── useChat.ts               # Mensajes + suscripción WS del canal
│   └── useTyping.ts             # Debounce TYPING_START / TYPING_STOP
├── constants/
│   ├── theme.ts                 # Tokens Navy Blue (único tema)
│   ├── typography.ts
│   ├── endpoints.ts             # URLs de la API
│   └── emojis.ts                # ['👍','❤️','😂','😮','😢','🔥','👏','✅']
├── types/
│   ├── auth.types.ts
│   ├── canal.types.ts
│   ├── mensaje.types.ts
│   └── admin.types.ts
├── utils/
│   ├── fecha.ts                 # Formateo relativo ("hace 2 min")
│   ├── validators.ts            # Esquemas Zod reutilizables
│   └── avatar.ts                # avatarColor(str)
├── assets/fonts/                # IBMPlexSans + IBMPlexMono .ttf
├── .env.local
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## Navegación — Tab bar inferior

```typescript
// app/(tabs)/_layout.tsx

// Tabs visibles para todos los roles:
//   1. Chats     — ícono Feather "message-square"
//   2. Perfil    — ícono Feather "user"
//   3. Ajustes   — ícono Feather "settings"

// Tab adicional solo si usuario.rol === 'ADMIN':
//   4. Admin     — ícono Feather "shield"

// Estilos:
//   - Posición absoluta, bottom 0
//   - Fondo: expo-blur con tint "dark"
//   - Borde superior: theme.border
//   - Ícono activo:   theme.accent
//   - Ícono inactivo: theme.textMuted
//   - Sin labels de texto
//   - expo-haptics en cada press
```

### Flujo de navegación completo

```
app/index.tsx
  ├── No autenticado          → /auth/login
  └── Autenticado
        ├── PENDING_MFA       → /auth/mfa
        └── ACTIVE / OFFLINE  → /(tabs)

/(tabs)
  ├── index.tsx               Lista de chats
  │     ├── Tap canal         → /(tabs)/chat/[id]    (fullscreen, sin tab bar)
  │     └── FAB "+"           → /(tabs)/nueva-sala   (modal)
  ├── perfil.tsx
  ├── ajustes.tsx
  └── admin/ (solo ADMIN)
        ├── index.tsx
        ├── usuarios.tsx
        ├── auditoria.tsx
        ├── canales.tsx
        └── reportes.tsx
```

> `chat/[id].tsx` se presenta como pantalla completa sobre los tabs.
> Usar `{ presentation: 'card' }` en Expo Router para ocultar el tab bar.

---

## Tipos de datos

```typescript
// types/auth.types.ts
export interface Usuario {
  id: string;
  username: string;
  email: string;
  rol: 'USER' | 'MANAGER' | 'ADMIN';
  status: 'PENDING_MFA' | 'ACTIVE' | 'SUSPENDED' | 'OFFLINE';
  public_key: string;
  initials: string;        // derivado en cliente
  created_at: string;
}

export interface SesionTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
```

```typescript
// types/canal.types.ts
export type TipoChat = 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
export type ChatRol  = 'CREADOR' | 'ADMINISTRADOR' | 'MIEMBRO';

export interface Canal {
  id: string;
  nombre: string;
  tipo: TipoChat;
  is_ephemeral: boolean;
  expires_at?: string;
  fecha_creado: string;
  lastMsg?: string;
  lastMsgTime?: string;
  unread: number;
  online: boolean;
  members_count?: number;
  initials: string;
}

export interface MiembroCanal {
  usuario_id: string;
  canal_id: string;
  username: string;
  initials: string;
  rol: ChatRol;
  fecha_unido: string;
  online: boolean;
}
```

```typescript
// types/mensaje.types.ts
export type EstadoMensaje = 'ENVIADO' | 'PENDIENTE' | 'RECHAZADO';

export interface Mensaje {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_initials: string;
  channel_id: string;
  parent_id?: string;
  content_enc: string;     // base64 — NUNCA mostrar en UI
  iv: string;              // base64
  content?: string;        // texto descifrado en cliente — usar este en UI
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  edited_at?: string;
  deleted_at?: string;
  estado: EstadoMensaje;
  reacciones: Reaccion[];
  threads_count?: number;
  archivo?: ArchivoAdjunto;
  encuesta?: Encuesta;
}

export interface Reaccion {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface ArchivoAdjunto {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  scan_result: 'PENDING' | 'CLEAN' | 'INFECTED';
}

export interface Encuesta {
  id: string;
  pregunta: string;
  opciones: OpcionEncuesta[];
  total: number;
  myVote?: string;
  anonima: boolean;
  expires_at: string;
}

export interface OpcionEncuesta {
  id: string;
  texto: string;
  votos: number;
}
```

```typescript
// types/admin.types.ts
export interface UsuarioAdmin {
  id: string;
  username: string;
  email: string;
  rol: 'USER' | 'MANAGER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'OFFLINE' | 'PENDING_MFA';
  departamento: string;
  initials: string;
}

export interface AuditLog {
  id: string;
  usuario: string;
  accion: string;
  entidad: string;
  ip: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}
```

---

## Servicios

### `services/api.ts`

```typescript
import axios from 'axios';
import { API_BASE_URL } from '@/constants/endpoints';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      await useAuthStore.getState().refreshTokens();
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### `services/websocket.service.ts`

```typescript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL } from '@/constants/endpoints';

let stompClient: Client | null = null;

export const conectarWebSocket = (
  token: string,
  onEvento: (tipo: string, payload: unknown) => void
) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws-chat`),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    onConnect: () => {
      stompClient?.subscribe('/user/queue/messages', frame => {
        const data = JSON.parse(frame.body);
        onEvento(data.type, data);
      });
      stompClient?.subscribe('/user/queue/notifications', frame => {
        const data = JSON.parse(frame.body);
        onEvento('NOTIFICATION_NEW', data);
      });
    },
    onStompError: frame => console.error('STOMP error', frame),
  });
  stompClient.activate();
};

export const desconectarWebSocket = () => {
  stompClient?.deactivate();
  stompClient = null;
};

export const ws = {
  enviarMensaje:   (p: object) => stompClient?.publish({ destination: '/app/chat.message', body: JSON.stringify(p) }),
  confirmarRecibo: (p: object) => stompClient?.publish({ destination: '/app/chat.ack',     body: JSON.stringify(p) }),
  confirmarLeido:  (p: object) => stompClient?.publish({ destination: '/app/chat.read',    body: JSON.stringify(p) }),
  typing:          (p: object) => stompClient?.publish({ destination: '/app/chat.typing',  body: JSON.stringify(p) }),
};
```

---

## Stores (Zustand)

### `store/auth.store.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      accessToken: null,
      isAutenticado: false,

      setSession: async (usuario, tokens) => {
        // refresh_token → SecureStore (Keychain / Keystore)
        await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
        // access_token → solo en memoria (Zustand, no persistido)
        set({ usuario, accessToken: tokens.access_token, isAutenticado: true });
      },

      refreshTokens: async () => {
        const rt = await SecureStore.getItemAsync('refresh_token');
        if (!rt) { await get().logout(); return; }
        try {
          const { data } = await authService.refresh(rt);
          await SecureStore.setItemAsync('refresh_token', data.refresh_token);
          set({ accessToken: data.access_token });
        } catch {
          await get().logout();
        }
      },

      logout: async () => {
        const rt = await SecureStore.getItemAsync('refresh_token');
        if (rt) {
          try { await authService.logout(rt); } catch { /* ignorar */ }
          await SecureStore.deleteItemAsync('refresh_token');
        }
        set({ usuario: null, accessToken: null, isAutenticado: false });
      },
    }),
    {
      name: 'chatee-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // NO persistir accessToken
      partialize: state => ({ usuario: state.usuario, isAutenticado: state.isAutenticado }),
    }
  )
);
```

---

## WebSocket — Eventos

### El cliente envía

| Destino STOMP | Payload | Cuándo |
|---------------|---------|--------|
| `/app/chat.message` | `{ channel_id, content_enc, iv, parent_id? }` | Enviar mensaje |
| `/app/chat.ack` | `{ message_id }` | Al recibir mensaje |
| `/app/chat.read` | `{ message_id }` | Al visualizar mensaje |
| `/app/chat.typing` | `{ channel_id, activo: boolean }` | Al escribir / parar |

### El cliente recibe

| Cola | `type` | Acción en store |
|------|--------|-----------------|
| `/user/queue/messages` | `MESSAGE_NEW` | `chat.store.agregarMensaje` |
| `/user/queue/messages` | `MESSAGE_EDITED` | `chat.store.editarMensaje` |
| `/user/queue/messages` | `MESSAGE_DELETED` | `chat.store.marcarEliminado` |
| `/user/queue/messages` | `MESSAGE_DELIVERED` | `chat.store.editarMensaje` |
| `/user/queue/messages` | `MESSAGE_READ` | `chat.store.editarMensaje` |
| `/user/queue/messages` | `REACTION_UPDATED` | `chat.store.actualizarReacciones` |
| `/user/queue/messages` | `TYPING` | `chat.store.setTyping` |
| `/user/queue/notifications` | `NOTIFICATION_NEW` | `notif.store.agregar` |

### Códigos de cierre WebSocket

| Código | Causa |
|--------|-------|
| `4001` | JWT inválido → redirigir a login |
| `4003` | Usuario suspendido |
| `4004` | Canal sin acceso |

---

## Endpoints del backend

```typescript
// constants/endpoints.ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';
export const WS_BASE_URL  = process.env.EXPO_PUBLIC_WS_URL  ?? 'http://10.0.2.2:8080';

export const ENDPOINTS = {
  // Autenticación (público)
  LOGIN:              '/auth/login',
  REGISTER:           '/auth/register',
  MFA_SETUP:          '/auth/mfa/setup',
  MFA_VERIFY:         '/auth/mfa/verify',
  REFRESH:            '/auth/refresh',
  LOGOUT:             '/auth/logout',
  SSO:                '/auth/sso',

  // Canales
  CANALES:            '/channels',
  CANAL:              (id: string)              => `/channels/${id}`,
  MIEMBROS:           (id: string)              => `/channels/${id}/members`,
  MIEMBRO:            (cid: string, uid: string)=> `/channels/${cid}/members/${uid}`,
  MEETINGS:           '/meetings',

  // Mensajes
  MENSAJES:           (canalId: string)         => `/channels/${canalId}/messages`,
  MENSAJE:            (id: string)              => `/messages/${id}`,
  MENSAJE_OFFLINE:    '/messages',

  // Archivos
  ATTACHMENTS:        '/attachments',
  ATTACHMENT:         (id: string)              => `/attachments/${id}`,
  ATTACHMENT_PRV:     (id: string)              => `/attachments/${id}/preview`,

  // Interacciones
  REACTIONS:          (msgId: string)           => `/messages/${msgId}/reactions`,
  POLLS:              (canalId: string)         => `/channels/${canalId}/polls`,
  POLL_VOTE:          (pid: string, oid: string)=> `/polls/${pid}/options/${oid}/votes`,
  POLL_RESULTS:       (pid: string)             => `/polls/${pid}/results`,

  // Notificaciones
  NOTIFS:             '/notifications',
  NOTIFS_READ_ALL:    '/notifications/read',
  NOTIF_READ:         (id: string)              => `/notifications/${id}/read`,

  // Administración
  ADMIN_USERS:        '/admin/users',
  ADMIN_USER_STATUS:  (id: string)              => `/admin/users/${id}/status`,
  ADMIN_AUDIT:        '/admin/audit-logs',
  ADMIN_AUDIT_EXP:    '/admin/audit-logs/export',
  ADMIN_REPORTS:      '/admin/reports/usage',
} as const;
```

### Payloads clave

**`POST /auth/login`**
```json
// Request
{ "email": "usuario@empresa.com", "password": "P@ssw0rd123!" }

// Response sin MFA
{ "access_token": "eyJ...", "refresh_token": "eyJ...", "expires_in": 900 }

// Response con MFA habilitado
{ "mfa_required": true, "challenge_token": "eyJ..." }
```

**`GET /channels/{id}/messages?before=<cursor>&limit=50`**
```json
{
  "data": [ /* Mensaje[] orden DESC */ ],
  "cursor_next": "eyJ...",
  "cursor_prev": "eyJ...",
  "total": 120
}
```

**`POST /messages`** — offline:
```json
{ "channel_id": "uuid", "content_enc": "base64...", "iv": "base64...", "parent_id": null }
```

**`PATCH /admin/users/{id}/status`**
```json
{ "status": "SUSPENDED" }
```

---

## Pantallas — Especificación de diseño

### Login (`app/(auth)/login.tsx`)

- Fondo `theme.bg` con gradiente radial `theme.accent` al 12% en esquina superior derecha.
- Tarjeta centrada: `theme.panelBg`, border radius 16, sombra `rgba(0,0,0,0.4)`.
- Tabs "Iniciar sesión" / "Registrarse": fondo `theme.bg`; activo → fondo `theme.accent` texto blanco.
- Campos: fondo `theme.inputBg`, borde `theme.border`, foco → borde `theme.accent`.
- Labels: uppercase, 11pt SemiBold, `theme.textMuted`, letra espaciada.
- Botón principal: gradiente `theme.accent → theme.accentDark`, sombra coloreada.
- Botón SSO: ghost, borde `theme.border`, texto `theme.textMuted`.
- Footer: `"Jakarta EE 10 · WildFly 31 · AES-256-GCM E2E"`, 11pt, `theme.textMuted`.

**Validaciones Zod:**
```typescript
const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

const registerSchema = z.object({
  username:  z.string().min(3),
  email:     z.string().email(),
  password:  z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmar: z.string(),
}).refine(d => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden', path: ['confirmar'],
});
```

---

### MFA (`app/(auth)/mfa.tsx`)

- Ícono llave: 52×52pt, fondo `theme.accent` al 15%, border radius 14.
- 6 inputs individuales: 44×52pt, `IBMPlexMono-Regular`, borde → `theme.accent` con valor.
- Auto-focus siguiente al escribir, anterior con Backspace.
- Contador regresivo 00:29 en `theme.accent`.
- Envío automático al completar los 6 dígitos.
- Link "Usar código de recuperación" en `theme.textMuted`.

---

### Lista de chats (`app/(tabs)/index.tsx`)

- Header: nombre empresa (izquierda) + avatar usuario con dot online (derecha).
  - Tap avatar → `/perfil`.
  - Tap campana (Feather `bell`) → `NotifSheet` bottom sheet.
- Buscador: fondo `theme.listBg`, placeholder `theme.textMuted`.
- `SectionList` con secciones:
  1. **Salas de reunión** — solo si hay activas; badge "En curso" en `theme.online`.
  2. **Mensajes directos**.
  3. **Canales grupales**.
- `SectionHeader`: 11pt SemiBold uppercase, `theme.textMuted`.
- Pull-to-refresh → `GET /channels`.
- FAB "+" : 56×56pt, border radius 28, fondo `theme.accent`, esquina inferior derecha.

---

### `ChatRow` (`components/chat/ChatRow.tsx`)

```
[Avatar 40pt] [Nombre 13pt bold]          [Hora 11pt muted]
              [Último mensaje truncado]   [Badge / "En curso"]
```

- `Pressable` con `activeOpacity: 0.7`, fondo `theme.activeRow` si activo.
- Badge no leídos: fondo `theme.accent`, texto blanco, 10pt bold.
- Badge "En curso": fondo `theme.online` al 20%, texto `theme.online`.

---

### Conversación (`app/(tabs)/chat/[id].tsx`)

- Header: `theme.panelBg`, avatar 32pt + nombre + estado. Íconos `phone`, `video`, `more-vertical`.
- `FlatList` invertida (`inverted={true}`), `onEndReached` para historial paginado.
- `KeyboardAvoidingView` para Android e iOS.
- `InputComposer` fijo al pie.
- `ThreadSheet` como bottom sheet al tocar "X respuestas en hilo".
- Long press → ActionSheet con opciones según rol (ver más abajo).
- Pantalla completa, sin tab bar.

**Opciones de long press:**
- Todos: Reaccionar, Responder en hilo, Copiar.
- Propio: + Editar, Eliminar.
- ADMIN: + Eliminar cualquier mensaje.

---

### `MessageBubble` (`components/chat/MessageBubble.tsx`)

| Aspecto | Propio (derecha) | Recibido (izquierda) |
|---------|-----------------|----------------------|
| Fondo | `theme.bubbleSent` | `theme.bubbleRecv` |
| Border radius | `16 4 16 16` | `4 16 16 16` |
| Avatar | No | Sí (28pt) |
| Nombre emisor | No | Sí (11pt, `theme.textMuted`) |

**Estados:**
- `edited_at` → etiqueta "editado" 10pt `theme.textMuted`.
- `deleted_at` → texto "Mensaje eliminado" en italics `theme.textMuted`.
- `estado = 'PENDIENTE'` → ícono reloj `theme.textMuted`.
- `estado = 'RECHAZADO'` → ícono alert `theme.error`.
- Leído → `checkcheck` en `theme.accent`; no leído → `theme.textMuted`.

---

### `PollBubble` (`components/chat/PollBubble.tsx`)

- Contenedor: `theme.bubbleRecv`, borde `theme.border`.
- Label "Encuesta": `theme.accent`, 11pt uppercase.
- Radio: 16pt, relleno `theme.accent` al votar.
- Barra de progreso: 4pt, animada con `Animated.timing`, color `theme.accent`.
- Pie: total votos + fecha expiración en `theme.textMuted`.

---

### `InputComposer` (`components/chat/InputComposer.tsx`)

```
[📎] [🖼] [😊] [📊]  [Escribe un mensaje… (E2E cifrado)]  [▶]
─────────────────────────────────────────────────────────────
        🔒 Cifrado de extremo a extremo · AES-256-GCM
```

- Contenedor: `theme.panelBg`, borde `theme.border`, border radius 12.
- Íconos: Feather `paperclip`, `image`, `smile`, `bar-chart-2`, color `theme.textMuted`.
- `TextInput` multiline, máx 6 líneas.
- Botón envío: gradiente cuando hay texto, `theme.accent` al 30% sin texto.
- Debounce 500ms → `ws.typing({ channel_id, activo: true/false })`.

---

### Ajustes (`app/(tabs)/ajustes.tsx`)

- **Cuenta:** Cerrar sesión (botón danger, `theme.error`).
- **Seguridad:** Reconfigurar MFA.
- **Notificaciones:** Toggle push.
- **Sobre la app:** Versión, Grupo 5 UTEC.

> Sin selector de tema. Navy Blue es fijo.

---

### Admin — Usuarios (`app/(tabs)/admin/usuarios.tsx`)

- `FlatList` de `UserRow`: avatar, nombre, email, departamento.
- Tag rol: ADMIN (`theme.accent`), MANAGER (`theme.online`), USER (`theme.textMuted`).
- Tag estado: ACTIVE (verde), SUSPENDED (`theme.error`), OFFLINE (gris).
- Swipe izquierdo → Suspender / Activar (`PATCH /admin/users/{id}/status`).

---

### Admin — Auditoría (`app/(tabs)/admin/auditoria.tsx`)

- Filtros: Todos / Hoy / Esta semana — pill activo fondo `theme.accent`.
- Botón "Exportar CSV" → `GET /admin/audit-logs/export?format=csv`.
- `FlatList` de `AuditRow`: acción en chip monospace fondo `theme.accent` al 15%.

---

## Flujo de cifrado de mensajes

```
ENVÍO:
  texto plano
    → crypto.service.cifrarMensaje(texto, claveCanal)
    → { content_enc, iv }  (ambos base64)
    → [WS activo]  ws.enviarMensaje({ channel_id, content_enc, iv })
    → [WS inactivo] api.post(ENDPOINTS.MENSAJE_OFFLINE, { channel_id, content_enc, iv })

RECEPCIÓN:
  WS → MESSAGE_NEW { content_enc, iv, ... }
    → crypto.service.descifrarMensaje(content_enc, iv, claveCanal)
    → content (texto plano)
    → chat.store.agregarMensaje({ ...mensaje, content })
    → ws.confirmarRecibo({ message_id })
```

**Regla absoluta:** nunca renderizar `content_enc`. Solo usar `mensaje.content`.
Si `content` es `undefined`, mostrar un indicador de descifrado pendiente.

---

## Variables de entorno

```env
# .env.local

# Android Emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
EXPO_PUBLIC_WS_URL=http://10.0.2.2:8080

# iOS Simulator (descomentar)
# EXPO_PUBLIC_API_URL=http://localhost:8080/api
# EXPO_PUBLIC_WS_URL=http://localhost:8080

# Dispositivo físico (reemplazar con IP local)
# EXPO_PUBLIC_API_URL=http://192.168.x.x:8080/api
# EXPO_PUBLIC_WS_URL=http://192.168.x.x:8080
```

---

## Scripts

```bash
npm install           # instalar dependencias
npx expo start        # dev server
npx expo run:android  # build Android
npx expo run:ios      # build iOS
npm test              # tests
npm run lint          # lint
```

---

## Dependencias principales (`package.json`)

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react-native": "0.74.0",
    "zustand": "^4.5.0",
    "axios": "^1.7.0",
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.1",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.4.0",
    "expo-secure-store": "~13.0.0",
    "@react-native-async-storage/async-storage": "~1.23.0",
    "expo-crypto": "~13.0.0",
    "react-native-quick-crypto": "^0.7.0",
    "expo-notifications": "~0.28.0",
    "expo-image-picker": "~15.0.0",
    "expo-document-picker": "~12.0.0",
    "expo-file-system": "~17.0.0",
    "expo-font": "~12.0.0",
    "expo-haptics": "~13.0.0",
    "expo-blur": "~13.0.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-gesture-handler": "~2.16.0",
    "@expo/vector-icons": "^14.0.0"
  }
}
```

---

## Notas críticas

1. **Cifrado:** `content_enc` nunca se muestra. Solo renderizar `mensaje.content` (descifrado en cliente).
2. **Tokens:** `access_token` solo en memoria. `refresh_token` solo en `expo-secure-store`. Nunca en `AsyncStorage`.
3. **Paginación:** cursor-based. 50 mensajes al abrir; más con scroll hacia arriba en `FlatList` invertida.
4. **Admin:** verificar `usuario.rol === 'ADMIN'` en `app/(tabs)/admin/_layout.tsx`. Si no → `router.replace('/(tabs)')`.
5. **Tab Admin:** ocultarla condicionalmente en el tab bar según el rol, no solo por ruta.
6. **Reconexión WS:** `reconnectDelay: 3000`. Al reconectar, recargar mensajes del canal abierto.
7. **Push:** registrar token Expo al login exitoso y enviarlo al backend.
8. **Pantalla conversación:** `{ presentation: 'card' }` para ocultar tab bar.

---

*ChatEE Mobile — Grupo 5 · UTEC · Consume backend Jakarta EE 10 / WildFly 31*
