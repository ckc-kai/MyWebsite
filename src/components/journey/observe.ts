import { GLOBE_DOCK_EVENT } from '../globe/mount';
import type { GlobeDockDetail } from '../globe/mount';

/** A stop becomes current when it crosses the middle of the viewport. */
const MIDLINE_MARGIN = '-50% 0px -50% 0px';

/**
 * Follows the reader down the page: marks the current stop on the stage and the rail,
 * and tells the globe where to dock. Returns a cleanup function.
 */
/** On a phone the rail is a strip that scrolls sideways; bring the current stop to its middle. */
function keepInView(link: HTMLElement): void {
  const strip = link.closest<HTMLElement>('nav');
  if (!strip || strip.scrollWidth <= strip.clientWidth) return;
  const stripBox = strip.getBoundingClientRect();
  const linkBox = link.getBoundingClientRect();
  const offset = linkBox.left - stripBox.left - (stripBox.width - linkBox.width) / 2;
  strip.scrollTo({ left: strip.scrollLeft + offset, behavior: 'smooth' });
}

export function observeJourney(stage: HTMLElement): () => void {
  const stops = [...stage.querySelectorAll<HTMLElement>('[data-stop]')];
  const railLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-rail]')];
  const boards = [...stage.querySelectorAll<HTMLElement>('[data-prints-for]')];

  const arrive = (id: string, layout: string | undefined): void => {
    if (stage.dataset.active === id) return;
    stage.dataset.active = id;
    // Where a machine takes the floor, the globe steps back behind it.
    stage.dataset.quiet = String(layout === 'machine');
    // Only the stop being read lays its photographs on the globe.
    for (const board of boards) board.toggleAttribute('data-shown', board.dataset.printsFor === id);

    const position = railLinks.findIndex((link) => link.dataset.rail === id);
    railLinks.forEach((link, index) => {
      // Everything up to and including where the reader is has been reached.
      link.parentElement?.toggleAttribute('data-reached', position >= 0 && index <= position);
      if (index === position) {
        link.setAttribute('aria-current', 'true');
        keepInView(link);
      } else {
        link.removeAttribute('aria-current');
      }
    });
    stage.dispatchEvent(new CustomEvent<GlobeDockDetail>(GLOBE_DOCK_EVENT, { detail: { stop: id } }));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target instanceof HTMLElement ? entry.target.dataset.stop : undefined;
        if (entry.isIntersecting && id) arrive(id, entry.target instanceof HTMLElement ? entry.target.dataset.layout : undefined);
      }
    },
    { rootMargin: MIDLINE_MARGIN },
  );
  for (const stop of stops) observer.observe(stop);

  return () => observer.disconnect();
}
