export function getOverviewPanBounds(
  count: number,
  spacing: number,
): { min: number; max: number } {
  const furthestStation = (Math.max(count, 1) - 1) * spacing * 0.5;
  return { min: -furthestStation, max: furthestStation };
}

export function getOverviewPanOffset(
  currentOffset: number,
  pointerDeltaX: number,
  viewportWidth: number,
  canvasWidth: number,
  minimum: number,
  maximum: number,
): number {
  const worldUnitsPerPixel = viewportWidth / Math.max(canvasWidth, 1);
  const nextOffset = currentOffset - pointerDeltaX * worldUnitsPerPixel;
  return Math.max(minimum, Math.min(nextOffset, maximum));
}

export function hasOverviewPanStarted(
  pointerStartX: number,
  pointerX: number,
  threshold = 6,
): boolean {
  // Ignore tiny finger and mouse movements so a tap remains a selection.
  return Math.abs(pointerX - pointerStartX) >= threshold;
}
