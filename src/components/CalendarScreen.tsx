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
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDateKey, type Appointment } from '../lib/appointments';
import { useAppointments } from '../providers/AppointmentsProvider';
import { styles } from '../styles/calendar.styles';
import { colors } from '../theme/colors';

type CalendarMode = 'day' | 'week' | 'month';

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
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {String(dayAppointments.length).padStart(2, '0')}
          </Text>
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

        <Link
          href={{
            pathname: '/new-appointment',
            params: { date: formatDateKey(selectedDate) },
          }}
          asChild
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agendar compromisso"
            style={({ pressed }) => [
              styles.createAppointmentButton,
              pressed && styles.pressed,
            ]}
          >
            <Plus color={colors.background} size={17} strokeWidth={2.5} />
            <Text style={styles.createAppointmentButtonText}>
              Agendar compromisso
            </Text>
          </Pressable>
        </Link>

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
        {mode !== 'day' ? (
          <View style={styles.calendarLegend}>
            <View style={styles.calendarLegendDot} />
            <Text style={styles.calendarLegendText}>Dia com compromisso</Text>
          </View>
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
