import { STATIONS, findStop } from '../../lib/journey';
import type { StationId, Stop } from '../../lib/journey';
import { approach } from '../../lib/motion';
import {
  beginDrag,
  createRotation,
  dragBy,
  endDrag,
  isMoving,
  release,
  shortestDelta,
  step,
  travelTo,
} from '../../lib/rotation';
import type { RotationState } from '../../lib/rotation';
import { createGlobePainter, readPalette, toDotVectors } from './draw';
import { createProjector, invertPoint, lambdaForGrab, toUnitVector } from './sphere';
import type { GeoPoint, SphereView, UnitVector } from './sphere';

/** Sent to the stage when the story reaches a new stop; `detail.stop` is the stop's id. */
export const GLOBE_DOCK_EVENT = 'globe:dock';
export interface GlobeDockDetail {
  readonly stop: string;
}

const TILT_DEG = -38;
/**
 * Centred just west of the date line: the whole route is in view on first paint,
 * with Hangzhou far enough in from the limb to stand clear of the copy.
 */
const INITIAL_LAMBDA_DEG = 182;
const MAX_PIXEL_RATIO = 2;
const MAX_FRAME_S = 0.05;
const KEY_NUDGE_DEG = 7;
const KEY_NUDGE_FRAME_S = 1 / 30;
const WHEEL_DEG_PER_PIXEL = 0.12;
/** Time for the zoom to cover about two thirds of the way: quick to start, soft to land. */
const ZOOM_TIME_S = 0.45;
const ZOOM_SETTLED = 0.0005;
/** Labels fade out well before the limb, where they would bunch up and run under the copy. */
const LABEL_FADE_DEPTH = 0.22;
const LABEL_MIN_DEPTH = 0.2;
const NO_DRAG_SELECTOR = 'a, button, input, select, textarea, [data-no-drag]';
/** Individual blocks of copy that globe labels and pins must not run underneath. */
const KEEP_CLEAR_SELECTOR = '[data-globe-clear]';
const KEEP_CLEAR_MARGIN_PX = 14;
/** Rough half-width of a label, used to test where its text lands rather than its dot. */
const LABEL_REACH_PX = 36;
/** A label's far end, as a multiple of its reach: long enough for "Los Angeles". */
const LABEL_REACH_TO_END = 2.6;

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

function isStationId(value: string | undefined): value is StationId {
  return value !== undefined && value in STATIONS;
}


/**
 * Wires a canvas globe to its stage: sizing, the frame loop, drag / wheel / keyboard
 * takeover, and the station labels that ride along on top. Returns a cleanup function.
 */
