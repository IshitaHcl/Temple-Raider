/** Declarative level definition. Designers edit data, not code (Open/Closed).
 *  Coordinates for entities are in PIXELS; the tilemap is a grid of Tile codes. */
export interface LevelDefinition {
  id: string;
  name: string;
  tileSize: number;
  /** Row-major grid using Tile enum values (0 empty,1 wall,2 platform,3 deco). */
  grid: number[][];
  playerSpawn: { x: number; y: number };
  relics: { id: string; name: string; x: number; y: number }[];
  patrols: { x: number; y: number; minX: number; maxX: number }[];
  chasers: { x: number; y: number }[];
  spikes: { x: number; y: number; width?: number; period?: number }[];
  darts: { x: number; y: number; dir: 1 | -1 }[];
  plates: { id: string; x: number; y: number; width?: number }[];
  /** Door opens when the linked plate id is solved. */
  doors: { id: string; col: number; row: number; heightTiles?: number; linkedPlate: string }[];
  boss?: { x: number; y: number };
  /** Pixel X the player must reach to finish (if no boss). */
  exitX?: number;
}
