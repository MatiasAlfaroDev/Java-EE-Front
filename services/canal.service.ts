import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { CrearCanalRequest } from '@/types/canal.types';
import { USE_MOCK_API } from '@/constants/dev';
import { mockCanalService } from './mockApi';
import { useAuthStore } from '@/store/auth.store';

// Tipo reducido que devuelve el backend
export interface CanalBackend {
  id:     number;
  nombre: string;
}

export const canalService = {
  listar: () => {
    if (USE_MOCK_API) {
      const usuario = useAuthStore.getState().usuario;
      return mockCanalService.listar(Number(usuario?.id ?? 0));
    }
    return api.get<CanalBackend[]>(ENDPOINTS.CANALES);
  },

  crear: (data: CrearCanalRequest) => {
    if (USE_MOCK_API) {
      return mockCanalService.crear(
        data.nombre,
        (data.tipo as 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO') ?? 'GRUPO',
        (data.miembros ?? []).map(Number)
      );
    }
    return api.post<CanalBackend>(ENDPOINTS.CANALES, {
      nombre:   data.nombre,
      tipo:     data.tipo,
      usuarios: (data.miembros ?? []).map(Number),
    });
  },

  agregarMiembro: (canalId: string, usuarioId: string) =>
    USE_MOCK_API
      ? mockCanalService.agregarMiembro(Number(canalId), Number(usuarioId))
      : api.post(ENDPOINTS.AGREGAR_MIEMBRO, {
          chatId:    Number(canalId),
          usuarioId: Number(usuarioId),
        }),

  eliminarMiembro: (canalId: string, usuarioId: string) =>
    USE_MOCK_API
      ? mockCanalService.eliminarMiembro(Number(canalId), Number(usuarioId))
      : api.post(ENDPOINTS.ELIMINAR_MIEMBRO, {
          chatId:    Number(canalId),
          usuarioId: Number(usuarioId),
        }),
};
