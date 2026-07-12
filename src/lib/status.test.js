import { describe, it, expect } from 'vitest';
import { statusFor, sortProblems, STATUS_RANK, deltaLabel } from './status';

const TODAY = '2026-07-09';

describe('statusFor', () => {
  it('banks an empty resolveDate', () => {
    expect(statusFor('', TODAY)).toEqual({ status: 'banked', dayDelta: null });
  });
  it('marks a past date overdue with negative delta', () => {
    expect(statusFor('2026-07-06', TODAY)).toEqual({ status: 'overdue', dayDelta: -3 });
  });
  it('marks today as due with zero delta', () => {
    expect(statusFor('2026-07-09', TODAY)).toEqual({ status: 'due', dayDelta: 0 });
  });
  it('marks a future date upcoming with positive delta', () => {
    expect(statusFor('2026-07-12', TODAY)).toEqual({ status: 'upcoming', dayDelta: 3 });
  });
});

describe('sortProblems', () => {
  it('orders overdue, then due, then upcoming, then banked', () => {
    const input = [
      { name: 'banked', resolveDate: '' },
      { name: 'upcoming', resolveDate: '2026-07-20' },
      { name: 'due', resolveDate: '2026-07-09' },
      { name: 'overdue', resolveDate: '2026-07-01' },
    ];
    expect(sortProblems(input, TODAY).map((p) => p.name))
      .toEqual(['overdue', 'due', 'upcoming', 'banked']);
  });
  it('within overdue, most overdue (earliest date) comes first', () => {
    const input = [
      { name: 'b', resolveDate: '2026-07-07' },
      { name: 'a', resolveDate: '2026-07-02' },
    ];
    expect(sortProblems(input, TODAY).map((p) => p.name)).toEqual(['a', 'b']);
  });
  it('breaks banked ties by name', () => {
    const input = [
      { name: 'Zebra', resolveDate: '' },
      { name: 'Alpha', resolveDate: '' },
    ];
    expect(sortProblems(input, TODAY).map((p) => p.name)).toEqual(['Alpha', 'Zebra']);
  });
  it('does not mutate the input array', () => {
    const input = [{ name: 'x', resolveDate: '2026-07-20' }, { name: 'y', resolveDate: '2026-07-01' }];
    const copy = [...input];
    sortProblems(input, TODAY);
    expect(input).toEqual(copy);
  });
});

describe('STATUS_RANK', () => {
  it('ranks statuses in urgency order', () => {
    expect(STATUS_RANK).toEqual({ overdue: 0, due: 1, upcoming: 2, banked: 3 });
  });
});

describe('deltaLabel', () => {
  it('labels each status', () => {
    expect(deltaLabel(statusFor('2026-07-06', TODAY))).toBe('3d overdue');
    expect(deltaLabel(statusFor('2026-07-09', TODAY))).toBe('Due today');
    expect(deltaLabel(statusFor('2026-07-12', TODAY))).toBe('in 3d');
    expect(deltaLabel(statusFor('', TODAY))).toBe('Banked');
  });
});
