// constants.js - Game constants and configuration

const TILE = 32;          // tile size in pixels
const WORLD_W = 200;      // world width in tiles
const WORLD_H = 80;       // world height in tiles
const SEA_LEVEL = 45;     // surface Y in tiles
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const PLAYER_SPEED = 4;
const MINE_TIME = 300;    // ms to mine a block

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
};

// Chunk system
const CHUNK_W = 16;
