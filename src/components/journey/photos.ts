/** The photographs the stops show, and how a group of them is laid out as prints. */
import type { ImageMetadata } from 'astro';
import camera from '../../assets/photos/camera.jpg';
import elpaso from '../../assets/photos/elpaso.jpg';
import grad1 from '../../assets/photos/grad1.jpg';
import grad2 from '../../assets/photos/grad2.jpg';
import hike from '../../assets/photos/hike.jpg';
import now from '../../assets/photos/now.jpg';
import sea from '../../assets/photos/sea.jpg';
import tennis from '../../assets/photos/tennis.jpg';
import ucla from '../../assets/photos/ucla.jpg';
import uva from '../../assets/photos/uva.jpg';
import type { PhotoKey, StationPhoto } from '../../content/zh';

const PHOTOS: Record<PhotoKey, ImageMetadata> = { tennis, elpaso, uva, grad1, grad2, ucla, now, sea, camera, hike };
/** Prints lean a little, each its own way, so a group of them never looks stamped. */
const TILTS_DEG = [-2.2, 1.8, -1.2, 2.4];
/** Within this ratio of width to height a photo counts as square. */
const SQUARE_TOLERANCE = 0.08;

export type PrintShape = 'landscape' | 'portrait' | 'square';

export interface PrintItem extends StationPhoto {
  readonly src: ImageMetadata;
  readonly tilt: number;
  readonly shape: PrintShape;
}

/**
 * Reading `width` straight off an image import makes Astro ship the full-size original next to the
 * resized prints (about 3 MB that no page ever asks for). Its `clone` is a plain copy that doesn't.
 */
function sizeOf(image: ImageMetadata): Pick<ImageMetadata, 'width' | 'height'> {
  return (image as ImageMetadata & { clone?: ImageMetadata }).clone ?? image;
}

function shapeOf(image: ImageMetadata): PrintShape {
  const { width, height } = sizeOf(image);
  const ratio = width / height;
  if (Math.abs(ratio - 1) <= SQUARE_TOLERANCE) return 'square';
  return ratio > 1 ? 'landscape' : 'portrait';
}

export function printsFor(photos: readonly StationPhoto[] = []): PrintItem[] {
  return photos.map((photo, index) => {
    const src = PHOTOS[photo.key];
    return { ...photo, src, tilt: TILTS_DEG[index % TILTS_DEG.length], shape: shapeOf(src) };
  });
}
