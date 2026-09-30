import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it } from 'vitest';
import { CameraRig } from '../../src/scene/CameraRig';

describe('CameraRig', () => {
  it('exposes its selected painting target and reduced-motion duration in the scene', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <CameraRig count={24} focusedPosition={5} reducedMotion />,
    );
    const rig = renderer.scene.findByProps({ name: 'camera-rig' });

    expect(rig.instance.userData.focusedPosition).toBe(5);
    expect(rig.instance.userData.targetPosition[0]).toBeCloseTo((5 - 11.5) * 2.55);
    expect(rig.instance.userData.targetPosition[2]).toBeCloseTo(4.8);
    expect(rig.instance.userData.transitionDuration).toBeLessThan(0.5);
    expect(rig.instance.userData.transitionDuration).toBeGreaterThan(0);
  });

  it('returns to overview when no painting is selected', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <CameraRig count={24} focusedPosition={null} />,
    );
    const rig = renderer.scene.findByProps({ name: 'camera-rig' });

    expect(rig.instance.userData.focusedPosition).toBeNull();
    expect(rig.instance.userData.targetKind).toBe('overview');
    expect(rig.instance.userData.targetPosition[0]).toBe(0);
  });
});
