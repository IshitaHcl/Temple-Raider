import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject,
  ChangeDetectionStrategy, NgZone,
} from '@angular/core';
import { GameLoop } from '../../core/engine/game-loop';
import { InputManager } from '../../core/engine/input-manager';
import { Renderer } from '../../core/engine/renderer';
import { GameScene } from '../../scene/game-scene';
import { GameStateService } from '../../services/game-state.service';
import { InventoryService } from '../../services/inventory.service';
import { LevelService } from '../../services/level.service';
import { SaveService } from '../../services/save.service';
import { GameEvent } from '../../core/interfaces/game-types';

const VIEW_W = 960, VIEW_H = 540;

/** Semantic action -> key code the InputManager already understands.
 *  Touch buttons emit these so keyboard and touch share one code path. */
const TOUCH_KEYS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  jump: 'Space',
  attack: 'KeyJ',
  shoot: 'KeyK',
  interact: 'KeyE',
} as const;

/** Bridges Angular and the imperative game engine. Owns the canvas, the loop,
 *  input, and the active GameScene. Runs the loop OUTSIDE Angular's zone so
 *  requestAnimationFrame doesn't trigger change detection 60x/second; it only
 *  pushes into signals, which update the HUD efficiently. */
@Component({
  selector: 'tr-game-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas #canvas [width]="VIEW_W" [height]="VIEW_H" tabindex="0"></canvas>

    @if (showTouch && state.isPlaying()) {
      <!-- On-screen controls. Rendered only on touch devices while playing.
           Each button feeds a virtual key press into the shared InputManager. -->
      <div class="touch" aria-hidden="false">
        <button class="pause-btn" aria-label="Pause"
          (pointerdown)="onPause($event)">II</button>

        <div class="pad left-cluster">
          <button class="btn dpad" aria-label="Move left"
            (pointerdown)="hold('left', $event)"
            (pointerup)="release('left', $event)"
            (pointercancel)="release('left', $event)"
            (pointerleave)="release('left', $event)"
            (contextmenu)="block($event)">◀</button>
          <button class="btn dpad" aria-label="Move right"
            (pointerdown)="hold('right', $event)"
            (pointerup)="release('right', $event)"
            (pointercancel)="release('right', $event)"
            (pointerleave)="release('right', $event)"
            (contextmenu)="block($event)">▶</button>
        </div>

        <div class="pad right-cluster">
          <button class="btn action attack" aria-label="Attack"
            (pointerdown)="hold('attack', $event)"
            (pointerup)="release('attack', $event)"
            (pointercancel)="release('attack', $event)"
            (contextmenu)="block($event)"><span>⚔</span><small>ATK</small></button>
          <button class="btn action shoot" aria-label="Shoot"
            (pointerdown)="hold('shoot', $event)"
            (pointerup)="release('shoot', $event)"
            (pointercancel)="release('shoot', $event)"
            (contextmenu)="block($event)"><span>✦</span><small>SHOOT</small></button>
          <button class="btn action interact" aria-label="Interact"
            (pointerdown)="hold('interact', $event)"
            (pointerup)="release('interact', $event)"
            (pointercancel)="release('interact', $event)"
            (contextmenu)="block($event)"><span>✋</span><small>USE</small></button>
          <button class="btn action jump" aria-label="Jump"
            (pointerdown)="hold('jump', $event)"
            (pointerup)="release('jump', $event)"
            (pointercancel)="release('jump', $event)"
            (contextmenu)="block($event)"><span>⤒</span><small>JUMP</small></button>
        </div>
      </div>

      <div class="rotate-hint">↻ Rotate your device to landscape for the best view</div>
    }
  `,
  styles: [`
    :host { display:block; line-height:0; }
    canvas { display:block; width:100%; height:auto; image-rendering:pixelated;
             background:#0b0d14; outline:none; border-radius:8px; touch-action:none; }

    /* Overlay layer: fixed to the viewport so controls sit at the screen edges
       regardless of the letterboxed 16:9 stage. Container ignores pointers;
       only the buttons capture them. */
    .touch {
      position:fixed; inset:0; z-index:50; pointer-events:none;
      font-family:system-ui, sans-serif;
    }
    .touch .pad { position:absolute; bottom:max(18px, env(safe-area-inset-bottom));
                  display:flex; gap:14px; pointer-events:none; }
    .left-cluster  { left:max(16px, env(safe-area-inset-left)); }
    .right-cluster { right:max(16px, env(safe-area-inset-right)); align-items:flex-end; }

    .btn {
      pointer-events:auto; touch-action:none; user-select:none; -webkit-user-select:none;
      -webkit-tap-highlight-color:transparent; cursor:pointer;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      border:2px solid rgba(255,226,122,.55); border-radius:50%;
      background:rgba(11,13,20,.55); color:#ffe27a;
      backdrop-filter:blur(2px); transition:transform .05s, background .05s;
      line-height:1;
    }
    .btn:active, .btn.pressed { background:rgba(255,226,122,.85); color:#06070c;
                                transform:scale(.94); }
    .btn small { font-size:10px; font-weight:700; letter-spacing:.5px; margin-top:2px;
                 line-height:1; }

    .dpad   { width:74px; height:74px; font-size:30px; }
    .action { width:64px; height:64px; font-size:22px; }
    .action.jump { width:84px; height:84px; font-size:30px;
                   border-color:rgba(120,220,160,.7); color:#8fe6b0; }
    .action.jump:active { background:rgba(143,230,176,.85); color:#06070c; }

    /* Stack the four action buttons: jump largest at the far-bottom-right,
       attack/shoot/interact in an arc to its left. Simple row wrap keeps it
       reliable across screen sizes. */
    .right-cluster { flex-wrap:wrap; max-width:170px; justify-content:flex-end; }

    .pause-btn {
      pointer-events:auto; position:absolute; top:max(12px, env(safe-area-inset-top));
      right:max(12px, env(safe-area-inset-right));
      width:44px; height:44px; border-radius:10px;
      border:2px solid rgba(255,226,122,.55); background:rgba(11,13,20,.6);
      color:#ffe27a; font-weight:800; letter-spacing:2px; font-size:16px;
      touch-action:none; user-select:none; cursor:pointer;
      -webkit-tap-highlight-color:transparent;
    }
    .pause-btn:active { background:rgba(255,226,122,.85); color:#06070c; }

    .rotate-hint {
      position:fixed; left:0; right:0; top:8px; z-index:60; text-align:center;
      pointer-events:none; display:none;
      color:#ffe27a; font:600 13px/1.3 system-ui, sans-serif;
      text-shadow:0 1px 3px #000;
    }
    @media (orientation:portrait) { .rotate-hint { display:block; } }
  `],
})
export class GameCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  readonly VIEW_W = VIEW_W; readonly VIEW_H = VIEW_H;

  private readonly zone = inject(NgZone);
  protected readonly state = inject(GameStateService);
  private readonly inventory = inject(InventoryService);
  private readonly levels = inject(LevelService);
  private readonly saves = inject(SaveService);

  /** True on touch/coarse-pointer devices; drives whether the on-screen pad renders. */
  readonly showTouch =
    typeof window !== 'undefined' &&
    (('ontouchstart' in window) ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      window.matchMedia?.('(pointer: coarse)').matches);

  private input = new InputManager();
  private loop?: GameLoop;
  private scene?: GameScene;
  private renderer?: Renderer;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    this.input.attach();
    canvas.focus();
    this.startLevel(this.state.levelIndex());
    this.loop = new GameLoop(
      dt => this.scene && this.renderer && this.tick(dt),
      () => this.scene?.render(this.renderer!),
    );
    this.zone.runOutsideAngular(() => this.loop!.start());
    // expose a save hook for the pause menu
    (window as any).__trSave = () => this.persist();
  }

  private startLevel(index: number): void {
    const def = this.levels.get(index);
    if (!def) { this.state.setScreen('victory'); return; }
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.scene = new GameScene(def, VIEW_W, VIEW_H, e => this.onGameEvent(e));
    this.renderer = new Renderer(ctx, this.scene.camera);
    this.state.maxHealth.set(this.scene.player.maxHealth);
    this.state.health.set(this.scene.player.health);
    this.state.bossActive.set(!!def.boss);
  }

  private tick(dt: number): void {
    if (this.state.screen() !== 'playing') return;
    this.scene!.update(dt, this.input);
    this.input.endFrame();
    // sync engine -> signals (must re-enter the zone so the UI updates)
    const p = this.scene!.player;
    const boss = this.scene!.bossRef;
    this.zone.run(() => {
      this.state.health.set(Math.round(p.health));
      if (boss) this.state.bossHealthPct.set(boss.health / boss.maxHealth);
      if (p.health <= 0 && this.state.screen() === 'playing') this.state.setScreen('gameover');
    });
  }

  private onGameEvent(e: GameEvent): void {
    this.zone.run(() => {
      switch (e.type) {
        case 'relic-collected': this.inventory.addRelic(e.id, e.name); this.state.addScore(250); break;
        case 'enemy-killed': this.state.addScore(e.points); break;
        case 'boss-defeated': this.state.addScore(2000); this.state.bossActive.set(false); break;
        case 'level-complete': this.advance(); break;
      }
    });
  }

  private advance(): void {
    const next = this.state.levelIndex() + 1;
    if (this.levels.get(next)) {
      this.state.levelIndex.set(next);
      this.startLevel(next);
    } else {
      this.state.setScreen('victory');
    }
  }

  private persist(): void {
    this.saves.save({
      levelIndex: this.state.levelIndex(),
      score: this.state.score(),
      health: this.state.health(),
      inventory: this.inventory.serialize(),
    });
  }

  // ---- On-screen touch controls -------------------------------------------
  // Each button maps a semantic action to the key code the InputManager and all
  // player states already understand, so touch and keyboard drive one code path.

  /** Press: start holding the mapped key. Captures the pointer so the release
   *  event still fires on this button even if the finger drifts off it. */
  hold(action: keyof typeof TOUCH_KEYS, e: PointerEvent): void {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    (e.currentTarget as HTMLElement).classList.add('pressed');
    this.input.virtualDown(TOUCH_KEYS[action]);
  }

  /** Release the mapped key. */
  release(action: keyof typeof TOUCH_KEYS, e: PointerEvent): void {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove('pressed');
    this.input.virtualUp(TOUCH_KEYS[action]);
  }

  /** Pause button — mirrors the Escape key. Release held buttons first so the
   *  player doesn't keep a direction pressed while paused. */
  onPause(e: PointerEvent): void {
    e.preventDefault();
    this.input.releaseAll();
    if (this.state.screen() === 'playing') this.state.setScreen('paused');
  }

  /** Suppress the long-press context menu on control buttons. */
  block(e: Event): void { e.preventDefault(); }

  ngOnDestroy(): void {
    this.loop?.stop();
    this.input.detach();
    delete (window as any).__trSave;
  }
}
