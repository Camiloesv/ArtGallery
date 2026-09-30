export type WallFinish = 'plaster' | 'concrete' | 'limewash' | 'slate';

export type WallConfig = {
  color: string;
  finish: string;
  imageSrc?: string;
  roughness: number;
  imageAspectRatio?: number;
};

export type StationConfig = {
  artist?: string;
  color: string;
  imageSrc?: string;
  imageAspectRatio?: number;
  position: number;
  title?: string;
  wall: WallConfig;
  year?: number;
};

export type ExhibitionConfig = {
  count: number;
  spacing: number;
  surfaceResolution: number;
  stations: StationConfig[];
};

const starterStations: StationConfig[] = [
  ['A Room of Blue', 'Mara Velez', 2021, '#6e9ea5', '#e8e0d3'],
  ['After the Rain', 'Jonas Reed', 2019, '#bf8063', '#c6d0ca'],
  ['Soft Geometry', 'Nadia Okafor', 2024, '#d4b46e', '#d6c1ac'],
  ['Still Morning', 'Elias Chen', 2020, '#758d77', '#7b858b'],
  ['A Place to Pause', 'Mara Velez', 2022, '#c27965', '#d6d9ce'],
  ['The Quiet Field', 'Jonas Reed', 2018, '#8796ad', '#c9b9a7'],
  ['Summer Index', 'Nadia Okafor', 2023, '#d59b58', '#737f7d'],
  ['Small Weather', 'Elias Chen', 2021, '#6f8d83', '#d7cbbc'],
  ['The Long Window', 'Mara Velez', 2020, '#b77565', '#9da99e'],
  ['Common Light', 'Jonas Reed', 2022, '#c1a872', '#b7aa9e'],
  ['Blue Orchard', 'Nadia Okafor', 2019, '#688c92', '#858d91'],
  ['Held in Place', 'Elias Chen', 2024, '#b9815e', '#e2d5c2'],
  ['Halfway Home', 'Mara Velez', 2018, '#7d927e', '#687a7d'],
  ['A Familiar Shape', 'Jonas Reed', 2023, '#c59c72', '#d0c7b8'],
  ['Near the Water', 'Nadia Okafor', 2021, '#698a9d', '#959b96'],
  ['Quiet Assembly', 'Elias Chen', 2022, '#bd785f', '#a89c8d'],
  ['The Last Apricot', 'Mara Velez', 2024, '#d29a60', '#718184'],
  ['Outside, Slowly', 'Jonas Reed', 2020, '#758c81', '#dbcfbd'],
  ['Noon Study', 'Nadia Okafor', 2018, '#c28169', '#b3beb5'],
  ['Soft Landing', 'Elias Chen', 2023, '#8194aa', '#847f7c'],
  ['A Small Distance', 'Mara Velez', 2019, '#c3a46b', '#d5c8b4'],
  ['Open Air', 'Jonas Reed', 2021, '#6b9292', '#687478'],
  ['Things in Balance', 'Nadia Okafor', 2022, '#c27860', '#c1b6a8'],
  ['Evening, Again', 'Elias Chen', 2020, '#839178', '#929d96'],
].map(([title, artist, year, color, wallColor], position) => ({
  title: title as string,
  artist: artist as string,
  year: year as number,
  color: color as string,
  position,
  wall: {
    color: wallColor as string,
    finish: (['plaster', 'concrete', 'limewash', 'slate'] as const)[position % 4],
    roughness: 0.92,
  },
}));

starterStations[0]!.imageSrc = '/artworks/quiet-orbit.svg';
starterStations[0]!.imageAspectRatio = 4 / 3;
starterStations[1]!.imageSrc = '/artworks/warm-current.svg';
starterStations[1]!.imageAspectRatio = 2 / 3;

// Each station owns its wall settings and painting fields in this sole authoring surface.
export const starterExhibition: ExhibitionConfig = {
  count: 24,
  spacing: 2.55,
  surfaceResolution: 512,
  stations: starterStations,
};

export function validateExhibition(config: ExhibitionConfig): void {
  if (!Number.isInteger(config.count) || config.count <= 0) {
    throw new Error('Exhibition count must be a positive integer.');
  }

  if (config.count > config.stations.length) {
    throw new Error('Exhibition count cannot exceed the configured station list.');
  }

  if (!Number.isInteger(config.surfaceResolution) || config.surfaceResolution <= 0) {
    throw new Error('Surface resolution must be a positive integer.');
  }

  if (!Number.isFinite(config.spacing) || config.spacing <= 0) {
    throw new Error('Exhibition spacing must be a positive number.');
  }

  const positions = new Set<number>();
  const wallColours = new Set<string>();
  for (const station of config.stations.slice(0, config.count)) {
    if (positions.has(station.position)) {
      throw new Error(`Duplicate station position: ${station.position}.`);
    }
    positions.add(station.position);

    const normalizedColour = station.wall.color.trim().toLowerCase();
    if (wallColours.has(normalizedColour)) {
      throw new Error(`Duplicate wall colour: ${station.wall.color}.`);
    }
    wallColours.add(normalizedColour);
  }
}
