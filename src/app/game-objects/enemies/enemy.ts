import { Entity } from '../entity';
import { UpdateContext } from '../../core/interfaces/game-types';
import { moveAndCollide } from '../../core/physics/collision';

/** Base enemy: health, gravity, ground physics, contact damage to the player.
 *  Liskov-friendly — every subclass is a drop-in Entity the scene can update. */
export abstract class Enemy extends Entity {
  readonly zIndex = 8;
  health: number;
  maxHealth: number;
  protected onGround = false;
  /** Subclasses can zero this (e.g. a floating boss manages its own Y). */
  protected gravity = 1800;
  contactDamage = 12;
  points = 100;

  constructor(x: number, y: number, w: number, h: number, health: number) {
    super(x, y, w, h);
    this.health = this.maxHealth = health;
  }

  takeDamage(amount: number, ctx: UpdateContext): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
      ctx.world.emit({ type: 'enemy-killed', points: this.points });
    }
  }

  /** Shared physics + contact damage. Subclasses implement decide() for AI. */
  update(dt: number, ctx: UpdateContext): void {
    this.decide(dt, ctx);
    this.velocity.y = Math.min(this.velocity.y + this.gravity * dt, 900);
    const res = moveAndCollide(this.bounds, this.velocity, dt, ctx.world.tilemap);
    this.bounds.x = res.position.x;
    this.bounds.y = res.position.y;
    this.velocity = res.velocity;
    this.onGround = res.onGround;
    if (res.hitWall) this.onWall();

    if (this.bounds.intersects(ctx.world.player.bounds)) {
      const player = ctx.world.player as unknown as { takeDamage?: (n: number, c: UpdateContext) => void };
      player.takeDamage?.(this.contactDamage, ctx);
    }
  }

  protected onWall(): void {}
  protected abstract decide(dt: number, ctx: UpdateContext): void;
}
