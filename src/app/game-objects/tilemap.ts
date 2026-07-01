import { ITilemap } from '../core/interfaces/game-types';
import { Renderer } from '../core/engine/renderer';

export enum Tile { Empty = 0, Wall = 1, Platform = 2, Decoration = 3 }

/** Tile-based world geometry. Implements ITilemap so the collision system and
 *  game objects depend only on the interface, not this concrete grid. */
export class Tilemap implements ITilemap {
  readonly cols: number;
  readonly rows: number;
  constructor(
    private readonly grid: Tile[][],
    public readonly tileSize: number,
  ) {
    this.rows = grid.length;
    this.cols = grid[0]?.length ?? 0;
  }

  get pixelWidth(): number { return this.cols * this.tileSize; }
  get pixelHeight(): number { return this.rows * this.tileSize; }

  tileAt(col: number, row: number): Tile {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return Tile.Wall; // out of bounds = solid
    return this.grid[row][col];
  }
  isSolid(col: number, row: number): boolean {
    const t = this.tileAt(col, row);
    return t === Tile.Wall || t === Tile.Platform;
  }

  /** Controlled mutation (used by doors that open/close). Bounds-checked. */
  setTile(col: number, row: number, tile: Tile): void {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    this.grid[row][col] = tile;
  }

  render(renderer: Renderer): void {
    const ts = this.tileSize;
    const startCol = Math.max(0, Math.floor(renderer.camera.x / ts));
    const endCol = Math.min(this.cols, Math.ceil((renderer.camera.x + renderer.width) / ts));
    const startRow = Math.max(0, Math.floor(renderer.camera.y / ts));
    const endRow = Math.min(this.rows, Math.ceil((renderer.camera.y + renderer.height) / ts));
    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const t = this.grid[r][c];
        if (t === Tile.Empty) continue;
        const color = t === Tile.Wall ? '#3a3326' : t === Tile.Platform ? '#5a4b2f' : '#241f17';
        renderer.rect(c * ts, r * ts, ts, ts, color);
        if (t === Tile.Wall || t === Tile.Platform) {
          renderer.rect(c * ts, r * ts, ts, 3, '#6b5a38'); // top highlight
        }
      }
    }
  }
}
