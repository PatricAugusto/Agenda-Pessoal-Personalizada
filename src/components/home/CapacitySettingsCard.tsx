import { Save } from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';
import { styles } from '../../styles/home.styles';
import { colors } from '../../theme/colors';
import { GlassSurface } from '../GlassSurface';

interface CapacitySettingsCardProps {
  hoursValue: string;
  meetingsValue: string;
  settingsError: string | null;
  settingsMessage: string | null;
  isLoading: boolean;
  isSaving: boolean;
  onHoursChange: (value: string) => void;
  onMeetingsChange: (value: string) => void;
  onSave: () => void;
}

export function CapacitySettingsCard({
  hoursValue,
  meetingsValue,
  settingsError,
  settingsMessage,
  isLoading,
  isSaving,
  onHoursChange,
  onMeetingsChange,
  onSave,
}: CapacitySettingsCardProps) {
  return (
    <GlassSurface style={styles.settingsCard}>
      <Text style={styles.sectionEyebrow}>SEUS LIMITES</Text>
      <Text style={styles.cardTitle}>Configure sua capacidade</Text>
      <View style={styles.settingsRow}>
        <View style={styles.settingField}>
          <Text style={styles.settingLabel}>HORAS POR DIA</Text>
          <TextInput
            accessibilityLabel="Limite de horas diárias"
            keyboardType="decimal-pad"
            onChangeText={onHoursChange}
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
            onChangeText={onMeetingsChange}
            placeholder="3"
            placeholderTextColor={colors.textMuted}
            style={styles.settingInput}
            value={meetingsValue}
          />
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={isLoading || isSaving}
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveSettingsButton,
          (isLoading || isSaving) && styles.disabledButton,
          pressed && styles.pressed,
        ]}
      >
        <Save color={colors.background} size={15} />
        <Text style={styles.saveSettingsButtonText}>
          {isSaving ? 'Salvando...' : 'Salvar limites'}
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
  );
}
