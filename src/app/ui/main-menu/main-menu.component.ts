import { Component, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { SaveService } from '../../services/save.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'tr-main-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overlay">
      <h1>TEMPLE RAIDER</h1>
      <p class="tag">Descend. Plunder. Survive.</p>
      <div class="btns">
        <button (click)="newGame()">New Expedition</button>
        @if (saves.hasSave()) { <button (click)="continueGame()">Continue</button> }
      </div>
    </div>
  `,
  styles: [`
    .overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
               justify-content:center; gap:14px; background:radial-gradient(circle at 50% 30%,#1c2030,#06070c);
               color:#f4ead2; font-family:'Trebuchet MS',sans-serif; }
    h1 { font-size:56px; letter-spacing:6px; margin:0; color:#ffe27a; text-shadow:0 4px 20px rgba(0,0,0,.6); }
    .tag { opacity:.7; margin:0 0 18px; }
    .btns { display:flex; flex-direction:column; gap:12px; }
    button { padding:14px 40px; font-size:16px; letter-spacing:2px; cursor:pointer; border:1px solid #6b5a38;
             background:#161922; color:#f4ead2; border-radius:6px; transition:.15s; }
    button:hover { background:#222637; border-color:#ffe27a; }
  `],
})
export class MainMenuComponent {
  state = inject(GameStateService);
  saves = inject(SaveService);
  private inventory = inject(InventoryService);
  newGame() { this.state.resetForNewGame(); this.inventory.reset(); this.state.setScreen('playing'); }
  continueGame() {
    const data = this.saves.load();
    if (!data) return this.newGame();
    this.state.resetForNewGame();
    this.state.levelIndex.set(data.levelIndex);
    this.state.score.set(data.score);
    this.state.health.set(data.health);
    this.inventory.restore(data.inventory);
    this.state.setScreen('playing');
  }
}
