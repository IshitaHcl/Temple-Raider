import { Entity } from '../entity';

/** Base hazard. Subclasses define when they are "dangerous" and what damage
 *  they deal on contact with the player. */
export abstract class Trap extends Entity {
  readonly zIndex = 6;
  abstract get dangerous(): boolean;
  damage = 20;
}
