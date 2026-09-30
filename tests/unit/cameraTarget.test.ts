import { describe, expect, it } from 'vitest';
import { getCameraTarget } from '../../src/navigation/cameraTarget';

describe('camera target', () => {
  it('places the viewpoint in front of the selected painting', () => {
    const target = getCameraTarget({ position: 4 });

    expect(target).not.toBeNull();
    expect(target!.position[2]).toBeGreaterThan(target!.lookAt[2]);
    expect(target!.position[0]).toBe(target!.lookAt[0]);
  });

  it('does not move when the selected painting is already focused', () => {
    expect(getCameraTarget({ position: 4, focusedPosition: 4 })).toBeNull();
  });
});
