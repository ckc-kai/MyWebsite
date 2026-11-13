/**
 * The report pipeline, drawn as a research desk's machine: brokers' reports ride a belt
 * past six stations, each built to look like the job it does, in front of a price chart.
 * A ticker prints the summaries, long and short; a balance weighs their figures against
 * the source. Geometry is worked out once, at build time.
 *
 * World units are roughly millimetres: x runs along the belt, y across it, z up.
 * The viewer stands at +x, +y, so smaller y is "behind the belt".
 */
import * as k from '../../vendor/anatomy/iso-kit.mjs';
import type { Plan, Point2, Point3 } from '../../vendor/anatomy/iso-kit.mjs';
import { FOOT_H, PLATE_H, benchPlate, createDraw, fine } from './draw';

export const FIGURE_SIZE = { width: 880, height: 500 };

const PLATE: Plan = { x: -268, y: -84, w: 536, d: 168, r: 9 };
const BELT: Plan = { x: -250, y: -24, w: 500, d: 48, r: 3 };
const BELT_H = 6;
const RAIL_H = 9;
const STATION_X = [-200, -120, -40, 40, 120, 200] as const;
const POST_Y = 36;
const SHEET: Plan = { x: -11, y: -15, w: 22, d: 30, r: 1 };
const SHEET_H = 1.2;
const SHEET_START_X = BELT.x + 16;
const SHEET_TRAVEL = BELT.w - 32;
const AMBIENT_SHEETS = 4;
const TALLEST = 70;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [STATION_X[1], -46, TALLEST], [STATION_X[5], POST_Y, 62]],
  FIGURE_SIZE.width,
  FIGURE_SIZE.height,
  { pad: 28, azimuth: 58 },
);

const draw = createDraw(P);
const { S, L, D, slab, post, collar } = draw;

function belt(): string {
  const out: string[] = [];
  for (const y of [BELT.y - 5, BELT.y + BELT.d]) {
    out.push(slab({ x: BELT.x - 6, y, w: BELT.w + 12, d: 5, r: 1 }, 0, RAIL_H, { tone: 'mid' }, 0.4));
  }
  out.push(slab(BELT, 0, BELT_H, { tone: 'lo', crease: 'none' }, 0));
  // Slats across the belt, every dozen units, end to end.
  const slats: string[] = [];
  for (let x = BELT.x + 12; x < BELT.x + BELT.w; x += 12) {
    slats.push(k.lineOnTop([x, BELT.y + 1], [x, BELT.y + BELT.d - 1], BELT_H, P));
  }
  out.push(L(slats.join(''), 'faint'));
  for (const x of [BELT.x - 10, BELT.x + BELT.w + 2]) {
    out.push(slab({ x, y: BELT.y - 7, w: 8, d: BELT.d + 14, r: 1.5 }, 0, RAIL_H + 2, { tone: 'mid' }));
  }
  return out.join('');
}

interface StationParts {
  /** Drawn before the belt's cargo: whatever stands behind the belt. */
  back: string;
  /** Drawn after it: whatever stands in front of the belt or reaches over it. */
  front: string;
  /** The point a station is "at", used to place its glow. */
  focus: Point3;
}

/** Two posts and a beam across the belt. Returns the back post, then the front post and beam. */
function gantry(x: number, height: number, beamDepth: number): { back: string; front: string } {
  const beam: Plan = { x: x - beamDepth / 2, y: -POST_Y - 4, w: beamDepth, d: POST_Y * 2 + 8, r: 2 };
  return {
    back: collar(x, -POST_Y, 3.2) + post(x, -POST_Y, 3.2, 2.4, height - 2.4, { tone: 'mid', crease: 'none' }),
    front:
      collar(x, POST_Y, 3.2) +
      post(x, POST_Y, 3.2, 2.4, height - 2.4, { tone: 'mid', crease: 'none' }) +
      slab(beam, height, 6, { tone: 'hi' }) +
      D([[x, -POST_Y, height + 6], [x, POST_Y, height + 6]], 0.5),
  };
}

