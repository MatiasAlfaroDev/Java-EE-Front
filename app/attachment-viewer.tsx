import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Video, ResizeMode } from "expo-av";

export default function AttachmentViewer() {
  const { uri, nombreArchivo } = useLocalSearchParams<{
    uri: string;
    nombreArchivo: string;
  }>();

  if (!uri) {
    return <View style={styles.container} />;
  }

  const decodedUri = decodeURIComponent(uri);
  const decodedNombre = decodeURIComponent(nombreArchivo ?? "");

  const compartir = async () => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(decodedUri);
    }
  };

  const nombre = decodedNombre.toLowerCase();

  const esImagen =
    nombre.endsWith(".jpg") ||
    nombre.endsWith(".jpeg") ||
    nombre.endsWith(".png") ||
    nombre.endsWith(".webp") ||
    nombre.endsWith(".gif");

  const esVideo =
    nombre.endsWith(".mp4") ||
    nombre.endsWith(".mov") ||
    nombre.endsWith(".avi") ||
    nombre.endsWith(".mkv");

  const esPdf = nombre.endsWith(".pdf");

  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.close}
        onPress={() => router.back()}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {esImagen ? (
        <Image
          source={{ uri: decodedUri }}
          style={styles.image}
          resizeMode="contain"
        />

      ) : esVideo ? (

        <View style={styles.videoContainer}>
          <Video
            source={{ uri: decodedUri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        </View>

      ) : (

        <View style={styles.center}>
          <Text style={styles.title}>
            {decodedNombre}
          </Text>

          <Text style={styles.subtitle}>
            {esPdf
              ? "Documento PDF"
              : "Archivo"}
          </Text>

          {esPdf && (
            <Text style={styles.info}>
              📄 Documento PDF
            </Text>
          )}

          {!esPdf && (
            <Text style={styles.info}>
              📎 Archivo adjunto
            </Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={compartir}
          >
            <Text style={styles.buttonText}>
              Abrir / Compartir
            </Text>
          </TouchableOpacity>

        </View>

      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  image: {
    flex: 1,
    width: "100%",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    color: "#bbb",
    marginBottom: 30,
    textAlign: "center",
  },

  info: {
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  close: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  closeText: {
    color: "#fff",
    fontSize: 28,
  },

  video: {
    width: "95%",
    aspectRatio: 16 / 9,
  },

  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});