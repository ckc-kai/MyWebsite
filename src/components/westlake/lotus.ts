/** 曲院风荷: lotus leaves and flowers in the summer breeze at Quyuan. Kept apart: it is drawn from its own parts. */
import { blob, pt, ripples, rng, stroke, type Point } from './brush';
import { PAPER, PINK, SEAL, SEED, ink, seal, sketch } from './scene-kit';

const SEED_COLOUR = '#e7c25d';

/** A leaf seen from above and at a slant: a dark splash of ink, paler toward the rim, with pale veins. */
function leaf(r: () => number, id: string, cx: number, cy: number, rx: number, ry: number, opacity: number, rot = 0): string {
  const pts = Array.from({ length: 16 }, (_, i): Point => {
    const a = (i / 16) * Math.PI * 2;
    const notch = i === 4 ? 0.35 : 1 + (r() - 0.5) * 0.12;
    return [cx + Math.cos(a) * rx * notch, cy + Math.sin(a) * ry * notch];
  });
  const veins = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + 0.2;
    return `<path d="${stroke([[cx, cy], [cx + Math.cos(a) * rx * 0.8, cy + Math.sin(a) * ry * 0.8]], { w: 1.2, start: 0.05, end: 0.7 })}" fill="${PAPER}" fill-opacity="0.5"/>`;
  });
  return `<g transform="rotate(${rot} ${cx} ${cy})">
    <path d="${blob(pts)}" fill-opacity="${opacity}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.55}" ry="${ry * 0.5}" fill-opacity="${opacity * 0.45}" filter="url(#${id}-soft)"/>
    ${veins.join('')}
    <ellipse cx="${cx}" cy="${cy}" rx="2.4" ry="1.4" fill="${PAPER}" fill-opacity="0.7"/>
  </g>`;
}

/** A leaf curled up on its stalk, seen from the side: a shallow bowl. */
function cupped(cx: number, cy: number, wd: number, depth: number, opacity: number): string {
  const d = `M${pt([cx - wd, cy])} Q${pt([cx - wd * 0.6, cy + depth * 1.3])} ${pt([cx, cy + depth * 1.35])} Q${pt([cx + wd * 0.6, cy + depth * 1.3])} ${pt([cx + wd, cy - 2])} Q${pt([cx, cy + depth * 0.45])} ${pt([cx - wd, cy])}Z`;
  return `<path d="${d}" fill-opacity="${opacity}"/>${ink(stroke([[cx - wd, cy], [cx, cy + depth * 0.42], [cx + wd, cy - 2]], { w: 1.6, start: 0.1, end: 0.1, min: 0.4 }), 0.9)}`;
}

function petal(bx: number, by: number, len: number, wid: number, angle: number, shade: number): string {
  const a = (angle * Math.PI) / 180;
  const tip: Point = [bx + Math.sin(a) * len, by - Math.cos(a) * len];
  const nx = Math.cos(a) * wid;
  const ny = Math.sin(a) * wid;
  const d = `M${pt([bx, by])} Q${pt([bx + nx * 1.1 + Math.sin(a) * len * 0.5, by + ny * 1.1 - Math.cos(a) * len * 0.5])} ${pt(tip)} Q${pt([bx - nx * 1.1 + Math.sin(a) * len * 0.5, by - ny * 1.1 - Math.cos(a) * len * 0.5])} ${pt([bx, by])}Z`;
  return `<path d="${d}" fill="${PINK}" fill-opacity="${shade}" stroke="currentColor" stroke-opacity="0.75" stroke-width="0.9"/>`;
}

const dots = (pts: readonly Point[]): string => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.9" fill-opacity="0.7"/>`).join('');

function dragonfly(x: number, y: number): string {
  const wings = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => {
    const wx = x + 2 + sx * 2.6;
    const wy = y + sy * 5.4;
    return `<ellipse cx="${wx}" cy="${wy}" rx="${sx < 0 ? 2.4 : 2}" ry="5.6" transform="rotate(${sx * 14} ${wx} ${wy})" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.6" stroke-width="0.6"/>`;
  });
  return `<g transform="rotate(-18 ${x} ${y})">${ink(stroke([[x - 2, y], [x + 18, y]], { w: 1.8, start: 0.05, end: 0.7, min: 0.3 }), 0.85)}<circle cx="${x - 3}" cy="${y}" r="2" fill-opacity="0.85"/>${wings.join('')}</g>`;
}

export function quyuan(): string {
  const id = 'qy';
  const r = rng(41);
  const flower = [
    petal(214, 104, 34, 10, -64, 0.5), petal(214, 104, 34, 10, 64, 0.5),
    petal(214, 104, 37, 11, -34, 0.68), petal(214, 104, 37, 11, 34, 0.68),
    petal(214, 104, 39, 11, -9, 0.88), petal(214, 104, 38, 11, 13, 0.82),
  ];
  return sketch(
    id,
    SEED,
    `${leaf(r, id, 290, 186, 50, 15, 0.42, -3)}
    ${cupped(58, 122, 32, 18, 0.55)}
    ${ink(stroke([[58, 146], [60, 190], [64, 238]], { w: 1.7, start: 0.05, end: 0.3 }), 0.75)}
    ${dots([[59, 160], [61, 176], [60, 196], [63, 214]])}
    ${ink(stroke([[212, 108], [208, 150], [202, 196], [198, 250]], { w: 2.1, start: 0.02, end: 0.2, min: 0.5 }), 0.82)}
    ${dots([[209, 136], [207, 158], [204, 180], [201, 204], [200, 226]])}
    ${ink(stroke([[152, 100], [160, 146], [168, 196], [174, 252]], { w: 1.7, start: 0.02, end: 0.2, min: 0.5 }), 0.78)}
    ${dots([[156, 124], [161, 152], [166, 180], [170, 214]])}
    ${flower.join('')}
    <ellipse cx="214" cy="96" rx="6.4" ry="2.8" fill="${SEED_COLOUR}" fill-opacity="0.9"/>
    <path d="M152 102 Q140 82 149 62 Q151 58 153 62 Q164 82 153 102 Z" fill="${PINK}" fill-opacity="0.82" stroke="currentColor" stroke-opacity="0.75" stroke-width="0.9"/>
    ${dragonfly(106, 62)}
    ${leaf(r, id, 110, 212, 80, 28, 0.62, 3)}
    ${ripples([[20, 250, 30], [228, 250, 40], [300, 230, 40]], 14).map((d) => ink(d, 0.35)).join('')}
    ${seal(SEAL)}`,
  );
}
