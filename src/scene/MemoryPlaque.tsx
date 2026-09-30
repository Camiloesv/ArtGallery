import { useMemo } from 'react';
import {
  estimateTextureMemoryBytes,
  formatMemoryEstimate,
} from '../config/textureMemory';
import type { ExhibitionConfig } from '../config/exhibition';
import { generateMemoryLabelTexture } from '../surfaces/generateMemoryLabelTexture';

type MemoryPlaqueProps = {
  config: ExhibitionConfig;
};

export function MemoryPlaque({ config }: MemoryPlaqueProps) {
  const bytes = estimateTextureMemoryBytes(config);
  const label = formatMemoryEstimate(bytes);
  const texture = useMemo(() => generateMemoryLabelTexture(label), [label]);

  return (
    <mesh
      name="texture-memory-plaque"
      position={[0, 0.46, -0.36]}
      userData={{ estimatedBytes: bytes, label }}
    >
      <planeGeometry args={[1.7, 0.26]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}
