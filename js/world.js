// world.js - World generation and management

class World {
  constructor() {
    this.width  = WORLD_W;
    this.height = WORLD_H;
    this.tiles  = new Uint8Array(WORLD_W * WORLD_H);
    this.dirty  = true; // needs redraw
    this.generate();
  }

  idx(x, y) { return y * WORLD_W + x; }

  get(x, y) {
    if (x < 0 || x >= WORLD_W || y < 0 || y >= WORLD_H) return B.BEDROCK;
    return this.tiles[this.idx(x, y)];
  }

  set(x, y, id) {
    if (x < 0 || x >= WORLD_W || y < 0 || y >= WORLD_H) return;
    this.tiles[this.idx(x, y)] = id;
    this.dirty = true;
  }

  // ---- Terrain Generation ----
  generate() {
    const heights = this._genHeightMap();
    const caves   = this._genCaveMap();

    for (let x = 0; x < WORLD_W; x++) {
      const surface = heights[x];

      for (let y = 0; y < WORLD_H; y++) {
        let id = B.AIR;

        if (y >= WORLD_H - 1) {
          id = B.BEDROCK;
        } else if (y > surface) {
          if (caves[this.idx(x, y)] && y < WORLD_H - 3) {
            id = B.AIR; // cave
          } else if (y <= surface + 3) {
            id = B.DIRT;
          } else {
            id = B.STONE;
            // Ores
            const r = Math.random();
            if (y > surface + 20 && r < 0.006) id = B.DIAMOND;
            else if (y > surface + 12 && r < 0.015) id = B.GOLD;
            else if (y > surface + 6  && r < 0.03)  id = B.IRON;
            else if (r < 0.04) id = B.COAL;
          }
        } else if (y === surface) {
          id = B.GRASS;
        }

        this.set(x, y, id);
      }

      // Sand near edges (beach)
      if (surface >= SEA_LEVEL - 2 && surface <= SEA_LEVEL + 2) {
        for (let y = surface; y <= surface + 4; y++) this.set(x, y, B.SAND);
        if (surface > 0) this.set(x, surface, B.SAND);
      }

      // Trees
      if (heights[x] < SEA_LEVEL - 2 && Math.random() < 0.05 && x > 3 && x < WORLD_W - 3) {
        this._placeTree(x, heights[x]);
      }
    }

    // Gravel patches
    for (let i = 0; i < 40; i++) {
      const gx = (Math.random() * (WORLD_W - 6) + 3) | 0;
      const gy = heights[gx] + 2 + (Math.random() * 6 | 0);
      if (this.get(gx, gy) === B.STONE) {
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++)
            if (Math.random() < 0.6) this.set(gx+dx, gy+dy, B.GRAVEL);
      }
    }
  }

  _genHeightMap() {
    const h = new Array(WORLD_W);
    // Simple Perlin-like using layered sine waves
    for (let x = 0; x < WORLD_W; x++) {
      const n1 = Math.sin(x * 0.04 + 1.3) * 5;
      const n2 = Math.sin(x * 0.09 + 2.7) * 3;
      const n3 = Math.sin(x * 0.22 + 0.9) * 2;
      const n4 = Math.sin(x * 0.5  + 5.1) * 1;
      h[x] = Math.round(SEA_LEVEL - 6 + n1 + n2 + n3 + n4);
      h[x] = Math.max(5, Math.min(WORLD_H - 10, h[x]));
    }
    return h;
  }

  _genCaveMap() {
    const c = new Uint8Array(WORLD_W * WORLD_H);
    // Two-pass noise for cave tunnels
    for (let x = 0; x < WORLD_W; x++) {
      for (let y = 0; y < WORLD_H; y++) {
        const v1 = Math.sin(x * 0.3 + y * 0.2) * Math.cos(x * 0.1 - y * 0.35);
        const v2 = Math.sin(x * 0.15 - y * 0.1 + 3) * Math.cos(x * 0.25 + y * 0.18 + 1);
        c[this.idx(x, y)] = (v1 * v2 > 0.18) ? 1 : 0;
      }
    }
    return c;
  }

  _placeTree(x, surfaceY) {
    const trunkH = 4 + (Math.random() * 3 | 0);
    // Trunk
    for (let i = 1; i <= trunkH; i++) {
      this.set(x, surfaceY - i, B.WOOD);
    }
    // Leaves canopy
    const topY = surfaceY - trunkH;
    const radius = 2;
    for (let dy = -2; dy <= 1; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist <= radius + (dy < 0 ? 1 : 0) && !(dx === 0 && dy >= 0)) {
          if (this.get(x+dx, topY+dy) === B.AIR) {
            this.set(x+dx, topY+dy, B.LEAVES);
          }
        }
      }
    }
  }

  // Check if tile is solid
  isSolid(x, y) {
    const id = this.get(x, y);
    return BLOCK_DATA[id] && BLOCK_DATA[id].solid;
  }

  // Get top surface Y at column x
  getSurface(x) {
    for (let y = 0; y < WORLD_H; y++) {
      if (this.isSolid(x, y)) return y;
    }
    return WORLD_H - 1;
  }

  // Mine a block, return drop id
  mine(x, y) {
    const id = this.get(x, y);
    if (!id || id === B.BEDROCK) return null;
    const data = BLOCK_DATA[id];
    if (!data) return null;
    const drop = data.drops !== undefined ? data.drops : id;
    this.set(x, y, B.AIR);
    return drop;
  }

  // Place a block
  place(x, y, id) {
    if (this.get(x, y) !== B.AIR) return false;
    this.set(x, y, id);
    return true;
  }
}
