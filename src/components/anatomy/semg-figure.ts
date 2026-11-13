/**
 * The sEMG model, drawn as the line a signal travels: off the wrist, cut into slices of
 * spectrum, round a table where the sixteen electrodes compare notes, past a fill-in-the-blank
 * exercise, up a three-storey Transformer and a two-storey refinement head, and out of a
 * decoder as lettered blocks laid out like a keyboard.
 *
 * World units are roughly millimetres: x runs along the line, y across it, z up.
 * The viewer stands at +x, +y. Angles round the arm run from the +x axis towards +y.
 */
import * as k from '../../vendor/anatomy/iso-kit.mjs';
import type { Plan, Point2, Point3 } from '../../vendor/anatomy/iso-kit.mjs';
import { FOOT_H, PLATE_H, benchPlate, createDraw, fine } from './draw';

export const SEMG_FIGURE_SIZE = { width: 1100, height: 510 };
export const ELECTRODES = 16;
/** The place on the band, counted round from +x, that sits over the working muscle. */
export const MUSCLE_AT = 2;
export const MAX_TURN = 2;
export const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'] as const;
export const SEMG_STATIONS = ['band', 'spectrum', 'mixer', 'pretrain', 'backbone', 'refine', 'decode'] as const;
export type SemgStation = (typeof SEMG_STATIONS)[number];
/** The version of the model, counted from the baseline, in which each station first appears. */
export const STATION_SINCE: Record<SemgStation, number> = { band: 0, spectrum: 0, mixer: 1, pretrain: 2, backbone: 1, refine: 1, decode: 0 };
/** The spelling model and the spread of candidates join the decoder in the last version. */
export const SPELLING_SINCE = 3;

const AZIMUTH = 55;
const DEG = Math.PI / 180;
const PLATE: Plan = { x: -306, y: -100, w: 612, d: 200, r: 9 };
const TRACK: Plan = { x: -222, y: 18, w: 486, d: 16, r: 2 };
const TRACK_H = 2;
const TRACK_Y = TRACK.y + TRACK.d / 2;
const STOP_X: Record<SemgStation, number> = { band: -205, spectrum: -165, mixer: -85, pretrain: -10, backbone: 70, refine: 140, decode: 210 };
const MACHINE_Y = -24;

const ARM: Point2 = [-258, -6];
const ARM_R = 22;
const ARM_TOP = 96;
const BAND_R = 29;
const BAND_Z = 34;
const BAND_H = 14;
const POD_R = 4.6;
const CLASP_AT = 3.5;

const TABLE: Point2 = [STOP_X.mixer, MACHINE_Y];
const SEAT_R = 24;

const BLOCK = { size: 10.6, pitch: 12.6, height: 5.5, x: 132, y: 52, rowDepth: 14.6, rowIndent: 5.6, rise: 4 };
const LETTER_SIZE = 7.6;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [ARM[0], ARM[1], ARM_TOP + 6], [STOP_X.backbone, MACHINE_Y - 20, 70]],
  SEMG_FIGURE_SIZE.width,
  SEMG_FIGURE_SIZE.height,
  { pad: 26, azimuth: AZIMUTH },
);
const draw = createDraw(P);
const { at, L, D, slab, post, collar } = draw;
const [EX, EY] = [k.axisVector(P, [1, 0, 0]), k.axisVector(P, [0, 1, 0])];

const angleOf = (place: number): number => (place * 360 * DEG) / ELECTRODES;
const onRing = (centre: Point2, place: number, radius: number): Point2 => [centre[0] + radius * Math.cos(angleOf(place)), centre[1] + radius * Math.sin(angleOf(place))];
/** How squarely a place on a ring faces the viewer: 1 dead ahead, negative on the far side. */
const facing = (place: number): number => Math.cos(angleOf(place) - AZIMUTH * DEG);
const byDepth = (centre: Point2, radius: number) => (a: number, b: number): number =>
  k.depthOf([...onRing(centre, a, radius), 0], P) - k.depthOf([...onRing(centre, b, radius), 0], P);
const places = (): number[] => Array.from({ length: ELECTRODES }, (_, place) => place);

