export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'http://192.168.1.65:8080/chat-empresarial/api';

export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ??
  'http://192.168.1.65:8080';
export const ENDPOINTS = {
  // Autenticación
  LOGIN:              '/usuarios/login',
  REGISTER:           '/usuarios/registro',
  LOGOUT:             '/usuarios/logout',
  USUARIOS:            '/usuarios/listar',

  // Notificaciones
  NOTIFS:             '/notificaciones',
  NOTIF_READ:         (id: string) => `/notificaciones/${id}/leer`,
  NOTIFS_READ_ALL:    '/notificaciones/leer-todas',

  // Chats
  CHATS:            '/chats',
  CHAT:              (id: string) => `/chats/${id}`,
  AGREGAR_MIEMBRO:    '/chats/agregar-miembro',
  ELIMINAR_MIEMBRO:   '/chats/eliminar-miembro',

  // Mensajes
  MENSAJE_ENVIAR:     '/mensajes/enviar',
  MENSAJES_CHAT: (chatId: string) => `/mensajes/chat/${chatId}`,
  MENSAJE_ENTREGADO: (mensajeId: number) => `/mensajes/${mensajeId}/entregado`,
  MENSAJE_LEIDO: (chatId: number) => `/mensajes/${chatId}/leido`,
} as const;
