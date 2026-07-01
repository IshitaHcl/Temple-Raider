import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'tr-game-over',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overlay" [class.win]="victory()">
      <h2>{{ victory() ? 'EXPEDITION COMPLETE' : 'YOU PERISHED' }}</h2>
      <p>Score: {{ state.score() }} · Relics: {{ inventory.relicCount() }}</p>
      <button (click)="toMenu()">Return to Menu</button>
    </div>
  `,
  styles: [`
    .overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
               justify-content:center; gap:14px; background:rgba(40,8,8,.85); color:#f4ead2;
               font-family:'Trebuchet MS',sans-serif; }
    .overlay.win { background:rgba(8,30,18,.85); }
    h2 { letter-spacing:5px; color:#ffe27a; }
    button { padding:12px 36px; cursor:pointer; border:1px solid #6b5a38; background:#161922;
             color:#f4ead2; border-radius:6px; }
    button:hover { background:#222637; border-color:#ffe27a; }
  `],
})
export class GameOverComponent {
  victory = input(false);
  state = inject(GameStateService);
  inventory = inject(InventoryService);
  toMenu() { this.state.setScreen('menu'); }
}
