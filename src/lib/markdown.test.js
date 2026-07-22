import { describe, it, expect } from 'vitest';
import { parseInline, parseMarkdown } from './markdown';

describe('parseInline', () => {
  it('returns a single text token for plain text', () => {
    expect(parseInline('just plain')).toEqual([{ type: 'text', value: 'just plain' }]);
  });

  it('parses bold, italic, and code with surrounding text', () => {
    expect(parseInline('a **b** and *c* and `d()`')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'bold', value: 'b' },
      { type: 'text', value: ' and ' },
      { type: 'italic', value: 'c' },
      { type: 'text', value: ' and ' },
      { type: 'code', value: 'd()' },
    ]);
  });

  it('prefers bold over italic for double stars', () => {
    expect(parseInline('**strong**')).toEqual([{ type: 'bold', value: 'strong' }]);
  });

  it('does not treat spaced multiplication as emphasis', () => {
    expect(parseInline('cost is O(n) * O(m) here')).toEqual([
      { type: 'text', value: 'cost is O(n) * O(m) here' },
    ]);
  });
});

describe('parseMarkdown', () => {
  it('wraps a plain line in a paragraph block', () => {
    expect(parseMarkdown('hello')).toEqual([{ type: 'p', lines: [[{ type: 'text', value: 'hello' }]] }]);
  });

  it('groups soft line breaks into one paragraph and splits on blank lines', () => {
    const blocks = parseMarkdown('one\ntwo\n\nthree');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe('p');
    expect(blocks[0].lines).toHaveLength(2);
    expect(blocks[1].lines).toHaveLength(1);
  });

  it('collects a bulleted list', () => {
    const blocks = parseMarkdown('- first\n- second');
    expect(blocks).toEqual([
      { type: 'ul', items: [[{ type: 'text', value: 'first' }], [{ type: 'text', value: 'second' }]] },
    ]);
  });

  it('collects a numbered list and keeps inline formatting inside items', () => {
    const blocks = parseMarkdown('1. do **x**\n2. do y');
    expect(blocks[0].type).toBe('ol');
    expect(blocks[0].items[0]).toEqual([
      { type: 'text', value: 'do ' },
      { type: 'bold', value: 'x' },
    ]);
  });

  it('separates a paragraph, a list, and a trailing paragraph', () => {
    const blocks = parseMarkdown('intro\n- a\n- b\noutro');
    expect(blocks.map((b) => b.type)).toEqual(['p', 'ul', 'p']);
  });

  it('treats a lone italic line as a paragraph, not a bullet', () => {
    expect(parseMarkdown('*emphasis*')).toEqual([
      { type: 'p', lines: [[{ type: 'italic', value: 'emphasis' }]] },
    ]);
  });

  it('handles empty and nullish input', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown(null)).toEqual([]);
  });
});
