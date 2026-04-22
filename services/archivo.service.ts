import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { ArchivoAdjunto } from '@/types/mensaje.types';

export const archivoService = {
  subir: (uri: string, mimeType: string, nombre: string) => {
    const form = new FormData();
    form.append('file', { uri, name: nombre, type: mimeType } as unknown as Blob);
    return api.post<ArchivoAdjunto>(ENDPOINTS.ATTACHMENTS, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  obtener: (id: string) =>
    api.get<ArchivoAdjunto>(ENDPOINTS.ATTACHMENT(id)),

  preview: (id: string) =>
    api.get<{ url: string }>(ENDPOINTS.ATTACHMENT_PRV(id)),

  eliminar: (id: string) =>
    api.delete(ENDPOINTS.ATTACHMENT(id)),
};
