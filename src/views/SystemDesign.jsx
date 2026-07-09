import { useMemo, useState } from 'react';
import { useData } from '../data/DataProvider';
import { todayISO } from '../lib/dates';
import Modal from '../components/Modal';

const BLANK = { date: '', source: '', tags: [], takeaway: '', body: '' };

export default function SystemDesign() {
  const { doc, addNote, updateNote, deleteNote } = useData();
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const notes = useMemo(
    () => [...doc.systemDesign].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [doc.systemDesign]);

  const onSave = (form) => {
    const clean = { ...form, tags: form.tags.map((t) => t.trim()).filter(Boolean) };
    if (editing === 'new') addNote({ ...clean, date: clean.date || todayISO() });
    else updateNote(editing.id, clean);
    setEditing(null);
  };

  return (
    <div className="view">
      <h1>System Design</h1>
      <div className="controls">
        <button className="primary" onClick={() => setEditing('new')}>+ Add note</button>
      </div>

      {notes.length === 0 ? (
        <p className="muted">No notes yet. Add one after a reading session.</p>
      ) : (
        notes.map((n) => (
          <div className="entry" key={n.id}>
            <div className="entry-takeaway">{n.takeaway || <span className="muted">(no takeaway)</span>}</div>
            <div className="entry-meta">
              {n.date}{n.source ? ` · ${n.source}` : ''}
            </div>
            {n.tags && n.tags.length > 0 && (
              <div>{n.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            )}
            {n.body && <p style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{n.body}</p>}
            <div className="row-actions">
              <button onClick={() => setEditing(n)}>Edit</button>
              <button className="danger" onClick={() => setConfirmId(n.id)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add note' : 'Edit note'} onClose={() => setEditing(null)}>
          <NoteForm initial={editing === 'new' ? BLANK : { ...BLANK, ...editing }} onSave={onSave} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {confirmId && (
        <Modal title="Delete note?" onClose={() => setConfirmId(null)}>
          <p>This can't be undone.</p>
          <div className="form-actions">
            <button onClick={() => setConfirmId(null)}>Cancel</button>
            <button className="danger" onClick={() => { deleteNote(confirmId); setConfirmId(null); }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function NoteForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({ ...initial, tagsText: (initial.tags || []).join(', ') });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    onSave({
      date: f.date, source: f.source, takeaway: f.takeaway, body: f.body,
      tags: f.tagsText.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };
  return (
    <form className="form" onSubmit={submit}>
      <label>Takeaway (one line)<input value={f.takeaway} onChange={set('takeaway')} placeholder="the single thing to remember" required /></label>
      <label>Body<textarea value={f.body} onChange={set('body')} placeholder="freeform notes from the session" /></label>
      <label>Source (optional)<input value={f.source} onChange={set('source')} placeholder="Alex Xu, Ch. 1 — or a URL" /></label>
      <label>Tags (optional, comma-separated)<input value={f.tagsText} onChange={set('tagsText')} placeholder="caching, load balancing" /></label>
      <label>Date<input type="date" value={f.date} onChange={set('date')} placeholder="auto-filled today if blank" /></label>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary">Save</button>
      </div>
    </form>
  );
}
