import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Terminal,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDateKey, type Appointment } from '../lib/appointments';
import { useAppointments } from '../providers/AppointmentsProvider';

type CalendarMode = 'day' | 'week' | 'month';

const colors = {
  background: '#080D0A',
  surface: '#101812',
  surfaceRaised: '#142019',
  border: '#24352A',
  green: '#72F1A2',
  greenMuted: '#9BB9A4',
  text: '#F0F6F1',
  textMuted: '#829187',
  dimmed: '#4D5C51',
};

const modes: { id: CalendarMode; label: string }[] = [
  { id: 'day', label: 'Dia' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
];

const weekdayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

function atMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function startOfWeek(date: Date) {
  const mondayFirstDay = (date.getDay() + 6) % 7;
  return addDays(date, -mondayFirstDay);
}

function monthDates(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) =>
    new Date(date.getFullYear(), date.getMonth(), 1 - mondayFirstOffset + index),
  );
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1);
}

function periodLabel(date: Date, mode: CalendarMode) {
  if (mode === 'month') {
    return capitalize(
      new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(date),
    );
  }

  if (mode === 'day') {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  const firstDay = startOfWeek(date);
  const lastDay = addDays(firstDay, 6);
  const dayFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });
  const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

  return `${dayFormat.format(firstDay)} ${monthFormat.format(firstDay)} – ${dayFormat.format(lastDay)} ${monthFormat.format(lastDay)}`;
}

function weekdayLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(date)
    .replace('.', '')
    .toLocaleUpperCase('pt-BR');
}

