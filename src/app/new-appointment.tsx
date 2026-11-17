import { useState } from 'react';
import {
  DateTimePickerAndroid,
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Save } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDateKey, parseDateKey } from '../lib/appointments';
import { useAppointments } from '../providers/AppointmentsProvider';
import { styles } from '../styles/newAppointment.styles';
import { colors } from '../theme/colors';

type PickerMode = 'date' | 'time';

function atMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateInputValue(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function parseDateInput(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return parseDateKey(`${year}-${month}-${day}`);
}

function timeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseTimeInput(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? value : null;
}

export default function NewAppointmentScreen() {
  const { date: routeDate } = useLocalSearchParams<{ date?: string }>();
  const initialDate =
    typeof routeDate === 'string' ? parseDateKey(routeDate) : null;
  const [selectedDate, setSelectedDate] = useState(() =>
    atMidnight(initialDate ?? new Date()),
  );
  const [selectedTime, setSelectedTime] = useState(() => {
    const time = new Date();
    time.setHours(9, 0, 0, 0);
    return time;
  });
  const [dateInput, setDateInput] = useState(() =>
    dateInputValue(atMidnight(initialDate ?? new Date())),
  );
  const [timeInput, setTimeInput] = useState(() => timeInputValue(selectedTime));
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { addAppointment, isLoading } = useAppointments();

  function updateDate(value: Date) {
    const nextDate = atMidnight(value);
    setSelectedDate(nextDate);
    setDateInput(dateInputValue(nextDate));
  }

  function updateTime(value: Date) {
    setSelectedTime(value);
    setTimeInput(timeInputValue(value));
  }

  function openPicker(mode: PickerMode) {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: mode === 'date' ? selectedDate : selectedTime,
        mode,
        is24Hour: true,
        display: mode === 'date' ? 'calendar' : 'clock',
        onValueChange: (_event, nextValue) => {
          if (mode === 'date') {
            updateDate(nextValue);
          } else {
            updateTime(nextValue);
          }
        },
      });
      return;
    }

    setPickerMode(mode);
  }

  function handleNativePickerChange(
    _event: DateTimePickerChangeEvent,
    nextValue: Date,
  ) {
    if (!pickerMode) {
      return;
    }

    if (pickerMode === 'date') {
      updateDate(nextValue);
    } else {
      updateTime(nextValue);
    }
  }

  async function handleSave() {
    const cleanTitle = title.trim();
    const appointmentDate =
      Platform.OS === 'web' ? parseDateInput(dateInput) : selectedDate;
    const appointmentTime =
      Platform.OS === 'web' ? parseTimeInput(timeInput) : timeInputValue(selectedTime);

    if (!cleanTitle) {
      setFormError('Informe um título para o compromisso.');
      return;
    }
    if (!appointmentDate) {
      setFormError('Use uma data válida no formato DD/MM/AAAA.');
      return;
    }
    if (!appointmentTime) {
      setFormError('Use um horário válido no formato HH:MM.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      await addAppointment({
        title: cleanTitle,
        date: formatDateKey(appointmentDate),
        time: appointmentTime,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (error) {
      console.error('Não foi possível salvar o compromisso.', error);
      setFormError('Não foi possível salvar. Tente novamente.');
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar ao calendário"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <ChevronLeft color={colors.text} size={20} />
            </Pressable>
            <View style={styles.headerTitle}>
              <Text style={styles.eyebrow}>AGENDA PESSOAL</Text>
              <Text style={styles.screenTitle}>Novo compromisso</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>TÍTULO</Text>
              <TextInput
                accessibilityLabel="Título do compromisso"
                autoCapitalize="sentences"
                maxLength={80}
                onChangeText={setTitle}
                placeholder="Ex.: Reunião de projeto"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                style={styles.textInput}
                value={title}
              />
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.fieldRow}>
              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.fieldLabel}>DATA</Text>
                {Platform.OS === 'web' ? (
                  <TextInput
                    accessibilityLabel="Data do compromisso"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    onChangeText={(value) => {
                      setDateInput(value);
                      const parsedDate = parseDateInput(value);
                      if (parsedDate) {
                        setSelectedDate(parsedDate);
                      }
                    }}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.textMuted}
                    style={styles.textInput}
                    value={dateInput}
                  />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openPicker('date')}
                    style={({ pressed }) => [
                      styles.pickerField,
                      pressed && styles.pressed,
                    ]}
                  >
                    <CalendarDays color={colors.green} size={17} />
                    <Text style={styles.pickerFieldText}>
                      {new Intl.DateTimeFormat('pt-BR').format(selectedDate)}
                    </Text>
                    <ChevronRight color={colors.textMuted} size={16} />
                  </Pressable>
                )}
              </View>

              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.fieldLabel}>HORÁRIO</Text>
                {Platform.OS === 'web' ? (
                  <TextInput
                    accessibilityLabel="Horário do compromisso"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    onChangeText={(value) => {
                      setTimeInput(value);
                      if (parseTimeInput(value)) {
                        const [hours, minutes] = value.split(':').map(Number);
                        const nextTime = new Date(selectedTime);
                        nextTime.setHours(hours, minutes, 0, 0);
                        setSelectedTime(nextTime);
                      }
                    }}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textMuted}
                    style={styles.textInput}
                    value={timeInput}
                  />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openPicker('time')}
                    style={({ pressed }) => [
                      styles.pickerField,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Clock3 color={colors.green} size={17} />
                    <Text style={styles.pickerFieldText}>
                      {timeInputValue(selectedTime)}
                    </Text>
                    <ChevronRight color={colors.textMuted} size={16} />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.fieldDivider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>OBSERVAÇÕES · OPCIONAL</Text>
              <TextInput
                accessibilityLabel="Observações do compromisso"
                maxLength={240}
                multiline
                onChangeText={setNotes}
                placeholder="Adicione detalhes que queira lembrar..."
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, styles.notesInput]}
                textAlignVertical="top"
                value={notes}
              />
            </View>
          </View>

          {Platform.OS === 'ios' && pickerMode ? (
            <View style={styles.iosPickerCard}>
              <DateTimePicker
                display="spinner"
                is24Hour
                mode={pickerMode}
                onValueChange={handleNativePickerChange}
                value={pickerMode === 'date' ? selectedDate : selectedTime}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setPickerMode(null)}
                style={({ pressed }) => [styles.pickerDoneButton, pressed && styles.pressed]}
              >
                <Text style={styles.pickerDoneText}>Concluir</Text>
              </Pressable>
            </View>
          ) : null}

          {formError ? (
            <Text accessibilityRole="alert" style={styles.formError}>
              {formError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isLoading || isSaving}
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              (isLoading || isSaving) && styles.disabledButton,
              pressed && !isSaving && styles.pressed,
            ]}
          >
            <Save color={colors.background} size={17} />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Carregando agenda...' : isSaving ? 'Salvando...' : 'Salvar compromisso'}
            </Text>
          </Pressable>
          <Text style={styles.localNote}>Salvo apenas neste aparelho.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
