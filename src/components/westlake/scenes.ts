/** Five West Lake views as ink sketches, drawn at build time. Copy (names and notes) lives in content/zh.ts. */
import { blob, pt, ripples, rng, smooth, stroke, willow, type Point, type Willow } from './brush';
import { quyuan } from './lotus';
import { MOON, PAPER, PINK, RED, SEAL, SEED, SKETCH_SIZE, edge, ink, seal, sketch, wash } from './scene-kit';

export type WestLakeKey = 'duanqiao' | 'santan' | 'leifeng' | 'sudi' | 'quyuan';

const { width: W, height: H } = SKETCH_SIZE;


const drawWillow = (tree: Willow, trunk = 0.85, branch = 0.7, leaf = 0.55): string =>
  ink(tree.trunk, trunk) + tree.branches.map((d) => ink(d, branch)).join('') + tree.leaves.map((d) => ink(d, leaf)).join('');

/** 断桥残雪: after snow the top of the bridge thaws first, and from afar the bridge looks broken. */
function duanqiao(): string {
  const id = 'dq';
  const r = rng(11);
  const far = blob([[-10, 132], [28, 116], [60, 121], [96, 104], [130, 116], [168, 109], [206, 121], [242, 107], [282, 116], [322, 101], [372, 118], [372, 146], [-10, 146]]);
  const near = blob([[214, 160], [246, 138], [276, 131], [306, 140], [338, 133], [372, 144], [372, 166], [214, 166]]);
  const deckTop: Point[] = [[76, 192], [118, 178], [180, 168], [242, 178], [284, 192]];
  const deckUnder: Point[] = [[86, 198], [124, 185], [180, 176], [236, 185], [274, 198]];
  const arch: Point[] = [[148, 198], [153, 188], [165, 180], [180, 177], [195, 180], [207, 188], [212, 198]];
  const body = `M${pt(deckUnder[0])}L${smooth(deckUnder).map(pt).join('L')}L${smooth([...arch].reverse()).map(pt).join('L')}Z`;
  const tree = willow({ base: [34, 252], top: [58, 132], spread: 92, count: 11, drop: 96, seed: 4, trunkWidth: 5 });
  const snow = Array.from({ length: 40 }, () => `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * 96).toFixed(1)}" r="${(0.7 + r()).toFixed(1)}"/>`).join('');
  const thin = { w: 1.3, start: 0.1, end: 0.1, min: 0.6 };
  return sketch(
    id,
    SEED,
    `${edge(`<rect x="0" y="0" width="${W}" height="96" fill="url(#${id}-fall)" fill-opacity="0.13"/><g fill="${PAPER}">${snow}</g>`, id)}
    ${wash(far, 0.16, id)}${wash(near, 0.3, id)}${wash(body, 0.16, id)}
    ${ink(stroke([...deckTop.slice(0, 2), [142, 171.5]], thin), 0.75)}
    ${ink(stroke([[142, 171.5], [180, 167.6], [218, 171.5]], { w: 5.2, start: 0.12, end: 0.12, min: 0.4 }), 0.92)}
    ${ink(stroke([[218, 171.5], ...deckTop.slice(3)], thin), 0.75)}
    ${ink(stroke(deckUnder, { w: 1.6, start: 0.05, end: 0.05, min: 0.5 }), 0.8)}
    ${ink(stroke(arch, { w: 2.2, start: 0.05, end: 0.05, min: 0.4 }), 0.88)}
    ${[0, 1, 2, 3].map((i) => ink(stroke([[150 + i * 15, 199 + Math.sin(i) * 0.6], [158 + i * 15, 199 + 9 - Math.abs(i - 1.5) * 2.4]], { w: 1.3 }), 0.35)).join('')}
    ${ink(stroke([[149, 204], [156, 213], [170, 219], [184, 220], [198, 217], [208, 209], [212, 202]], { w: 1.1, start: 0.2, end: 0.2 }), 0.32)}
    ${drawWillow(tree)}
    ${ripples([[96, 214, 40], [232, 222, 52], [62, 236, 36], [168, 240, 62], [282, 246, 42], [118, 252, 30]], 5).map((d) => ink(d, 0.45)).join('')}
    ${seal(SEAL)}`,
  );
}

