import { useState } from "react";
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorderState,
} from "expo-audio";

export function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);

  const [uri, setUri] = useState<string | null>(null);

  async function startRecording() {
    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      throw new Error("Permiso de micrófono denegado.");
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stopRecording() {
    await recorder.stop();

    // 👇 ESTA es la forma correcta en expo-audio
    const recordedUri = (recorder as any).uri ?? null;

    setUri(recordedUri);

    return recordedUri;
  }

  async function cancelRecording() {
    if (state.isRecording) {
      await recorder.stop();
    }

    setUri(null);
  }

  return {
    recorder,
    state,
    uri,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}