export function mountGlobe(root: HTMLElement): () => void {
  const canvas = root.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  const stage = root.closest<HTMLElement>('[data-globe-stage]') ?? root;
  const anchor = stage.querySelector<HTMLElement>('[data-globe-anchor]');
  if (!canvas || !ctx || !anchor) return () => undefined;

  const labels = [...root.querySelectorAll<HTMLElement>('[data-station]')].flatMap((element) => {
    const id = element.dataset.station;
    if (!isStationId(id)) return [];
    const reach = STATIONS[id].labelSide === 'left' ? -LABEL_REACH_PX : LABEL_REACH_PX;
    return [{ element, reach, vector: toUnitVector(...STATIONS[id].lonLat) }];
  });
  // Pins are zero-size anchors moved onto a station; whatever they contain rides the globe.
  const pins = [...stage.querySelectorAll<HTMLElement>('[data-globe-pin]')].flatMap((element) => {
    const id = element.dataset.globePin;
    return isStationId(id) ? [{ element, vector: toUnitVector(...STATIONS[id].lonLat) }] : [];
  });
  const keepClear = [...stage.querySelectorAll<HTMLElement>(KEEP_CLEAR_SELECTOR)];
  const paint = createGlobePainter(ctx);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let rotation: RotationState = createRotation(INITIAL_LAMBDA_DEG, { auto: !reducedMotion.matches });
  let palette = readPalette(root);
  let dots: readonly UnitVector[] = [];
  let dotsRequested = false;
  let frame = { cx: 0, cy: 0, radius: 0 };
  let zoom = 1;
  let zoomTarget = 1;
  let litLegs: number | null = null;
  let current: StationId | null = null;
  let keepClearActive = true;
  let boxesStale = false;
  let clearBoxes: readonly Box[] = [];
  let pinExtents: readonly Box[] = [];
  let stageWidth = 0;
  let pixelRatio = 1;
  let needsPaint = true;
  let onScreen = true;
  let lastTime = performance.now();
  let rafId = 0;
  let drag: { pointerId: number; grabbed: GeoPoint; pointerX: number; time: number } | null = null;

  const view = (): SphereView => ({
    cx: frame.cx,
    cy: frame.cy,
    radius: frame.radius * zoom,
    lambdaDeg: rotation.lambda,
    tiltDeg: TILT_DEG,
  });
  const zooming = (): boolean => Math.abs(zoomTarget - zoom) > ZOOM_SETTLED;

  /** The night view's land dots are only fetched once a visitor actually sees night. */
  const ensureDots = (): void => {
    if (dotsRequested || palette.landMode !== 'dots') return;
    dotsRequested = true;
    import('./land-dots.json')
      .then((module) => {
        dots = toDotVectors(module.default);
        needsPaint = true;
      })
      .catch(() => {
        // Without the dots the night globe still shows its sphere, routes and stations.
        dotsRequested = false;
      });
  };

  /** The copy scrolls over the globe, so its boxes are re-read whenever the page moves. */
  const measureCopy = (): void => {
    const rootBox = root.getBoundingClientRect();
    clearBoxes = keepClearActive
      ? keepClear.flatMap((element) => {
          const box = element.getBoundingClientRect();
          if (box.bottom < rootBox.top || box.top > rootBox.bottom) return [];
          return [
            {
              left: box.left - rootBox.left - KEEP_CLEAR_MARGIN_PX,
              top: box.top - rootBox.top - KEEP_CLEAR_MARGIN_PX,
              right: box.right - rootBox.left + KEEP_CLEAR_MARGIN_PX,
              bottom: box.bottom - rootBox.top + KEEP_CLEAR_MARGIN_PX,
            },
          ];
        })
      : [];
    boxesStale = false;
  };

  const measure = (): void => {
    const rootBox = root.getBoundingClientRect();
    const anchorBox = anchor.getBoundingClientRect();
    pixelRatio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
    canvas.width = Math.round(rootBox.width * pixelRatio);
    canvas.height = Math.round(rootBox.height * pixelRatio);
    frame = {
      cx: anchorBox.left - rootBox.left + anchorBox.width / 2,
      cy: anchorBox.top - rootBox.top + anchorBox.height / 2,
      radius: anchorBox.width / 2,
    };
    stageWidth = rootBox.width;
    // Where the stage is a band of its own (narrow screens) nothing can run under the copy.
    keepClearActive = getComputedStyle(root).getPropertyValue('--globe-keep-clear').trim() !== '0';
    measureCopy();
    // How far each pin's contents reach from its anchor point, measured once per layout.
    pinExtents = pins.map(({ element }) => {
      const origin = element.getBoundingClientRect();
      const parts = [...element.children].map((child) => child.getBoundingClientRect());
      return {
        left: Math.min(0, ...parts.map((part) => part.left - origin.left)),
        top: Math.min(0, ...parts.map((part) => part.top - origin.top)),
        right: Math.max(0, ...parts.map((part) => part.right - origin.left)),
        bottom: Math.max(0, ...parts.map((part) => part.bottom - origin.top)),
      };
    });
    needsPaint = true;
  };

  const underCopy = (x: number, y: number): boolean =>
    clearBoxes.some((box) => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom);
  const overlapsCopy = (area: Box): boolean =>
    clearBoxes.some(
      (box) => area.left < box.right && area.right > box.left && area.top < box.bottom && area.bottom > box.top,
    );
  const fadeAtLimb = (depth: number): number => Math.min(1, Math.max(0, (depth - LABEL_MIN_DEPTH) / LABEL_FADE_DEPTH));

  const placeLabels = (): void => {
    const project = createProjector(view());
    for (const { element, reach, vector } of labels) {
      const point = project(vector);
      // A label is dropped where its text would run under the copy or off the edge of the stage.
      const textEnd = point.x + reach * LABEL_REACH_TO_END;
      const hidden =
        underCopy(point.x, point.y) || underCopy(point.x + reach, point.y) || textEnd < 0 || textEnd > stageWidth;
      element.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
      element.style.opacity = (hidden ? 0 : fadeAtLimb(point.depth)).toFixed(2);
    }

    pins.forEach(({ element, vector }, index) => {
      const point = project(vector);
      const extent = pinExtents[index];
      const hidden =
        extent !== undefined &&
        overlapsCopy({
          left: point.x + extent.left,
          top: point.y + extent.top,
          right: point.x + extent.right,
          bottom: point.y + extent.bottom,
        });
      element.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
      element.style.opacity = (hidden ? 0 : fadeAtLimb(point.depth)).toFixed(2);
    });
  };

  const render = (): void => {
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (boxesStale) measureCopy();
    if (frame.radius > 0) paint(view(), palette, dots, { litLegs, current, baseRadius: frame.radius });
    placeLabels();
    needsPaint = false;
  };

  const tick = (now: number): void => {
    const dt = Math.min(MAX_FRAME_S, (now - lastTime) / 1000);
    lastTime = now;
    if (onScreen && !document.hidden) {
      const wasMoving = isMoving(rotation) || zooming();
      rotation = step(rotation, dt);
      if (zooming()) {
        zoom = approach(zoom, zoomTarget, dt, ZOOM_TIME_S);
        // The globe is still closing in while held: keep the grabbed place under the pointer.
        if (drag) holdGrab(drag.pointerX, dt);
      } else {
        zoom = zoomTarget;
      }
      if (needsPaint || wasMoving || isMoving(rotation)) render();
    }
    rafId = requestAnimationFrame(tick);
  };

  const insideSphere = (event: MouseEvent): boolean => {
    const box = root.getBoundingClientRect();
    return Math.hypot(event.clientX - box.left - frame.cx, event.clientY - box.top - frame.cy) <= frame.radius * zoom;
  };
  const canGrab = (event: Event): boolean => !(event.target instanceof Element && event.target.closest(NO_DRAG_SELECTOR));
  const nudge = (deltaDeg: number): void => {
    rotation = endDrag(dragBy(beginDrag(rotation), deltaDeg, KEY_NUDGE_FRAME_S));
  };

  /** Turns the globe so the place that was grabbed sits under the pointer's x position. */
  const holdGrab = (pointerX: number, dt: number): void => {
    if (!drag) return;
    const deltaDeg = shortestDelta(rotation.lambda, lambdaForGrab(drag.grabbed, pointerX, view()));
    rotation = dragBy(rotation, deltaDeg, dt);
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !canGrab(event)) return;
    const box = root.getBoundingClientRect();
    const grabbed = invertPoint(view(), event.clientX - box.left, event.clientY - box.top);
    if (!grabbed) return;
    drag = { pointerId: event.pointerId, grabbed, pointerX: event.clientX - box.left, time: event.timeStamp };
    rotation = beginDrag(rotation);
    stage.setPointerCapture(event.pointerId);
    stage.dataset.grabbing = 'true';
  };
  const onPointerMove = (event: PointerEvent): void => {
    if (!drag) {
      stage.dataset.grabbable = String(canGrab(event) && insideSphere(event));
      return;
    }
    if (event.pointerId !== drag.pointerId) return;
    const pointerX = event.clientX - root.getBoundingClientRect().left;
    holdGrab(pointerX, Math.max(1 / 240, (event.timeStamp - drag.time) / 1000));
    drag = { ...drag, pointerX, time: event.timeStamp };
  };
  const onPointerUp = (event: PointerEvent): void => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag = null;
    rotation = endDrag(rotation);
    delete stage.dataset.grabbing;
  };
  const onWheel = (event: WheelEvent): void => {
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (!horizontal || !insideSphere(event)) return;
    event.preventDefault();
    nudge(-event.deltaX * WHEEL_DEG_PER_PIXEL);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    nudge(event.key === 'ArrowRight' ? KEY_NUDGE_DEG : -KEY_NUDGE_DEG);
  };
  /** Arriving at a stop: turn to its station and close in, or let the globe go back to turning freely. */
  const dock = (stop: Stop): void => {
    litLegs = stop.litLegs;
    current = stop.station;
    zoomTarget = stop.zoom;
    needsPaint = true;

    if (stop.station === null) {
      rotation = { ...release(rotation), autoEnabled: !reducedMotion.matches };
    } else {
      const target = -STATIONS[stop.station].lonLat[0];
      rotation = reducedMotion.matches
        ? { ...release(rotation), lambda: rotation.lambda + shortestDelta(rotation.lambda, target), mode: 'hold', autoEnabled: false }
        : { ...travelTo(rotation, target), autoEnabled: false };
    }
    // With reduced motion there is no flight between stops: the view simply changes.
    if (reducedMotion.matches) zoom = zoomTarget;
  };
  const onDock = (event: Event): void => {
    const detail: unknown = event instanceof CustomEvent ? event.detail : null;
    const id = typeof detail === 'object' && detail !== null && 'stop' in detail ? detail.stop : null;
    const stop = typeof id === 'string' ? findStop(id) : undefined;
    if (stop) dock(stop);
  };
  const onScroll = (): void => {
    boxesStale = true;
    needsPaint = true;
  };
  const onMotionPreference = (): void => {
    const free = current === null;
    rotation = {
      ...rotation,
      autoEnabled: free && !reducedMotion.matches,
      mode: reducedMotion.matches && rotation.mode === 'auto' ? 'rest' : rotation.mode,
    };
  };

  // Resizing a canvas clears it, so repaint in the same turn instead of flashing blank for a frame.
  const resizeObserver = new ResizeObserver(() => {
    measure();
    render();
  });
  resizeObserver.observe(root);
  resizeObserver.observe(anchor);
  const themeObserver = new MutationObserver(() => {
    palette = readPalette(root);
    ensureDots();
    needsPaint = true;
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // A pin's reach is unknown until its images have loaded.
  const pinImages = pins.flatMap(({ element }) => [...element.querySelectorAll('img')]);
  const onPinImageLoad = (): void => {
    measure();
    render();
  };
  for (const image of pinImages) image.addEventListener('load', onPinImageLoad);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true;
  });
  visibilityObserver.observe(root);

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener(GLOBE_DOCK_EVENT, onDock);
  window.addEventListener('scroll', onScroll, { passive: true });
  canvas.addEventListener('keydown', onKeyDown);
  reducedMotion.addEventListener('change', onMotionPreference);

  measure();
  ensureDots();
  render();
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    themeObserver.disconnect();
    visibilityObserver.disconnect();
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointercancel', onPointerUp);
    stage.removeEventListener('wheel', onWheel);
    stage.removeEventListener(GLOBE_DOCK_EVENT, onDock);
    window.removeEventListener('scroll', onScroll);
    canvas.removeEventListener('keydown', onKeyDown);
    reducedMotion.removeEventListener('change', onMotionPreference);
    for (const image of pinImages) image.removeEventListener('load', onPinImageLoad);
  };
}
