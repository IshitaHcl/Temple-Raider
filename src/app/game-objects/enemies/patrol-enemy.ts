import { Enemy } from './enemy';
import { UpdateContext } from '../../core/interfaces/game-types';
import { Renderer } from '../../core/engine/renderer';

/** Walks back and forth between two world X bounds, turning at walls/edges. */
export class PatrolEnemy extends Enemy {
  private dir: 1 | -1 = 1;
  constructor(x: number, y: number, private readonly minX: number, private readonly maxX: number) {
    super(x, y, 30, 34, 30);
    this.points = 100;
  }
  protected decide(_dt: number, _ctx: UpdateContext): void {
    if (this.bounds.x <= this.minX) this.dir = 1;
    else if (this.bounds.right >= this.maxX) this.dir = -1;
    this.velocity.x = this.dir * 80;
    this.facing = this.dir;
  }
  protected override onWall(): void { this.dir = (this.dir * -1) as 1 | -1; }
  render(renderer: Renderer): void {
    renderer.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#7a5230');
    renderer.rect(this.bounds.x, this.bounds.y - 6, this.bounds.width * (this.health / this.maxHealth), 3, '#e44');
  }
}
