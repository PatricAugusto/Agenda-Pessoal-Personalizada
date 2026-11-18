import { parseDateKey, type AppointmentOutcome } from '../../lib/appointments';

export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export function formatDeviation(totalMinutes: number) {
  const sign = totalMinutes > 0 ? '+' : totalMinutes < 0 ? '-' : '';
  return `${sign}${formatDuration(Math.abs(totalMinutes))}`;
}

export function dateLabel(dateKey: string) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function outcomeLabel(status: AppointmentOutcome) {
  switch (status) {
    case 'completed':
      return 'CONCLUÍDO';
    case 'partial':
      return 'PARCIAL';
    case 'undone':
      return 'DESFEITO';
  }
}
