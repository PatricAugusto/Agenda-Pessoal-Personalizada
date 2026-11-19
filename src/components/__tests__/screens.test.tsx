import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { CalendarScreen } from '../CalendarScreen';
import { HomeScreen } from '../HomeScreen';
import { PomodoroScreen } from '../PomodoroScreen';
import { useAppointments } from '../../providers/AppointmentsProvider';
import { usePomodoro } from '../../providers/PomodoroProvider';
import { formatDateKey } from '../../lib/appointments';
import { makeAppointment } from '../../test/fixtures';

const mockUseAppointments = jest.mocked(useAppointments);
const mockUsePomodoro = jest.mocked(usePomodoro);

const updateAppointmentOutcome = jest.fn().mockResolvedValue(undefined);
const updateProductivitySettings = jest.fn().mockResolvedValue(undefined);
const reloadAppointments = jest.fn();
const addAppointment = jest.fn().mockResolvedValue(undefined);
const deleteAppointment = jest.fn().mockResolvedValue(undefined);
const startFocus = jest.fn();
const toggleTimer = jest.fn();
const resetTimer = jest.fn();

beforeEach(() => {
  mockUseAppointments.mockReturnValue({
    appointments: [],
    isLoading: false,
    loadError: null,
    addAppointment,
    deleteAppointment,
    updateAppointmentOutcome,
    productivitySettings: { maxDailyMinutes: 360, maxMeetings: 3 },
    updateProductivitySettings,
    reloadAppointments,
  });
  mockUsePomodoro.mockReturnValue({
    phase: 'focus',
    remainingSeconds: 25 * 60,
    isRunning: false,
    endAt: null,
    completedFocusSessions: 0,
    target: null,
    lastCompletedPhase: null,
    startFocus,
    toggleTimer,
    resetTimer,
  });
});

describe('HomeScreen', () => {
  it('renders the overview and navigates to create an appointment', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('Visão de hoje')).toBeTruthy();
    await fireEvent.press(screen.getByText('Novo compromisso'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/new-appointment',
      params: { date: formatDateKey(new Date()) },
    });
  });

  it('rejects invalid limits before attempting to save', async () => {
    await render(<HomeScreen />);
    await fireEvent.changeText(
      screen.getByLabelText('Limite de horas diárias'),
      '0',
    );
    await fireEvent.press(screen.getByText('Salvar limites'));

    expect(
      await screen.findByText('Informe um limite de horas maior que 0 e de até 24.'),
    ).toBeTruthy();
    expect(updateProductivitySettings).not.toHaveBeenCalled();
  });

  it('saves completed appointment outcomes using their planned duration', async () => {
    const appointment = makeAppointment({ date: formatDateKey(new Date()) });
    mockUseAppointments.mockReturnValue({
      appointments: [appointment],
      isLoading: false,
      loadError: null,
      addAppointment,
      deleteAppointment,
      updateAppointmentOutcome,
      productivitySettings: { maxDailyMinutes: 360, maxMeetings: 3 },
      updateProductivitySettings,
      reloadAppointments,
    });
    await render(<HomeScreen />);

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Registrar execução de Revisão de planejamento',
      }),
    );
    await fireEvent.press(screen.getByText('Concluído'));

    await waitFor(() => {
      expect(updateAppointmentOutcome).toHaveBeenCalledWith(
        appointment.id,
        'completed',
        60,
      );
    });
  });
});

describe('CalendarScreen', () => {
  it('switches calendar mode and sends the selected day into the appointment form', async () => {
    await render(<CalendarScreen />);

    await fireEvent.press(screen.getByText('Semana'));
    expect(screen.getByText('VISÃO SEMANAL')).toBeTruthy();

    await fireEvent.press(screen.getByText('Dia'));
    await fireEvent.press(screen.getByText('Agendar compromisso'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/new-appointment',
      params: { date: formatDateKey(new Date()) },
    });
  });
});

describe('PomodoroScreen', () => {
  it('renders the timer and connects the focus and reset controls to the provider', async () => {
    await render(<PomodoroScreen />);

    expect(screen.getByLabelText('Tempo restante 25:00')).toBeTruthy();
    await fireEvent.press(screen.getByText('Iniciar foco'));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Reiniciar intervalo' }),
    );

    expect(toggleTimer).toHaveBeenCalledTimes(1);
    expect(resetTimer).toHaveBeenCalledTimes(1);
  });
});
