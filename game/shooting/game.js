const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const heartsEl = document.querySelector("#hearts");
const waveEl = document.querySelector("#wave");
const chargeEl = document.querySelector("#charge");
const startButton = document.querySelector("#start");
const messageEl = document.querySelector("#message");

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
const stars = Array.from({ length: 150 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.8 + 0.35,
  s: Math.random() * 0.34 + 0.1,
}));

let state = "ready";
let lastTime = 0;
let spawnTimer = 0;
let powerTimer = 7;
let score = 0;
let hearts = 3;
let wave = 1;
let charge = 100;
let shotCooldown = 0;
let rapidTimer = 0;
let shieldTimer = 0;
let waveKills = 0;
let shake = 0;
let messageTimer = 0;
let loopStarted = false;

const yuuri = {
  x: 132,
  y: canvas.height * 0.52,
  vx: 0,
  vy: 0,
  frame: 0,
  anim: "idle",
  size: 120,
};

let bullets = [];
let enemies = [];
let enemyShots = [];
let powerups = [];
let particles = [];

function setMessage(text) {
  if (messageEl) messageEl.textContent = text;
}

function reset() {
  startLoop();
  state = "playing";
  score = 0;
  hearts = 3;
  wave = 1;
  charge = 100;
  shotCooldown = 0;
  rapidTimer = 0;
  shieldTimer = 0;
  waveKills = 0;
  spawnTimer = 0.7;
  powerTimer = 6;
  shake = 0;
  messageTimer = 2.4;
  bullets = [];
  enemies = [];
  enemyShots = [];
  powerups = [];
  particles = [];
  yuuri.x = 132;
  yuuri.y = canvas.height * 0.52;
  yuuri.vx = 0;
  yuuri.vy = 0;
  yuuri.frame = 0;
  setMessage("Space / Z / Tap でショット。星を集めてチャージだよ。");
  startButton.classList.add("is-hidden");
  updateHud();
}

function updateHud() {
  scoreEl.textContent = String(score);
  heartsEl.textContent = String(Math.max(0, hearts));
  if (waveEl) waveEl.textContent = String(wave);
  if (chargeEl) chargeEl.textContent = `${Math.floor(charge)}%`;
}

function activeDirections() {
  return {
    left: keys.has("ArrowLeft") || keys.has("KeyA") || touch.has("left"),
    right: keys.has("ArrowRight") || keys.has("KeyD") || touch.has("right"),
    up: keys.has("ArrowUp") || keys.has("KeyW") || touch.has("up"),
    down: keys.has("ArrowDown") || keys.has("KeyS") || touch.has("down"),
  };
}

function wantsFire() {
  return keys.has("Space") || keys.has("KeyZ") || keys.has("KeyJ") || touch.has("fire");
}

function spawnEnemy() {
  const boss = waveKills >= 9 && !enemies.some((enemy) => enemy.kind === "boss");
  const kind = boss ? "boss" : Math.random() < 0.28 + wave * 0.015 ? "drifter" : "starbit";
  const y = Math.random() * (canvas.height - 130) + 65;
  const hp = kind === "boss" ? 18 + wave * 4 : kind === "drifter" ? 3 + Math.floor(wave / 2) : 1 + Math.floor(wave / 4);
  enemies.push({
    kind,
    x: canvas.width + (boss ? 90 : 40),
    y,
    r: boss ? 58 : kind === "drifter" ? 25 : 18,
    hp,
    maxHp: hp,
    vx: boss ? -58 : -150 - wave * 12 - Math.random() * 70,
    phase: Math.random() * Math.PI * 2,
    shot: boss ? 1.2 : 1.8 + Math.random() * 1.2,
  });
}

function spawnPowerup() {
  const types = ["rapid", "shield", "charge"];
  powerups.push({
    type: types[Math.floor(Math.random() * types.length)],
    x: canvas.width + 40,
    y: Math.random() * (canvas.height - 140) + 70,
    r: 18,
    vx: -150,
    phase: Math.random() * Math.PI * 2,
  });
}

