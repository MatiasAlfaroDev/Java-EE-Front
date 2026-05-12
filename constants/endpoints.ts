export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'http://192.168.1.14:8080/chat-empresarial/api';

export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ??
  'http://192.168.1.14:8080';

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
