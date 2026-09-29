import type {
  Collectible,
  Enemy,
  GameCallbacks,
  GameState,
  Particle,
  Platform,
  PlatformType,
  Player,
} from "./types";

const GRAVITY = 0.45;
const JUMP_FORCE = -11.5;
const BOUNCY_FORCE = -16;
const MOVE_SPEED = 5.2;
const FRICTION = 0.82;
const PLAYER_W = 28;
const PLAYER_H = 32;
const PLATFORM_H = 14;
const METERS_PER_PIXEL = 0.5; // 2 pixels = 1 meter

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function chance(p: number) {
  return Math.random() < p;
}

export function createInitialState(worldWidth: number, bestHeight: number): GameState {
  const startY = 0;
  const platforms: Platform[] = [];
  let id = 0;

  // Starting platform
  platforms.push({
    id: id++,
    x: worldWidth / 2 - 50,
    y: startY,
    width: 100,
    height: PLATFORM_H,
    type: "normal",
    vx: 0,
    broken: false,
    breakTimer: 0,
  });

  // Generate initial platforms upward
  let y = startY - 70;
  for (let i = 0; i < 18; i++) {
    const difficulty = 0;
    const width = rand(70, 110);
    const x = rand(10, worldWidth - width - 10);
    platforms.push({
      id: id++,
      x,
      y,
      width,
      height: PLATFORM_H,
      type: "normal",
      vx: 0,
      broken: false,
      breakTimer: 0,
    });
    y -= rand(55, 85);
  }

  const player: Player = {
    x: worldWidth / 2 - PLAYER_W / 2,
    y: startY - PLAYER_H,
    vx: 0,
    vy: 0,
    width: PLAYER_W,
    height: PLAYER_H,
    onGround: false,
    facing: 1,
    animFrame: 0,
    animTimer: 0,
    state: "idle",
    invincible: 0,
  };

  return {
    player,
    platforms,
    collectibles: [],
    enemies: [],
    particles: [],
    cameraY: player.y - 300,
    height: 0,
    bestHeight,
    acorns: 0,
    goldenAcorns: 0,
    platformsLanded: 0,
    enemiesHit: 0,
    maxJumpHeight: 0,
    running: true,
    paused: false,
    gameOver: false,
    newBest: false,
    startTime: performance.now(),
    keys: { left: false, right: false },
    nextPlatformId: id,
    nextCollectibleId: 0,
    nextEnemyId: 0,
    highestPlatformY: y,
    worldWidth,
    seed: Math.random().toString(36).slice(2, 10),
  };
}

function difficultyFromHeight(height: number) {
  // 0 at start, approaches 1 at very high altitudes
  return Math.min(1, height / 8000);
}

function generatePlatforms(state: GameState) {
  const d = difficultyFromHeight(state.height);
  const minGap = 50 + d * 30;
  const maxGap = 75 + d * 45;
  const minW = Math.max(40, 95 - d * 45);
  const maxW = Math.max(55, 120 - d * 40);

  while (state.highestPlatformY > state.cameraY - 600) {
    const gap = rand(minGap, maxGap);
    const y = state.highestPlatformY - gap;
    const width = rand(minW, maxW);
    let x = rand(8, state.worldWidth - width - 8);

    // Keep reachable relative to previous platform
    const last = state.platforms[state.platforms.length - 1];
    if (last) {
      const maxReach = 140 - d * 20;
      const centerLast = last.x + last.width / 2;
      const targetCenter = centerLast + rand(-maxReach, maxReach);
      x = Math.max(8, Math.min(state.worldWidth - width - 8, targetCenter - width / 2));
    }

    let type: PlatformType = "normal";
    const r = Math.random();
    if (d > 0.15 && r < 0.12 + d * 0.1) type = "moving";
    else if (d > 0.1 && r < 0.22 + d * 0.08) type = "bouncy";
    else if (d > 0.25 && r < 0.32 + d * 0.1) type = "breakable";
    else if (d > 0.4 && r < 0.38) type = "special";

    const plat: Platform = {
      id: state.nextPlatformId++,
      x,
      y,
      width,
      height: PLATFORM_H,
      type,
      vx: type === "moving" ? (chance(0.5) ? 1.2 : -1.2) * (1 + d) : 0,
      broken: false,
      breakTimer: 0,
    };
    state.platforms.push(plat);
    state.highestPlatformY = y;

    // Collectibles
    if (chance(0.35 + d * 0.1)) {
      const ctype = chance(0.08) ? "golden" : chance(0.15) ? "coin" : "acorn";
      state.collectibles.push({
        id: state.nextCollectibleId++,
        x: x + width / 2 - 8,
        y: y - 28,
        type: ctype,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }

    // Enemies at higher difficulty
    if (d > 0.2 && chance(0.08 + d * 0.12)) {
      const etype = chance(0.4) ? "spider" : chance(0.5) ? "hawk" : "snake";
      state.enemies.push({
        id: state.nextEnemyId++,
        x: x + width / 2 - 12,
        y: etype === "hawk" ? y - 60 : y - 24,
        width: etype === "hawk" ? 28 : 22,
        height: etype === "hawk" ? 20 : 18,
        type: etype,
        vx: etype === "spider" ? (chance(0.5) ? 1.5 : -1.5) : etype === "hawk" ? 2 : 0.8,
        vy: 0,
        range: 60 + d * 40,
        originX: x + width / 2 - 12,
        originY: etype === "hawk" ? y - 60 : y - 24,
      });
    }
  }
}

function spawnParticles(state: GameState, x: number, y: number, color: string, count = 6) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x,
      y,
      vx: rand(-2.5, 2.5),
      vy: rand(-4, -1),
      life: 1,
      maxLife: rand(0.4, 0.9),
      color,
      size: rand(2, 5),
    });
  }
}

