import { useRef } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import {
  getOverviewPanBounds,
  getOverviewPanOffset,
  hasOverviewPanStarted,
} from '../navigation/overviewPan';

type OverviewPanSurfaceProps = {
  count: number;
  currentOffset: number;
  onOffsetChange: (offset: number) => void;
  spacing: number;
};

export function OverviewPanSurface({
  count,
  currentOffset,
  onOffsetChange,
  spacing,
}: OverviewPanSurfaceProps) {
  const { size, viewport } = useThree();
  const pointerStart = useRef<{ x: number; offset: number; moved: boolean } | null>(null);
  const bounds = getOverviewPanBounds(count, spacing);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (event.button !== 0) return;
    pointerStart.current = { x: event.clientX, offset: currentOffset, moved: false };
    const target = event.target as
      | (EventTarget & {
          setPointerCapture?: (pointerId: number) => void;
        })
      | null;
    target?.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const start = pointerStart.current;
    if (!start) return;
    if (hasOverviewPanStarted(start.x, event.clientX)) start.moved = true;
    if (!start.moved) return;
    onOffsetChange(
      getOverviewPanOffset(
        start.offset,
        event.clientX - start.x,
        viewport.width,
        size.width,
        bounds.min,
        bounds.max,
      ),
    );
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    pointerStart.current = null;
    const target = event.target as
      | (EventTarget & {
          releasePointerCapture?: (pointerId: number) => void;
        })
      | null;
    target?.releasePointerCapture?.(event.pointerId);
  };

  return (
    <mesh
      name="overview-pan-surface"
      position={[0, 3, 1.5]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      <planeGeometry args={[120, 30]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
