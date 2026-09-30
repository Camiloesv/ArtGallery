import ReactThreeTestRenderer from '@react-three/test-renderer';
import type { Mesh } from 'three';
import { DataTexture, MeshStandardMaterial, TextureLoader, type Texture } from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Wall } from '../../src/scene/Wall';
import { generateSurface } from '../../src/surfaces/generateSurface';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Wall', () => {
  it('uses its configured color, roughness, and generated finish texture', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Wall
        config={{ color: '#abc123', finish: 'concrete', roughness: 0.7 }}
        position={[0, 0, 0]}
        texture={generateSurface('concrete', 64)}
      />,
    );
    const wall = renderer.scene.findByProps({ name: 'wall-panel' });
    const material = (wall.instance as Mesh).material as Mesh['material'] & {
      color: { getHexString(): string };
      roughness: number;
      map: { userData: { finish?: string } };
    };

    expect(material.color.getHexString()).toBe('abc123');
    expect(material.roughness).toBe(0.7);
    expect(material.map.userData.finish).toBe('concrete');
  });

  it('overlays a configured image without stretching and keeps its generated finish below it', async () => {
    const image = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    const loaderImage = image as unknown as Texture<HTMLImageElement>;
    const texture = generateSurface('slate', 64);
    vi.stubGlobal('document', {});
    vi.spyOn(TextureLoader.prototype, 'load').mockImplementation((_source, onLoad) => {
      onLoad?.(loaderImage);
      return loaderImage;
    });
    const renderer = await ReactThreeTestRenderer.create(
      <Wall
        config={{
          color: '#abc123',
          finish: 'slate',
          imageSrc: '/walls/featured.svg',
          imageAspectRatio: 2,
          roughness: 0.7,
        }}
        position={[0, 0, 0]}
        texture={texture}
      />,
    );
    const panel = renderer.scene.findByProps({ name: 'wall-panel' });
    const imagePanel = renderer.scene.findByProps({ name: 'wall-image' });
    const baseMaterial = (panel.instance as Mesh).material as MeshStandardMaterial;
    const imageGeometry = (imagePanel.instance as Mesh).geometry as Mesh['geometry'] & {
      parameters: { width: number; height: number };
    };
    const imageMaterial = (imagePanel.instance as Mesh).material as MeshStandardMaterial;

    expect(panel.instance.userData.imageSrc).toBe('/walls/featured.svg');
    expect(baseMaterial.map?.userData.finish).toBe('slate');
    expect(imageGeometry.parameters.width / imageGeometry.parameters.height).toBeCloseTo(
      2,
    );
    expect(imageMaterial.map).toBe(image);
  });
});
