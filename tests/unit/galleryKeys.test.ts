import { describe, expect, it } from 'vitest';
import { nextGalleryFocus } from '../../src/navigation/galleryKeys';

describe('nextGalleryFocus', () => {
  const positions = [4, 8, 12];

  it('enters from overview at the first or last artwork', () => {
    expect(nextGalleryFocus('ArrowRight', positions, null)).toBe(4);
    expect(nextGalleryFocus('ArrowLeft', positions, null)).toBe(12);
  });

  it('moves to adjacent artwork and clamps at row ends', () => {
    expect(nextGalleryFocus('ArrowRight', positions, 8)).toBe(12);
    expect(nextGalleryFocus('ArrowLeft', positions, 8)).toBe(4);
    expect(nextGalleryFocus('ArrowLeft', positions, 4)).toBe(4);
    expect(nextGalleryFocus('ArrowRight', positions, 12)).toBe(12);
  });

  it('returns to overview with ArrowUp', () => {
    expect(nextGalleryFocus('ArrowUp', positions, 8)).toBeNull();
  });

  it('ignores other keys and empty exhibitions', () => {
    expect(nextGalleryFocus('ArrowDown', positions, 8)).toBeUndefined();
    expect(nextGalleryFocus('ArrowRight', [], null)).toBeUndefined();
  });
});
