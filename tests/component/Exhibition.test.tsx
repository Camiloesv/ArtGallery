import ReactThreeTestRenderer from '@react-three/test-renderer';
import { MeshStandardMaterial, type Mesh } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Exhibition } from '../../src/scene/Exhibition';
import { starterExhibition } from '../../src/config/exhibition';

describe('Exhibition', () => {
  it('renders 25 starter paintings with their distinct white wall shades', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={starterExhibition} onSelect={() => undefined} />,
    );
    const artworks = renderer.scene.findAllByProps({ name: 'artwork-surface' });
    const walls = renderer.scene.findAllByProps({ name: 'wall-panel' });
    const wallColours = walls.map((wall) =>
      ((wall.instance as Mesh).material as MeshStandardMaterial).color.getHexString(),
    );
    const isWhiteShade = (colour: string) =>
      colour.match(/.{2}/g)!.every((channel) => Number.parseInt(channel, 16) >= 224);

    expect(artworks).toHaveLength(25);
    expect(wallColours).toHaveLength(25);
    expect(new Set(wallColours).size).toBe(25);
    expect(wallColours.every(isWhiteShade)).toBe(true);
  });

  it('shows overview signs and hides them when an artwork is focused', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={starterExhibition} onSelect={() => undefined} />,
    );

    const title = renderer.scene.findByProps({ name: 'gallery-title' });
    const instructions = renderer.scene.findByProps({ name: 'arrow-instructions' });
    expect(title.instance.userData).toMatchObject({
      text: 'C1 Art Gallery',
      style: 'neon',
    });
    expect(
      ((title.instance as Mesh).material as MeshStandardMaterial).map?.userData,
    ).toMatchObject({ labelText: 'C1 Art Gallery', style: 'neon-title' });
    expect(instructions.instance.userData).toMatchObject({
      text: '← / → Browse artworks   ↑ Return to overview',
    });
    expect(
      ((instructions.instance as Mesh).material as MeshStandardMaterial).map?.userData,
    ).toMatchObject({
      labelText: '← / → Browse artworks   ↑ Return to overview',
      style: 'instructions',
    });

    await renderer.update(
      <Exhibition
        config={starterExhibition}
        focusedPosition={starterExhibition.stations[0]!.position}
        onSelect={() => undefined}
      />,
    );

    expect(() => renderer.scene.findByProps({ name: 'gallery-title' })).toThrow();
    expect(() => renderer.scene.findByProps({ name: 'arrow-instructions' })).toThrow();
  });

  it('scales overview signs down to fit a narrow viewport', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={starterExhibition} onSelect={() => undefined} />,
      { width: 390, height: 844 },
    );
    const signs = renderer.scene.findByProps({ name: 'overview-signs' });

    expect(signs.instance.scale.x).toBeLessThan(1);
  });

  it('keeps overview signs centred above the visible section while panning', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition
        config={starterExhibition}
        overviewOffset={5}
        onSelect={() => undefined}
      />,
    );
    const signs = renderer.scene.findByProps({ name: 'overview-signs' });

    expect(signs.instance.position.x).toBe(5);
  });

  it('mounts the generated black-to-grey backdrop behind the gallery', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={starterExhibition} onSelect={() => undefined} />,
    );
    const backdrop = renderer.scene.findByProps({ name: 'gallery-backdrop' });
    const material = (backdrop.instance as Mesh).material as MeshStandardMaterial;

    expect(material.map?.userData).toMatchObject({
      kind: 'gallery-backdrop',
      gradientStops: ['#777777', '#050505'],
    });
    expect(backdrop.instance.position.z).toBeLessThan(
      renderer.scene.findAllByProps({ name: 'wall-panel-group' })[0]!.instance.position.z,
    );
  });

  it('renders exactly the configured number of artworks', async () => {
    const config = structuredClone(starterExhibition);
    config.count = 5;
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={config} onSelect={() => undefined} />,
    );

    expect(renderer.scene.findAllByProps({ name: 'artwork-surface' })).toHaveLength(5);
  });

  it('does not select an artwork after a horizontal pan gesture', async () => {
    const onSelect = vi.fn();
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={starterExhibition} onSelect={onSelect} />,
    );
    const artwork = renderer.scene.findAllByProps({ name: 'artwork' })[0]!;

    await renderer.fireEvent(artwork, 'click', { delta: 18, stopPropagation: vi.fn() });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('updates the rendered count when configuration changes', async () => {
    const config = structuredClone(starterExhibition);
    config.count = 3;
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={config} onSelect={() => undefined} />,
    );
    const expanded = { ...config, count: 6 };
    await renderer.update(<Exhibition config={expanded} onSelect={() => undefined} />);

    expect(renderer.scene.findAllByProps({ name: 'artwork-surface' })).toHaveLength(6);
  });

  it('keeps numbering contiguous when the configured count grows and shrinks', async () => {
    const config = structuredClone(starterExhibition);
    config.count = 3;
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={config} onSelect={() => undefined} />,
    );
    const numbers = () =>
      renderer.scene
        .findAllByProps({ name: 'artwork-surface' })
        .map((surface) => surface.instance.userData.stationNumber);
    const memoryEstimate = () =>
      renderer.scene.findByProps({ name: 'texture-memory-plaque' }).instance.userData
        .estimatedBytes;

    expect(numbers()).toEqual([1, 2, 3]);
    expect(memoryEstimate()).toBe(
      ((3 * 3 + 1) * 512 ** 2 + 3 * (512 * 128) + 512 * 80 + 1024 * 160 + 1024 * 96) * 4,
    );
    await renderer.update(
      <Exhibition config={{ ...config, count: 5 }} onSelect={() => undefined} />,
    );
    expect(numbers()).toEqual([1, 2, 3, 4, 5]);
    expect(memoryEstimate()).toBe(
      ((5 * 3 + 1) * 512 ** 2 + 5 * (512 * 128) + 512 * 80 + 1024 * 160 + 1024 * 96) * 4,
    );
    await renderer.update(
      <Exhibition config={{ ...config, count: 2 }} onSelect={() => undefined} />,
    );
    expect(numbers()).toEqual([1, 2]);
    expect(memoryEstimate()).toBe(
      ((2 * 3 + 1) * 512 ** 2 + 2 * (512 * 128) + 512 * 80 + 1024 * 160 + 1024 * 96) * 4,
    );
  });

  it('derives even horizontal positions from configured spacing', async () => {
    const config = structuredClone(starterExhibition);
    config.count = 3;
    config.spacing = 3.2;
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={config} onSelect={() => undefined} />,
    );
    const artworks = renderer.scene.findAllByProps({ name: 'artwork-surface' });
    const centers = artworks.map((item) => item.parent!.instance.position.x);

    expect(centers).toEqual([-3.2, 0, 3.2]);
  });

  it('renders each station wall with its own colour and finish', async () => {
    const config = structuredClone(starterExhibition);
    config.count = 2;
    config.stations[0]!.wall.color = '#123456';
    config.stations[0]!.wall.finish = 'concrete';
    config.stations[1]!.wall.color = '#654321';
    config.stations[1]!.wall.finish = 'slate';
    const renderer = await ReactThreeTestRenderer.create(
      <Exhibition config={config} onSelect={() => undefined} />,
    );
    const walls = renderer.scene.findAllByProps({ name: 'wall-panel' });
    const materials = walls.map(
      (wall) => (wall.instance as Mesh).material as MeshStandardMaterial,
    );

    expect(materials.map((material) => material.color.getHexString())).toEqual([
      '123456',
      '654321',
    ]);
    expect(materials.map((material) => material.map?.userData.finish)).toEqual([
      'concrete',
      'slate',
    ]);
  });
});
