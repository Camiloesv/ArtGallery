import { useMemo } from 'react';
import { generateLabelTexture } from '../surfaces/generateLabelTexture';

type WallLabelProps = {
  artist?: string;
  number: number;
  position: [number, number, number];
  title?: string;
  year?: number;
};

export function WallLabel({ artist, number, position, title, year }: WallLabelProps) {
  const texture = useMemo(
    () => generateLabelTexture({ artist, number, title, year }),
    [artist, number, title, year],
  );
  return (
    <mesh
      name="wall-label"
      position={position}
      userData={{
        labelText: [String(number).padStart(2, '0'), title, artist, year]
          .filter((value) => value !== undefined && value !== '')
          .map(String),
      }}
    >
      <planeGeometry args={[1.5, 0.38]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
