import { describe, expect, it } from 'vitest';
import {
  starterExhibition,
  validateExhibition,
  type ExhibitionConfig,
} from '../../src/config/exhibition';

describe('exhibition configuration', () => {
  it('starts with exactly 25 configured paintings', () => {
    expect(starterExhibition.count).toBe(25);
    expect(starterExhibition.stations).toHaveLength(25);
  });

  it('uses a different white shade for each starter wall', () => {
    const colours = starterExhibition.stations
      .slice(0, starterExhibition.count)
      .map((station) => station.wall.color.toLowerCase());
    const channels = colours.map((colour) =>
      colour
        .replace('#', '')
        .match(/.{2}/g)!
        .map((channel) => Number.parseInt(channel, 16)),
    );

    expect(new Set(colours).size).toBe(25);
    expect(channels.every((rgb) => rgb.length === 3 && Math.min(...rgb) >= 224)).toBe(
      true,
    );
  });

  it('accepts the starter exhibition', () => {
    expect(() => validateExhibition(starterExhibition)).not.toThrow();
  });

  it('accepts an unknown wall finish for the matte fallback', () => {
    const config: ExhibitionConfig = structuredClone(starterExhibition);
    config.stations[0]!.wall.finish = 'unlisted-finish';

    expect(() => validateExhibition(config)).not.toThrow();
  });

  it('gives every station an independent wall config with a distinct starter colour', () => {
    const walls = starterExhibition.stations.map((station) => station.wall);
    const colours = walls.map((wall) => wall.color.toLowerCase());

    expect(new Set(walls).size).toBe(walls.length);
    expect(new Set(colours).size).toBe(colours.length);
  });

  it('rejects duplicate wall colours with a clear error', () => {
    const config: ExhibitionConfig = structuredClone(starterExhibition);
    config.stations[1]!.wall.color = config.stations[0]!.wall.color;

    expect(() => validateExhibition(config)).toThrow(/duplicate wall colour/i);
  });

  it('rejects a non-positive painting count with a clear error', () => {
    const config: ExhibitionConfig = structuredClone(starterExhibition);
    config.count = 0;

    expect(() => validateExhibition(config)).toThrow(/count must be a positive integer/i);
  });

  it('rejects duplicate station positions with a clear error', () => {
    const config: ExhibitionConfig = structuredClone(starterExhibition);
    config.stations[1]!.position = config.stations[0]!.position;

    expect(() => validateExhibition(config)).toThrow(/duplicate station position/i);
  });
});
