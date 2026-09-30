import type { Texture } from 'three';
import type { WallConfig } from '../config/exhibition';
import { useEffect, useState } from 'react';
import { TextureLoader, type Texture as ThreeTexture } from 'three';
import { fitAspectRatio } from '../surfaces/fitAspectRatio';

type WallProps = {
  config: WallConfig;
  position: [number, number, number];
  texture: Texture;
};

export function Wall({ config, position, texture }: WallProps) {
  const image = useWallImage(config.imageSrc);
  const imageAspectRatio = config.imageAspectRatio ?? 2.55 / 4.9;
  const fit = fitAspectRatio(imageAspectRatio, 2.55 / 4.9);
  return (
    <group name="wall-panel-group" position={position}>
      <mesh
        name="wall-panel"
        receiveShadow
        userData={{ imageSrc: config.imageSrc, imageAspectRatio }}
      >
        <planeGeometry args={[2.55, 4.9]} />
        <meshStandardMaterial
          color={config.color}
          map={texture}
          roughness={config.roughness}
        />
      </mesh>
      {image && (
        <mesh name="wall-image" position={[0, 0, 0.006]}>
          <planeGeometry args={[2.55 * fit.widthScale, 4.9 * fit.heightScale]} />
          <meshBasicMaterial map={image} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function useWallImage(imageSrc?: string) {
  const [image, setImage] = useState<ThreeTexture | null>(null);
  useEffect(() => {
    if (!imageSrc) {
      setImage(null);
      return;
    }
    let active = true;
    if (typeof document === 'undefined') return;
    new TextureLoader().load(
      imageSrc,
      (loaded) => {
        if (active) setImage(loaded);
      },
      undefined,
      () => {
        if (active) setImage(null);
      },
    );
    return () => {
      active = false;
    };
  }, [imageSrc]);
  return image;
}
