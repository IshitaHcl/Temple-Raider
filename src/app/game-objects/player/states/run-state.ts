import { PlayerState } from './player-state';
import { UpdateContext } from '../../../core/interfaces/game-types';

export class RunState extends PlayerState {
  readonly name = 'run';
  update(_dt: number, ctx: UpdateContext): PlayerState | null {
    const dir = (ctx.input.right ? 1 : 0) - (ctx.input.left ? 1 : 0);
    this.player.velocity.x = dir * this.player.speed;
    if (dir !== 0) this.player.facing = dir > 0 ? 1 : -1;
    if (ctx.input.attackPressed) return this.player.states.attack;
    if (ctx.input.jumpPressed && this.player.onGround) return this.player.beginJump();
    if (dir === 0) return this.player.states.idle;
    return null;
  }
}
