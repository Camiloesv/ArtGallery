import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  generateGalleryBackdrop,
  generateSurface,
} from '../../src/surfaces/generateSurface';

const drawCalls: string[] = [];
const addColorStop = vi.fn((offset: number, color: string) => {
  drawCalls.push(`colorStop:${offset}:${color}`);
});
const context = {
  beginPath: vi.fn(() => drawCalls.push('beginPath')),
  fill: vi.fn(() => drawCalls.push('fill')),
  fillRect: vi.fn(() => drawCalls.push('fillRect')),
  lineTo: vi.fn(() => drawCalls.push('lineTo')),
  moveTo: vi.fn(() => drawCalls.push('moveTo')),
  set fillStyle(value: string) {
    drawCalls.push(`fillStyle:${value}`);
  },
  createRadialGradient: vi.fn(() => ({ addColorStop })),
  set strokeStyle(value: string) {
    drawCalls.push(`strokeStyle:${value}`);
  },
  stroke: vi.fn(() => drawCalls.push('stroke')),
  strokeRect: vi.fn(() => drawCalls.push('strokeRect')),
  set lineWidth(value: number) {
    drawCalls.push(`lineWidth:${value}`);
  },
};

function installCanvas() {
  vi.stubGlobal('document', {
    createElement: vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    })),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  drawCalls.length = 0;
  vi.clearAllMocks();
});

describe('generateSurface', () => {
  it('creates a black-to-grey gallery backdrop at the requested resolution', () => {
    installCanvas();

    const texture = generateGalleryBackdrop(128);

    expect((texture.image as { width: number }).width).toBe(128);
    expect((texture.image as { height: number }).height).toBe(128);
    expect(drawCalls).toContain('colorStop:0:#777777');
    expect(drawCalls).toContain('colorStop:1:#050505');
    expect(texture.userData).toMatchObject({
      kind: 'gallery-backdrop',
      gradientStops: ['#777777', '#050505'],
    });
  });

  it('creates distinct named finishes at the configured resolution', () => {
    installCanvas();
    const finishes = ['plaster', 'concrete', 'limewash', 'slate'];
    const textures = finishes.map((finish) => generateSurface(finish, 128));

    expect(textures).toHaveLength(4);
    expect(
      textures.every((texture) => (texture.image as { width: number }).width === 128),
    ).toBe(true);
    expect(
      textures.every((texture) => (texture.image as { height: number }).height === 128),
    ).toBe(true);
    expect(
      new Set(drawCalls.filter((call) => call.startsWith('fillStyle:'))).size,
    ).toBeGreaterThan(1);
  });

  it('uses a matte fallback for an unknown finish', () => {
    installCanvas();

    expect(() => generateSurface('unlisted', 64)).not.toThrow();
    expect(drawCalls).toContain('fillStyle:#e8e0d3');
  });
});
