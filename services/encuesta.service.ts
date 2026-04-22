import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { Encuesta } from '@/types/mensaje.types';

interface CrearEncuestaRequest {
  pregunta: string;
  opciones: string[];
  anonima?: boolean;
  expires_at?: string;
}

export const encuestaService = {
  crear: (canalId: string, data: CrearEncuestaRequest) =>
    api.post<Encuesta>(ENDPOINTS.POLLS(canalId), data),

  votar: (pollId: string, opcionId: string) =>
    api.post(ENDPOINTS.POLL_VOTE(pollId, opcionId)),

  resultados: (pollId: string) =>
    api.get<Encuesta>(ENDPOINTS.POLL_RESULTS(pollId)),
};
