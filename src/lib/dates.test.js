import { describe, it, expect } from 'vitest';
import { addDaysISO, diffDays, epochToISO } from './dates';

describe('addDaysISO', () => {
  it('adds days within a month', () => {
    expect(addDaysISO(3, '2026-07-09')).toBe('2026-07-12');
  });
  it('crosses a month boundary', () => {
    expect(addDaysISO(14, '2026-07-25')).toBe('2026-08-08');
  });
  it('crosses a year boundary', () => {
    expect(addDaysISO(1, '2026-12-31')).toBe('2027-01-01');
  });
  it('supports zero', () => {
    expect(addDaysISO(0, '2026-07-09')).toBe('2026-07-09');
  });
});

describe('diffDays', () => {
  it('is zero for the same date', () => {
    expect(diffDays('2026-07-09', '2026-07-09')).toBe(0);
  });
  it('is positive when to is later', () => {
    expect(diffDays('2026-07-09', '2026-07-12')).toBe(3);
  });
  it('is negative when to is earlier', () => {
    expect(diffDays('2026-07-09', '2026-07-06')).toBe(-3);
  });
  it('counts across a month boundary', () => {
    expect(diffDays('2026-07-30', '2026-08-02')).toBe(3);
  });
});

describe('epochToISO', () => {
  it('converts epoch ms to a local YYYY-MM-DD', () => {
    expect(epochToISO(new Date(2026, 0, 5, 23, 59).getTime())).toBe('2026-01-05');
  });
  it('pads month and day', () => {
    expect(epochToISO(new Date(2026, 8, 3).getTime())).toBe('2026-09-03');
  });
});
