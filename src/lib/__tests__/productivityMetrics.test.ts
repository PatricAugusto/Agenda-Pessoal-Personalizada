import {
  calculateCapacityMetrics,
  calculateDailyProductivity,
  calculateProductivityInsights,
  calculateWeeklyPlannedMinutes,
  plannedMinutesForAppointment,
} from '../productivityMetrics';
import { formatDateKey, type ProductivitySettings } from '../appointments';
import { makeAppointment } from '../../test/fixtures';

const settings: ProductivitySettings = {
  maxDailyMinutes: 360,
  maxMeetings: 3,
};

describe('productivity metrics', () => {
  it('calculates planned and executed time for a daily mix of outcomes', () => {
    const date = formatDateKey(new Date());
    const appointments = [
      makeAppointment({
        date,
        endTime: '10:30',
        outcomeStatus: 'completed',
      }),
      makeAppointment({
        id: 'partial',
        date,
        time: '11:00',
        endTime: '12:00',
        outcomeStatus: 'partial',
        executedMinutes: 20,
        isMeeting: true,
      }),
      makeAppointment({
        id: 'undone',
        date,
        time: '13:00',
        endTime: '14:00',
        outcomeStatus: 'undone',
        executedMinutes: 0,
      }),
    ];

    expect(calculateDailyProductivity(appointments, date)).toEqual({
      plannedMinutes: 210,
      meetings: 1,
      executedMinutes: 110,
      deviationMinutes: -100,
      pendingReviewCount: 0,
      efficiencyPercent: (110 / 210) * 100,
    });
  });

  it('uses the legacy one-hour duration and rejects malformed or reversed times', () => {
    expect(
      plannedMinutesForAppointment(makeAppointment({ endTime: null })),
    ).toBe(60);
    expect(
      plannedMinutesForAppointment(
        makeAppointment({ time: '25:00', endTime: '26:00' }),
      ),
    ).toBe(0);
    expect(
      plannedMinutesForAppointment(
        makeAppointment({ time: '10:00', endTime: '09:59' }),
      ),
    ).toBe(0);
  });

  it('reports the larger of time and meeting overloads', () => {
    const daily = calculateDailyProductivity(
      [
        makeAppointment({ endTime: '15:30', isMeeting: true }),
        makeAppointment({
          id: 'meeting-2',
          time: '16:00',
          endTime: '17:00',
          isMeeting: true,
        }),
        makeAppointment({
          id: 'meeting-3',
          time: '17:00',
          endTime: '18:00',
          isMeeting: true,
        }),
        makeAppointment({
          id: 'meeting-4',
          time: '18:00',
          endTime: '19:00',
          isMeeting: true,
        }),
      ],
      formatDateKey(new Date()),
    );

    expect(calculateCapacityMetrics(daily, settings)).toEqual({
      capacityPercent: (570 / 360) * 100,
      excessMinutes: 210,
      excessMeetings: 1,
    });
  });

  it('excludes incomplete days from the average and bounds insight history to 30 days', () => {
    const today = new Date(2026, 10, 18);
    const currentDay = formatDateKey(today);
    const previousDay = formatDateKey(new Date(2026, 10, 17));
    const oldDay = formatDateKey(new Date(2026, 9, 1));
    const appointments = [
      makeAppointment({
        id: 'reviewed',
        date: previousDay,
        outcomeStatus: 'completed',
      }),
      makeAppointment({
        id: 'pending',
        date: currentDay,
        time: '11:00',
        endTime: '12:00',
      }),
      makeAppointment({
        id: 'outside-window',
        date: oldDay,
        time: '11:00',
        endTime: '12:00',
        outcomeStatus: 'undone',
        executedMinutes: 0,
      }),
    ];

    expect(calculateProductivityInsights(appointments, today, settings)).toEqual({
      averageEfficiencyPercent: 100,
      reviewedDays: 1,
      daysNearCapacity: 0,
    });
  });

  it('includes Monday through Sunday in the weekly planned total', () => {
    const date = new Date(2026, 10, 18);
    const appointments = [
      makeAppointment({ date: '2026-11-16' }),
      makeAppointment({ id: 'sunday', date: '2026-11-22' }),
      makeAppointment({ id: 'next-week', date: '2026-11-23' }),
    ];

    expect(calculateWeeklyPlannedMinutes(appointments, date)).toBe(120);
  });
});
