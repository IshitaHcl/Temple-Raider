# Temple Raider

A browser-based action-adventure game inspired by Tomb Raider — explore ruins, solve
pressure-plate puzzles, dodge traps, fight guards, defeat a boss, collect relics, and
save your progress. Built with **Angular 18**, **TypeScript (strict)**, **HTML5 Canvas**,
and CSS.

> Status: this is a fully buildable, playable vertical slice with production-grade
> architecture. The engine, one complete level, all core systems, and the full UI are
> implemented. It is intentionally structured so content and features expand by adding
> data and classes — not by editing the engine.

## Quick start

```bash
npm install
npm start          # ng serve --open  -> http://localhost:4200
npm run build      # production build into dist/temple-raider
```

### Controls
| Action | Keys |
| --- | --- |
| Move | A / D or ← / → |
| Jump (variable height) | Space / W / ↑ |
| Melee attack | J |
| Shoot (pooled projectile) | K |
| Pause / Save | Esc |

### Mobile / touch controls
On touch devices the game shows an on-screen control pad automatically (detected
via coarse-pointer / touch capability): a left/right D-pad on the bottom-left, and
**Jump / Attack (⚔) / Shoot (✦) / Use (✋)** buttons on the bottom-right, plus a pause
button (`II`) top-right. These feed the same input pipeline as the keyboard, so no
game logic is duplicated. Landscape orientation is recommended (a hint appears in
portrait).

## Architecture

The codebase is split into four layers with a strict one-directional dependency rule:
**UI → Scene → Game Objects → Core**. Lower layers never import higher ones.

```
Core        pure engine + math + interfaces (no Angular, no game logic)
Game Objects entities that depend only on Core abstractions
Scene        composition root: builds a level into live objects, ties systems together
Services     Angular-injectable state/persistence (save, inventory, game state, levels)
UI           Angular standalone components; the canvas drives the engine
```

### SOLID, applied

- **Single Responsibility** — `SaveService` only persists; `InventoryService` only holds
  items; `Renderer` is the only place that touches the 2D context; `Tilemap` only owns
  geometry.
- **Open/Closed** — new abilities = new `PlayerState` subclasses; new enemies = new
  `Enemy` subclasses; new levels = new `LevelDefinition` data pushed into `LevelService`.
  No existing file is edited to extend the game.
- **Liskov** — every `Entity` (player, enemy, trap, puzzle, relic) is interchangeable
  wherever the scene iterates and renders objects.
- **Interface Segregation** — game objects depend on the small `IWorld`, `ITilemap`,
  `UpdateContext` contracts, not on the concrete `GameScene`.
- **Dependency Inversion** — `GameScene` implements `IWorld`; objects spawn projectiles
  and emit events through the interface, so they never reference the scene class or any
  Angular service directly.

### Design patterns

- **State Pattern** — `Player` delegates behavior to a current `PlayerState`
  (`IdleState`, `RunState`, `JumpState`, `AttackState`, `HurtState`). Each state handles
  input and returns the next state. Adding a "Climb" or "Crouch" ability is a new class.
- **Object Pool** — `ProjectilePool` pre-allocates a fixed array of `Projectile`s and
  recycles them via an `active` flag. No allocation happens during play, so the GC never
  spikes under heavy fire.
- **Fixed-timestep game loop** — `GameLoop` uses an accumulator so simulation is
  deterministic and independent of monitor refresh rate.
- **Reactive UI bridge** — the loop runs *outside* Angular's zone (no change detection
  60×/sec); the canvas pushes into **signals**, which update the HUD efficiently.

## Folder structure

```
temple-raider/
├── package.json · angular.json · tsconfig*.json
└── src/
    ├── main.ts · index.html · styles.css
    └── app/
        ├── app.component.ts            # screen orchestrator (menu/play/pause/over)
        ├── app.config.ts
        ├── core/                       # ENGINE — no game logic, no Angular
        │   ├── math/        vector2.ts · rect.ts
        │   ├── interfaces/  game-types.ts        # IWorld, ITilemap, UpdateContext, events
        │   ├── engine/      game-loop.ts · renderer.ts · camera.ts · input-manager.ts
        │   └── physics/     collision.ts          # per-axis swept tilemap resolution
        ├── game-objects/               # depend only on Core
        │   ├── entity.ts · tilemap.ts
        │   ├── player/      player.ts + states/   # State Pattern
        │   ├── enemies/     enemy.ts · patrol-enemy.ts · chaser-enemy.ts · boss.ts
        │   ├── projectiles/ projectile.ts · projectile-pool.ts   # Object Pool
        │   ├── traps/       trap.ts · spike-trap.ts · dart-trap.ts
        │   ├── puzzles/     puzzle.ts · pressure-plate.ts · lever-door.ts
        │   └── collectibles/relic.ts
        ├── scene/           game-scene.ts         # composition root, implements IWorld
        ├── services/        game-state · inventory · save · level
        ├── data/            level.model.ts · levels/level-1.ts
        └── ui/              game-canvas · hud · main-menu · pause-menu · inventory-panel · game-over
```

