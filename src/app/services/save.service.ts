import { Injectable } from '@angular/core';

export interface SaveData {
  version: number;
  savedAt: number;
  levelIndex: number;
  score: number;
  health: number;
  inventory: { relics: { id: string; name: string; collectedAt: number }[]; keys: string[] };
}

/** localStorage-backed save system. Versioned so future schema changes can
 *  migrate old saves instead of crashing. Single Responsibility: persistence. */
@Injectable({ providedIn: 'root' })
export class SaveService {
  private readonly KEY = 'temple-raider.save.v1';
  private readonly VERSION = 1;

  hasSave(): boolean { return localStorage.getItem(this.KEY) !== null; }

  save(data: Omit<SaveData, 'version' | 'savedAt'>): boolean {
    try {
      const payload: SaveData = { ...data, version: this.VERSION, savedAt: Date.now() };
      localStorage.setItem(this.KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('[SaveService] save failed', e);
      return false;
    }
  }

  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
      return this.migrate(data);
    } catch (e) {
      console.error('[SaveService] load failed', e);
      return null;
    }
  }

  clear(): void { localStorage.removeItem(this.KEY); }

  /** Hook for forward-compatible schema migrations. */
  private migrate(data: SaveData): SaveData {
    if (data.version === this.VERSION) return data;
    // e.g. if (data.version === 0) { ...transform... }
    return { ...data, version: this.VERSION };
  }
}