function fire() {
  if (shotCooldown > 0 || charge < 6) return;
  const rapid = rapidTimer > 0;
  const spread = rapid ? [-10, 0, 10] : [0];
  spread.forEach((offset) => {
    bullets.push({
      x: yuuri.x + 44,
      y: yuuri.y + offset,
      r: rapid ? 6 : 7,
      vx: rapid ? 610 : 680,
      vy: offset * 2.2,
      power: rapid ? 1 : 2,
      life: 1.2,
    });
  });
  charge = Math.max(0, charge - (rapid ? 4 : 7));
  shotCooldown = rapid ? 0.09 : 0.17;
  addParticles(yuuri.x + 48, yuuri.y, "#8ee9ff", 5);
}

function enemyFire(enemy) {
  const angle = Math.atan2(yuuri.y - enemy.y, yuuri.x - enemy.x);
  const speed = enemy.kind === "boss" ? 245 : 210;
  enemyShots.push({
    x: enemy.x - enemy.r * 0.5,
    y: enemy.y,
    r: enemy.kind === "boss" ? 9 : 7,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 3,
  });
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 180,
      vy: (Math.random() - 0.5) * 150,
      life: 0.45 + Math.random() * 0.42,
      color,
      size: 3 + Math.random() * 4,
    });
  }
}

function hit(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) < a.r + b.r;
}

function damagePlayer() {
  if (shieldTimer > 0) {
    shieldTimer = Math.max(0, shieldTimer - 1.5);
    addParticles(yuuri.x, yuuri.y, "#8ee9ff", 18);
    return;
  }
  hearts -= 1;
  shake = 0.28;
  addParticles(yuuri.x, yuuri.y, "#ff8ac8", 24);
  if (hearts <= 0) {
    state = "gameover";
    startButton.textContent = "Retry";
    startButton.classList.remove("is-hidden");
    setMessage("もう一回、星空を取り返しにいこ。");
  }
  updateHud();
}

function collectPowerup(powerup) {
  if (powerup.type === "rapid") {
    rapidTimer = 6.5;
    setMessage("連射モード、きらきら展開だよ。");
  }
  if (powerup.type === "shield") {
    shieldTimer = 7.5;
    setMessage("シールド展開。少しだけ守られてるの。");
  }
  if (powerup.type === "charge") {
    charge = Math.min(100, charge + 42);
    setMessage("チャージ回復。いっぱい撃てるよ。");
  }
  messageTimer = 2.4;
  score += 25;
  addParticles(powerup.x, powerup.y, "#ffd4eb", 18);
  updateHud();
}

