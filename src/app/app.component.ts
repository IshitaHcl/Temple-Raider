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
    :host { display:block; min-height:100vh; background:#06070c; }
    .stage { position:relative; width:min(960px,100vw); margin:0 auto; aspect-ratio:16/9; }
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
