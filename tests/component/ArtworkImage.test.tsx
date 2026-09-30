import ReactThreeTestRenderer from '@react-three/test-renderer';
import type { Mesh } from 'three';
import { describe, expect, it } from 'vitest';
import { Artwork } from '../../src/scene/Artwork';

describe('Artwork images', () => {
  it('uses the configured image source without changing source proportions', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Artwork
        color="#bf8063"
        imageAspectRatio={2}
        imageSrc="/artworks/quiet-orbit.svg"
        layoutX={0}
        number={7}
        onSelect={() => undefined}
        position={6}
      />,
    );
    const surface = renderer.scene.findByProps({ name: 'artwork-surface' });
    const geometry = (surface.instance as Mesh).geometry as Mesh['geometry'] & {
      parameters: { width: number; height: number };
    };

    expect(surface.instance.userData.imageSrc).toBe('/artworks/quiet-orbit.svg');
    expect(geometry.parameters.width / geometry.parameters.height).toBeCloseTo(2);
  });

  it('retains the configured color while an image is unavailable', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Artwork
        color="#bf8063"
        imageSrc="/artworks/missing.svg"
        layoutX={0}
        number={8}
        onSelect={() => undefined}
        position={7}
      />,
    );
    const surface = renderer.scene.findByProps({ name: 'artwork-surface' });
    const material = (surface.instance as Mesh).material as Mesh['material'] & {
      color: { getHexString(): string };
      map: unknown;
    };
    expect(material.color.getHexString()).toBe('bf8063');
    expect(material.map).toBeNull();
  });
});
