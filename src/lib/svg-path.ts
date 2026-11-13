/**
 * Shrinks the polyline paths the figures and sketches are drawn with, without moving a single point.
 *
 * Every path here is written as absolute `M x y L x y … Z` at a tenth of a unit. Rewritten with relative
 * steps (`l`), the same points take about half the characters: the three engineering drawings alone go
 * from ~740 KB to under 400 KB of HTML per page. Steps are taken between the already-rounded points, so
 * rounding never drifts along a long run. Anything that is not a plain tenth-precision polyline is
 * returned untouched.
 */

const TOKEN = /[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)/g;
const MORE_THAN_A_TENTH = /\.\d{2,}/;

/** A number held in tenths, written as short as SVG allows: `0.5` → `.5`, `-0.5` → `-.5`, `3.0` → `3`. */
function formatTenths(tenths: number): string {
  if (tenths % 10 === 0) return String(tenths / 10);
  const sign = tenths < 0 ? '-' : '';
  const size = Math.abs(tenths);
  const whole = Math.floor(size / 10);
  return `${sign}${whole === 0 ? '' : whole}.${size % 10}`;
}

/** Joins numbers with a separator only where the next one would otherwise run into the last. */
function joinNumbers(numbers: readonly string[]): string {
  let out = '';
  numbers.forEach((text, index) => {
    if (index > 0) {
      const previous = numbers[index - 1];
      const runsOn = text.startsWith('-') || (text.startsWith('.') && previous.includes('.'));
      if (!runsOn) out += ' ';
    }
    out += text;
  });
  return out;
}

interface Subpath {
  readonly points: ReadonlyArray<readonly [number, number]>;
  readonly closed: boolean;
}

/** Reads an absolute M/L/Z path into subpaths of points in tenths, or null if it is anything else. */
function parse(d: string): Subpath[] | null {
  if (MORE_THAN_A_TENTH.test(d)) return null;
  const tokens = d.match(TOKEN) ?? [];
  const subpaths: { points: [number, number][]; closed: boolean }[] = [];
  for (let at = 0; at < tokens.length; ) {
    const token = tokens[at];
    if (token === 'Z' || token === 'z') {
      const current = subpaths.at(-1);
      if (!current) return null;
      current.closed = true;
      at += 1;
      continue;
    }
    const isMove = token === 'M';
    if (!isMove && token !== 'L') return null;
    at += 1;
    if (isMove) subpaths.push({ points: [], closed: false });
    const current = subpaths.at(-1);
    if (!current || current.closed) return null;
    // A command may be followed by several pairs; after M they are implicit line-tos.
    while (at + 1 < tokens.length && !/[A-Za-z]/.test(tokens[at]) && !/[A-Za-z]/.test(tokens[at + 1])) {
      current.points.push([Math.round(Number(tokens[at]) * 10), Math.round(Number(tokens[at + 1]) * 10)]);
      at += 2;
    }
    if (at < tokens.length && !/[A-Za-z]/.test(tokens[at])) return null;
  }
  return subpaths.every((subpath) => subpath.points.length > 0) ? subpaths : null;
}

export function compactPath(d: string): string {
  const subpaths = parse(d);
  if (!subpaths) return d;
  return subpaths
    .map(({ points, closed }) => {
      const [[startX, startY], ...rest] = points;
      let out = `M${joinNumbers([formatTenths(startX), formatTenths(startY)])}`;
      if (rest.length) {
        const steps = rest.flatMap(([x, y], index) => {
          const [fromX, fromY] = points[index];
          return [formatTenths(x - fromX), formatTenths(y - fromY)];
        });
        out += `l${joinNumbers(steps)}`;
      }
      return closed ? `${out}Z` : out;
    })
    .join('');
}

/** Compacts every `d` attribute in a fragment of SVG markup. */
export function compactSvg(svg: string): string {
  return svg.replace(/(\sd=")([^"]*)"/g, (_, opening: string, d: string) => `${opening}${compactPath(d)}"`);
}
