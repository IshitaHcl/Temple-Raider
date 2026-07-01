import { PlayerState } from './player-state';
import { UpdateContext } from '../../../core/interfaces/game-types';

export class IdleState extends PlayerState {
  readonly name = 'idle';
  update(_dt: number, ctx: UpdateContext): PlayerState | null {
    this.player.velocity.x = 0;
    if (ctx.input.attackPressed) return this.player.states.attack;
    if (ctx.input.jumpPressed && this.player.onGround) return this.player.beginJump();
    if (ctx.input.left || ctx.input.right) return this.player.states.run;
    return null;
  }
}
