import { describe, expect, it } from 'vitest';
import {
  getOverviewPanBounds,
  getOverviewPanOffset,
  hasOverviewPanStarted,
} from '../../src/navigation/overviewPan';

describe('overview pan', () => {
  it('derives both pan endpoints from the active count and spacing', () => {
    const fullRow = getOverviewPanBounds(25, 2.55);
    expect(fullRow.min).toBeCloseTo(-30.6);
    expect(fullRow.max).toBeCloseTo(30.6);

    const shortRow = getOverviewPanBounds(3, 3.2);
    expect(shortRow.min).toBeCloseTo(-3.2);
    expect(shortRow.max).toBeCloseTo(3.2);

    expect(getOverviewPanBounds(1, 3.2)).toEqual({ min: -0, max: 0 });
  });

  it('moves the camera opposite the horizontal pointer drag', () => {
    expect(getOverviewPanOffset(0, -100, 16, 800, -20, 20)).toBe(2);
  });

  it('clamps the camera offset to both ends of the exhibition', () => {
    expect(getOverviewPanOffset(9, -1600, 16, 800, -10, 10)).toBe(10);
    expect(getOverviewPanOffset(-9, 1600, 16, 800, -10, 10)).toBe(-10);
  });

  it('leaves the camera in place when there is no horizontal movement', () => {
    expect(getOverviewPanOffset(3, 0, 16, 800, -10, 10)).toBe(3);
  });

  it('distinguishes a tap from a horizontal drag using a six-pixel threshold', () => {
    expect(hasOverviewPanStarted(100, 105)).toBe(false);
    expect(hasOverviewPanStarted(100, 106)).toBe(true);
    expect(hasOverviewPanStarted(100, 94)).toBe(true);
  });
});
