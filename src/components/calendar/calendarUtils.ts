import { formatDateKey } from '../../lib/appointments';

export type CalendarMode = 'day' | 'week' | 'month';

export const calendarModes: { id: CalendarMode; label: string }[] = [
  { id: 'day', label: 'Dia' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
];

export const weekdayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

export function atMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function startOfWeek(date: Date) {
  const mondayFirstDay = (date.getDay() + 6) % 7;
  return addDays(date, -mondayFirstDay);
}

export function monthDates(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

  return Array.from({ length: 42 }, (_, index) =>
    new Date(date.getFullYear(), date.getMonth(), 1 - mondayFirstOffset + index),
  );
}

export function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1);
}

export function periodLabel(date: Date, mode: CalendarMode) {
  if (mode === 'month') {
    return capitalize(
      new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric',
      }).format(date),
    );
  }

  if (mode === 'day') {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  const firstDay = startOfWeek(date);
  const lastDay = addDays(firstDay, 6);
  const dayFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });
  const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

  return `${dayFormat.format(firstDay)} ${monthFormat.format(firstDay)} – ${dayFormat.format(lastDay)} ${monthFormat.format(lastDay)}`;
}

export function weekdayLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(date)
    .replace('.', '')
    .toLocaleUpperCase('pt-BR');
}

export function calendarDateKey(date: Date) {
  return formatDateKey(date);
}
