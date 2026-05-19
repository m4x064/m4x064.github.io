const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const heartsEl = document.querySelector("#hearts");
const startButton = document.querySelector("#start");

const sheet = new Image();
sheet.src = "assets/ufo-yuuri.webp";

const CELL_W = 192;
const CELL_H = 208;
const ROWS = {
  idle: { y: 0, frames: 6, speed: 0.16 },
  right: { y: 1, frames: 8, speed: 0.2 },
  left: { y: 2, frames: 8, speed: 0.2 },
  waving: { y: 3, frames: 4, speed: 0.18 },
  jumping: { y: 4, frames: 5, speed: 0.18 },
  failed: { y: 5, frames: 8, speed: 0.15 },
  waiting: { y: 6, frames: 6, speed: 0.14 },
  running: { y: 7, frames: 6, speed: 0.18 },
  review: { y: 8, frames: 6, speed: 0.15 },
};

const keys = new Set();
const touch = new Set();
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.6 + 0.4,
  s: Math.random() * 0.22 + 0.08,
}));

let state = "ready";
let lastTime = 0;
let spawnTimer = 0;
let score = 0;
let hearts = 3;
let invincible = 0;
let waveTimer = 0;
let scoreCarry = 0;
let loopStarted = false;

const yuuri = {
  x: 150,
  y: canvas.height * 0.52,
  vx: 0,
  vy: 0,
  frame: 0,
  anim: "idle",
  size: 126,
};

let items = [];
let particles = [];

function reset() {
  state = "playing";
  score = 0;
  hearts = 3;
  invincible = 0;
  waveTimer = 0;
  scoreCarry = 0;
  spawnTimer = 0;
  items = [];
  particles = [];
  yuuri.x = 150;
  yuuri.y = canvas.height * 0.52;
  yuuri.vx = 0;
  yuuri.vy = 0;
  yuuri.frame = 0;
  startButton.classList.add("is-hidden");
  updateHud();
}

function updateHud() {
  scoreEl.textContent = String(score);
  heartsEl.textContent = String(Math.max(0, hearts));
}

function activeDirections() {
  return {
    left: keys.has("ArrowLeft") || keys.has("KeyA") || touch.has("left"),
    right: keys.has("ArrowRight") || keys.has("KeyD") || touch.has("right"),
    up: keys.has("ArrowUp") || keys.has("KeyW") || touch.has("up"),
    down: keys.has("ArrowDown") || keys.has("KeyS") || touch.has("down"),
  };
}

function spawnItem() {
  const good = Math.random() > 0.28;
  const lane = Math.random() * (canvas.height - 140) + 70;
  items.push({
    kind: good ? "heart" : "meteor",
    x: canvas.width + 40,
    y: lane,
    r: good ? 15 : 20,
    vx: good ? -210 - Math.random() * 60 : -250 - Math.random() * 120,
    phase: Math.random() * Math.PI * 2,
  });
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 150,
      vy: (Math.random() - 0.5) * 130,
      life: 0.7,
      color,
    });
  }
}

function hit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) < a.r + b.r;
}

