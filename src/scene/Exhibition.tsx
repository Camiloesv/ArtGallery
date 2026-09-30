import { useMemo } from 'react';
import { generateGalleryBackdrop, generateSurface } from '../surfaces/generateSurface';
import { generateGallerySignTexture } from '../surfaces/generateLabelTexture';
import { validateExhibition, type ExhibitionConfig } from '../config/exhibition';
import { Artwork } from './Artwork';
import { Wall } from './Wall';
import { WallLabel } from './WallLabel';
import { MemoryPlaque } from './MemoryPlaque';

type ExhibitionProps = {
  config: ExhibitionConfig;
  focusedPosition?: number | null;
  onSelect: (position: number) => void;
};

const GALLERY_TITLE = 'C1 Art Gallery';
const ARROW_INSTRUCTIONS = '← / → Browse artworks   ↑ Return to overview';

export function Exhibition({
  config,
  focusedPosition = null,
  onSelect,
}: ExhibitionProps) {
  validateExhibition(config);
  const stations = config.stations.slice(0, config.count);
  const wallTextures = useMemo(
    () =>
      config.stations
        .slice(0, config.count)
        .map((station) => generateSurface(station.wall.finish, config.surfaceResolution)),
    [config.stations, config.count, config.surfaceResolution],
  );
  const backdropTexture = useMemo(
    () => generateGalleryBackdrop(config.surfaceResolution),
    [config.surfaceResolution],
  );
  const titleTexture = useMemo(
    () => generateGallerySignTexture(GALLERY_TITLE, 'neon-title'),
    [],
  );
  const instructionTexture = useMemo(
    () => generateGallerySignTexture(ARROW_INSTRUCTIONS, 'instructions'),
    [],
  );

  return (
    <group name="exhibition">
      <mesh name="gallery-backdrop" position={[0, 3.8, -16]} renderOrder={-1}>
        <planeGeometry args={[160, 80]} />
        <meshBasicMaterial map={backdropTexture} toneMapped={false} />
      </mesh>
      {focusedPosition === null && (
        <group name="overview-signs">
          <mesh
            name="gallery-title"
            position={[0, 8.4, -0.2]}
            userData={{ text: GALLERY_TITLE, style: 'neon' }}
          >
            <planeGeometry args={[16, 2.5]} />
            <meshBasicMaterial map={titleTexture} transparent toneMapped={false} />
          </mesh>
          <mesh name="arrow-instructions-panel" position={[0, 6.45, -0.2]}>
            <planeGeometry args={[17.6, 1.55]} />
            <meshBasicMaterial
              color="#15191f"
              transparent
              opacity={0.94}
              toneMapped={false}
            />
          </mesh>
          <mesh
            name="arrow-instructions"
            position={[0, 6.45, -0.18]}
            userData={{ text: ARROW_INSTRUCTIONS, style: 'instructions' }}
          >
            <planeGeometry args={[16.8, 1.5]} />
            <meshBasicMaterial map={instructionTexture} transparent toneMapped={false} />
          </mesh>
        </group>
      )}
      <MemoryPlaque config={config} />
      {stations.map((station, index) => {
        const x = (station.position - (config.count - 1) / 2) * config.spacing;
        return (
          <group key={station.position}>
            <Wall
              config={station.wall}
              position={[x, 2.75, -0.42]}
              texture={wallTextures[index]!}
            />
            <Artwork
              color={station.color}
              number={index + 1}
              onSelect={onSelect}
              position={station.position}
              layoutX={x}
              imageAspectRatio={station.imageAspectRatio}
              imageSrc={station.imageSrc}
              imageResolution={config.surfaceResolution}
            />
            <WallLabel
              artist={station.artist}
              number={index + 1}
              position={[x, 1.45, 0.32]}
              title={station.title}
              year={station.year}
            />
          </group>
        );
      })}
    </group>
  );
}
