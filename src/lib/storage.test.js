import { describe, it, expect } from 'vitest';
import { encodeContent, decodeContent, emptyDoc } from './storage';

describe('emptyDoc', () => {
  it('has the four top-level keys', () => {
    expect(emptyDoc()).toEqual({ version: 2, leetcode: [], systemDesign: [], behavioral: [] });
  });
});

describe('encode/decode round-trip', () => {
  it('round-trips a plain document', () => {
    const doc = emptyDoc();
    expect(decodeContent(encodeContent(doc))).toEqual(doc);
  });
  it('round-trips unicode and emoji content', () => {
    const doc = { version: 1, note: 'café — 日本語 — 🚀 — "quotes"' };
    expect(decodeContent(encodeContent(doc))).toEqual(doc);
  });
  it('tolerates newlines in the base64 (GitHub returns wrapped base64)', () => {
    const doc = { version: 1, leetcode: [{ name: 'Two Sum' }] };
    const b64 = encodeContent(doc);
    const wrapped = b64.replace(/(.{4})/g, '$1\n');
    expect(decodeContent(wrapped)).toEqual(doc);
  });
});