function MonthCalendar({
  selectedDate,
  todayKey,
  appointmentsByDate,
  onSelectDate,
}: {
  selectedDate: Date;
  todayKey: string;
  appointmentsByDate: ReadonlyMap<string, number>;
  onSelectDate: (date: Date) => void;
}) {
  const dates = monthDates(selectedDate);
  const weeks = Array.from({ length: 6 }, (_, index) =>
    dates.slice(index * 7, index * 7 + 7),
  );

  return (
    <View style={styles.calendarCard}>
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.dateRow}>
          {week.map((date) => {
            const dateKey = formatDateKey(date);
            const isSelected = dateKey === formatDateKey(selectedDate);
            const isToday = dateKey === todayKey;
            const appointmentCount = appointmentsByDate.get(dateKey) ?? 0;
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

            return (
              <Pressable
                key={dateKey}
                accessibilityRole="button"
                accessibilityLabel={new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(date)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectDate(date)}
                style={({ pressed }) => [
                  styles.monthDateCell,
                  isSelected && styles.selectedDateCell,
                  isToday && !isSelected && styles.todayDateCell,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.monthDateText,
                    !isCurrentMonth && styles.outsideMonthText,
                    isToday && !isSelected && styles.todayDateText,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {date.getDate()}
                </Text>
                <View style={styles.indicatorRow}>
                  {appointmentCount > 0
                    ? Array.from({ length: Math.min(appointmentCount, 3) }, (_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.dateIndicator,
                            styles.appointmentIndicator,
                            isSelected && styles.selectedIndicator,
                          ]}
                        />
                      ))
                    : (
                        <View
                          style={[
                            styles.dateIndicator,
                            isToday && !isSelected && styles.todayIndicator,
                            isSelected && styles.selectedIndicator,
                          ]}
                        />
                      )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function WeekCalendar({
  selectedDate,
  todayKey,
  appointmentsByDate,
  onSelectDate,
}: {
  selectedDate: Date;
  todayKey: string;
  appointmentsByDate: ReadonlyMap<string, number>;
  onSelectDate: (date: Date) => void;
}) {
  const firstDay = startOfWeek(selectedDate);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));

  return (
    <View style={styles.weekCard}>
      {dates.map((date) => {
        const dateKey = formatDateKey(date);
        const isSelected = dateKey === formatDateKey(selectedDate);
        const isToday = dateKey === todayKey;
        const appointmentCount = appointmentsByDate.get(dateKey) ?? 0;

        return (
          <Pressable
            key={dateKey}
            accessibilityRole="button"
            accessibilityLabel={new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(date)}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectDate(date)}
            style={({ pressed }) => [
              styles.weekDateCell,
              isSelected && styles.selectedWeekDateCell,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.weekdayText,
                styles.weekDateLabel,
                isSelected && styles.selectedWeekDateLabel,
              ]}
            >
              {weekdayLabel(date)}
            </Text>
            <Text
              style={[
                styles.weekDateNumber,
                isToday && !isSelected && styles.todayDateText,
                isSelected && styles.selectedDateText,
              ]}
            >
              {date.getDate()}
            </Text>
            <View style={styles.weekIndicatorRow}>
              {appointmentCount > 0
                ? Array.from({ length: Math.min(appointmentCount, 3) }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.weekIndicator,
                        styles.appointmentIndicator,
                        isSelected && styles.selectedIndicator,
                      ]}
                    />
                  ))
                : (
                    <View
                      style={[
                        styles.weekIndicator,
                        isToday && !isSelected && styles.todayIndicator,
                        isSelected && styles.selectedIndicator,
                      ]}
                    />
                  )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function SelectedDayAgenda({
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
  const isToday = formatDateKey(date) === formatDateKey(atMidnight(new Date()));
  const selectedDayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  const dayAppointments = appointments.filter(
    (appointment) => appointment.date === formatDateKey(date),
  );

  return (
    <>
      <View style={styles.agendaHeading}>
        <View style={styles.agendaHeadingText}>
          <Text style={styles.sectionEyebrow}>COMPROMISSOS</Text>
          <Text style={styles.sectionTitle}>{capitalize(selectedDayLabel)}</Text>
        </View>
        <View style={styles.agendaActions}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {String(dayAppointments.length).padStart(2, '0')}
            </Text>
          </View>
          <Link
            href={{
              pathname: '/new-appointment',
              params: { date: formatDateKey(date) },
            }}
            asChild
          >
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            >
              <Plus color={colors.background} size={16} strokeWidth={2.5} />
              <Text style={styles.addButtonText}>Novo</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {loadError ? (
        <View style={styles.messageCard}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.messageCard}>
          <Text style={styles.emptyDescription}>Carregando compromissos...</Text>
        </View>
      ) : dayAppointments.length > 0 ? (
        <View style={styles.appointmentList}>
          {dayAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTime}>
                <Clock3 color={colors.green} size={14} />
                <Text style={styles.appointmentTimeText}>{appointment.time}</Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                {appointment.notes ? (
                  <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <CalendarDays color={colors.greenMuted} size={21} strokeWidth={1.7} />
          </View>
          <Text style={styles.emptyTitle}>
            {isToday ? 'Seu dia está livre' : 'Nenhum compromisso por aqui'}
          </Text>
          <Text style={styles.emptyDescription}>
            Seus compromissos aparecerão aqui.
          </Text>
        </View>
      )}
    </>
  );
}

export function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(() => atMidnight(new Date()));
  const [mode, setMode] = useState<CalendarMode>('month');
  const {
    appointments,
    isLoading,
    loadError,
    reloadAppointments,
  } = useAppointments();
  const todayKey = formatDateKey(atMidnight(new Date()));
  const appointmentsByDate = useMemo(() => {
    const counts = new Map<string, number>();
    for (const appointment of appointments) {
      counts.set(appointment.date, (counts.get(appointment.date) ?? 0) + 1);
    }
    return counts;
  }, [appointments]);

  function navigatePeriod(direction: -1 | 1) {
    if (mode === 'day') {
      setSelectedDate(addDays(selectedDate, direction));
      return;
    }

    if (mode === 'week') {
      setSelectedDate(addDays(selectedDate, direction * 7));
      return;
    }

    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1),
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Terminal color={colors.green} size={19} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.brandName}>NEXUS</Text>
              <Text style={styles.brandCaption}>PERSONAL OS</Text>
            </View>
          </View>
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>LOCAL</Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.introEyebrow}>SEU ESPAÇO, SEU RITMO</Text>
          <Text style={styles.title}>Calendário</Text>
          <Text style={styles.subtitle}>
            Uma visão clara do seu tempo, do dia ao mês.
          </Text>
        </View>

        <View style={styles.modeSelector}>
          {modes.map((item) => {
            const isSelected = mode === item.id;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setMode(item.id)}
                style={({ pressed }) => [
                  styles.modeButton,
                  isSelected && styles.selectedModeButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    isSelected && styles.selectedModeButtonText,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.periodToolbar}>
          <View style={styles.periodTitleContainer}>
            <Text style={styles.periodEyebrow}>
              {mode === 'month' ? 'VISÃO MENSAL' : mode === 'week' ? 'VISÃO SEMANAL' : 'VISÃO DIÁRIA'}
            </Text>
            <Text numberOfLines={1} style={styles.periodTitle}>
              {periodLabel(selectedDate, mode)}
            </Text>
          </View>
          <View style={styles.periodActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Período anterior"
              onPress={() => navigatePeriod(-1)}
              style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
            >
              <ChevronLeft color={colors.text} size={19} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Próximo período"
              onPress={() => navigatePeriod(1)}
              style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
            >
              <ChevronRight color={colors.text} size={19} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedDate(atMidnight(new Date()))}
              style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
            >
              <Text style={styles.todayButtonText}>Hoje</Text>
            </Pressable>
          </View>
        </View>

        {mode === 'month' ? (
          <MonthCalendar
            selectedDate={selectedDate}
            todayKey={todayKey}
            appointmentsByDate={appointmentsByDate}
            onSelectDate={setSelectedDate}
          />
        ) : null}
        {mode === 'week' ? (
          <WeekCalendar
            selectedDate={selectedDate}
            todayKey={todayKey}
            appointmentsByDate={appointmentsByDate}
            onSelectDate={setSelectedDate}
          />
        ) : null}
        {mode === 'day' ? (
          <View style={styles.dayFocusCard}>
            <View style={styles.dayNumberCard}>
              <Text style={styles.dayNumber}>
                {new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(selectedDate)}
              </Text>
            </View>
            <View style={styles.dayFocusText}>
              <Text style={styles.dayWeekday}>{weekdayLabel(selectedDate)}</Text>
              <Text style={styles.dayMonth}>
                {capitalize(
                  new Intl.DateTimeFormat('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  }).format(selectedDate),
                )}
              </Text>
            </View>
            {formatDateKey(selectedDate) === todayKey ? (
              <View style={styles.todayTag}>
                <Text style={styles.todayTagText}>HOJE</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <SelectedDayAgenda
          date={selectedDate}
          appointments={appointments}
          isLoading={isLoading}
          loadError={loadError}
          onRetry={reloadAppointments}
        />

        <View style={styles.footer}>
          <Clock3 color={colors.textMuted} size={14} />
          <Text style={styles.footerText}>UM DIA DE CADA VEZ</Text>
          <View style={styles.footerLine} />
          <Text style={styles.footerVersion}>v0.2.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 38,
    height: 38,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  brandName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandCaption: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.4,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 7,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  statusText: {
    color: colors.greenMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  intro: {
    marginTop: 34,
    marginBottom: 22,
  },
  introEyebrow: {
    marginBottom: 8,
    color: colors.green,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectedModeButton: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedModeButtonText: {
    color: colors.green,
  },
  periodToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 14,
  },
  periodTitleContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  periodEyebrow: {
    marginBottom: 5,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  periodTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  periodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  todayButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#1C3324',
  },
  todayButtonText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '700',
  },
  calendarCard: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 27,
  },
  weekdayText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  monthDateCell: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    borderRadius: 12,
  },
  selectedDateCell: {
    backgroundColor: colors.green,
  },
  todayDateCell: {
    borderWidth: 1,
    borderColor: '#35523E',
  },
  monthDateText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  outsideMonthText: {
    color: colors.dimmed,
  },
  todayDateText: {
    color: colors.green,
    fontWeight: '700',
  },
  selectedDateText: {
    color: colors.background,
    fontWeight: '800',
  },
  dateIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  indicatorRow: {
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  appointmentIndicator: {
    backgroundColor: colors.green,
  },
  todayIndicator: {
    backgroundColor: colors.green,
  },
  selectedIndicator: {
    backgroundColor: colors.background,
  },
  weekCard: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  weekDateCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  selectedWeekDateCell: {
    backgroundColor: colors.green,
  },
  weekDateLabel: {
    fontSize: 8,
    letterSpacing: 0.2,
  },
  selectedWeekDateLabel: {
    color: '#31563B',
  },
  weekDateNumber: {
    marginTop: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  weekIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  weekIndicatorRow: {
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  dayFocusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayNumberCard: {
    width: 54,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.surfaceRaised,
  },
  dayNumber: {
    color: colors.green,
    fontSize: 23,
    fontWeight: '700',
  },
  dayFocusText: {
    flex: 1,
    marginLeft: 14,
  },
  dayWeekday: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  dayMonth: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
  },
  todayTag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: '#1C3324',
  },
  todayTagText: {
    color: colors.green,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  agendaHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 27,
    marginBottom: 13,
  },
  agendaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaHeadingText: {
    flex: 1,
    marginRight: 10,
  },
  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  sectionTitle: {
    marginTop: 5,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadge: {
    minWidth: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
  },
  countText: {
    color: colors.greenMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: colors.green,
  },
  addButtonText: {
    marginLeft: 5,
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
  },
  messageCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: '#FF9B9B',
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: colors.surfaceRaised,
  },
  retryButtonText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    minHeight: 142,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.surfaceRaised,
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyDescription: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  appointmentList: {
    gap: 9,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 72,
    paddingTop: 1,
  },
  appointmentTimeText: {
    marginLeft: 6,
    color: colors.green,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  appointmentDetails: {
    flex: 1,
    marginLeft: 10,
  },
  appointmentTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentNotes: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.76,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  footerText: {
    marginLeft: 7,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.9,
  },
  footerLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 10,
    backgroundColor: colors.border,
  },
  footerVersion: {
    color: colors.textMuted,
    fontSize: 9,
  },
});
