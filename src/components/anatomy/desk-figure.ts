/**
 * The SDG&E question-answering system, drawn as a desk with two lines on it.
 *
 * Along the back, the line that runs when nobody is asking: PDFs pass three readers, spreadsheets
 * are cut from wide to long and get an index card each, and everything is filed in one cabinet.
 * Along the front, the line a question takes: in at the hopper, rewritten at the planner's desk
 * with the notebook beside it, matched against the cards, then either back to the shelf of
 * documents or on through a form, three gates and an adding machine, to the check and the tray.
 *
 * World units are roughly millimetres. The viewer stands at +x, +y.
 */
import * as k from '../../vendor/anatomy/iso-kit.mjs';
import type { Plan, Point2, Point3 } from '../../vendor/anatomy/iso-kit.mjs';
import type { DeskNode, Worker } from './desk-paths';
import { DESK_NODES } from './desk-paths';
import { FOOT_H, PLATE_H, benchPlate, createDraw, fine } from './draw';

export const DESK_FIGURE_SIZE = { width: 1100, height: 480 };

/** Who does the work at each station: the model, plain code, or a person. */
export const DESK_WORKERS: Record<DeskNode, readonly Worker[]> = {
  pdf: ['code'],
  sheet: ['code'],
  cards: ['model', 'code', 'human'],
  store: ['code'],
  ask: ['human'],
  plan: ['model'],
  find: ['code'],
  docs: ['code'],
  form: ['model'],
  gates: ['code'],
  compute: ['code'],
  verify: ['code', 'model'],
  answer: ['model'],
  eval: ['code', 'model'],
};

const PLATE: Plan = { x: -352, y: -108, w: 704, d: 216, r: 9 };
const LANE_Y = 58;
const PDF_Y = -80;
const SHEET_Y = -30;
const STORE: Plan = { x: -135, y: -98, w: 56, d: 76, r: 2 };
const STORE_H = 46;
const GATE_X = [102, 124, 146] as const;

const AT: Record<DeskNode, Point2> = {
  pdf: [-250, PDF_Y],
  sheet: [-268, SHEET_Y],
  cards: [-185, SHEET_Y],
  store: [STORE.x + STORE.w / 2, STORE.y + STORE.d / 2],
  ask: [-305, LANE_Y],
  plan: [-232, LANE_Y],
  find: [-44, 34],
  docs: [70, -56],
  form: [58, LANE_Y],
  gates: [GATE_X[1], LANE_Y],
  compute: [194, LANE_Y],
  verify: [252, 2],
  answer: [312, 2],
  eval: [312, 78],
};
const DIAL: Point2 = [16, LANE_Y];

/** Where the question's token rests at each stop of the front line. */
const REST: Partial<Record<DeskNode, Point3>> = {
  ask: [AT.ask[0], AT.ask[1], 30],
  plan: [AT.plan[0] + 28, AT.plan[1] + 16, 0],
  find: [AT.find[0], LANE_Y + 6, 0],
  docs: [AT.docs[0] + 36, AT.docs[1] + 18, 0],
  form: [AT.form[0], AT.form[1] + 24, 0],
  gates: [GATE_X[2] + 12, LANE_Y, 0],
  compute: [AT.compute[0] + 32, AT.compute[1] + 6, 0],
  verify: [AT.verify[0], AT.verify[1], 0],
  answer: [AT.answer[0] - 4, AT.answer[1] + 2, 5],
};

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [STORE.x, STORE.y, STORE_H + 6], [252, -24, 58]],
  DESK_FIGURE_SIZE.width,
  DESK_FIGURE_SIZE.height,
  { pad: 26, azimuth: 55 },
);
const draw = createDraw(P);
const { at, L, D, slab, post, collar } = draw;
const way = (...points: Point2[]): string => points.slice(1).map((point, i) => k.lineOnTop(points[i], point, 0, P)).join('');

