export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'http://192.168.1.5:8080/chat-empresarial/api';

export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ??
  'http://192.168.1.5:8080';
export const ENDPOINTS = {
  // Autenticación
  LOGIN:              '/usuarios/login',
  REGISTER:           '/usuarios/registro',
  LOGOUT:             '/usuarios/logout',
  USUARIOS:            '/usuarios/listar',

  // Usuarios admin
  BLOQUEAR_USUARIO: (id: string | number) => `/usuarios/bloquear/${id}`,
  DESBLOQUEAR_USUARIO: (id: string | number) => `/usuarios/desbloquear/${id}`,

  // Notificaciones
  NOTIFS:             '/notificaciones',
  NOTIF_READ:         (id: string) => `/notificaciones/${id}/leer`,
  NOTIFS_READ_ALL:    '/notificaciones/leer-todas',
  PUSH_TOKEN: '/usuarios/push-token',
  
  // Chats
  CHATS:            '/chats',
  CHAT:              (id: string) => `/chats/${id}`,
  MIEMBROS_CHAT:      (chatId: string) => `/chats/${chatId}/miembros`,
  AGREGAR_MIEMBRO:    '/chats/agregar-miembro',
  ELIMINAR_MIEMBRO:   '/chats/eliminar-miembro',

  // Mensajes
  MENSAJE_ENVIAR:     '/mensajes/enviar',
  MENSAJES_CHAT: (chatId: string) => `/mensajes/chat/${chatId}`,
  MENSAJE_ENTREGADO: (mensajeId: number) => `/mensajes/${mensajeId}/entregado`,
  MENSAJE_LEIDO: (chatId: number) => `/mensajes/${chatId}/leido`,
  MENSAJE_EDITAR: (mensajeId: string) => `/mensajes/${mensajeId}`,
  MENSAJE_ELIMINAR_PARA_MI: (id: string | number) => `/mensajes/${id}/eliminar-para-mi`,
  MENSAJE_ELIMINAR_PARA_TODOS: (id: string | number) => `/mensajes/${id}/eliminar-para-todos`,
  MENSAJE_REENVIAR: (id: string | number) => `/mensajes/${id}/reenviar`,
  REACCIONES: '/reacciones',

  // Adjuntos
  ATTACHMENTS: '/mensajes/upload', 
  ADJUNTO: (objeto: string) => `/mensajes/adjunto/${objeto}`,

} as const;
