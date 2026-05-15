import * as Crypto from 'expo-crypto';

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

const clavesPorchat = new Map<string, CryptoKey>();

const base64ToBytes = (b64: string): Uint8Array<ArrayBuffer> => {
  const bin = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
};

export const cryptoService = {
  generarClave: async (): Promise<CryptoKey> =>
    crypto.subtle.generateKey(
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    ),

  exportarClave: async (key: CryptoKey): Promise<string> => {
    const raw = await crypto.subtle.exportKey('raw', key);
    return bytesToBase64(new Uint8Array(raw));
  },

  importarClave: async (b64: string): Promise<CryptoKey> =>
    crypto.subtle.importKey(
      'raw',
      base64ToBytes(b64),
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    ),

  cifrarMensaje: async (
    texto: string,
    clave: CryptoKey
  ): Promise<{ content_enc: string; iv: string }> => {
    const ivBytes = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));
    const cifrado = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: ivBytes },
      clave,
      new TextEncoder().encode(texto)
    );
    return {
      content_enc: bytesToBase64(new Uint8Array(cifrado)),
      iv: bytesToBase64(ivBytes),
    };
  },

  descifrarMensaje: async (
    content_enc: string,
    iv: string,
    clave: CryptoKey
  ): Promise<string> => {
    const descifrado = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: base64ToBytes(iv) },
      clave,
      base64ToBytes(content_enc)
    );
    return new TextDecoder().decode(descifrado);
  },

  // Gestión de claves por chat (en memoria — en producción se intercambiarían via public_key RSA)
  obtenerClavechat: async (chatId: string): Promise<CryptoKey> => {
    if (clavesPorchat.has(chatId)) return clavesPorchat.get(chatId)!;
    const clave = await crypto.subtle.generateKey(
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
    clavesPorchat.set(chatId, clave);
    return clave;
  },

  guardarClavechat: (chatId: string, clave: CryptoKey) => {
    clavesPorchat.set(chatId, clave);
  },

  randomUUID: (): string => Crypto.randomUUID(),
};
