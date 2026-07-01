import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'tr-pause-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overlay">
      <h2>PAUSED</h2>
      <button (click)="resume()">Resume</button>
      <button (click)="save()">Save Progress</button>
      <button (click)="quit()">Abandon to Menu</button>
      @if (saved) { <span class="ok">Progress saved.</span> }
    </div>
  `,
  styles: [`
    .overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
               justify-content:center; gap:12px; background:rgba(6,7,12,.82); color:#f4ead2;
               font-family:'Trebuchet MS',sans-serif; }
    h2 { letter-spacing:6px; color:#ffe27a; }
    button { padding:12px 36px; cursor:pointer; border:1px solid #6b5a38; background:#161922;
             color:#f4ead2; border-radius:6px; min-width:220px; }
    button:hover { background:#222637; border-color:#ffe27a; }
    .ok { color:#3fa34d; font-size:13px; }
  `],
})
export class PauseMenuComponent {
  state = inject(GameStateService);
  saved = false;
  resume() { this.state.setScreen('playing'); }
  save() { (window as any).__trSave?.(); this.saved = true; setTimeout(() => this.saved = false, 1500); }
  quit() { this.state.setScreen('menu'); }
}
