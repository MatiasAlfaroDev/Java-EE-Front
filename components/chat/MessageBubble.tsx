import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { Mensaje } from '@/types/mensaje.types';
import { Avatar } from '@/components/ui/Avatar';
import { horaCorta } from '@/utils/fecha';
import { archivoService } from '@/services/archivo.service';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_BASE_URL, ENDPOINTS } from '@/constants/endpoints';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import AudioMessage from "@/components/chat/AudioMessage";

interface Props {
  mensaje: Mensaje;
  esMio: boolean;
  onLongPress?: () => void;
  editing?: boolean;

  onReactionPress?: (
    emoji: string,
    usuarios: any[]
  ) => void;
}

export function MessageBubble({ mensaje, esMio, onLongPress, editing=false, onReactionPress }: Props) {
 const estadoIcon = () => {
  if (!esMio) return null;

  if (mensaje.estado === 'PENDIENTE')
    return <Ionicons name="time-outline" size={12} color={theme.textMuted} />;

  if (mensaje.estado === 'RECHAZADO')
    return <Ionicons name="alert-circle-outline" size={12} color={theme.error} />;

  if (!mensaje.entregado)
    return <Ionicons name="checkmark" size={12} color={theme.textMuted} />;

  if (!mensaje.leido)
    return <Ionicons name="checkmark-done-outline" size={12} color={theme.textMuted} />;

  return <Ionicons name="checkmark-done" size={12} color={theme.accent} />;
};
  
   // ✅ SIEMPRE array seguro
  const reacciones = Array.isArray(mensaje.reacciones)
    ? mensaje.reacciones
    : [];

  // ✅ Agrupar por emoji
  const agrupadas = Object.values(
    reacciones.reduce((acc: Record<string, any>, r) => {
      if (!r?.emoji) return acc;

      if (!acc[r.emoji]) {
        acc[r.emoji] = {
          emoji: r.emoji,
          usuarios: [],
        };
      }

      acc[r.emoji].usuarios.push(r);

      return acc;
    }, {})
  );

  const token = useAuthStore(state => state.accessToken);

  const [imagenLocal, setImagenLocal] = useState<string | null>(null);
  
  const nombreArchivo = mensaje.adjunto?.nombreArchivo?.toLowerCase() ?? "";

  const esImagen = mensaje.tipo === "IMAGEN";

  const esVideo = mensaje.tipo === "VIDEO";

    useEffect(() => {

      if (!esImagen || !mensaje.adjunto) {
        return;
      }

      const adjunto = mensaje.adjunto;

      const descargar = async () => {

        try {

          const url =
            `${API_BASE_URL}${ENDPOINTS.ADJUNTO(mensaje.adjunto!.urlArchivo)}`;

          const directorio = new FileSystem.Directory(
              FileSystem.Paths.cache
          );

          const destino = new FileSystem.File(
              directorio,
              adjunto.urlArchivo
          );

          if (!destino.exists) {

              await FileSystem.File.downloadFileAsync(
                  url,
                  destino,
                  {
                      headers: {
                          Authorization: token ?? "",
                      },
                  }
              );

          }

          setImagenLocal(destino.uri);

        } catch (e) {
          console.log("Error descargando miniatura", e);
        }

      };

      descargar();

    }, [mensaje.id]);
    
  const abrirAdjunto = async () => {
  if (!mensaje.adjunto) return;

  try {
    const url =
      `${API_BASE_URL}${ENDPOINTS.ADJUNTO(mensaje.adjunto.urlArchivo)}`;

    const directorio = new FileSystem.Directory(FileSystem.Paths.cache);

    const destino = new FileSystem.File(
      directorio,
      mensaje.adjunto.urlArchivo
    );

    // Si no existe, lo descarga
    if (!destino.exists) {
      await FileSystem.File.downloadFileAsync(
        url,
        destino,
        {
          headers: {
            Authorization: token ?? "",
          },
        }
      );
    }

    if (!(await Sharing.isAvailableAsync())) {
      alert("No se puede abrir el archivo.");
      return;
    }

    router.push({
      pathname: "/attachment-viewer",
      params: {
        uri: encodeURIComponent(destino.uri),
        nombreArchivo: encodeURIComponent(
          mensaje.adjunto.nombreArchivo
        ),
      },
    });

  } catch (e) {
    console.log("Error abriendo adjunto", e);
  }
};
  

const obtenerAudioLocal = async (): Promise<string> => {
  if (!mensaje.adjunto) {
    throw new Error("No hay adjunto");
  }

  const directory = new FileSystem.Directory(FileSystem.Paths.cache);
  const file = new FileSystem.File(
    directory,
    mensaje.adjunto.urlArchivo
  );

  // Si ya existe, reutilizarlo
  if (file.exists) {
    console.log("Audio en cache:", file.uri);
    return file.uri;
  }

  console.log("Descargando audio...");

  const url =
    `${API_BASE_URL}${ENDPOINTS.ADJUNTO(
      mensaje.adjunto.urlArchivo
    )}`;

  const descargado =
    await FileSystem.File.downloadFileAsync(
      url,
      directory,
      {
        headers: {
          Authorization: token ?? "",
        },
      }
    );

  console.log("Audio descargado:", descargado.uri);

  return descargado.uri;
};


  return (
    <View style={[s.wrap, esMio ? s.wrapMio : s.wrapOtro, editing && s.bubbleEditing]}>
      {!esMio && <Avatar initials={mensaje.sender_initials} size={28} style={s.avatar} />}
      <View style={s.col}>
        {!esMio && <Text style={s.senderName}>{mensaje.sender_username}</Text>}
        <TouchableOpacity
          onLongPress={onLongPress}
          delayLongPress={300}
          activeOpacity={0.85}
          style={[s.bubble, esMio ? s.bubbleMio : s.bubbleOtro]}
        >
           {(mensaje.mensajeOrigenId ?? 0) > 0 && (
              <Text style={s.reenviadoTxt}>
                ↪ Reenviado
              </Text>
            )}
          {mensaje.eliminado ? (
            <Text style={[s.content, s.deletedTxt]}>
              Mensaje eliminado
            </Text>
          ) : esImagen ? (

          <TouchableOpacity onPress={abrirAdjunto}>
            <Image
              source={{ uri: imagenLocal ?? "" }}
              style={s.imagen}
              contentFit="cover"
            />
          </TouchableOpacity>

          ) : esVideo ? (

          <TouchableOpacity
            style={s.video}
            onPress={abrirAdjunto}
          >

          <Ionicons
            name="play-circle"
            size={70}
            color="white"
          />

          <Text style={s.videoNombre}>
            {mensaje.adjunto?.nombreArchivo}
          </Text>

          </TouchableOpacity>

          )  : mensaje.tipo === "AUDIO" && mensaje.adjunto ? (

            <AudioMessage
              adjunto={mensaje.adjunto}
              esMio={esMio}
            />


            ) : mensaje.tipo === "ARCHIVO" ? (

          <TouchableOpacity onPress={abrirAdjunto}>

          <Text style={s.content}>
          📎 {mensaje.adjunto?.nombreArchivo}
          </Text>

          </TouchableOpacity>
          ) : (
            <Text style={s.content}>
              {mensaje.contenido ?? ''}
            </Text>
          )}
          <View style={s.meta}>
            {mensaje.editado && <Text style={s.editadoTxt}>editado</Text>}
            <Text style={s.hora}>{horaCorta(mensaje.sent_at)}</Text>
            {esMio && estadoIcon()}
          </View>

        </TouchableOpacity>

            {/* REACCIONES */}
        {agrupadas.length > 0 && (
          <View style={s.reaccionesContainer}>
            {agrupadas.map((grupo: any) => (
             <TouchableOpacity
                  key={grupo.emoji}
                  style={s.reaccion}
                  onPress={() =>
                    onReactionPress?.(
                      grupo.emoji,
                      grupo.usuarios
                    )
                  }
                >
                <Text>
                  {grupo.emoji} {grupo.usuarios.length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12 },
  wrapMio: { justifyContent: 'flex-end' },
  wrapOtro: { justifyContent: 'flex-start', gap: 8 },
  avatar: { marginTop: 4 },
  col: { maxWidth: '75%' },

  senderName: {
    ...typography.caption,
    color: theme.textMuted,
    marginBottom: 4,
    marginLeft: 4,
  },

  bubble: { padding: 10, gap: 4 },
  bubbleMio: {
    backgroundColor: theme.bubbleSent,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleOtro: {
    backgroundColor: theme.bubbleRecv,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },

  content: { ...typography.body, color: theme.text },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },

  hora: { ...typography.caption, color: theme.textMuted },
  editadoTxt: { ...typography.caption, color: theme.textMuted, fontStyle: 'italic' },
  deletedTxt: { ...typography.body, color: theme.textMuted, fontStyle: 'italic' },

  reenviadoTxt: { ...typography.caption, color: theme.accent, marginBottom: 4, fontStyle: 'italic' },


  bubbleEditing: {
    borderWidth: 1,
    borderColor: theme.accent,
  },

  imagen: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },

  video: {
    width: 220,
    height: 180,
    borderRadius: 12,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },

  videoNombre: {
    color: "white",
    marginTop: 10,
  },

  reaccionesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  reaccion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  audioContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingVertical: 6,
  paddingHorizontal: 4,
},

audioText: {
  ...typography.body,
  color: theme.text,
},
});
