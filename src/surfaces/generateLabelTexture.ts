import {
  CanvasTexture,
  DataTexture,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace,
  type Texture,
} from 'three';

export type WallLabelContent = {
  artist?: string;
  number: number;
  title?: string;
  year?: number;
};

export function generateLabelTexture(content: WallLabelContent): Texture {
  const labelText = [
    String(content.number).padStart(2, '0'),
    content.title,
    content.artist,
    content.year,
  ]
    .filter((value) => value !== undefined && value !== '')
    .join(' · ');
  if (typeof document === 'undefined') {
    const texture = new DataTexture(
      new Uint8Array([255, 255, 255, 255]),
      1,
      1,
      RGBAFormat,
    );
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    texture.userData.labelText = labelText;
    return texture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable for wall-label generation.');

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textBaseline = 'middle';
  context.fillStyle = '#332a24';
  context.font = 'bold 34px Georgia, serif';
  context.fillText(String(content.number).padStart(2, '0'), 6, 22);
  context.font = 'bold 24px Georgia, serif';
  context.fillText(content.title ?? '', 6, 55, 500);
  context.font = '19px Arial, sans-serif';
  context.fillText(content.artist ?? '', 6, 84, 500);
  context.font = '17px Arial, sans-serif';
  context.fillText(content.year === undefined ? '' : String(content.year), 6, 111);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.userData.labelText = labelText;
  return texture;
}

export type GallerySignStyle = 'neon-title' | 'instructions';

export function generateGallerySignTexture(
  text: string,
  style: GallerySignStyle,
): Texture {
  if (typeof document === 'undefined') {
    const texture = new DataTexture(
      new Uint8Array([255, 255, 255, 255]),
      1,
      1,
      RGBAFormat,
    );
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    texture.userData.labelText = text;
    texture.userData.style = style;
    return texture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = style === 'neon-title' ? 160 : 96;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable for gallery signs.');

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  if (style === 'neon-title') {
    context.font = 'bold 112px Arial, sans-serif';
    context.shadowColor = '#00e5ff';
    context.shadowBlur = 28;
    context.strokeStyle = '#00e5ff';
    context.lineWidth = 3;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillStyle = '#e3ffff';
  } else {
    context.font = 'bold 44px Arial, sans-serif';
    context.fillStyle = '#f4f4f4';
  }
  context.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - 48);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.userData.labelText = text;
  texture.userData.style = style;
  return texture;
}
