// crafting.js - Crafting recipes and crafting table UI

// Each recipe: { pattern: string[][] (3x3 or 2x2), result: {id, count} }
// null = empty slot, letter = ingredient
// ingredients map letter -> block ID

const RECIPES = [
  // ---- BASIC ----
  {
    name: 'Planches (x4)',
    pattern: [
      [null, null, null],
      [null, 'W',  null],
      [null, null, null],
    ],
    ingredients: { W: B.WOOD },
    result: { id: B.PLANKS, count: 4 },
  },
  {
    name: 'Bâtons (x4)',
    pattern: [
      [null, 'P',  null],
      [null, 'P',  null],
      [null, null, null],
    ],
    ingredients: { P: B.PLANKS },
    result: { id: B.STICK, count: 4 },
  },
  {
    name: 'Table de craft',
    pattern: [
      [null, null, null],
      [null, 'P',  'P' ],
      [null, 'P',  'P' ],
    ],
    ingredients: { P: B.PLANKS },
    result: { id: B.CRAFTING, count: 1 },
  },
  {
    name: 'Torche (x4)',
    pattern: [
      [null, null, null],
      [null, 'C',  null],
      [null, 'S',  null],
    ],
    ingredients: { C: B.COAL, S: B.STICK },
    result: { id: B.TORCH, count: 4 },
  },
  {
    name: 'Verre (x1)',
    pattern: [
      [null, null, null],
      [null, 'A',  null],
      [null, null, null],
    ],
    ingredients: { A: B.SAND },
    result: { id: B.GLASS, count: 1 },
  },
  {
    name: 'Fourneau',
    pattern: [
      ['S',  'S',  'S' ],
      ['S',  null, 'S' ],
      ['S',  'S',  'S' ],
    ],
    ingredients: { S: B.STONE },
    result: { id: B.FURNACE, count: 1 },
  },
  // ---- PICKAXES ----
  {
    name: 'Pioche en bois',
    pattern: [
      ['P',  'P',  'P' ],
      [null, 'S',  null],
      [null, 'S',  null],
    ],
    ingredients: { P: B.PLANKS, S: B.STICK },
    result: { id: B.WOOD_PICK, count: 1 },
  },
  {
    name: 'Pioche en pierre',
    pattern: [
      ['R',  'R',  'R' ],
      [null, 'S',  null],
      [null, 'S',  null],
    ],
    ingredients: { R: B.STONE, S: B.STICK },
    result: { id: B.STONE_PICK, count: 1 },
  },
  {
    name: 'Pioche en fer',
    pattern: [
      ['I',  'I',  'I' ],
      [null, 'S',  null],
      [null, 'S',  null],
    ],
    ingredients: { I: B.IRON_INGOT, S: B.STICK },
    result: { id: B.IRON_PICK, count: 1 },
  },
  // ---- SWORDS ----
  {
    name: 'Épée en bois',
    pattern: [
      [null, 'P',  null],
      [null, 'P',  null],
      [null, 'S',  null],
    ],
    ingredients: { P: B.PLANKS, S: B.STICK },
    result: { id: B.WOOD_SWORD, count: 1 },
  },
  {
    name: 'Épée en pierre',
    pattern: [
      [null, 'R',  null],
      [null, 'R',  null],
      [null, 'S',  null],
    ],
    ingredients: { R: B.STONE, S: B.STICK },
    result: { id: B.STONE_SWORD, count: 1 },
  },
  {
    name: 'Épée en fer',
    pattern: [
      [null, 'I',  null],
      [null, 'I',  null],
      [null, 'S',  null],
    ],
    ingredients: { I: B.IRON_INGOT, S: B.STICK },
    result: { id: B.IRON_SWORD, count: 1 },
  },
  // ---- AXES ----
  {
    name: 'Hache en bois',
    pattern: [
      ['P',  'P',  null],
      ['P',  'S',  null],
      [null, 'S',  null],
    ],
    ingredients: { P: B.PLANKS, S: B.STICK },
    result: { id: B.WOOD_AXE, count: 1 },
  },
  {
    name: 'Hache en pierre',
    pattern: [
      ['R',  'R',  null],
      ['R',  'S',  null],
      [null, 'S',  null],
    ],
    ingredients: { R: B.STONE, S: B.STICK },
    result: { id: B.STONE_AXE, count: 1 },
  },
  {
    name: 'Hache en fer',
    pattern: [
      ['I',  'I',  null],
      ['I',  'S',  null],
      [null, 'S',  null],
    ],
    ingredients: { I: B.IRON_INGOT, S: B.STICK },
    result: { id: B.IRON_AXE, count: 1 },
  },
];