/** One of the three stone pagodas: a round body with windows, a little roof, a gourd on top. */
function stonePagoda(cx: number, base: number, s: number): string {
  const ball = base - 17 * s;
  const R = 12 * s;
  const roof = ball - R - 5 * s;
  const ring = (from: number, to: number, width: number, opacity: number): string =>
    ink(stroke(Array.from({ length: 13 }, (_, i): Point => { const a = Math.PI * (from + (i / 12) * (to - from)); return [cx + Math.cos(a) * R, ball + Math.sin(a) * R]; }), { w: width * s, start: 0.15, end: 0.15, min: 0.3 }), opacity);
  const window = (dx: number): string =>
    `<ellipse cx="${cx + dx * s}" cy="${ball}" rx="${1.3 * s}" ry="${3.2 * s}" fill="${PAPER}" stroke="currentColor" stroke-opacity="0.6" stroke-width="${0.8 * s}"/>`;
  const parts = [
    ink(stroke([[cx - 9 * s, base], [cx, base + 1.4 * s], [cx + 9 * s, base]], { w: 3 * s, start: 0.2, end: 0.2, min: 0.3 }), 0.85),
    ink(stroke([[cx, base - 1], [cx, ball + R - 1]], { w: 5.5 * s, start: 0, end: 0, min: 1 }), 0.6),
    `<circle cx="${cx}" cy="${ball}" r="${R}" fill-opacity="0.2"/>`,
    ring(0.92, 2.08, 2.6, 0.85),
    ring(2.1, 2.9, 1.8, 0.7),
    `<circle cx="${cx}" cy="${ball}" r="${3.6 * s}" fill="${PAPER}" stroke="currentColor" stroke-opacity="0.85" stroke-width="${1.1 * s}"/>`,
    window(-8.6),
    window(8.6),
    ink(stroke([[cx - 4 * s, ball - R - 1.5 * s], [cx + 4 * s, ball - R - 1.5 * s]], { w: 2.6 * s }), 0.75),
    ink(stroke([[cx - 13 * s, roof + 4 * s], [cx - 8 * s, roof + 1.2 * s], [cx, roof], [cx + 8 * s, roof + 1.2 * s], [cx + 13 * s, roof + 4 * s]], { w: 3.4 * s, start: 0.12, end: 0.12, min: 0.25 }), 0.9),
    `<ellipse cx="${cx}" cy="${roof - 3.2 * s}" rx="${3 * s}" ry="${2.8 * s}" fill-opacity="0.82"/>`,
    `<ellipse cx="${cx}" cy="${roof - 8 * s}" rx="${1.9 * s}" ry="${2 * s}" fill-opacity="0.82"/>`,
    ink(stroke([[cx, roof - 9.5 * s], [cx, roof - 13 * s]], { w: 1.2 * s }), 0.8),
  ];
  const reflection = [0, 1, 2, 3].map((i) =>
    ink(stroke([[cx - (9 - i * 1.8) * s, base + (6 + i * 6) * s], [cx + (9 - i * 1.8) * s, base + (6 + i * 6) * s + 0.5]], { w: (2.4 - i * 0.35) * s }), 0.28),
  );
  return parts.join('') + reflection.join('');
}

