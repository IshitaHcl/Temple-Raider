import { Rect } from '../../core/math/rect';
import { Renderer } from '../../core/engine/renderer';
import { UpdateContext } from '../../core/interfaces/game-types';

export type ProjectileOwner = 'player' | 'enemy';

/** A poolable projectile. It is NOT created/destroyed during play — the pool
 *  flips `active`. All transient state must be fully reset in reset(). */
export class Projectile {
  readonly bounds = new Rect(0, 0, 10, 10);
  vx = 0; vy = 0;
  active = false;
  owner: ProjectileOwner = 'player';
  damage = 10;
  private life = 0;

  /** Re-initialise a recycled instance. */
  reset(x: number, y: number, vx: number, vy: number, owner: ProjectileOwner): void {
    this.bounds.x = x - this.bounds.width / 2;
    this.bounds.y = y - this.bounds.height / 2;
    this.vx = vx; this.vy = vy;
    this.owner = owner;
    this.damage = owner === 'player' ? 12 : 8;
    this.life = 2.5;
    this.active = true;
  }

  update(dt: number, ctx: UpdateContext): void {
    if (!this.active) return;
    this.bounds.x += this.vx * dt;
    this.bounds.y += this.vy * dt;
    this.life -= dt;
    const map = ctx.world.tilemap;
    const col = Math.floor(this.bounds.centerX / map.tileSize);
    const row = Math.floor(this.bounds.centerY / map.tileSize);
    if (this.life <= 0 || map.isSolid(col, row)) this.active = false;
  }

  render(renderer: Renderer): void {
    if (!this.active) return;
    const color = this.owner === 'player' ? '#ffd166' : '#ef6f6f';
    renderer.circle(this.bounds.centerX, this.bounds.centerY, 6, color);
  }
}