function update(dt) {
  if (state !== "playing") {
    yuuri.anim = state === "gameover" ? "failed" : "waiting";
    yuuri.frame += ROWS[yuuri.anim].speed;
    return;
  }

  const dir = activeDirections();
  const ax = (dir.right ? 1 : 0) - (dir.left ? 1 : 0);
  const ay = (dir.down ? 1 : 0) - (dir.up ? 1 : 0);
  const len = Math.hypot(ax, ay) || 1;
  const speed = 315;
  yuuri.vx += ((ax / len) * speed - yuuri.vx) * Math.min(1, dt * 12);
  yuuri.vy += ((ay / len) * speed - yuuri.vy) * Math.min(1, dt * 12);
  yuuri.x = Math.max(70, Math.min(canvas.width - 70, yuuri.x + yuuri.vx * dt));
  yuuri.y = Math.max(76, Math.min(canvas.height - 76, yuuri.y + yuuri.vy * dt));

  if (waveTimer > 0) {
    waveTimer -= dt;
    yuuri.anim = "waving";
  } else if (Math.abs(yuuri.vx) > 40) {
    yuuri.anim = yuuri.vx > 0 ? "right" : "left";
  } else if (Math.abs(yuuri.vy) > 80) {
    yuuri.anim = "jumping";
  } else {
    yuuri.anim = "idle";
  }

  yuuri.frame += ROWS[yuuri.anim].speed * (dt * 60);
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnItem();
    spawnTimer = Math.max(0.42, 0.9 - score * 0.004);
  }

  invincible = Math.max(0, invincible - dt);

  const playerHitbox = { x: yuuri.x, y: yuuri.y + 8, r: 42 };
  items.forEach((item) => {
    item.x += item.vx * dt;
    item.y += Math.sin(performance.now() / 260 + item.phase) * 0.26;
    if (hit(playerHitbox, item)) {
      if (item.kind === "heart") {
        score += 10;
        waveTimer = 0.55;
        addParticles(item.x, item.y, "#ffd4eb", 12);
      } else if (invincible <= 0) {
        hearts -= 1;
        invincible = 1.15;
        addParticles(yuuri.x, yuuri.y, "#8ee9ff", 18);
        if (hearts <= 0) {
          state = "gameover";
          startButton.textContent = "Retry";
          startButton.classList.remove("is-hidden");
        }
      }
      item.dead = true;
      updateHud();
    }
  });

  items = items.filter((item) => !item.dead && item.x > -80);
  particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 40 * dt;
    p.life -= dt;
  });
  particles = particles.filter((p) => p.life > 0);

  scoreCarry += dt * 3;
  if (scoreCarry >= 1) {
    score += Math.floor(scoreCarry);
    scoreCarry %= 1;
  }
  updateHud();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#090a24");
  sky.addColorStop(0.55, "#171245");
  sky.addColorStop(1, "#3a1d5d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 231, 250, 0.9)";
  stars.forEach((star) => {
    star.x -= star.s;
    if (star.x < -4) {
      star.x = canvas.width + 4;
      star.y = Math.random() * canvas.height;
    }
    ctx.globalAlpha = 0.4 + Math.sin(performance.now() / 500 + star.x) * 0.25;
    ctx.fillRect(star.x, star.y, star.r, star.r);
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(255, 138, 200, 0.11)";
  ctx.beginPath();
  ctx.arc(760, 106, 88, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 212, 235, 0.38)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(760, 106, 122, 28, -0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHeart(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.scale(0.72, 0.72);
  ctx.fillStyle = "#ff8ac8";
  ctx.strokeStyle = "#fff5fb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.bezierCurveTo(-33, -10, -13, -35, 0, -16);
  ctx.bezierCurveTo(13, -35, 33, -10, 0, 14);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMeteor(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.x * 0.01);
  ctx.fillStyle = "#7f6cff";
  ctx.strokeStyle = "#ffd4eb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const r = i % 2 === 0 ? item.r : item.r * 0.58;
    const a = (Math.PI * 2 * i) / 8;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawYuuri() {
  if (!sheet.complete || sheet.naturalWidth === 0) return;

  const row = ROWS[yuuri.anim];
  const frame = Math.floor(yuuri.frame) % row.frames;
  const sx = frame * CELL_W;
  const sy = row.y * CELL_H;
  const drawW = yuuri.size;
  const drawH = yuuri.size * (CELL_H / CELL_W);

  ctx.save();
  if (invincible > 0) {
    ctx.globalAlpha = 0.52 + Math.sin(performance.now() / 60) * 0.24;
  }
  ctx.drawImage(sheet, sx, sy, CELL_W, CELL_H, yuuri.x - drawW / 2, yuuri.y - drawH / 2, drawW, drawH);
  ctx.restore();
}

function drawOverlay() {
  if (state === "playing") return;
  ctx.save();
  ctx.fillStyle = "rgba(9, 8, 26, 0.46)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff5fb";
  ctx.font = "900 44px ui-rounded, system-ui, sans-serif";
  ctx.fillText(state === "gameover" ? "Again?" : "UFOゆーり", canvas.width / 2, canvas.height / 2 - 62);
  ctx.restore();
}

function draw() {
  drawBackground();
  items.forEach((item) => (item.kind === "heart" ? drawHeart(item) : drawMeteor(item)));
  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 5, 5);
  });
  ctx.globalAlpha = 1;
  drawYuuri();
  drawOverlay();
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function startLoop() {
  if (loopStarted) return;
  loopStarted = true;
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  if (event.code === "Space" && state !== "playing") reset();
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

document.querySelectorAll(".touch-pad button").forEach((button) => {
  const dir = button.dataset.dir;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    touch.add(dir);
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointerup", () => touch.delete(dir));
  button.addEventListener("pointercancel", () => touch.delete(dir));
});

startButton.addEventListener("click", reset);

if (sheet.complete && sheet.naturalWidth > 0) {
  startLoop();
} else {
  sheet.addEventListener("load", startLoop, { once: true });
}
