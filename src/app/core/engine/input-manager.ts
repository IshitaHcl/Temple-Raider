/** Centralized keyboard input. Tracks held keys plus edge-triggered
 *  "pressed this frame" so states can react to taps vs holds. */
export class InputManager {
  private held = new Set<string>();
  private pressed = new Set<string>();
  private released = new Set<string>();

  private readonly onDown = (e: KeyboardEvent) => {
    if (!this.held.has(e.code)) this.pressed.add(e.code);
    this.held.add(e.code);
    if (BLOCK_DEFAULT.has(e.code)) e.preventDefault();
  };
  private readonly onUp = (e: KeyboardEvent) => {
    this.held.delete(e.code);
    this.released.add(e.code);
  };

  attach(target: Window = window): void {
    target.addEventListener('keydown', this.onDown);
    target.addEventListener('keyup', this.onUp);
  }
  detach(target: Window = window): void {
    target.removeEventListener('keydown', this.onDown);
    target.removeEventListener('keyup', this.onUp);
  }

  isHeld(code: string): boolean { return this.held.has(code); }
  wasPressed(code: string): boolean { return this.pressed.has(code); }
  wasReleased(code: string): boolean { return this.released.has(code); }

  /** Virtual input for on-screen (touch) controls. These feed the exact same
   *  held/pressed/released sets as the keyboard, so all game logic that reads
   *  the semantic getters below works identically for touch and keyboard. */
  virtualDown(code: string): void {
    if (!this.held.has(code)) this.pressed.add(code);
    this.held.add(code);
  }
  virtualUp(code: string): void {
    this.held.delete(code);
    this.released.add(code);
  }
  /** Release every held key/button — used when pausing so a finger still on a
   *  button (or a lost pointerup) doesn't leave the player moving on resume. */
  releaseAll(): void {
    for (const code of this.held) this.released.add(code);
    this.held.clear();
    this.pressed.clear();
  }

  /** Semantic helpers keep game code free of raw key codes. */
  get left(): boolean { return this.isHeld('ArrowLeft') || this.isHeld('KeyA'); }
  get right(): boolean { return this.isHeld('ArrowRight') || this.isHeld('KeyD'); }
  get jumpPressed(): boolean { return this.wasPressed('Space') || this.wasPressed('KeyW') || this.wasPressed('ArrowUp'); }
  get attackPressed(): boolean { return this.wasPressed('KeyJ'); }
  get shootPressed(): boolean { return this.wasPressed('KeyK'); }
  get interactPressed(): boolean { return this.wasPressed('KeyE'); }

  /** Must be called at the END of every frame to clear edge events. */
  endFrame(): void { this.pressed.clear(); this.released.clear(); }
}

const BLOCK_DEFAULT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
