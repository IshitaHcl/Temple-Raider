import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'tr-inventory-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <h3>Relics</h3>
      @if (inventory.relicCount() === 0) { <p class="empty">None recovered yet.</p> }
      <ul>
        @for (r of inventory.relics(); track r.id) { <li>◆ {{ r.name }}</li> }
      </ul>
    </div>
  `,
  styles: [`
    .panel { position:absolute; top:70px; right:14px; width:200px; background:rgba(12,14,22,.78);
             border:1px solid #3a3d4d; border-radius:8px; padding:10px 14px; color:#f4ead2;
             font-family:'Trebuchet MS',sans-serif; font-size:13px; }
    h3 { margin:0 0 6px; color:#ffe27a; font-size:13px; letter-spacing:2px; }
    ul { list-style:none; margin:0; padding:0; } li { color:#f4d97b; padding:2px 0; }
    .empty { opacity:.5; margin:0; }
  `],
})
export class InventoryPanelComponent {
  inventory = inject(InventoryService);
}