function updatePlayer(state: GameState, dt: number) {
  const p = state.player;

  if (state.keys.left) {
    p.vx = -MOVE_SPEED;
    p.facing = -1;
  } else if (state.keys.right) {
    p.vx = MOVE_SPEED;
    p.facing = 1;
  } else {
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.15) p.vx = 0;
  }

  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  // Wrap horizontally
  if (p.x + p.width < 0) p.x = state.worldWidth;
  if (p.x > state.worldWidth) p.x = -p.width;

  p.onGround = false;

  // Platform collisions
  for (const plat of state.platforms) {
    if (plat.broken) continue;

    if (
      p.vy > 0 &&
      p.x + p.width > plat.x + 4 &&
      p.x < plat.x + plat.width - 4 &&
      p.y + p.height > plat.y &&
      p.y + p.height < plat.y + plat.height + p.vy * dt + 8 &&
      p.y + p.height - p.vy * dt <= plat.y + 4
    ) {
      p.y = plat.y - p.height;
      p.onGround = true;
      state.platformsLanded++;

      if (plat.type === "bouncy") {
        p.vy = BOUNCY_FORCE;
        p.state = "jump";
        spawnParticles(state, p.x + p.width / 2, plat.y, "#FFB703", 8);
      } else if (plat.type === "breakable") {
        p.vy = JUMP_FORCE * 0.85;
        p.state = "jump";
        plat.breakTimer = 0.35;
      } else if (plat.type === "special") {
        p.vy = JUMP_FORCE * 1.15;
        p.state = "jump";
        spawnParticles(state, p.x + p.width / 2, plat.y, "#40916C", 6);
      } else {
        p.vy = JUMP_FORCE;
        p.state = "jump";
      }

      // Move with moving platform
      if (plat.type === "moving") {
        p.x += plat.vx * dt;
      }
    }
  }

  // Breakable timers
  for (const plat of state.platforms) {
    if (plat.breakTimer > 0) {
      plat.breakTimer -= dt / 60;
      if (plat.breakTimer <= 0) {
        plat.broken = true;
        spawnParticles(state, plat.x + plat.width / 2, plat.y, "#8B5A2B", 10);
      }
    }
  }

  // Moving platforms
  for (const plat of state.platforms) {
    if (plat.type === "moving" && !plat.broken) {
      plat.x += plat.vx * dt;
      if (plat.x <= 0 || plat.x + plat.width >= state.worldWidth) {
        plat.vx *= -1;
      }
    }
  }

  // Animation state
  if (p.vy < -2) p.state = "jump";
  else if (p.vy > 2) p.state = "fall";
  else if (p.onGround) p.state = "idle";

  p.animTimer += dt;
  if (p.animTimer > 8) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % 4;
  }

  if (p.invincible > 0) p.invincible -= dt;

  // Height tracking (higher = more negative y in world, convert)
  const currentHeight = Math.max(0, Math.floor((-p.y) * METERS_PER_PIXEL));
  if (currentHeight > state.height) {
    state.height = currentHeight;
    if (currentHeight > state.maxJumpHeight) state.maxJumpHeight = currentHeight;
  }
  if (state.height > state.bestHeight) {
    state.bestHeight = state.height;
    state.newBest = true;
  }

  // Death: fall too far below camera
  if (p.y > state.cameraY + 520) {
    state.gameOver = true;
    state.running = false;
  }
}

