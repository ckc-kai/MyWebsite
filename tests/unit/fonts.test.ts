import { describe, expect, it } from 'vitest';
import { displayText, handText } from '../../scripts/font-text';
import glyphs from '../../src/assets/fonts/glyphs.json';

const manifest: Record<string, string> = glyphs;

/** Characters these faces never had; the browser draws them from the next font in the stack, as it always did. */
const NOT_IN_FACE: Record<string, string> = { 'Noto Serif SC': '’' };

function missing(family: string, text: string): string {
  const covered = new Set(manifest[family] ?? '');
  const absent = new Set(NOT_IN_FACE[family] ?? '');
  return [...text].filter((char) => !covered.has(char) && !absent.has(char)).join('');
}

describe('the cut-down Chinese fonts', () => {
  it('carry every character of the headings and labels (else run npm run build:fonts)', () => {
    expect(missing('Noto Serif SC', displayText())).toBe('');
  });

  it('carry every character of the handwritten lines (else run npm run build:fonts)', () => {
    expect(missing('Long Cang', handText())).toBe('');
  });
});
