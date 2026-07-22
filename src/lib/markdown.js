// A deliberately tiny Markdown subset for LeetCode notes: **bold**, *italic*,
// `code`, and `-`/`*` bulleted or `1.` numbered lists. The goal is light
// formatting, not a full renderer — so parsing stays pure and predictable and
// existing plain-text notes pass through untouched (plain text is valid input).
//
// parseInline / parseMarkdown return plain data (no JSX) so they're easy to
// unit-test; RichText turns that data into React nodes.

// Bold before italic so `**x**` is not read as two italics. Both require the
// content to start and end with a non-space, which keeps arithmetic like
// `2 * 3` or `O(n) * O(m)` from being mistaken for emphasis.
const INLINE_RE = /\*\*(\S(?:[^*]*\S)?)\*\*|\*(\S(?:[^*]*\S)?)\*|`([^`]+)`/g;

const UL_RE = /^\s*[-*]\s+(.*)$/;
const OL_RE = /^\s*\d+[.)]\s+(.*)$/;

// Split a single line into text / bold / italic / code tokens.
export function parseInline(text) {
  const tokens = [];
  let last = 0;
  let m;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', value: text.slice(last, m.index) });
    if (m[1] !== undefined) tokens.push({ type: 'bold', value: m[1] });
    else if (m[2] !== undefined) tokens.push({ type: 'italic', value: m[2] });
    else tokens.push({ type: 'code', value: m[3] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ type: 'text', value: text.slice(last) });
  return tokens;
}

// Split note text into block descriptors: { type: 'ul' | 'ol', items } or
// { type: 'p', lines }. Consecutive non-list lines fold into one paragraph
// (each original line kept so soft line breaks survive); blank lines separate.
export function parseMarkdown(text) {
  const lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === '') { i++; continue; }

    let mm = lines[i].match(UL_RE);
    if (mm) {
      const items = [];
      while (i < lines.length && (mm = lines[i].match(UL_RE))) { items.push(parseInline(mm[1])); i++; }
      blocks.push({ type: 'ul', items });
      continue;
    }
    mm = lines[i].match(OL_RE);
    if (mm) {
      const items = [];
      while (i < lines.length && (mm = lines[i].match(OL_RE))) { items.push(parseInline(mm[1])); i++; }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' && !UL_RE.test(lines[i]) && !OL_RE.test(lines[i])) {
      paraLines.push(parseInline(lines[i]));
      i++;
    }
    blocks.push({ type: 'p', lines: paraLines });
  }
  return blocks;
}
