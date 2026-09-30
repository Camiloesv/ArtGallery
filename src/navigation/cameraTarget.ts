export type CameraTarget = {
  lookAt: [number, number, number];
  position: [number, number, number];
};

type CameraTargetRequest = {
  focusedPosition?: number | null;
  position: number;
  spacing?: number;
  count?: number;
  focused?: boolean;
  focusedX?: number;
};

const DEFAULT_SPACING = 2.55;
const FOCUSED_HEIGHT = 2.55;
const FOCUSED_DISTANCE = 4.8;

export function getCameraTarget(request: CameraTargetRequest): CameraTarget | null {
  const spacing = request.spacing ?? DEFAULT_SPACING;
  const center = ((request.count ?? 24) - 1) / 2;
  if (request.focusedPosition === request.position) {
    if (!request.focused) return null;
    const currentX = request.focusedX ?? (request.position - center) * spacing;
    return {
      position: [currentX, FOCUSED_HEIGHT, FOCUSED_DISTANCE],
      lookAt: [currentX, FOCUSED_HEIGHT, 0],
    };
  }

  const x = (request.position - center) * spacing;
  return {
    position: [x, FOCUSED_HEIGHT, FOCUSED_DISTANCE],
    lookAt: [x, FOCUSED_HEIGHT, 0],
  };
}
