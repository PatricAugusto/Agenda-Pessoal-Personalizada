import { Gauge } from 'lucide-react-native';
import { Text, View } from 'react-native';
import type { DailyProductivityMetrics } from '../../lib/productivityMetrics';
import { styles } from '../../styles/home.styles';
import { colors } from '../../theme/colors';
import { formatDeviation, formatDuration } from './formatters';
import { GlassSurface } from '../GlassSurface';

export function DailyEfficiencyCard({
  metrics,
}: {
  metrics: DailyProductivityMetrics;
}) {
  const progress = Math.min(metrics.efficiencyPercent ?? 0, 100);

  return (
    <GlassSurface style={styles.efficiencyCard} intensity={48}>
      <View style={styles.cardHeading}>
        <View style={styles.cardIcon}>
          <Gauge color={colors.green} size={17} />
        </View>
        <View style={styles.cardHeadingCopy}>
          <Text style={styles.sectionEyebrow}>PLANEJADO VS. EXECUTADO</Text>
          <Text style={styles.cardTitle}>Eficiência diária</Text>
        </View>
        <Text style={styles.efficiencyValue}>
          {metrics.efficiencyPercent === null
            ? '—'
            : `${Math.round(metrics.efficiencyPercent)}%`}
        </Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progress),
        }}
        style={styles.progressTrack}
      >
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {metrics.efficiencyPercent === null ? (
        <Text style={styles.metricHint}>
          Não há compromissos planejados para hoje.
        </Text>
      ) : (
        <>
          <Text style={styles.metricHint}>
            {formatDuration(metrics.executedMinutes)} executados de{' '}
            {formatDuration(metrics.plannedMinutes)} planejados
          </Text>
          {metrics.pendingReviewCount > 0 ? (
            <Text style={styles.pendingReviewHint}>
              {metrics.pendingReviewCount}{' '}
              {metrics.pendingReviewCount === 1
                ? 'compromisso aguarda'
                : 'compromissos aguardam'}{' '}
              fechamento.
            </Text>
          ) : null}
          <Text style={styles.deviationText}>
            Desvio: {formatDeviation(metrics.deviationMinutes)}
          </Text>
        </>
      )}

      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>PLANEJADO HOJE</Text>
          <Text style={styles.quickStatValue}>
            {formatDuration(metrics.plannedMinutes)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>REUNIÕES</Text>
          <Text style={styles.quickStatValue}>
            {String(metrics.meetings).padStart(2, '0')}
          </Text>
        </View>
      </View>
    </GlassSurface>
  );
}