/** A letter printed flat on the top of a block, in the plane of the bench. */
function letterOnTop(letter: string, [x, y, z]: Point3, className = 'fig-letter'): string {
  const [sx, sy] = at([x, y, z]);
  const matrix = [EX[0], EX[1], EY[0], EY[1], sx, sy].map(fine).join(' ');
  return `<text class="${className}" transform="matrix(${matrix})" font-size="${LETTER_SIZE}">${letter}</text>`;
}

/** 1. The wrist: a forearm on a stand, wearing the band of sixteen electrodes. */
function band(): string {
  const order = places().sort(byDepth(ARM, BAND_R));
  const pod = (place: number): string => {
    const [x, y] = onRing(ARM, place, BAND_R);
    const hot = place === MUSCLE_AT;
    return `<g class="fig-pod${hot ? ' fig-hot' : ''}" data-place="${place}">${post(x, y, POD_R, BAND_Z + 1, BAND_H - 2, { tone: 'hi', lit: hot })}</g>`;
  };
  const clasp = (turn: number): string => {
    const [x, y] = onRing(ARM, CLASP_AT + turn, BAND_R + 1.2);
    const body = slab({ x: x - 4.5, y: y - 4.5, w: 9, d: 9, r: 2 }, BAND_Z - 2, BAND_H + 4, { tone: 'hi' }) + D([[x, y, BAND_Z + BAND_H + 2]], 0.6, 'hi');
    return `<g class="fig-clasp" data-clasp="${turn}"${turn === 0 ? '' : ' hidden'}>${body}</g>`;
  };
  const turns = Array.from({ length: MAX_TURN * 2 + 1 }, (_, i) => i - MAX_TURN);
  const [mx, my] = onRing(ARM, MUSCLE_AT, ARM_R - 1);
  const lead = k.lineOnTop([ARM[0] + 38, ARM[1] + 18], [TRACK.x, TRACK_Y], 0, P);

  return [
    post(ARM[0], ARM[1], 42, 0, 4, { tone: 'mid' }),
    L(k.ring(ARM[0], ARM[1], 37, 4, P, 48)),
    L(lead, 'mid'),
    post(ARM[0], ARM[1], ARM_R, 4, BAND_Z - 4, { tone: 'hi', crease: 'none' }),
    order.filter((place) => facing(place) <= 0).map(pod).join(''),
    post(ARM[0], ARM[1], ARM_R + 3, BAND_Z, BAND_H, { tone: 'mid' }),
    order.filter((place) => facing(place) > 0).map(pod).join(''),
    turns.map(clasp).join(''),
    post(ARM[0], ARM[1], ARM_R, BAND_Z + BAND_H, ARM_TOP - BAND_Z - BAND_H, { tone: 'hi', crease: 'none' }),
    L([62, 74, 86].map((z) => k.sideArc(ARM[0], ARM[1], ARM_R, z, P, 24)).join(''), 'faint'),
    `<g class="fig-muscle">${k.dotsSvg([at([mx, my, BAND_Z + BAND_H + 7])], { size: 2.8, tone: 'hi' })}</g>`,
  ].join('');
}

/** 2. The spectrum: a board that shows which pitches are loud in each slice of time. */
function spectrumBoard(x: number): string {
  const board: Plan = { x: x - 27, y: -47, w: 54, d: 2.6, r: 0.6 };
  const face = board.y + board.d;
  const quiet: string[] = [];
  const loud: string[] = [];
  for (let column = 0; column < 10; column += 1) {
    for (let row = 0; row < 6; row += 1) {
      const strength = (column * 7 + row * 5 + column * row) % 5;
      if (strength < 2) continue;
      const [cx, z] = [board.x + 5 + column * 4.9, 13 + row * 6.2];
      (strength === 4 ? loud : quiet).push(k.segment([cx - 1.6, face, z], [cx + 1.6, face, z], P));
    }
  }
  const legs = [board.x + 7, board.x + board.w - 7].map((lx) => post(lx, board.y + 1.3, 1.5, 0, 6, { tone: 'mid', crease: 'none' })).join('');
  return (
    legs +
    slab(board, 6, 46, { tone: 'hi' }, 0.3) +
    k.lineSvg(quiet.join(''), { tone: 'mid', className: 'fig-heat' }) +
    k.lineSvg(loud.join(''), { tone: 'hi', className: 'fig-heat fig-heat--loud' }) +
    L(k.lineOnTop([x, face], [x, TRACK.y], 0, P), 'faint')
  );
}

