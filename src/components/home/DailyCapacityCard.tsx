import { AlertTriangle, Users } from 'lucide-react-native';
import { Text, View } from 'react-native';
import type { ProductivitySettings } from '../../lib/appointments';
import type {
  CapacityMetrics,
  DailyProductivityMetrics,
} from '../../lib/productivityMetrics';
import { styles } from '../../styles/home.styles';
import { colors } from '../../theme/colors';
import { GlassSurface } from '../GlassSurface';
import { formatDuration } from './formatters';

export function DailyCapacityCard({
  dailyMetrics,
  capacityMetrics,
  productivitySettings,
  isLoading,
}: {
  dailyMetrics: DailyProductivityMetrics;
  capacityMetrics: CapacityMetrics | null;
  productivitySettings: ProductivitySettings | null;
  isLoading: boolean;
}) {
  const recommendationParts: string[] = [];
  if (capacityMetrics?.excessMinutes) {
    recommendationParts.push(
      `reduzir ${formatDuration(capacityMetrics.excessMinutes)} da agenda`,
    );
  }
  if (capacityMetrics?.excessMeetings) {
    recommendationParts.push(
      `cortar ${capacityMetrics.excessMeetings} ${
        capacityMetrics.excessMeetings === 1 ? 'reunião' : 'reuniões'
      }`,
    );
  }

  return (
    <GlassSurface style={styles.capacityCard}>
      <View style={styles.cardHeading}>
        <View style={styles.cardIcon}>
          <Users color={colors.green} size={17} />
        </View>
        <View style={styles.cardHeadingCopy}>
          <Text style={styles.sectionEyebrow}>HOMEOSTASE</Text>
          <Text style={styles.cardTitle}>Capacidade diária</Text>
        </View>
        {capacityMetrics ? (
          <Text
            style={[
              styles.capacityValue,
              capacityMetrics.capacityPercent > 100 &&
                styles.capacityValueOver,
            ]}
          >
            {Math.round(capacityMetrics.capacityPercent)}%
          </Text>
        ) : null}
      </View>

      {productivitySettings ? (
        <>
          <Text style={styles.capacitySummary}>
            {formatDuration(dailyMetrics.plannedMinutes)} planejados ·{' '}
            {dailyMetrics.meetings} de {productivitySettings.maxMeetings}{' '}
            reuniões
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                capacityMetrics !== null &&
                  capacityMetrics.capacityPercent > 100 &&
                  styles.progressFillOver,
                {
                  width: `${Math.min(
                    capacityMetrics?.capacityPercent ?? 0,
                    100,
                  )}%`,
                },
              ]}
            />
          </View>
          {capacityMetrics && capacityMetrics.capacityPercent > 100 ? (
            <View style={styles.overloadAlert}>
              <AlertTriangle color={colors.warning} size={16} />
              <View style={styles.overloadCopy}>
                <Text style={styles.overloadTitle}>
                  Sua capacidade está em{' '}
                  {Math.round(capacityMetrics.capacityPercent)}%.
                </Text>
                <Text style={styles.overloadText}>
                  Recomendação: {recommendationParts.join(' e ')}.
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.metricHint}>
              Dentro dos limites definidos para hoje.
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.metricHint}>
          {isLoading ? 'Carregando limites...' : 'Defina seus limites abaixo.'}
        </Text>
      )}
    </GlassSurface>
  );
}
