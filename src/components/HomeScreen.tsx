import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Gauge,
  Save,
  Users,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

function formatDeviation(totalMinutes: number) {
  const sign = totalMinutes > 0 ? '+' : totalMinutes < 0 ? '-' : '';
  return `${sign}${formatDuration(Math.abs(totalMinutes))}`;
}

function dateLabel(dateKey: string) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function outcomeLabel(status: AppointmentOutcome) {
  switch (status) {
    case 'completed':
      return 'CONCLUÍDO';
    case 'partial':
      return 'PARCIAL';
    case 'undone':
      return 'DESFEITO';
  }
}

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
            {appointment.time} · {formatDuration(plannedMinutesForAppointment(appointment))}
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
    meetingsInput ?? (productivitySettings ? String(productivitySettings.maxMeetings) : '');

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

  const efficiencyProgress = Math.min(dailyMetrics.efficiencyPercent ?? 0, 100);
  const weeklyCapacityMinutes = (productivitySettings?.maxDailyMinutes ?? 0) * 7;
  const weeklyProgress =
    weeklyCapacityMinutes > 0
      ? Math.min((weeklyPlannedMinutes / weeklyCapacityMinutes) * 100, 100)
      : 0;
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
                {dailyMetrics.efficiencyPercent === null
                  ? '—'
                  : `${Math.round(dailyMetrics.efficiencyPercent)}%`}
              </Text>
            </View>

            <View
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: Math.round(efficiencyProgress),
              }}
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${efficiencyProgress}%` },
                ]}
              />
            </View>

            {dailyMetrics.efficiencyPercent === null ? (
              <Text style={styles.metricHint}>
                Não há compromissos planejados para hoje.
              </Text>
            ) : (
              <>
                <Text style={styles.metricHint}>
                  {formatDuration(dailyMetrics.executedMinutes)} executados de{' '}
                  {formatDuration(dailyMetrics.plannedMinutes)} planejados
                </Text>
                {dailyMetrics.pendingReviewCount > 0 ? (
                  <Text style={styles.pendingReviewHint}>
                    {dailyMetrics.pendingReviewCount}{' '}
                    {dailyMetrics.pendingReviewCount === 1
                      ? 'compromisso aguarda'
                      : 'compromissos aguardam'}{' '}
                    fechamento.
                  </Text>
                ) : null}
                <Text style={styles.deviationText}>
                  Desvio: {formatDeviation(dailyMetrics.deviationMinutes)}
                </Text>
              </>
            )}

            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>PLANEJADO HOJE</Text>
                <Text style={styles.quickStatValue}>
                  {formatDuration(dailyMetrics.plannedMinutes)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>REUNIÕES</Text>
                <Text style={styles.quickStatValue}>
                  {String(dailyMetrics.meetings).padStart(2, '0')}
                </Text>
              </View>
            </View>
          </GlassSurface>

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

          <GlassSurface style={styles.settingsCard}>
            <Text style={styles.sectionEyebrow}>SEUS LIMITES</Text>
            <Text style={styles.cardTitle}>Configure sua capacidade</Text>
            <View style={styles.settingsRow}>
              <View style={styles.settingField}>
                <Text style={styles.settingLabel}>HORAS POR DIA</Text>
                <TextInput
                  accessibilityLabel="Limite de horas diárias"
                  keyboardType="decimal-pad"
                  onChangeText={setHoursInput}
                  placeholder="6"
                  placeholderTextColor={colors.textMuted}
                  style={styles.settingInput}
                  value={hoursValue}
                />
              </View>
              <View style={styles.settingField}>
                <Text style={styles.settingLabel}>REUNIÕES POR DIA</Text>
                <TextInput
                  accessibilityLabel="Limite de reuniões diárias"
                  keyboardType="number-pad"
                  onChangeText={setMeetingsInput}
                  placeholder="3"
                  placeholderTextColor={colors.textMuted}
                  style={styles.settingInput}
                  value={meetingsValue}
                />
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={isLoading || isSavingSettings}
              onPress={handleSaveSettings}
              style={({ pressed }) => [
                styles.saveSettingsButton,
                (isLoading || isSavingSettings) && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              <Save color={colors.background} size={15} />
              <Text style={styles.saveSettingsButtonText}>
                {isSavingSettings ? 'Salvando...' : 'Salvar limites'}
              </Text>
            </Pressable>
            {settingsError ? (
              <Text accessibilityRole="alert" style={styles.formError}>
                {settingsError}
              </Text>
            ) : settingsMessage ? (
              <Text style={styles.successMessage}>{settingsMessage}</Text>
            ) : null}
          </GlassSurface>

          <GlassSurface style={styles.weekCard}>
            <View style={styles.weekHeading}>
              <View>
                <Text style={styles.sectionEyebrow}>RITMO DA SEMANA</Text>
                <Text style={styles.cardTitle}>Carga planejada</Text>
              </View>
              <Text style={styles.weekValue}>
                {formatDuration(weeklyPlannedMinutes)}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${weeklyProgress}%` }]}
              />
            </View>
            <Text style={styles.metricHint}>
              de {formatDuration(weeklyCapacityMinutes)} de capacidade semanal
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
                  {insights.daysNearCapacity === 1 ? 'dia esteve' : 'dias estiveram'}{' '}
                  em 90% ou mais da capacidade nos últimos 30 dias.
                </Text>
              </View>
            ) : null}
          </GlassSurface>

          <View style={styles.reviewHeading}>
            <View>
              <Text style={styles.sectionEyebrow}>FECHAMENTO</Text>
              <Text style={styles.sectionTitle}>Revisar compromissos</Text>
            </View>
            <View style={styles.reviewCount}>
              <Text style={styles.reviewCountText}>
                {String(appointmentsToReview.length).padStart(2, '0')}
              </Text>
            </View>
          </View>

          {appointmentsToReview.length > 0 ? (
            <GlassSurface style={styles.reviewList}>
              {appointmentsToReview.map((appointment, index) => (
                <View key={appointment.id}>
                  {index > 0 ? <View style={styles.reviewDivider} /> : null}
                  <ReviewAppointmentRow
                    appointment={appointment}
                    onReview={openReview}
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

        <Modal
          animationType="fade"
          onRequestClose={closeReview}
          transparent
          visible={selectedAppointment !== null}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBackdrop}
          >
            <GlassSurface style={styles.reviewModal} intensity={55}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeadingCopy}>
                  <Text style={styles.sectionEyebrow}>FECHAMENTO</Text>
                  <Text style={styles.cardTitle}>Como foi?</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar revisão"
                  disabled={isSavingOutcome}
                  onPress={closeReview}
                  style={({ pressed }) => [
                    styles.closeModalButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <X color={colors.textMuted} size={18} />
                </Pressable>
              </View>

              {selectedAppointment ? (
                <>
                  <Text style={styles.modalAppointmentTitle}>
                    {selectedAppointment.title}
                  </Text>
                  <Text style={styles.modalAppointmentMeta}>
                    Planejado: {formatDuration(
                      plannedMinutesForAppointment(selectedAppointment),
                    )}
                  </Text>
                  <View style={styles.outcomeOptions}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={isSavingOutcome}
                      onPress={() => void saveOutcome('completed')}
                      style={({ pressed }) => [
                        styles.outcomeButton,
                        styles.completedOutcome,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Check color={colors.green} size={16} />
                      <Text style={styles.completedOutcomeText}>Concluído</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={isSavingOutcome}
                      onPress={() => {
                        setSelectedOutcome('partial');
                        setReviewError(null);
                      }}
                      style={({ pressed }) => [
                        styles.outcomeButton,
                        selectedOutcome === 'partial' && styles.selectedOutcome,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Clock3 color={colors.text} size={16} />
                      <Text style={styles.outcomeText}>Parcial</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={isSavingOutcome}
                      onPress={() => void saveOutcome('undone')}
                      style={({ pressed }) => [
                        styles.outcomeButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <X color={colors.error} size={16} />
                      <Text style={styles.undoneOutcomeText}>Desfeito</Text>
                    </Pressable>
                  </View>
                  {selectedOutcome === 'partial' ? (
                    <View style={styles.partialInputGroup}>
                      <Text style={styles.settingLabel}>MINUTOS EXECUTADOS</Text>
                      <TextInput
                        accessibilityLabel="Minutos executados"
                        autoFocus
                        keyboardType="number-pad"
                        onChangeText={setPartialMinutesInput}
                        placeholder="Ex.: 25"
                        placeholderTextColor={colors.textMuted}
                        style={styles.settingInput}
                        value={partialMinutesInput}
                      />
                      <Pressable
                        accessibilityRole="button"
                        disabled={isSavingOutcome}
                        onPress={() => void saveOutcome('partial')}
                        style={({ pressed }) => [
                          styles.saveSettingsButton,
                          isSavingOutcome && styles.disabledButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.saveSettingsButtonText}>
                          {isSavingOutcome ? 'Salvando...' : 'Salvar execução parcial'}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                  {reviewError ? (
                    <Text accessibilityRole="alert" style={styles.formError}>
                      {reviewError}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </GlassSurface>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </GlassCanvas>
  );
}
