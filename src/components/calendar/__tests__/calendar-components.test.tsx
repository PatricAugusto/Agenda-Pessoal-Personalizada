import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useAppointments } from '../../../providers/AppointmentsProvider';
import { usePomodoro } from '../../../providers/PomodoroProvider';
import { makeAppointment } from '../../../test/fixtures';
import {
  MonthCalendar,
  SelectedDateCard,
  WeekCalendar,
} from '../CalendarViews';
import { SelectedDayAgenda } from '../SelectedDayAgenda';
import {
  calendarDateKey,
  monthDates,
} from '../calendarUtils';

const mockUseAppointments = jest.mocked(useAppointments);
const mockUsePomodoro = jest.mocked(usePomodoro);
const selectedDate = new Date(2026, 10, 18);
const todayKey = calendarDateKey(selectedDate);

beforeEach(() => {
  mockUseAppointments.mockReturnValue({
    appointments: [],
    isLoading: false,
    loadError: null,
    addAppointment: jest.fn(),
    deleteAppointment: jest.fn(),
    updateAppointmentOutcome: jest.fn(),
    productivitySettings: { maxDailyMinutes: 360, maxMeetings: 3 },
    updateProductivitySettings: jest.fn(),
    reloadAppointments: jest.fn(),
  });
  mockUsePomodoro.mockReturnValue({
    phase: 'focus',
    remainingSeconds: 25 * 60,
    isRunning: false,
    endAt: null,
    completedFocusSessions: 0,
    target: null,
    lastCompletedPhase: null,
    startFocus: jest.fn(),
    toggleTimer: jest.fn(),
    resetTimer: jest.fn(),
  });
});

describe('MonthCalendar', () => {
  it('renders the month grid and returns the date selected by the user', async () => {
    const onSelectDate = jest.fn();
    const dateWithAppointments = monthDates(selectedDate)[20];
    await render(
      <MonthCalendar
        selectedDate={selectedDate}
        todayKey={todayKey}
        appointmentsByDate={new Map([[calendarDateKey(dateWithAppointments), 2]])}
        onSelectDate={onSelectDate}
      />,
    );

    expect(screen.getByText('SEG')).toBeTruthy();
    expect(screen.getByText('DOM')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: /19 de novembro/ }),
    );
    expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 10, 19));
  });
});

describe('WeekCalendar', () => {
  it('renders all seven dates and selects a date in the week', async () => {
    const onSelectDate = jest.fn();
    await render(
      <WeekCalendar
        selectedDate={selectedDate}
        todayKey={todayKey}
        appointmentsByDate={new Map()}
        onSelectDate={onSelectDate}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(7);
    await fireEvent.press(
      screen.getByRole('button', { name: /quinta-feira, 19 de novembro/ }),
    );
    expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 10, 19));
  });
});

describe('SelectedDateCard', () => {
  it('identifies the current day', async () => {
    await render(<SelectedDateCard date={selectedDate} todayKey={todayKey} />);

    expect(screen.getByText('18')).toBeTruthy();
    expect(screen.getByText('HOJE')).toBeTruthy();
  });
});

describe('SelectedDayAgenda', () => {
  it('shows the start and end times and starts focus for the selected appointment', async () => {
    const appointment = makeAppointment({
      date: todayKey,
      time: '09:30',
      endTime: '10:15',
    });
    const startFocus = jest.fn();
    mockUsePomodoro.mockReturnValue({
      phase: 'focus',
      remainingSeconds: 25 * 60,
      isRunning: false,
      endAt: null,
      completedFocusSessions: 0,
      target: null,
      lastCompletedPhase: null,
      startFocus,
      toggleTimer: jest.fn(),
      resetTimer: jest.fn(),
    });
    await render(
      <SelectedDayAgenda
        date={selectedDate}
        appointments={[appointment]}
        isLoading={false}
        loadError={null}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText('INÍCIO')).toBeTruthy();
    expect(screen.getByText('09:30')).toBeTruthy();
    expect(screen.getByText('FIM')).toBeTruthy();
    expect(screen.getByText('10:15')).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Iniciar foco para Revisão de planejamento',
      }),
    );
    expect(startFocus).toHaveBeenCalledWith({
      id: appointment.id,
      title: appointment.title,
    });
    expect(router.navigate).toHaveBeenCalledWith('/pomodoro');
  });
});
