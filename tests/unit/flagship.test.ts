import { describe, expect, test } from 'vitest';
import { buildDeskFigure, DESK_WORKERS } from '../../src/components/anatomy/desk-figure';
import { DESK_NODES, DESK_PATHS, DESK_QUESTIONS } from '../../src/components/anatomy/desk-paths';
import { ELECTRODES, KEY_ROWS, MAX_TURN, MUSCLE_AT, SEMG_STATIONS, SPELLING_SINCE, STATION_SINCE, buildSemgFigure, hotSeat } from '../../src/components/anatomy/semg-figure';
import { FLAGSHIP_ZH } from '../../src/content/flagship-zh';

const count = (svg: string, needle: string): number => svg.split(needle).length - 1;

describe('buildSemgFigure', () => {
  const figure = buildSemgFigure();

  test('draws sixteen electrodes on the wrist and sixteen seats at the table', () => {
    expect(count(figure.svg, 'class="fig-pod')).toBe(ELECTRODES);
    expect(count(figure.svg, 'class="fig-seat"')).toBe(ELECTRODES);
    expect(count(figure.svg, 'fig-hot')).toBe(1);
  });

  test('lays the output out as a keyboard: one lettered block per key', () => {
    const letters = KEY_ROWS.join('');
    expect(count(figure.svg, 'class="fig-block"')).toBe(letters.length);
    for (const letter of letters) expect(figure.svg).toContain(`>${letter}</text>`);
  });

  test('gives every station something to click, and a stop on the track in order', () => {
    SEMG_STATIONS.forEach((_, index) => expect(figure.svg).toContain(`class="fig-station" data-station="${index}"`));
    expect(figure.stops).toHaveLength(SEMG_STATIONS.length);
    expect(figure.stops[0]).toBe(0);
    expect(figure.stops.at(-1)).toBe(1);
    expect([...figure.stops].sort((a, b) => a - b)).toEqual(figure.stops);
  });

  test('marks which version each machine arrives in, the spelling model last', () => {
    expect(figure.svg).toContain(`data-since="${SPELLING_SINCE}"`);
    expect(Math.max(...Object.values(STATION_SINCE))).toBeLessThan(SPELLING_SINCE);
    expect(FLAGSHIP_ZH.semg.versions.items).toHaveLength(SPELLING_SINCE + 1);
  });

  test('has copy for every station, in the order they stand on the bench', () => {
    expect(FLAGSHIP_ZH.semg.stations.map((station) => station.id)).toEqual([...SEMG_STATIONS]);
  });

  test('produces only finite coordinates', () => {
    expect(figure.svg).not.toMatch(/NaN|Infinity|undefined/);
  });
});

describe('hotSeat', () => {
  test('worn straight, the seat over the muscle is lit', () => {
    expect(hotSeat(0)).toBe(MUSCLE_AT);
  });

  test('each notch moves the signal exactly one seat, and wraps round the table', () => {
    for (let turn = -MAX_TURN; turn < MAX_TURN; turn += 1) {
      const moved = (hotSeat(turn) - hotSeat(turn + 1) + ELECTRODES) % ELECTRODES;
      expect(moved).toBe(1);
    }
    expect(hotSeat(MUSCLE_AT + 1)).toBe(ELECTRODES - 1);
  });
});

describe('buildDeskFigure', () => {
  const figure = buildDeskFigure();

  test('draws every station once, tagged with who does the work there', () => {
    for (const node of DESK_NODES) {
      expect(count(figure.svg, `data-node="${node}"`)).toBe(1);
      expect(DESK_WORKERS[node].length).toBeGreaterThan(0);
    }
  });

  test('has a resting place for every stop a question can make', () => {
    const visited = new Set(Object.values(DESK_PATHS).flatMap((path) => path.map((step) => step.node)));
    for (const node of visited) expect(figure.rests[node]).toBeDefined();
    expect(figure.rests.ask).toEqual([0, 0]);
  });

  test('produces only finite coordinates', () => {
    expect(figure.svg).not.toMatch(/NaN|Infinity|undefined/);
  });
});

describe('desk paths', () => {
  test('every question starts with the planner and ends with an answer', () => {
    for (const id of DESK_QUESTIONS) {
      expect(DESK_PATHS[id][0].node).toBe('plan');
      expect(DESK_PATHS[id].at(-1)?.node).toBe('answer');
    }
  });

  test('a failed check is always followed by another try, a stopped gate by an honest answer', () => {
    for (const id of DESK_QUESTIONS) {
      DESK_PATHS[id].forEach((step, index) => {
        if (!step.failed) return;
        const next = DESK_PATHS[id][index + 1]?.node;
        expect(next).toBe(step.node === 'verify' ? 'form' : 'answer');
      });
    }
  });

  test('numbers never reach the adding machine without passing the gates first', () => {
    for (const id of DESK_QUESTIONS) {
      const nodes = DESK_PATHS[id].map((step) => step.node);
      if (nodes.includes('compute')) expect(nodes.indexOf('gates')).toBeLessThan(nodes.indexOf('compute'));
    }
  });

  test('the copy tells one line per step, and agrees with the drawing about who does what', () => {
    const copy = FLAGSHIP_ZH.desk;
    for (const question of copy.follow.questions) expect(question.steps).toHaveLength(DESK_PATHS[question.id].length);
    expect(copy.stations.map((station) => station.id)).toEqual([...DESK_NODES]);
    for (const station of copy.stations) expect([...station.who]).toEqual([...DESK_WORKERS[station.id]]);
    expect(copy.groups.flatMap((group) => [...group.ids])).toEqual([...DESK_NODES]);
  });
});
