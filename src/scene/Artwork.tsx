import { useEffect, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { TextureLoader, type Texture } from 'three';
import { fitAspectRatio } from '../surfaces/fitAspectRatio';

type ArtworkProps = {
  color: string;
  number: number;
  onSelect: (position: number) => void;
  position: number;
  layoutX: number;
  imageSrc?: string;
  imageAspectRatio?: number;
  imageResolution?: number;
};

export function Artwork({
  color,
  number,
  onSelect,
  position,
  layoutX,
  imageSrc,
  imageAspectRatio,
  imageResolution,
}: ArtworkProps) {
  const [hovered, setHovered] = useState(false);
  const image = useArtworkImage(imageSrc);
  const imageFit = fitAspectRatio(imageAspectRatio ?? 1.25 / 1.8, 1.25 / 1.8);
  const artworkResolution = imageResolution ?? 512;
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(position);
  };

  return (
    <group
      name="artwork"
      position={[layoutX, 2.95, 0.28]}
      userData={{ stationNumber: number, imageSrc, imageAspectRatio }}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh name="artwork-frame" castShadow>
        <boxGeometry args={[1.62, 2.18, 0.12]} />
        <meshStandardMaterial color={hovered ? '#79523d' : '#4a3328'} roughness={0.46} />
      </mesh>
      <mesh name="artwork-matte" position={[0, 0, 0.066]}>
        <planeGeometry args={[1.45, 2.01]} />
        <meshStandardMaterial color="#f1e8d9" roughness={0.95} />
      </mesh>
      <mesh
        name="artwork-surface"
        position={[0, 0, 0.07]}
        userData={{
          stationNumber: number,
          resolution: artworkResolution,
          imageSrc,
          imageAspectRatio,
        }}
      >
        <planeGeometry
          args={
            imageSrc
              ? [1.25 * imageFit.widthScale, 1.8 * imageFit.heightScale]
              : [1.25, 1.8]
          }
        />
        <meshStandardMaterial
          color={image ? '#ffffff' : color}
          map={image}
          roughness={0.84}
        />
      </mesh>
    </group>
  );
}

function useArtworkImage(imageSrc?: string) {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!imageSrc) {
      setTexture(null);
      return;
    }
    if (typeof document === 'undefined') return;
    let active = true;
    new TextureLoader().load(
      imageSrc,
      (loaded) => {
        if (active) setTexture(loaded);
      },
      undefined,
      () => {
        if (active) setTexture(null);
      },
    );
    return () => {
      active = false;
    };
  }, [imageSrc]);

  return texture;
}
