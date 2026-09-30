import { describe, expect, it } from 'vitest';
import { estimateTextureMemoryBytes } from '../../src/config/textureMemory';

describe('estimateTextureMemoryBytes', () => {
  const expectedBytes = (count: number, resolution: number) =>
    ((count * 3 + 1) * resolution ** 2 +
      count * (512 * 128) +
      512 * 80 +
      1024 * 160 +
      1024 * 96) *
    4;

  it('estimates station surfaces, labels, signs, and the gallery backdrop', () => {
    expect(estimateTextureMemoryBytes({ count: 3, surfaceResolution: 128 })).toBe(
      expectedBytes(3, 128),
    );
  });

  it('scales with both configured artwork count and texture resolution', () => {
    const baseline = estimateTextureMemoryBytes({ count: 2, surfaceResolution: 64 });
    const increasedCount = estimateTextureMemoryBytes({
      count: 4,
      surfaceResolution: 64,
    });
    expect(increasedCount).toBeGreaterThan(baseline);
    expect(baseline).toBe(expectedBytes(2, 64));
    expect(increasedCount).toBe(expectedBytes(4, 64));
    expect(estimateTextureMemoryBytes({ count: 2, surfaceResolution: 128 })).toBe(
      expectedBytes(2, 128),
    );
  });
});
