import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { adminService } from '@/services/admin.service';
import { AuditLog } from '@/types/admin.types';
import { AuditRow } from '@/components/admin/AuditRow';

type Filtro = 'todos' | 'hoy' | 'semana';

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'todos',  label: 'Todos' },
  { key: 'hoy',    label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
];

const desdeParam = (filtro: Filtro): string | undefined => {
  const now = new Date();
  if (filtro === 'hoy')    { now.setHours(0, 0, 0, 0); return now.toISOString(); }
  if (filtro === 'semana') { now.setDate(now.getDate() - 7); return now.toISOString(); }
  return undefined;
};

export default function AuditoriaScreen() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [filtro, setFiltro]     = useState<Filtro>('todos');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await adminService.listarAudit({ desde: desdeParam(filtro) });
      setLogs(res.data);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [filtro]);

  useEffect(() => { setLoading(true); cargar(); }, [cargar]);

  const exportar = async () => {
    try {
      await adminService.exportarAudit();
      Alert.alert('Exportación iniciada', 'El archivo CSV se descargó correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo exportar el log.');
    }
  };

  return (
    <View style={s.root}>
      <View style={s.headerRow}>
        <Text style={s.titulo}>Auditoría</Text>
        <TouchableOpacity style={s.exportBtn} onPress={exportar}>
          <Ionicons name="download-outline" size={16} color={theme.accent} />
          <Text style={s.exportTxt}>Exportar CSV</Text>
        </TouchableOpacity>
      </View>

      <View style={s.filtros}>
        {FILTROS.map(f => (
          <TouchableOpacity key={f.key} style={[s.pill, filtro === f.key && s.pillActive]} onPress={() => setFiltro(f.key)}>
            <Text style={[s.pillTxt, filtro === f.key && s.pillTxtActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={l => String(l.id)}
          renderItem={({ item }) => <AuditRow log={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={theme.accent} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: theme.bg, paddingTop: 60 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
  titulo:     { ...typography.heading, color: theme.text },
  exportBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  exportTxt:  { ...typography.bodyMd, color: theme.accent },
  filtros:    { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  pill:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.panelBg, borderWidth: 1, borderColor: theme.border },
  pillActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  pillTxt:    { ...typography.caption, color: theme.textMuted },
  pillTxtActive: { color: '#fff' },
});
