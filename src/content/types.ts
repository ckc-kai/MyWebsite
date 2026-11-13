/**
 * The shape of the site's copy. Each language (zh.ts / en.ts, flagship-zh.ts / flagship-en.ts) fills the
 * same shape, so a component never needs to know which language it is drawing, and a missing or extra
 * line in one language is a type error rather than a gap on the page.
 */
import type { DeskNode, DeskQuestion, Worker } from '../components/anatomy/desk-paths';
import type { SemgStation } from '../components/anatomy/semg-figure';
import type { WestLakeKey } from '../components/westlake/scenes';
import type { LegKind } from '../lib/journey';

export type Lang = 'zh' | 'en';

/** A run of text; `{ b }` marks the few words a skimming reader should catch. */
export type Rich = ReadonlyArray<string | { readonly b: string }>;

export interface SiteCopy {
  readonly name: string;
  /** The name in the other script, set small beside it. */
  readonly nameAlt: string;
  readonly nameAltLang: string;
  readonly title: string;
  readonly description: string;
  readonly motto: string;
  readonly mottoGloss: string;
  readonly navGlance: string;
  /** The link to the other language, in that language. */
  readonly navLanguage: string;
  readonly navLanguageShort: string;
  readonly navLanguageLang: string;
  readonly railLabel: string;
  readonly themeGroup: string;
  readonly themeDay: string;
  readonly themeNight: string;
  readonly globeLabel: string;
  /** What goes between the items of a short list, such as courses. */
  readonly listJoiner: string;
}

export interface WorkItem {
  readonly year: string;
  readonly who: string;
  readonly kind: LegKind;
  readonly href: string;
  readonly what: string;
  readonly how: Rich;
}

export interface OpeningCopy {
  /** Two highlights, two colours: yellow for deciding what right means, orange for building it. */
  readonly headline: {
    readonly before: string;
    readonly decided: string;
    readonly afterDecided?: string;
    readonly then: string;
    readonly built: string;
    readonly afterBuilt?: string;
  };
  readonly deck: string;
  readonly workTitle: string;
  readonly work: readonly WorkItem[];
  readonly depart: string;
  readonly glance: string;
  readonly legendStudy: string;
  readonly legendWork: string;
  readonly legendHint: string;
  readonly kidNote: string;
  readonly kidAlt: string;
}

export type PhotoKey = 'tennis' | 'elpaso' | 'uva' | 'grad1' | 'grad2' | 'ucla' | 'now' | 'sea' | 'camera' | 'hike';
export type MachineKey = 'report' | 'semg' | 'desk';
export type HobbyKey = 'tennis' | 'gym' | 'reading' | 'photo';
export type ContactKind = 'mail' | 'linkedin' | 'instagram';

export interface StationPhoto {
  readonly key: PhotoKey;
  readonly alt: string;
  readonly caption: string;
}

/** A paragraph to read. A project brings its own name as a small title. */
export interface Passage {
  readonly title?: string;
  readonly text: Rich;
}

/** A school, set like an entry on a transcript. */
export interface SchoolRecord {
  readonly degrees: readonly string[];
  readonly honors: Rich;
  readonly coursesLabel: string;
  readonly courses: readonly string[];
}

/** A piece of research, set like the first page of a paper. */
export interface PaperSheet {
  readonly venue: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly byline: string;
  readonly sections: ReadonlyArray<{ readonly head: string; readonly text: Rich }>;
  /** Odds ratios with their 95% intervals, drawn as a small forest plot. */
  readonly estimates?: ReadonlyArray<{ readonly label: string; readonly ratio: number; readonly low: number; readonly high: number }>;
  readonly estimatesCaption?: string;
}

export interface StationCopy {
  /** Matches a stop id in `lib/journey`. */
  readonly id: string;
  /** Short name for the rail at the top. */
  readonly rail: string;
  readonly kind: LegKind;
  readonly when: string;
  /** The job title or kind of work, where there is one. */
  readonly role?: string;
  readonly place: string;
  /** No punctuation in titles. */
  readonly title: string;
  readonly lead: Rich;
  /** On a wide screen the lead and each passage keep to one line apiece instead of wrapping. */
  readonly singleLines?: boolean;
  /** Ink sketches of the place, drawn at build time; the note is read out, not shown. */
  readonly sketches?: ReadonlyArray<{ readonly key: WestLakeKey; readonly name: string; readonly note: string }>;
  readonly sketchesLabel?: string;
  readonly school?: SchoolRecord;
  readonly passages?: readonly Passage[];
  readonly paper?: PaperSheet;
  readonly photos?: readonly StationPhoto[];
  readonly machine?: MachineKey;
  /** The one before-and-after worth stating next to a machine. */
  readonly result?: { readonly label: string; readonly from: string; readonly to: string };
  readonly contactTitle?: string;
  readonly contacts?: ReadonlyArray<{ readonly kind: ContactKind; readonly label: string; readonly value: string; readonly href?: string }>;
  readonly hobbiesTitle?: string;
  readonly hobbies?: ReadonlyArray<{ readonly key: HobbyKey; readonly label: string }>;
}

export interface JourneyCopy {
  readonly stations: readonly StationCopy[];
}

// ── The three flagship figures ──

export interface SemgStop {
  readonly id: SemgStation;
  readonly name: string;
  readonly text: string;
  readonly spec: string;
}

export interface SemgCopy {
  readonly title: string;
  readonly hint: string;
  readonly run: string;
  readonly stations: readonly SemgStop[];
  readonly turn: {
    readonly label: string;
    readonly left: string;
    readonly right: string;
    readonly reset: string;
    readonly homeElectrode: number;
    readonly straight: string;
    /** What turning the band did: `{n}` is how many notches, `{e}` the electrode the signal moved to. */
    readonly turned: { readonly one: string; readonly other: string };
  };
  readonly versions: {
    readonly label: string;
    readonly absent: string;
    readonly items: ReadonlyArray<{ readonly cer: number; readonly name: string; readonly what: string }>;
    /** The sentence around the number of wrong keys: before it, after it. */
    readonly blocks: readonly [string, string];
    readonly takeaway: string;
  };
  readonly scope: string;
}

export interface DeskStop {
  readonly id: DeskNode;
  readonly name: string;
  readonly who: readonly Worker[];
  readonly text: string;
  readonly spec?: string;
}

export interface DeskCopy {
  readonly title: string;
  readonly hint: string;
  readonly who: { readonly label: string; readonly all: string; readonly names: Readonly<Record<Worker, string>> };
  readonly groups: ReadonlyArray<{ readonly name: string; readonly ids: readonly DeskNode[] }>;
  readonly stations: readonly DeskStop[];
  readonly follow: {
    readonly label: string;
    readonly idle: string;
    readonly next: string;
    readonly replay: string;
    readonly passed: string;
    readonly failed: string;
    readonly questions: ReadonlyArray<{ readonly id: DeskQuestion; readonly tag: string; readonly text: string; readonly steps: readonly string[] }>;
  };
}

export interface ReportStage {
  readonly id: string;
  readonly name: string;
  readonly text: string;
  readonly points: readonly string[];
  readonly spec: string;
}

export interface ReportCopy {
  readonly title: string;
  readonly hint: string;
  readonly run: string;
  readonly pointsLabel: string;
  readonly stages: readonly ReportStage[];
  readonly schedule: string;
  readonly scheduleSpec: string;
}

export interface FlagshipCopy {
  readonly specLabel: string;
  readonly swipe: string;
  readonly semg: SemgCopy;
  readonly desk: DeskCopy;
  readonly report: ReportCopy;
}
