import { useState } from 'react';
import { todayISO, addDaysISO } from '../lib/dates';
import { OUTCOMES } from '../lib/constants';

// Log mode (resolveDate prop passed): shows the "next re-solve" scheduler and
// calls onSave(fields, nextResolveDate). Edit mode (no resolveDate): onSave(fields).
// The scheduler starts blank, not at the old resolveDate — otherwise saving
// without touching it silently keeps a stale date and the due tag never updates.
export default function AttemptForm({ initial, resolveDate, onSave, onCancel }) {
  const withReschedule = resolveDate !== undefined;
  const [f, setF] = useState({ date: todayISO(), outcome: '', gapBug: '', notes: '', ...initial });
  const [next, setNext] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const fields = { date: f.date, outcome: f.outcome, gapBug: f.gapBug, notes: f.notes };
    if (withReschedule) onSave(fields, next);
    else onSave(fields);
  };
  return (
    <form className="form" onSubmit={submit}>
      <label>Date<input type="date" value={f.date} onChange={set('date')} required /></label>
      <label>Outcome
        <select value={f.outcome} onChange={set('outcome')}>
          <option value="">—</option>
          {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label>Gap / Bug<input value={f.gapBug} onChange={set('gapBug')} /></label>
      <label>Notes<textarea value={f.notes} onChange={set('notes')} /></label>
      {withReschedule && (
        <>
          <label>
            <span>Next re-solve date <span className="muted">(leave blank to bank{resolveDate ? `; was ${resolveDate}` : ''})</span></span>
            <input type="date" value={next} onChange={(e) => setNext(e.target.value)} />
          </label>
          <div className="quickset">
            <button type="button" onClick={() => setNext(todayISO())}>Today</button>
            <button type="button" onClick={() => setNext(addDaysISO(3))}>+3 days</button>
            <button type="button" onClick={() => setNext(addDaysISO(14))}>+2 weeks</button>
            <button type="button" onClick={() => setNext('')}>Clear (bank)</button>
          </div>
        </>
      )}
      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Save</button>
      </div>
    </form>
  );
}
