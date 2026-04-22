import { create } from 'zustand';

export interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  cuerpo: string;
  leida: boolean;
  created_at: string;
  canal_id?: string;
  mensaje_id?: string;
}

interface NotifState {
  notificaciones: Notificacion[];
  noLeidas: number;
  agregar: (notif: Notificacion) => void;
  setNotificaciones: (notifs: Notificacion[]) => void;
  marcarLeida: (id: string) => void;
  marcarTodasLeidas: () => void;
}

export const useNotifStore = create<NotifState>()((set) => ({
  notificaciones: [],
  noLeidas: 0,

  setNotificaciones: (notificaciones) =>
    set({
      notificaciones,
      noLeidas: notificaciones.filter(n => !n.leida).length,
    }),

  agregar: (notif) =>
    set(s => ({
      notificaciones: [notif, ...s.notificaciones],
      noLeidas: s.noLeidas + (notif.leida ? 0 : 1),
    })),

  marcarLeida: (id) =>
    set(s => ({
      notificaciones: s.notificaciones.map(n =>
        n.id === id ? { ...n, leida: true } : n
      ),
      noLeidas: Math.max(0, s.noLeidas - 1),
    })),

  marcarTodasLeidas: () =>
    set(s => ({
      notificaciones: s.notificaciones.map(n => ({ ...n, leida: true })),
      noLeidas: 0,
    })),
}));
