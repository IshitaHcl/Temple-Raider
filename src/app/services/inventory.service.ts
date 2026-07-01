import { Injectable, signal, computed } from '@angular/core';

export interface RelicItem { id: string; name: string; collectedAt: number; }

/** Holds collected relics and consumables. Single Responsibility: inventory
 *  state only. Exposed as signals so the UI updates reactively. */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly _relics = signal<RelicItem[]>([]);
  private readonly _keys = signal<Set<string>>(new Set());

  readonly relics = this._relics.asReadonly();
  readonly relicCount = computed(() => this._relics().length);

  addRelic(id: string, name: string): void {
    if (this._relics().some(r => r.id === id)) return;
    this._relics.update(list => [...list, { id, name, collectedAt: Date.now() }]);
  }
  hasRelic(id: string): boolean { return this._relics().some(r => r.id === id); }

  addKey(id: string): void { this._keys.update(s => new Set(s).add(id)); }
  hasKey(id: string): boolean { return this._keys().has(id); }

  reset(): void { this._relics.set([]); this._keys.set(new Set()); }

  serialize(): { relics: RelicItem[]; keys: string[] } {
    return { relics: this._relics(), keys: [...this._keys()] };
  }
  restore(data: { relics: RelicItem[]; keys: string[] }): void {
    this._relics.set(data.relics ?? []);
    this._keys.set(new Set(data.keys ?? []));
  }
}
