export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/chat-empresarial/api';
export const WS_BASE_URL  = process.env.EXPO_PUBLIC_WS_URL  ?? 'http://10.0.2.2:8080';

export const ENDPOINTS = {
  // Autenticación (público)
  LOGIN:              '/usuarios/login',
  REGISTER:           '/usuarios/registro',
//  MFA_SETUP:          '/auth/mfa/setup',
 // MFA_VERIFY:         '/auth/mfa/verify',
 // REFRESH:            '/auth/refresh',
  LOGOUT:             '/usuarios/logout',
 // SSO:                '/auth/sso',

  // Chats
  CANALES:            '/chats',
  CANAL:              (id: string)               => `/chats/${id}`,
  MIEMBROS:           (id: string)               => `/chats/${id}/members`,
  MIEMBRO:            (cid: string, uid: string) => `/chats/${cid}/members/${uid}`,
  MEETINGS:           '/meetings',

  // Mensajes
  MENSAJES:           (canalId: string)          => `/chats/${canalId}/messages`,
  MENSAJE:            (id: string)               => `/messages/${id}`,
  MENSAJE_OFFLINE:    '/messages',

  // Archivos
  ATTACHMENTS:        '/attachments',
  ATTACHMENT:         (id: string)               => `/attachments/${id}`,
  ATTACHMENT_PRV:     (id: string)               => `/attachments/${id}/preview`,

  // Interacciones
  REACTIONS:          (msgId: string)            => `/messages/${msgId}/reactions`,
  POLLS:              (canalId: string)          => `/chats/${canalId}/polls`,
  POLL_VOTE:          (pid: string, oid: string) => `/polls/${pid}/options/${oid}/votes`,
  POLL_RESULTS:       (pid: string)              => `/polls/${pid}/results`,

  // Notificaciones
  NOTIFS:             '/notifications',
  NOTIFS_READ_ALL:    '/notifications/read',
  NOTIF_READ:         (id: string)               => `/notifications/${id}/read`,

  // Administración
  ADMIN_USERS:        '/admin/users',
  ADMIN_USER_STATUS:  (id: string)               => `/admin/users/${id}/status`,
  ADMIN_AUDIT:        '/admin/audit-logs',
  ADMIN_AUDIT_EXP:    '/admin/audit-logs/export',
  ADMIN_REPORTS:      '/admin/reports/usage',
} as const;
