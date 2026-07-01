/** Fixed-timestep loop with an accumulator and a render-interpolation hook.
 *  Decouples simulation rate from frame rate so physics is deterministic and
 *  stable regardless of monitor refresh. */
export class GameLoop {
  private rafId = 0;
  private last = 0;
  private acc = 0;
  private running = false;
  readonly step: number;

  constructor(
    private readonly onUpdate: (dt: number) => void,
    private readonly onRender: () => void,
    fps = 60,
  ) { this.step = 1 / fps; }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }
  stop(): void { this.running = false; cancelAnimationFrame(this.rafId); }

  private readonly frame = (now: number) => {
    if (!this.running) return;
    let frameTime = (now - this.last) / 1000;
    if (frameTime > 0.25) frameTime = 0.25; // clamp after tab-switch / breakpoints
    this.last = now;
    this.acc += frameTime;
    while (this.acc >= this.step) {
      this.onUpdate(this.step);
      this.acc -= this.step;
    }
    this.onRender();
    this.rafId = requestAnimationFrame(this.frame);
  };
}
