// game.js - Main game controller, input, loop

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.world    = null;
    this.player   = null;
    this.renderer = null;
    this.ui       = null;
    this.keys     = {};
    this.mouse    = { x: 0, y: 0, left: false, right: false };
    this.mouseWorld = null;
    this.running  = false;
    this.lastTime = 0;
    this.frameId  = null;
    this.REACH    = 6; // tiles

    this._bindMenuEvents();
  }

  _bindMenuEvents() {
    document.getElementById('btn-play').addEventListener('click', () => this.startGame());
    document.getElementById('btn-controls').addEventListener('click', () => {
      document.getElementById('controls-panel').classList.toggle('hidden');
    });
  }

  startGame() {
    // Switch screens
    document.getElementById('screen-main-menu').classList.remove('active');
    const gameScreen = document.getElementById('screen-game');
    gameScreen.classList.add('active');

    // Init systems
    this.world    = new World();
    this.player   = new Player(this.world);
    this.renderer = new Renderer(this.canvas);
    this.ui       = new UI(this.player);

    // Scale for pixel art look
    this.renderer.scale = Math.max(1, Math.floor(window.innerHeight / (TILE * 15)));

    this._bindInputs();
    this.running = true;
    this.lastTime = performance.now();
    this._loop(this.lastTime);

    this.ui.updateHotbar();
  }

  _bindInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;

      // Hotbar
      if (e.key >= '1' && e.key <= '9') {
        this.player.hotbarIdx = parseInt(e.key) - 1;
        this.ui.updateHotbar();
      }

      // Inventory
      if (e.key === 'e' || e.key === 'E') {
        this.ui.toggleInventory();
      }

      // Prevent scroll
      if ([' ', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      // Convert to world coords
      this.mouseWorld = this.renderer.screenToWorld(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.ui.invOpen) return;
      if (e.button === 0) this.mouse.left = true;
      if (e.button === 2) this.mouse.right = true;
      e.preventDefault();
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) { this.mouse.left = false; this.player.stopMining(); }
      if (e.button === 2) this.mouse.right = false;
    });

    this.canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Scroll to change hotbar
    this.canvas.addEventListener('wheel', (e) => {
      const dir = e.deltaY > 0 ? 1 : -1;
      this.player.hotbarIdx = ((this.player.hotbarIdx + dir) + 9) % 9;
      this.ui.updateHotbar();
      e.preventDefault();
    }, { passive: false });
  }

  _loop(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this._update(dt);
    this._render();

    this.frameId = requestAnimationFrame(t => this._loop(t));
  }

  _update(dt) {
    if (this.ui.invOpen) return;

    // Player physics
    this.player.update(this.keys);

    // Mining (left click hold)
    if (this.mouse.left && this.mouseWorld) {
      const tx = Math.floor(this.mouseWorld.wx / TILE);
      const ty = Math.floor(this.mouseWorld.wy / TILE);
      if (this._inReach(tx, ty)) {
        this.player.startMining(tx, ty);
        const mined = this.player.updateMining();
        if (mined) {
          const drop = this.world.mine(mined.x, mined.y);
          if (drop && drop !== B.AIR) {
            this.player.addItem(drop, 1);
            this.ui.updateHotbar();
          }
        }
      } else {
        this.player.stopMining();
      }
    }

    // Placing (right click)
    if (this.mouse.right && this.mouseWorld) {
      this.mouse.right = false; // single place per click (handled in mousedown)
      this._placeBlock();
    }

    // Show tooltip for hovered block
    if (this.mouseWorld && !this.ui.invOpen) {
      const tx = Math.floor(this.mouseWorld.wx / TILE);
      const ty = Math.floor(this.mouseWorld.wy / TILE);
      const id = this.world.get(tx, ty);
      this.ui.showBlockTooltip(id, this.mouse.x, this.mouse.y);
    }

    // Camera
    this.renderer.updateCamera(this.player);
  }

  _placeBlock() {
    if (!this.mouseWorld) return;
    const tx = Math.floor(this.mouseWorld.wx / TILE);
    const ty = Math.floor(this.mouseWorld.wy / TILE);
    if (!this._inReach(tx, ty)) return;

    const held = this.player.getHeldItem();
    if (!held) return;

    // Don't place inside player
    if (this._overlapsPlayer(tx, ty)) return;

    if (this.world.place(tx, ty, held.id)) {
      this.player.removeItem(this.player.hotbarIdx, 1);
      this.ui.updateHotbar();
    }
  }

  _overlapsPlayer(tx, ty) {
    const px1 = this.player.x;
    const py1 = this.player.y;
    const px2 = px1 + this.player.w;
    const py2 = py1 + this.player.h;
    const bx1 = tx * TILE;
    const by1 = ty * TILE;
    const bx2 = bx1 + TILE;
    const by2 = by1 + TILE;
    return px1 < bx2 && px2 > bx1 && py1 < by2 && py2 > by1;
  }

  _inReach(tx, ty) {
    const dx = tx - this.player.tx;
    const dy = ty - this.player.ty;
    return Math.sqrt(dx*dx + dy*dy) <= this.REACH;
  }

  _render() {
    this.renderer.render(this.world, this.player, this.ui.invOpen ? null : this.mouseWorld);
    this.ui.updateHealth();
  }
}

// Handle right-click place as separate mousedown for instant place
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  // Override right click handling
  const canvas = document.getElementById('game-canvas');
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2 && game.running && !game.ui?.invOpen) {
      game._placeBlock();
    }
  });
});
