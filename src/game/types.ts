export type PlatformType = "normal" | "moving" | "bouncy" | "breakable" | "special";

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  vx: number;
  broken: boolean;
  breakTimer: number;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  type: "acorn" | "golden" | "coin";
  collected: boolean;
  bobOffset: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "spider" | "hawk" | "snake";
  vx: number;
  vy: number;
  range: number;
  originX: number;
  originY: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
  facing: 1 | -1;
  animFrame: number;
  animTimer: number;
  state: "idle" | "jump" | "fall" | "land" | "hit";
  invincible: number;
}

export interface GameState {
  player: Player;
  platforms: Platform[];
  collectibles: Collectible[];
  enemies: Enemy[];
  particles: Particle[];
  cameraY: number;
  height: number; // meters
  bestHeight: number;
  acorns: number;
  goldenAcorns: number;
  platformsLanded: number;
  enemiesHit: number;
  maxJumpHeight: number;
  running: boolean;
  paused: boolean;
  gameOver: boolean;
  newBest: boolean;
  startTime: number;
  keys: { left: boolean; right: boolean };
  nextPlatformId: number;
  nextCollectibleId: number;
  nextEnemyId: number;
  highestPlatformY: number;
  worldWidth: number;
  seed: string;
}

export interface GameCallbacks {
  onGameOver: (stats: {
    height: number;
    acorns: number;
    goldenAcorns: number;
    duration: number;
    platformsLanded: number;
    enemiesHit: number;
    maxJumpHeight: number;
  }) => void;
  onHeightUpdate?: (height: number) => void;
}
