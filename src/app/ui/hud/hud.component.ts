import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'tr-hud',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hud">
      <div class="left">
        <div class="bar">
          <span class="lbl">HP</span>
          <div class="track"><div class="fill" [style.width.%]="state.healthPct() * 100"></div></div>
        </div>
        <div class="relics">◆ {{ inventory.relicCount() }} relics</div>
      </div>
      <div class="right">
        <div class="score">{{ state.score() }}</div>
        <div class="hint">WASD/Arrows move · Space jump · J melee · K shoot · Esc pause</div>
      </div>
    </div>
    @if (state.bossActive()) {
      <div class="boss-bar">
        <span>GUARDIAN</span>
        <div class="track"><div class="fill boss" [style.width.%]="state.bossHealthPct() * 100"></div></div>
      </div>
    }
  `,
  styles: [`
    .hud { position:absolute; inset:0 0 auto 0; display:flex; justify-content:space-between;
           padding:14px 18px; pointer-events:none; font-family:'Trebuchet MS',sans-serif; color:#f4ead2; }
    .bar { display:flex; align-items:center; gap:8px; }
    .lbl { font-size:12px; letter-spacing:2px; opacity:.8; }
    .track { width:220px; height:14px; background:#1b1d27; border:1px solid #3a3d4d; border-radius:7px; overflow:hidden; }
    .fill { height:100%; background:linear-gradient(90deg,#e44,#f88); transition:width .15s; }
    .relics { margin-top:8px; color:#f4d97b; font-size:14px; }
    .right { text-align:right; }
    .score { font-size:28px; font-weight:700; color:#ffe27a; }
    .hint { font-size:11px; opacity:.6; margin-top:4px; }
    .boss-bar { position:absolute; left:50%; bottom:18px; transform:translateX(-50%);
                width:60%; text-align:center; color:#f4ead2; pointer-events:none; }
    .boss-bar .track { width:100%; height:16px; margin-top:4px; }
    .fill.boss { background:linear-gradient(90deg,#7a2b5e,#a3243a); }
  `],
})
export class HudComponent {
  state = inject(GameStateService);
  inventory = inject(InventoryService);
}