/** …and the row of blades standing over the track that cuts the signal into those slices. */
function spectrumComb(x: number): string {
  const rail: Plan = { x: x - 17, y: TRACK.y - 6, w: 34, d: 4, r: 1 };
  const blades = [-13, -8, -3, 2, 7, 12].map((dx) => slab({ x: x + dx, y: TRACK.y - 3, w: 1.3, d: TRACK.d + 6, r: 0.2 }, TRACK_H + 2.5, 17, { tone: 'hi', lit: true }, 0)).join('');
  return slab(rail, 0, 22, { tone: 'mid' }) + blades;
}

/** 3. The round table: sixteen seats in the order the electrodes sit on the wrist, and a hub that sums them up. */
function mixer(): string {
  const [x, y] = TABLE;
  const seat = (place: number): string => {
    const [sx, sy] = onRing(TABLE, place, SEAT_R);
    const spoke = k.lineOnTop([sx, sy], onRing(TABLE, place, 8), 6, P);
    return `<g class="fig-seat" data-seat="${place}">${k.lineSvg(spoke, { tone: 'faint', className: 'fig-spoke' })}${post(sx, sy, 2.7, 6, 4.5, { tone: 'hi' })}</g>`;
  };
  const order = places().sort(byDepth(TABLE, SEAT_R));
  return [
    post(x, y, 32, 0, 6, { tone: 'mid' }),
    L(k.knurl(x, y, 32, 0, 6, 56, P)),
    L(k.ring(x, y, SEAT_R, 6, P, 48), 'mid'),
    order.filter((place) => facing(place) <= 0).map(seat).join(''),
    post(x, y, 6.5, 6, 9, { tone: 'hi', lit: true }),
    order.filter((place) => facing(place) > 0).map(seat).join(''),
    L(k.lineOnTop([x, y + 32], [x, TRACK.y], 0, P), 'faint'),
  ].join('');
}

/** 4. Teaching itself first: a cabinet of pigeonholes, one per kind of slice… */
function pretrainCabinet(x: number): string {
  const body: Plan = { x: x - 30, y: -76, w: 60, d: 26, r: 2 };
  const face = body.y + body.d;
  const lines: string[] = [];
  for (let column = 1; column < 10; column += 1) lines.push(k.segment([body.x + column * 6, face, 3], [body.x + column * 6, face, 45], P));
  for (let row = 1; row < 6; row += 1) lines.push(k.segment([body.x + 2, face, 3 + row * 7], [body.x + body.w - 2, face, 3 + row * 7], P));
  const FILED: ReadonlyArray<readonly [column: number, row: number]> = [[2, 1], [5, 3], [7, 0], [1, 4], [8, 5], [4, 2]];
  const filed = FILED.map(([column, row]): Point3 => [body.x + column * 6 + 3, face, 6.5 + row * 7]);
  return (
    slab(body, 0, 48, { tone: 'hi' }) +
    L(lines.join(''), 'faint') +
    D(filed, 0.7, 'hi') +
    slab({ x: body.x + 6, y: body.y + 5, w: 18, d: 14, r: 1 }, 48, 1.2, { tone: 'hi', crease: 'none', lit: true }, 0) +
    L(k.lineOnTop([x, face], [x, TRACK.y - 6], 0, P), 'faint')
  );
}

/** …and a stencil over the track that hides three slices in ten, for the model to guess. */
function pretrainStencil(x: number): string {
  const plate: Plan = { x: x - 22, y: TRACK.y - 4, w: 44, d: TRACK.d + 8, r: 1 };
  const leg = (dx: number, y: number): string => post(x + dx, y, 1.5, 0, 10, { tone: 'mid', crease: 'none' });
  const slots = Array.from({ length: 9 }, (_, i) => k.lineOnTop([plate.x + 4.4 * (i + 1), plate.y + 3], [plate.x + 4.4 * (i + 1), plate.y + plate.d - 3], 11.6, P)).join('');
  const covers = [1, 4, 8].map((i) => slab({ x: plate.x + 0.6 + i * 4.4, y: plate.y + 3, w: 3.2, d: plate.d - 6, r: 0.4 }, 11.6, 1.6, { tone: 'hi', crease: 'none', lit: true }, 0)).join('');
  return leg(-19, plate.y + 2) + leg(19, plate.y + 2) + slab(plate, 10, 1.6, { tone: 'hi', crease: 'none' }, 0) + L(slots, 'faint') + covers + leg(-19, plate.y + plate.d - 2) + leg(19, plate.y + plate.d - 2);
}

