# Instrucciones para conectar el frontend con el backend

Este documento es una guía de implementación para corregir el frontend (`Java-EE-Front`) y conectarlo al backend (`Lab-Java-EE`). Contiene los cambios exactos a realizar archivo por archivo.

---

## Contexto del proyecto

- **Frontend:** React Native + Expo, Expo Router, Zustand, Axios. Repo: `MatiasAlfaroDev/Java-EE-Front`
- **Backend:** Jakarta EE 10, JAX-RS, WildFly. Base URL: `http://10.0.2.2:8080/api` (emulador Android)
- **Problema:** el frontend fue diseñado para una API REST con convenciones modernas (JWT, `/channels`, `/auth/login`, etc.), pero el backend implementado usa paths y contratos distintos.

---

## Endpoints reales del backend

```
POST   /api/usuarios/login           { email, password }
POST   /api/usuarios/registro        { nombre, email, password, rol }
POST   /api/usuarios/logout          Header: Authorization: <token>
GET    /api/chats                    Header: Authorization: <token>
POST   /api/chats                    { nombre, tipo, usuarios: int[] }
POST   /api/chats/agregar-miembro    { chatId: int, usuarioId: int }
POST   /api/chats/eliminar-miembro   { chatId: int, usuarioId: int }
POST   /api/mensajes/enviar          { chatId: int, contenido: string, tipo: string }
```

**No existen:** MFA, refresh token, SSO, GET mensajes, PATCH/DELETE mensajes, reacciones, archivos, encuestas, notificaciones, admin, WebSocket.

**Token:** el backend genera tokens simples tipo `"1-token"` (id del usuario + "-token"), almacenados en memoria. El backend NO extrae el prefijo `"Bearer "` — este fix ya fue hecho en el backend local (ver nota al final).

**Login response del backend:**
```json
{ "token": "1-token", "usuario": { "id": 1, "nombre": "...", "email": "...", "rol": "...", "estado": "..." } }
```

---

## Cambios a implementar

### 1. `constants/endpoints.ts` — reemplazar completamente

```ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api';
export const WS_BASE_URL  = process.env.EXPO_PUBLIC_WS_URL  ?? 'http://10.0.2.2:8080';

export const ENDPOINTS = {
  // Autenticación
  LOGIN:              '/usuarios/login',
  REGISTER:           '/usuarios/registro',
  LOGOUT:             '/usuarios/logout',

  // Canales
  CANALES:            '/chats',
  CANAL:              (id: string) => `/chats/${id}`,
  AGREGAR_MIEMBRO:    '/chats/agregar-miembro',
  ELIMINAR_MIEMBRO:   '/chats/eliminar-miembro',

  // Mensajes
  MENSAJE_ENVIAR:     '/mensajes/enviar',
} as const;
```

---

### 2. `types/auth.types.ts` — agregar tipo de respuesta del backend

Agregar al final del archivo (sin tocar los tipos existentes):

```ts
// Respuesta real del backend actual
export interface BackendLoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    estado: string;
  };
}
```

---

### 3. `services/auth.service.ts` — reemplazar completamente

```ts
import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { LoginRequest, RegisterRequest, BackendLoginResponse } from '@/types/auth.types';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<BackendLoginResponse>(ENDPOINTS.LOGIN, data),

  register: (data: RegisterRequest) =>
    api.post(ENDPOINTS.REGISTER, {
      nombre: data.username,
      email:  data.email,
      password: data.password,
      rol: 'USER',
    }),

  logout: (token: string) =>
    api.post(ENDPOINTS.LOGOUT, {}, {
      headers: { Authorization: token },
    }),
};
```

---

### 4. `hooks/useAuth.ts` — reemplazar completamente

