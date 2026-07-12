import { todayISO, diffDays } from './dates';

export const STATUS_RANK = { overdue: 0, due: 1, upcoming: 2, banked: 3 };

export function statusFor(resolveDate, today = todayISO()) {
  if (!resolveDate) return { status: 'banked', dayDelta: null };
  const delta = diffDays(today, resolveDate);
  if (delta < 0) return { status: 'overdue', dayDelta: delta };
  if (delta === 0) return { status: 'due', dayDelta: 0 };
  return { status: 'upcoming', dayDelta: delta };
}

export function sortProblems(problems, today = todayISO()) {
  return [...problems].sort((a, b) => {
    const sa = statusFor(a.resolveDate, today).status;
    const sb = statusFor(b.resolveDate, today).status;
    if (STATUS_RANK[sa] !== STATUS_RANK[sb]) return STATUS_RANK[sa] - STATUS_RANK[sb];
    if (sa !== 'banked' && a.resolveDate !== b.resolveDate) {
      return a.resolveDate < b.resolveDate ? -1 : 1;
    }
    return (a.name || '').localeCompare(b.name || '');
  });
}

export function deltaLabel(s) {
  if (s.status === 'due') return 'Due today';
  if (s.status === 'overdue') return `${Math.abs(s.dayDelta)}d overdue`;
  if (s.status === 'upcoming') return `in ${s.dayDelta}d`;
  return 'Banked';
}
