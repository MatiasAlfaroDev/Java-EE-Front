import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';

export interface ReaccionRequest {
  mensajeId: number;
  emoji: string;
}

export const reaccionService = {

  reaccionar: (
    mensajeId: string | number,
    emoji: string
  ) => {

    return api.post(
      ENDPOINTS.REACCIONES,
      {
        mensajeId: Number(mensajeId),
        emoji,
      }
    );

  },

};