function updateCollectibles(state: GameState, dt: number) {
  const p = state.player;
  for (const c of state.collectibles) {
    if (c.collected) continue;
    c.bobOffset += 0.08 * dt;

    if (
      p.x + p.width > c.x &&
      p.x < c.x + 16 &&
      p.y + p.height > c.y &&
      p.y < c.y + 16
    ) {
      c.collected = true;
      if (c.type === "acorn") {
        state.acorns++;
        spawnParticles(state, c.x, c.y, "#C4A35A", 5);
      } else if (c.type === "golden") {
        state.goldenAcorns++;
        state.acorns += 5;
        spawnParticles(state, c.x, c.y, "#FFD700", 10);
      } else {
        state.acorns += 2;
        spawnParticles(state, c.x, c.y, "#FFB703", 6);
      }
    }
  }
}

function updateEnemies(state: GameState, dt: number) {
  const p = state.player;
  for (const e of state.enemies) {
    if (e.type === "spider" || e.type === "snake") {
      e.x += e.vx * dt;
      if (Math.abs(e.x - e.originX) > e.range) e.vx *= -1;
    } else if (e.type === "hawk") {
      e.x += e.vx * dt;
      e.y = e.originY + Math.sin(performance.now() / 400 + e.id) * 20;
      if (e.x < -30 || e.x > state.worldWidth + 30) e.vx *= -1;
    }

    if (p.invincible > 0) continue;

    if (
      p.x + p.width > e.x + 4 &&
      p.x < e.x + e.width - 4 &&
      p.y + p.height > e.y + 4 &&
      p.y < e.y + e.height - 4
    ) {
      // Bounce on enemy from above = kill enemy
      if (p.vy > 0 && p.y + p.height < e.y + e.height / 2) {
        e.y = 99999; // remove
        p.vy = JUMP_FORCE * 0.9;
        state.enemiesHit++;
        spawnParticles(state, e.x, e.y, "#E63946", 8);
      } else {
        // Hit
        state.enemiesHit++;
        p.invincible = 60;
        p.vy = -6;
        p.vx = p.facing * -3;
        p.state = "hit";
        spawnParticles(state, p.x, p.y, "#E85D04", 6);
        // Soft death after multiple hits or just end run
        state.gameOver = true;
        state.running = false;
      }
    }
  }
}

function updateParticles(state: GameState, dt: number) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 0.15 * dt;
    pt.life -= dt / 60 / pt.maxLife;
    if (pt.life <= 0) state.particles.splice(i, 1);
  }
}

function cleanup(state: GameState) {
  const cutoff = state.cameraY + 700;
  state.platforms = state.platforms.filter((p) => p.y < cutoff && !p.broken);
  state.collectibles = state.collectibles.filter((c) => !c.collected && c.y < cutoff);
  state.enemies = state.enemies.filter((e) => e.y < cutoff + 100);
}

function updateCamera(state: GameState) {
  const target = state.player.y - 280;
  state.cameraY += (target - state.cameraY) * 0.08;
}

export function updateGame(state: GameState, dt: number) {
  if (!state.running || state.paused || state.gameOver) return;

  const clampedDt = Math.min(dt, 2.5);

  generatePlatforms(state);
  updatePlayer(state, clampedDt);
  updateCollectibles(state, clampedDt);
  updateEnemies(state, clampedDt);
  updateParticles(state, clampedDt);
  updateCamera(state);
  cleanup(state);
}

// ─── Rendering (pixel-art style via canvas) ───────────────────────────

