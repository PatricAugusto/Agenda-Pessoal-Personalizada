import { AlertTriangle, CircleCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import type { ProductivityInsights } from '../../lib/productivityMetrics';
import { styles } from '../../styles/home.styles';
import { colors } from '../../theme/colors';
import { GlassSurface } from '../GlassSurface';
import { formatDuration } from './formatters';

export function WeeklyLoadCard({
  plannedMinutes,
  capacityMinutes,
  insights,
}: {
  plannedMinutes: number;
  capacityMinutes: number;
  insights: ProductivityInsights | null;
}) {
  const progress =
    capacityMinutes > 0
      ? Math.min((plannedMinutes / capacityMinutes) * 100, 100)
      : 0;

  return (
    <GlassSurface style={styles.weekCard}>
      <View style={styles.weekHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>RITMO DA SEMANA</Text>
          <Text style={styles.cardTitle}>Carga planejada</Text>
        </View>
        <Text style={styles.weekValue}>{formatDuration(plannedMinutes)}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.metricHint}>
        de {formatDuration(capacityMinutes)} de capacidade semanal
      </Text>
      <View style={styles.insightDivider} />
      <View style={styles.insightRow}>
        <CircleCheck color={colors.green} size={16} />
        <Text style={styles.insightText}>
          {insights?.averageEfficiencyPercent === null ||
          insights?.averageEfficiencyPercent === undefined
            ? 'A média de execução aparecerá após os primeiros fechamentos.'
            : `Média executada em ${insights.reviewedDays} ${
                insights.reviewedDays === 1
                  ? 'dia revisado'
                  : 'dias revisados'
              }: ${Math.round(insights.averageEfficiencyPercent)}%.`}
        </Text>
      </View>
      {insights && insights.daysNearCapacity > 0 ? (
        <View style={styles.insightRow}>
          <AlertTriangle color={colors.warning} size={16} />
          <Text style={styles.insightText}>
            {insights.daysNearCapacity}{' '}
            {insights.daysNearCapacity === 1
              ? 'dia esteve'
              : 'dias estiveram'}{' '}
            em 90% ou mais da capacidade nos últimos 30 dias.
          </Text>
        </View>
      ) : null}
    </GlassSurface>
  );
}
