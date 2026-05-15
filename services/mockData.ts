// Datos de prueba estáticos que simulan la base de datos del backend

export interface UsuarioMock {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'USER' | 'MANAGER';
  estado: 'ONLINE' | 'OFFLINE';
}

export interface ChatMockDB {
  id: number;
  nombre: string;
  tipo: 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';
  miembros: number[];
}

export interface MensajeMock {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_initials: string;
  channel_id: string;
  content: string;
  content_enc: string;
  iv: string;
  sent_at: string;
  estado: 'ENVIADO' | 'PENDIENTE' | 'RECHAZADO';
  reacciones: [];
  threads_count: 0;
}

// ─── Usuarios ────────────────────────────────────────────────────────────────

export const mockUsuarios: UsuarioMock[] = [
  { id: 1, nombre: 'Demo Admin',   email: 'admin@empresa.com', password: 'Admin123!', rol: 'ADMIN',   estado: 'ONLINE'  },
  { id: 2, nombre: 'María García', email: 'maria@empresa.com', password: 'User123!',  rol: 'USER',    estado: 'ONLINE'  },
  { id: 3, nombre: 'Carlos López', email: 'carlos@empresa.com',password: 'User123!',  rol: 'MANAGER', estado: 'OFFLINE' },
  { id: 4, nombre: 'Ana Torres',   email: 'ana@empresa.com',   password: 'User123!',  rol: 'USER',    estado: 'ONLINE'  },
];

// ─── Chats ───────────────────────────────────────────────────────────────────

export const mockChatsDB: ChatMockDB[] = [
  { id: 1, nombre: 'chat General',     tipo: 'GRUPO',      miembros: [1, 2, 3, 4] },
  { id: 2, nombre: 'Marketing',         tipo: 'GRUPO',      miembros: [1, 2]       },
  { id: 3, nombre: 'María García',      tipo: 'INDIVIDUAL', miembros: [1, 2]       },
  { id: 4, nombre: 'Dev Team',          tipo: 'GRUPO',      miembros: [1, 3, 4]    },
  { id: 5, nombre: 'Proyecto Alpha',    tipo: 'GRUPO',      miembros: [1, 2, 3]    },
  { id: 6, nombre: 'Carlos López',      tipo: 'INDIVIDUAL', miembros: [1, 3]       },
  { id: 7, nombre: 'RRHH',             tipo: 'PRIVADO',    miembros: [1, 4]       },
  { id: 8, nombre: 'Ana Torres',        tipo: 'INDIVIDUAL', miembros: [1, 4]       },
  { id: 9, nombre: 'Soporte Técnico',   tipo: 'GRUPO',      miembros: [1, 2, 4]    },
  { id:10, nombre: 'Gerencia',          tipo: 'PRIVADO',    miembros: [1, 3]       },
];

// ─── Mensajes iniciales ───────────────────────────────────────────────────────

const ahora = Date.now();
const min = 60 * 1000;
const hora = 60 * min;

const msg = (
  id: string,
  senderId: number,
  senderNombre: string,
  channelId: number,
  content: string,
  offsetMs: number
): MensajeMock => ({
  id,
  sender_id:       String(senderId),
  sender_username: senderNombre,
  sender_initials: senderNombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
  channel_id:      String(channelId),
  content,
  content_enc:     content,
  iv:              '',
  sent_at:         new Date(ahora - offsetMs).toISOString(),
  estado:          'ENVIADO',
  reacciones:      [],
  threads_count:   0,
});