/** 三潭印月: three small stone pagodas stand in the lake; on a full-moon night their windows are lit and doubled in the water. */
function santan(): string {
  const id = 'st';
  const moon: Point = [290, 54];
  const far = blob([[-10, 152], [40, 140], [86, 146], [130, 134], [176, 144], [222, 138], [268, 147], [320, 136], [372, 146], [372, 160], [-10, 160]]);
  const clouds: Point[][] = [
    [[150, 44], [230, 36], [330, 40], [350, 50], [250, 52], [160, 52]],
    [[110, 70], [200, 64], [300, 70], [340, 78], [230, 80], [120, 78]],
    [[60, 96], [160, 92], [250, 96], [280, 102], [170, 104], [70, 103]],
    [[200, 18], [290, 14], [350, 22], [300, 28], [210, 26]],
  ];
  const cloudInk = [0.26, 0.22, 0.16, 0.14];
  return sketch(
    id,
    SEED,
    `<mask id="${id}-sky"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${moon[0]}" cy="${moon[1]}" r="38" fill="#000" filter="url(#${id}-soft)"/><circle cx="${moon[0]}" cy="${moon[1]}" r="25" fill="#000"/></mask>
    <g mask="url(#${id}-sky)">${clouds.map((cloud, i) => wash(blob(cloud), cloudInk[i], id)).join('')}</g>
    <circle cx="${moon[0]}" cy="${moon[1]}" r="25" fill="${MOON}" stroke="currentColor" stroke-opacity="0.35" stroke-width="0.8"/>
    ${wash(far, 0.2, id)}
    ${ink(stroke([[-6, 160], [120, 159], [240, 160.5], [366, 159]], { w: 1, start: 0.05, end: 0.05, min: 0.5 }), 0.35)}
    ${stonePagoda(178, 190, 1.05)}${stonePagoda(82, 214, 1.4)}${stonePagoda(268, 206, 1.25)}
    ${[[300, 232, 22], [296, 239, 30], [304, 246, 18]].map(([x, y, len]) => ink(stroke([[x - len / 2, y], [x + len / 2, y + 0.4]], { w: 1 }), 0.4)).join('')}
    <ellipse cx="${moon[0] + 22}" cy="239" rx="12" ry="4.5" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="0.8" stroke-dasharray="7 4"/>
    ${ripples([[20, 174, 40], [120, 178, 30], [300, 182, 44], [24, 248, 50], [150, 246, 44], [200, 228, 26]], 8).map((d) => ink(d, 0.35)).join('')}
    ${seal(SEAL)}`,
  );
}

