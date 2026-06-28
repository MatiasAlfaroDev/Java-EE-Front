import { api } from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { ArchivoAdjunto } from '@/types/mensaje.types';

export const archivoService = {
  subir: (
  contenidoBase64: string,
  mimeType: string,
  nombreArchivo: string
  ) => {

    return api.post<ArchivoAdjunto>(
      ENDPOINTS.ATTACHMENTS,
      {
        nombreArchivo,
        mimeType,
        contenidoBase64,
      }
    );
  },

 descargar: (objeto: string) =>
    api.get(ENDPOINTS.ADJUNTO(objeto), {
      responseType: 'arraybuffer',
    }),

 /* preview: (id: string) =>
    api.get<{ url: string }>(ENDPOINTS.ATTACHMENT_PRV(id)),

  eliminar: (id: string) =>
    api.delete(ENDPOINTS.ATTACHMENT(id)),
*/}; 
