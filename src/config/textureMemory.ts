type TextureBudget = {
  count: number;
  surfaceResolution: number;
};

const BYTES_PER_RGBA_PIXEL = 4;
// Allow one generated wall finish and optional wall/artwork images per station.
const TEXTURE_SLOTS_PER_STATION = 3;
const GALLERY_BACKDROP_TEXTURES = 1;
const WALL_LABEL_PIXELS = 512 * 128;
const MEMORY_PLAQUE_PIXELS = 512 * 80;
const GALLERY_SIGN_PIXELS = 1024 * 160 + 1024 * 96;

/** Estimates RGBA bytes for station surfaces, labels, signs, and the gallery backdrop. */
export function estimateTextureMemoryBytes({
  count,
  surfaceResolution,
}: TextureBudget): number {
  return (
    ((count * TEXTURE_SLOTS_PER_STATION + GALLERY_BACKDROP_TEXTURES) *
      surfaceResolution ** 2 +
      count * WALL_LABEL_PIXELS +
      MEMORY_PLAQUE_PIXELS +
      GALLERY_SIGN_PIXELS) *
    BYTES_PER_RGBA_PIXEL
  );
}

export function formatMemoryEstimate(bytes: number): string {
  const mebibytes = bytes / 1024 ** 2;
  return `${mebibytes < 10 ? mebibytes.toFixed(2) : mebibytes.toFixed(1)} MiB`;
}
