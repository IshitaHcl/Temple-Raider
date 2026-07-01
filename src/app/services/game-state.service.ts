import { Injectable, signal, computed } from '@angular/core';

export type Screen = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

/** Global, UI-facing game state. The canvas writes here (health, score) and
 *  the Angular UI reads via signals. Keeps the render loop and the DOM decoupled. */
@Injectable({ providedIn: 'root' })
export class GameStateService {
  readonly screen = signal<Screen>('menu');
  readonly health = signal(100);
  readonly maxHealth = signal(100);
  readonly score = signal(0);
  readonly levelIndex = signal(0);
  readonly bossActive = signal(false);
  readonly bossHealthPct = signal(1);

  readonly healthPct = computed(() => this.health() / this.maxHealth());
  readonly isPlaying = computed(() => this.screen() === 'playing');

  setScreen(s: Screen): void { this.screen.set(s); }
  addScore(n: number): void { this.score.update(v => v + n); }

  resetForNewGame(): void {
    this.health.set(100); this.maxHealth.set(100);
    this.score.set(0); this.levelIndex.set(0);
    this.bossActive.set(false); this.bossHealthPct.set(1);
  }
}