```ts
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginRequest, RegisterRequest, Usuario } from '@/types/auth.types';
import { router } from 'expo-router';

const mapearUsuario = (u: { id: number; nombre: string; email: string; rol: string }): Usuario => ({
  id:         String(u.id),
  username:   u.nombre,
  email:      u.email,
  rol:        (u.rol as Usuario['rol']) ?? 'USER',
  status:     'ACTIVE',
  public_key: '',
  initials:   u.nombre.slice(0, 2).toUpperCase(),
  created_at: new Date().toISOString(),
});

export const useAuth = () => {
  const { usuario, isAutenticado, logout } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    const { token, usuario: u } = res.data;
    const { setSession } = useAuthStore.getState();
    await setSession(mapearUsuario(u), {
      access_token:  token,
      refresh_token: '',
      expires_in:    86400,
    });
    router.replace('/(tabs)');
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
    router.replace('/(auth)/login');
  };

  const cerrarSesion = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  // MFA y SSO no implementados en el backend actual
  const verificarMfa = async (_challenge_token: string, _code: string) => {
    throw new Error('MFA no implementado en el backend.');
  };

  return { usuario, isAutenticado, login, register, verificarMfa, cerrarSesion };
};
```

---

### 5. `store/auth.store.ts` — simplificar setSession y refreshTokens

Reemplazar completamente:

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, SesionTokens } from '@/types/auth.types';

interface AuthState {
  usuario:       Usuario | null;
  accessToken:   string | null;
  isAutenticado: boolean;
  setSession:    (usuario: Usuario, tokens: SesionTokens) => Promise<void>;
  setUsuario:    (usuario: Usuario) => void;
  refreshTokens: () => Promise<void>;
  logout:        () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario:       null,
      accessToken:   null,
      isAutenticado: false,

      setSession: async (usuario, tokens) => {
        set({ usuario, accessToken: tokens.access_token, isAutenticado: true });
      },

      setUsuario: (usuario) => set({ usuario }),

      // El backend no tiene refresh token — si el token expira, se cierra sesión
      refreshTokens: async () => {
        await get().logout();
      },

      logout: async () => {
        const token = get().accessToken;
        if (token) {
          try { await import('@/services/auth.service').then(m => m.authService.logout(token)); }
          catch { /* ignorar */ }
        }
        set({ usuario: null, accessToken: null, isAutenticado: false });
      },
    }),
    {
      name: 'chatee-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ usuario: state.usuario, isAutenticado: state.isAutenticado }),
    }
  )
);
```

---

### 6. `services/canal.service.ts` — reemplazar completamente

```ts
import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { CrearCanalRequest } from '@/types/canal.types';

// Tipo reducido que devuelve el backend
export interface CanalBackend {
  id:     number;
  nombre: string;
}

export const canalService = {
  listar: () =>
    api.get<CanalBackend[]>(ENDPOINTS.CANALES),

  crear: (data: CrearCanalRequest) =>
    api.post<CanalBackend>(ENDPOINTS.CANALES, {
      nombre:   data.nombre,
      tipo:     data.tipo,
      usuarios: (data.miembros ?? []).map(Number),
    }),

  agregarMiembro: (canalId: string, usuarioId: string) =>
    api.post(ENDPOINTS.AGREGAR_MIEMBRO, {
      chatId:    Number(canalId),
      usuarioId: Number(usuarioId),
    }),

  eliminarMiembro: (canalId: string, usuarioId: string) =>
    api.post(ENDPOINTS.ELIMINAR_MIEMBRO, {
      chatId:    Number(canalId),
      usuarioId: Number(usuarioId),
    }),
};
```

---

### 7. `services/mensaje.service.ts` — reemplazar completamente

```ts
import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';

export interface EnviarMensajeBackend {
  chatId:    number;
  contenido: string;
  tipo:      'TEXTO' | 'IMAGEN' | 'VIDEO' | 'ARCHIVO';
}

