/** Returns the next focused station, null for overview, or undefined for an ignored key. */
export function nextGalleryFocus(
  key: string,
  positions: readonly number[],
  focusedPosition: number | null,
): number | null | undefined {
  if (key === 'ArrowUp') return null;
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return undefined;
  if (positions.length === 0) return undefined;

  if (focusedPosition === null) {
    return key === 'ArrowRight' ? positions[0] : positions[positions.length - 1];
  }

  const index = positions.indexOf(focusedPosition);
  if (index < 0) return undefined;
  const nextIndex = key === 'ArrowRight' ? index + 1 : index - 1;
  return positions[Math.max(0, Math.min(nextIndex, positions.length - 1))];
}
