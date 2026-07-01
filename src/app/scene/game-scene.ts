import { IWorld, GameEvent, UpdateContext } from '../core/interfaces/game-types';
import { InputManager } from '../core/engine/input-manager';
import { Renderer } from '../core/engine/renderer';
import { Camera } from '../core/engine/camera';
import { Tilemap, Tile } from '../game-objects/tilemap';
import { Player } from '../game-objects/player/player';
import { Entity } from '../game-objects/entity';
import { Enemy } from '../game-objects/enemies/enemy';
import { Boss } from '../game-objects/enemies/boss';
import { ProjectilePool } from '../game-objects/projectiles/projectile-pool';
import { LeverDoor } from '../game-objects/puzzles/lever-door';
import { Puzzle } from '../game-objects/puzzles/puzzle';
import { LevelDefinition } from '../data/level.model';
import { PatrolEnemy } from '../game-objects/enemies/patrol-enemy';
import { ChaserEnemy } from '../game-objects/enemies/chaser-enemy';
import { SpikeTrap } from '../game-objects/traps/spike-trap';
import { DartTrap } from '../game-objects/traps/dart-trap';
import { PressurePlate } from '../game-objects/puzzles/pressure-plate';
import { Relic } from '../game-objects/collectibles/relic';

/** The runtime world. Implements IWorld (the contract game objects depend on)
 *  and acts as the composition root that builds a level into live objects,
 *  ticks them, resolves inter-object collisions, and routes domain events out
 *  to the Angular layer via the injected `onEvent` sink. */
export class GameScene implements IWorld {
  readonly tilemap: Tilemap;
  readonly player: Player;
  readonly camera: Camera;

  private readonly entities: Entity[] = [];   // enemies, traps, relics, doors, plates
  private readonly puzzles: Puzzle[] = [];
  private readonly doors: LeverDoor[] = [];
  private readonly plateLinks = new Map<string, LeverDoor[]>(); // plateId -> doors
  private readonly pool = new ProjectilePool(80);
  private finished = false;

  constructor(
    private readonly def: LevelDefinition,
    viewW: number, viewH: number,
    private readonly onEvent: (e: GameEvent) => void,
  ) {
    this.tilemap = new Tilemap(def.grid as Tile[][], def.tileSize);
    this.camera = new Camera(viewW, viewH);
    this.player = new Player(def.playerSpawn.x, def.playerSpawn.y);
    this.build();
  }

  // ---- IWorld ----
  spawnProjectile(x: number, y: number, vx: number, vy: number, owner: 'player' | 'enemy'): void {
    this.pool.spawn(x, y, vx, vy, owner);
  }
  emit(e: GameEvent): void {
    if (e.type === 'puzzle-solved') this.plateLinks.get(e.id)?.forEach(d => d.open());
    if (e.type === 'level-complete') this.finished = true;
    this.onEvent(e);
  }

  private build(): void {
    for (const r of this.def.relics) this.entities.push(new Relic(r.x, r.y, r.id, r.name));
    for (const p of this.def.patrols) this.entities.push(new PatrolEnemy(p.x, p.y, p.minX, p.maxX));
    for (const c of this.def.chasers) this.entities.push(new ChaserEnemy(c.x, c.y));
    for (const s of this.def.spikes) this.entities.push(new SpikeTrap(s.x, s.y, s.width, s.period));
    for (const d of this.def.darts) this.entities.push(new DartTrap(d.x, d.y, d.dir));
    for (const pl of this.def.plates) {
      const plate = new PressurePlate(pl.id, pl.x, pl.y, pl.width);
      this.puzzles.push(plate); this.entities.push(plate);
    }
    for (const dr of this.def.doors) {
      const door = new LeverDoor(dr.id, this.tilemap, dr.col, dr.row, dr.heightTiles);
      this.doors.push(door); this.puzzles.push(door); this.entities.push(door);
      const arr = this.plateLinks.get(dr.linkedPlate) ?? [];
      arr.push(door); this.plateLinks.set(dr.linkedPlate, arr);
    }
    if (this.def.boss) this.entities.push(new Boss(this.def.boss.x, this.def.boss.y));
  }

  update(dt: number, input: InputManager): void {
    const ctx: UpdateContext = { input, world: this };
    this.player.update(dt, ctx);
    for (const e of this.entities) if (e.alive) e.update(dt, ctx);
    this.pool.update(dt, ctx);
    this.resolveCombat(ctx);
    this.cull();
    this.checkExit();
    this.camera.follow(this.player.bounds, this.tilemap.pixelWidth, this.tilemap.pixelHeight);
  }

  private resolveCombat(ctx: UpdateContext): void {
    // Player melee vs enemies
    if (this.player.attackHitbox) {
      for (const e of this.entities) {
        if (e instanceof Enemy && e.alive && this.player.attackHitbox.intersects(e.bounds)) {
          e.takeDamage(25, ctx);
        }
      }
    }
    // Projectiles vs targets
    for (const p of this.pool.active) {
      if (p.owner === 'player') {
        for (const e of this.entities) {
          if (e instanceof Enemy && e.alive && p.bounds.intersects(e.bounds)) {
            e.takeDamage(p.damage, ctx); p.active = false; break;
          }
        }
      } else if (p.bounds.intersects(this.player.bounds)) {
        this.player.takeDamage(p.damage, ctx); p.active = false;
      }
    }
  }

  private cull(): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      if (!this.entities[i].alive) this.entities.splice(i, 1);
    }
  }

  private checkExit(): void {
    if (this.finished) return;
    const noBossOrDead = !this.def.boss || !this.entities.some(e => e instanceof Boss);
    if (this.def.exitX != null && this.player.bounds.x >= this.def.exitX && noBossOrDead) {
      this.emit({ type: 'level-complete' });
    }
  }

  render(renderer: Renderer): void {
    renderer.clear('#0b0d14');
    this.tilemap.render(renderer);
    [...this.entities].sort((a, b) => a.zIndex - b.zIndex).forEach(e => e.render(renderer));
    this.pool.render(renderer);
    this.player.render(renderer);
  }

  get bossRef(): Boss | undefined { return this.entities.find(e => e instanceof Boss) as Boss | undefined; }
}
