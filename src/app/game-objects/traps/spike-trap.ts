import { Trap } from './trap';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** Spikes that extend and retract on a timer. Only damages while extended. */
export class SpikeTrap extends Trap {
  private t = 0;
  private extended = false;
  constructor(x: number, y: number, w = 48, private readonly period = 2) {
    super(x, y, w, 16);
    this.damage = 25;
  }
  get dangerous(): boolean { return this.extended; }

  update(dt: number, ctx: UpdateContext): void {
    this.t += dt;
    this.extended = (this.t % this.period) < this.period * 0.5;
    if (this.dangerous && this.bounds.intersects(ctx.world.player.bounds)) {
      const p = ctx.world.player as unknown as { takeDamage?: (n: number, c: UpdateContext) => void };
      p.takeDamage?.(this.damage, ctx);
    }
  }
  render(renderer: Renderer): void {
    renderer.rect(this.bounds.x, this.bounds.bottom - 4, this.bounds.width, 4, '#2b2b2b');
    if (this.extended) {
      const spikes = Math.floor(this.bounds.width / 12);
      for (let i = 0; i < spikes; i++) {
        renderer.rect(this.bounds.x + i * 12 + 2, this.bounds.y, 8, this.bounds.height, '#c9c9c9');
      }
    }
  }
}
