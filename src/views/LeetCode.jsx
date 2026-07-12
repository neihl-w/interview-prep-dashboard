import { useMemo, useState } from 'react';
import { useData } from '../data/DataProvider';
import { statusFor, sortProblems, deltaLabel } from '../lib/status';
import { latestAttempt } from '../lib/normalize';
import { todayISO, addDaysISO } from '../lib/dates';
import { OUTCOMES } from '../lib/constants';
import Modal from '../components/Modal';
import ProblemDetailModal from '../components/ProblemDetailModal';

const STATUS_LABEL = { overdue: 'Overdue', due: 'Due today', upcoming: 'Upcoming', banked: 'Banked' };
const ORDER = ['overdue', 'due', 'upcoming', 'banked'];

const BLANK = { name: '', url: '', pattern: '', signalTool: '', resolveDate: '', outcome: '', gapBug: '', notes: '' };

// Explicit pick: the edit form must not carry attempts/id/createdAt into the
// updateProblem patch, or a stale snapshot could clobber attempts logged elsewhere.
function problemFields(p) {
  return {
    name: p.name || '', url: p.url || '', pattern: p.pattern || '',
    signalTool: p.signalTool || '', resolveDate: p.resolveDate || '',
  };
}

export default function LeetCode() {
  const { doc, addProblem, updateProblem, deleteProblem } = useData();
  const today = todayISO();
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState(null);
  const [dueOnly, setDueOnly] = useState(false);
  const [editing, setEditing] = useState(null); // 'new' | problem object | null
  const [confirmId, setConfirmId] = useState(null);
  const [detail, setDetail] = useState(null);

  const counts = useMemo(() => {
    const c = { overdue: 0, due: 0, upcoming: 0, banked: 0 };
    for (const p of doc.leetcode) c[statusFor(p.resolveDate, today).status]++;
    return c;
  }, [doc.leetcode, today]);

  const rows = useMemo(() => {
    let list = sortProblems(doc.leetcode, today);
    if (chip) list = list.filter((p) => statusFor(p.resolveDate, today).status === chip);
    if (dueOnly) list = list.filter((p) => ['overdue', 'due'].includes(statusFor(p.resolveDate, today).status));
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.pattern || '').toLowerCase().includes(q) ||
        (p.signalTool || '').toLowerCase().includes(q));
    }
    return list;
  }, [doc.leetcode, today, chip, dueOnly, search]);

  const onSave = (form) => {
    if (editing === 'new') addProblem(form);
    else updateProblem(editing.id, form);
    setEditing(null);
  };

  return (
    <div className="view">
      <h1>LeetCode</h1>

      <div className="chips">
        <button className={'chip' + (chip === null ? ' active' : '')} onClick={() => setChip(null)}>
          All <span className="badge banked">{doc.leetcode.length}</span>
        </button>
        {ORDER.map((s) => (
          <button key={s} className={'chip' + (chip === s ? ' active' : '')} onClick={() => setChip(chip === s ? null : s)}>
            {STATUS_LABEL[s]} <span className={'badge ' + s}>{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="controls">
        <input type="text" placeholder="Search name, pattern, or signal→tool" value={search} onChange={(e) => setSearch(e.target.value)} />
        <label className="toggle">
          <input type="checkbox" checked={dueOnly} onChange={(e) => setDueOnly(e.target.checked)} /> Due &amp; overdue only
        </label>
        <button className="primary" onClick={() => setEditing('new')}>+ Add problem</button>
      </div>

      {rows.length === 0 ? (
        <p className="muted">No problems match. Add one to get started.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Pattern</th><th>Outcome</th><th>Signal → Tool</th><th>Notes</th><th>Re-solve</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const s = statusFor(p.resolveDate, today);
              const last = latestAttempt(p);
              const rowCls = s.status === 'overdue' ? 'row-overdue' : s.status === 'due' ? 'row-due' : '';
              return (
                <tr key={p.id} className={rowCls}>
                  <td>
                    {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a> : p.name}
                    {p.attempts.length > 1 && <span className="count-badge">×{p.attempts.length}</span>}
                  </td>
                  <td>{p.pattern}</td>
                  <td>{last.outcome}</td>
                  <td>{p.signalTool}</td>
                  <td className="notes-cell" title={last.notes}>{last.notes || '—'}</td>
                  <td>
                    <span className={'badge ' + s.status}>{deltaLabel(s)}</span>
                    {p.resolveDate && <div className="muted" style={{ fontSize: 12 }}>{p.resolveDate}</div>}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => setDetail({ id: p.id, log: false })}>View</button>
                      <button onClick={() => setDetail({ id: p.id, log: true })}>Log</button>
                      <button onClick={() => setEditing(p)}>Edit</button>
                      <button className="danger" onClick={() => setConfirmId(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add problem' : 'Edit problem'} onClose={() => setEditing(null)}>
          <ProblemForm
            initial={editing === 'new' ? BLANK : problemFields(editing)}
            withAttemptFields={editing === 'new'}
            onSave={onSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {confirmId && (
        <Modal title="Delete problem?" onClose={() => setConfirmId(null)}>
          <p>This can't be undone.</p>
          <div className="form-actions">
            <button onClick={() => setConfirmId(null)}>Cancel</button>
            <button className="danger" onClick={() => { deleteProblem(confirmId); setConfirmId(null); }}>Delete</button>
          </div>
        </Modal>
      )}

      {detail && (
        <ProblemDetailModal problemId={detail.id} initialLog={detail.log} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

function ProblemForm({ initial, withAttemptFields, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setDate = (v) => setF({ ...f, resolveDate: v });
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <label>Name<input value={f.name} onChange={set('name')} required /></label>
      <label>Link<input value={f.url} onChange={set('url')} placeholder="https://leetcode.com/…" /></label>
      <label>Pattern<input value={f.pattern} onChange={set('pattern')} placeholder="Sliding Window" /></label>
      <label>Signal → Tool<input value={f.signalTool} onChange={set('signalTool')} placeholder="one-line trigger → technique" /></label>
      {withAttemptFields && (
        <>
          <label>Outcome
            <select value={f.outcome} onChange={set('outcome')}>
              <option value="">—</option>
              {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>Gap / Bug<input value={f.gapBug} onChange={set('gapBug')} /></label>
          <label>Notes<textarea value={f.notes} onChange={set('notes')} /></label>
        </>
      )}
      <label>Re-solve date<input type="date" value={f.resolveDate} onChange={set('resolveDate')} /></label>
      <div className="quickset">
        <button type="button" onClick={() => setDate(todayISO())}>Today</button>
        <button type="button" onClick={() => setDate(addDaysISO(3))}>+3 days</button>
        <button type="button" onClick={() => setDate(addDaysISO(14))}>+2 weeks</button>
        <button type="button" onClick={() => setDate('')}>Clear (bank)</button>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Save</button>
      </div>
    </form>
  );
}
