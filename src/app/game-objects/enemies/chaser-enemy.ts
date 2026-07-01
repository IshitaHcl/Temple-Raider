import { Enemy } from './enemy';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** Idle until the player enters detection range, then pursue. Demonstrates a
 *  simple sensor-driven AI state without a full FSM. */
export class ChaserEnemy extends Enemy {
  private readonly detectRange = 260;
  private aggro = false;
  constructor(x: number, y: number) { super(x, y, 30, 34, 45); this.contactDamage = 16; this.points = 150; }

  protected decide(_dt: number, ctx: UpdateContext): void {
    const player = ctx.world.player.bounds;
    const dist = Math.abs(player.centerX - this.bounds.centerX);
    this.aggro = dist < this.detectRange;
    if (this.aggro) {
      const dir = Math.sign(player.centerX - this.bounds.centerX) || 1;
      this.velocity.x = dir * 150;
      this.facing = dir > 0 ? 1 : -1;
      // hop over small obstacles
      if (this.onGround && Math.abs(this.velocity.x) > 0 && Math.random() < 0.02) this.velocity.y = -480;
    } else {
      this.velocity.x = 0;
    }
  }
  render(renderer: Renderer): void {
    renderer.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, this.aggro ? '#a3343a' : '#6b3030');
    renderer.rect(this.bounds.x, this.bounds.y - 6, this.bounds.width * (this.health / this.maxHealth), 3, '#e44');
  }
}
