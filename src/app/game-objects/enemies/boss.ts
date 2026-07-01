import { Enemy } from './enemy';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** Multi-phase boss. Phase escalates as health drops, changing movement speed
 *  and fire rate. Fires through the world's projectile pool (no allocation). */
export class Boss extends Enemy {
  private fireCooldown = 0;
  private dir: 1 | -1 = 1;
  private readonly anchorY: number;
  private t = 0;

  constructor(x: number, y: number) {
    super(x, y, 64, 80, 300);
    this.contactDamage = 24;
    this.points = 1000;
    this.anchorY = y;
    this.gravity = 0; // boss floats; it drives its own vertical motion
  }

  private get phase(): 1 | 2 | 3 {
    const pct = this.health / this.maxHealth;
    return pct > 0.66 ? 1 : pct > 0.33 ? 2 : 3;
  }

  protected decide(dt: number, ctx: UpdateContext): void {
    this.t += dt;
    const speed = 60 + this.phase * 35;
    this.velocity.x = this.dir * speed;
    // Hover: drive velocity.y toward the derivative of a sine path so the base
    // class integrator (moveAndCollide) does the actual movement.
    const targetY = this.anchorY + Math.sin(this.t * 1.5) * 40;
    this.velocity.y = (targetY - this.bounds.y) / Math.max(dt, 1e-4);

    const player = ctx.world.player.bounds;
    this.facing = player.centerX < this.bounds.centerX ? -1 : 1;

    this.fireCooldown -= dt;
    const interval = this.phase === 1 ? 1.4 : this.phase === 2 ? 0.9 : 0.5;
    if (this.fireCooldown <= 0) {
      this.fireCooldown = interval;
      const dx = player.centerX - this.bounds.centerX;
      const dy = player.centerY - this.bounds.centerY;
      const len = Math.hypot(dx, dy) || 1;
      const speedP = 260;
      ctx.world.spawnProjectile(this.bounds.centerX, this.bounds.centerY, (dx / len) * speedP, (dy / len) * speedP, 'enemy');
      if (this.phase === 3) {
        // spread shot in final phase
        ctx.world.spawnProjectile(this.bounds.centerX, this.bounds.centerY, (dx / len) * speedP - 80, (dy / len) * speedP, 'enemy');
        ctx.world.spawnProjectile(this.bounds.centerX, this.bounds.centerY, (dx / len) * speedP + 80, (dy / len) * speedP, 'enemy');
      }
    }
  }
  protected override onWall(): void { this.dir = (this.dir * -1) as 1 | -1; }

  override takeDamage(amount: number, ctx: UpdateContext): void {
    super.takeDamage(amount, ctx);
    if (!this.alive) ctx.world.emit({ type: 'boss-defeated' });
  }

  render(renderer: Renderer): void {
    const colors: Record<number, string> = { 1: '#5e2b7a', 2: '#7a2b5e', 3: '#a3243a' };
    renderer.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, colors[this.phase]);
    renderer.rect(this.bounds.x + 12, this.bounds.y + 18, 12, 12, '#ffe27a');
    renderer.rect(this.bounds.x + 40, this.bounds.y + 18, 12, 12, '#ffe27a');
    // big health bar above
    renderer.rect(this.bounds.x - 10, this.bounds.y - 16, (this.bounds.width + 20) * (this.health / this.maxHealth), 6, '#e44');
  }
}