function drawSquirrel(ctx: CanvasRenderingContext2D, p: Player, camY: number) {
  const x = p.x;
  const y = p.y - camY;
  const f = p.facing;

  ctx.save();
  if (p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Tail
  ctx.fillStyle = "#C45C26";
  ctx.beginPath();
  ctx.ellipse(x + (f > 0 ? -4 : p.width + 4), y + 14, 10, 16, f * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#E07A3D";
  ctx.beginPath();
  ctx.ellipse(x + (f > 0 ? -4 : p.width + 4), y + 12, 6, 10, f * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = "#D2691E";
  ctx.fillRect(x + 4, y + 8, 20, 18);

  // Belly
  ctx.fillStyle = "#F5D0A9";
  ctx.fillRect(x + 8, y + 12, 12, 12);

  // Head
  ctx.fillStyle = "#D2691E";
  ctx.fillRect(x + 2, y, 24, 14);

  // Ears
  ctx.fillStyle = "#C45C26";
  ctx.fillRect(x + 4, y - 6, 6, 8);
  ctx.fillRect(x + 18, y - 6, 6, 8);
  ctx.fillStyle = "#F5D0A9";
  ctx.fillRect(x + 5, y - 4, 4, 5);
  ctx.fillRect(x + 19, y - 4, 4, 5);

  // Eyes
  ctx.fillStyle = "#1A1A1A";
  const eyeOff = p.state === "jump" ? -1 : 0;
  ctx.fillRect(x + 7, y + 4 + eyeOff, 4, 5);
  ctx.fillRect(x + 17, y + 4 + eyeOff, 4, 5);
  ctx.fillStyle = "#FFF";
  ctx.fillRect(x + 8, y + 4 + eyeOff, 2, 2);
  ctx.fillRect(x + 18, y + 4 + eyeOff, 2, 2);

  // Nose
  ctx.fillStyle = "#5C3317";
  ctx.fillRect(x + 13, y + 9, 3, 2);

  // Legs (simple bounce)
  ctx.fillStyle = "#C45C26";
  if (p.state === "jump" || p.state === "fall") {
    ctx.fillRect(x + 6, y + 24, 6, 8);
    ctx.fillRect(x + 16, y + 24, 6, 8);
  } else {
    ctx.fillRect(x + 6, y + 26, 6, 6);
    ctx.fillRect(x + 16, y + 26, 6, 6);
  }

  ctx.restore();
}

function drawPlatform(ctx: CanvasRenderingContext2D, plat: Platform, camY: number) {
  if (plat.broken) return;
  const y = plat.y - camY;
  const x = plat.x;

  let topColor = "#40916C";
  let bodyColor = "#8B5A2B";

  if (plat.type === "bouncy") {
    topColor = "#FFB703";
    bodyColor = "#E85D04";
  } else if (plat.type === "breakable") {
    topColor = "#A98467";
    bodyColor = "#6C584C";
  } else if (plat.type === "moving") {
    topColor = "#52B788";
    bodyColor = "#2D6A4F";
  } else if (plat.type === "special") {
    topColor = "#B5179E";
    bodyColor = "#7209B7";
  }

  // Shake if about to break
  const shake = plat.breakTimer > 0 ? Math.sin(plat.breakTimer * 40) * 2 : 0;

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + shake, y + 4, plat.width, plat.height - 2);
  ctx.fillStyle = topColor;
  ctx.fillRect(x + shake, y, plat.width, 6);

  // Grass tufts
  if (plat.type === "normal" || plat.type === "moving") {
    ctx.fillStyle = "#2D6A4F";
    for (let i = 4; i < plat.width - 4; i += 10) {
      ctx.fillRect(x + i + shake, y - 3, 3, 4);
    }
  }
}

function drawCollectible(ctx: CanvasRenderingContext2D, c: Collectible, camY: number, t: number) {
  if (c.collected) return;
  const bob = Math.sin(t / 200 + c.bobOffset) * 3;
  const x = c.x;
  const y = c.y - camY + bob;

  if (c.type === "acorn") {
    ctx.fillStyle = "#8B5A2B";
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 10, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5C4033";
    ctx.fillRect(x + 4, y + 2, 8, 5);
    ctx.fillStyle = "#2D6A4F";
    ctx.fillRect(x + 7, y, 2, 4);
  } else if (c.type === "golden") {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 10, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFB703";
    ctx.fillRect(x + 3, y + 2, 10, 5);
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x + 5, y + 6, 3, 3);
  } else {
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.arc(x + 8, y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E85D04";
    ctx.font = "bold 8px monospace";
    ctx.fillText("$", x + 5, y + 11);
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, camY: number) {
  const x = e.x;
  const y = e.y - camY;

  if (e.type === "spider") {
    ctx.fillStyle = "#1A1A1A";
    ctx.beginPath();
    ctx.arc(x + 11, y + 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x + 11, y + 10);
      ctx.lineTo(x + 11 + Math.cos(a) * 14, y + 10 + Math.sin(a) * 10);
      ctx.stroke();
    }
    ctx.fillStyle = "#E63946";
    ctx.fillRect(x + 7, y + 7, 3, 3);
    ctx.fillRect(x + 13, y + 7, 3, 3);
  } else if (e.type === "hawk") {
    ctx.fillStyle = "#6B4226";
    ctx.beginPath();
    ctx.ellipse(x + 14, y + 10, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8B5A2B";
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x + 10, y + 4);
    ctx.lineTo(x + 10, y + 16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 10);
    ctx.lineTo(x + 18, y + 4);
    ctx.lineTo(x + 18, y + 16);
    ctx.fill();
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(x + 18, y + 6, 3, 3);
  } else {
    // snake
    ctx.fillStyle = "#2D6A4F";
    ctx.fillRect(x, y + 6, 22, 8);
    ctx.beginPath();
    ctx.arc(x + 22, y + 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#E63946";
    ctx.fillRect(x + 24, y + 8, 4, 2);
    ctx.fillStyle = "#FFF";
    ctx.fillRect(x + 20, y + 7, 2, 2);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, camY: number) {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#A8DADC");
  grad.addColorStop(0.5, "#F1FAEE");
  grad.addColorStop(1, "#D8F3DC");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Parallax mountains
  ctx.fillStyle = "#95D5B2";
  const mOff = (camY * 0.05) % 200;
  for (let i = -1; i < 4; i++) {
    const mx = i * 180 - mOff;
    ctx.beginPath();
    ctx.moveTo(mx, h);
    ctx.lineTo(mx + 90, h - 80 - Math.sin(i) * 20);
    ctx.lineTo(mx + 180, h);
    ctx.fill();
  }

  // Far trees
  ctx.fillStyle = "#74C69D";
  const tOff = (camY * 0.12) % 120;
  for (let i = -1; i < 6; i++) {
    const tx = i * 100 - tOff;
    ctx.fillRect(tx + 20, h - 100, 16, 100);
    ctx.beginPath();
    ctx.arc(tx + 28, h - 110, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  // Clouds
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  const cOff = (camY * 0.03) % 300;
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 140 - cOff) % (w + 100)) - 50;
    const cy = 40 + (i % 3) * 50;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.arc(cx + 25, cy - 5, 16, 0, Math.PI * 2);
    ctx.arc(cx + 45, cy, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number
) {
  drawBackground(ctx, width, height, state.cameraY);

  // Platforms
  for (const plat of state.platforms) {
    drawPlatform(ctx, plat, state.cameraY);
  }

  // Collectibles
  const t = performance.now();
  for (const c of state.collectibles) {
    drawCollectible(ctx, c, state.cameraY, t);
  }

  // Enemies
  for (const e of state.enemies) {
    drawEnemy(ctx, e, state.cameraY);
  }

  // Particles
  for (const pt of state.particles) {
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y - state.cameraY, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  // Player
  drawSquirrel(ctx, state.player, state.cameraY);
}

export function createGameLoop(
  canvas: HTMLCanvasElement,
  bestHeight: number,
  callbacks: GameCallbacks
) {
  const ctx = canvas.getContext("2d")!;
  let state = createInitialState(canvas.width, bestHeight);
  let lastTime = performance.now();
  let animId = 0;
  let ended = false;

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = Math.min(window.innerHeight - 60, parent.clientHeight || window.innerHeight);
    canvas.width = w;
    canvas.height = h;
    state.worldWidth = w;
  };

  resize();
  window.addEventListener("resize", resize);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") state.keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") state.keys.right = true;
    if (e.key === "p" || e.key === "P" || e.key === "Escape") state.paused = !state.paused;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") state.keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") state.keys.right = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const loop = (now: number) => {
    const dt = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;

    updateGame(state, dt);
    renderGame(ctx, state, canvas.width, canvas.height);

    callbacks.onHeightUpdate?.(state.height);

    if (state.gameOver && !ended) {
      ended = true;
      const duration = Math.floor(now - state.startTime);
      callbacks.onGameOver({
        height: state.height,
        acorns: state.acorns,
        goldenAcorns: state.goldenAcorns,
        duration,
        platformsLanded: state.platformsLanded,
        enemiesHit: state.enemiesHit,
        maxJumpHeight: state.maxJumpHeight,
      });
    }

    animId = requestAnimationFrame(loop);
  };

  animId = requestAnimationFrame(loop);

  return {
    state,
    setLeft: (v: boolean) => {
      state.keys.left = v;
    },
    setRight: (v: boolean) => {
      state.keys.right = v;
    },
    togglePause: () => {
      state.paused = !state.paused;
    },
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", resize);
    },
    getStats: () => ({
      height: state.height,
      acorns: state.acorns,
      goldenAcorns: state.goldenAcorns,
      bestHeight: state.bestHeight,
      newBest: state.newBest,
      paused: state.paused,
      gameOver: state.gameOver,
    }),
  };
}
