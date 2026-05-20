import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';

export default function NuevoChatMenu() {
  return (
    <View style={s.root}>

      <Text style={s.title}>Nuevo chat</Text>

      {/* CHAT PRIVADO */}
      <TouchableOpacity
        style={s.option}
        onPress={() => router.push('/(tabs)/nuevo-privado')}
      >
        <Ionicons
          name="person-outline"
          size={24}
          color={theme.accent}
        />

        <View style={s.info}>
          <Text style={s.optionTitle}>Chat privado</Text>
          <Text style={s.optionDesc}>
            Conversación entre dos usuarios
          </Text>
        </View>
      </TouchableOpacity>

      {/* GRUPO */}
      <TouchableOpacity
        style={s.option}
        onPress={() => router.push('/(tabs)/nuevo-grupo')}
      >
        <Ionicons
          name="people-outline"
          size={24}
          color={theme.accent}
        />

        <View style={s.info}>
          <Text style={s.optionTitle}>Crear grupo</Text>
          <Text style={s.optionDesc}>
            Crear conversación grupal
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  title: {
    ...typography.heading,
    color: theme.text,
    marginBottom: 30,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.panelBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 16,
  },

  info: {
    flex: 1,
  },

  optionTitle: {
    ...typography.bodyBold,
    color: theme.text,
  },

  optionDesc: {
    ...typography.caption,
    color: theme.textMuted,
    marginTop: 4,
  },
});