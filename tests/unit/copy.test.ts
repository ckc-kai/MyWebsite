import { describe, expect, it } from 'vitest';
import { DESK_PATHS } from '../../src/components/anatomy/desk-paths';
import { copyFor, otherLang } from '../../src/content';
import type { Rich } from '../../src/content/types';

const zh = copyFor('zh');
const en = copyFor('en');
/** Chinese that may stay on the English page: the name beside his English name, and the link back to Chinese. */
const ALLOWED_CJK = new Set(['褚开诚', '中文', '中']);
const CJK = /[　-鿿＀-￯]+/g;

const plain = (rich: Rich): string => rich.map((part) => (typeof part === 'string' ? part : part.b)).join('');

/** Every string anywhere inside a value. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('the English copy lines up with the Chinese', () => {
  it('has the same stops, in the same order, with the same machines, photos and sketches', () => {
    const shape = (copy: typeof zh) =>
      copy.journey.stations.map((s) => ({
        id: s.id,
        kind: s.kind,
        machine: s.machine,
        photos: s.photos?.map((p) => p.key),
        sketches: s.sketches?.map((k) => k.key),
        hasResult: Boolean(s.result),
        hasPaper: Boolean(s.paper),
        passages: s.passages?.length,
        contacts: s.contacts?.map((c) => c.href),
        hobbies: s.hobbies?.map((h) => h.key),
      }));
    expect(shape(en)).toEqual(shape(zh));
  });

  it('states the same results and figures', () => {
    const results = (copy: typeof zh) => copy.journey.stations.map((s) => s.result && [s.result.from.replace(/\D+$/, ''), s.result.to.replace(/\D+$/, '')].map((n) => n.replace(/[^\d.]/g, '')));
    expect(results(en)).toEqual(results(zh));
    const estimates = (copy: typeof zh) => copy.journey.stations.flatMap((s) => s.paper?.estimates?.map((e) => [e.ratio, e.low, e.high]) ?? []);
    expect(estimates(en)).toEqual(estimates(zh));
  });

  it('walks the same machines through the same stations', () => {
    expect(en.flagship.semg.stations.map((s) => s.id)).toEqual(zh.flagship.semg.stations.map((s) => s.id));
    expect(en.flagship.semg.versions.items.map((v) => v.cer)).toEqual(zh.flagship.semg.versions.items.map((v) => v.cer));
    expect(en.flagship.desk.stations.map((s) => [s.id, s.who])).toEqual(zh.flagship.desk.stations.map((s) => [s.id, s.who]));
    expect(en.flagship.desk.groups.map((g) => g.ids)).toEqual(zh.flagship.desk.groups.map((g) => g.ids));
    expect(en.flagship.report.stages.map((s) => [s.id, s.points.length])).toEqual(zh.flagship.report.stages.map((s) => [s.id, s.points.length]));
  });

  it('narrates every step of every question the drawing walks', () => {
    for (const copy of [zh, en]) {
      for (const question of copy.flagship.desk.follow.questions) {
        expect(question.steps, question.id).toHaveLength(DESK_PATHS[question.id].length);
      }
    }
  });

  it('fills both blanks of the band-turning sentence', () => {
    for (const copy of [zh, en]) {
      for (const template of Object.values(copy.flagship.semg.turn.turned)) {
        expect(template).toContain('{n}');
        expect(template).toContain('{e}');
      }
    }
  });

  it('leaves no Chinese on the English page beyond the name and the way back', () => {
    const found = new Set(strings(en).flatMap((text) => text.match(CJK) ?? []));
    expect([...found].filter((text) => !ALLOWED_CJK.has(text))).toEqual([]);
  });

  it('keeps titles free of end punctuation in both languages', () => {
    for (const copy of [zh, en]) {
      for (const station of copy.journey.stations) expect(station.title, station.id).not.toMatch(/[.。!！?？,，]$/);
    }
  });

  it('writes the English lead of every stop as real English', () => {
    for (const station of en.journey.stations) expect(plain(station.lead), station.id).toMatch(/[A-Za-z]{3,}/);
  });

  it('points each page at the other', () => {
    expect(otherLang('zh')).toBe('en');
    expect(otherLang('en')).toBe('zh');
  });
});
