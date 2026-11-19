import {
  addDays,
  calendarModes,
  capitalize,
  monthDates,
  periodLabel,
  startOfWeek,
  weekdayLabel,
} from '../calendarUtils';

describe('calendar date utilities', () => {
  it('keeps the calendar week Monday-first and generates complete month grids', () => {
    const sunday = new Date(2026, 10, 22);
    const monday = startOfWeek(sunday);
    expect(monday).toEqual(new Date(2026, 10, 16));
    expect(monthDates(sunday)).toHaveLength(42);
  });

  it('moves dates by calendar days and formats period labels', () => {
    const date = new Date(2026, 10, 18);
    expect(addDays(date, 1)).toEqual(new Date(2026, 10, 19));
    expect(periodLabel(date, 'day')).toMatch(/18 de novembro de 2026/);
    expect(periodLabel(date, 'week')).toMatch(/16 nov/);
    expect(periodLabel(date, 'month')).toMatch(/Novembro de 2026/);
    expect(capitalize('quarta-feira')).toBe('Quarta-feira');
    expect(weekdayLabel(date)).toBe('QUA');
    expect(calendarModes.map(({ id }) => id)).toEqual(['day', 'week', 'month']);
  });
});
