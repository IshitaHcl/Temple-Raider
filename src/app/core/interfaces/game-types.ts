import { Renderer } from '../engine/renderer';
import { InputManager } from '../engine/input-manager';

/** Anything that advances with the simulation. dt is seconds. */
export interface Updatable {
  update(dt: number, ctx: UpdateContext): void;
}

/** Anything that draws itself through the renderer abstraction. */
export interface Renderable {
  render(renderer: Renderer): void;
  /** Lower renders first (background). */
  readonly zIndex: number;
}

/** Shared per-frame context passed down the update tree. Keeps objects decoupled
 *  from concrete service implementations (Dependency Inversion). */
export interface UpdateContext {
  input: InputManager;
  world: IWorld;
}

/** The slice of the world that game objects are allowed to see.
 *  Concrete GameScene implements this; objects depend on the abstraction. */
export interface IWorld {
  readonly tilemap: ITilemap;
  readonly player: ISpatial;
  spawnProjectile(x: number, y: number, vx: number, vy: number, owner: 'player' | 'enemy'): void;
  emit(event: GameEvent): void;
}

export interface ISpatial {
  readonly bounds: import('../math/rect').Rect;
}

export interface ITilemap {
  readonly tileSize: number;
  readonly cols: number;
  readonly rows: number;
  isSolid(col: number, row: number): boolean;
}

export type GameEvent =
  | { type: 'relic-collected'; id: string; name: string }
  | { type: 'player-damaged'; amount: number }
  | { type: 'player-healed'; amount: number }
  | { type: 'enemy-killed'; points: number }
  | { type: 'boss-defeated' }
  | { type: 'level-complete' }
  | { type: 'puzzle-solved'; id: string };
