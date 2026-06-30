import { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { EmojiPicker } from './EmojiPicker';
import { Mensaje } from '@/types/mensaje.types';
import { uploadService, ArchivoSubido } from '@/services/upload.service';
import { Alert } from 'react-native';
import { useRecorder } from "@/hooks/useAudioRecorder";
import { mensajeService } from '@/services/mensaje.service';

interface Props {
  chatId: string;
  onSend: (texto: string) => void;
  onSendAdjunto?: (archivo: ArchivoSubido) => void;
  onSendAudio?: (audio: ArchivoSubido) => void;
  onChangeText?: (text: string) => void;
  editingMessage?: Mensaje | null;  
  onCancelEdit?: () => void; 
}

export function InputComposer({ chatId, onSend, onSendAdjunto,    onSendAudio, onChangeText, editingMessage, onCancelEdit, }: Props) {
  const [texto, setTexto] = useState('');
  const [emojiVisible, setEmojiVisible] = useState(false);
  const recorder = useRecorder();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (editingMessage) {
      setTexto(editingMessage.contenido);
    }
  }, [editingMessage]);
  const handleChange = (t: string) => { setTexto(t); onChangeText?.(t); };

  const handleSend = () => {
    if (!texto.trim()) return;

    if (editingMessage) {
      onSend(texto.trim()); // acá será EDIT en el screen
      setTexto('');
      return;
    }

    onSend(texto.trim());
    setTexto('');
  };

  const handleAdjunto = async () => {
  try {
    const archivo = await uploadService.seleccionarYSubir();

    if (!archivo) {
      return;
    }

    onSendAdjunto?.(archivo);

  } catch (error) {
    console.error("Error al subir adjunto:", error);
    Alert.alert(
      "Error",
      "No fue posible subir el archivo."
    );
  }
};

const handleAudio = async () => {
  try {
    if (!recorder.state.isRecording) {
      await recorder.startRecording();
      return;
    }

    const uri = await recorder.stopRecording();
    if (!uri) return;

    const audio = await uploadService.subirArchivo(
      uri,
      `audio-${Date.now()}.m4a`,
      "audio/mp4"
    );

    onSendAudio?.(audio);

  } catch (error) {
    console.error("Error grabando audio:", error);
    Alert.alert("Error", "No fue posible grabar el audio.");
  }
};
  const tieneTexto = texto.trim().length > 0;

  return (
    <View style={[s.root, { paddingBottom: insets.bottom + 10 }]}>
      {editingMessage && (
        <View style={s.editBar}>
          <Text style={s.editText}>
            Editando mensaje
          </Text>

          <TouchableOpacity onPress={onCancelEdit}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={s.row}>

        {/* + abre adjuntos, polls, etc. */}
        <TouchableOpacity style={s.sideBtn} onPress={() => setEmojiVisible(true)}>
          <Ionicons name="add-circle-outline" size={30} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Campo de texto — mismo estilo que el buscador del tab Chats */}
        <View style={s.inputPill}>
          <TextInput
            style={s.input}
            placeholder="Mensaje"
            placeholderTextColor={theme.textMuted}
            value={texto}
            onChangeText={handleChange}
            multiline
            maxLength={4000}
            autoComplete="off"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={s.sideBtn}
          onPress={handleAdjunto}
        >
          <Ionicons
            name="attach-outline"
            size={24}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        {/* Cámara (se oculta cuando hay texto) */}
       {!tieneTexto && (
<>
    <TouchableOpacity style={s.sideBtn}>
        <Ionicons
            name="camera-outline"
            size={28}
            color={theme.textMuted}
        />
    </TouchableOpacity>

    <TouchableOpacity
        style={s.sideBtn}
        onPress={handleAudio}
    >
        <Ionicons
            name={
                recorder.state.isRecording
                    ? "stop-circle"
                    : "mic-outline"
            }
            size={28}
            color={
                recorder.state.isRecording
                    ? "red"
                    : theme.textMuted
            }
        />
    </TouchableOpacity>
</>
)}

        {/* Enviar */}
        <TouchableOpacity
          style={[s.sendBtn, tieneTexto ? s.sendActive : s.sendInactive]}
          onPress={handleSend}
        >
          <Ionicons
            name="paper-plane-outline"
            size={18}
            color={tieneTexto ? '#fff' : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      <EmojiPicker
        visible={emojiVisible}
        onSelect={e => setTexto(t => t + e)}
        onClose={() => setEmojiVisible(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    backgroundColor: theme.panelBg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },

  sideBtn: {
    paddingBottom: 6,
    paddingHorizontal: 2,
  },

  /* Mismo estilo que el buscador del tab Chats */
  inputPill: {
    flex: 1,
    backgroundColor: theme.listBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 130,
    justifyContent: 'center',
  },

  input: {
    ...typography.body,
    color: theme.text,
    paddingVertical: 0,
    maxHeight: 110,
  },

  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendActive:   { backgroundColor: theme.accent },
  sendInactive: { backgroundColor: theme.accent + '4D' },

  editBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    paddingHorizontal: 6,
  },

  editText: {
    color: theme.textMuted,
    fontSize: 12,
  },

  cancelText: {
    color: theme.accent,
    fontSize: 12,
  },
});
