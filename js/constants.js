// constants.js - Game constants and configuration

const TILE = 32;
const CHUNK_W = 16;       // chunk width in tiles
const WORLD_H = 80;       // world height in tiles (fixed)
const SEA_LEVEL = 45;     // surface Y in tiles
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PLAYER_SPEED = 4;
const MINE_TIME = 300;    // ms per hardness unit

// Block IDs
const B = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COAL: 4,
  IRON: 5,
  GOLD: 6,
  DIAMOND: 7,
  WOOD: 8,
  LEAVES: 9,
  SAND: 10,
  GRAVEL: 11,
  WATER: 12,
  LAVA: 13,
  BEDROCK: 14,
  PLANKS: 15,
  GLASS: 16,
  TORCH: 17,
  CRAFTING: 18,
  FURNACE: 19,
  STICK: 20,
  COAL_ITEM: 21,
  IRON_INGOT: 22,
  GOLD_INGOT: 23,
  DIAMOND_GEM: 24,
  WOOD_PICK: 25,
  STONE_PICK: 26,
  IRON_PICK: 27,
  WOOD_AXE: 30,
  STONE_AXE: 31,
  IRON_AXE: 32,
  WOOD_SWORD: 33,
  STONE_SWORD: 34,
  IRON_SWORD: 35,
};

const RENDER_DIST = 8;