/** A post behind the belt with an arm reaching out over it. */
function crane(x: number, height: number, reach: number): { back: string; arm: string } {
  const arm: Plan = { x: x - 3.5, y: -46 - 3.5, w: 7, d: reach + 46 + 3.5, r: 2 };
  return {
    back: collar(x, -46, 3.6) + post(x, -46, 3.6, 2.4, height - 2.4, { tone: 'mid', crease: 'none' }),
    arm: slab(arm, height, 5, { tone: 'hi' }) + D([[x, -46, height + 5]], 0.5),
  };
}

/** 1. Intake: a tray of pages behind the belt, and a press that flattens each into one sheet. */
function intake(x: number): StationParts {
  const tray: Plan = { x: x - 20, y: -78, w: 40, d: 34, r: 2 };
  // Bound reports, each a little askew on the one below, spines to the front.
  const pages = Array.from({ length: 4 }, (_, i) => {
    const plan: Plan = { x: x - 14 + (i % 2) * 1.6, y: -74 + (i % 3) * 0.8, w: 27, d: 24, r: 0.8 };
    const spine = k.segment([plan.x + 1, plan.y + plan.d, 3 + i * 2.6 + 1.1], [plan.x + plan.w - 1, plan.y + plan.d, 3 + i * 2.6 + 1.1], P);
    return slab(plan, 3 + i * 2.6, 2.2, { tone: 'hi' }, 0.3) + L(spine, 'faint');
  });
  const frame = gantry(x, 34, 9);
  const platen = slab({ x: x - 13, y: -19, w: 26, d: 38, r: 2 }, 20, 6, { tone: 'hi', lit: true });
  const stem = post(x, 0, 2.2, 26, 8, { tone: 'mid', crease: 'none' });
  const knob = post(x, 0, 6, 40, 4, { tone: 'hi' }) + L(k.knurl(x, 0, 6, 40, 44, 30, P));
  return {
    back: slab(tray, 0, 3, { tone: 'mid' }) + pages.join('') + frame.back,
    front: platen + stem + frame.front + knob,
    focus: [x, 0, BELT_H],
  };
}

/** 2. Reading the contents page: a camera on an arm, with a smaller second lens beside it. */
function reader(x: number): StationParts {
  const stand = crane(x, 60, 4);
  const lens = post(x, 0, 6.5, 30, 6, { tone: 'hi', lit: true }) + L(k.ring(x, 0, 4, 30, P, 20), 'mid');
  const body = post(x, 0, 10, 36, 24, { tone: 'hi' }) + L(k.sideArc(x, 0, 10, 44, P, 24), 'faint');
  const spare = slab({ x, y: -3, w: 20, d: 5, r: 1.5 }, 52, 4, { tone: 'mid' });
  const spareLens = post(x + 19, 0, 5, 40, 12, { tone: 'hi' }) + post(x + 19, 0, 3.4, 36, 4, { tone: 'hi', lit: true });
  return { back: stand.back, front: lens + body + stand.arm + spare + spareLens, focus: [x, 0, BELT_H] };
}

/** 3. Cutting into sections and filing them: a blade over the belt, a card cabinet behind it. */
function cutter(x: number): StationParts {
  const frame = gantry(x, 44, 8);
  const cabinet: Plan = { x: x - 24, y: -80, w: 48, d: 30, r: 2 };
  const face = cabinet.y + cabinet.d;
  const drawers = [10, 20].map((z) => k.segment([cabinet.x + 2, face, z], [cabinet.x + cabinet.w - 2, face, z], P)).join('');
  const pulls: Point3[] = [5, 15, 25].map((z) => [x, face, z]);
  const blade = slab({ x: x - 1.3, y: -24, w: 2.6, d: 48, r: 0.4 }, 12, 26, { tone: 'hi', lit: true }, 0);
  const rods = [-18, 18].map((y) => post(x, y, 1.4, 38, 6, { tone: 'mid', crease: 'none' })).join('');
  return {
    back: slab(cabinet, 0, 30, { tone: 'hi' }) + L(drawers, 'mid') + D(pulls, 0.7, 'hi') + frame.back,
    front: blade + rods + frame.front,
    focus: [x, 0, BELT_H],
  };
}

