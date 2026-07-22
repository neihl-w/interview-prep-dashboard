import { useLayoutEffect, useRef } from 'react';

// A plain textarea with a small formatting toolbar. Notes are stored as the
// same Markdown text they display as, so the buttons just splice delimiters
// (**bold**, *italic*, `code`) around the selection or prefix the selected
// lines (- , 1. ). After a toolbar edit we restore the caret/selection so the
// user can keep typing where they left off.
export default function NotesEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const pendingSel = useRef(null);

  useLayoutEffect(() => {
    if (pendingSel.current && ref.current) {
      const [s, e] = pendingSel.current;
      ref.current.focus();
      ref.current.setSelectionRange(s, e);
      pendingSel.current = null;
    }
  });

  const surround = (before, after) => {
    const el = ref.current;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const next = value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e);
    // Keep the original text selected inside the delimiters; if nothing was
    // selected, drop the caret between them so typing lands in the markup.
    pendingSel.current = [s + before.length, e + before.length];
    onChange(next);
  };

  const linePrefix = (kind) => {
    const el = ref.current;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = value.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = value.length;
    const lines = value.slice(lineStart, lineEnd).split('\n');
    const nextBlock = lines.map((ln, i) => (kind === 'ol' ? `${i + 1}. ` : '- ') + ln).join('\n');
    const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
    pendingSel.current = [lineStart, lineStart + nextBlock.length];
    onChange(next);
  };

  return (
    <div className="notes-editor">
      <div className="notes-toolbar" role="toolbar" aria-label="Note formatting">
        <button type="button" title="Bold (**text**)" onClick={() => surround('**', '**')}><b>B</b></button>
        <button type="button" title="Italic (*text*)" onClick={() => surround('*', '*')}><i>I</i></button>
        <button type="button" className="mono" title="Inline code (`text`)" onClick={() => surround('`', '`')}>&lt;/&gt;</button>
        <span className="notes-toolbar-sep" aria-hidden="true" />
        <button type="button" title="Bulleted list" onClick={() => linePrefix('ul')}>• List</button>
        <button type="button" title="Numbered list" onClick={() => linePrefix('ol')}>1. List</button>
      </div>
      <textarea ref={ref} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <p className="notes-hint muted">
        Formatting: <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>, <code>- bullets</code>, <code>1. numbered</code>
      </p>
    </div>
  );
}
