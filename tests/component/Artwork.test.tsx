import ReactThreeTestRenderer from '@react-three/test-renderer';
import type { Mesh } from 'three';
import { describe, expect, it } from 'vitest';
import { Artwork } from '../../src/scene/Artwork';

describe('Artwork', () => {
  it('renders the configured number, color, and frame', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Artwork
        color="#bf8063"
        layoutX={-6}
        number={7}
        onSelect={() => undefined}
        position={6}
      />,
    );

    const artwork = renderer.scene.findByProps({ name: 'artwork-surface' });
    const frame = renderer.scene.findByProps({ name: 'artwork-frame' });

    expect(artwork.instance.userData.stationNumber).toBe(7);
    expect((artwork.instance as Mesh).material).toBeDefined();
    expect(
      (
        (artwork.instance as Mesh).material as Mesh['material'] & {
          color: { getHexString(): string };
        }
      ).color.getHexString(),
    ).toBe('bf8063');
    expect((frame.instance as Mesh).geometry.type).toBe('BoxGeometry');
  });
});