function ways(): string {
  const back = way([-302, PDF_Y], [STORE.x, PDF_Y]) + way([-302, SHEET_Y], [STORE.x, SHEET_Y]);
  const front =
    way(AT.ask, DIAL, AT.compute, [AT.verify[0], LANE_Y], [AT.verify[0], 30]) +
    way(DIAL, [DIAL[0], AT.docs[1]], [AT.verify[0], AT.docs[1]], [AT.verify[0], -26]) +
    way(AT.verify, [AT.answer[0] - 24, AT.answer[1]]) +
    way([STORE.x + STORE.w, AT.find[1] - 20], [AT.find[0], AT.find[1] - 20], [AT.find[0], LANE_Y]);
  // A long question is split into smaller ones and brought back together.
  const fork = [-8, 8].map((dy) => way([-206, LANE_Y], [-196, LANE_Y + dy], [-166, LANE_Y + dy], [-156, LANE_Y])).join('');
  // The way back, for an answer that fails its check: from the gate round to the dial.
  const again = way([AT.verify[0] - 6, 14], [DIAL[0], 14]);
  const measured = way([AT.answer[0], AT.answer[1] + 20], [AT.eval[0], AT.eval[1] - 11]);
  return L(back, 'mid') + L(front + fork, 'mid') + k.lineSvg(again, { tone: 'mid', dashed: true }) + k.lineSvg(measured, { tone: 'lo', dotted: true });
}

/** Bound reports in a tray, each a little askew on the one below. */
function reports([x, y]: Point2): string {
  const tray: Plan = { x: x - 18, y: y - 16, w: 36, d: 32, r: 2 };
  const pages = Array.from({ length: 4 }, (_, i) => slab({ x: x - 13 + (i % 2) * 1.6, y: y - 12 + (i % 3) * 0.8, w: 25, d: 23, r: 0.8 }, 3 + i * 2.6, 2.2, { tone: 'hi' }, 0.3)).join('');
  return slab(tray, 0, 3, { tone: 'mid' }) + pages;
}

/** PDFs: three reading heads on one rail, from a quick scan bar to a big lens for the hard pages. */
function pdf(): string {
  const y = PDF_Y;
  const rail: Plan = { x: -292, y: y - 11, w: 92, d: 22, r: 2 };
  const quick = slab({ x: -281, y: y - 9, w: 6, d: 18, r: 1 }, 3, 9, { tone: 'hi', lit: true });
  const layout = post(-250, y, 6.5, 3, 15, { tone: 'hi' }) + post(-250, y, 3.4, 18, 2.6, { tone: 'hi', lit: true });
  const vision = post(-220, y, 9.5, 3, 24, { tone: 'hi' }) + L(k.sideArc(-220, y, 9.5, 14, P, 24), 'faint') + post(-220, y, 5.6, 27, 3, { tone: 'hi', lit: true }) + L(k.ring(-220, y, 3, 30, P, 20), 'mid');
  return reports([-324, y]) + slab(rail, 0, 3, { tone: 'mid' }) + quick + layout + vision;
}

/** Spreadsheets: a wide sheet goes under the blade and comes out as a pile of narrow rows. */
function sheet(): string {
  const y = SHEET_Y;
  const [sx, cx, rx] = [-324, AT.sheet[0], -228];
  const wide: Plan = { x: sx - 17, y: y - 13, w: 34, d: 26, r: 0.8 };
  const top = 3 + 3 * 1.4;
  const grid =
    [8.5, 17, 25.5].map((dx) => k.lineOnTop([wide.x + dx, wide.y + 1], [wide.x + dx, wide.y + wide.d - 1], top, P)).join('') +
    [6.5, 13, 19.5].map((dy) => k.lineOnTop([wide.x + 1, wide.y + dy], [wide.x + wide.w - 1, wide.y + dy], top, P)).join('');
  const stack = slab({ x: sx - 20, y: y - 16, w: 40, d: 32, r: 2 }, 0, 3, { tone: 'mid' }) + [0, 1, 2].map((i) => slab({ ...wide, x: wide.x + (i % 2) }, 3 + i * 1.4, 1.2, { tone: 'hi', crease: 'none' }, 0)).join('') + L(grid, 'lo');

  const leg = (ly: number): string => collar(cx, ly, 2.6) + post(cx, ly, 2.6, 2.4, 23.6, { tone: 'mid', crease: 'none' });
  const blade = slab({ x: cx - 1, y: y - 15, w: 2, d: 30, r: 0.3 }, 6, 17, { tone: 'hi', lit: true }, 0);
  const beam = slab({ x: cx - 3.5, y: y - 22, w: 7, d: 44, r: 2 }, 26, 5, { tone: 'hi' });

  const rows = Array.from({ length: 6 }, (_, i) => {
    const plan: Plan = { x: rx - 14, y: y - 12 + i * 4.1, w: 28, d: 3, r: 0.3 };
    return slab(plan, 0, 1, { tone: 'hi', crease: 'none' }, 0) + D([[plan.x + 3, plan.y + 1.5, 1], [plan.x + 11, plan.y + 1.5, 1], [plan.x + 19, plan.y + 1.5, 1]], 0.4, 'hi');
  }).join('');
  return stack + leg(y - 18) + blade + leg(y + 18) + beam + rows;
}

