// ===== CANVAS SYSTEM（已修正版）=====
// 修正：redrawAll 定義、globalAlpha reset、渲染順序、shadowBlur 效能、粒子生命週期

const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

let drawing = false;
let lastX, lastY;
let strokeHistory = [];
let currentStroke = [];
let strokeCount = 0;
let totalSilence = 0;
let silenceStart = Date.now();
let particles = [];
let fadePhase = 0;
let currentStrokeImage = null; // 用於無常淡化

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  redrawAll();
}

// ===== 修正 1：redrawAll 已定義 =====
function redrawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokeHistory.forEach((stroke) => drawStroke(stroke, false));
}

// ===== 修正 5：shadowBlur 只用於完成後渲染 =====
function drawStroke(stroke, withShadow = false) {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.globalAlpha = stroke.alpha !== undefined ? stroke.alpha : 1;
  if (withShadow) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = stroke.color;
  }
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

// ===== 禪意粒子效果 =====
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2.5;
    this.vy = (Math.random() - 0.5) * 2.5 - 0.5;
    // 修正 6：粒子生命週期縮短至 30-50 幀（0.5-0.8 秒）
    this.life = 30 + Math.random() * 20;
    this.maxLife = this.life;
    this.color = color;
    this.size = Math.random() * 3 + 1.5;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.life--;
    this.size *= 0.97;
  }
  draw() {
    // 修正 3：用 save/restore 確保 globalAlpha 唔會污染
    ctx.save();
    ctx.globalAlpha = (this.life / this.maxLife) * 0.8;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}

// ===== 修正 4：統一渲染循環 =====
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 渲染所有已完成嘅筆觸（帶無常淡化）
  redrawWithFade();

  // 渲染當前筆觸（即時）
  if (drawing && currentStroke.length > 1) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.beginPath();
    ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
    for (let i = 1; i < currentStroke.length; i++) {
      ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
    }
    ctx.stroke();
  }

  // 渲染粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    } else {
      particles[i].draw();
    }
  }

  // 修正 6：限制粒子總數
  if (particles.length > 200) {
    particles.splice(0, particles.length - 200);
  }

  requestAnimationFrame(animate);
}

// ===== 修正 2：startFadeEffect 已定義 =====
function redrawWithFade() {
  fadePhase++;
  strokeHistory.forEach((stroke, idx) => {
    if (stroke.points.length < 2) return;
    // 新筆觸唔淡化，舊筆觸隨時間淡化
    const age = (strokeHistory.length - idx) / strokeHistory.length;
    const fadeAmount = Math.max(0.15, 1 - fadePhase * 0.005 * age);
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.globalAlpha = fadeAmount;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  });
}

// ===== 繪畫事件 =====
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function startDraw(e) {
  e.preventDefault();
  drawing = true;
  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;
  currentStroke = [{ x: pos.x, y: pos.y }];
  silenceStart = Date.now();
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const pos = getPos(e);
  currentStroke.push({ x: pos.x, y: pos.y });

  // 粒子效果（60% 機率觸發）
  if (Math.random() < 0.6) {
    particles.push(new Particle(pos.x, pos.y, currentColor));
  }

  lastX = pos.x;
  lastY = pos.y;
}

function endDraw(e) {
  if (!drawing) return;
  drawing = false;
  if (currentStroke.length > 1) {
    strokeHistory.push({
      points: [...currentStroke],
      color: currentColor,
      size: currentSize,
      alpha: 1,
    });
    strokeCount++;
    // 記錄停頓時間
    const silenceDur = (Date.now() - silenceStart) / 1000;
    if (silenceDur > 3) totalSilence += silenceDur;
  }
  currentStroke = [];
}

// ===== 事件綁定 =====
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);
canvas.addEventListener("touchstart", startDraw, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", endDraw);

// ===== INIT =====
window.addEventListener("load", () => {
  resizeCanvas();
  animate();
});

window.addEventListener("resize", () => {
  resizeCanvas();
});