/** 4. Finding passages: two probes on an arm, and a rack where what they find is ranked. */
function finder(x: number): StationParts {
  const stand = crane(x, 48, 8);
  const probes = [-7, 7]
    .map((dx) => post(x + dx, dx * 0.6, 2.2, 16, 32, { tone: 'hi', crease: 'none' }) + post(x + dx, dx * 0.6, 3.2, 12, 4, { tone: 'hi', lit: true }))
    .join('');
  const rack: Plan = { x: x - 18, y: 46, w: 36, d: 26, r: 2 };
  const cards = [22, 15, 9].map((height, i) => slab({ x: x - 13 + i * 10, y: 50, w: 6, d: 18, r: 0.6 }, 3, height, { tone: 'hi' }, 0)).join('');
  return { back: stand.back, front: probes + stand.arm + slab(rack, 0, 3, { tone: 'mid' }) + cards, focus: [x, 0, BELT_H] };
}

/** 5. Writing the summary: a nib over the belt, and a ticker that prints it twice, long and short. */
function writer(x: number): StationParts {
  const frame = gantry(x, 32, 7);
  const roll = collar(x, -62, 9) + post(x, -62, 10, 2.4, 20, { tone: 'hi' }) + L(k.ring(x, -62, 3, 22.4, P, 16), 'mid') + L(k.sideArc(x, -62, 10, 12, P, 24), 'faint');
  const nib = post(x, 4, 1.7, 12, 20, { tone: 'hi', crease: 'none', lit: true });
  const carriage = slab({ x: x - 9, y: -6, w: 18, d: 20, r: 2 }, 38, 9, { tone: 'hi' }) + D([[x - 5, 0, 47], [x + 5, 8, 47]], 0.45);

  // The ticker: a glass dome on a plinth, with two tapes run out along the bench.
  const [tx, ty] = [x - 16, 62];
  const plinth = slab({ x: tx - 11, y: ty - 11, w: 22, d: 22, r: 3 }, 0, 5, { tone: 'mid' });
  const dome = post(tx, ty, 9, 5, 15, { tone: 'hi' }) + L(k.sideArc(tx, ty, 9, 12, P, 24), 'faint') + L(k.ring(tx, ty, 5.5, 20, P, 24), 'mid') + D([[tx, ty, 20]], 0.7, 'hi');
  const tape = (y: number, length: number): string => {
    const plan: Plan = { x: tx + 11, y, w: length, d: 5, r: 0.6 };
    const print: Point3[] = [];
    for (let px = plan.x + 4; px < plan.x + length - 2; px += 3.4) print.push([px, y + 2.5, 0.7]);
    return slab(plan, 0, 0.7, { tone: 'hi', crease: 'none', lit: true }, 0) + D(print, 0.45, 'hi');
  };

  return {
    back: roll + frame.back,
    front: nib + frame.front + carriage + plinth + tape(ty - 6, 44) + tape(ty + 2, 20) + dome,
    focus: [x, 4, BELT_H],
  };
}

/** 6. Checking and filing: three lamps for the three checks, a balance for the figures, a shelf of ledgers. */
function checker(x: number): StationParts {
  const frame = gantry(x, 48, 10);
  const lamps = [-18, 0, 18].map((y) => post(x, y, 3.8, 54, 4, { tone: 'hi', lit: true })).join('');

  const shelf: Plan = { x: x + 22, y: -80, w: 42, d: 26, r: 2 };
  const ledgers = [0, 1, 2, 3, 4].map((i) => slab({ x: shelf.x + 4 + i * 7, y: shelf.y + 4, w: 5, d: 18, r: 0.5 }, 3, 22 - (i % 2) * 3, { tone: 'hi' }, 0.3)).join('');

  // The balance: the summary's figures on one pan, the source's on the other.
  const [bx, by] = [x - 14, 62];
  const pans = [-13, 13]
    .map((dx) => post(bx + dx, by, 0.6, 9.5, 14.5, { tone: 'mid', crease: 'none' }) + post(bx + dx, by, 7, 8, 1.5, { tone: 'hi', lit: true }))
    .join('');
  const balance =
    collar(bx, by, 2) +
    post(bx, by, 2, 2.4, 25, { tone: 'mid', crease: 'none' }) +
    pans +
    slab({ x: bx - 15, y: by - 1.4, w: 30, d: 2.8, r: 1 }, 24, 2.4, { tone: 'hi' }, 0.3) +
    D([[bx, by, 27.4]], 0.7, 'hi');

  return {
    back: slab(shelf, 0, 3, { tone: 'mid' }) + ledgers + frame.back,
    front: frame.front + lamps + balance,
    focus: [x, 0, BELT_H],
  };
}

