import { useState } from 'react';
import { useData } from '../data/DataProvider';
import { statusFor, deltaLabel } from '../lib/status';
import Modal from './Modal';
import AttemptForm from './AttemptForm';

export default function ProblemDetailModal({ problemId, initialLog, onClose }) {
  const { doc, addAttempt, updateAttempt, deleteAttempt } = useData();
  const [logging, setLogging] = useState(initialLog);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // Look up fresh each render: the stored object would go stale after a mutation.
  const problem = doc.leetcode.find((p) => p.id === problemId);
  if (!problem) return null;

  const s = statusFor(problem.resolveDate);
  const numbered = problem.attempts.map((a, i) => ({ ...a, n: i + 1 })).reverse();

  return (
    <Modal title={problem.name} onClose={onClose}>
      <div className="detail-meta">
        {problem.pattern && <span className="tag">{problem.pattern}</span>}
        <span className={'badge ' + s.status}>{deltaLabel(s)}</span>
        {problem.resolveDate && <span className="muted">{problem.resolveDate}</span>}
        {problem.url && <a href={problem.url} target="_blank" rel="noreferrer">problem ↗</a>}
      </div>
      {problem.signalTool && <p className="detail-signal">{problem.signalTool}</p>}

      {logging ? (
        <AttemptForm
          resolveDate={problem.resolveDate || ''}
          onSave={(fields, next) => { addAttempt(problem.id, fields, next); setLogging(false); }}
          onCancel={() => setLogging(false)}
        />
      ) : (
        <button className="primary" onClick={() => { setLogging(true); setEditId(null); }}>+ Log attempt</button>
      )}

      <h3 className="attempts-title">Attempts ({problem.attempts.length})</h3>
      {numbered.map((a) =>
        editId === a.id ? (
          <AttemptForm
            key={a.id}
            initial={a}
            onSave={(fields) => { updateAttempt(problem.id, a.id, fields); setEditId(null); }}
            onCancel={() => setEditId(null)}
          />
        ) : (
          <div className="attempt" key={a.id}>
            <div className="attempt-head">
              <span className="attempt-num">#{a.n}</span>
              <span className="muted">{a.date}</span>
              {a.outcome && <span className="badge banked">outcome {a.outcome}</span>}
              <span className="attempt-actions">
                <button onClick={() => { setEditId(a.id); setLogging(false); }}>Edit</button>
                {confirmId === a.id ? (
                  <>
                    <button className="danger" onClick={() => { deleteAttempt(problem.id, a.id); setConfirmId(null); }}>Confirm</button>
                    <button onClick={() => setConfirmId(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="danger" disabled={problem.attempts.length === 1} onClick={() => setConfirmId(a.id)}>Delete</button>
                )}
              </span>
            </div>
            {a.gapBug && <div className="attempt-field"><span className="muted">Gap / Bug:</span> {a.gapBug}</div>}
            {a.notes && <div className="attempt-notes">{a.notes}</div>}
          </div>
        )
      )}
    </Modal>
  );
}
