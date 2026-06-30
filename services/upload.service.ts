import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { archivoService } from './archivo.service';

export interface ArchivoSubido {
  urlArchivo: string;
  nombreArchivo: string;
  tamanoArchivo: number;
  mimeType: string;
}

export const uploadService = {

  async subirArchivo(
    uri: string,
    nombreArchivo: string,
    mimeType: string
  ): Promise<ArchivoSubido> {

    const contenidoBase64 = await FileSystem.readAsStringAsync(
      uri,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    const response = await archivoService.subir(
      contenidoBase64,
      mimeType,
      nombreArchivo
    );

    return {
      ...response.data,
      mimeType,
    };
  },

  async seleccionarYSubir(): Promise<ArchivoSubido | null> {

    const resultado = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (resultado.canceled) {
      return null;
    }

    const archivo = resultado.assets[0];

    if (!archivo.uri) {
      throw new Error('No se pudo obtener el archivo.');
    }

    return this.subirArchivo(
      archivo.uri,
      archivo.name,
      archivo.mimeType ?? 'application/octet-stream'
    );
  },

};