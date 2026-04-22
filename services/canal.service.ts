import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { Canal, MiembroCanal, CrearCanalRequest } from '@/types/canal.types';

export const canalService = {
  listar: () =>
    api.get<Canal[]>(ENDPOINTS.CANALES),

  obtener: (id: string) =>
    api.get<Canal>(ENDPOINTS.CANAL(id)),

  crear: (data: CrearCanalRequest) =>
    api.post<Canal>(ENDPOINTS.CANALES, data),

  actualizar: (id: string, data: Partial<CrearCanalRequest>) =>
    api.patch<Canal>(ENDPOINTS.CANAL(id), data),

  eliminar: (id: string) =>
    api.delete(ENDPOINTS.CANAL(id)),

  listarMiembros: (id: string) =>
    api.get<MiembroCanal[]>(ENDPOINTS.MIEMBROS(id)),

  agregarMiembro: (canalId: string, usuarioId: string) =>
    api.post(ENDPOINTS.MIEMBROS(canalId), { usuario_id: usuarioId }),

  eliminarMiembro: (canalId: string, usuarioId: string) =>
    api.delete(ENDPOINTS.MIEMBRO(canalId, usuarioId)),
};
