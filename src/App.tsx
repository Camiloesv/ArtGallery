import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { starterExhibition } from './config/exhibition';
import { CameraRig } from './scene/CameraRig';
import { Exhibition } from './scene/Exhibition';
import { nextGalleryFocus } from './navigation/galleryKeys';

export function App() {
  const [focusedPosition, setFocusedPosition] = useState<number | null>(null);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }

      const nextFocus = nextGalleryFocus(
        event.key,
        starterExhibition.stations
          .slice(0, starterExhibition.count)
          .map((station) => station.position),
        focusedPosition,
      );
      if (nextFocus === undefined) return;
      event.preventDefault();
      setFocusedPosition(nextFocus);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedPosition]);

  return (
    <main className="exhibition-shell">
      <Canvas
        aria-label="Interactive exhibition gallery"
        onPointerMissed={() => setFocusedPosition(null)}
        camera={{ fov: 38, position: [0, 5.75, 42], near: 0.1, far: 180 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.82} />
        <hemisphereLight args={['#fff7e8', '#8b8173', 1.1]} />
        <directionalLight position={[-8, 12, 12]} intensity={2.15} />
        <directionalLight position={[15, 7, 5]} intensity={0.75} />
        <mesh
          name="gallery-floor"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -2]}
          onClick={(event) => {
            event.stopPropagation();
            setFocusedPosition(null);
          }}
        >
          <planeGeometry args={[100, 26]} />
          <meshStandardMaterial color="#b5a995" roughness={0.86} />
        </mesh>
        <Exhibition
          config={starterExhibition}
          focusedPosition={focusedPosition}
          onSelect={setFocusedPosition}
        />
        <CameraRig
          count={starterExhibition.count}
          focusedPosition={focusedPosition}
          onOverviewClick={() => setFocusedPosition(null)}
          reducedMotion={reducedMotion}
          spacing={starterExhibition.spacing}
        />
      </Canvas>
    </main>
  );
}
