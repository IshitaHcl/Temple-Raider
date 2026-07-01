import { Rect } from '../math/rect';
import { ITilemap } from '../interfaces/game-types';
import { Vector2 } from '../math/vector2';

export interface CollisionResult {
  position: Vector2;
  velocity: Vector2;
  onGround: boolean;
  hitCeiling: boolean;
  hitWall: boolean;
}

/** Per-axis swept resolution against a tilemap. Resolving X then Y separately
 *  is the classic, robust approach for tile platformers and prevents the
 *  "snagging on seams" bug you get from single-pass resolution. */
export function moveAndCollide(
  bounds: Rect,
  velocity: Vector2,
  dt: number,
  map: ITilemap,
): CollisionResult {
  const result: CollisionResult = {
    position: new Vector2(bounds.x, bounds.y),
    velocity: velocity.clone(),
    onGround: false, hitCeiling: false, hitWall: false,
  };
  const ts = map.tileSize;

  // --- X axis ---
  result.position.x += velocity.x * dt;
  let box = new Rect(result.position.x, result.position.y, bounds.width, bounds.height);
  if (velocity.x !== 0) {
    const dir = Math.sign(velocity.x);
    const probeX = dir > 0 ? box.right : box.left;
    const col = Math.floor(probeX / ts);
    for (let row = Math.floor(box.top / ts); row <= Math.floor((box.bottom - 1) / ts); row++) {
      if (map.isSolid(col, row)) {
        result.position.x = dir > 0 ? col * ts - bounds.width : (col + 1) * ts;
        result.velocity.x = 0;
        result.hitWall = true;
        break;
      }
    }
  }

  // --- Y axis ---
  result.position.y += velocity.y * dt;
  box = new Rect(result.position.x, result.position.y, bounds.width, bounds.height);
  if (velocity.y !== 0) {
    const dir = Math.sign(velocity.y);
    const probeY = dir > 0 ? box.bottom : box.top;
    const row = Math.floor(probeY / ts);
    for (let c = Math.floor(box.left / ts); c <= Math.floor((box.right - 1) / ts); c++) {
      if (map.isSolid(c, row)) {
        if (dir > 0) { result.position.y = row * ts - bounds.height; result.onGround = true; }
        else { result.position.y = (row + 1) * ts; result.hitCeiling = true; }
        result.velocity.y = 0;
        break;
      }
    }
  }
  return result;
}

export function overlaps(a: Rect, b: Rect): boolean { return a.intersects(b); }
