/**
 * What every West Lake sketch shares: its canvas, its filters, and the marks it is made of.
 * Ink is `currentColor`, so the page draws the sketches in its own ink (dark by day, light at night);
 * vermilion, blossom pink, the paper and the moon come from CSS custom properties (west-lake.css).
 */

export const SKETCH_SIZE = { width: 360, height: 260 } as const;
/** The roughening seed the approved proofs were drawn with. */
export const SEED = 26;
/** The character on every seal. */
export const SEAL = '杭';
const { width: W, height: H } = SKETCH_SIZE;

export const RED = 'var(--ink-red, #c8452b)';
export const PINK = 'var(--ink-pink, #eba3ab)';
export const PAPER = 'var(--ink-paper, #ffffff)';
export const MOON = 'var(--ink-moon, none)';

/** Filters and fills for one sketch; every id is prefixed so five sketches can share a page. */
function defs(id: string, seed: number): string {
  return `<defs>
  <filter id="${id}-rough" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="${seed}"/>
    <feDisplacementMap in="SourceGraphic" scale="1.6"/>
  </filter>
  <filter id="${id}-wash" x="-20%" y="-30%" width="140%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.07" numOctaves="3" seed="${seed + 7}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 -0.45" result="m"/>
    <feComposite in="SourceGraphic" in2="m" operator="in" result="t"/>
    <feGaussianBlur in="t" stdDeviation="1.8"/>
  </filter>
  <filter id="${id}-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter>
  <radialGradient id="${id}-edgeg" cx="50%" cy="48%" r="62%">
    <stop offset="0.55" stop-color="#fff"/>
    <stop offset="1" stop-color="#000"/>
  </radialGradient>
  <mask id="${id}-edge" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${id}-edgeg)"/></mask>
  <linearGradient id="${id}-fall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="currentColor" stop-opacity="0.5"/>
    <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
  </linearGradient>
</defs>`;
}

/** A filled brush mark in the ink. */
export const ink = (d: string, opacity = 0.9): string => `<path d="${d}" fill-opacity="${opacity}"/>`;

/** A grey wash with a dry, uneven edge that fades out toward the edges of the sketch. */
export const wash = (d: string, opacity: number, id: string, fill = 'currentColor'): string =>
  `<g mask="url(#${id}-edge)"><path d="${d}" fill="${fill}" fill-opacity="${opacity}" filter="url(#${id}-wash)"/></g>`;

/** Anything that should fade out toward the edges of the sketch. */
export const edge = (inner: string, id: string): string => `<g mask="url(#${id}-edge)">${inner}</g>`;

/** The small vermilion seal in the corner. */
export function seal(char: string): string {
  return `<g transform="translate(${W - 34} ${H - 34}) rotate(-3)">
    <rect width="20" height="20" rx="2.5" fill="${RED}" fill-opacity="0.9"/>
    <text x="10" y="15.2" text-anchor="middle" font-family="'Noto Serif SC', 'Songti SC', serif" font-weight="900" font-size="14" fill="${PAPER}">${char}</text>
  </g>`;
}

/**
 * The finished sketch. The whole picture goes through one roughening pass, so every edge looks
 * brushed on paper; doing it once per picture rather than once per mark keeps it cheap to draw.
 */
export function sketch(id: string, seed: number, body: string): string {
  return `<svg class="west-lake__ink" viewBox="0 0 ${W} ${H}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${defs(id, seed)}<g fill="currentColor" filter="url(#${id}-rough)">${body}</g></svg>`;
}
