import { newId } from './id';
import { todayISO, epochToISO } from './dates';

function normalizeAttempt(a) {
  return {
    id: a.id || newId(),
    date: a.date || todayISO(),
    outcome: a.outcome || '',
    gapBug: a.gapBug || '',
    notes: a.notes || '',
  };
}

// v1 problems keep outcome/gapBug/notes at the top level; v2 moves them into
// attempts[0]. Dropping them from `rest` in both branches makes this idempotent
// and also cleans up any hybrid records.
export function normalizeProblem(p) {
  const { outcome, gapBug, notes, attempts, ...rest } = p;
  if (Array.isArray(attempts) && attempts.length > 0) {
    return { ...rest, attempts: attempts.map(normalizeAttempt) };
  }
  const date = typeof p.createdAt === 'number' ? epochToISO(p.createdAt) : todayISO();
  return {
    ...rest,
    attempts: [{
      id: newId(),
      date,
      outcome: outcome || '',
      gapBug: gapBug || '',
      notes: notes || '',
    }],
  };
}

export function normalizeDoc(obj) {
  const o = obj && typeof obj === 'object' ? obj : {};
  return {
    version: 2,
    leetcode: Array.isArray(o.leetcode) ? o.leetcode.map(normalizeProblem) : [],
    systemDesign: Array.isArray(o.systemDesign) ? o.systemDesign : [],
    behavioral: Array.isArray(o.behavioral) ? o.behavioral : [],
  };
}

export function latestAttempt(p) {
  return p.attempts[p.attempts.length - 1];
}