/**
 * The backdrop every research desk has: a price chart on a board. The candles are a fixed,
 * made-up run, there to say "markets", not to show any real security.
 */
function chart(): string {
  const board: Plan = { x: -102, y: -84, w: 40, d: 2.6, r: 0.6 };
  const face = board.y + board.d;
  const CANDLES: ReadonlyArray<readonly [low: number, open: number, close: number, high: number]> = [
    [12, 16, 24, 27],
    [18, 24, 21, 28],
    [15, 21, 30, 33],
    [26, 30, 37, 40],
    [29, 37, 33, 41],
    [30, 33, 43, 47],
  ];
  const wicks: string[] = [];
  const up: string[] = [];
  const down: string[] = [];
  CANDLES.forEach(([low, open, close, high], i) => {
    const cx = board.x + 6 + i * 5.6;
    wicks.push(k.segment([cx, face, low], [cx, face, high], P));
    (close >= open ? up : down).push(k.segment([cx, face, Math.min(open, close)], [cx, face, Math.max(open, close)], P));
  });
  const legs = [board.x + 6, board.x + board.w - 6].map((lx) => post(lx, board.y + 1.3, 1.5, 0, 6, { tone: 'mid', crease: 'none' })).join('');
  return (
    legs +
    slab(board, 6, 48, { tone: 'hi' }, 0.3) +
    L(wicks.join(''), 'mid') +
    k.lineSvg(up.join(''), { tone: 'hi', className: 'fig-candle' }) +
    k.lineSvg(down.join(''), { tone: 'hi', className: 'fig-candle fig-candle--down' })
  );
}

/** The daily timer, in the front corner: a clock face and the lock that stops a second run. */
function timer(): string {
  const [x, y] = [BELT.x + 20, 58];
  const ticks = k.radialTicks(x, y, 13, 12, 3, 5, [1.6, 3.2], P);
  const hands = k.lineOnTop([x, y], [x + 7, y - 4], 5, P) + k.lineOnTop([x, y], [x - 2, y - 9], 5, P);
  const lock: Plan = { x: x + 22, y: y - 6, w: 14, d: 11, r: 2 };
  return (
    post(x, y, 15, 0, 5, { tone: 'hi' }) +
    L(k.ring(x, y, 13, 5, P, 40)) +
    L(ticks.minor) +
    L(ticks.major, 'mid') +
    L(hands, 'hi') +
    D([[x, y, 5]], 0.7, 'hi') +
    slab(lock, 0, 9, { tone: 'hi' }) +
    post(lock.x + 7, lock.y + 5.5, 4.2, 9, 5, { tone: 'mid' }) +
    D([[lock.x + 7, lock.y + lock.d, 4]], 0.7, 'hi')
  );
}

/** One report on the belt: a few lines of text and a small bar chart, so it reads as what it is. */
function sheet(lit: boolean): string {
  const plan: Plan = { ...SHEET, x: SHEET_START_X + SHEET.x };
  const top = BELT_H + SHEET_H;
  const text = [3, 6, 9].map((dx) => k.lineOnTop([plan.x + dx, plan.y + 3], [plan.x + dx, plan.y + plan.d - (dx === 9 ? 12 : 3)], top, P)).join('');
  const bars = [4, 8, 6].map((length, i) => k.lineOnTop([plan.x + 13, plan.y + 6 + i * 6], [plan.x + 13 + length, plan.y + 6 + i * 6], top, P)).join('');
  const inner = L(text, 'lo') + k.lineSvg(bars, { tone: 'hi', className: 'fig-bar' });
  return S(k.slabOf(plan, BELT_H, SHEET_H, P, 4, 0), { tone: 'hi', crease: 'none', lit, inner });
}

