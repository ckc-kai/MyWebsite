/**
 * The characters each Chinese typeface has to carry. The two Chinese faces are cut down to exactly
 * these (see build-fonts.ts), so a page loads a few hundred glyphs instead of tens of thousands.
 */
import { copyFor } from '../src/content';
import type { Lang } from '../src/content/types';

/** Every source file's text, read through Vite (vitest and vite-node both run this). */
const SOURCES = import.meta.glob<string>(['../src/**/*.{ts,astro}', '!../src/vendor/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const LANGS: readonly Lang[] = ['zh', 'en'];
/** Plain ASCII is drawn by the Latin faces (and Long Cang's own Latin file), never by the cut-down files. */
const isWide = (char: string): boolean => (char.codePointAt(0) ?? 0) > 0x7e;

const uniqueWide = (text: string): string => [...new Set([...text].filter(isWide))].sort().join('');

/**
 * Noto Serif SC (headings, figure labels, the seal on the sketches): every non-ASCII character
 * written anywhere in the source. Generous on purpose, so a new heading can't fall out of the face.
 */
export function displayText(): string {
  return uniqueWide(Object.values(SOURCES).join(''));
}

/** The Chinese copy files, whose characters only the Chinese page shows. */
const CHINESE_ONLY = /\/content\/(zh|flagship-zh)\.ts$/;

/**
 * The part of displayText() the English page can show too (the name in the header, the seal on the
 * sketches, the language switch). It gets its own small file, so the English page never downloads
 * the glyphs of the Chinese copy.
 */
export function sharedDisplayText(): string {
  return uniqueWide(
    Object.entries(SOURCES)
      .filter(([file]) => !CHINESE_ONLY.test(file))
      .map(([, text]) => text)
      .join(''),
  );
}

/** Long Cang (the handwritten lines): only the copy that is set in the hand. */
export function handText(): string {
  const lines = LANGS.flatMap((lang) => {
    const { opening, journey } = copyFor(lang);
    return [
      opening.deck,
      opening.kidNote,
      ...journey.stations.flatMap((station) => [
        ...(station.photos ?? []).map((photo) => photo.caption),
        ...(station.sketches ?? []).map((sketch) => sketch.name),
        ...(station.hobbies ?? []).map((hobby) => hobby.label),
      ]),
    ];
  });
  return uniqueWide(lines.join(''));
}