// Try to match player's 3x3 grid against all recipes
// grid: array[9] of {id} or null
function matchRecipe(grid) {
  // Normalize grid: trim empty rows/cols to find bounding box
  const rows = 3, cols = 3;

  for (const recipe of RECIPES) {
    if (_matchPattern(grid, recipe)) return recipe;
  }
  return null;
}

function _matchPattern(grid, recipe) {
  // Try all offsets (0 = exact 3x3)
  for (let rowOff = 0; rowOff <= 2; rowOff++) {
    for (let colOff = 0; colOff <= 2; colOff++) {
      if (_tryOffset(grid, recipe, rowOff, colOff)) return true;
    }
  }
  return false;
}

function _tryOffset(grid, recipe, rowOff, colOff) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = recipe.pattern[r][c];
      const pr = r + rowOff;
      const pc = c + colOff;
      const gridItem = (pr < 3 && pc < 3) ? grid[pr * 3 + pc] : null;
      const gridId = gridItem ? gridItem.id : null;

      if (cell === null) {
        // Recipe expects empty — grid must be empty here
        if (gridId) return false;
      } else {
        // Recipe expects ingredient
        const needed = recipe.ingredients[cell];
        if (!gridId || gridId !== needed) return false;
      }
    }
    // Check that any grid cells outside the recipe pattern are empty
    for (let ec = 0; ec < colOff; ec++) {
      if (r < 3 && grid[r * 3 + ec]) return false;
    }
  }
  // Check extra rows below pattern are empty
  for (let er = rowOff + 3; er < 3; er++) {
    for (let ec = 0; ec < 3; ec++) {
      if (grid[er * 3 + ec]) return false;
    }
  }
  return true;
}

// Consume ingredients from grid for a recipe
function consumeIngredients(grid, recipe) {
  for (let i = 0; i < 9; i++) {
    if (grid[i]) {
      grid[i].count--;
      if (grid[i].count <= 0) grid[i] = null;
    }
  }
}

// ---- Crafting UI ----
class CraftingUI {
  constructor(player, ui) {
    this.player = player;
    this.ui = ui;
    this.grid = new Array(9).fill(null); // 3x3
    this.open = false;
    this._build();
  }

  _build() {
    // Create the overlay element
    this.el = document.createElement('div');
    this.el.id = 'crafting-screen';
    this.el.innerHTML = `
      <div id="crafting-panel">
        <h3>⚒ Table de Craft</h3>
        <div class="craft-layout">
          <div class="craft-grid-wrap">
            <div id="craft-grid"></div>
          </div>
          <div class="craft-arrow">➜</div>
          <div class="craft-result-wrap">
            <div id="craft-result" class="craft-slot"></div>
            <button id="btn-craft-all">Tout craft</button>
          </div>
        </div>
        <div class="craft-recipes-title">Recettes disponibles :</div>
        <div id="craft-recipe-list"></div>
        <div class="craft-inv-title">Inventaire :</div>
        <div id="craft-inv-grid"></div>
        <button id="btn-close-craft">✕ Fermer</button>
      </div>
    `;
    document.body.appendChild(this.el);

    // Build 3x3 grid slots
    const gridEl = this.el.querySelector('#craft-grid');
    this.slotEls = [];
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = 'craft-slot';
      slot.dataset.index = i;
      slot.addEventListener('click', () => this._onGridClick(i));
      gridEl.appendChild(slot);
      this.slotEls.push(slot);
    }

    this.resultEl = this.el.querySelector('#craft-result');
    this.resultEl.addEventListener('click', () => this._onCraft());

    this.el.querySelector('#btn-craft-all').addEventListener('click', () => this._onCraftAll());
    this.el.querySelector('#btn-close-craft').addEventListener('click', () => this.close());
    this.el.addEventListener('click', e => { if (e.target === this.el) this.close(); });

