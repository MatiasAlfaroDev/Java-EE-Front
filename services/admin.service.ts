import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { UsuarioAdmin, AuditLog, ReporteUso, CambiarStatusRequest } from '@/types/admin.types';

export const adminService = {
  listarUsuarios: () =>
    api.get<UsuarioAdmin[]>(ENDPOINTS.ADMIN_USERS),

  cambiarStatus: (id: string, data: CambiarStatusRequest) =>
    api.patch<UsuarioAdmin>(ENDPOINTS.ADMIN_USER_STATUS(id), data),

  listarAudit: (params?: { desde?: string; hasta?: string }) =>
    api.get<AuditLog[]>(ENDPOINTS.ADMIN_AUDIT, { params }),

  exportarAudit: () =>
    api.get<Blob>(ENDPOINTS.ADMIN_AUDIT_EXP, {
      params: { format: 'csv' },
      responseType: 'blob',
    }),

  reporteUso: (params?: { dias?: number }) =>
    api.get<ReporteUso[]>(ENDPOINTS.ADMIN_REPORTS, { params }),
};
