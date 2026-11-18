import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BottomNavigation } from './BottomNavigation';
import { GlassCanvas } from './GlassSurface';
import {
  MonthCalendar,
  SelectedDateCard,
  WeekCalendar,
} from './calendar/CalendarViews';
import { SelectedDayAgenda } from './calendar/SelectedDayAgenda';
import {
  addDays,
  atMidnight,
  calendarDateKey,
  calendarModes,
  periodLabel,
  type CalendarMode,
} from './calendar/calendarUtils';
import { useAppointments } from '../providers/AppointmentsProvider';
import { styles } from '../styles/calendar.styles';
import { colors } from '../theme/colors';

export function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(() => atMidnight(new Date()));
  const [mode, setMode] = useState<CalendarMode>('month');
  const {
    appointments,
    isLoading,
    loadError,
    reloadAppointments,
  } = useAppointments();
  const todayKey = calendarDateKey(atMidnight(new Date()));
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
    <GlassCanvas>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandIcon}>
                <Svg width={25} height={25} viewBox="0 0 64 64">
                  <Path
                    d="M32 7 C46 7 57 18 57 32 C57 42 51 51 42 55 C37 57 33 53 36 49 C38 46 43 45 46 40 C50 33 47 23 40 17 C35 13 29 12 23 14"
                    fill="none"
                    stroke={colors.green}
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M22 15 C12 20 7 29 9 40 C11 50 19 56 28 57"
                    fill="none"
                    stroke={colors.green}
                    strokeWidth={5}
                    strokeLinecap="round"
                    opacity={0.72}
                  />
                  <Path
                    d="M29 57 C34 58 39 56 42 53"
                    fill="none"
                    stroke={colors.green}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
              <View>
                <Text style={styles.brandName}>MIRAI</Text>
                <Text style={styles.brandCaption}>PERSONAL EVOLUTION</Text>
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
            {calendarModes.map((item) => {
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
                {mode === 'month'
                  ? 'VISÃO MENSAL'
                  : mode === 'week'
                    ? 'VISÃO SEMANAL'
                    : 'VISÃO DIÁRIA'}
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
                style={({ pressed }) => [
                  styles.arrowButton,
                  pressed && styles.pressed,
                ]}
              >
                <ChevronLeft color={colors.text} size={19} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Próximo período"
                onPress={() => navigatePeriod(1)}
                style={({ pressed }) => [
                  styles.arrowButton,
                  pressed && styles.pressed,
                ]}
              >
                <ChevronRight color={colors.text} size={19} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedDate(atMidnight(new Date()))}
                style={({ pressed }) => [
                  styles.todayButton,
                  pressed && styles.pressed,
                ]}
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
            <SelectedDateCard date={selectedDate} todayKey={todayKey} />
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agendar compromisso"
            onPress={() =>
              router.push({
                pathname: '/new-appointment',
                params: { date: calendarDateKey(selectedDate) },
              })
            }
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
            <Text style={styles.footerVersion}>v1.1.0</Text>
          </View>
        </ScrollView>
        <BottomNavigation activeTab="calendar" />
      </SafeAreaView>
    </GlassCanvas>
  );
}
