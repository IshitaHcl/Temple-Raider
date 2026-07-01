import { Projectile, ProjectileOwner } from './projectile';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** Object Pool: a fixed array of reusable Projectiles. acquire() finds an
 *  inactive slot; nothing is allocated during gameplay, so the GC never spikes
 *  even under heavy fire. Iterating the active subset is O(capacity). */
export class ProjectilePool {
  private readonly pool: Projectile[];
  constructor(capacity = 64) {
    this.pool = Array.from({ length: capacity }, () => new Projectile());
  }

  spawn(x: number, y: number, vx: number, vy: number, owner: ProjectileOwner): Projectile | null {
    const p = this.pool.find(p => !p.active);
    if (!p) return null; // pool exhausted — silently drop (or grow if desired)
    p.reset(x, y, vx, vy, owner);
    return p;
  }

  /** Read-only view for collision checks in the scene. */
  get active(): readonly Projectile[] { return this.pool.filter(p => p.active); }

  update(dt: number, ctx: UpdateContext): void {
    for (const p of this.pool) if (p.active) p.update(dt, ctx);
  }
  render(renderer: Renderer): void {
    for (const p of this.pool) if (p.active) p.render(renderer);
  }
  releaseAll(): void { for (const p of this.pool) p.active = false; }
}
