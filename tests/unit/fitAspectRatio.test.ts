import { describe, expect, it } from 'vitest';
import { fitAspectRatio } from '../../src/surfaces/fitAspectRatio';

describe('fitAspectRatio', () => {
  it('letterboxes a wider image without changing its proportions', () => {
    const fit = fitAspectRatio(2, 1);
    expect(fit.widthScale).toBe(1);
    expect(fit.heightScale).toBe(0.5);
  });

  it('letterboxes a taller image without changing its proportions', () => {
    const fit = fitAspectRatio(0.5, 1);
    expect(fit.widthScale).toBe(0.5);
    expect(fit.heightScale).toBe(1);
  });

  it('rejects invalid dimensions', () => {
    expect(() => fitAspectRatio(0, 1)).toThrow('Image aspect ratio must be positive.');
  });
});
