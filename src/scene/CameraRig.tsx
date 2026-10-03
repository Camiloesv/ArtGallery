import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { getCameraTarget } from '../navigation/cameraTarget';

type CameraRigProps = {
  count: number;
  focusedPosition?: number | null;
  overviewOffset?: number;
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
  overviewOffset = 0,
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
    size.height,
    (camera as PerspectiveCamera).fov,
    overviewOffset,
  );
  const destination: [number, number, number] = target ? target.position : overview;
  const lookTarget = new Vector3(
    ...(target?.lookAt ?? [overviewOffset, WALL_CENTER_HEIGHT + 2.25, 0]),
  );
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
        overviewOffset,
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
  height: number,
  fov: number,
  overviewOffset: number,
): [number, number, number] {
  const halfFov = MathUtils.degToRad(fov) / 2;
  const verticalDistance = WALL_HEIGHT / (2 * Math.tan(halfFov));
  // Frame a legible section of the wall; horizontal panning exposes the rest of the row.
  const distance = Math.max(verticalDistance * 2.1, height > 0 ? 15 : 0);
  return [overviewOffset, WALL_CENTER_HEIGHT + 4.75, distance];
}
