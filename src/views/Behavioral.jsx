import { useMemo, useState } from 'react';
import { useData } from '../data/DataProvider';
import { coverageMatrix } from '../lib/coverage';
import { THEMES, AMAZON_LPS } from '../lib/constants';
import Modal from '../components/Modal';

const BLANK = { title: '', situation: '', task: '', action: '', result: '', themes: [], values: [] };

export default function Behavioral() {
  const { doc, addStory, updateStory, deleteStory } = useData();
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const matrix = useMemo(() => coverageMatrix(doc.behavioral), [doc.behavioral]);

  const onSave = (form) => {
    if (editing === 'new') addStory(form);
    else updateStory(editing.id, form);
    setEditing(null);
  };

  return (
    <div className="view">
      <h1>Behavioral</h1>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Coverage</h2>
        <div className="matrix">
          {matrix.map((c) => (
            <div key={c.theme} className={'matrix-cell ' + (c.covered ? 'covered' : 'gap')}>
              <span className={'mark ' + (c.covered ? 'ok' : 'no')}>{c.covered ? '✓' : '✗'}</span>
              <span style={{ flex: 1 }}>{c.theme}</span>
              <span className="muted">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="controls">
        <button className="primary" onClick={() => setEditing('new')}>+ Add story</button>
      </div>

      {doc.behavioral.length === 0 ? (
        <p className="muted">No stories yet. Add one to start filling the coverage matrix.</p>
      ) : (
        doc.behavioral.map((s) => (
          <div className="entry" key={s.id}>
            <div className="entry-takeaway">{s.title || <span className="muted">(untitled)</span>}</div>
            {s.themes && s.themes.length > 0 && (
              <div style={{ margin: '4px 0' }}>{s.themes.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            )}
            {s.values && s.values.length > 0 && (
              <div className="entry-meta">{s.values.join(' · ')}</div>
            )}
            <div className="row-actions">
              <button onClick={() => setEditing(s)}>Edit</button>
              <button className="danger" onClick={() => setConfirmId(s.id)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add story' : 'Edit story'} onClose={() => setEditing(null)}>
          <StoryForm initial={editing === 'new' ? BLANK : { ...BLANK, ...editing }} onSave={onSave} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {confirmId && (
        <Modal title="Delete story?" onClose={() => setConfirmId(null)}>
          <p>This can't be undone.</p>
          <div className="form-actions">
            <button onClick={() => setConfirmId(null)}>Cancel</button>
            <button className="danger" onClick={() => { deleteStory(confirmId); setConfirmId(null); }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StoryForm({ initial, onSave, onCancel }) {
  // values split into: LP checkboxes (from AMAZON_LPS) + free-tag remainder
  const initLpValues = (initial.values || []).filter((v) => AMAZON_LPS.includes(v));
  const initFree = (initial.values || []).filter((v) => !AMAZON_LPS.includes(v));
  const [f, setF] = useState({
    ...initial,
    lpValues: initLpValues,
    freeText: initFree.join(', '),
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const toggle = (list, item) => list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  const toggleTheme = (t) => setF({ ...f, themes: toggle(f.themes, t) });
  const toggleLp = (lp) => setF({ ...f, lpValues: toggle(f.lpValues, lp) });

  const submit = (e) => {
    e.preventDefault();
    const free = f.freeText.split(',').map((t) => t.trim()).filter(Boolean);
    onSave({
      title: f.title, situation: f.situation, task: f.task, action: f.action, result: f.result,
      themes: f.themes,
      values: [...f.lpValues, ...free],
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <label>Title<input value={f.title} onChange={set('title')} required /></label>
      <label>Situation<textarea value={f.situation} onChange={set('situation')} /></label>
      <label>Task<textarea value={f.task} onChange={set('task')} /></label>
      <label>Action<textarea value={f.action} onChange={set('action')} /></label>
      <label>Result<textarea value={f.result} onChange={set('result')} /></label>

      <div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Themes covered</div>
        <div className="checks">
          {THEMES.map((t) => (
            <label key={t}><input type="checkbox" checked={f.themes.includes(t)} onChange={() => toggleTheme(t)} /> {t}</label>
          ))}
        </div>
      </div>

      <div>
        <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Amazon Leadership Principles</div>
        <div className="checks">
          {AMAZON_LPS.map((lp) => (
            <label key={lp}><input type="checkbox" checked={f.lpValues.includes(lp)} onChange={() => toggleLp(lp)} /> {lp}</label>
          ))}
        </div>
      </div>

      <label>Other values / tags (comma-separated)<input value={f.freeText} onChange={set('freeText')} placeholder="e.g. Google 'Googleyness'" /></label>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Save</button>
      </div>
    </form>
  );
}
