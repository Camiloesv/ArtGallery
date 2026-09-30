import { CanvasTexture, DataTexture, LinearFilter, RGBAFormat } from 'three';

export function generateMemoryLabelTexture(label: string) {
  if (typeof document === 'undefined') {
    const texture = new DataTexture(
      new Uint8Array([245, 239, 229, 255]),
      1,
      1,
      RGBAFormat,
    );
    texture.userData.labelText = `Estimated texture memory · ${label}`;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    return texture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 80;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable for the memory plaque.');

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#4a4037';
  context.font = '24px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(`Estimated texture memory · ${label}`, 256, 40);

  const texture = new CanvasTexture(canvas);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.userData.labelText = `Estimated texture memory · ${label}`;
  return texture;
}
