import { Rect } from '../math/rect';

/** Follows a target with smoothing and clamps to world bounds. */
export class Camera {
  x = 0;
  y = 0;
  constructor(public viewWidth: number, public viewHeight: number) {}

  follow(target: Rect, worldWidth: number, worldHeight: number, lerp = 0.12): void {
    const desiredX = target.centerX - this.viewWidth / 2;
    const desiredY = target.centerY - this.viewHeight / 2;
    this.x += (desiredX - this.x) * lerp;
    this.y += (desiredY - this.y) * lerp;
    this.x = clamp(this.x, 0, Math.max(0, worldWidth - this.viewWidth));
    this.y = clamp(this.y, 0, Math.max(0, worldHeight - this.viewHeight));
  }
}
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)); }
