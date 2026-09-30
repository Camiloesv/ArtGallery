import {
  CanvasTexture,
  DataTexture,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace,
  type Texture,
} from 'three';

type FinishRecipe = {
  background: string;
  mark: string;
  pattern: 'crosshatch' | 'wash' | 'grain' | 'plain';
};

const FINISHES: Record<string, FinishRecipe> = {
  plaster: { background: '#e8e0d3', mark: '#d9cdbc', pattern: 'plain' },
  concrete: { background: '#c8c7c1', mark: '#aaa9a3', pattern: 'grain' },
  limewash: { background: '#d9dfd1', mark: '#b8c7b7', pattern: 'wash' },
  slate: { background: '#42484d', mark: '#30373c', pattern: 'plain' },
};

export function generateSurface(finish: string, resolution: number): Texture {
  if (!Number.isInteger(resolution) || resolution <= 0) {
    throw new Error('Surface resolution must be a positive integer.');
  }

  const recipe = FINISHES[finish] ?? FINISHES.plaster!;
  if (typeof document === 'undefined') {
    const texture = new DataTexture(
      new Uint8Array([232, 224, 211, 255]),
      1,
      1,
      RGBAFormat,
    );
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    texture.userData.finish = finish in FINISHES ? finish : 'matte-fallback';
    texture.userData.configuredResolution = resolution;
    return texture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable for surface generation.');

  context.fillStyle = recipe.background;
  context.fillRect(0, 0, resolution, resolution);

  if (recipe.pattern === 'crosshatch') {
    context.strokeStyle = recipe.mark;
    context.lineWidth = Math.max(1, resolution / 256);
    const step = Math.max(8, Math.round(resolution / 12));
    for (let offset = 0; offset <= resolution; offset += step) {
      context.beginPath();
      context.moveTo(offset, 0);
      context.lineTo(offset, resolution);
      context.stroke();
      context.beginPath();
      context.moveTo(0, offset);
      context.lineTo(resolution, offset);
      context.stroke();
    }
  }

  if (recipe.pattern === 'wash') {
    context.fillStyle = recipe.mark;
    const step = Math.max(6, Math.round(resolution / 18));
    for (let row = 0; row < resolution; row += step) {
      const inset = (row / step) % 2 === 0 ? 0 : step / 2;
      context.fillRect(inset, row, resolution - inset, Math.max(1, step / 3));
    }
  }

  if (recipe.pattern === 'grain') {
    context.fillStyle = recipe.mark;
    const step = Math.max(5, Math.round(resolution / 24));
    for (let row = 0; row < resolution; row += step) {
      for (let column = 0; column < resolution; column += step) {
        const x = (column + ((row / step) % 2) * (step / 2)) % resolution;
        const y = row + ((column / step) % 3);
        context.fillRect(x, y, Math.max(1, step / 5), Math.max(1, step / 5));
      }
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.userData.finish = finish in FINISHES ? finish : 'matte-fallback';
  return texture;
}

export function generateGalleryBackdrop(resolution: number): Texture {
  if (!Number.isInteger(resolution) || resolution <= 0) {
    throw new Error('Surface resolution must be a positive integer.');
  }

  const gradientStops = ['#777777', '#050505'];
  if (typeof document === 'undefined') {
    const texture = new DataTexture(
      new Uint8Array([119, 119, 119, 255]),
      1,
      1,
      RGBAFormat,
    );
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    texture.userData.kind = 'gallery-backdrop';
    texture.userData.gradientStops = gradientStops;
    texture.userData.configuredResolution = resolution;
    return texture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable for background generation.');

  // Keep the exhibition brighter in the centre while the gallery fades into dark edges.
  const gradient = context.createRadialGradient(
    resolution / 2,
    resolution / 2,
    0,
    resolution / 2,
    resolution / 2,
    resolution / 1.25,
  );
  gradient.addColorStop(0, gradientStops[0]!);
  gradient.addColorStop(1, gradientStops[1]!);
  context.fillStyle = gradient;
  context.fillRect(0, 0, resolution, resolution);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.userData.kind = 'gallery-backdrop';
  texture.userData.gradientStops = gradientStops;
  texture.userData.configuredResolution = resolution;
  return texture;
}
