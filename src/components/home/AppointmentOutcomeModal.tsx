import { Check, Clock3, X } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  Appointment,
  AppointmentOutcome,
} from '../../lib/appointments';
import { plannedMinutesForAppointment } from '../../lib/productivityMetrics';
import { styles } from '../../styles/home.styles';
import { colors } from '../../theme/colors';
import { GlassSurface } from '../GlassSurface';
import { formatDuration } from './formatters';

interface AppointmentOutcomeModalProps {
  appointment: Appointment | null;
  selectedOutcome: AppointmentOutcome | null;
  partialMinutesInput: string;
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSelectPartial: () => void;
  onPartialMinutesChange: (value: string) => void;
  onSave: (status: AppointmentOutcome) => void;
}

export function AppointmentOutcomeModal({
  appointment,
  selectedOutcome,
  partialMinutesInput,
  error,
  isSaving,
  onClose,
  onSelectPartial,
  onPartialMinutesChange,
  onSave,
}: AppointmentOutcomeModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={appointment !== null}
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
              disabled={isSaving}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeModalButton,
                pressed && styles.pressed,
              ]}
            >
              <X color={colors.textMuted} size={18} />
            </Pressable>
          </View>

          {appointment ? (
            <>
              <Text style={styles.modalAppointmentTitle}>
                {appointment.title}
              </Text>
              <Text style={styles.modalAppointmentMeta}>
                Planejado:{' '}
                {formatDuration(plannedMinutesForAppointment(appointment))}
              </Text>
              <View style={styles.outcomeOptions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isSaving}
                  onPress={() => onSave('completed')}
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
                  disabled={isSaving}
                  onPress={onSelectPartial}
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
                  disabled={isSaving}
                  onPress={() => onSave('undone')}
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
                    onChangeText={onPartialMinutesChange}
                    placeholder="Ex.: 25"
                    placeholderTextColor={colors.textMuted}
                    style={styles.settingInput}
                    value={partialMinutesInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSaving}
                    onPress={() => onSave('partial')}
                    style={({ pressed }) => [
                      styles.saveSettingsButton,
                      isSaving && styles.disabledButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.saveSettingsButtonText}>
                      {isSaving ? 'Salvando...' : 'Salvar execução parcial'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
              {error ? (
                <Text accessibilityRole="alert" style={styles.formError}>
                  {error}
                </Text>
              ) : null}
            </>
          ) : null}
        </GlassSurface>
      </KeyboardAvoidingView>
    </Modal>
  );
}