// chat General (id=1) — 10 mensajes variados de los últimos 2 días
export const mockMensajesDB: Record<number, MensajeMock[]> = {
  1: [
    msg('m1-1',  1, 'Demo Admin',   1, 'Buen día equipo! Recuerden que hoy a las 3pm tenemos la reunión de sprint review.', 36 * hora + 20 * min),
    msg('m1-2',  2, 'Matias García', 1, 'Confirmado, ya tengo preparadas las métricas de esta semana.', 36 * hora),
    msg('m1-3',  3, 'Carlos López', 1, 'También estaré. Voy a compartir el avance del módulo de reportes.', 35 * hora + 40 * min),
    msg('m1-4',  4, 'Ana Torres',   1, 'Perfecto! Voy a subir los últimos wireframes antes de la reunión.', 35 * hora),
    msg('m1-5',  1, 'Demo Admin',   1, 'Recuerden subir sus avances al tablero antes de las 2:30pm por favor.', 24 * hora + 10 * min),
    msg('m1-6',  2, 'María García', 1, 'Ya subí mi parte. El dashboard de usuarios quedó listo.', 20 * hora),
    msg('m1-7',  3, 'Carlos López', 1, 'Excelente trabajo María! Yo termino mi parte en media hora.', 18 * hora),
    msg('m1-8',  4, 'Ana Torres',   1, 'Estoy revisando los endpoints del módulo de archivos, parece que hay un bug en el upload.', 10 * hora),
    msg('m1-9',  1, 'Demo Admin',   1, 'Ana, abre un ticket con los detalles. Carlos puede revisarlo.', 8 * hora),
    msg('m1-10', 2, 'María García', 1, 'Ticket abierto: CHAT-142. Lo asigno a Carlos?', 2 * hora),
  ],
  2: [
    msg('m2-1', 1, 'Demo Admin',   2, 'María, necesito el reporte de conversión de esta semana.', 5 * hora),
    msg('m2-2', 2, 'María García', 2, 'Lo tengo listo, te lo envío ahora mismo.', 4 * hora + 30 * min),
  ],
  3: [
    msg('m3-1', 2, 'María García', 3, 'Hola! Quedamos en revisar el diseño del login juntos?', 3 * hora),
    msg('m3-2', 1, 'Demo Admin',   3, 'Sí, a las 4pm te parece bien?', 2 * hora + 45 * min),
    msg('m3-3', 2, 'María García', 3, 'Perfecto, nos vemos a las 4.', 2 * hora + 30 * min),
  ],
  4: [
    msg('m4-1', 1, 'Demo Admin',   4, 'Equipo, la integración con el backend está casi lista.', 6 * hora),
    msg('m4-2', 3, 'Carlos López', 4, 'Confirmado, solo falta el módulo de WebSocket.', 5 * hora + 30 * min),
    msg('m4-3', 4, 'Ana Torres',   4, 'Yo estoy probando el flujo de autenticación, va bien.', 4 * hora),
  ],
  5: [
    msg('m5-1', 2, 'María García', 5, 'Arranqué el relevamiento de requerimientos del cliente.', 2 * hora + 10 * min),
    msg('m5-2', 3, 'Carlos López', 5, 'Perfecto, avisen cuando tengamos el scope cerrado.', 1 * hora + 50 * min),
    msg('m5-3', 1, 'Demo Admin',   5, 'Reunión mañana 10am para alinear al equipo.', 45 * min),
  ],
  6: [
    msg('m6-1', 3, 'Carlos López', 6, 'Hola! Tenés el acceso al repositorio de DevOps?', 3 * hora + 30 * min),
    msg('m6-2', 1, 'Demo Admin',   6, 'Sí, te mandé la invitación al mail.', 3 * hora),
  ],
  7: [
    msg('m7-1', 4, 'Ana Torres',   7, 'Adjunto el formulario de evaluación de desempeño Q2.', 1 * hora + 20 * min),
    msg('m7-2', 1, 'Demo Admin',   7, 'Recibido, lo completo hoy.', 55 * min),
  ],
  8: [
    msg('m8-1', 4, 'Ana Torres',   8, 'El bug del módulo de archivos está en producción 😱', 30 * min),
    msg('m8-2', 1, 'Demo Admin',   8, 'Lo veo ahora, dame 10 minutos.', 25 * min),
    msg('m8-3', 4, 'Ana Torres',   8, 'Gracias! Es urgente, el cliente está esperando.', 20 * min),
  ],
  9: [
    msg('m9-1', 2, 'María García', 9, 'Ticket #4821 escalado a nivel 2.', 4 * hora),
    msg('m9-2', 4, 'Ana Torres',   9, 'Tomado, estoy revisando los logs.', 3 * hora + 40 * min),
    msg('m9-3', 1, 'Demo Admin',   9, 'Actualicen el ticket con el estado.', 3 * hora + 20 * min),
  ],
  10: [
    msg('m10-1', 3, 'Carlos López', 10, 'El presupuesto del Q3 necesita aprobación.', 8 * hora),
    msg('m10-2', 1, 'Demo Admin',   10, 'Lo reviso con dirección esta tarde.', 7 * hora + 30 * min),
  ],
};
