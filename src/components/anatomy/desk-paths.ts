/** The stations of the SDG&E question desk, who does the work at each, and the way each example question takes through them. */

export const DESK_NODES = ['pdf', 'sheet', 'cards', 'store', 'ask', 'plan', 'find', 'docs', 'form', 'gates', 'compute', 'verify', 'answer', 'eval'] as const;
export type DeskNode = (typeof DESK_NODES)[number];

export const WORKERS = ['model', 'code', 'human'] as const;
export type Worker = (typeof WORKERS)[number];

export interface DeskStep {
  node: DeskNode;
  /** A check that turns the question back, or a gate that stops it. */
  failed?: boolean;
}

const step = (node: DeskNode, failed = false): DeskStep => (failed ? { node, failed } : { node });

export const DESK_PATHS = {
  define: [step('plan'), step('find'), step('docs'), step('verify'), step('answer')],
  followup: [step('plan'), step('find'), step('form'), step('gates'), step('compute'), step('verify'), step('answer')],
  compare: [step('plan'), step('find'), step('form'), step('gates'), step('compute'), step('verify', true), step('form'), step('compute'), step('verify'), step('answer')],
  tamper: [step('plan'), step('find'), step('form'), step('gates', true), step('answer')],
} satisfies Record<string, readonly DeskStep[]>;

export type DeskQuestion = keyof typeof DESK_PATHS;
export const DESK_QUESTIONS = Object.keys(DESK_PATHS) as DeskQuestion[];