/**
 * 5 and 6. A stack of identical storeys. On the face of each, every slice above is tied by
 * threads to the slices below: attention. The pipe up the side is the way round each storey.
 */
function tower(x: number, storeys: number, size: { w: number; d: number; h: number }): string {
  const plan: Plan = { x: x - size.w / 2, y: MACHINE_Y - size.d / 2, w: size.w, d: size.d, r: 2 };
  const face = plan.y + plan.d;
  const pitch = size.h + 4;
  const nodes = 5;
  const nodeX = (i: number): number => plan.x + 5 + (i * (size.w - 10)) / (nodes - 1);
  const out = [slab(k.insetPlan(plan, -3), 0, 3, { tone: 'mid' })];

  for (let storey = 0; storey < storeys; storey += 1) {
    const z = 5 + storey * pitch;
    const [low, high] = [z + 2.6, z + size.h - 2.6];
    const threads: string[] = [];
    const fan: string[] = [];
    for (let top = 0; top < nodes; top += 1) {
      for (let bottom = 0; bottom < nodes; bottom += 1) {
        const line = k.segment([nodeX(top), face, high], [nodeX(bottom), face, low], P);
        if (top === (storey + 1) % nodes) fan.push(line);
        else if (Math.abs(top - bottom) <= 1) threads.push(line);
      }
    }
    const ends: Point3[] = Array.from({ length: nodes }, (_, i) => [[nodeX(i), face, low], [nodeX(i), face, high]] as Point3[]).flat();
    if (storey > 0) out.push(slab(k.insetPlan(plan, 5), z - 4, 4, { tone: 'mid', crease: 'none' }, 0));
    out.push(slab(plan, z, size.h, { tone: 'hi' }), L(threads.join(''), 'lo'), k.lineSvg(fan.join(''), { tone: 'mid', className: 'fig-thread' }), D(ends, 0.55, 'hi'));
  }

  const top = 5 + storeys * pitch - 4;
  const pipe: Point2 = [plan.x + plan.w + 4, face - 6];
  const taps = Array.from({ length: storeys }, (_, storey) => slab({ x: plan.x + plan.w, y: pipe[1] - 1, w: 4, d: 2, r: 0.3 }, 5 + storey * pitch + size.h / 2, 1.6, { tone: 'mid', crease: 'none' }, 0)).join('');
  out.push(
    slab({ x: x - 7, y: MACHINE_Y - 7, w: 14, d: 14, r: 2 }, top, 2.6, { tone: 'hi', lit: true }),
    taps,
    post(pipe[0], pipe[1], 1.5, 0, top - 2, { tone: 'mid', crease: 'none' }),
    L(k.lineOnTop([x, face + 3], [x, TRACK.y], 0, P), 'faint'),
  );
  return out.join('');
}

/** 7. The decoder: one guess per slice goes in along the back, a shorter row of letters comes out. */
function decoder(x: number): string {
  const body: Plan = { x: x - 22, y: MACHINE_Y - 16, w: 44, d: 32, r: 3 };
  const guesses: Point3[] = Array.from({ length: 9 }, (_, i) => [body.x + 6 + i * 4, body.y + 8, 14]);
  const letters: Point3[] = Array.from({ length: 5 }, (_, i) => [body.x + 10 + i * 6, body.y + 19, 14]);
  const merge = guesses.map((guess, i) => k.lineOnTop([guess[0], guess[1]], [letters[Math.floor((i * 5) / 9)][0], letters[0][1]], 14, P)).join('');
  return (
    slab(body, 0, 14, { tone: 'hi' }) +
    L(merge, 'faint') +
    D(guesses, 0.6, 'mid') +
    D(letters, 0.85, 'hi') +
    slab({ x: x - 14, y: body.y + body.d - 7, w: 28, d: 4, r: 1 }, 14, 1.6, { tone: 'hi', crease: 'none', lit: true }, 0) +
    L(k.lineOnTop([x, body.y + body.d], [x, TRACK.y], 0, P), 'faint')
  );
}