/** 雷峰夕照: Leifeng Pagoda on its hill, dark against the setting sun, a rowing boat below. */
function leifeng(): string {
  const id = 'lf';
  const r = rng(21);
  const cx = 262;
  const far = blob([[-10, 128], [36, 114], [80, 120], [124, 108], [168, 118], [210, 112], [240, 120], [-10, 140]]);
  const hill = blob([[150, 200], [184, 172], [218, 154], [250, 147], [280, 148], [314, 158], [346, 176], [374, 194], [374, 204], [150, 204]]);
  let y = 146;
  const tiers = Array.from({ length: 5 }, (_, i) => {
    const w = 40 - i * 5;
    const h = 15 - i * 1.2;
    const bottom = y;
    const top = y - h;
    y = top;
    const wall = w * 0.42;
    return [
      `<path d="M${cx - wall} ${bottom} L${cx - wall * 0.95} ${top + 3} L${cx + wall * 0.95} ${top + 3} L${cx + wall} ${bottom} Z" fill-opacity="0.55" filter="url(#${id}-wash)"/>`,
      `<rect x="${cx - 1.6}" y="${bottom - h * 0.62}" width="3.2" height="${h * 0.4}" rx="1.4" fill="${PAPER}" fill-opacity="0.75"/>`,
      ink(stroke([[cx - w / 2 - 5, top - 1.5], [cx - w / 2, top + 2.6], [cx, top + 3.2], [cx + w / 2, top + 2.6], [cx + w / 2 + 5, top - 1.5]], { w: 2.6, start: 0.12, end: 0.12, min: 0.25 }), 0.92),
    ].join('');
  });
  const spire = ink(stroke([[cx, y + 2], [cx, y - 16]], { w: 1.6, start: 0, end: 0.4 }), 0.85) + [4, 8, 12].map((d) => `<ellipse cx="${cx}" cy="${y - d}" rx="2.2" ry="1" fill-opacity="0.85"/>`).join('');
  const moss = Array.from({ length: 26 }, () => {
    const x = 170 + r() * 190;
    const yy = 168 + Math.abs(x - 265) * 0.22 + r() * 22;
    return `<ellipse cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" rx="${(1.6 + r() * 1.6).toFixed(1)}" ry="${(1 + r() * 0.8).toFixed(1)}" fill-opacity="${(0.45 + r() * 0.35).toFixed(2)}"/>`;
  });
  const glint = [[98, 214, 34], [96, 222, 24], [100, 230, 16], [97, 238, 9]].map(([x, yy, len]) => `<path d="${stroke([[x - len / 2, yy], [x + len / 2, yy + 0.4]], { w: 2.2 })}" fill="${RED}" fill-opacity="0.55"/>`);
  return sketch(
    id,
    SEED,
    `<circle cx="98" cy="88" r="24" fill="${RED}" fill-opacity="0.72"/>
    <circle cx="98" cy="88" r="36" fill="${RED}" fill-opacity="0.1" filter="url(#${id}-soft)"/>
    ${wash(far, 0.15, id)}${wash(hill, 0.4, id)}
    ${moss.join('')}${tiers.join('')}${spire}
    ${ink(stroke([[-6, 204], [180, 203], [366, 204.5]], { w: 1, start: 0.05, end: 0.05, min: 0.5 }), 0.3)}
    ${glint.join('')}
    ${ink(stroke([[34, 232], [50, 238], [78, 238], [94, 231]], { w: 3, start: 0.15, end: 0.15, min: 0.4 }), 0.85)}
    ${ink(stroke([[52, 230], [62, 223], [74, 224], [80, 230]], { w: 2, start: 0.1, end: 0.1, min: 0.5 }), 0.75)}
    ${ink(stroke([[86, 227], [86, 220]], { w: 1.8 }), 0.8)}<circle cx="86" cy="217.5" r="2" fill-opacity="0.8"/>
    ${ink(stroke([[84, 224], [104, 244]], { w: 1, start: 0.1, end: 0.1, min: 0.5 }), 0.7)}
    ${ripples([[150, 216, 40], [210, 226, 50], [20, 250, 40], [130, 248, 56], [290, 244, 40]], 9).map((d) => ink(d, 0.4)).join('')}
    ${seal(SEAL)}`,
  );
}

/** A peach tree in flower: a short trunk, a few twigs, a cloud of pink dots. */
function peachTree(x: number, ground: number, s: number, seed: number): string {
  const r = rng(seed);
  const trunk = ink(stroke([[x, ground], [x + 2 * s, ground - 14 * s], [x - 1 * s, ground - 26 * s]], { w: 3.4 * s, start: 0.02, end: 0.4, min: 0.3 }), 0.85);
  const twigs = [[-12, -34], [10, -36], [-4, -40], [14, -26], [-15, -24]].map(([dx, dy]) =>
    ink(stroke([[x - 1 * s, ground - 24 * s], [x + dx * 0.5 * s, ground + (dy * 0.7 - 2) * s], [x + dx * s, ground + dy * s]], { w: 1.4 * s, start: 0.05, end: 0.6 }), 0.75),
  );
  const blossoms = Array.from({ length: 46 }, () => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 17 * s;
    const bx = x + Math.cos(a) * d * 1.15;
    const by = ground - 32 * s + Math.sin(a) * d * 0.8;
    return `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${((1.2 + r() * 1.5) * s).toFixed(1)}" fill="${PINK}" fill-opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`;
  });
  return trunk + twigs.join('') + blossoms.join('');
}

