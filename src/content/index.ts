/** The copy for each language, behind one door: components ask for a language, never for a file. */
import { FLAGSHIP_EN } from './flagship-en';
import { FLAGSHIP_ZH } from './flagship-zh';
import { JOURNEY_EN, OPENING_EN, SITE_EN } from './en';
import { JOURNEY_ZH, OPENING_ZH, SITE_ZH } from './zh';
import type { FlagshipCopy, JourneyCopy, Lang, OpeningCopy, SiteCopy } from './types';

export type { Lang } from './types';

export interface Copy {
  readonly site: SiteCopy;
  readonly opening: OpeningCopy;
  readonly journey: JourneyCopy;
  readonly flagship: FlagshipCopy;
}

const COPY: Readonly<Record<Lang, Copy>> = {
  zh: { site: SITE_ZH, opening: OPENING_ZH, journey: JOURNEY_ZH, flagship: FLAGSHIP_ZH },
  en: { site: SITE_EN, opening: OPENING_EN, journey: JOURNEY_EN, flagship: FLAGSHIP_EN },
};

/** Where each language's page lives, relative to the site's base. */
export const PAGE_PATH: Readonly<Record<Lang, string>> = { zh: '', en: 'en/' };

/** The `lang` attribute for each page. */
export const HTML_LANG: Readonly<Record<Lang, string>> = { zh: 'zh-CN', en: 'en-US' };

export function copyFor(lang: Lang): Copy {
  return COPY[lang];
}

/** The other language: the one the header links to. */
export function otherLang(lang: Lang): Lang {
  return lang === 'zh' ? 'en' : 'zh';
}
