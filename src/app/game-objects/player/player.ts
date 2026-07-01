import { Entity } from '../entity';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';
import { Rect } from '../../core/math/rect';
import { moveAndCollide } from '../../core/physics/collision';
import { PlayerState } from './states/player-state';
import { IdleState } from './states/idle-state';
import { RunState } from './states/run-state';
import { JumpState } from './states/jump-state';
import { AttackState } from './states/attack-state';
import { HurtState } from './states/hurt-state';

const GRAVITY = 1800;
const JUMP_VELOCITY = -620;
const MAX_FALL = 900;

/** The player character. Owns a state machine (State Pattern) and the physics
 *  integration. Combat hitbox and damage intake live here; the active *behavior*
 *  is delegated to the current PlayerState. */
export class Player extends Entity {
  readonly zIndex = 10;
  readonly speed = 240;

  maxHealth = 100;
  health = 100;
  onGround = false;
  attackHitbox: Rect | null = null;

  private invulnTimer = 0;
  private current: PlayerState;
  readonly states: {
    idle: PlayerState; run: PlayerState; jump: PlayerState;
    attack: PlayerState; hurt: PlayerState;
  };

  constructor(x: number, y: number) {
    super(x, y, 28, 44);
    this.states = {
      idle: new IdleState(this), run: new RunState(this), jump: new JumpState(this),
      attack: new AttackState(this), hurt: new HurtState(this),
    };
    this.current = this.states.idle;
  }

  get stateName(): string { return this.current.name; }
  get invulnerable(): boolean { return this.invulnTimer > 0; }
  invulnerableFor(s: number): void { this.invulnTimer = s; }

  beginJump(): PlayerState {
    this.velocity.y = JUMP_VELOCITY;
    this.onGround = false;
    return this.states.jump;
  }

  private transition(next: PlayerState | null): void {
    if (!next || next === this.current) return;
    this.current.exit();
    this.current = next;
    this.current.enter();
  }

  takeDamage(amount: number, ctx: UpdateContext): void {
    if (this.invulnerable || this.current === this.states.hurt) return;
    this.health = Math.max(0, this.health - amount);
    ctx.world.emit({ type: 'player-damaged', amount });
    this.transition(this.states.hurt);
  }

  heal(amount: number): void { this.health = Math.min(this.maxHealth, this.health + amount); }

  update(dt: number, ctx: UpdateContext): void {
    if (this.invulnTimer > 0) this.invulnTimer -= dt;

    // 1. Let the active state set intent (velocity.x, transitions).
    this.transition(this.current.update(dt, ctx));

    // 2. Apply gravity.
    this.velocity.y = Math.min(this.velocity.y + GRAVITY * dt, MAX_FALL);

    // 3. Resolve against world geometry.
    const res = moveAndCollide(this.bounds, this.velocity, dt, ctx.world.tilemap);
    this.bounds.x = res.position.x;
    this.bounds.y = res.position.y;
    this.velocity = res.velocity;
    this.onGround = res.onGround;

    // 4. Ranged attack: borrow a pooled projectile from the world.
    if (ctx.input.shootPressed) {
      ctx.world.spawnProjectile(this.bounds.centerX, this.bounds.centerY, this.facing * 520, 0, 'player');
    }

    // 5. Fell out of the world (pit death handled by the scene via health).
    if (this.bounds.y > ctx.world.tilemap.rows * ctx.world.tilemap.tileSize + 200) {
      this.takeDamage(25, ctx);
      this.bounds.y = 0; // respawn at top; scene can override with checkpoints
    }
  }

  render(renderer: Renderer): void {
    const flash = this.invulnerable && Math.floor(performance.now() / 80) % 2 === 0;
    const body = flash ? '#9fb7d8' : '#4f7cc4';
    renderer.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, body);
    // visor indicates facing
    const vx = this.facing > 0 ? this.bounds.right - 8 : this.bounds.left + 2;
    renderer.rect(vx, this.bounds.y + 8, 6, 6, '#ffe27a');
    if (this.attackHitbox) {
      renderer.rect(this.attackHitbox.x, this.attackHitbox.y, this.attackHitbox.width, this.attackHitbox.height, 'rgba(255,220,120,0.45)');
    }
  }
}

