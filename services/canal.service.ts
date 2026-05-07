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
