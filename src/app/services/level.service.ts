import { Injectable } from '@angular/core';
import { LevelDefinition } from '../data/level.model';
import { LEVEL_1 } from '../data/levels/level-1';

/** Owns the ordered list of levels and progression. Add new levels by pushing
 *  to LEVELS — no other code changes (Open/Closed). */
@Injectable({ providedIn: 'root' })
export class LevelService {
  private readonly levels: LevelDefinition[] = [LEVEL_1];

  get count(): number { return this.levels.length; }
  get(index: number): LevelDefinition | null { return this.levels[index] ?? null; }
  hasNext(index: number): boolean { return index + 1 < this.levels.length; }
}