/**
 * The score from the last station, piped back over the gantries to the writer: the checks are
 * not only a gate, they are what the prompt is rewritten against.
 */
function scoreLoop(): string {
  const [from, to] = [STATION_X[5], STATION_X[4]];
  const y = -POST_Y;
  const riser = (x: number, z: number): string => post(x, y, 1.5, z, 62 - z, { tone: 'mid', crease: 'none' });
  const pipe = slab({ x: to - 1.5, y: y - 1.5, w: from - to + 3, d: 3, r: 1 }, 62, 2.4, { tone: 'hi' }, 0.4);
  const valve = post((from + to) / 2, y, 3.6, 60.4, 5.6, { tone: 'hi', lit: true });
  return `<g class="fig-loop">${riser(to, 38)}${riser(from, 54)}${pipe}${valve}</g>`;
}

/** The four rules a contents page must pass, as a card of four ticked lines in front of the reader. */
function ruleCard(x: number): string {
  const card: Plan = { x: x - 11, y: 44, w: 22, d: 26, r: 1 };
  const rows = [4, 9, 14, 19].map((dx) => k.lineOnTop([card.x + dx, card.y + 7], [card.x + dx, card.y + card.d - 3], 1.6, P)).join('');
  const ticks = [4, 9, 14, 19].map((dx): Point3 => [card.x + dx, card.y + 3.5, 1.6]);
  return slab(card, 0, 1.6, { tone: 'hi', crease: 'none', lit: true }, 0) + L(rows, 'lo') + D(ticks, 0.8, 'hi');
}

/** The flag an upstream job raises when it has finished, which the next job waits to see. */
function doneFlag(): string {
  const [x, y] = [BELT.x + 62, 64];
  return collar(x, y, 1.4) + post(x, y, 1.1, 2.4, 20, { tone: 'mid', crease: 'none' }) + slab({ x, y: y - 0.6, w: 11, d: 1.2, r: 0.2 }, 15.4, 7, { tone: 'hi', crease: 'none', lit: true }, 0);
}

export interface PipelineFigure {
  /** Everything behind the belt's cargo, then the cargo, then everything in front. */
  svg: string;
  /** How far, on screen, a sheet moves from one end of the belt to the other. */
  travel: Point2;
  /** For each station, the share of that travel at which a sheet sits under it. */
  stops: number[];
}

export function buildPipelineFigure(): PipelineFigure {
  const extras: Record<number, string> = { 1: ruleCard(STATION_X[1]), 4: scoreLoop() };
  const stations = [intake, reader, cutter, finder, writer, checker].map((build, index) => {
    const station = build(STATION_X[index]);
    return { ...station, front: station.front + (extras[index] ?? '') };
  });
  const wrap = (index: number, body: string): string => `<g class="fig-station" data-station="${index}">${body}</g>`;
  const glows = stations
    .map((station, index) => `<path class="fig-glow" data-station="${index}" d="${k.ring(station.focus[0], station.focus[1], 30, BELT_H + 0.4, P, 40)}"/>`)
    .join('');
  const [dx, dy] = k.axisVector(P, [SHEET_TRAVEL, 0, 0]);
  const ambient = Array.from({ length: AMBIENT_SHEETS }, (_, i) => `<g class="fig-sheet" style="--lap:${i / AMBIENT_SHEETS}">${sheet(false)}</g>`).join('');

  const svg = [
    benchPlate(draw, PLATE, { from: BELT.x, length: BELT.w }),
    chart(),
    belt(),
    stations.map((station, index) => wrap(index, station.back)).join(''),
    glows,
    `<g class="fig-cargo">${ambient}</g>`,
    `<g class="fig-courier" data-courier>${sheet(true)}</g>`,
    stations.map((station, index) => wrap(index, station.front)).join(''),
    timer(),
    doneFlag(),
  ].join('');

  return {
    svg,
    travel: [fine(dx), fine(dy)],
    stops: STATION_X.map((x) => fine((x - SHEET_START_X) / SHEET_TRAVEL)),
  };
}
