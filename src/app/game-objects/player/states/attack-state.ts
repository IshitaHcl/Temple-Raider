import { PlayerState } from './player-state';
import { UpdateContext } from '../../../core/interfaces/game-types';
import { Rect } from '../../../core/math/rect';

/** A short melee swing with an active hitbox window. Locks horizontal movement
 *  briefly, then returns to idle/run. */
export class AttackState extends PlayerState {
  readonly name = 'attack';
  private timer = 0;
  private readonly duration = 0.28;

  override enter(): void { this.timer = 0; this.player.attackHitbox = null; }
  override exit(): void { this.player.attackHitbox = null; }

  update(dt: number, ctx: UpdateContext): PlayerState | null {
    this.timer += dt;
    this.player.velocity.x *= 0.6;
    // Active frames: hitbox in front of the player.
    if (this.timer > 0.06 && this.timer < 0.2) {
      const b = this.player.bounds;
      const w = 34;
      this.player.attackHitbox = new Rect(
        this.player.facing > 0 ? b.right : b.left - w, b.y + 8, w, b.height - 16,
      );
    } else {
      this.player.attackHitbox = null;
    }
    if (this.timer >= this.duration) {
      return (ctx.input.left || ctx.input.right) ? this.player.states.run : this.player.states.idle;
    }
    return null;
  }
}
