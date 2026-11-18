import { useState } from 'react';
import { router } from 'expo-router';
import {
  CalendarDays,
  Clock3,
  Timer,
  Trash2,
} from 'lucide-react-native';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import type { Appointment } from '../../lib/appointments';
import { formatDateKey } from '../../lib/appointments';
import { useAppointments } from '../../providers/AppointmentsProvider';
import { usePomodoro } from '../../providers/PomodoroProvider';
import { styles } from '../../styles/calendar.styles';
import { colors } from '../../theme/colors';
import { GlassSurface } from '../GlassSurface';
import { atMidnight, capitalize, calendarDateKey } from './calendarUtils';

export function SelectedDayAgenda({
  date,
  appointments,
  isLoading,
  loadError,
  onRetry,
}: {
  date: Date;
  appointments: Appointment[];
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
}) {
  const { deleteAppointment } = useAppointments();
  const { startFocus } = usePomodoro();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isToday = calendarDateKey(date) === formatDateKey(atMidnight(new Date()));
  const selectedDayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  const dayAppointments = appointments.filter(
    (appointment) => appointment.date === calendarDateKey(date),
  );

  async function removeAppointment(appointment: Appointment) {
    setDeletingId(appointment.id);
    try {
      await deleteAppointment(appointment.id);
    } catch (error) {
      console.error('Não foi possível apagar o compromisso.', error);
      if (Platform.OS === 'web') {
        globalThis.alert('Não foi possível apagar o compromisso. Tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível apagar o compromisso.');
      }
    } finally {
      setDeletingId(null);
    }
  }

  function confirmAppointmentRemoval(appointment: Appointment) {
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`Apagar "${appointment.title}"?`)) {
        void removeAppointment(appointment);
      }
      return;
    }

    Alert.alert(
      'Apagar compromisso',
      `Deseja apagar "${appointment.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => void removeAppointment(appointment),
        },
      ],
    );
  }

  return (
    <>
      <View style={styles.agendaHeading}>
        <View style={styles.agendaHeadingText}>
          <Text style={styles.sectionEyebrow}>COMPROMISSOS</Text>
          <Text style={styles.sectionTitle}>{capitalize(selectedDayLabel)}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {String(dayAppointments.length).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {loadError ? (
        <GlassSurface style={styles.messageCard}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </GlassSurface>
      ) : isLoading ? (
        <GlassSurface style={styles.messageCard}>
          <Text style={styles.emptyDescription}>Carregando compromissos...</Text>
        </GlassSurface>
      ) : dayAppointments.length > 0 ? (
        <View style={styles.appointmentList}>
          {dayAppointments.map((appointment) => (
            <GlassSurface key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTime}>
                <Clock3 color={colors.green} size={14} />
                <View style={styles.appointmentTimeRange}>
                  <Text style={styles.appointmentTimeText}>
                    {appointment.time}
                  </Text>
                  {appointment.endTime ? (
                    <>
                      <Text style={styles.appointmentTimeSeparator}>–</Text>
                      <Text style={styles.appointmentTimeText}>
                        {appointment.endTime}
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                {appointment.notes ? (
                  <Text style={styles.appointmentNotes}>
                    {appointment.notes}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Iniciar foco para ${appointment.title}`}
                onPress={() => {
                  startFocus({ id: appointment.id, title: appointment.title });
                  router.navigate('/pomodoro');
                }}
                style={({ pressed }) => [
                  styles.focusAppointmentButton,
                  pressed && styles.pressed,
                ]}
              >
                <Timer color={colors.green} size={17} />
                <Text style={styles.focusAppointmentButtonText}>Foco</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Apagar ${appointment.title}`}
                disabled={deletingId === appointment.id}
                onPress={() => confirmAppointmentRemoval(appointment)}
                style={({ pressed }) => [
                  styles.deleteAppointmentButton,
                  deletingId === appointment.id && styles.disabledDeleteButton,
                  pressed && styles.pressed,
                ]}
              >
                <Trash2 color={colors.error} size={16} strokeWidth={2} />
              </Pressable>
            </GlassSurface>
          ))}
        </View>
      ) : (
        <GlassSurface style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <CalendarDays color={colors.greenMuted} size={21} strokeWidth={1.7} />
          </View>
          <Text style={styles.emptyTitle}>
            {isToday ? 'Seu dia está livre' : 'Nenhum compromisso por aqui'}
          </Text>
          <Text style={styles.emptyDescription}>
            Seus compromissos aparecerão aqui.
          </Text>
        </GlassSurface>
      )}
    </>
  );
}
