import { useEffect, useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

import { API_BASE_URL, ENDPOINTS } from "@/constants/endpoints";
import { theme } from "@/constants/theme";
import { typography } from "@/constants/typography";
import { useAuthStore } from "@/store/auth.store";
import { ArchivoAdjunto } from "@/types/mensaje.types";

interface Props {
  adjunto: ArchivoAdjunto;
  esMio: boolean;
}

export default function AudioMessage({
  adjunto,
  esMio,
}: Props) {
  const token = useAuthStore((s) => s.accessToken);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  async function obtenerAudioLocal() {
    const directory = new FileSystem.Directory(
      FileSystem.Paths.cache
    );

    const file = new FileSystem.File(
      directory,
      adjunto.urlArchivo
    );

    // Ya descargado
    if (file.exists) {
      return file.uri;
    }

    const url =
      `${API_BASE_URL}${ENDPOINTS.ADJUNTO(
        adjunto.urlArchivo
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

    return descargado.uri;
  }

  async function toggleAudio() {
    try {
      // Si ya existe el sonido
      if (sound) {
        const status = await sound.getStatusAsync();

        if (
          status.isLoaded &&
          status.isPlaying
        ) {
          await sound.pauseAsync();
          setPlaying(false);
        } else {
          await sound.playAsync();
          setPlaying(true);
        }

        return;
      }

      const uri = await obtenerAudioLocal();

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      const { sound: nuevo } =
        await Audio.Sound.createAsync(
          {
            uri,
          },
          {
            shouldPlay: true,
          }
        );

      setSound(nuevo);
      setPlaying(true);

      nuevo.setOnPlaybackStatusUpdate(
        (status) => {
          if (!status.isLoaded) return;

          if (status.didJustFinish) {
            setPlaying(false);

            nuevo.unloadAsync();

            setSound(null);
          }
        }
      );

    } catch (e) {
      console.log("ERROR AUDIO", e);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleAudio}
    >
      <Ionicons
        name={
          playing
            ? "pause-circle"
            : "play-circle"
        }
        size={42}
        color={
          esMio
            ? theme.text
            : theme.accent
        }
      />

      <Text style={styles.text}>
        {playing
          ? "Reproduciendo..."
          : "Nota de voz"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  text: {
    ...typography.body,
    color: theme.text,
  },
});