/** A box of index cards, one pulled up: what each table is about. */
function cardBox([x, y]: Point2, raised = 2): string {
  const box: Plan = { x: x - 16, y: y - 10, w: 32, d: 20, r: 1.5 };
  const cards = [0, 1, 2, 3, 4, 5].map((i) => slab({ x: box.x + 4 + i * 4.4, y: box.y + 3, w: 1.2, d: 14, r: 0.2 }, 2, i === raised ? 15 : 9 + (i % 2), { tone: 'hi', lit: i === raised }, 0)).join('');
  return slab(box, 0, 5, { tone: 'mid' }) + cards;
}

/** One cabinet for everything: passages, figures and cards, on three shelves. */
function store(): string {
  const [face, side] = [STORE.y + STORE.d, STORE.x + STORE.w];
  const third = STORE.w / 3;
  const drawers =
    [1, 2].map((i) => k.segment([STORE.x + i * third, face, 2], [STORE.x + i * third, face, STORE_H - 2], P)).join('') +
    [1, 2, 3].map((i) => k.segment([STORE.x + 2, face, i * 11.5], [side - 2, face, i * 11.5], P)).join('');
  const shelves = [1, 2].map((i) => k.segment([side, STORE.y + 3, (i * STORE_H) / 3], [side, face - 3, (i * STORE_H) / 3], P)).join('');
  const pulls: Point3[] = [];
  for (let column = 0; column < 3; column += 1) for (let row = 0; row < 4; row += 1) pulls.push([STORE.x + (column + 0.5) * third, face, 5.8 + row * 11.5]);
  return (
    slab(STORE, 0, STORE_H, { tone: 'hi' }) +
    L(drawers + shelves, 'mid') +
    D(pulls, 0.65, 'hi') +
    slab({ x: STORE.x + 7, y: STORE.y + 8, w: 20, d: 14, r: 1 }, STORE_H, 1.2, { tone: 'hi', crease: 'none', lit: true }, 0)
  );
}

/** The hopper a question is dropped into. */
function ask([x, y]: Point2): string {
  return collar(x, y, 12) + post(x, y, 12, 2.4, 10, { tone: 'mid' }) + post(x, y, 18, 12.4, 14, { tone: 'hi', lit: true }) + L(k.ring(x, y, 13, 26.4, P, 32), 'mid');
}

/** The planner's desk: the question, rewritten, stands in the roller; the notebook lies open beside it. */
function plan([x, y]: Point2): string {
  const desk: Plan = { x: x - 18, y: y - 13, w: 36, d: 26, r: 3 };
  const keys: Point3[] = [];
  for (let column = 0; column < 6; column += 1) for (let row = 0; row < 2; row += 1) keys.push([desk.x + 6 + column * 4.8, desk.y + 16 + row * 4.4, 10]);
  const [nx, ny] = [x - 30, y + 32];
  const pages = [-11, 1].map((dx) => slab({ x: nx + dx, y: ny - 9, w: 10, d: 18, r: 0.5 }, 0, 1.6, { tone: 'hi', crease: 'none' }, 0)).join('');
  const notes = [-8, -5, 4, 7].map((dx) => k.lineOnTop([nx + dx, ny - 6], [nx + dx, ny + (dx === 7 ? 0 : 6)], 1.6, P)).join('');
  return (
    slab(desk, 0, 10, { tone: 'hi' }) +
    slab({ x: x - 10, y: desk.y + 4, w: 20, d: 1.6, r: 0.3 }, 10, 15, { tone: 'hi', lit: true }, 0) +
    D(keys, 0.6, 'hi') +
    pages +
    L(notes, 'lo') +
    slab({ x: nx - 0.6, y: ny + 4, w: 1.2, d: 9, r: 0.2 }, 0, 2.2, { tone: 'hi', crease: 'none', lit: true }, 0)
  );
}

