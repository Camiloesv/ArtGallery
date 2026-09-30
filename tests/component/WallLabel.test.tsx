import ReactThreeTestRenderer from '@react-three/test-renderer';
import type { Mesh } from 'three';
import { describe, expect, it } from 'vitest';
import { WallLabel } from '../../src/scene/WallLabel';

describe('WallLabel', () => {
  it('carries configured number and artwork metadata into the scene', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <WallLabel
        artist="Mara Velez"
        number={7}
        title="After the Rain"
        year={2019}
        position={[0, 0, 0]}
      />,
    );
    const label = renderer.scene.findByProps({ name: 'wall-label' });

    expect(label.instance.userData.labelText).toEqual([
      '07',
      'After the Rain',
      'Mara Velez',
      '2019',
    ]);
    expect(
      (
        (label.instance as Mesh).material as Mesh['material'] & {
          map: { userData: { labelText: string } };
        }
      ).map.userData.labelText,
    ).toEqual('07 · After the Rain · Mara Velez · 2019');
  });
});
