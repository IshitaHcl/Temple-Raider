import { PlayerState } from './player-state';
import { UpdateContext } from '../../../core/interfaces/game-types';

/** Air control + variable jump height (releasing jump early cuts upward velocity). */
export class JumpState extends PlayerState {
  readonly name = 'jump';
  update(_dt: number, ctx: UpdateContext): PlayerState | null {
    const dir = (ctx.input.right ? 1 : 0) - (ctx.input.left ? 1 : 0);
    this.player.velocity.x = dir * this.player.speed * 0.85;
    if (dir !== 0) this.player.facing = dir > 0 ? 1 : -1;
    if (ctx.input.wasReleased('Space') && this.player.velocity.y < 0) {
      this.player.velocity.y *= 0.45;
    }
    if (this.player.onGround) {
      return (ctx.input.left || ctx.input.right) ? this.player.states.run : this.player.states.idle;
    }
    return null;
  }
}