## Core systems at a glance

- **Rendering** — `Renderer` wraps the canvas context; all world draws are camera-offset,
  so objects never know about scrolling. `Camera` follows the player with smoothing and
  clamps to world bounds. Tilemap culls off-screen tiles.
- **Movement & collision** — `moveAndCollide` resolves X then Y separately against the
  tilemap (robust, no seam-snagging), reporting ground/ceiling/wall contacts. The player
  gets gravity, variable jump height, and air control.
- **Combat** — melee uses a timed active hitbox; ranged borrows from the projectile pool.
  The scene resolves player-melee→enemy, player-projectile→enemy, and
  enemy-projectile→player each frame.
- **Enemy AI** — `PatrolEnemy` (waypoint walk, turn at walls), `ChaserEnemy`
  (sensor-driven pursuit with hops), `Boss` (3 phases that escalate speed and fire rate,
  with a spread shot in the final phase).
- **Puzzles** — `PressurePlate` emits `puzzle-solved`; the scene links it to a `LeverDoor`
  that opens by punching a hole in the tilemap so collision lets the player through.
- **Save system** — versioned `localStorage` payload (level, score, health, inventory)
  with a `migrate()` hook for future schema changes.

## Step-by-step implementation plan

This is the order the project was built and the order to follow when extending it.

1. **Foundation** — `Vector2`, `Rect`, and the `IWorld`/`ITilemap`/`UpdateContext`
   interfaces. Everything depends on these, so lock the contracts first.
2. **Engine** — `InputManager`, `Camera`, `Renderer`, `GameLoop`. Verify with a single
   moving rectangle before adding game logic.
3. **World geometry** — `Tilemap` + `moveAndCollide`. Drop a static box and confirm it
   lands, slides along walls, and stops on platforms.
4. **Player + State Pattern** — `Entity`, then `Player` with the five states. Tune
   gravity, jump velocity, and air control here.
5. **Object Pool** — `Projectile` + `ProjectilePool`; wire the player's shoot input.
6. **Hazards & collectibles** — `Trap`/`SpikeTrap`/`DartTrap` and `Relic`.
7. **Enemies** — `Enemy` base, then patrol/chaser, then the multi-phase `Boss`.
8. **Puzzles** — `PressurePlate` + `LeverDoor` and the scene's plate→door linking.
9. **Scene** — `GameScene` as the composition root implementing `IWorld`: build, update,
   resolve combat, cull dead objects, follow camera, emit events.
10. **Services** — `GameStateService` (signals), `InventoryService`, `SaveService`,
    `LevelService`.
11. **UI** — `GameCanvasComponent` (the Angular↔engine bridge, runs the loop outside the
    zone), then `Hud`, menus, inventory, and the `AppComponent` screen orchestrator.
12. **Content** — author `LevelDefinition`s as data; ship, then iterate.

## How to extend

- **New level** → create `data/levels/level-N.ts` exporting a `LevelDefinition`, add it to
  the `levels` array in `LevelService`. Set `boss` for a boss arena or `exitX` for a
  reach-the-end goal. Progression and victory handling are automatic.
- **New player ability** → add a `PlayerState` subclass and a transition into it from an
  existing state. No other file changes.
- **New enemy** → extend `Enemy`, implement `decide()` and `render()`. Drop a spawn entry
  in a level. Set `gravity = 0` for a floating enemy.
- **New trap/puzzle** → extend `Trap` or `Puzzle`; emit/consume events via `IWorld`.

## Suggested next steps for a full production game

Sprite/atlas rendering via `AssetService`, an `AudioService` (Web Audio), checkpoints,
a tween/easing utility, a spatial hash to make collision O(n) at scale, an ECS refactor
if entity variety explodes, level-editor tooling that emits `LevelDefinition` JSON, and
unit tests around `moveAndCollide`, the player state machine, and `SaveService` migration.
