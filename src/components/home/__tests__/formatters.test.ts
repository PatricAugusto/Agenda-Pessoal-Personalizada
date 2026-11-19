import {
  dateLabel,
  formatDeviation,
  formatDuration,
  outcomeLabel,
} from '../formatters';

describe('overview formatters', () => {
  it('formats minute/hour values without losing the sign of a deviation', () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 h');
    expect(formatDuration(90)).toBe('1 h 30 min');
    expect(formatDeviation(-90)).toBe('-1 h 30 min');
    expect(formatDeviation(90)).toBe('+1 h 30 min');
  });

  it('formats valid date keys and preserves invalid input', () => {
    expect(dateLabel('2026-11-18')).toMatch(/18/);
    expect(dateLabel('not-a-date')).toBe('not-a-date');
  });

  it.each([
    ['completed', 'CONCLUÍDO'],
    ['partial', 'PARCIAL'],
    ['undone', 'DESFEITO'],
  ] as const)('labels the %s outcome', (status, label) => {
    expect(outcomeLabel(status)).toBe(label);
  });
});
