import {
  ChevronRight,
  CircleCheck,
  Clock3,
  Users,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { formatDateKey, type Appointment } from '../../lib/appointments';
import { plannedMinutesForAppointment } from '../../lib/productivityMetrics';
import { styles } from '../../styles/home.styles';
import { colors } from '../../theme/colors';
import { GlassSurface } from '../GlassSurface';
import { dateLabel, formatDuration, outcomeLabel } from './formatters';

function ReviewAppointmentRow({
  appointment,
  onReview,
}: {
  appointment: Appointment;
  onReview: (appointment: Appointment) => void;
}) {
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewInfo}>
        <Text numberOfLines={1} style={styles.reviewTitle}>
          {appointment.title}
        </Text>
        <View style={styles.reviewMeta}>
          <Clock3 color={colors.greenMuted} size={12} />
          <Text style={styles.reviewMetaText}>
            {appointment.time} ·{' '}
            {formatDuration(plannedMinutesForAppointment(appointment))}
          </Text>
          {appointment.isMeeting ? (
            <View style={styles.meetingBadge}>
              <Users color={colors.greenMuted} size={10} />
              <Text style={styles.meetingBadgeText}>REUNIÃO</Text>
            </View>
          ) : null}
          {appointment.date !== formatDateKey(new Date()) ? (
            <Text style={styles.reviewDate}>{dateLabel(appointment.date)}</Text>
          ) : null}
        </View>
        {appointment.outcomeStatus ? (
          <View style={styles.reviewOutcomeMeta}>
            <View
              style={[
                styles.reviewOutcomeBadge,
                appointment.outcomeStatus === 'completed' &&
                  styles.completedOutcomeBadge,
                appointment.outcomeStatus === 'partial' &&
                  styles.partialOutcomeBadge,
                appointment.outcomeStatus === 'undone' &&
                  styles.undoneOutcomeBadge,
              ]}
            >
              <Text
                style={[
                  styles.reviewOutcomeText,
                  appointment.outcomeStatus === 'undone' &&
                    styles.undoneOutcomeText,
                ]}
              >
                {outcomeLabel(appointment.outcomeStatus)}
              </Text>
            </View>
            <Text style={styles.reviewExecutedText}>
              {formatDuration(appointment.executedMinutes ?? 0)} executados
            </Text>
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${appointment.outcomeStatus ? 'Editar' : 'Registrar execução de'} ${appointment.title}`}
        onPress={() => onReview(appointment)}
        style={({ pressed }) => [
          styles.reviewAction,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.reviewActionText}>
          {appointment.outcomeStatus ? 'Editar' : 'Fechar'}
        </Text>
        <ChevronRight color={colors.green} size={15} />
      </Pressable>
    </View>
  );
}

export function AppointmentReviewList({
  appointments,
  onReview,
}: {
  appointments: Appointment[];
  onReview: (appointment: Appointment) => void;
}) {
  return (
    <>
      <View style={styles.reviewHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>FECHAMENTO</Text>
          <Text style={styles.sectionTitle}>Revisar compromissos</Text>
        </View>
        <View style={styles.reviewCount}>
          <Text style={styles.reviewCountText}>
            {String(appointments.length).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {appointments.length > 0 ? (
        <GlassSurface style={styles.reviewList}>
          {appointments.map((appointment, index) => (
            <View key={appointment.id}>
              {index > 0 ? <View style={styles.reviewDivider} /> : null}
              <ReviewAppointmentRow
                appointment={appointment}
                onReview={onReview}
              />
            </View>
          ))}
        </GlassSurface>
      ) : (
        <GlassSurface style={styles.emptyReviewCard}>
          <CircleCheck color={colors.green} size={20} />
          <Text style={styles.emptyReviewTitle}>Tudo em dia</Text>
          <Text style={styles.metricHint}>
            Compromissos realizados podem ser fechados aqui.
          </Text>
        </GlassSurface>
      )}
    </>
  );
}