/** Finding the right place: three probes over a box of cards, a rack where the finds are ranked, and the dial that then points the way. */
function find([x, y]: Point2): string {
  const mast = collar(x - 26, y, 3.2) + post(x - 26, y, 3.2, 2.4, 29.6, { tone: 'mid', crease: 'none' });
  const probes = [-11, 0, 11].map((dx) => post(x + dx, y, 1.9, 20, 12, { tone: 'hi', crease: 'none' }) + post(x + dx, y, 3, 16, 4, { tone: 'hi', lit: true })).join('');
  const arm = slab({ x: x - 29.5, y: y - 3.5, w: 48, d: 7, r: 2 }, 32, 5, { tone: 'hi' }) + D([[x - 26, y, 37]], 0.5);
  const rack: Plan = { x: x + 22, y: y - 12, w: 30, d: 24, r: 2 };
  const ranked = [20, 14, 9].map((height, i) => slab({ x: rack.x + 4 + i * 8.4, y: rack.y + 4, w: 5.4, d: 16, r: 0.5 }, 3, height, { tone: 'hi' }, 0)).join('');
  const [dx, dy] = DIAL;
  const dial =
    post(dx, dy, 15, 0, 5, { tone: 'mid' }) +
    L(k.knurl(dx, dy, 15, 0, 5, 36, P)) +
    L(k.ring(dx, dy, 11, 5, P, 32)) +
    slab({ x: dx - 2.5, y: dy - 11, w: 20, d: 5, r: 2 }, 5, 3, { tone: 'hi', lit: true }) +
    D([[dx, dy, 8]], 0.7, 'hi');
  return mast + cardBox([x, y], 3) + probes + arm + slab(rack, 0, 3, { tone: 'mid' }) + ranked + dial;
}

/** The shelf of documents, one binder pulled forward. */
function docs([x, y]: Point2): string {
  const shelf: Plan = { x: x - 33, y: y - 13, w: 66, d: 26, r: 2 };
  const binders = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => slab({ x: shelf.x + 4 + i * 7.6, y: shelf.y + 3 + (i === 5 ? 6 : 0), w: 5.8, d: 18, r: 0.6 }, 3, 27 + (i % 3) * 2.5, { tone: 'hi', lit: i === 5 }, 0.3)).join('');
  return slab(shelf, 0, 3, { tone: 'mid' }) + binders;
}

/** The form the model fills in: a clipboard with a few boxes to tick and nowhere to write anything else. */
function form([x, y]: Point2): string {
  const stand: Plan = { x: x - 17, y: y - 14, w: 34, d: 28, r: 3 };
  const page: Plan = { x: x - 12, y: y - 10, w: 24, d: 20, r: 0.8 };
  const top = 9.6;
  const rows = [4, 9, 14, 19].map((dx) => k.lineOnTop([page.x + dx, page.y + 6], [page.x + dx, page.y + page.d - (dx === 19 ? 8 : 3)], top, P)).join('');
  const boxes = [4, 9, 14, 19].map((dx) => k.planOutline({ x: page.x + dx - 1.3, y: page.y + 1.8, w: 2.6, d: 2.6, r: 0.3 }, top, P)).join('');
  return (
    slab(stand, 0, 7, { tone: 'hi' }) +
    slab(k.insetPlan(page, -2.2), 7, 1.6, { tone: 'mid', crease: 'none' }, 0) +
    slab(page, 8.6, 1, { tone: 'hi', crease: 'none' }, 0) +
    L(rows, 'lo') +
    L(boxes, 'mid') +
    slab({ x: page.x - 3.4, y: y - 5, w: 3.6, d: 10, r: 1 }, 8.6, 2.6, { tone: 'hi', lit: true })
  );
}

/** Three gates, one after another, each with its own bar across the way and its own lamp. */
function gates(): string {
  return GATE_X.map((x) => {
    const leg = (y: number): string => collar(x, y, 2.2) + post(x, y, 2.2, 2.4, 23.6, { tone: 'mid', crease: 'none' });
    return (
      leg(LANE_Y - 15) +
      slab({ x: x - 1, y: LANE_Y - 12, w: 2, d: 24, r: 0.3 }, 7, 3, { tone: 'hi', crease: 'none' }, 0) +
      leg(LANE_Y + 15) +
      slab({ x: x - 3, y: LANE_Y - 18, w: 6, d: 36, r: 1.5 }, 26, 4, { tone: 'hi' }) +
      post(x, LANE_Y, 3, 30, 3, { tone: 'hi', lit: true })
    );
  }).join('');
}

/** Doing the sum: an adding machine with its keys, its paper and its crank. */
function compute([x, y]: Point2): string {
  const body: Plan = { x: x - 21, y: y - 14, w: 42, d: 28, r: 3 };
  const keys: Point3[] = [];
  for (let column = 0; column < 4; column += 1) for (let row = 0; row < 3; row += 1) keys.push([body.x + 9 + column * 7, body.y + 12 + row * 5, 13]);
  return (
    slab(body, 0, 13, { tone: 'hi' }) +
    D(keys, 0.9, 'hi') +
    post(x - 4, body.y + 5, 4.5, 13, 7, { tone: 'hi', lit: true }) +
    post(body.x + body.w + 3, y, 1.6, 4, 12, { tone: 'mid', crease: 'none' }) +
    post(body.x + body.w + 3, y, 3.4, 16, 3.5, { tone: 'hi' })
  );
}

