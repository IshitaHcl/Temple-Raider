import { Vector2 } from './vector2';

/** Axis-aligned rectangle used for positions and collision bounds. */
export class Rect {
  constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}

  get left(): number { return this.x; }
  get right(): number { return this.x + this.width; }
  get top(): number { return this.y; }
  get bottom(): number { return this.y + this.height; }
  get centerX(): number { return this.x + this.width / 2; }
  get centerY(): number { return this.y + this.height / 2; }
  get center(): Vector2 { return new Vector2(this.centerX, this.centerY); }

  intersects(o: Rect): boolean {
    return this.left < o.right && this.right > o.left &&
           this.top < o.bottom && this.bottom > o.top;
  }

  contains(px: number, py: number): boolean {
    return px >= this.left && px <= this.right && py >= this.top && py <= this.bottom;
  }
}
