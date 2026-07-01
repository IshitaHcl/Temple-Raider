import { Component, inject, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { GameStateService } from './services/game-state.service';
import { GameCanvasComponent } from './ui/game-canvas/game-canvas.component';
import { HudComponent } from './ui/hud/hud.component';
import { MainMenuComponent } from './ui/main-menu/main-menu.component';
import { PauseMenuComponent } from './ui/pause-menu/pause-menu.component';
import { GameOverComponent } from './ui/game-over/game-over.component';
import { InventoryPanelComponent } from './ui/inventory-panel/inventory-panel.component';

/** Screen orchestrator. The canvas is kept mounted during play/pause so the
 *  engine state survives a pause; overlays render on top via absolute layout. */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GameCanvasComponent, HudComponent, MainMenuComponent,
    PauseMenuComponent, GameOverComponent, InventoryPanelComponent,
  ],
  template: `
    <div class="stage">
      @switch (state.screen()) {
        @case ('menu') { <tr-main-menu /> }
        @default {
          <tr-game-canvas />
          <tr-hud />
          <tr-inventory-panel />
          @if (state.screen() === 'paused') { <tr-pause-menu /> }
          @if (state.screen() === 'gameover') { <tr-game-over [victory]="false" /> }
          @if (state.screen() === 'victory') { <tr-game-over [victory]="true" /> }
        }
      }
    </div>
  `,
  styles: [`
    /* Center the stage in the viewport on both axes so the letterboxed game
       sits in the middle of any screen instead of pinned to the top. */
    :host { display:flex; align-items:center; justify-content:center;
            min-height:100vh; min-height:100dvh; background:#06070c; }

    /* SAFE AREA / FIT:
       The 16:9 stage is sized to the LARGEST rectangle that fits inside the
       visible viewport in BOTH dimensions, minus device safe-area insets
       (notch, rounded corners, home indicator). We take the min of:
         - 960px                     -> never upscale past native width
         - safe viewport width       -> fits horizontally (portrait limiter)
         - safe viewport height x16/9 -> fits vertically   (landscape limiter)
       aspect-ratio then derives the height. 100dvh tracks the mobile browser's
       dynamic toolbar so nothing spills under it. The first width line is a
       fallback for browsers without dvh support. */
    .stage {
      position:relative;
      aspect-ratio:16 / 9;
      width:min(960px, 100vw, calc(100vh * 16 / 9));
      width:min(
        960px,
        calc(100vw  - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)),
        calc((100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) * 16 / 9)
      );
    }
  `],
})
export class AppComponent {
  state = inject(GameStateService);

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.code !== 'Escape') return;
    if (this.state.screen() === 'playing') this.state.setScreen('paused');
    else if (this.state.screen() === 'paused') this.state.setScreen('playing');
  }
}
