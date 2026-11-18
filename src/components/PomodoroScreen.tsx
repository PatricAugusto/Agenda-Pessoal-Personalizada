import { Pause, Play, RotateCcw } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from './BottomNavigation';
import { usePomodoro, breakDurationSeconds, focusDurationSeconds } from '../providers/PomodoroProvider';
import { colors } from '../theme/colors';
import { styles } from '../styles/pomodoro.styles';

const circleRadius = 110;
const circleCircumference = 2 * Math.PI * circleRadius;

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PomodoroScreen() {
  const {
    phase,
    remainingSeconds,
    isRunning,
    completedFocusSessions,
    target,
    lastCompletedPhase,
    toggleTimer,
    resetTimer,
  } = usePomodoro();
  const durationSeconds =
    phase === 'focus' ? focusDurationSeconds : breakDurationSeconds;
  const progress = 1 - remainingSeconds / durationSeconds;
  const isFocus = phase === 'focus';
  const cycleProgress =
    completedFocusSessions === 0
      ? 0
      : ((completedFocusSessions - 1) % 4) + 1;

  let actionLabel = isRunning ? 'Pausar' : 'Iniciar foco';
  if (isRunning) {
    actionLabel = 'Pausar';
  } else if (phase === 'break') {
    actionLabel =
      lastCompletedPhase === 'focus' ? 'Iniciar pausa' : 'Retomar pausa';
  } else if (remainingSeconds < durationSeconds) {
    actionLabel = 'Retomar foco';
  } else if (lastCompletedPhase === 'break') {
    actionLabel = 'Iniciar próximo foco';
  }

  let completionText: string | null = null;
  if (lastCompletedPhase === 'focus') {
    completionText = 'Foco concluído. Faça uma pausa de 5 minutos.';
  } else if (lastCompletedPhase === 'break') {
    completionText = 'Pausa finalizada. Pronto para um novo ciclo de foco.';
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>MIRAI · PERSONAL EVOLUTION</Text>
          <Text style={styles.title}>Pomodoro</Text>
          <Text style={styles.subtitle}>
            Um intervalo de cada vez. Concentre-se no que importa.
          </Text>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.phaseLabel}>
            {isFocus ? 'INTERVALO DE FOCO' : 'PAUSA'}
          </Text>

          <View
            accessibilityRole="timer"
            accessibilityLabel={`Tempo restante ${formatRemainingTime(remainingSeconds)}`}
            style={styles.timerFace}
          >
            <Svg height={250} width={250} style={styles.timerSvg}>
              <Circle
                cx={125}
                cy={125}
                r={circleRadius}
                fill="none"
                stroke={colors.border}
                strokeWidth={5}
              />
              <Circle
                cx={125}
                cy={125}
                r={circleRadius}
                fill="none"
                stroke={colors.green}
                strokeDasharray={`${circleCircumference} ${circleCircumference}`}
                strokeDashoffset={circleCircumference * (1 - progress)}
                strokeLinecap="round"
                strokeWidth={5}
              />
            </Svg>
            <Text style={styles.timerText}>
              {formatRemainingTime(remainingSeconds)}
            </Text>
          </View>

          <Text style={styles.targetLabel}>
            {target ? 'FOCANDO EM' : 'SESSÃO PESSOAL'}
          </Text>
          {target ? (
            <Text numberOfLines={2} style={styles.targetTitle}>
              {target.title}
            </Text>
          ) : null}
          {completionText ? (
            <Text style={styles.completionMessage}>{completionText}</Text>
          ) : null}

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              onPress={toggleTimer}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              {isRunning ? (
                <Pause color={colors.background} size={17} />
              ) : (
                <Play color={colors.background} size={17} />
              )}
              <Text style={styles.primaryButtonText}>{actionLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reiniciar intervalo"
              onPress={resetTimer}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}
            >
              <RotateCcw color={colors.textMuted} size={18} />
            </Pressable>
          </View>
        </View>

        <View style={styles.cycleCard}>
          <Text style={styles.cycleEyebrow}>CICLO DE FOCO · 25 MIN</Text>
          <View style={styles.cycleDots}>
            {Array.from({ length: 4 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.cycleDot,
                  index < cycleProgress && styles.completedCycleDot,
                ]}
              />
            ))}
            <Text style={styles.cycleEyebrow}>
              {cycleProgress}/4 SESSÕES
            </Text>
          </View>
        </View>
        <Text style={styles.tip}>
          Dica: toque no ícone de foco de um compromisso para iniciar uma sessão
          vinculada a ele.
        </Text>
      </ScrollView>
      <BottomNavigation activeTab="pomodoro" />
    </SafeAreaView>
  );
}
