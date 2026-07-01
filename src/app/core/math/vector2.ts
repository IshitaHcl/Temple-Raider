/** Immutable-friendly 2D vector. Methods return new instances; mutators are explicit. */
export class Vector2 {
  constructor(public x = 0, public y = 0) {}

  static zero(): Vector2 { return new Vector2(0, 0); }

  clone(): Vector2 { return new Vector2(this.x, this.y); }
  set(x: number, y: number): this { this.x = x; this.y = y; return this; }

  add(v: Vector2): Vector2 { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v: Vector2): Vector2 { return new Vector2(this.x - v.x, this.y - v.y); }
  scale(s: number): Vector2 { return new Vector2(this.x * s, this.y * s); }

  addMut(v: Vector2): this { this.x += v.x; this.y += v.y; return this; }

  length(): number { return Math.hypot(this.x, this.y); }
  distanceTo(v: Vector2): number { return Math.hypot(this.x - v.x, this.y - v.y); }

  normalized(): Vector2 {
    const len = this.length();
    return len === 0 ? new Vector2() : new Vector2(this.x / len, this.y / len);
  }
}
