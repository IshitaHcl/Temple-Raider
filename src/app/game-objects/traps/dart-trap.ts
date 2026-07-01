import { Trap } from './trap';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** Wall-mounted trap that fires a dart (pooled enemy projectile) when the
 *  player crosses its firing line. */
export class DartTrap extends Trap {
  private cooldown = 0;
  constructor(x: number, y: number, private readonly dir: 1 | -1 = -1, private readonly triggerRange = 220) {
    super(x, y, 16, 16);
  }
  get dangerous(): boolean { return false; } // damage comes from its projectile

  update(dt: number, ctx: UpdateContext): void {
    this.cooldown -= dt;
    const player = ctx.world.player.bounds;
    const sameRow = Math.abs(player.centerY - this.bounds.centerY) < 40;
    const inFront = this.dir < 0 ? player.centerX < this.bounds.centerX : player.centerX > this.bounds.centerX;
    const inRange = Math.abs(player.centerX - this.bounds.centerX) < this.triggerRange;
    if (this.cooldown <= 0 && sameRow && inFront && inRange) {
      ctx.world.spawnProjectile(this.bounds.centerX, this.bounds.centerY, this.dir * 420, 0, 'enemy');
      this.cooldown = 1.5;
    }
  }
  render(renderer: Renderer): void {
    renderer.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#403a2a');
    renderer.rect(this.dir < 0 ? this.bounds.x - 4 : this.bounds.right, this.bounds.centerY - 2, 4, 4, '#111');
  }
}
