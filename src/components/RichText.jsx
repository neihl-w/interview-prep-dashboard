import { Fragment } from 'react';
import { parseMarkdown } from '../lib/markdown';

// Renders inline tokens (text/bold/italic/code) for one line or list item.
function Inline({ tokens }) {
  return tokens.map((t, i) => {
    if (t.type === 'bold') return <strong key={i}>{t.value}</strong>;
    if (t.type === 'italic') return <em key={i}>{t.value}</em>;
    if (t.type === 'code') return <code key={i}>{t.value}</code>;
    return <Fragment key={i}>{t.value}</Fragment>;
  });
}

// Renders the tiny Markdown subset (see lib/markdown) into safe React nodes —
// no dangerouslySetInnerHTML, so note text can never inject markup.
export default function RichText({ text, className }) {
  const blocks = parseMarkdown(text);
  return (
    <div className={'notes-rich' + (className ? ' ' + className : '')}>
      {blocks.map((b, i) => {
        if (b.type === 'ul') return <ul key={i}>{b.items.map((it, j) => <li key={j}><Inline tokens={it} /></li>)}</ul>;
        if (b.type === 'ol') return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline tokens={it} /></li>)}</ol>;
        return (
          <p key={i}>
            {b.lines.map((ln, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline tokens={ln} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
