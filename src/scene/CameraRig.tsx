import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { getCameraTarget } from '../navigation/cameraTarget';

type CameraRigProps = {
  count: number;
  focusedPosition?: number | null;
  reducedMotion?: boolean;
  spacing?: number;
  onOverviewClick?: () => void;
};

const WALL_HEIGHT = 4.9;
const STATION_SPACING = 2.55;
const WALL_CENTER_HEIGHT = 2.75;

const NORMAL_TRANSITION_SECONDS = 1.35;
const REDUCED_TRANSITION_SECONDS = 0.32;

export function CameraRig({
  count,
  focusedPosition = null,
  reducedMotion = false,
  spacing = STATION_SPACING,
  onOverviewClick,
}: CameraRigProps) {
  const { camera, size } = useThree();
  const target =
    focusedPosition === null
      ? null
      : (getCameraTarget({
          position: focusedPosition,
          count,
          spacing,
          focused: true,
        }) ??
        getCameraTarget({
          position: focusedPosition,
          count,
          spacing,
        }));
  const overview = getOverviewTarget(
    count,
    spacing,
    size.width,
    size.height,
    (camera as PerspectiveCamera).fov,
  );
  const destination: [number, number, number] = target ? target.position : overview;
  const lookTarget = new Vector3(...(target?.lookAt ?? [0, WALL_CENTER_HEIGHT, 0]));
  const transitionDuration = reducedMotion
    ? REDUCED_TRANSITION_SECONDS
    : NORMAL_TRANSITION_SECONDS;

  useFrame((_, delta) => {
    const perspective = camera as PerspectiveCamera;
    // Exponential damping preserves a smooth retarget when another artwork is selected mid-flight.
    const damping = 5 / transitionDuration;
    perspective.position.x = MathUtils.damp(
      perspective.position.x,
      destination[0],
      damping,
      delta,
    );
    perspective.position.y = MathUtils.damp(
      perspective.position.y,
      destination[1],
      damping,
      delta,
    );
    perspective.position.z = MathUtils.damp(
      perspective.position.z,
      destination[2],
      damping,
      delta,
    );
    const currentLook = perspective
      .getWorldDirection(new Vector3())
      .multiplyScalar(4)
      .add(perspective.position);
    currentLook.lerp(lookTarget, 1 - Math.exp(-damping * delta));
    perspective.lookAt(currentLook);
  });

  return (
    <group
      name="camera-rig"
      userData={{
        focusedPosition,
        targetKind: target ? 'focused' : 'overview',
        targetPosition: destination,
        transitionDuration,
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onOverviewClick?.();
      }}
    />
  );
}

function getOverviewTarget(
  count: number,
  spacing: number,
  width: number,
  height: number,
  fov: number,
): [number, number, number] {
  const aspect = Math.max(width / Math.max(height, 1), 0.45);
  const halfFov = MathUtils.degToRad(fov) / 2;
  const exhibitionWidth = count * spacing;
  const horizontalDistance = exhibitionWidth / (2 * Math.tan(halfFov) * aspect);
  const verticalDistance = WALL_HEIGHT / (2 * Math.tan(halfFov));
  const distance = Math.max(horizontalDistance, verticalDistance) * 1.1;
  // Keep the complete row visible while leaving calm space above the wall.
  return [0, WALL_CENTER_HEIGHT + 3, distance];
}
