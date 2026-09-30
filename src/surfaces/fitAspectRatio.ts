export type ImageFit = {
  widthScale: number;
  heightScale: number;
};

/** Returns plane scale factors that show the full source image without stretching. */
export function fitAspectRatio(imageRatio: number, surfaceRatio: number): ImageFit {
  if (!Number.isFinite(imageRatio) || imageRatio <= 0) {
    throw new Error('Image aspect ratio must be positive.');
  }
  if (!Number.isFinite(surfaceRatio) || surfaceRatio <= 0) {
    throw new Error('Surface aspect ratio must be positive.');
  }
  if (imageRatio > surfaceRatio) {
    return { widthScale: 1, heightScale: surfaceRatio / imageRatio };
  }
  return { widthScale: imageRatio / surfaceRatio, heightScale: 1 };
}
