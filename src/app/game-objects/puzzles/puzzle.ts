import { Entity } from '../entity';

/** A puzzle element. `solved` gates downstream effects (doors, etc.).
 *  Keeping this abstract lets the scene treat all puzzle parts uniformly. */
export abstract class Puzzle extends Entity {
  readonly zIndex = 4;
  abstract readonly id: string;
  abstract get solved(): boolean;
}
