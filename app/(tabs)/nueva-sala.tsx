import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { canalService } from '@/services/canal.service';
import { useChatStore } from '@/store/chat.store';
import { Canal } from '@/types/canal.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { TipoChat } from '@/types/canal.types';

type Tipo = 'INDIVIDUAL' | 'GRUPO' | 'PRIVADO';

export default function NuevaSalaScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<{ nombre: string }>();
  const [tipo, setTipo] = useState<Tipo>('GRUPO');
  const [efimero, setEfimero] = useState(false);
  const [loading, setLoading] = useState(false);
  const setCanales = useChatStore(s => s.setCanales);

  const crear = handleSubmit(async data => {
    setLoading(true);
    try {
      await canalService.crear({ nombre: data.nombre, tipo, is_ephemeral: efimero });
      const res = await canalService.listar();
      const canalesMapeados: Canal[] = res.data.map(c => ({
        id:           String(c.id),
        nombre:       c.nombre,
        tipo:         'GRUPO' as const,
        is_ephemeral: false,
        fecha_creado: '',
        unread:       0,
        online:       false,
        initials:     c.nombre.slice(0, 2).toUpperCase(),
      }));
      setCanales(canalesMapeados);
      router.back();
    } finally {
      setLoading(false);
    }
  });

  const tipos: { value: Tipo; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
    { value: 'INDIVIDUAL', label: 'Directo',  icon: 'user' },
    { value: 'GRUPO',      label: 'Grupal',   icon: 'users' },
    { value: 'PRIVADO',    label: 'Privado',  icon: 'lock' },
  ];

  return (
    <View style={s.root}>
      <View style={s.handle} />
      <View style={s.header}>
        <Text style={s.titulo}>Nueva sala</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.label}>TIPO</Text>
        <View style={s.tiposRow}>
          {tipos.map(t => (
            <TouchableOpacity key={t.value} style={[s.tipoBtn, tipo === t.value && s.tipoBtnActive]} onPress={() => setTipo(t.value)}>
              <Feather name={t.icon} size={18} color={tipo === t.value ? '#fff' : theme.textMuted} />
              <Text style={[s.tipoLabel, tipo === t.value && { color: '#fff' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input control={control} name="nombre" label="NOMBRE" placeholder="nombre-de-la-sala" autoCapitalize="none" />

        <View style={s.toggleRow}>
          <View>
            <Text style={s.toggleTitle}>Sala efímera</Text>
            <Text style={s.toggleSub}>Se elimina automáticamente al finalizar</Text>
          </View>
          <Switch value={efimero} onValueChange={setEfimero} trackColor={{ false: theme.border, true: theme.accent }} thumbColor="#fff" />
        </View>

        <Button label="Crear sala" onPress={crear} loading={loading} style={s.btn} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: theme.panelBg, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle:        { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: 'center', marginTop: 10 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  titulo:        { ...typography.title, color: theme.text },
  body:          { padding: 16, gap: 16 },
  label:         { ...typography.label, color: theme.textMuted, textTransform: 'uppercase' },
  tiposRow:      { flexDirection: 'row', gap: 10 },
  tipoBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.bg },
  tipoBtnActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  tipoLabel:     { ...typography.bodyMd, color: theme.textMuted },
  toggleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleTitle:   { ...typography.bodyMd, color: theme.text },
  toggleSub:     { ...typography.caption, color: theme.textMuted, marginTop: 2 },
  btn:           { marginTop: 8 },
});
