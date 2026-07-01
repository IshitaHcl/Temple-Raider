import { Puzzle } from './puzzle';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';
import { Tilemap, Tile } from '../tilemap';

/** A door that is solid until its linked condition opens it. Opening punches a
 *  hole in the tilemap so collision automatically lets the player through.
 *  The scene calls open() when the linked puzzle id is solved. */
export class LeverDoor extends Puzzle {
  private isOpen = false;
  constructor(
    public readonly id: string,
    private readonly map: Tilemap,
    private readonly col: number,
    private readonly row: number,
    private readonly heightTiles = 3,
  ) {
    const ts = map.tileSize;
    super(col * ts, row * ts, ts, ts * heightTiles);
    this.seal();
  }
  get solved(): boolean { return this.isOpen; }

  private seal(): void {
    for (let r = 0; r < this.heightTiles; r++) this.map.setTile(this.col, this.row + r, Tile.Wall);
  }
  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    for (let r = 0; r < this.heightTiles; r++) this.map.setTile(this.col, this.row + r, Tile.Empty);
  }

  update(_dt: number, _ctx: UpdateContext): void { /* driven by scene via open() */ }
  render(renderer: Renderer): void {
    if (this.isOpen) return;
    renderer.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#2e2820');
    renderer.strokeRect(this.bounds.x + 2, this.bounds.y + 2, this.bounds.width - 4, this.bounds.height - 4, '#7a6a45', 2);
  }
}
