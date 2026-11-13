/**
 * Geometry for the highlighter that marks selected text: the selection's line boxes are merged into
 * one strip per line, and each strip is drawn as a marker stroke with a wobbly edge and soft ends.
 * The wobble is seeded by where a line starts on the page, so a stroke keeps its shape while the
 * page scrolls or the selection grows; only the new end is drawn fresh.
 */

export interface InkRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** Two boxes count as one line when their tops and bottoms are this close, in pixels. */
const SAME_LINE_PX = 3;
/** Boxes on one line closer than this are joined; a wider gap (another column) starts a new strip. */
const JOIN_GAP_PX = 8;
/** A wobble point every this many pixels along the stroke. */
const STEP_PX = 22;
/** How far the edges wander up and down, as a share of the line height. */
const WOBBLE = 0.05;
/** How far a stroke runs past the text at each end, in pixels. */
const OVERSHOOT_PX = 3;

/** A repeatable number in [0, 1) for a seed and a position along the stroke. */
export function noise(seed: number, index: number): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(index + 1, 0xc2b2ae35);
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function sameLine(a: InkRect, b: InkRect): boolean {
  return Math.abs(a.top - b.top) <= SAME_LINE_PX && Math.abs(a.top + a.height - (b.top + b.height)) <= SAME_LINE_PX;
}

/** Joins the boxes of one line into a single strip, top to bottom, left to right. */
export function mergeLineRects(rects: readonly InkRect[]): InkRect[] {
  const sorted = rects
    .filter((rect) => rect.width >= 1 && rect.height >= 1)
    .slice()
    .sort((a, b) => a.top - b.top || a.left - b.left);
  return sorted.reduce<InkRect[]>((lines, rect) => {
    const last = lines[lines.length - 1];
    if (last && sameLine(last, rect) && rect.left - (last.left + last.width) <= JOIN_GAP_PX) {
      const right = Math.max(last.left + last.width, rect.left + rect.width);
      const top = Math.min(last.top, rect.top);
      const bottom = Math.max(last.top + last.height, rect.top + rect.height);
      return [...lines.slice(0, -1), { left: last.left, top, width: right - last.left, height: bottom - top }];
    }
    return [...lines, rect];
  }, []);
}

/** Where the stroke sits on the line, as shares of the line height from its top. */
export interface InkBand {
  readonly from: number;
  readonly to: number;
}

const round = (value: number): number => Math.round(value * 10) / 10;

/**
 * One marker stroke over a line of text, as an SVG path. The top and bottom edges wander a little,
 * the stroke climbs slightly from left to right, and each end bulges like a felt tip lifted off.
 */
export function inkBandPath(rect: InkRect, seed: number, band: InkBand): string {
  const { left, top, width, height } = rect;
  const x0 = left - OVERSHOOT_PX;
  const x1 = left + width + OVERSHOOT_PX;
  const yTop = top + height * band.from;
  const yBottom = top + height * band.to;
  const wobble = height * WOBBLE;
  const climb = (noise(seed, 999) - 0.5) * height * 0.08;
  const steps = Math.max(1, Math.ceil((x1 - x0) / STEP_PX));
  const lift = (x: number): number => (climb * (x - x0)) / Math.max(1, x1 - x0);

  const topEdge = Array.from({ length: steps + 1 }, (_, i) => {
    const x = Math.min(x1, x0 + i * STEP_PX);
    return [x, yTop + lift(x) + (noise(seed, i) - 0.5) * 2 * wobble] as const;
  });
  const bottomEdge = Array.from({ length: steps + 1 }, (_, i) => {
    const x = Math.min(x1, x0 + i * STEP_PX);
    return [x, yBottom + lift(x) + (noise(seed, i + 500) - 0.5) * 2 * wobble] as const;
  }).reverse();

  const bulge = (yBottom - yTop) * 0.32;
  const [endTop, startTop] = [topEdge[topEdge.length - 1], topEdge[0]];
  const [endBottom, startBottom] = [bottomEdge[0], bottomEdge[bottomEdge.length - 1]];
  const point = ([x, y]: readonly [number, number]): string => `${round(x)} ${round(y)}`;

  return [
    `M${point(startTop)}`,
    ...topEdge.slice(1).map((p) => `L${point(p)}`),
    `Q${round(endTop[0] + bulge)} ${round((endTop[1] + endBottom[1]) / 2)} ${point(endBottom)}`,
    ...bottomEdge.slice(1).map((p) => `L${point(p)}`),
    `Q${round(startBottom[0] - bulge)} ${round((startBottom[1] + startTop[1]) / 2)} ${point(startTop)}`,
    'Z',
  ].join(' ');
}

/** A seed for a line, from where it starts on the page (not on screen, so scrolling keeps it). */
export function lineSeed(rect: InkRect, scrollX: number, scrollY: number): number {
  return (Math.round(rect.left + scrollX) * 73856093) ^ (Math.round(rect.top + scrollY) * 19349663);
}
