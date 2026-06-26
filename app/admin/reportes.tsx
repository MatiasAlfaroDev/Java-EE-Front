import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { adminService } from '@/services/admin.service';
import { ReporteUso } from '@/types/admin.types';
import { Card } from '@/components/ui/Card';
import { UsageChart } from '@/components/admin/UsageChart';
import { fechaLarga } from '@/utils/fecha';

export default function ReportesScreen() {
  const [reporte, setReporte] = useState<ReporteUso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.reporteUso({ dias: 7 })
      .then(r => setReporte(r.data))
      .finally(() => setLoading(false));
  }, []);

  const totales = reporte.reduce(
    (acc, r) => ({ mensajes: acc.mensajes + r.mensajes, usuarios: acc.usuarios + r.usuarios_activos }),
    { mensajes: 0, usuarios: 0 }
  );

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.titulo}>Reportes de uso</Text>

      {loading ? <ActivityIndicator color={theme.accent} /> : (
        <>
          <View style={s.resumen}>
            <Card style={s.resCard}>
              <Text style={s.resValor}>{totales.mensajes}</Text>
              <Text style={s.resLabel}>Mensajes (7d)</Text>
            </Card>
            <Card style={s.resCard}>
              <Text style={s.resValor}>{totales.usuarios}</Text>
              <Text style={s.resLabel}>Sesiones (7d)</Text>
            </Card>
          </View>

          <Card style={s.chartCard}>
            <Text style={s.seccion}>MENSAJES POR DÍA</Text>
            <UsageChart datos={reporte} />
          </Card>

          <Card>
            <Text style={s.seccion}>DETALLE DIARIO</Text>
            {reporte.map(r => (
              <View key={r.fecha} style={s.detalleRow}>
                <Text style={s.detalleFecha}>{fechaLarga(r.fecha)}</Text>
                <Text style={s.detalleMsgs}>{r.mensajes} msgs</Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: theme.bg },
  content:     { padding: 16, paddingTop: 60, paddingBottom: 100, gap: 16 },
  titulo:      { ...typography.heading, color: theme.text },
  resumen:     { flexDirection: 'row', gap: 12 },
  resCard:     { flex: 1, alignItems: 'center', paddingVertical: 16 },
  resValor:    { ...typography.heading, color: theme.accent },
  resLabel:    { ...typography.caption, color: theme.textMuted, marginTop: 4, textAlign: 'center' },
  chartCard:   {},
  seccion:     { ...typography.label, color: theme.textMuted, marginBottom: 12, textTransform: 'uppercase' },
  detalleRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  detalleFecha: { ...typography.body, color: theme.text },
  detalleMsgs: { ...typography.bodyMd, color: theme.accent },
});
