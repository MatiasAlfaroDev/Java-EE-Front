import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { Notificacion } from '@/store/notif.store';

export const notifService = {
  listar: () =>
    api.get<Notificacion[]>(ENDPOINTS.NOTIFS),

  marcarLeida: (id: string) =>
    api.patch(ENDPOINTS.NOTIF_READ(id)),

  marcarTodasLeidas: () =>
    api.patch(ENDPOINTS.NOTIFS_READ_ALL),

  registrarPushToken: (expoPushToken: string) =>
    api.post('/notifications/push-token', { token: expoPushToken }),
};