/** The model that knows how English is spelt: a thick book on a stand behind the decoder. */
function spellingBook(x: number): string {
  const book: Plan = { x: x - 13, y: -84, w: 28, d: 20, r: 1 };
  const lines = [5, 9, 13, 19, 23].map((dx) => k.lineOnTop([book.x + dx, book.y + 3], [book.x + dx, book.y + book.d - 3], 21, P)).join('');
  return (
    collar(x, -74, 3) +
    post(x, -74, 3, 2.4, 12.6, { tone: 'mid', crease: 'none' }) +
    slab(book, 15, 6, { tone: 'hi' }, 0.4) +
    L(lines, 'faint') +
    L(k.lineOnTop([book.x + 15.5, book.y + 1], [book.x + 15.5, book.y + book.d - 1], 21, P), 'mid') +
    slab({ x: book.x + 20, y: book.y + book.d - 3, w: 3, d: 5, r: 0.3 }, 21, 0.8, { tone: 'hi', crease: 'none', lit: true }, 0)
  );
}

/** Several candidate spellings kept side by side until the book picks one. */
function candidates(): string {
  return [0, 1, 2, 3]
    .map((i) => {
      const plan: Plan = { x: 270 + i * 7, y: TRACK.y + TRACK.d + 4, w: 4.4, d: 46, r: 0.5 };
      const print: Point3[] = [4, 9, 14, 19, 24, 29, 34, 39].slice(0, 8 - i).map((dy) => [plan.x + 2.2, plan.y + dy, 0.7]);
      return slab(plan, 0, 0.7, { tone: 'hi', crease: 'none', lit: i === 1 }, 0) + D(print, 0.4, 'hi');
    })
    .join('');
}

interface KeyBlock {
  index: number;
  letter: string;
  plan: Plan;
  z: number;
}

function keyBlocks(): KeyBlock[] {
  const blocks: KeyBlock[] = [];
  KEY_ROWS.forEach((row, rowIndex) => {
    [...row].forEach((letter, column) => {
      const plan: Plan = { x: BLOCK.x + rowIndex * BLOCK.rowIndent + column * BLOCK.pitch, y: BLOCK.y + rowIndex * BLOCK.rowDepth, w: BLOCK.size, d: BLOCK.size, r: 1.4 };
      blocks.push({ index: blocks.length, letter, plan, z: (KEY_ROWS.length - 1 - rowIndex) * BLOCK.rise });
    });
  });
  return blocks;
}

/** What the line makes: lettered blocks, set out in tiers like the keyboard nobody touched. */
function keyboard(): string {
  const width = KEY_ROWS[0].length * BLOCK.pitch + 6;
  const risers = [0, 1]
    .map((row) => slab({ x: BLOCK.x - 4, y: BLOCK.y + row * BLOCK.rowDepth - 1.8, w: width, d: BLOCK.rowDepth, r: 1 }, 0, (KEY_ROWS.length - 1 - row) * BLOCK.rise, { tone: 'mid', crease: 'none' }, 0))
    .join('');
  const blocks = keyBlocks()
    .sort((a, b) => k.depthOf([a.plan.x, a.plan.y, 0], P) - k.depthOf([b.plan.x, b.plan.y, 0], P))
    .map(({ index, letter, plan, z }) => {
      const body = slab(plan, z, BLOCK.height, { tone: 'hi', lit: true }, 0.5);
      return `<g class="fig-block" data-block="${index}">${body}${letterOnTop(letter, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + BLOCK.height])}</g>`;
    })
    .join('');
  return risers + blocks;
}