export const mensajeService = {
  // El backend solo tiene POST enviar — no hay GET de mensajes por canal
  enviar: (chatId: string, contenido: string, tipo: EnviarMensajeBackend['tipo'] = 'TEXTO') =>
    api.post(ENDPOINTS.MENSAJE_ENVIAR, {
      chatId:    Number(chatId),
      contenido,
      tipo,
    }),
};
```

---

### 8. `app/(tabs)/index.tsx` — adaptar lista de canales al tipo backend

En la pantalla que lista los canales, el `canalService.listar()` ahora devuelve `CanalBackend[]` (`{ id: number, nombre: string }`). Hay que adaptar el mapeo para no usar campos que el backend no devuelve (`tipo`, `unread`, `online`, `initials`, etc.).

Buscar donde se llama `canalService.listar()` y mapear así:

```ts
const canalesBackend = await canalService.listar();
const canales: Canal[] = canalesBackend.data.map(c => ({
  id:           String(c.id),
  nombre:       c.nombre,
  tipo:         'GRUPO' as const,
  is_ephemeral: false,
  fecha_creado: '',
  unread:       0,
  online:       false,
  initials:     c.nombre.slice(0, 2).toUpperCase(),
}));
```

---

### 9. `app/(tabs)/chat/[id].tsx` — adaptar envío de mensajes

El hook `useChat` usa WebSocket y `mensajeService.enviarOffline`. Como el backend no tiene WebSocket ni GET de mensajes, simplificar la pantalla para usar solo REST.

Buscar donde se envía el mensaje y reemplazar por:

```ts
import { mensajeService } from '@/services/mensaje.service';

const enviar = async (texto: string) => {
  await mensajeService.enviar(canalId, texto);
};
```

---

### 10. `app/(tabs)/nueva-sala.tsx` — adaptar creación de canal

El campo `miembros` del formulario debería ser una lista de IDs enteros (el backend los espera como `int[]`). Verificar que el formulario envíe números y no UUIDs.

---

## Qué NO hay que cambiar

- `components/` — todos los componentes UI no dependen de la API directamente
- `constants/theme.ts`, `constants/typography.ts` — sin cambios
- `utils/` — sin cambios
- `types/mensaje.types.ts`, `types/canal.types.ts` — mantener como están (se usan en el store y componentes)
- `app/_layout.tsx` — sin cambios
- `app/index.tsx` — el `DEV_BYPASS = true` puede mantenerse durante desarrollo; cambiar a `false` cuando se quiera probar el login real

---

## Cambio ya aplicado en el backend

En `TokenService.java` ya se corrigió el strip del prefijo `"Bearer "`:

```java
public Long validarToken(String token) {
    if (token == null || token.isBlank()) throw new RuntimeException("Token inválido");
    token = token.trim();
    if (token.startsWith("Bearer ")) token = token.substring(7).trim();
    Long userId = tokens.get(token);
    if (userId == null) throw new RuntimeException("Token inválido");
    return userId;
}
```

---

## Flujo funcional esperado tras los cambios

```
1. Login: POST /api/usuarios/login { email, password }
          ← { token: "1-token", usuario: { id, nombre, email, rol, estado } }
          → se guarda en Zustand como accessToken

2. Axios: cada request agrega  Authorization: Bearer 1-token
          Backend extrae "1-token" → valida en HashMap ✅

3. Listar chats: GET /api/chats
                 ← [{ id: 1, nombre: "..." }]

4. Crear chat: POST /api/chats { nombre, tipo, usuarios: [1, 2] }

5. Enviar mensaje: POST /api/mensajes/enviar { chatId: 1, contenido: "hola", tipo: "TEXTO" }

6. Logout: POST /api/usuarios/logout (con Authorization header)
```

---

## Notas importantes

- El backend NO devuelve los mensajes de un canal (no hay `GET /chats/{id}/messages`). Si se necesita historial, hay que agregar ese endpoint en el backend.
- Los IDs del backend son `int` (1, 2, 3...). En el frontend se convierten a `string` con `String(id)` al mapear, y de vuelta a `int` con `Number(id)` al enviar.
- El cifrado E2E (`cryptoService`) queda deshabilitado: se envía el texto plano como `contenido`. Cuando el backend implemente soporte de cifrado, se reintroduce.
- WebSocket (`websocket.service.ts`) queda sin usar. El backend no tiene `/ws-chat`.
