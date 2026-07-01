import { PlayerState } from './player-state';
import { UpdateContext } from '../../../core/interfaces/game-types';

/** Knockback + brief i-frames. Player can't act until it ends. */
export class HurtState extends PlayerState {
  readonly name = 'hurt';
  private timer = 0;
  private readonly duration = 0.4;
  override enter(): void {
    this.timer = 0;
    this.player.velocity.x = -this.player.facing * 220;
    this.player.velocity.y = -260;
    this.player.invulnerableFor(0.8);
  }
  update(dt: number, ctx: UpdateContext): PlayerState | null {
    this.timer += dt;
    if (this.timer >= this.duration && this.player.onGround) {
      return (ctx.input.left || ctx.input.right) ? this.player.states.run : this.player.states.idle;
    }
    return null;
  }
}
