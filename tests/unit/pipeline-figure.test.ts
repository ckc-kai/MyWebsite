import { describe, expect, test } from 'vitest';
import { buildPipelineFigure } from '../../src/components/anatomy/pipeline-figure';
import { FLAGSHIP_ZH } from '../../src/content/flagship-zh';

describe('buildPipelineFigure', () => {
  const figure = buildPipelineFigure();

  test('draws one station, front and back, for every stage in the copy', () => {
    const stages = FLAGSHIP_ZH.report.stages.length;
    for (let index = 0; index < stages; index += 1) {
      expect(figure.svg.split(`class="fig-station" data-station="${index}"`).length - 1).toBe(2);
    }
    expect(figure.stops).toHaveLength(stages);
  });

  test('stops come in order along the belt, all within its length', () => {
    figure.stops.forEach((stop, index) => {
      expect(stop).toBeGreaterThan(0);
      expect(stop).toBeLessThan(1);
      if (index > 0) expect(stop).toBeGreaterThan(figure.stops[index - 1]);
    });
  });

  test('a sheet travelling the belt moves down and to the right on screen', () => {
    expect(figure.travel[0]).toBeGreaterThan(0);
    expect(figure.travel[1]).toBeGreaterThan(0);
  });

  test('draws the pipe that carries the score back to the writer', () => {
    expect(figure.svg.split('fig-loop').length - 1).toBe(1);
  });

  test('produces only finite coordinates', () => {
    expect(figure.svg).not.toMatch(/NaN|Infinity|undefined/);
  });
});