/** The last check: a gate with a stamp that comes down on what passes, and a lamp above. */
function verify([x, y]: Point2): string {
  const beam: Plan = { x: x - 5, y: y - 30, w: 10, d: 62, r: 2 };
  const leg = (ly: number): string => collar(x, ly, 3) + post(x, ly, 3, 2.4, 41.6, { tone: 'mid', crease: 'none' });
  return leg(y - 26) + post(x, y, 7.5, 20, 7, { tone: 'hi', lit: true }) + post(x, y, 2.2, 27, 17, { tone: 'mid', crease: 'none' }) + leg(y + 28) + slab(beam, 44, 6, { tone: 'hi' }) + post(x, y, 4, 50, 4.5, { tone: 'hi', lit: true });
}

/** The answer: a sheet in a tray, with a flag standing at each source it cites. */
function answer([x, y]: Point2): string {
  const tray: Plan = { x: x - 24, y: y - 20, w: 48, d: 40, r: 3 };
  const page: Plan = { x: x - 17, y: y - 14, w: 30, d: 28, r: 1 };
  const lines = [4, 8, 12, 16].map((dx) => k.lineOnTop([page.x + dx, page.y + 3], [page.x + dx, page.y + page.d - (dx === 16 ? 12 : 3)], 4.2, P)).join('');
  const flags = [-8, 6]
    .map((dy) => post(x + 18, y + dy, 0.8, 3, 15, { tone: 'mid', crease: 'none' }) + slab({ x: x + 18, y: y + dy - 0.6, w: 8, d: 1.2, r: 0.2 }, 13, 5, { tone: 'hi', crease: 'none', lit: true }, 0))
    .join('');
  return slab(tray, 0, 3, { tone: 'mid' }) + slab(page, 3, 1.2, { tone: 'hi', crease: 'none' }, 0) + L(lines) + flags;
}

/** Three gauges: is the answer right, is the source right, and what does a second model make of it. */
function evaluate([x, y]: Point2): string {
  const body: Plan = { x: x - 26, y: y - 11, w: 52, d: 22, r: 3 };
  const dials = [-16, 0, 16]
    .map((dx, i) => {
      const needle = k.lineOnTop([x + dx, y], [x + dx + [3, -1, 2][i], y - 4], 9.6, P);
      return post(x + dx, y, 6, 7, 2.6, { tone: 'hi', lit: true }) + L(needle, 'hi');
    })
    .join('');
  return slab(body, 0, 7, { tone: 'hi' }) + dials;
}

const BUILDERS: Record<DeskNode, () => string> = {
  pdf,
  sheet,
  cards: () => cardBox(AT.cards),
  store,
  ask: () => ask(AT.ask),
  plan: () => plan(AT.plan),
  find: () => find(AT.find),
  docs: () => docs(AT.docs),
  form: () => form(AT.form),
  gates,
  compute: () => compute(AT.compute),
  verify: () => verify(AT.verify),
  answer: () => answer(AT.answer),
  eval: () => evaluate(AT.eval),
};

export interface DeskFigure {
  svg: string;
  /** How far the token moves on screen, from its home on the hopper, to rest at each stop. */
  rests: Partial<Record<DeskNode, Point2>>;
}

export function buildDeskFigure(): DeskFigure {
  const order = [...DESK_NODES].sort((a, b) => k.depthOf([...AT[a], 0], P) - k.depthOf([...AT[b], 0], P));
  const nodes = order.map((id) => `<g class="fig-station" data-node="${id}" data-who="${DESK_WORKERS[id].join(' ')}">${BUILDERS[id]()}</g>`).join('');
  const home = REST.ask as Point3;
  const [hx, hy] = at(home);
  const token = `<g class="fig-token" data-token>${post(home[0], home[1], 5.5, home[2], 5, { tone: 'hi', lit: true })}</g>`;
  const rests = Object.fromEntries(
    (Object.entries(REST) as Array<[DeskNode, Point3]>).map(([id, rest]) => {
      const [x, y] = at(rest);
      return [id, [fine(x - hx), fine(y - hy)] as Point2];
    }),
  ) as Partial<Record<DeskNode, Point2>>;
  return { svg: benchPlate(draw, PLATE) + ways() + nodes + token, rests };
}
