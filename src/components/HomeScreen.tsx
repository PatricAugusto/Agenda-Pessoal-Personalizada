import { useMemo, useState } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentOutcomeModal } from './home/AppointmentOutcomeModal';
import { AppointmentReviewList } from './home/AppointmentReviewList';
import { CapacitySettingsCard } from './home/CapacitySettingsCard';
import { DailyCapacityCard } from './home/DailyCapacityCard';
import { DailyEfficiencyCard } from './home/DailyEfficiencyCard';
import { WeeklyLoadCard } from './home/WeeklyLoadCard';
import { BottomNavigation } from './BottomNavigation';
import { GlassCanvas, GlassSurface } from './GlassSurface';
import {
  formatDateKey,
  parseDateKey,
  type Appointment,
  type AppointmentOutcome,
} from '../lib/appointments';
import {
  calculateCapacityMetrics,
  calculateDailyProductivity,
  calculateProductivityInsights,
  calculateWeeklyPlannedMinutes,
  plannedMinutesForAppointment,
} from '../lib/productivityMetrics';
import { useAppointments } from '../providers/AppointmentsProvider';
import { styles } from '../styles/home.styles';
import { colors } from '../theme/colors';

export function HomeScreen() {
  const {
    appointments,
    isLoading,
    loadError,
    productivitySettings,
    reloadAppointments,
    updateAppointmentOutcome,
    updateProductivitySettings,
  } = useAppointments();
  const [hoursInput, setHoursInput] = useState<string | null>(null);
  const [meetingsInput, setMeetingsInput] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedOutcome, setSelectedOutcome] =
    useState<AppointmentOutcome | null>(null);
  const [partialMinutesInput, setPartialMinutesInput] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSavingOutcome, setIsSavingOutcome] = useState(false);

  const todayKey = formatDateKey(new Date());
  const today = useMemo(() => parseDateKey(todayKey) ?? new Date(), [todayKey]);
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(today);

  const hoursValue =
    hoursInput ??
    (productivitySettings
      ? (productivitySettings.maxDailyMinutes / 60).toString().replace('.', ',')
      : '');
  const meetingsValue =
    meetingsInput ??
    (productivitySettings ? String(productivitySettings.maxMeetings) : '');

  const dailyMetrics = useMemo(
    () => calculateDailyProductivity(appointments, todayKey),
    [appointments, todayKey],
  );
  const capacityMetrics = useMemo(
    () =>
      productivitySettings
        ? calculateCapacityMetrics(dailyMetrics, productivitySettings)
        : null,
    [dailyMetrics, productivitySettings],
  );
  const insights = useMemo(
    () =>
      productivitySettings
        ? calculateProductivityInsights(appointments, today, productivitySettings)
        : null,
    [appointments, productivitySettings, today],
  );
  const weeklyPlannedMinutes = useMemo(
    () => calculateWeeklyPlannedMinutes(appointments, today),
    [appointments, today],
  );
  const appointmentsToReview = useMemo(
    () =>
      appointments
        .filter(
          (appointment) =>
            appointment.date <= todayKey &&
            (appointment.date === todayKey || appointment.outcomeStatus === null),
        )
        .sort(
          (first, second) =>
            second.date.localeCompare(first.date) ||
            first.time.localeCompare(second.time),
        ),
    [appointments, todayKey],
  );

  function openReview(appointment: Appointment) {
    setSelectedAppointment(appointment);
    setSelectedOutcome(
      appointment.outcomeStatus === 'partial' ? 'partial' : null,
    );
    setPartialMinutesInput(
      appointment.outcomeStatus === 'partial' && appointment.executedMinutes
        ? String(appointment.executedMinutes)
        : '',
    );
    setReviewError(null);
  }

  function closeReview() {
    if (isSavingOutcome) {
      return;
    }
    setSelectedAppointment(null);
    setSelectedOutcome(null);
    setReviewError(null);
  }

  async function saveOutcome(status: AppointmentOutcome) {
    if (!selectedAppointment) {
      return;
    }

    let executedMinutes: number;
    if (status === 'completed') {
      executedMinutes = plannedMinutesForAppointment(selectedAppointment);
    } else if (status === 'undone') {
      executedMinutes = 0;
    } else {
      const minutesText = partialMinutesInput.trim();
      const parsedMinutes = /^\d+$/.test(minutesText)
        ? Number(minutesText)
        : Number.NaN;
      if (!Number.isSafeInteger(parsedMinutes) || parsedMinutes < 1) {
        setReviewError('Informe os minutos realmente executados.');
        return;
      }
      executedMinutes = parsedMinutes;
    }

    setIsSavingOutcome(true);
    setReviewError(null);
    try {
      await updateAppointmentOutcome(
        selectedAppointment.id,
        status,
        executedMinutes,
      );
      setSelectedAppointment(null);
      setSelectedOutcome(null);
    } catch (error) {
      console.error('Não foi possível registrar a execução do compromisso.', error);
      setReviewError('Não foi possível salvar. Tente novamente.');
    } finally {
      setIsSavingOutcome(false);
    }
  }

  async function handleSaveSettings() {
    const dailyHours = Number(hoursValue.trim().replace(',', '.'));
    const meetingsText = meetingsValue.trim();
    const maxMeetings = /^\d+$/.test(meetingsText)
      ? Number(meetingsText)
      : Number.NaN;
    const maxDailyMinutes = Math.round(dailyHours * 60);

    if (
      !Number.isFinite(dailyHours) ||
      dailyHours <= 0 ||
      dailyHours > 24 ||
      maxDailyMinutes < 1
    ) {
      setSettingsError('Informe um limite de horas maior que 0 e de até 24.');
      return;
    }
    if (!Number.isSafeInteger(maxMeetings) || maxMeetings < 1) {
      setSettingsError('Informe pelo menos uma reunião como limite diário.');
      return;
    }

    setIsSavingSettings(true);
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      await updateProductivitySettings({ maxDailyMinutes, maxMeetings });
      setSettingsMessage('Limites diários atualizados.');
    } catch (error) {
      console.error('Não foi possível salvar os limites diários.', error);
      setSettingsError('Não foi possível salvar os limites. Tente novamente.');
    } finally {
      setIsSavingSettings(false);
    }
  }

  const weeklyCapacityMinutes = (productivitySettings?.maxDailyMinutes ?? 0) * 7;

  return (
    <GlassCanvas>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>MIRAI</Text>
              <Text style={styles.brandCaption}>PERSONAL EVOLUTION</Text>
            </View>
            <View style={styles.todayBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.todayBadgeText}>LOCAL</Text>
            </View>
          </View>

          <View style={styles.greeting}>
            <Text style={styles.eyebrow}>SEU RITMO, EM FOCO</Text>
            <Text style={styles.title}>Visão de hoje</Text>
            <Text style={styles.subtitle}>{todayLabel}</Text>
          </View>

          {loadError ? (
            <GlassSurface style={styles.errorCard}>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={reloadAppointments}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </Pressable>
            </GlassSurface>
          ) : null}

          <DailyEfficiencyCard metrics={dailyMetrics} />
          <DailyCapacityCard
            dailyMetrics={dailyMetrics}
            capacityMetrics={capacityMetrics}
            productivitySettings={productivitySettings}
            isLoading={isLoading}
          />
          <CapacitySettingsCard
            hoursValue={hoursValue}
            meetingsValue={meetingsValue}
            settingsError={settingsError}
            settingsMessage={settingsMessage}
            isLoading={isLoading}
            isSaving={isSavingSettings}
            onHoursChange={setHoursInput}
            onMeetingsChange={setMeetingsInput}
            onSave={() => void handleSaveSettings()}
          />
          <WeeklyLoadCard
            plannedMinutes={weeklyPlannedMinutes}
            capacityMinutes={weeklyCapacityMinutes}
            insights={insights}
          />
          <AppointmentReviewList
            appointments={appointmentsToReview}
            onReview={openReview}
          />

          <View style={styles.shortcuts}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/new-appointment',
                  params: { date: todayKey },
                })
              }
              style={({ pressed }) => [
                styles.primaryShortcut,
                pressed && styles.pressed,
              ]}
            >
              <CalendarDays color={colors.background} size={16} />
              <Text style={styles.primaryShortcutText}>Novo compromisso</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate('/calendar')}
              style={({ pressed }) => [
                styles.secondaryShortcut,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryShortcutText}>Abrir calendário</Text>
              <ChevronRight color={colors.green} size={16} />
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>UM DIA DE CADA VEZ</Text>
            <View style={styles.footerLine} />
            <Text style={styles.footerVersion}>MIRAI</Text>
          </View>
        </ScrollView>
        <BottomNavigation activeTab="home" />

        <AppointmentOutcomeModal
          appointment={selectedAppointment}
          selectedOutcome={selectedOutcome}
          partialMinutesInput={partialMinutesInput}
          error={reviewError}
          isSaving={isSavingOutcome}
          onClose={closeReview}
          onSelectPartial={() => {
            setSelectedOutcome('partial');
            setReviewError(null);
          }}
          onPartialMinutesChange={setPartialMinutesInput}
          onSave={(status) => void saveOutcome(status)}
        />
      </SafeAreaView>
    </GlassCanvas>
  );
}
