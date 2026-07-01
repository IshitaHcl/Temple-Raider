import { Puzzle } from './puzzle';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** Stays "pressed" while the player stands on it. Emits puzzle-solved once. */
export class PressurePlate extends Puzzle {
  private pressed = false;
  private emitted = false;
  constructor(public readonly id: string, x: number, y: number, w = 48) {
    super(x, y, w, 10);
  }
  get solved(): boolean { return this.pressed; }

  update(_dt: number, ctx: UpdateContext): void {
    const player = ctx.world.player.bounds;
    this.pressed = player.bottom >= this.bounds.top - 4 &&
                   player.bottom <= this.bounds.bottom + 8 &&
                   player.right > this.bounds.left && player.left < this.bounds.right;
    if (this.pressed && !this.emitted) {
      this.emitted = true;
      ctx.world.emit({ type: 'puzzle-solved', id: this.id });
    }
    if (!this.pressed) this.emitted = false;
  }
  render(renderer: Renderer): void {
    const h = this.pressed ? 4 : 10;
    renderer.rect(this.bounds.x, this.bounds.bottom - h, this.bounds.width, h, this.pressed ? '#3fa34d' : '#8a8a3f');
  }
}
