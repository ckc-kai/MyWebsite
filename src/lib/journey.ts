/** The route, as data. Everything the globe draws comes from here. */

export type StationId = 'HZ' | 'ELP' | 'VA' | 'CD' | 'LA' | 'SD';
export type LegKind = 'study' | 'work';
export type LabelSide = 'left' | 'right';

export interface Station {
  readonly id: StationId;
  /** [longitude, latitude] in degrees. */
  readonly lonLat: readonly [number, number];
  readonly name: { readonly zh: string; readonly en: string };
  /** Which side of the dot the label sits on, chosen so neighbours don't collide. */
  readonly labelSide: LabelSide;
  /** Stations too close to a neighbour at globe scale keep their dot but drop the label. */
  readonly showLabel: boolean;
}

export interface Leg {
  readonly from: StationId;
  readonly to: StationId;
  readonly kind: LegKind;
}

export const STATIONS: Readonly<Record<StationId, Station>> = {
  HZ: { id: 'HZ', lonLat: [120.15, 30.27], name: { zh: '杭州', en: 'Hangzhou' }, labelSide: 'left', showLabel: true },
  ELP: { id: 'ELP', lonLat: [-106.49, 31.76], name: { zh: 'El Paso', en: 'El Paso' }, labelSide: 'right', showLabel: true },
  VA: { id: 'VA', lonLat: [-78.6, 38.02], name: { zh: 'Virginia', en: 'Virginia' }, labelSide: 'right', showLabel: true },
  CD: { id: 'CD', lonLat: [104.07, 30.57], name: { zh: '成都', en: 'Chengdu' }, labelSide: 'left', showLabel: true },
  LA: { id: 'LA', lonLat: [-118.44, 34.07], name: { zh: 'Los Angeles', en: 'Los Angeles' }, labelSide: 'left', showLabel: true },
  SD: { id: 'SD', lonLat: [-117.16, 32.72], name: { zh: 'San Diego', en: 'San Diego' }, labelSide: 'right', showLabel: false },
};

/**
 * Chronological. Shaoxing (2024) sits on top of Hangzhou at this scale, so it shares its dot;
 * that summer was a round trip from Virginia, drawn once.
 */
export const LEGS: readonly Leg[] = [
  { from: 'HZ', to: 'ELP', kind: 'study' },
  { from: 'ELP', to: 'VA', kind: 'study' },
  { from: 'VA', to: 'HZ', kind: 'work' },
  { from: 'VA', to: 'CD', kind: 'work' },
  { from: 'CD', to: 'LA', kind: 'study' },
  { from: 'LA', to: 'SD', kind: 'work' },
];

/** A stop is one screen of the story: where the globe docks, how close, and how much road is lit. */
export interface Stop {
  readonly id: string;
  /** The station brought to the centre, or null to let the globe turn freely. */
  readonly station: StationId | null;
  readonly zoom: number;
  /** How many legs, counted from the start, have been travelled. Null lights the whole route. */
  readonly litLegs: number | null;
}

export const STOPS: readonly Stop[] = [
  { id: 'top', station: null, zoom: 1, litLegs: null },
  { id: 'hangzhou', station: 'HZ', zoom: 1.45, litLegs: 0 },
  { id: 'el-paso', station: 'ELP', zoom: 1.45, litLegs: 1 },
  { id: 'miller', station: 'VA', zoom: 1.6, litLegs: 2 },
  { id: 'uva', station: 'VA', zoom: 1.6, litLegs: 2 },
  { id: 'shaoxing', station: 'HZ', zoom: 1.7, litLegs: 3 },
  { id: 'chengdu', station: 'CD', zoom: 1.6, litLegs: 4 },
  { id: 'ucla', station: 'LA', zoom: 1.6, litLegs: 5 },
  { id: 'semg', station: 'LA', zoom: 1.6, litLegs: 5 },
  // Los Angeles and San Diego are a degree and a half apart: only a close view separates them.
  { id: 'sdge', station: 'SD', zoom: 2.4, litLegs: 6 },
  { id: 'next', station: null, zoom: 1, litLegs: null },
];

export function findStop(id: string | undefined): Stop | undefined {
  return STOPS.find((stop) => stop.id === id);
}