/** 苏堤春晓: the long causeway at dawn in spring, willows and peach blossom along it, a hump bridge in the middle. */
function sudi(): string {
  const id = 'sd';
  const r = rng(31);
  const yTop = (x: number): number => 172 - x * 0.034 - 12 * Math.exp(-(((x - 190) / 26) ** 2));
  const yBottom = (x: number): number => 180 - x * 0.034;
  const xs = Array.from({ length: 39 }, (_, i) => -10 + i * 10);
  const band = `M${xs.map((x) => pt([x, yTop(x)])).join('L')}L${[...xs].reverse().map((x) => pt([x, yBottom(x)])).join('L')}Z`;
  const archY = yBottom(190);
  const arch = Array.from({ length: 13 }, (_, i): Point => { const a = Math.PI + (i / 12) * Math.PI; return [190 + Math.cos(a) * 12, archY + Math.sin(a) * 10]; });
  const far = blob([[-10, 118], [44, 102], [92, 110], [140, 96], [194, 108], [246, 98], [300, 110], [372, 100], [372, 132], [-10, 132]]);
  const trees = [
    willow({ base: [58, yTop(58) + 1], top: [62, yTop(58) - 44], spread: 42, count: 8, drop: 52, seed: 7, w: 0.9, trunkWidth: 3.4 }),
    willow({ base: [252, yTop(252) + 1], top: [256, yTop(252) - 40], spread: 38, count: 8, drop: 46, seed: 8, w: 0.9, trunkWidth: 3.2 }),
    willow({ base: [338, yTop(338) + 1], top: [340, yTop(338) - 34], spread: 32, count: 7, drop: 40, seed: 9, w: 0.85, trunkWidth: 2.8 }),
  ];
  const branch: Point[] = [[-4, 14], [34, 26], [70, 30], [104, 46]];
  const along = smooth(branch, 10);
  const branchBlossoms = Array.from({ length: 16 }, (_, i) => {
    const p = along[Math.floor((i / 16) * 30)];
    return `<circle cx="${(p[0] + (r() - 0.5) * 10).toFixed(1)}" cy="${(p[1] + (r() - 0.3) * 8).toFixed(1)}" r="${(2 + r() * 1.8).toFixed(1)}" fill="${PINK}" fill-opacity="${(0.65 + r() * 0.3).toFixed(2)}"/>`;
  });
  const swallow = (x: number, y: number, s: number): string =>
    ink(stroke([[x - 7 * s, y - 2 * s], [x - 2 * s, y], [x, y + 1 * s], [x + 3 * s, y - 1 * s], [x + 8 * s, y - 4 * s]], { w: 1.8 * s, start: 0.3, end: 0.3, min: 0.15 }), 0.85);
  return sketch(
    id,
    SEED,
    `${edge(`<ellipse cx="190" cy="104" rx="170" ry="34" fill="${PINK}" fill-opacity="0.3" filter="url(#${id}-soft)"/>`, id)}
    ${wash(far, 0.14, id)}${wash(band, 0.18, id)}
    ${ink(stroke(xs.map((x): Point => [x, yTop(x)]), { w: 1.4, start: 0.02, end: 0.02, min: 0.5 }), 0.75)}
    ${ink(stroke(arch, { w: 1.6, start: 0.1, end: 0.1, min: 0.4 }), 0.8)}
    ${trees.map((tree) => drawWillow(tree, 0.8, 0.65, 0.5)).join('')}
    ${peachTree(124, yTop(124) + 1, 1.15, 3)}${peachTree(298, yTop(298) + 1, 0.95, 4)}
    ${ink(stroke(branch, { w: 3.4, start: 0.02, end: 0.5, min: 0.25 }), 0.85)}
    ${ink(stroke([[36, 30], [48, 44], [52, 56]], { w: 1.6, start: 0.05, end: 0.6 }), 0.8)}
    ${branchBlossoms.join('')}
    ${swallow(232, 58, 1)}${swallow(258, 72, 0.8)}
    ${ripples([[30, 198, 40], [130, 204, 34], [220, 196, 46], [80, 226, 58], [250, 230, 44], [170, 246, 40]], 12).map((d) => ink(d, 0.4)).join('')}
    ${seal(SEAL)}`,
  );
}

const DRAW: Record<WestLakeKey, () => string> = { duanqiao, santan, leifeng, sudi, quyuan };

/** The sketch for a view, as an SVG string. */
export function drawWestLake(key: WestLakeKey): string {
  return DRAW[key]();
}