/** The thing being followed down the line: a strip of signal, then a slice of spectrum, then a letter. */
function parcel(): string {
  const x = STOP_X.band;
  const top = TRACK_H;
  const wave: Plan = { x: x - 10, y: TRACK.y + 2, w: 20, d: 12, r: 1 };
  const zigzag = Array.from({ length: 8 }, (_, i) => k.lineOnTop([wave.x + 2 + i * 2, TRACK_Y + (i % 2 ? 3 : -3)], [wave.x + 4 + i * 2, TRACK_Y + (i % 2 ? -3 : 3)], top + 1, P)).join('');
  const tile: Plan = { x: x - 7, y: TRACK.y + 2, w: 14, d: 12, r: 1 };
  const grid = [3.5, 7, 10.5].map((dx) => k.lineOnTop([tile.x + dx, tile.y + 1], [tile.x + dx, tile.y + tile.d - 1], top + 1.4, P)).join('') + [4, 8].map((dy) => k.lineOnTop([tile.x + 1, tile.y + dy], [tile.x + tile.w - 1, tile.y + dy], top + 1.4, P)).join('');
  const block: Plan = { x: x - BLOCK.size / 2, y: TRACK_Y - BLOCK.size / 2, w: BLOCK.size, d: BLOCK.size, r: 1.4 };
  return [
    `<g data-form="wave">${slab(wave, top, 1, { tone: 'hi', crease: 'none', lit: true }, 0)}${L(zigzag, 'hi')}</g>`,
    `<g data-form="tile">${slab(tile, top, 1.4, { tone: 'hi', crease: 'none', lit: true }, 0)}${L(grid, 'hi')}</g>`,
    `<g data-form="block">${slab(block, top, BLOCK.height, { tone: 'hi', lit: true }, 0.5)}${letterOnTop('Q', [x, TRACK_Y, top + BLOCK.height])}</g>`,
  ].join('');
}

function track(): string {
  const sleepers: string[] = [];
  for (let x = TRACK.x + 9; x < TRACK.x + TRACK.w; x += 9) sleepers.push(k.lineOnTop([x, TRACK.y + 1.5], [x, TRACK.y + TRACK.d - 1.5], TRACK_H, P));
  return slab(TRACK, 0, TRACK_H, { tone: 'lo', crease: 'none' }, 0) + L(sleepers.join(''), 'faint');
}

export interface SemgFigure {
  svg: string;
  /** How far, on screen, the parcel moves from the first station to the last. */
  travel: Point2;
  /** For each station, the share of that travel at which the parcel sits beside it. */
  stops: number[];
}

export function buildSemgFigure(): SemgFigure {
  const station = (id: SemgStation, body: string): string =>
    `<g class="fig-station" data-station="${SEMG_STATIONS.indexOf(id)}" data-since="${STATION_SINCE[id]}">${body}</g>`;
  const spelling = (body: string): string => `<g data-since="${SPELLING_SINCE}">${body}</g>`;
  const run = STOP_X.decode - STOP_X.band;
  const [dx, dy] = k.axisVector(P, [run, 0, 0]);
  const glows = SEMG_STATIONS.map((id, index) => `<path class="fig-glow" data-station="${index}" d="${k.ring(STOP_X[id], TRACK_Y, 22, TRACK_H + 0.4, P, 36)}"/>`).join('');

  const svg = [
    benchPlate(draw, PLATE),
    // Behind the track, left to right, which is also back to front.
    station('band', band()),
    station('spectrum', spectrumBoard(STOP_X.spectrum)),
    station('mixer', mixer()),
    station('pretrain', pretrainCabinet(STOP_X.pretrain)),
    station('backbone', tower(STOP_X.backbone, 3, { w: 46, d: 40, h: 15 })),
    station('refine', tower(STOP_X.refine, 2, { w: 34, d: 30, h: 12 })),
    station('decode', spelling(spellingBook(STOP_X.decode)) + decoder(STOP_X.decode)),
    track(),
    glows,
    `<g class="fig-parcel" data-parcel>${parcel()}</g>`,
    // Over the track.
    station('spectrum', spectrumComb(STOP_X.spectrum)),
    station('pretrain', pretrainStencil(STOP_X.pretrain)),
    // In front of it.
    station('decode', spelling(candidates())),
    `<g class="fig-keyboard">${keyboard()}</g>`,
  ].join('');

  return { svg, travel: [fine(dx), fine(dy)], stops: SEMG_STATIONS.map((id) => fine((STOP_X[id] - STOP_X.band) / run)) };
}

/** Which seat at the round table lights up when the band has been turned: the signal moves one seat per notch. */
export function hotSeat(turn: number): number {
  return (((MUSCLE_AT - turn) % ELECTRODES) + ELECTRODES) % ELECTRODES;
}
