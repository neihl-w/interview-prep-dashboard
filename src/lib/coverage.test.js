import { describe, it, expect } from 'vitest';
import { coverageMatrix } from './coverage';
import { THEMES } from './constants';

describe('coverageMatrix', () => {
  it('returns one entry per canonical theme, in order', () => {
    const m = coverageMatrix([]);
    expect(m.map((c) => c.theme)).toEqual(THEMES);
  });
  it('marks every theme uncovered for no stories', () => {
    const m = coverageMatrix([]);
    expect(m.every((c) => c.covered === false && c.count === 0)).toBe(true);
  });
  it('counts stories per theme and marks covered', () => {
    const stories = [
      { themes: ['conflict', 'ambiguity'] },
      { themes: ['conflict'] },
      { themes: [] },
      { themes: undefined },
    ];
    const m = coverageMatrix(stories);
    const conflict = m.find((c) => c.theme === 'conflict');
    const ambiguity = m.find((c) => c.theme === 'ambiguity');
    const failure = m.find((c) => c.theme === 'failure');
    expect(conflict).toEqual({ theme: 'conflict', covered: true, count: 2 });
    expect(ambiguity).toEqual({ theme: 'ambiguity', covered: true, count: 1 });
    expect(failure).toEqual({ theme: 'failure', covered: false, count: 0 });
  });
});