    this._renderRecipeList();
  }

  openUI() {
    this.open = true;
    this.ui.invOpen = true;
    this.el.classList.add('open');
    this._render();
  }

  close() {
    // Return grid items to inventory
    for (let i = 0; i < 9; i++) {
      if (this.grid[i]) {
        this.player.addItem(this.grid[i].id, this.grid[i].count);
        this.grid[i] = null;
      }
    }
    this.open = false;
    this.ui.invOpen = false;
    this.el.classList.remove('open');
    this.ui.updateHotbar();
  }

  _onGridClick(i) {
    // Cycle through player inventory items to fill slot
    // If slot is empty: pick from hotbar held item
    // If slot has item: return it
    if (this.grid[i]) {
      this.player.addItem(this.grid[i].id, this.grid[i].count);
      this.grid[i] = null;
    } else {
      const held = this.player.getHeldItem();
      if (held) {
        this.grid[i] = { id: held.id, count: 1 };
        this.player.removeItem(this.player.hotbarIdx, 1);
      }
    }
    this._render();
  }

  _onCraft() {
    const recipe = matchRecipe(this.grid);
    if (!recipe) return;
    consumeIngredients(this.grid, recipe);
    this.player.addItem(recipe.result.id, recipe.result.count);
    this.ui.updateHotbar();
    this._render();
  }

  _onCraftAll() {
    let crafted = 0;
    while (crafted < 64) {
      const recipe = matchRecipe(this.grid);
      if (!recipe) break;
      // Check we still have enough items
      consumeIngredients(this.grid, recipe);
      this.player.addItem(recipe.result.id, recipe.result.count);
      crafted += recipe.result.count;
    }
    this.ui.updateHotbar();
    this._render();
  }

  _render() {
    // Grid slots
    for (let i = 0; i < 9; i++) {
      this._renderSlot(this.slotEls[i], this.grid[i]);
    }
    // Result
    const recipe = matchRecipe(this.grid);
    if (recipe) {
      this._renderSlot(this.resultEl, recipe.result, true);
      this.resultEl.classList.add('craftable');
    } else {
      this.resultEl.innerHTML = '';
      this.resultEl.classList.remove('craftable');
    }
    // Inv grid
    this._renderInvGrid();
  }

  _renderSlot(el, item, isResult = false) {
    el.innerHTML = '';
    if (!item || !item.id) return;
    const icon = getBlockIcon(item.id, 36);
    el.appendChild(icon);
    if (item.count > 1) {
      const cnt = document.createElement('span');
      cnt.className = 'slot-count';
      cnt.textContent = item.count;
      el.appendChild(cnt);
    }
  }

  _renderInvGrid() {
    const invEl = this.el.querySelector('#craft-inv-grid');
    invEl.innerHTML = '';
    for (let i = 0; i < 36; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot craft-inv-slot';
      const item = this.player.inventory[i];
      if (item) {
        const icon = getBlockIcon(item.id, 28);
        slot.appendChild(icon);
        if (item.count > 1) {
          const cnt = document.createElement('span');
          cnt.className = 'slot-count';
          cnt.textContent = item.count;
          slot.appendChild(cnt);
        }
        // Click to move to grid
        slot.addEventListener('click', () => {
          const emptySlot = this.grid.findIndex(g => !g);
          if (emptySlot !== -1 && item) {
            this.grid[emptySlot] = { id: item.id, count: 1 };
            this.player.removeItem(i, 1);
            this._render();
          }
        });
      }
      invEl.appendChild(slot);
    }
  }

  _renderRecipeList() {
    const listEl = this.el.querySelector('#craft-recipe-list');
    listEl.innerHTML = '';
    for (const recipe of RECIPES) {
      const item = document.createElement('div');
      item.className = 'recipe-item';
      const icon = getBlockIcon(recipe.result.id, 24);
      item.appendChild(icon);
      const name = document.createElement('span');
      name.textContent = recipe.name;
      item.appendChild(name);
      // Click to auto-fill grid with recipe
      item.addEventListener('click', () => this._autoFillRecipe(recipe));
      listEl.appendChild(item);
    }
  }

  _autoFillRecipe(recipe) {
    // Return current grid to inv
    for (let i = 0; i < 9; i++) {
      if (this.grid[i]) { this.player.addItem(this.grid[i].id, this.grid[i].count); this.grid[i] = null; }
    }
    // Fill grid with recipe pattern
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = recipe.pattern[r][c];
        if (cell) {
          const needed = recipe.ingredients[cell];
          // Find in inventory
          const invIdx = this.player.inventory.findIndex(it => it && it.id === needed);
          if (invIdx !== -1) {
            this.grid[r * 3 + c] = { id: needed, count: 1 };
            this.player.removeItem(invIdx, 1);
          }
        }
      }
    }
    this.ui.updateHotbar();
    this._render();
  }
}
