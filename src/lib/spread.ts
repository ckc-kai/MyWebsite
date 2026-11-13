/**
 * Marks `marked` out of `total` slots, spread as evenly as the counts allow.
 * Used to draw "N in every hundred" as a grid without clumping the marked cells together.
 */
export function spreadMarks(total: number, marked: number): boolean[] {
  const count = Math.max(0, Math.min(total, Math.round(marked)));
  return Array.from({ length: total }, (_, index) => Math.floor(((index + 1) * count) / total) > Math.floor((index * count) / total));
}
