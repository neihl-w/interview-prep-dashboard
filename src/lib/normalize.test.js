import { describe, it, expect } from 'vitest';
import { normalizeDoc, normalizeProblem, latestAttempt } from './normalize';
import { todayISO } from './dates';

const OLD = {
  id: 'p1',
  name: 'Two Sum',
  url: 'https://leetcode.com/problems/two-sum/',
  pattern: 'Hash Map',
  outcome: '2',
  signalTool: 'need pair → hash',
  gapBug: 'off-by-one',
  notes: 'forgot dup handling',
  resolveDate: '2026-07-15',
  createdAt: new Date(2026, 6, 9, 15, 30).getTime(), // local 2026-07-09
};

describe('normalizeProblem (v1 → v2 migration)', () => {
  it('builds attempt #1 from the old flat fields', () => {
    const p = normalizeProblem(OLD);
    expect(p.attempts).toHaveLength(1);
    const a = p.attempts[0];
    expect(a.date).toBe('2026-07-09');
    expect(a.outcome).toBe('2');
    expect(a.gapBug).toBe('off-by-one');
    expect(a.notes).toBe('forgot dup handling');
    expect(a.id).toBeTruthy();
  });

  it('drops old top-level fields, keeps identity and schedule fields', () => {
    const p = normalizeProblem(OLD);
    expect('outcome' in p).toBe(false);
    expect('gapBug' in p).toBe(false);
    expect('notes' in p).toBe(false);
    expect(p.name).toBe('Two Sum');
    expect(p.signalTool).toBe('need pair → hash');
    expect(p.resolveDate).toBe('2026-07-15');
    expect(p.createdAt).toBe(OLD.createdAt);
  });

  it('defaults missing fields to empty strings and dates attempt #1 today when createdAt is absent', () => {
    const p = normalizeProblem({ id: 'p2', name: 'Bare' });
    expect(p.attempts).toEqual([
      { id: p.attempts[0].id, date: todayISO(), outcome: '', gapBug: '', notes: '' },
    ]);
  });

  it('treats an empty attempts array as unmigrated', () => {
    const p = normalizeProblem({ id: 'p3', name: 'X', outcome: '3', attempts: [] });
    expect(p.attempts).toHaveLength(1);
    expect(p.attempts[0].outcome).toBe('3');
  });

  it('is idempotent for already-migrated problems', () => {
    const once = normalizeProblem(OLD);
    expect(normalizeProblem(once)).toEqual(once);
  });
});

describe('normalizeDoc', () => {
  it('produces a version-2 doc and migrates mixed problems', () => {
    const doc = normalizeDoc({
      version: 1,
      leetcode: [OLD, normalizeProblem(OLD)],
      systemDesign: [{ id: 'n1' }],
      behavioral: [],
    });
    expect(doc.version).toBe(2);
    expect(doc.leetcode).toHaveLength(2);
    for (const p of doc.leetcode) expect(p.attempts.length).toBeGreaterThan(0);
    expect(doc.systemDesign).toEqual([{ id: 'n1' }]);
  });

  it('yields a valid empty doc from malformed input', () => {
    expect(normalizeDoc(null)).toEqual({ version: 2, leetcode: [], systemDesign: [], behavioral: [] });
  });
});

describe('latestAttempt', () => {
  it('returns the last attempt', () => {
    const p = { attempts: [{ id: 'a1' }, { id: 'a2' }] };
    expect(latestAttempt(p).id).toBe('a2');
  });
});
