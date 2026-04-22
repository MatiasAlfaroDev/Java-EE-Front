import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { adminService } from '@/services/admin.service';
import { ReporteUso } from '@/types/admin.types';
import { Card } from '@/components/ui/Card';
import { UsageChart } from '@/components/admin/UsageChart';

export default function AdminIndexScreen() {
  const [reporte, setReporte] = useState<ReporteUso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.reporteUso({ dias: 7 })
      .then(r => setReporte(r.data))
      .finally(() => setLoading(false));
  }, []);

  const ultimo = reporte[reporte.length - 1];

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.titulo}>Panel Admin</Text>

      {loading ? <ActivityIndicator color={theme.accent} /> : (
        <>
          <View style={s.metricas}>
            {[
              { label: 'Mensajes hoy', valor: ultimo?.mensajes ?? 0, icon: 'message-square' },
              { label: 'Usuarios activos', valor: ultimo?.usuarios_activos ?? 0, icon: 'users' },
              { label: 'Canales activos', valor: ultimo?.canales_activos ?? 0, icon: 'hash' },
            ].map(m => (
              <Card key={m.label} style={s.metricaCard}>
                <Text style={s.metricaValor}>{m.valor}</Text>
                <Text style={s.metricaLabel}>{m.label}</Text>
              </Card>
            ))}
          </View>

          <Card style={s.chartCard}>
            <Text style={s.seccion}>ACTIVIDAD — ÚLTIMOS 7 DÍAS</Text>
            <UsageChart datos={reporte} />
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: theme.bg },
  content:       { padding: 16, paddingTop: 60, paddingBottom: 100 },
  titulo:        { ...typography.heading, color: theme.text, marginBottom: 24 },
  metricas:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricaCard:   { flex: 1, alignItems: 'center', paddingVertical: 16 },
  metricaValor:  { ...typography.heading, color: theme.accent, marginBottom: 4 },
  metricaLabel:  { ...typography.caption, color: theme.textMuted, textAlign: 'center' },
  chartCard:     { marginBottom: 16 },
  seccion:       { ...typography.label, color: theme.textMuted, marginBottom: 12, textTransform: 'uppercase' },
});
