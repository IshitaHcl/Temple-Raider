import { Rect } from '../core/math/rect';
import { Vector2 } from '../core/math/vector2';
import { Renderable, Updatable, UpdateContext, ISpatial } from '../core/interfaces/game-types';
import { Renderer } from '../core/engine/renderer';

/** Base class for every dynamic thing in the world.
 *  Single Responsibility: holds spatial state + lifecycle; subclasses add behavior. */
export abstract class Entity implements Updatable, Renderable, ISpatial {
  readonly bounds: Rect;
  velocity = new Vector2();
  alive = true;
  facing: 1 | -1 = 1;
  abstract readonly zIndex: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.bounds = new Rect(x, y, w, h);
  }

  get position(): Vector2 { return new Vector2(this.bounds.x, this.bounds.y); }

  abstract update(dt: number, ctx: UpdateContext): void;
  abstract render(renderer: Renderer): void;

  /** Called when the object should be removed from the scene next frame. */
  destroy(): void { this.alive = false; }
}
