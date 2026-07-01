import { Entity } from '../entity';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** A collectible relic. On overlap with the player it emits a relic-collected
 *  event and removes itself. Carries enough data to drive the inventory. */
export class Relic extends Entity {
  readonly zIndex = 5;
  private bob = 0;
  constructor(x: number, y: number, public readonly id: string, public readonly name: string) {
    super(x, y, 24, 24);
  }

  update(dt: number, ctx: UpdateContext): void {
    this.bob += dt * 4;
    if (this.bounds.intersects(ctx.world.player.bounds)) {
      ctx.world.emit({ type: 'relic-collected', id: this.id, name: this.name });
      this.destroy();
    }
  }

  render(renderer: Renderer): void {
    const y = this.bounds.y + Math.sin(this.bob) * 4;
    renderer.circle(this.bounds.centerX, y + 12, 14, '#caa64a');
    renderer.circle(this.bounds.centerX, y + 12, 8, '#f4d97b');
  }
}
