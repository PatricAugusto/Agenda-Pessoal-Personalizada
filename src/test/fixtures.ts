import {
  formatDateKey,
  type Appointment,
} from '../lib/appointments';

export function makeAppointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id: 'appointment-1',
    title: 'Revisão de planejamento',
    date: formatDateKey(new Date()),
    time: '09:00',
    endTime: '10:00',
    notes: null,
    isMeeting: false,
    outcomeStatus: null,
    executedMinutes: null,
    ...overrides,
  };
}
