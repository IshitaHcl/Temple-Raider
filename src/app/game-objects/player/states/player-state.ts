import { UpdateContext } from '../../../core/interfaces/game-types';
import type { Player } from '../player';

/** State Pattern: each concrete state encapsulates the player's behavior and
 *  the transitions out of it. The Player delegates update to its current state.
 *  Open/Closed: new abilities = new state classes, no edits to existing ones. */
export abstract class PlayerState {
  abstract readonly name: string;
  constructor(protected player: Player) {}

  /** Called once when the state becomes active. */
  enter(): void {}
  /** Called once when leaving the state. */
  exit(): void {}
  /** Per fixed-step update. Returns the next state (or null to stay). */
  abstract update(dt: number, ctx: UpdateContext): PlayerState | null;
}
