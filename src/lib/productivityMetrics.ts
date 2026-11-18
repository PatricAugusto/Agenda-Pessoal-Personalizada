import {
  formatDateKey,
  type Appointment,
  type ProductivitySettings,
} from './appointments';

export interface DailyProductivityMetrics {
  plannedMinutes: number;
  meetings: number;
  executedMinutes: number;
  deviationMinutes: number;
  pendingReviewCount: number;
  efficiencyPercent: number | null;
}

export interface CapacityMetrics {
  capacityPercent: number;
  excessMinutes: number;
  excessMeetings: number;
}

export interface ProductivityInsights {
  averageEfficiencyPercent: number | null;
  reviewedDays: number;
  daysNearCapacity: number;
}

function parseTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function plannedMinutesForAppointment(appointment: Appointment) {
  const start = parseTime(appointment.time);
  if (start === null) {
    return 0;
  }
  if (!appointment.endTime) {
    // Older appointments do not have an end time; count them as one hour.
    return 60;
  }

  const end = parseTime(appointment.endTime);
  return end !== null && end > start ? end - start : 0;
}

function executedMinutesForAppointment(appointment: Appointment) {
  if (appointment.outcomeStatus === 'undone') {
    return 0;
  }
  if (appointment.outcomeStatus === 'completed') {
    return appointment.executedMinutes ??
      plannedMinutesForAppointment(appointment);
  }

  return appointment.executedMinutes ?? 0;
}

export function calculateDailyProductivity(
  appointments: readonly Appointment[],
  dateKey: string,
): DailyProductivityMetrics {
  const dailyAppointments = appointments.filter(
    (appointment) => appointment.date === dateKey,
  );
  const reviewedAppointments = dailyAppointments.filter(
    (appointment) => appointment.outcomeStatus !== null,
  );
  const plannedMinutes = dailyAppointments.reduce(
    (total, appointment) =>
      total + plannedMinutesForAppointment(appointment),
    0,
  );
  const executedMinutes = reviewedAppointments.reduce(
    (total, appointment) =>
      total + executedMinutesForAppointment(appointment),
    0,
  );

  return {
    plannedMinutes,
    meetings: dailyAppointments.filter((appointment) => appointment.isMeeting)
      .length,
    executedMinutes,
    deviationMinutes: executedMinutes - plannedMinutes,
    pendingReviewCount: dailyAppointments.length - reviewedAppointments.length,
    efficiencyPercent:
      plannedMinutes > 0
        ? (executedMinutes / plannedMinutes) * 100
        : null,
  };
}

export function calculateCapacityMetrics(
  daily: DailyProductivityMetrics,
  settings: ProductivitySettings,
): CapacityMetrics {
  const hourRatio = daily.plannedMinutes / settings.maxDailyMinutes;
  const meetingRatio = daily.meetings / settings.maxMeetings;

  return {
    capacityPercent: Math.max(hourRatio, meetingRatio) * 100,
    excessMinutes: Math.max(0, daily.plannedMinutes - settings.maxDailyMinutes),
    excessMeetings: Math.max(0, daily.meetings - settings.maxMeetings),
  };
}

export function calculateProductivityInsights(
  appointments: readonly Appointment[],
  today: Date,
  settings: ProductivitySettings,
): ProductivityInsights {
  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 29,
  );
  const firstDayKey = formatDateKey(firstDay);
  const lastDayKey = formatDateKey(today);
  const appointmentsByDay = new Map<string, Appointment[]>();

  for (const appointment of appointments) {
    if (appointment.date < firstDayKey || appointment.date > lastDayKey) {
      continue;
    }

    const dailyAppointments = appointmentsByDay.get(appointment.date) ?? [];
    dailyAppointments.push(appointment);
    appointmentsByDay.set(appointment.date, dailyAppointments);
  }

  const efficiencies: number[] = [];
  let daysNearCapacity = 0;

  for (const [dateKey, dailyAppointments] of appointmentsByDay) {
    const daily = calculateDailyProductivity(dailyAppointments, dateKey);
    if (
      daily.efficiencyPercent !== null &&
      daily.pendingReviewCount === 0
    ) {
      efficiencies.push(daily.efficiencyPercent);
    }
    const capacity = calculateCapacityMetrics(daily, settings);
    if (capacity.capacityPercent >= 90) {
      daysNearCapacity += 1;
    }
  }

  return {
    averageEfficiencyPercent:
      efficiencies.length > 0
        ? efficiencies.reduce((total, percent) => total + percent, 0) /
          efficiencies.length
        : null,
    reviewedDays: efficiencies.length,
    daysNearCapacity,
  };
}

export function calculateWeeklyPlannedMinutes(
  appointments: readonly Appointment[],
  date: Date,
) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOffset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - dayOffset);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 7);
  const firstDayKey = formatDateKey(monday);
  const lastDayKey = formatDateKey(sunday);

  return appointments.reduce((total, appointment) => {
    if (appointment.date >= firstDayKey && appointment.date < lastDayKey) {
      return total + plannedMinutesForAppointment(appointment);
    }
    return total;
  }, 0);
}
