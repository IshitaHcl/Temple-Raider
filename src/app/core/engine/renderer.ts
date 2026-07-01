import { Camera } from './camera';

/** Thin wrapper over CanvasRenderingContext2D. All world-space draw calls are
 *  translated by the camera so game objects never touch the camera directly.
 *  This is the single point that knows about the actual canvas API. */
export class Renderer {
  constructor(
    public readonly ctx: CanvasRenderingContext2D,
    public readonly camera: Camera,
  ) {}

  get width(): number { return this.ctx.canvas.width; }
  get height(): number { return this.ctx.canvas.height; }

  clear(color = '#0b0d14'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /** World-space filled rectangle. */
  rect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x - this.camera.x), Math.round(y - this.camera.y), w, h);
  }

  strokeRect(x: number, y: number, w: number, h: number, color: string, lw = 2): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lw;
    this.ctx.strokeRect(Math.round(x - this.camera.x), Math.round(y - this.camera.y), w, h);
  }

  circle(x: number, y: number, r: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x - this.camera.x, y - this.camera.y, r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /** Screen-space text (HUD-style overlays drawn inside the canvas). */
  text(t: string, x: number, y: number, color = '#fff', font = '16px monospace'): void {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.fillText(t, x, y);
  }
}