function update(dt) {
  if (state !== "playing") {
    yuuri.anim = state === "gameover" ? "failed" : "waiting";
    yuuri.frame += ROWS[yuuri.anim].speed * (dt * 60);
    return;
  }

  const dir = activeDirections();
  const ax = (dir.right ? 1 : 0) - (dir.left ? 1 : 0);
  const ay = (dir.down ? 1 : 0) - (dir.up ? 1 : 0);
  const len = Math.hypot(ax, ay) || 1;
  const speed = 340;
  yuuri.vx += ((ax / len) * speed - yuuri.vx) * Math.min(1, dt * 12);
  yuuri.vy += ((ay / len) * speed - yuuri.vy) * Math.min(1, dt * 12);
  yuuri.x = Math.max(66, Math.min(canvas.width - 90, yuuri.x + yuuri.vx * dt));
  yuuri.y = Math.max(72, Math.min(canvas.height - 72, yuuri.y + yuuri.vy * dt));

  if (Math.abs(yuuri.vx) > 40) yuuri.anim = yuuri.vx > 0 ? "right" : "left";
  else if (Math.abs(yuuri.vy) > 80) yuuri.anim = "jumping";
  else yuuri.anim = wantsFire() ? "waving" : "idle";
  yuuri.frame += ROWS[yuuri.anim].speed * (dt * 60);

  shotCooldown = Math.max(0, shotCooldown - dt);
  rapidTimer = Math.max(0, rapidTimer - dt);
  shieldTimer = Math.max(0, shieldTimer - dt);
  charge = Math.min(100, charge + dt * (rapidTimer > 0 ? 7 : 11));
  if (wantsFire()) fire();

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnEnemy();
    spawnTimer = Math.max(0.34, 1.05 - wave * 0.055 - Math.random() * 0.22);
  }
  powerTimer -= dt;
  if (powerTimer <= 0) {
    spawnPowerup();
    powerTimer = 8.5 + Math.random() * 6;
  }

  bullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
  });
  enemyShots.forEach((shot) => {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
  });
  enemies.forEach((enemy) => {
    enemy.x += enemy.vx * dt;
    enemy.y += Math.sin(performance.now() / 360 + enemy.phase) * (enemy.kind === "boss" ? 0.42 : 0.75);
    enemy.shot -= dt;
    if (enemy.shot <= 0 && enemy.x < canvas.width - 90) {
      enemyFire(enemy);
      enemy.shot = enemy.kind === "boss" ? 0.65 : 1.5 + Math.random() * 1.3;
    }
  });
  powerups.forEach((powerup) => {
    powerup.x += powerup.vx * dt;
    powerup.y += Math.sin(performance.now() / 300 + powerup.phase) * 0.38;
  });

  bullets.forEach((bullet) => {
    enemies.forEach((enemy) => {
      if (!bullet.dead && !enemy.dead && hit(bullet, enemy)) {
        bullet.dead = true;
        enemy.hp -= bullet.power;
        addParticles(bullet.x, bullet.y, "#8ee9ff", 4);
        if (enemy.hp <= 0) {
          enemy.dead = true;
          waveKills += enemy.kind === "boss" ? 4 : 1;
          score += enemy.kind === "boss" ? 320 + wave * 30 : 45 + wave * 5;
          charge = Math.min(100, charge + (enemy.kind === "boss" ? 25 : 8));
          shake = enemy.kind === "boss" ? 0.16 : shake;
          addParticles(enemy.x, enemy.y, enemy.kind === "boss" ? "#ffd4eb" : "#bca1ff", enemy.kind === "boss" ? 44 : 16);
        }
      }
    });
  });

  const playerHitbox = { x: yuuri.x, y: yuuri.y + 6, r: 38 };
  enemies.forEach((enemy) => {
    if (!enemy.dead && hit(playerHitbox, enemy)) {
      enemy.dead = true;
      damagePlayer();
    }
  });
  enemyShots.forEach((shot) => {
    if (!shot.dead && hit(playerHitbox, shot)) {
      shot.dead = true;
      damagePlayer();
    }
  });
  powerups.forEach((powerup) => {
    if (!powerup.dead && hit(playerHitbox, powerup)) {
      powerup.dead = true;
      collectPowerup(powerup);
    }
  });

  if (waveKills >= 13) {
    wave += 1;
    waveKills = 0;
    hearts = Math.min(5, hearts + 1);
    charge = 100;
    setMessage(`Wave ${wave}。ゆーり、まだ飛べるよ。`);
    messageTimer = 2.4;
    addParticles(yuuri.x, yuuri.y, "#ffd4eb", 28);
  }

  bullets = bullets.filter((bullet) => !bullet.dead && bullet.life > 0 && bullet.x < canvas.width + 60);
  enemies = enemies.filter((enemy) => !enemy.dead && enemy.x > -120);
  enemyShots = enemyShots.filter((shot) => !shot.dead && shot.life > 0 && shot.x > -60);
  powerups = powerups.filter((powerup) => !powerup.dead && powerup.x > -70);
  particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 35 * dt;
    p.life -= dt;
  });
  particles = particles.filter((p) => p.life > 0);

  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) setMessage(rapidTimer > 0 ? "連射中。近づきすぎ注意だよ。" : "星弾で夜空を守ろう。");
  }
  shake = Math.max(0, shake - dt);
  updateHud();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#070819");
  sky.addColorStop(0.55, "#151142");
  sky.addColorStop(1, "#3b1d61");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 231, 250, 0.92)";
  stars.forEach((star) => {
    star.x -= star.s * (1 + wave * 0.04);
    if (star.x < -4) {
      star.x = canvas.width + 4;
      star.y = Math.random() * canvas.height;
    }
    ctx.globalAlpha = 0.35 + Math.sin(performance.now() / 500 + star.x) * 0.25;
    ctx.fillRect(star.x, star.y, star.r, star.r);
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(255, 138, 200, 0.11)";
  ctx.beginPath();
  ctx.arc(780, 112, 88, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 212, 235, 0.36)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(780, 112, 122, 28, -0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBullet(bullet) {
  ctx.save();
  ctx.translate(bullet.x, bullet.y);
  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 14);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.45, "#8ee9ff");
  grad.addColorStop(1, "rgba(142, 233, 255, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff5fb";
  ctx.fillRect(-4, -2, 16, 4);
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(Math.sin(performance.now() / 420 + enemy.phase) * 0.22);
  if (enemy.kind === "boss") {
    ctx.fillStyle = "#4c3aac";
    ctx.strokeStyle = "#ffd4eb";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 64, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ff8ac8";
    ctx.beginPath();
    ctx.arc(0, -7, 24, Math.PI, 0);
    ctx.fill();
    drawEnemyHealth(enemy, -54, 48, 108);
  } else {
    ctx.fillStyle = enemy.kind === "drifter" ? "#8d7cff" : "#ff8ac8";
    ctx.strokeStyle = "#fff5fb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? enemy.r : enemy.r * 0.5;
      const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemyHealth(enemy, x, y, width) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.fillRect(x, y, width, 7);
  ctx.fillStyle = "#ffd4eb";
  ctx.fillRect(x, y, width * Math.max(0, enemy.hp / enemy.maxHp), 7);
}

function drawEnemyShot(shot) {
  ctx.save();
  ctx.translate(shot.x, shot.y);
  ctx.fillStyle = "#ffd4eb";
  ctx.strokeStyle = "#8d7cff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, shot.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPowerup(powerup) {
  ctx.save();
  ctx.translate(powerup.x, powerup.y);
  ctx.rotate(performance.now() / 600);
  ctx.fillStyle = powerup.type === "shield" ? "#8ee9ff" : powerup.type === "rapid" ? "#ffd4eb" : "#fff2a8";
  ctx.strokeStyle = "#fff5fb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const r = i % 2 === 0 ? 20 : 9;
    const a = (Math.PI * 2 * i) / 8;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawYuuri() {
  const row = ROWS[yuuri.anim];
  const frame = Math.floor(yuuri.frame) % row.frames;
  const sx = frame * CELL_W;
  const sy = row.y * CELL_H;
  const drawW = yuuri.size;
  const drawH = yuuri.size * (CELL_H / CELL_W);

  ctx.save();
  if (shieldTimer > 0) {
    ctx.strokeStyle = "rgba(142, 233, 255, 0.76)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(yuuri.x, yuuri.y + 2, 62, 72, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (sheet.complete && sheet.naturalWidth > 0) {
    ctx.drawImage(sheet, sx, sy, CELL_W, CELL_H, yuuri.x - drawW / 2, yuuri.y - drawH / 2, drawW, drawH);
  } else {
    ctx.fillStyle = "#ffd4eb";
    ctx.strokeStyle = "#fff5fb";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(yuuri.x, yuuri.y, 44, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8ee9ff";
    ctx.beginPath();
    ctx.arc(yuuri.x + 12, yuuri.y - 16, 18, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

function drawOverlay() {
  if (state === "playing") return;
  ctx.save();
  ctx.fillStyle = "rgba(9, 8, 26, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff5fb";
  ctx.font = "900 44px ui-rounded, system-ui, sans-serif";
  ctx.fillText(state === "gameover" ? "Mission Failed" : "UFOゆーり Shooting", canvas.width / 2, canvas.height / 2 - 64);
  ctx.font = "700 20px ui-rounded, system-ui, sans-serif";
  ctx.fillText("Move: WASD / Arrow   Shot: Space / Z", canvas.width / 2, canvas.height / 2 - 24);
  ctx.restore();
}

function draw() {
  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * shake * 22, (Math.random() - 0.5) * shake * 18);
  drawBackground();
  powerups.forEach(drawPowerup);
  bullets.forEach(drawBullet);
  enemies.forEach(drawEnemy);
  enemyShots.forEach(drawEnemyShot);
  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;
  drawYuuri();
  drawOverlay();
  ctx.restore();
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
  if ((event.code === "Space" || event.code === "Enter") && state !== "playing") reset();
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

document.querySelectorAll(".touch-pad button").forEach((button) => {
  const action = button.dataset.dir || button.dataset.action;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    touch.add(action);
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointerup", () => touch.delete(action));
  button.addEventListener("pointercancel", () => touch.delete(action));
  button.addEventListener("pointerleave", () => touch.delete(action));
});

startButton.addEventListener("click", reset);

startLoop();
