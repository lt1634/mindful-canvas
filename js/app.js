// ===== STATE =====
import {
  DANGER_KEYWORDS,
  SAFETY_RESPONSE,
  OLLAMA_SCENE_MAP,
  STORAGE_KEY,
  checkSafety,
} from "../src/logic.js";

let currentScene = "free";
let currentColor = "#e2b55a";
let currentSize = 8;
let strokeHistory = [];
let currentStroke = [];
let fadeTimer = null;
let animFrameId = null;
let particles = [];
let fadePhase = 0;
let particlesEnabled = true;
let pendingSession = null;
let logoPressTimer = null;
let appMode = "free";
let zenStartTime = 0;
let zenDuration = 120000;
let zenProgress = 0;
let zenTemplateId = "lotus";
let zenStepIndex = 0;
let zenFinished = false;
let zenTouchCount = 0;
let zenTouchStrokes = [];
let currentZenStrokeColor = "#f0c674";
let zenRipples = [];
let zenTraceLayer = null;
let zenTraceCtx = null;
let freeArtLayer = null;
let freeArtCtx = null;
let strokeTrail = null;
let zenAudio = null;
let freeAudio = null;
let sfxAudio = null;
let lastDrawSfx = 0;
let lastArtworkDataUrl = "";
let breathSmoothed = 0.5;
let breathLastTs = 0;
let toolsCollapsed = false;
let toolsIdleTimer = null;
let sumiDrops = [];
let sumiColorIndex = 0;
let sumiLastPos = null;
let sumiDragDist = 0;
let sumiLastInteraction = 0;
let sumiLastAutoDrop = 0;
let sumiFlowImpulses = [];
let sumiRipples = [];
let sumiLastFlowDx = 0;
let sumiLastFlowDy = 0;
let sumiAutoMawariAngle = 0;
let sumiAnimFrame = 0;
let sumiBgCache = null;

const BREATH_CYCLE_MS = 8000;
const TOOLS_IDLE_MS = 3000;
const AMBIENCE_SONGS = [
  "Songs/Zen Flow.mp3",
  "Songs/Paper Lantern Focus.mp3",
  "Songs/Paper Lantern Focus (1).mp3",
  "Songs/Quiet Current.mp3",
  "Songs/Quiet Current (1).mp3",
].map((path) => encodeURI(path));
const SONG_FADE_IN_SEC = 2.8;
const SONG_FADE_OUT_SEC = 2.8;
const ZEN_TRACE_COLORS = [
  "#f0c674",
  "#e8a87c",
  "#f5e6d3",
  "#f0d9a8",
  "#d4d0c8",
  "#d4a5ff",
  "#7ec8b8",
  "#e2b55a",
  "#c9b08a",
  "#a0826d",
  "#8b7355",
  "#b8734a",
  "#5a7a5a",
  "#2c5f7c",
  "#8b5e83",
  "#3a3a4a",
];

// 墨流調色：淺染／深色墨／大地色
const SUMI_COLORS = [
  { hex: "#1a1a1a", name: "黑墨" },
  { hex: "#1a3a5c", name: "深藍" },
  { hex: "#2a2820", name: "深褐" },
  { hex: "#3a5a3a", name: "松綠" },
  { hex: "#8b5e3c", name: "赭土" },
  { hex: "#7a6a52", name: "陶褐" },
  { hex: "#6b5344", name: "栗木" },
  { hex: "#5c6b52", name: "苔綠" },
  { hex: "#c43a2a", name: "朱紅" },
  { hex: "#4a6a8c", name: "靛青" },
  { hex: "#8b5e83", name: "暮色" },
  { hex: "#b8a090", name: "淡赭" },
  { hex: "#9ab5a8", name: "淺翠" },
  { hex: "#c4b8a8", name: "米色" },
];
const SUMI_MAX_DROPS = 64;
const SUMI_DROP_VERTS = 96;
const SUMI_MAX_VERTS = 320;
const SUMI_AUTO_DROP_MS = 9000;
const SUMI_TINE_U = 0.975; // 越大暈開越柔（0.94 太尖）
const SUMI_FLOW_MIN = 0.35;
const SUMI_MAX_FLOW = 12;
const SUMI_FLOW_STORAGE = "mindful-sumi-flow";
// 流動強度：細（預設）／中／大——教師可調
const SUMI_FLOW_PRESETS = [
  {
    label: "細",
    decay: 0.91,
    mult: 0.42,
    rippleRings: 2,
    rippleGrow: 1.35,
    rippleMax: 1.65,
    dropFlows: 5,
    dropFlowStr: 0.3,
    dropFlowDist: 8,
    tineMult: 0.55,
    inertiaMult: 0.35,
    inertiaVec: 20,
  },
  {
    label: "中",
    decay: 0.945,
    mult: 0.68,
    rippleRings: 2,
    rippleGrow: 1.7,
    rippleMax: 2.0,
    dropFlows: 6,
    dropFlowStr: 0.42,
    dropFlowDist: 11,
    tineMult: 0.78,
    inertiaMult: 0.6,
    inertiaVec: 30,
  },
  {
    label: "大",
    decay: 0.965,
    mult: 1.0,
    rippleRings: 3,
    rippleGrow: 2.0,
    rippleMax: 2.5,
    dropFlows: 7,
    dropFlowStr: 0.5,
    dropFlowDist: 13,
    tineMult: 1.0,
    inertiaMult: 0.85,
    inertiaVec: 36,
  },
];
let sumiFlowLevel = 0;

function getSumiFlowPreset() {
  return SUMI_FLOW_PRESETS[sumiFlowLevel] || SUMI_FLOW_PRESETS[0];
}

const ZEN_GUIDE_RADIUS = 0.46;
const ZEN_BRUSH_SIZE = 6;
const ZEN_GUIDE_GHOST_ALPHA = 0.2;
const ZEN_HINT_TEXT = "跟住淺色線條，留下你的色彩痕跡";

const ZEN_TEMPLATES = {
  circle: {
    id: "circle",
    name: "同心圓",
    steps: [
      {
        hint: "跟住金光，畫最大一圈",
        draw(cx, cy, r, a, lw) {
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫第二圈",
        draw(cx, cy, r, a, lw) {
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫第三圈",
        draw(cx, cy, r, a, lw) {
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.85})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "點一下中心",
        draw(cx, cy, r, a) {
          ctx.save();
          ctx.fillStyle = `rgba(226,181,90,${a})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.06, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      },
    ],
  },
  lotus: {
    id: "lotus",
    name: "靜心蓮",
    steps: [
      {
        hint: "跟住畫外圈",
        draw(cx, cy, r, a, lw) {
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.8})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫八片花瓣",
        draw(cx, cy, r, a) {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            drawZenPetal(cx, cy, r * 0.72, angle, "#8b5e83", a * 0.7, 1);
          }
        },
      },
      {
        hint: "畫內圈",
        draw(cx, cy, r, a, lw) {
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.48, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫內層四瓣",
        draw(cx, cy, r, a) {
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            drawZenPetal(cx, cy, r * 0.34, angle, "#5a7a5a", a * 0.65, 0.85);
          }
        },
      },
      {
        hint: "點亮中心",
        draw(cx, cy, r, a, lw) {
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(226,181,90,${a * 0.95})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      },
    ],
  },
  spiral: {
    id: "spiral",
    name: "螺旋息",
    steps: [
      {
        hint: "從中心向外繞",
        draw(cx, cy, r, a, lw) {
          drawZenSpiralArc(cx, cy, r, 0, 1.5, a, lw);
        },
      },
      {
        hint: "繼續向外",
        draw(cx, cy, r, a, lw) {
          drawZenSpiralArc(cx, cy, r, 1.5, 2.5, a, lw);
        },
      },
      {
        hint: "再繞一圈",
        draw(cx, cy, r, a, lw) {
          drawZenSpiralArc(cx, cy, r, 2.5, 3.5, a, lw);
        },
      },
      {
        hint: "收回到內圈",
        draw(cx, cy, r, a, lw) {
          ctx.save();
          ctx.strokeStyle = `rgba(90,122,90,${a * 0.75})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "中心一點",
        draw(cx, cy, r, a) {
          ctx.save();
          ctx.fillStyle = `rgba(226,181,90,${a})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      },
    ],
  },
  mandala: {
    id: "mandala",
    name: "大日如來壇城",
    steps: [
      {
        hint: "畫外圈火焰環",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.46, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.44, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫金剛蓮瓣外圈",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.85})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.38, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.35, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫四正城門方殿",
        draw(cx, cy, r, a, lw) {
          drawZenMandalaPalace(cx, cy, r, a, lw);
        },
      },
      {
        hint: "畫八瓣心蓮",
        draw(cx, cy, r, a, lw) {
          drawZenMandalaPetals(cx, cy, r, a, lw);
        },
      },
      {
        hint: "點亮中心智慧之光",
        draw(cx, cy, r, a) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.03, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,248,220,${a * 0.75})`;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.015, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      },
    ],
  },
  flower_of_life: {
    id: "flower_of_life",
    name: "生命之花",
    guideRadius: 0.52,
    steps: [
      {
        hint: "從中央圓開始",
        draw(cx, cy, r, a, lw) {
          const rr = r * 0.45;
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "向上畫第二圓",
        draw(cx, cy, r, a, lw) {
          const rr = r * 0.45;
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.82})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy - rr, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "右上第三圓",
        draw(cx, cy, r, a, lw) {
          const rr = r * 0.45;
          const dx = rr * Math.cos(Math.PI / 6);
          const dy = rr * Math.sin(Math.PI / 6);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx + dx, cy - dy, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "右下第四圓",
        draw(cx, cy, r, a, lw) {
          const rr = r * 0.45;
          const dx = rr * Math.cos(Math.PI / 6);
          const dy = rr * Math.sin(Math.PI / 6);
          ctx.save();
          ctx.strokeStyle = `rgba(90,122,90,${a * 0.78})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "向下第五圓",
        draw(cx, cy, r, a, lw) {
          const rr = r * 0.45;
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy + rr, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "左下第六圓",
        draw(cx, cy, r, a, lw) {
          const rr = r * 0.45;
          const dx = rr * Math.cos(Math.PI / 6);
          const dy = rr * Math.sin(Math.PI / 6);
          ctx.save();
          ctx.strokeStyle = `rgba(139,94,131,${a * 0.75})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx - dx, cy + dy, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "左上第七圓——種子完成",
        draw(cx, cy, r, a, lw) {
          const rr = r * 0.45;
          const dx = rr * Math.cos(Math.PI / 6);
          const dy = rr * Math.sin(Math.PI / 6);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx - dx, cy - dy, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
    ],
  },
  endless_knot: {
    id: "endless_knot",
    name: "無盡意吉祥結",
    steps: [
      {
        hint: "跟住畫外圍光環",
        draw(cx, cy, r, a, lw) {
          const s = zenArtSize(r) * 0.07;
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a * 0.5})`;
          ctx.lineWidth = lw * 0.8;
          ctx.setLineDash([10, 10]);
          const side = s * 4;
          ctx.beginPath();
          ctx.rect(cx - side, cy - side, side * 2, side * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫主結外環",
        draw(cx, cy, r, a, lw) {
          const s = zenArtSize(r) * 0.07;
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw * 1.1;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          traceZenKnotOuter(cx, cy, s);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫內部交織結",
        draw(cx, cy, r, a, lw) {
          const s = zenArtSize(r) * 0.07;
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.85})`;
          ctx.lineWidth = lw * 0.85;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(cx, cy - 1.2 * s);
          ctx.lineTo(cx + 1.6 * s, cy + 0.4 * s);
          ctx.lineTo(cx, cy + 2.0 * s);
          ctx.lineTo(cx - 1.6 * s, cy + 0.4 * s);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "點出交織節點",
        draw(cx, cy, r, a, lw) {
          const s = zenArtSize(r) * 0.07;
          const nodes = [
            [0, -1.6],
            [1.6, 0.4],
            [-1.6, 0.4],
            [0, 2.0],
            [1.6, -1.6],
            [-1.6, -1.6],
          ];
          ctx.save();
          ctx.strokeStyle = `rgba(90,122,90,${a * 0.75})`;
          ctx.lineWidth = lw * 0.6;
          ctx.setLineDash([2, 2]);
          nodes.forEach(([nx, ny]) => {
            ctx.beginPath();
            ctx.arc(cx + nx * s, cy + ny * s, s * 0.25, 0, Math.PI * 2);
            ctx.stroke();
          });
          ctx.restore();
        },
      },
      {
        hint: "描細線立體感",
        draw(cx, cy, r, a, lw) {
          const s = zenArtSize(r) * 0.07;
          ctx.save();
          ctx.strokeStyle = `rgba(139,94,131,${a * 0.7})`;
          ctx.lineWidth = lw * 0.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          traceZenKnotOuter(cx, cy, s);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "中心圓滿一點",
        draw(cx, cy, r, a) {
          ctx.save();
          ctx.fillStyle = `rgba(226,181,90,${a})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.05, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      },
    ],
  },
  bodhi_fish: {
    id: "bodhi_fish",
    name: "菩提雙魚",
    steps: [
      {
        hint: "畫菩提葉輪廓",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(90,122,90,${a * 0.7})`;
          ctx.lineWidth = lw;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, cy - sz * 0.45);
          ctx.quadraticCurveTo(cx + sz * 0.35, cy - sz * 0.1, cx, cy + sz * 0.42);
          ctx.quadraticCurveTo(cx - sz * 0.35, cy - sz * 0.1, cx, cy - sz * 0.45);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫葉脈引導線",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.6})`;
          ctx.lineWidth = lw * 0.7;
          ctx.beginPath();
          ctx.moveTo(cx, cy - sz * 0.45);
          ctx.lineTo(cx, cy + sz * 0.42);
          ctx.stroke();
          for (let i = 1; i <= 4; i++) {
            const y = cy - sz * 0.45 + sz * 0.8 * (i / 5);
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx + sz * 0.2, y - sz * 0.05, cx + sz * 0.25, y - sz * 0.12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx, y);
            ctx.quadraticCurveTo(cx - sz * 0.2, y - sz * 0.05, cx - sz * 0.25, y - sz * 0.12);
            ctx.stroke();
          }
          ctx.restore();
        },
      },
      {
        hint: "畫左側吉祥魚",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          const sc = (r * 0.45) / 80;
          drawZenFish(cx - sz * 0.11, cy, sc, -25, false, a, lw);
        },
      },
      {
        hint: "畫右側吉祥魚",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          const sc = (r * 0.45) / 80;
          drawZenFish(cx + sz * 0.11, cy, sc, 155, true, a, lw);
        },
      },
      {
        hint: "畫水波漣漪",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a * 0.55})`;
          ctx.lineWidth = lw * 0.8;
          ctx.setLineDash([4, 12]);
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([10, 20]);
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "點亮中心平靜",
        draw(cx, cy, r, a) {
          ctx.save();
          ctx.fillStyle = `rgba(226,181,90,${a})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      },
    ],
  },
};

function getDominantColor() {
  if (appMode === "sumi") return sumiDominantColor();
  const painted = strokeHistory.filter((s) => !s.eraser);
  if (!painted.length) return currentColor;
  const counts = {};
  painted.forEach((s) => {
    counts[s.color] = (counts[s.color] || 0) + 1;
  });
  let max = 0,
    dominant = currentColor;
  for (const [hex, n] of Object.entries(counts)) {
    if (n > max) {
      max = n;
      dominant = hex;
    }
  }
  return dominant;
}

function restoreCardUI(mode) {
  const drawing = document.querySelector(".card-drawing");
  const actions = document.getElementById("cardActions");
  if (mode === "safety") {
    drawing.style.display = "none";
    actions.innerHTML =
      '<button class="btn-primary" onclick="goHome()" style="width:100%">返回首頁</button>';
  } else {
    drawing.style.display = "flex";
    actions.innerHTML = `
      <button class="btn-secondary" onclick="showTerms()">使用條款</button>
      <button class="btn-secondary" onclick="saveCard()">儲存卡片</button>
      <button class="btn-secondary" onclick="downloadArtwork()">下載作品</button>
      <button class="btn-primary" onclick="finishFromCard()">返回首頁</button>
    `;
  }
}

// Colors — 淺色／大地／深色
const COLORS = [
  { name: "雪白", hex: "#f5f0e8" },
  { name: "薄霧", hex: "#e4dfd6" },
  { name: "淡金", hex: "#f0d9a8" },
  { name: "浅樱", hex: "#f0c8c0" },
  { name: "枯葉", hex: "#a0826d" },
  { name: "土褐", hex: "#8b7355" },
  { name: "赭石", hex: "#b8734a" },
  { name: "沙褐", hex: "#c9b08a" },
  { name: "金光", hex: "#e2b55a" },
  { name: "晚霞", hex: "#c46b4a" },
  { name: "翠竹", hex: "#5a7a5a" },
  { name: "暮色", hex: "#8b5e83" },
  { name: "深海", hex: "#2c5f7c" },
  { name: "墨松", hex: "#3d5248" },
  { name: "墨色", hex: "#3a3a4a" },
  { name: "深夜", hex: "#1e2838" },
];

const SIZES = [2, 4, 8, 14];

// ===== SCENE GUIDANCE =====
const SCENE_GUIDANCE = {
  anxious:
    "你選擇了「焦慮」。深呼吸……這張白紙是一片安靜的雪地。你的畫筆只是輕輕劃過表面，不需要急著定義它。現在，隨意畫一條線，或點一個點。允許第一筆是不完美的。",
  chaotic:
    "你選擇了「混亂」。腦袋裝了很多東西，像一團打結的線條。沒關係，不需要強迫它停下來。把注意力帶回呼吸，把混亂透過畫筆引導到紙上。不需要畫出具體形狀。",
  stuck:
    "你選擇了「停頓」。停滯是創作中自然的一部分，像音樂裡的休止符。不需要急著突破。當你準備好時，不要想「我要畫什麼」，而是感受「我的手想怎麼動」。",
  free: "你選擇了「自由畫布」。沒有規則，沒有對錯。讓手帶領你，讓色彩在畫布上流動。這一刻，你只需要與色彩同在。",
  zen: "你選擇了「禪繞唐卡」。不需要畫得好，只需要跟著節奏。輕觸畫面，感受光暈，讓圖案與音樂帶你進入當下。",
  sumi: "你選擇了「墨流畫布」。想像面前係一盆靜水。輕點一下，滴一滴墨，睇住佢慢慢暈開；用手指攪一攪水，墨色會跟住流動。唔使控制結果，水自然會幫你完成。",
  metta:
    "你選擇了「慈」。想想一個你想祝福的人——家人、朋友、甚至自己。讓你的畫筆帶著善意流動，不需要完美，只需要真心。每一筆都是一句無聲的祝福：願你快樂。",
  karuna:
    "你選擇了「悲」。想想一個正在受苦的人。你不需要解決他的問題，只需要在畫布上畫出你的陪伴。有時候，靜靜地同在，就是最大的慈悲。",
  mudita:
    "你選擇了「喜」。想想一個讓你由衷高興的人——他的成就、他的笑容、他的幸福。讓你的色彩變得明亮，為他人的快樂畫出喜悅。為他歡喜，就是修行。",
  upekkha:
    "你選擇了「捨」。放下好壞、得失、對錯。讓畫筆隨意流動，不追趕、不執著。接受每一筆都會消失，就像生命中的一切。平靜地與不完美共處，就是最大的自由。",
};

// ===== INIT =====
function initColors() {
  const bar = document.getElementById("colorBar");
  COLORS.forEach((c) => {
    const dot = document.createElement("div");
    dot.className = "color-dot" + (c.hex === currentColor ? " active" : "");
    dot.style.background = c.hex;
    dot.onclick = () => selectColor(c.hex, dot);
    bar.appendChild(dot);
  });
}

function initSizes() {
  const bar = document.getElementById("sizeBar");
  SIZES.forEach((s, i) => {
    const dot = document.createElement("div");
    dot.className = "size-dot" + (s === currentSize ? " active" : "");
    dot.style.width = s + "px";
    dot.style.height = s + "px";
    dot.onclick = () => selectSize(s, dot);
    bar.appendChild(dot);
  });
}

function selectColor(hex, el) {
  isEraser = false;
  currentColor = hex;
  if (appMode === "zen") currentZenStrokeColor = hex;
  document.getElementById("eraserBtn").classList.remove("active");
  canvas.classList.remove("eraser-cursor");
  document.querySelectorAll(".color-dot").forEach((d) => d.classList.remove("active"));
  el.classList.add("active");
  touchToolsActivity();
}

function toggleEraser() {
  isEraser = !isEraser;
  document.getElementById("eraserBtn").classList.toggle("active", isEraser);
  canvas.classList.toggle("eraser-cursor", isEraser);
  touchToolsActivity();
  if (isEraser) {
    document.querySelectorAll(".color-dot").forEach((d) => d.classList.remove("active"));
  } else {
    document.querySelectorAll(".color-dot").forEach((d, i) => {
      if (COLORS[i].hex === currentColor) d.classList.add("active");
    });
  }
}

function getBreathValue() {
  return breathSmoothed;
}

function getBreathLineMultiplier() {
  return 1 + 0.3 * (breathSmoothed - 0.5);
}

function updateBreath(ts) {
  if (!breathLastTs) breathLastTs = ts;
  const dt = Math.min((ts - breathLastTs) / 1000, 0.1);
  breathLastTs = ts;
  const raw = (Math.sin((2 * Math.PI * ts) / BREATH_CYCLE_MS) + 1) / 2;
  const smooth = 1 - Math.exp(-dt / 0.12);
  breathSmoothed += (raw - breathSmoothed) * smooth;
}

function drawBreathOverlay(targetCtx, w, h) {
  const c = targetCtx || ctx;
  const pw = w || canvasW;
  const ph = h || canvasH;
  const lift = (breathSmoothed - 0.5) * 0.06;
  if (Math.abs(lift) < 0.001) return;
  c.save();
  c.fillStyle = lift > 0 ? `rgba(226, 181, 90, ${lift})` : `rgba(0, 0, 0, ${-lift})`;
  c.fillRect(0, 0, pw, ph);
  c.restore();
}

function syncBreathAudio() {
  const player = zenAudio || freeAudio;
  if (!player || !player._masterGain || player._baseGain == null || player.fadeScheduled) return;
  const vol = player._baseGain * (1 + 0.08 * (breathSmoothed - 0.5));
  try {
    player._masterGain.gain.setTargetAtTime(vol, player.ctx.currentTime, 0.15);
  } catch (e) {}
}

function updateZenHintBreath() {
  const hint = document.getElementById("zenHint");
  if (!hint || appMode !== "zen") return;
  const scale = 1 + 0.04 * (breathSmoothed - 0.5);
  hint.style.transform = `scale(${scale})`;
  hint.style.opacity = String(0.82 + 0.18 * breathSmoothed);
}

function getBrushSize(eraser) {
  const base = eraser ? Math.max(currentSize * 2.5, 10) : currentSize;
  return eraser ? base : base * getBreathLineMultiplier();
}

function selectSize(s, el) {
  currentSize = s;
  document.querySelectorAll(".size-dot").forEach((d) => d.classList.remove("active"));
  el.classList.add("active");
  touchToolsActivity();
}

function setDefaultFreeBrushSize() {
  currentSize = 8;
  document.querySelectorAll(".size-dot").forEach((d) => {
    const w = parseInt(d.style.width, 10);
    d.classList.toggle("active", w === currentSize);
  });
}

// ===== CANVAS (rAF + 粒子 + 無常淡化) =====
const canvas = document.getElementById("drawCanvas");
let ctx = canvas.getContext("2d", { alpha: true });
let drawing = false;
let activePointerId = null;
let strokeCount = 0;
let silenceStart = Date.now();
let totalSilence = 0;
let canvasW = 0,
  canvasH = 0;
let isEraser = false;

class ZenRipple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 4;
    this.maxR = 50 + Math.random() * 50;
    this.life = 1;
  }
  update() {
    this.r += 1.8;
    this.life -= 0.018;
  }
  draw() {
    ctx.save();
    ctx.strokeStyle = "#e2b55a";
    ctx.globalAlpha = this.life * 0.45;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

class TrailBuffer {
  constructor(maxLen) {
    this.maxLen = maxLen || 20;
    this.points = [];
  }
  reset() {
    this.points = [];
  }
  add(x, y) {
    this.points.push({ x, y });
    if (this.points.length > this.maxLen) this.points.shift();
  }
  draw(targetCtx, color, baseWidth) {
    if (this.points.length < 2) return;
    const c = targetCtx || ctx;
    c.save();
    c.globalCompositeOperation = "lighter";
    c.lineCap = "round";
    c.lineJoin = "round";
    for (let i = 1; i < this.points.length; i++) {
      const t = i / (this.points.length - 1);
      c.strokeStyle = color;
      c.globalAlpha = t * 0.5;
      c.lineWidth = baseWidth * (0.3 + t * 0.7);
      c.beginPath();
      c.moveTo(this.points[i - 1].x, this.points[i - 1].y);
      c.lineTo(this.points[i].x, this.points[i].y);
      c.stroke();
    }
    c.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1.8;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 0.6;
    this.life = 40 + Math.random() * 30;
    this.maxLife = this.life;
    this.color = color;
    this.size = Math.random() * 2.5 + 1.2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.97;
    this.vy += 0.04;
    this.life--;
    this.size *= 0.985;
  }
  draw() {
    ctx.save();
    const a = (this.life / this.maxLife) * 0.75;
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

strokeTrail = new TrailBuffer(20);

const inkStampCache = {};
let lastInkStampX = 0;
let lastInkStampY = 0;
let paperTexture = null;
let washiTexture = null;

function hexToRgb(hex) {
  const h = (hex || "#e2b55a").replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

function getInkStamp(color, brushSize) {
  const key = color + "_" + Math.round(brushSize);
  if (inkStampCache[key]) return inkStampCache[key];
  const size = 64;
  const stamp = document.createElement("canvas");
  stamp.width = size;
  stamp.height = size;
  const sctx = stamp.getContext("2d");
  const cx = size / 2;
  const cy = size / 2;
  const rgb = hexToRgb(color);
  const layers = 5;
  for (let i = layers; i >= 1; i--) {
    const t = i / layers;
    const r = (brushSize * 0.55 + 4) * t * 1.15;
    sctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.16 * t})`;
    sctx.beginPath();
    sctx.arc(cx, cy, r, 0, Math.PI * 2);
    sctx.fill();
  }
  inkStampCache[key] = { canvas: stamp, drawSize: brushSize * 2.8 + 14 };
  return inkStampCache[key];
}

function stampInkAt(targetCtx, x, y, color, brushSize, alpha) {
  const { canvas: stamp, drawSize } = getInkStamp(color, brushSize);
  targetCtx.save();
  targetCtx.globalAlpha = alpha;
  targetCtx.drawImage(stamp, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
  targetCtx.restore();
}

function drawInkAlongPoints(targetCtx, points, color, size, alpha, step) {
  if (!points.length || alpha <= 0.01) return;
  const spacing = step || 7;
  if (points.length === 1) {
    stampInkAt(targetCtx, points[0].x, points[0].y, color, size, alpha);
    return;
  }
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    if (segLen < 0.5) continue;
    const steps = Math.max(1, Math.ceil(segLen / spacing));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      stampInkAt(targetCtx, p0.x + (p1.x - p0.x) * t, p0.y + (p1.y - p0.y) * t, color, size, alpha);
    }
  }
}

function stampInkIfMoved(x, y, color, size, alpha, minDist) {
  const dist = Math.hypot(x - lastInkStampX, y - lastInkStampY);
  if (dist < (minDist || 6)) return;
  stampInkAt(ctx, x, y, color, size, alpha);
  lastInkStampX = x;
  lastInkStampY = y;
}

function ensurePaperTexture() {
  if (paperTexture) return paperTexture;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const tctx = c.getContext("2d");
  tctx.fillStyle = "#141820";
  tctx.fillRect(0, 0, 128, 128);
  const img = tctx.getImageData(0, 0, 128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] = Math.min(255, Math.max(0, img.data[i] + n));
    img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n));
    img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n));
  }
  tctx.putImageData(img, 0, 0);
  paperTexture = c;
  return paperTexture;
}

function drawPaperBackground(targetCtx, w, h) {
  const c = targetCtx || ctx;
  const pw = w || canvasW;
  const ph = h || canvasH;
  c.fillStyle = "#10141c";
  c.fillRect(0, 0, pw, ph);
  const tex = ensurePaperTexture();
  c.save();
  c.globalAlpha = 0.055;
  c.fillStyle = c.createPattern(tex, "repeat");
  c.fillRect(0, 0, pw, ph);
  c.restore();
  const vg = c.createRadialGradient(
    pw / 2,
    ph / 2,
    Math.min(pw, ph) * 0.15,
    pw / 2,
    ph / 2,
    Math.max(pw, ph) * 0.72
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.32)");
  c.fillStyle = vg;
  c.fillRect(0, 0, pw, ph);
}

function ensureWashiTexture() {
  if (washiTexture) return washiTexture;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const tctx = c.getContext("2d");
  tctx.fillStyle = "#ebe4d6";
  tctx.fillRect(0, 0, 256, 256);
  const img = tctx.getImageData(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const i = (y * 256 + x) * 4;
      const fiber = Math.sin(x * 0.19 + y * 0.07) * 4 + Math.sin(y * 0.13) * 3;
      const grain = (Math.random() - 0.5) * 14;
      const v = 228 + fiber + grain;
      img.data[i] = Math.min(248, Math.max(218, v));
      img.data[i + 1] = Math.min(242, Math.max(210, v - 6));
      img.data[i + 2] = Math.min(228, Math.max(188, v - 22));
      img.data[i + 3] = 255;
    }
  }
  tctx.putImageData(img, 0, 0);
  tctx.strokeStyle = "rgba(140, 118, 88, 0.07)";
  tctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) {
    const y = (i / 18) * 256 + (Math.random() - 0.5) * 8;
    tctx.beginPath();
    tctx.moveTo(0, y);
    tctx.lineTo(256, y + (Math.random() - 0.5) * 6);
    tctx.stroke();
  }
  washiTexture = c;
  return washiTexture;
}

function drawWashiBackground(targetCtx, w, h) {
  const c = targetCtx || ctx;
  const pw = w || canvasW;
  const ph = h || canvasH;
  c.fillStyle = "#f0ebe0";
  c.fillRect(0, 0, pw, ph);
  const tex = ensureWashiTexture();
  c.save();
  c.globalAlpha = 0.96;
  c.fillStyle = c.createPattern(tex, "repeat");
  c.fillRect(0, 0, pw, ph);
  c.restore();
  const vg = c.createRadialGradient(
    pw / 2,
    ph / 2,
    Math.min(pw, ph) * 0.12,
    pw / 2,
    ph / 2,
    Math.max(pw, ph) * 0.78
  );
  vg.addColorStop(0, "rgba(255,255,255,0)");
  vg.addColorStop(1, "rgba(72, 52, 32, 0.18)");
  c.fillStyle = vg;
  c.fillRect(0, 0, pw, ph);
}

function drawWashiBackgroundCached(targetCtx) {
  const c = targetCtx || ctx;
  if (!sumiBgCache || sumiBgCache.w !== canvasW || sumiBgCache.h !== canvasH) {
    const off = document.createElement("canvas");
    off.width = canvasW;
    off.height = canvasH;
    drawWashiBackground(off.getContext("2d"), canvasW, canvasH);
    sumiBgCache = { canvas: off, w: canvasW, h: canvasH };
  }
  c.drawImage(sumiBgCache.canvas, 0, 0, canvasW, canvasH);
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvasW = rect.width;
  canvasH = rect.height;
  canvas.width = canvasW * dpr;
  canvas.height = canvasH * dpr;
  sumiBgCache = null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (appMode === "zen") resizeZenTraceLayer();
  else resizeFreeArtLayer();
}

function ensureFreeArtLayer() {
  if (!freeArtLayer) {
    freeArtLayer = document.createElement("canvas");
    freeArtCtx = freeArtLayer.getContext("2d", { alpha: true });
  }
  return freeArtCtx;
}

function resizeFreeArtLayer() {
  const fac = ensureFreeArtLayer();
  const dpr = window.devicePixelRatio || 1;
  freeArtLayer.width = canvasW * dpr;
  freeArtLayer.height = canvasH * dpr;
  fac.setTransform(1, 0, 0, 1, 0, 0);
  fac.scale(dpr, dpr);
  fac.lineCap = "round";
  fac.lineJoin = "round";
  redrawFreeArtLayer();
}

function redrawFreeArtLayer(preview) {
  const fac = ensureFreeArtLayer();
  fac.clearRect(0, 0, canvasW, canvasH);
  strokeHistory.forEach((stroke, idx) => {
    if (stroke.eraser) {
      eraseInkAlongPoints(fac, stroke.points, stroke.size);
      return;
    }
    const age = strokeHistory.length > 1 ? (strokeHistory.length - idx) / strokeHistory.length : 1;
    const fadeAmount = Math.max(0.72, 1 - fadePhase * 0.002 * age);
    drawInkAlongPoints(fac, stroke.points, stroke.color, stroke.size, fadeAmount, 4);
    drawStroke(stroke, fadeAmount * 0.85, fac);
  });
  if (preview) {
    if (preview.eraser) {
      eraseInkAlongPoints(fac, preview.points, preview.size);
    } else if (preview.points.length > 1) {
      drawInkAlongPoints(fac, preview.points, preview.color, preview.size, 1, 4);
      drawStroke(
        { points: preview.points, color: preview.color, size: preview.size, eraser: false },
        0.88,
        fac
      );
    }
  }
}

function ensureZenTraceLayer() {
  if (!zenTraceLayer) {
    zenTraceLayer = document.createElement("canvas");
    zenTraceCtx = zenTraceLayer.getContext("2d");
  }
  return zenTraceCtx;
}

function resizeZenTraceLayer() {
  const tctx = ensureZenTraceLayer();
  if (!tctx) return;
  const dpr = window.devicePixelRatio || 1;
  zenTraceLayer.width = canvasW * dpr;
  zenTraceLayer.height = canvasH * dpr;
  tctx.setTransform(1, 0, 0, 1, 0, 0);
  tctx.scale(dpr, dpr);
  tctx.lineCap = "round";
  tctx.lineJoin = "round";
  redrawZenTraceLayer();
}

function redrawZenTraceLayer() {
  if (!zenTraceCtx) return;
  zenTraceCtx.clearRect(0, 0, canvasW, canvasH);
  zenTouchStrokes.forEach((s) => drawZenTraceStroke(s, zenTraceCtx));
}

function persistZenStroke(stroke) {
  ensureZenTraceLayer();
  drawZenTraceStroke(stroke, zenTraceCtx);
}

function drawStroke(stroke, alpha, targetCtx) {
  const c = targetCtx || ctx;
  if (stroke.points.length < 2) return;
  c.save();
  if (stroke.eraser) {
    c.globalCompositeOperation = "destination-out";
    c.strokeStyle = "rgba(0,0,0,1)";
    c.globalAlpha = 1;
  } else {
    c.strokeStyle = stroke.color;
    c.globalAlpha = alpha;
  }
  c.lineWidth = stroke.size;
  c.beginPath();
  c.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    c.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  c.stroke();
  c.restore();
}

function eraseInkRadius(brushSize) {
  return (brushSize * 2.8 + 14) / 2;
}

function eraseInkAlongPoints(targetCtx, points, size, stampBrushSize) {
  if (!points.length) return;
  const stampRadius = eraseInkRadius(stampBrushSize || size);
  const spacing = Math.max(3, size * 0.35);
  targetCtx.save();
  targetCtx.globalCompositeOperation = "destination-out";
  targetCtx.fillStyle = "rgba(0,0,0,1)";
  const stampAt = (x, y) => {
    targetCtx.beginPath();
    targetCtx.arc(x, y, stampRadius, 0, Math.PI * 2);
    targetCtx.fill();
  };
  if (points.length === 1) {
    stampAt(points[0].x, points[0].y);
  } else {
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const steps = Math.max(1, Math.ceil(segLen / spacing));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        stampAt(p0.x + (p1.x - p0.x) * t, p0.y + (p1.y - p0.y) * t);
      }
    }
  }
  targetCtx.restore();
}

/**
 * Erase by painting with background color (for save/export only).
 * Unlike eraseInkAlongPoints which uses destination-out (transparent erase),
 * this uses source-over to paint the dark background, so saved PNGs stay dark.
 */
function eraseToBackground(targetCtx, points, size, bgColor) {
  if (!points.length) return;
  const stampRadius = eraseInkRadius(size);
  const spacing = Math.max(3, size * 0.35);
  targetCtx.save();
  targetCtx.globalCompositeOperation = "source-over";
  targetCtx.fillStyle = bgColor || "#10141c";
  const stampAt = (x, y) => {
    targetCtx.beginPath();
    targetCtx.arc(x, y, stampRadius, 0, Math.PI * 2);
    targetCtx.fill();
  };
  if (points.length === 1) {
    stampAt(points[0].x, points[0].y);
  } else {
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const steps = Math.max(1, Math.ceil(segLen / spacing));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        stampAt(p0.x + (p1.x - p0.x) * t, p0.y + (p1.y - p0.y) * t);
      }
    }
  }
  targetCtx.restore();
}

function drawEraserAlongPoints(targetCtx, points, size) {
  eraseInkAlongPoints(targetCtx, points, size);
}

function animateFreeFrame() {
  fadePhase += 0.05;
  drawPaperBackground();
  drawBreathOverlay();
  const preview =
    drawing && currentStroke.length
      ? {
          points: currentStroke,
          color: currentColor,
          size: getBrushSize(isEraser),
          eraser: isEraser,
        }
      : null;
  redrawFreeArtLayer(preview);
  ctx.drawImage(freeArtLayer, 0, 0, canvasW, canvasH);
  if (drawing && !isEraser && currentStroke.length > 1) {
    strokeTrail.draw(ctx, currentColor, getBrushSize(false));
  }
  drawParticles();
}

function animate(ts) {
  updateBreath(ts || performance.now());
  if (appMode === "zen") {
    animateZenFrame();
  } else if (appMode === "sumi") {
    animateSumiFrame();
  } else {
    animateFreeFrame();
  }
  syncBreathAudio();
  animFrameId = requestAnimationFrame(animate);
}

function animateZenFrame() {
  drawPaperBackground();
  drawBreathOverlay();
  updateZenHintBreath();

  const elapsed = zenStartTime ? Date.now() - zenStartTime : 0;
  zenProgress = zenStartTime ? Math.min(1, elapsed / zenDuration) : 0;
  drawZenGuide();
  ensureZenTraceLayer();
  redrawZenTraceLayer();
  if (drawing && currentStroke.length && isEraser) {
    const brush = getZenBrushSize(true);
    eraseInkAlongPoints(zenTraceCtx, currentStroke, brush, brush * 1.25);
  }
  if (zenTraceLayer) {
    ctx.drawImage(zenTraceLayer, 0, 0, canvasW, canvasH);
  }
  if (drawing && currentStroke.length && !isEraser) {
    const brush = getZenBrushSize(false);
    strokeTrail.draw(ctx, currentZenStrokeColor, brush);
    drawZenTraceStroke({
      points: currentStroke,
      color: currentZenStrokeColor,
      size: brush,
    });
  }

  for (let i = zenRipples.length - 1; i >= 0; i--) {
    zenRipples[i].update();
    if (zenRipples[i].life <= 0) zenRipples.splice(i, 1);
    else zenRipples[i].draw();
  }
  drawParticles();

  const remain = Math.max(0, Math.ceil((zenDuration - elapsed) / 1000));
  const m = Math.floor(remain / 60);
  const s = remain % 60;
  document.getElementById("zenTimer").textContent = m + ":" + String(s).padStart(2, "0");

  if (zenStartTime && zenProgress >= 1 && !zenFinished) {
    // Auto-finish removed — user clicks 完成 manually
  }
}

function drawParticles() {
  if (!particlesEnabled && appMode !== "zen") return;
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
    else particles[i].draw();
  }
  if (particles.length > 200) particles.splice(0, particles.length - 200);
}

function drawZenPetal(cx, cy, dist, angle, color, alpha, scale) {
  ctx.save();
  ctx.translate(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
  ctx.rotate(angle + Math.PI / 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8 * scale, 22 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getZenBrushSize(eraser) {
  const base = appMode === "zen" ? currentSize || ZEN_BRUSH_SIZE : currentSize;
  return eraser ? Math.max(base * 2.5, 10) : base;
}

function setDefaultZenBrushSize() {
  currentSize = ZEN_BRUSH_SIZE;
  document.querySelectorAll(".size-dot").forEach((d) => {
    const w = parseInt(d.style.width, 10);
    d.classList.toggle("active", w === currentSize);
  });
}

function zenGuideMetrics() {
  const tpl = ZEN_TEMPLATES[zenTemplateId];
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const mul = tpl?.guideRadius ?? ZEN_GUIDE_RADIUS;
  const r = Math.min(canvasW, canvasH) * mul;
  return { cx, cy, r };
}

function drawZenSpiralArc(cx, cy, r, startTurns, endTurns, alpha, lineW) {
  ctx.save();
  ctx.strokeStyle = `rgba(226,181,90,${alpha})`;
  ctx.lineWidth = lineW;
  ctx.lineCap = "round";
  ctx.beginPath();
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const turns = startTurns + (endTurns - startTurns) * t;
    const radius = r * (0.1 + 0.78 * (turns / 3.5));
    const angle = turns * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function zenArtSize(r) {
  return r / 0.46;
}

function traceZenKnotOuter(cx, cy, s) {
  ctx.moveTo(cx, cy - 3.2 * s);
  ctx.lineTo(cx + 1.6 * s, cy - 1.6 * s);
  ctx.lineTo(cx + 3.2 * s, cy - 3.2 * s);
  ctx.lineTo(cx + 4.2 * s, cy - 2.2 * s);
  ctx.lineTo(cx + 2.6 * s, cy - 0.6 * s);
  ctx.lineTo(cx + 4.2 * s, cy + 1.0 * s);
  ctx.lineTo(cx + 3.2 * s, cy + 2.0 * s);
  ctx.lineTo(cx + 1.6 * s, cy + 0.4 * s);
  ctx.lineTo(cx, cy + 2.0 * s);
  ctx.lineTo(cx - 1.6 * s, cy + 0.4 * s);
  ctx.lineTo(cx - 3.2 * s, cy + 2.0 * s);
  ctx.lineTo(cx - 4.2 * s, cy + 1.0 * s);
  ctx.lineTo(cx - 2.6 * s, cy - 0.6 * s);
  ctx.lineTo(cx - 4.2 * s, cy - 2.2 * s);
  ctx.lineTo(cx - 3.2 * s, cy - 3.2 * s);
  ctx.lineTo(cx - 1.6 * s, cy - 1.6 * s);
  ctx.closePath();
}

function drawZenMandalaPalace(cx, cy, r, a, lw) {
  const sz = zenArtSize(r);
  const ri = sz * 0.25;
  const rg = sz * 0.08;
  ctx.save();
  ctx.strokeStyle = `rgba(226,181,90,${a})`;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - ri, cy - ri);
  ctx.lineTo(cx - rg, cy - ri);
  ctx.lineTo(cx - rg, cy - ri - rg);
  ctx.lineTo(cx + rg, cy - ri - rg);
  ctx.lineTo(cx + rg, cy - ri);
  ctx.lineTo(cx + ri, cy - ri);
  ctx.lineTo(cx + ri, cy - rg);
  ctx.lineTo(cx + ri + rg, cy - rg);
  ctx.lineTo(cx + ri + rg, cy + rg);
  ctx.lineTo(cx + ri, cy + rg);
  ctx.lineTo(cx + ri, cy + ri);
  ctx.lineTo(cx + rg, cy + ri);
  ctx.lineTo(cx + rg, cy + ri + rg);
  ctx.lineTo(cx - rg, cy + ri + rg);
  ctx.lineTo(cx - rg, cy + ri);
  ctx.lineTo(cx - ri, cy + ri);
  ctx.lineTo(cx - ri, cy + rg);
  ctx.lineTo(cx - ri - rg, cy + rg);
  ctx.lineTo(cx - ri - rg, cy - rg);
  ctx.lineTo(cx - ri, cy - rg);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawZenMandalaPetals(cx, cy, r, a, lw) {
  const sz = zenArtSize(r);
  ctx.save();
  ctx.strokeStyle = `rgba(90,122,90,${a * 0.8})`;
  ctx.lineWidth = lw * 0.9;
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const x1 = cx + Math.cos(angle) * sz * 0.04;
    const y1 = cy + Math.sin(angle) * sz * 0.04;
    const x2 = cx + Math.cos(angle) * sz * 0.18;
    const y2 = cy + Math.sin(angle) * sz * 0.18;
    const cp1x = cx + Math.cos(angle - 0.2) * sz * 0.13;
    const cp1y = cy + Math.sin(angle - 0.2) * sz * 0.13;
    const cp2x = cx + Math.cos(angle + 0.2) * sz * 0.13;
    const cp2y = cy + Math.sin(angle + 0.2) * sz * 0.13;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);
    ctx.quadraticCurveTo(cp2x, cp2y, x1, y1);
    ctx.stroke();
  }
  ctx.restore();
}

function drawZenFish(cx, cy, scale, angleDeg, reversed, a, lw) {
  const dir = reversed ? -1 : 1;
  const rad = (angleDeg * Math.PI) / 180;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);
  ctx.scale(scale, scale);
  ctx.strokeStyle = `rgba(226,181,90,${a})`;
  ctx.lineWidth = Math.max(1.2, lw / scale);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-80, 0);
  ctx.quadraticCurveTo(0, -40 * dir, 80, 0);
  ctx.quadraticCurveTo(0, 40 * dir, -80, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = `rgba(226,181,90,${a * 0.85})`;
  ctx.beginPath();
  ctx.arc(50, 5 * dir, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(40, -18 * dir);
  ctx.quadraticCurveTo(30, 0, 40, 18 * dir);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-80, 0);
  ctx.quadraticCurveTo(-110, -30 * dir, -130, -15 * dir);
  ctx.quadraticCurveTo(-110, 0, -80, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-80, 0);
  ctx.quadraticCurveTo(-110, 30 * dir, -130, 15 * dir);
  ctx.quadraticCurveTo(-110, 0, -80, 0);
  ctx.stroke();
  ctx.restore();
}

function drawZenGuide() {
  const tpl = ZEN_TEMPLATES[zenTemplateId];
  if (!tpl) return;
  const { cx, cy, r } = zenGuideMetrics();
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
  glow.addColorStop(0, "rgba(226,181,90,0.1)");
  glow.addColorStop(1, "rgba(26,26,46,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvasW, canvasH);

  tpl.steps.forEach((step) => {
    step.draw(cx, cy, r, ZEN_GUIDE_GHOST_ALPHA, 1.2);
  });
}

function updateZenStepUI() {
  document.getElementById("zenHint").textContent = ZEN_HINT_TEXT;
}

function advanceZenStep() {
  if (zenFinished || appMode !== "zen") return;
  const tpl = ZEN_TEMPLATES[zenTemplateId];
  if (!tpl) return;
  if (zenStepIndex >= tpl.steps.length - 1) {
    finishZenSession();
    return;
  }
  zenStepIndex++;
  updateZenStepUI();
}

const ZEN_PICKER_ITEMS = [
  { id: "circle", desc: "最簡單 · 4 步 · 適合第一次" },
  { id: "lotus", desc: "經典禪意 · 5 步 · 視覺最豐富" },
  { id: "spiral", desc: "跟呼吸繞圈 · 5 步 · 流動感" },
  { id: "mandala", desc: "神聖壇城 · 5 步 · 專業底稿" },
  { id: "flower_of_life", desc: "神聖幾何 · 全螢幕 · 對稱之美" },
  { id: "endless_knot", desc: "因緣交織 · 6 步 · 立體編織" },
  { id: "bodhi_fish", desc: "八吉祥 · 6 步 · 流動和諧" },
];

function drawZenTemplatePreview(canvas, templateId) {
  const tpl = ZEN_TEMPLATES[templateId];
  if (!tpl || !canvas) return;
  const box = canvas.parentElement;
  const cssSize = Math.max(80, Math.round(box?.clientWidth || 120));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssSize * dpr);
  canvas.height = Math.round(cssSize * dpr);
  const pctx = canvas.getContext("2d");
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const mul = tpl?.guideRadius ?? ZEN_GUIDE_RADIUS;
  const r = cssSize * mul;
  pctx.fillStyle = "rgba(8, 12, 24, 0.95)";
  pctx.fillRect(0, 0, cssSize, cssSize);
  const glow = pctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.1);
  glow.addColorStop(0, "rgba(226,181,90,0.15)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  pctx.fillStyle = glow;
  pctx.fillRect(0, 0, cssSize, cssSize);
  const savedCtx = ctx;
  ctx = pctx;
  try {
    const lw = Math.max(1.4, cssSize * 0.02);
    tpl.steps.forEach((step) => {
      step.draw(cx, cy, r, 1, lw);
    });
  } finally {
    ctx = savedCtx;
  }
}

function buildZenPickerCards() {
  const container = document.getElementById("zenTemplateCards");
  if (!container) return;
  container.innerHTML = "";
  ZEN_PICKER_ITEMS.forEach((item) => {
    const tpl = ZEN_TEMPLATES[item.id];
    if (!tpl) return;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "zen-tpl-card";
    card.setAttribute("aria-label", `選擇${tpl.name}`);
    card.onclick = () => startZenMode(item.id);
    const preview = document.createElement("div");
    preview.className = "zen-tpl-preview";
    const canvas = document.createElement("canvas");
    preview.appendChild(canvas);
    const name = document.createElement("div");
    name.className = "zen-tpl-name";
    name.textContent = tpl.name;
    const desc = document.createElement("div");
    desc.className = "zen-tpl-desc";
    desc.textContent = item.desc || `${tpl.steps.length} 步跟畫`;
    card.append(preview, name, desc);
    container.appendChild(card);
    try {
      drawZenTemplatePreview(canvas, item.id);
    } catch (err) {
      console.warn("zen preview failed:", item.id, err);
    }
  });
}

function openZenPicker() {
  showScreen("zenPickerScreen");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => buildZenPickerCards());
  });
}

// ===== SUMI ENGINE（數學墨流，Lu & Jaffer 2012）=====
// 滴墨：保面積徑向推開 P' = C + (P−C)·√(1 + r²/|P−C|²)
function sumiDisplaceByDrop(cx, cy, r) {
  const r2 = r * r;
  for (const drop of sumiDrops) {
    const verts = drop.verts;
    for (let i = 0; i < verts.length; i++) {
      const dx = verts[i].x - cx;
      const dy = verts[i].y - cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 0.0001) {
        verts[i].x = cx + r;
        continue;
      }
      const scale = Math.sqrt(1 + r2 / dist2);
      verts[i].x = cx + dx * scale;
      verts[i].y = cy + dy * scale;
    }
  }
}

function sumiSpawnRipples(cx, cy, color, r) {
  const p = getSumiFlowPreset();
  for (let i = 0; i < p.rippleRings; i++) {
    sumiRipples.push({
      x: cx,
      y: cy,
      color,
      maxR: r * (p.rippleMax + i * 0.28),
      born: Date.now() + i * 130,
      r: 2,
      life: 1,
    });
  }
}

function sumiPushFlow(bx, by, mx, my, strength) {
  const scaled = strength * getSumiFlowPreset().mult;
  if (scaled < 0.5) return;
  sumiFlowImpulses.push({ bx, by, mx, my, str: scaled });
  if (sumiFlowImpulses.length > SUMI_MAX_FLOW) sumiFlowImpulses.shift();
}

function sumiApplyFlows() {
  if (!sumiFlowImpulses.length) return;
  const decay = getSumiFlowPreset().decay;
  let moved = false;
  for (let i = sumiFlowImpulses.length - 1; i >= 0; i--) {
    const f = sumiFlowImpulses[i];
    sumiTine(f.bx, f.by, f.mx, f.my, f.str, SUMI_TINE_U);
    f.str *= decay;
    moved = true;
    if (f.str < SUMI_FLOW_MIN) sumiFlowImpulses.splice(i, 1);
  }
  if (moved) sumiSmoothAll(1);
}

function sumiAddDrop(cx, cy, r, color) {
  sumiDisplaceByDrop(cx, cy, r);
  const verts = [];
  const phase = Math.random() * Math.PI * 2;
  const wobble = 0.04 + Math.random() * 0.04;
  for (let i = 0; i < SUMI_DROP_VERTS; i++) {
    const a = (i / SUMI_DROP_VERTS) * Math.PI * 2;
    // 單頻微起伏：有機水感，唔會似 sin(a×2.5) 咁起五角星
    const rr = r * (1 + Math.sin(a + phase) * wobble);
    verts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
  }
  sumiDrops.push({ color, verts });
  if (sumiDrops.length > SUMI_MAX_DROPS) sumiDrops.shift();
  sumiSmoothAll(1);
  sumiSpawnRipples(cx, cy, color, r);
}

// 攪水（tine line）：P' = P + z·u^d·M（d = 點到拖曳線距離）
function sumiTine(bx, by, mx, my, z, u) {
  const len = Math.hypot(mx, my);
  if (len < 0.001) return;
  const ux = mx / len;
  const uy = my / len;
  const nx = -uy;
  const ny = ux;
  for (const drop of sumiDrops) {
    const verts = drop.verts;
    for (let i = 0; i < verts.length; i++) {
      const d = Math.abs((verts[i].x - bx) * nx + (verts[i].y - by) * ny);
      const shift = z * Math.pow(u, d);
      if (shift < 0.05) continue;
      verts[i].x += ux * shift;
      verts[i].y += uy * shift;
    }
  }
}

// 變換後邊過長就插中點，保持多邊形平滑
function sumiResample() {
  const maxSeg = 8;
  for (const drop of sumiDrops) {
    if (drop.verts.length >= SUMI_MAX_VERTS) continue;
    const out = [];
    const verts = drop.verts;
    for (let i = 0; i < verts.length; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % verts.length];
      out.push(a);
      if (out.length < SUMI_MAX_VERTS && Math.hypot(b.x - a.x, b.y - a.y) > maxSeg) {
        out.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      }
    }
    drop.verts = out;
  }
  sumiSmoothAll(1);
}

// Laplacian 平滑頂點，消除攪水後嘅尖角
function sumiSmoothVerts(verts, passes) {
  let cur = verts;
  for (let p = 0; p < passes; p++) {
    const next = [];
    const n = cur.length;
    for (let i = 0; i < n; i++) {
      const prev = cur[(i - 1 + n) % n];
      const c = cur[i];
      const nxt = cur[(i + 1) % n];
      next.push({
        x: c.x * 0.55 + prev.x * 0.225 + nxt.x * 0.225,
        y: c.y * 0.55 + prev.y * 0.225 + nxt.y * 0.225,
      });
    }
    cur = next;
  }
  return cur;
}

function sumiSmoothAll(passes) {
  for (const drop of sumiDrops) {
    if (drop.verts.length >= 4) drop.verts = sumiSmoothVerts(drop.verts, passes);
  }
}

// 用二次曲線畫閉合墨形，唔用直線 polygon
function sumiPathSmooth(c, verts) {
  const n = verts.length;
  if (n < 3) return;
  const p = (i) => verts[(i + n) % n];
  c.moveTo((p(0).x + p(1).x) / 2, (p(0).y + p(1).y) / 2);
  for (let i = 0; i < n; i++) {
    const cp = p(i);
    const mid = { x: (p(i).x + p(i + 1).x) / 2, y: (p(i).y + p(i + 1).y) / 2 };
    c.quadraticCurveTo(cp.x, cp.y, mid.x, mid.y);
  }
  c.closePath();
}

function sumiDropBounds(verts) {
  let cx = 0;
  let cy = 0;
  for (const v of verts) {
    cx += v.x;
    cy += v.y;
  }
  cx /= verts.length;
  cy /= verts.length;
  let r = 0;
  for (const v of verts) {
    r = Math.max(r, Math.hypot(v.x - cx, v.y - cy));
  }
  return { cx, cy, r: r || 1 };
}

function fillSumiDrop(c, verts, color) {
  const { cx, cy, r } = sumiDropBounds(verts);
  const rgb = hexToRgb(color);
  c.beginPath();
  sumiPathSmooth(c, verts);
  const wash = c.createRadialGradient(cx, cy, 0, cx, cy, r * 1.15);
  wash.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.78)`);
  wash.addColorStop(0.35, `rgba(${rgb.r},${rgb.g},${rgb.b},0.48)`);
  wash.addColorStop(0.7, `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`);
  wash.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
  c.fillStyle = wash;
  c.fill();
  const core = c.createRadialGradient(cx, cy, 0, cx, cy, r * 0.42);
  core.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.55)`);
  core.addColorStop(0.6, `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`);
  core.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
  c.fillStyle = core;
  c.fill();
}

function drawSumiDrops(targetCtx) {
  const c = targetCtx || ctx;
  c.save();
  c.globalCompositeOperation = "source-over";
  for (const drop of sumiDrops) {
    const verts = drop.verts;
    if (verts.length < 3) continue;
    fillSumiDrop(c, verts, drop.color);
  }
  c.restore();
}

// 拖曳時沿路徑多步攪水，流動更連續
function sumiTineAlong(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return;
  const p = getSumiFlowPreset();
  const steps = Math.max(1, Math.ceil(len / 3));
  const segStr = Math.min(18, (len / steps) * 1.1) * p.tineMult;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const bx = x0 + dx * t;
    const by = y0 + dy * t;
    sumiTine(bx, by, dx, dy, segStr, SUMI_TINE_U);
  }
  sumiSmoothAll(1);
}

function drawSumiRipples(targetCtx) {
  const c = targetCtx || ctx;
  const now = Date.now();
  c.save();
  for (let i = sumiRipples.length - 1; i >= 0; i--) {
    const rip = sumiRipples[i];
    if (now < rip.born) continue;
    const p = getSumiFlowPreset();
    rip.r += p.rippleGrow;
    rip.life -= 0.013;
    if (rip.life <= 0 || rip.r > rip.maxR) {
      sumiRipples.splice(i, 1);
      continue;
    }
    for (let ring = 0; ring < p.rippleRings; ring++) {
      const rr = rip.r - ring * 10;
      if (rr < 3) continue;
      c.beginPath();
      c.arc(rip.x, rip.y, rr, 0, Math.PI * 2);
      c.strokeStyle = rip.color;
      c.globalAlpha = rip.life * (0.32 - ring * 0.08);
      c.lineWidth = Math.max(0.6, 2.2 - ring * 0.5);
      c.stroke();
    }
  }
  c.restore();
}

function sumiAutoMawari() {
  if (!sumiDrops.length || drawing) return;
  if (Date.now() - sumiLastInteraction < 4000) return;
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const orbit = Math.min(canvasW, canvasH) * 0.32;
  sumiAutoMawariAngle += 0.002;
  const fx = cx + Math.cos(sumiAutoMawariAngle) * orbit;
  const fy = cy + Math.sin(sumiAutoMawariAngle) * orbit;
  const tx = -Math.sin(sumiAutoMawariAngle) * 2;
  const ty = Math.cos(sumiAutoMawariAngle) * 2;
  sumiTine(fx, fy, tx, ty, 1.6, SUMI_TINE_U);
}

function animateSumiFrame() {
  sumiAnimFrame++;
  drawWashiBackgroundCached();
  if (sumiAnimFrame % 3 === 0) sumiApplyFlows();
  if (sumiAnimFrame % 8 === 0) sumiAutoMawari();
  drawSumiDrops();
  if (sumiAnimFrame % 2 === 0) drawSumiRipples();

  // 閒置時跟呼吸慢滴小墨，畫面唔會完全靜止
  const now = Date.now();
  if (
    sumiDrops.length &&
    now - sumiLastInteraction > 6000 &&
    now - sumiLastAutoDrop > SUMI_AUTO_DROP_MS
  ) {
    sumiLastAutoDrop = now;
    const x = canvasW * (0.3 + Math.random() * 0.4);
    const y = canvasH * (0.3 + Math.random() * 0.4);
    sumiAddDrop(x, y, 5 + Math.random() * 9, SUMI_COLORS[sumiColorIndex].hex);
    sumiResample();
  }
}

function sumiDominantColor() {
  if (!sumiDrops.length) return SUMI_COLORS[0].hex;
  const counts = {};
  sumiDrops.forEach((d) => {
    counts[d.color] = (counts[d.color] || 0) + 1;
  });
  let max = 0;
  let dominant = SUMI_COLORS[0].hex;
  for (const [hex, n] of Object.entries(counts)) {
    if (n > max) {
      max = n;
      dominant = hex;
    }
  }
  return dominant;
}

function selectSumiColor(idx) {
  sumiColorIndex = idx;
  document.querySelectorAll(".sumi-dot").forEach((b, i) => b.classList.toggle("active", i === idx));
}

function updateSumiFlowUI() {
  document.querySelectorAll(".sumi-flow-btn").forEach((b, i) => {
    const on = i === sumiFlowLevel;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function setSumiFlowLevel(level) {
  sumiFlowLevel = Math.max(0, Math.min(SUMI_FLOW_PRESETS.length - 1, level));
  try {
    localStorage.setItem(SUMI_FLOW_STORAGE, String(sumiFlowLevel));
  } catch (_) {}
  updateSumiFlowUI();
}

function initSumiFlowCtrl() {
  const ctrl = document.getElementById("sumiFlowCtrl");
  if (!ctrl || ctrl.dataset.ready) return;
  ctrl.dataset.ready = "1";
  try {
    const saved = localStorage.getItem(SUMI_FLOW_STORAGE);
    if (saved !== null) sumiFlowLevel = Math.max(0, Math.min(SUMI_FLOW_PRESETS.length - 1, +saved));
  } catch (_) {}
  ctrl.querySelectorAll(".sumi-flow-btn").forEach((b, i) => {
    b.onclick = () => setSumiFlowLevel(i);
  });
  updateSumiFlowUI();
}

function initSumiBar() {
  initSumiFlowCtrl();
  const bar = document.getElementById("sumiBar");
  if (!bar || bar.querySelector(".sumi-dot")) return;
  const clearBtn = bar.querySelector(".sumi-clear");
  SUMI_COLORS.forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sumi-dot" + (i === 0 ? " active" : "");
    b.style.background = c.hex;
    b.title = c.name;
    b.setAttribute("aria-label", c.name);
    b.onclick = () => selectSumiColor(i);
    bar.insertBefore(b, clearBtn);
  });
}

function clearSumiCanvas() {
  sumiDrops = [];
  sumiFlowImpulses = [];
  sumiRipples = [];
  sumiAutoMawariAngle = 0;
  strokeCount = 0;
  showToast("水面已洗淨，重新開始");
}

function drawZenMandala(progress) {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const r = Math.min(canvasW, canvasH) * ZEN_GUIDE_RADIUS;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
  glow.addColorStop(0, "rgba(226,181,90," + 0.12 * progress + ")");
  glow.addColorStop(1, "rgba(26,26,46,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const layer = (start, end, fn) => {
    if (progress < start) return;
    fn(Math.min(1, (progress - start) / (end - start)));
  };

  layer(0, 0.1, (t) => {
    ctx.save();
    ctx.strokeStyle = "#2c5f7c";
    ctx.lineWidth = 2;
    ctx.globalAlpha = t * 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2 * t);
    ctx.stroke();
    ctx.restore();
  });

  layer(0.1, 0.3, (t) => {
    const petals = 16;
    const count = Math.floor(petals * t);
    for (let i = 0; i < count; i++) {
      const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
      drawZenPetal(cx, cy, r * 0.78, angle, "#8b5e83", 0.55, 1);
    }
  });

  layer(0.3, 0.5, (t) => {
    ctx.save();
    ctx.strokeStyle = "#e2b55a";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = t * 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2 * t);
    ctx.stroke();
    ctx.restore();
    const inner = 8;
    for (let i = 0; i < Math.floor(inner * t); i++) {
      const angle = (i / inner) * Math.PI * 2;
      drawZenPetal(cx, cy, r * 0.42, angle, "#5a7a5a", 0.5, 0.85);
    }
  });

  layer(0.5, 0.72, (t) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((Math.PI / 4) * t);
    ctx.strokeStyle = "#a0826d";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = t * 0.65;
    const s = r * 0.32;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.restore();
  });

  layer(0.72, 0.88, (t) => {
    ctx.save();
    ctx.strokeStyle = "#e2b55a";
    ctx.lineWidth = 2;
    ctx.globalAlpha = t * 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2 * t);
    ctx.stroke();
    ctx.fillStyle = "#e2b55a";
    ctx.globalAlpha = t * 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, 4 * t, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  layer(0.88, 1, (t) => {
    ctx.save();
    ctx.strokeStyle = "rgba(212,208,200,0.5)";
    ctx.lineWidth = 1;
    ctx.globalAlpha = t;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r * 0.9 * t, cy + Math.sin(a) * r * 0.9 * t);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function shuffleSongList() {
  const list = [...AMBIENCE_SONGS];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function songAmbienceFadeTo(player, target, sec) {
  const t = player.ctx.currentTime;
  player.master.gain.cancelScheduledValues(t);
  player.master.gain.setValueAtTime(player.master.gain.value, t);
  player.master.gain.linearRampToValueAtTime(target, t + sec);
}

function songAmbiencePlayTrack(player) {
  if (player.stopped) return;
  player.advancing = false;
  player.fadeScheduled = false;
  const url = player.playlist[player.trackIdx];
  player.el.src = url;
  player.el.load();
  const playPromise = player.el.play();
  if (playPromise) playPromise.catch(() => {});
  songAmbienceFadeTo(player, player._baseGain, SONG_FADE_IN_SEC);
}

function songAmbienceTimeUpdate(player) {
  if (player.stopped || player.fadeScheduled || player.advancing) return;
  const dur = player.el.duration;
  if (!dur || !isFinite(dur)) return;
  const left = dur - player.el.currentTime;
  if (left <= SONG_FADE_OUT_SEC) {
    player.fadeScheduled = true;
    songAmbienceFadeTo(player, 0, Math.min(left, SONG_FADE_OUT_SEC));
  }
}

function songAmbienceAdvance(player) {
  if (player.stopped || player.advancing) return;
  player.advancing = true;
  player.trackIdx += 1;
  if (player.trackIdx >= player.playlist.length) {
    player.playlist = shuffleSongList();
    player.trackIdx = 0;
  }
  setTimeout(() => {
    if (!player.stopped) songAmbiencePlayTrack(player);
  }, 280);
}

function createSongAmbience(type) {
  const baseGain = type === "zen" ? 0.42 : 0.38;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const el = new Audio();
  el.preload = "auto";
  const source = ctx.createMediaElementSource(el);
  source.connect(master);

  const player = {
    ctx,
    el,
    master,
    _masterGain: master,
    _baseGain: baseGain,
    playlist: shuffleSongList(),
    trackIdx: 0,
    stopped: false,
    advancing: false,
    fadeScheduled: false,
    onTimeUpdate: () => songAmbienceTimeUpdate(player),
    onEnded: () => songAmbienceAdvance(player),
  };

  el.addEventListener("timeupdate", player.onTimeUpdate);
  el.addEventListener("ended", player.onEnded);
  el.addEventListener("error", () => songAmbienceAdvance(player));
  songAmbiencePlayTrack(player);
  return player;
}

function ensureSfxAudio() {
  if (!sfxAudio) {
    try {
      sfxAudio = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  return sfxAudio;
}

function resumeAllAudio() {
  [zenAudio, freeAudio].forEach((player) => {
    if (!player) return;
    if (player.ctx?.state === "suspended") player.ctx.resume().catch(() => {});
    if (player.el?.paused && !player.stopped) player.el.play().catch(() => {});
  });
  if (sfxAudio?.state === "suspended") sfxAudio.resume().catch(() => {});
}

function playBrushNoise(ac, t, opts) {
  const len = Math.floor(ac.sampleRate * (opts.duration || 0.07));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let pink = 0;
  for (let i = 0; i < len; i++) {
    pink = (pink + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = pink * Math.sin((i / len) * Math.PI) * (opts.noiseGain || 0.3);
  }
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = opts.bandFreq || 700;
  filter.Q.value = opts.bandQ || 0.7;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(opts.volume || 0.01, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + (opts.duration || 0.07));
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  noise.start(t);
  noise.stop(t + (opts.duration || 0.07) + 0.01);
}

function playSoftTone(ac, t, freq, volume, decay) {
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 520;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
  osc.connect(lp);
  lp.connect(gain);
  gain.connect(ac.destination);
  osc.start(t);
  osc.stop(t + decay + 0.02);
}

function playZenDrawSfx(isStart) {
  const ac = ensureSfxAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const t = ac.currentTime;
  const pentatonic = [220, 261.63, 293.66, 329.63, 392];
  const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

  playBrushNoise(ac, t, {
    bandFreq: 520 + Math.random() * 280,
    bandQ: 0.6,
    volume: isStart ? 0.014 : 0.009,
    duration: isStart ? 0.09 : 0.06,
    noiseGain: 0.28,
  });

  if (isStart || Math.random() < 0.28) {
    playSoftTone(ac, t, freq, isStart ? 0.005 : 0.003, isStart ? 0.35 : 0.22);
  }
}

function playFreeDrawSfx(isStart) {
  const ac = ensureSfxAudio();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const t = ac.currentTime;

  playBrushNoise(ac, t, {
    bandFreq: 380 + Math.random() * 220,
    bandQ: 0.85,
    volume: isStart ? 0.011 : 0.007,
    duration: 0.065,
    noiseGain: 0.32,
  });
}

function playDrawSfx(isStart) {
  try {
    const now = Date.now();
    const throttle = appMode === "zen" ? (isStart ? 0 : 130) : isStart ? 0 : 95;
    if (!isStart && now - lastDrawSfx < throttle) return;
    if (!isStart && appMode === "zen" && Math.random() > 0.55) return;
    lastDrawSfx = now;
    if (appMode === "zen") playZenDrawSfx(!!isStart);
    else playFreeDrawSfx(!!isStart);
  } catch (e) {}
}

function fadeOutAndClose(player) {
  if (!player) return;
  player.stopped = true;
  try {
    if (player.el) {
      player.el.removeEventListener("timeupdate", player.onTimeUpdate);
      player.el.removeEventListener("ended", player.onEnded);
    }
    songAmbienceFadeTo(player, 0, 1.2);
    setTimeout(() => {
      try {
        player.el?.pause();
        if (player.el) player.el.src = "";
        player.ctx?.close();
      } catch (e) {}
    }, 1300);
  } catch (e) {}
}

function startZenAmbience() {
  stopZenAmbience();
  try {
    zenAudio = createSongAmbience("zen");
  } catch (e) {}
}

function stopZenAmbience() {
  if (zenAudio) {
    fadeOutAndClose(zenAudio);
    zenAudio = null;
  }
}

function startFreeAmbience() {
  stopFreeAmbience();
  try {
    freeAudio = createSongAmbience("free");
  } catch (e) {}
}

function stopFreeAmbience() {
  if (freeAudio) {
    fadeOutAndClose(freeAudio);
    freeAudio = null;
  }
}

function setCanvasModeUI(mode) {
  if (mode === true) mode = "free";
  if (mode === false) mode = "zen";
  const freeUI = document.getElementById("freeModeUI");
  freeUI.style.display = mode === "sumi" ? "none" : "block";
  freeUI.classList.toggle("zen-tools", mode === "zen");
  document.getElementById("zenOverlay").style.display = mode === "zen" ? "block" : "none";
  document.getElementById("sumiUI").style.display = mode === "sumi" ? "flex" : "none";
  document.getElementById("canvasTitle").textContent =
    mode === "zen" ? "禪繞唐卡" : mode === "sumi" ? "墨流畫布" : "自由畫布";
  document.getElementById("completeBtn").style.display = "";
}

function startCanvasLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animate();
}

function stopCanvasLoop() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function zenTouchSparkle(pos) {
  zenRipples.push(new ZenRipple(pos.x, pos.y));
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    particles.push(
      new Particle(
        pos.x + (Math.random() - 0.5) * 6,
        pos.y + (Math.random() - 0.5) * 6,
        i === 0 ? currentZenStrokeColor : "#e2b55a"
      )
    );
  }
}

function traceZenStrokePath(c, pts, stroke, lineW, alpha, withBleed) {
  c.save();
  c.globalCompositeOperation = "source-over";
  c.strokeStyle = stroke.color;
  c.lineWidth = lineW;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.globalAlpha = alpha;
  if (withBleed) {
    c.shadowColor = stroke.color;
    c.shadowBlur = stroke.size * 2.2;
  }
  if (pts.length === 1) {
    c.beginPath();
    c.arc(pts[0].x, pts[0].y, Math.max(2, stroke.size * (withBleed ? 0.55 : 0.2)), 0, Math.PI * 2);
    c.fillStyle = stroke.color;
    c.fill();
  } else {
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.stroke();
  }
  c.restore();
}

function drawZenTraceStroke(stroke, targetCtx) {
  const c = targetCtx || ctx;
  const pts = stroke.points;
  if (!pts.length) return;
  if (stroke.eraser) {
    eraseInkAlongPoints(c, pts, stroke.size, stroke.size * 1.25);
    return;
  }

  traceZenStrokePath(c, pts, stroke, Math.max(2, stroke.size * 1.1), 0.2, true);
  drawInkAlongPoints(c, pts, stroke.color, stroke.size * 1.25, 0.28, 5);
  drawInkAlongPoints(c, pts, stroke.color, stroke.size, 0.88, 6);
  traceZenStrokePath(c, pts, stroke, Math.max(2, stroke.size * 0.35), 0.5, false);
}

function renderPureArtwork(targetCtx, w, h) {
  if (currentScene === "zen" || currentScene === "sumi") {
    drawWashiBackground(targetCtx, w, h);
  } else {
    drawPaperBackground(targetCtx, w, h);
  }
  targetCtx.lineCap = "round";
  targetCtx.lineJoin = "round";
  if (currentScene === "sumi") {
    drawSumiDrops(targetCtx);
  } else if (currentScene === "zen") {
    zenTouchStrokes.forEach((s) => {
      if (s.eraser) {
        eraseToBackground(targetCtx, s.points, s.size * 1.25, "#f0ebe0");
      } else {
        drawZenTraceStroke(s, targetCtx);
      }
    });
  } else {
    strokeHistory.forEach((s) => {
      if (s.eraser) {
        eraseToBackground(targetCtx, s.points, s.size, "#10141c");
        return;
      }
      drawInkAlongPoints(targetCtx, s.points, s.color, s.size, 1, 4);
      drawStroke(s, 0.35, targetCtx);
    });
  }
}

function createArtworkDataURL() {
  const temp = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  temp.width = canvasW * dpr;
  temp.height = canvasH * dpr;
  const tctx = temp.getContext("2d");
  tctx.setTransform(1, 0, 0, 1, 0, 0);
  tctx.scale(dpr, dpr);
  renderPureArtwork(tctx, canvasW, canvasH);
  return temp.toDataURL("image/png");
}

function beginStroke(e) {
  if (appMode === "zen" && zenFinished) return;
  resumeAllAudio();
  drawing = true;
  const pos = getPointerPos(e);
  currentStroke = [{ x: pos.x, y: pos.y }];
  strokeTrail.reset();
  strokeTrail.add(pos.x, pos.y);
  lastInkStampX = pos.x;
  lastInkStampY = pos.y;
  if (appMode === "zen") {
    currentZenStrokeColor = currentColor;
    if (!isEraser) zenTouchSparkle(pos);
  } else if (appMode === "sumi") {
    sumiLastPos = pos;
    sumiDragDist = 0;
    sumiLastInteraction = Date.now();
  } else {
    silenceStart = Date.now();
  }
  playDrawSfx(true);
}

function continueStroke(e) {
  if (!drawing || (appMode === "zen" && zenFinished)) return;
  const pos = getPointerPos(e);
  currentStroke.push({ x: pos.x, y: pos.y });
  strokeTrail.add(pos.x, pos.y);
  if (appMode === "zen") {
    if (!isEraser) {
      if (Math.random() < 0.22) zenTouchSparkle(pos);
      stampInkIfMoved(pos.x, pos.y, currentZenStrokeColor, getZenBrushSize(false), 0.75, 5);
    }
  } else if (appMode === "sumi") {
    if (sumiLastPos) {
      const dx = pos.x - sumiLastPos.x;
      const dy = pos.y - sumiLastPos.y;
      const segLen = Math.hypot(dx, dy);
      if (segLen > 2) {
        sumiDragDist += segLen;
        sumiLastFlowDx = dx / segLen;
        sumiLastFlowDy = dy / segLen;
        sumiTineAlong(sumiLastPos.x, sumiLastPos.y, pos.x, pos.y);
        sumiLastPos = pos;
        sumiLastInteraction = Date.now();
      }
    }
  }
  if (appMode !== "zen" && !isEraser && particlesEnabled && Math.random() < 0.6) {
    particles.push(new Particle(pos.x, pos.y, currentColor));
  }
  playDrawSfx(false);
}

function commitStroke() {
  if (!drawing) return;
  drawing = false;
  if (appMode === "sumi") {
    if (sumiDragDist < 8 && currentStroke.length) {
      const p = currentStroke[0];
      const ink = SUMI_COLORS[sumiColorIndex].hex;
      const baseR = 18 + Math.random() * 8;
      const rings = 2 + Math.floor(Math.random() * 2);
      sumiAddDrop(p.x, p.y, baseR, ink);
      for (let ring = 1; ring < rings; ring++) {
        const rr = baseR * (1 + ring * 0.42);
        const last = ring === rings - 1;
        setTimeout(() => {
          sumiAddDrop(p.x, p.y, rr, ink);
          if (last) sumiResample();
        }, ring * 120);
      }
    } else if (sumiDragDist >= 8) {
      // 放手後水面仍隨慣性流一陣
      const fp = getSumiFlowPreset();
      sumiPushFlow(
        currentStroke[currentStroke.length - 1]?.x || sumiLastPos?.x || canvasW / 2,
        currentStroke[currentStroke.length - 1]?.y || sumiLastPos?.y || canvasH / 2,
        sumiLastFlowDx * fp.inertiaVec,
        sumiLastFlowDy * fp.inertiaVec,
        22 * fp.inertiaMult
      );
    }
    sumiResample();
    strokeCount++;
    sumiLastPos = null;
    sumiDragDist = 0;
    sumiLastInteraction = Date.now();
    currentStroke = [];
    strokeTrail.reset();
    return;
  }
  if (appMode === "zen") {
    if (currentStroke.length) {
      const saved = {
        points: [...currentStroke],
        color: currentZenStrokeColor,
        size: getZenBrushSize(isEraser),
        eraser: isEraser,
      };
      if (isEraser) {
        zenTouchStrokes.push(saved);
        persistZenStroke(saved);
      } else {
        zenTouchStrokes.push(saved);
        persistZenStroke(saved);
        zenTouchCount++;
      }
    }
    currentStroke = [];
    strokeTrail.reset();
    return;
  }
  const minStrokePoints = isEraser ? 1 : 2;
  if (currentStroke.length >= minStrokePoints) {
    strokeHistory.push({
      points: [...currentStroke],
      color: currentColor,
      size: getBrushSize(isEraser),
      alpha: 1,
      eraser: isEraser,
    });
    if (!isEraser) strokeCount++;
  }
  currentStroke = [];
  strokeTrail.reset();
  const silenceDur = (Date.now() - silenceStart) / 1000;
  if (silenceDur > 3) totalSilence += silenceDur;
}

function releaseActivePointer() {
  if (activePointerId === null) return;
  try {
    canvas.releasePointerCapture(activePointerId);
  } catch (err) {}
  activePointerId = null;
}

function onPointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  if (activePointerId !== null) {
    if (drawing) commitStroke();
    releaseActivePointer();
  }
  e.preventDefault();
  activePointerId = e.pointerId;
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (err) {}
  beginStroke(e);
}

function onPointerMove(e) {
  if (e.pointerId !== activePointerId) return;
  e.preventDefault();
  continueStroke(e);
}

function onPointerUp(e) {
  if (e.pointerId !== activePointerId) return;
  e.preventDefault();
  releaseActivePointer();
  commitStroke();
}

function onPointerLost(e) {
  if (e.pointerId !== activePointerId) return;
  releaseActivePointer();
  commitStroke();
}

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);
canvas.addEventListener("lostpointercapture", onPointerLost);

function startFadeEffect() {
  stopCanvasLoop();
  fadePhase = 0;
  particles = [];
  startCanvasLoop();
}

// ===== WELCOME AMBIENT (v2 Phase 0) =====
const welcomeAmbientCanvas = document.getElementById("welcomeAmbient");
const welcomeAmbientCtx = welcomeAmbientCanvas ? welcomeAmbientCanvas.getContext("2d") : null;
let welcomeAnimId = null;
let previewAnimId = null;
let welcomePhase = 0;
let previewPhase = 0;
const welcomeInkDots = [];

function resizeWelcomeAmbient() {
  if (!welcomeAmbientCanvas || !welcomeAmbientCtx) return;
  const rect = welcomeAmbientCanvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  welcomeAmbientCanvas.width = rect.width * dpr;
  welcomeAmbientCanvas.height = rect.height * dpr;
  welcomeAmbientCtx.setTransform(1, 0, 0, 1, 0, 0);
  welcomeAmbientCtx.scale(dpr, dpr);
}

function spawnInkDot(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    maxR: 18 + Math.random() * 42,
    phase: Math.random() * Math.PI * 2,
    speed: 0.004 + Math.random() * 0.005,
    gold: Math.random() < 0.35,
  };
}

function drawWelcomeAmbient() {
  if (!welcomeAmbientCtx || !document.getElementById("welcome").classList.contains("active"))
    return;
  const w = welcomeAmbientCanvas.clientWidth;
  const h = welcomeAmbientCanvas.clientHeight;
  welcomePhase += 0.007;

  welcomeAmbientCtx.fillStyle = "#0f1018";
  welcomeAmbientCtx.fillRect(0, 0, w, h);

  const g1x = w * 0.28 + Math.sin(welcomePhase) * w * 0.07;
  const g1y = h * 0.38 + Math.cos(welcomePhase * 0.75) * h * 0.05;
  const glow1 = welcomeAmbientCtx.createRadialGradient(g1x, g1y, 0, g1x, g1y, w * 0.5);
  glow1.addColorStop(0, "rgba(44, 95, 124, 0.24)");
  glow1.addColorStop(1, "rgba(15, 16, 24, 0)");
  welcomeAmbientCtx.fillStyle = glow1;
  welcomeAmbientCtx.fillRect(0, 0, w, h);

  const g2x = w * 0.7 + Math.cos(welcomePhase * 0.55) * w * 0.09;
  const g2y = h * 0.58 + Math.sin(welcomePhase * 0.65) * h * 0.07;
  const glow2 = welcomeAmbientCtx.createRadialGradient(g2x, g2y, 0, g2x, g2y, w * 0.38);
  glow2.addColorStop(0, "rgba(226, 181, 90, 0.14)");
  glow2.addColorStop(1, "rgba(15, 16, 24, 0)");
  welcomeAmbientCtx.fillStyle = glow2;
  welcomeAmbientCtx.fillRect(0, 0, w, h);

  while (welcomeInkDots.length < 14) welcomeInkDots.push(spawnInkDot(w, h));
  welcomeInkDots.forEach((dot, i) => {
    dot.phase += dot.speed;
    const life = (Math.sin(dot.phase) + 1) / 2;
    const r = dot.maxR * life;
    const alpha = life * (dot.gold ? 0.32 : 0.22);
    welcomeAmbientCtx.beginPath();
    welcomeAmbientCtx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
    welcomeAmbientCtx.fillStyle = dot.gold
      ? `rgba(226, 181, 90, ${alpha})`
      : `rgba(44, 95, 124, ${alpha})`;
    welcomeAmbientCtx.fill();
    if (life < 0.03) welcomeInkDots[i] = spawnInkDot(w, h);
  });

  welcomeAnimId = requestAnimationFrame(drawWelcomeAmbient);
}

function setupPreviewCanvas(c, size) {
  const dpr = 2;
  if (c.width !== size * dpr) {
    c.width = size * dpr;
    c.height = size * dpr;
    c.getContext("2d").setTransform(1, 0, 0, 1, 0, 0);
    c.getContext("2d").scale(dpr, dpr);
  }
}

function drawFreePreview() {
  const c = document.getElementById("previewFree");
  if (!c) return;
  const size = 64;
  setupPreviewCanvas(c, size);
  const pctx = c.getContext("2d");
  pctx.clearRect(0, 0, size, size);
  const pulse = 0.35 + Math.sin(previewPhase) * 0.12;
  pctx.strokeStyle = `rgba(226, 181, 90, ${pulse})`;
  pctx.lineWidth = 1.5;
  pctx.lineCap = "round";
  pctx.beginPath();
  for (let t = 0; t <= 1; t += 0.04) {
    const x = size * 0.15 + t * size * 0.7;
    const y = size * 0.5 + Math.sin(t * Math.PI * 2.5 + previewPhase * 1.2) * size * 0.28;
    if (t === 0) pctx.moveTo(x, y);
    else pctx.lineTo(x, y);
  }
  pctx.stroke();
  pctx.strokeStyle = `rgba(44, 95, 124, ${pulse * 0.6})`;
  pctx.beginPath();
  for (let t = 0; t <= 1; t += 0.05) {
    const x = size * 0.2 + t * size * 0.6;
    const y = size * 0.55 + Math.cos(t * Math.PI * 3 + previewPhase) * size * 0.18;
    if (t === 0) pctx.moveTo(x, y);
    else pctx.lineTo(x, y);
  }
  pctx.stroke();
}

function drawZenPreview() {
  const c = document.getElementById("previewZen");
  if (!c) return;
  const size = 64;
  setupPreviewCanvas(c, size);
  const pctx = c.getContext("2d");
  pctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const bloom = (Math.sin(previewPhase * 0.55) + 1) / 2;
  pctx.strokeStyle = `rgba(139, 94, 131, ${0.25 + bloom * 0.35})`;
  pctx.lineWidth = 1.2;
  pctx.beginPath();
  pctx.arc(cx, cy, size * 0.3 * bloom, 0, Math.PI * 2);
  pctx.stroke();
  pctx.strokeStyle = `rgba(226, 181, 90, ${0.2 + bloom * 0.3})`;
  pctx.beginPath();
  pctx.arc(cx, cy, size * 0.18 * bloom, 0, Math.PI * 2 * bloom);
  pctx.stroke();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 + previewPhase * 0.15;
    const px = cx + Math.cos(angle) * size * 0.22 * bloom;
    const py = cy + Math.sin(angle) * size * 0.22 * bloom;
    pctx.fillStyle = `rgba(90, 122, 90, ${0.15 + bloom * 0.2})`;
    pctx.beginPath();
    pctx.ellipse(px, py, 3, 7, angle, 0, Math.PI * 2);
    pctx.fill();
  }
}

function drawSumiPreview() {
  const c = document.getElementById("previewSumi");
  if (!c) return;
  const size = 64;
  setupPreviewCanvas(c, size);
  const pctx = c.getContext("2d");
  pctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const flow = (Math.sin(previewPhase * 0.5) + 1) / 2;
  const inks = ["#3a3a4a", "#2c5f7c", "#c46b4a"];
  inks.forEach((color, k) => {
    const baseR = size * (0.12 + k * 0.09) * (0.7 + flow * 0.4);
    pctx.strokeStyle = color;
    pctx.globalAlpha = 0.35 + flow * 0.25;
    pctx.lineWidth = 2.2 - k * 0.5;
    pctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const wobble = Math.sin(a * 3 + previewPhase * (0.8 + k * 0.3)) * size * 0.05;
      const r = baseR + wobble;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.9;
      if (i === 0) pctx.moveTo(x, y);
      else pctx.lineTo(x, y);
    }
    pctx.closePath();
    pctx.stroke();
  });
  pctx.globalAlpha = 1;
}

function animateModePreviews() {
  if (!document.getElementById("welcome").classList.contains("active")) return;
  previewPhase += 0.025;
  drawFreePreview();
  drawZenPreview();
  drawSumiPreview();
  previewAnimId = requestAnimationFrame(animateModePreviews);
}

function startWelcomeAmbient() {
  stopWelcomeAmbient();
  resizeWelcomeAmbient();
  welcomeInkDots.length = 0;
  welcomePhase = 0;
  previewPhase = 0;
  drawWelcomeAmbient();
  previewAnimId = requestAnimationFrame(animateModePreviews);
}

function stopWelcomeAmbient() {
  if (welcomeAnimId) {
    cancelAnimationFrame(welcomeAnimId);
    welcomeAnimId = null;
  }
  if (previewAnimId) {
    cancelAnimationFrame(previewAnimId);
    previewAnimId = null;
  }
}

function enterCanvasScreen() {
  stopWelcomeAmbient();
  const screen = document.getElementById("canvasScreen");
  showScreen("canvasScreen");
  screen.classList.remove("canvas-enter");
  void screen.offsetWidth;
  screen.classList.add("canvas-enter");
  setTimeout(() => screen.classList.remove("canvas-enter"), 700);
}

// ===== SCREEN NAVIGATION =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "welcome") startWelcomeAmbient();
  else if (id !== "canvasScreen") stopWelcomeAmbient();
}

function showCardScreen() {
  showScreen("cardScreen");
  const screen = document.getElementById("cardScreen");
  screen.classList.remove("card-enter");
  void screen.offsetWidth;
  screen.classList.add("card-enter");
  setTimeout(() => screen.classList.remove("card-enter"), 1200);
}

function setToolsCollapsed(collapsed) {
  toolsCollapsed = collapsed;
  const ui = document.getElementById("freeModeUI");
  if (!ui) return;
  ui.classList.toggle("tools-collapsed", collapsed);
  const btn = document.getElementById("toolsToggle");
  if (btn) btn.textContent = collapsed ? "工具 ▲" : "收起 ▼";
}

function touchToolsActivity() {
  if (toolsIdleTimer) {
    clearTimeout(toolsIdleTimer);
    toolsIdleTimer = null;
  }
}

function toggleToolsPanel() {
  setToolsCollapsed(!toolsCollapsed);
  if (!toolsCollapsed) touchToolsActivity();
  else if (toolsIdleTimer) clearTimeout(toolsIdleTimer);
}

function resetCanvasState() {
  stopCanvasLoop();
  stopZenAmbience();
  stopFreeAmbience();
  if (toolsIdleTimer) {
    clearTimeout(toolsIdleTimer);
    toolsIdleTimer = null;
  }
  breathLastTs = 0;
  breathSmoothed = 0.5;
  fadePhase = 0;
  strokeHistory = [];
  strokeCount = 0;
  totalSilence = 0;
  particles = [];
  zenRipples = [];
  zenTouchStrokes = [];
  zenTouchCount = 0;
  zenTraceLayer = null;
  zenTraceCtx = null;
  freeArtLayer = null;
  freeArtCtx = null;
  if (strokeTrail) strokeTrail.reset();
  zenProgress = 0;
  zenTemplateId = "lotus";
  zenStepIndex = 0;
  zenFinished = false;
  zenStartTime = 0;
  sumiDrops = [];
  sumiColorIndex = 0;
  sumiLastPos = null;
  sumiDragDist = 0;
  sumiLastInteraction = 0;
  sumiLastAutoDrop = 0;
  sumiFlowImpulses = [];
  sumiRipples = [];
  sumiLastFlowDx = 0;
  sumiLastFlowDy = 0;
  sumiAutoMawariAngle = 0;
  sumiAnimFrame = 0;
  sumiBgCache = null;
  drawing = false;
  activePointerId = null;
  currentStroke = [];
  isEraser = false;
  document.getElementById("eraserBtn").classList.remove("active");
  canvas.classList.remove("eraser-cursor");
}

function startFreeMode() {
  appMode = "free";
  currentScene = "free";
  resetCanvasState();
  setDefaultFreeBrushSize();
  setToolsCollapsed(false);
  setCanvasModeUI(true);
  enterCanvasScreen();
  setTimeout(() => {
    resizeCanvas();
    startFreeAmbience();
    showToast(SCENE_GUIDANCE.free, 8000);
    startFadeEffect();
    touchToolsActivity();
  }, 100);
}

function startSumiMode() {
  appMode = "sumi";
  currentScene = "sumi";
  resetCanvasState();
  setCanvasModeUI("sumi");
  initSumiBar();
  selectSumiColor(0);
  enterCanvasScreen();
  setTimeout(() => {
    resizeCanvas();
    startFreeAmbience();
    showToast(SCENE_GUIDANCE.sumi, 8000);
    startCanvasLoop();
  }, 100);
}

function startZenMode(templateId) {
  if (!templateId || !ZEN_TEMPLATES[templateId]) templateId = "lotus";
  zenTemplateId = templateId;
  zenStepIndex = 0;
  appMode = "zen";
  currentScene = "zen";
  resetCanvasState();
  zenTemplateId = templateId;
  zenStepIndex = 0;
  setCanvasModeUI(false);
  setDefaultZenBrushSize();
  currentZenStrokeColor = ZEN_TRACE_COLORS[0];
  enterCanvasScreen();
  setTimeout(() => {
    resizeCanvas();
    resizeZenTraceLayer();
    zenStartTime = Date.now();
    updateZenStepUI();
    startZenAmbience();
    showToast(SCENE_GUIDANCE.zen, 8000);
    startCanvasLoop();
  }, 100);
}

function finishZenSession() {
  zenFinished = true;
  stopZenAmbience();
  strokeCount = Math.max(zenTouchStrokes.length, 1);
  document.getElementById("zenHint").textContent = "完成了，正在為你生成心靈卡片…";
  setTimeout(() => generateCard(true), 200);
}

function goHome() {
  stopCanvasLoop();
  stopZenAmbience();
  stopFreeAmbience();
  appMode = "free";
  setCanvasModeUI(true);
  fadePhase = 0;
  strokeHistory = [];
  strokeCount = 0;
  totalSilence = 0;
  particles = [];
  lastArtworkDataUrl = "";
  pendingSession = null;
  restoreCardUI("normal");
  zenFinished = false;
  isEraser = false;
  document.getElementById("eraserBtn").classList.remove("active");
  canvas.classList.remove("eraser-cursor");
  zenTemplateId = "lotus";
  zenStepIndex = 0;
  document.getElementById("zenHint").textContent = ZEN_HINT_TEXT;
  document.getElementById("freeModeUI").classList.remove("zen-tools");
  showScreen("welcome");
  restartWelcomeEnterAnimation();
}

// ===== CARD GENERATION =====
function generateCard(force) {
  if (!force && strokeCount === 0 && appMode === "free") {
    showToast("先畫一些東西吧");
    return;
  }

  // If zen mode and not yet finished, finalize it first
  if (appMode === "zen" && !zenFinished) {
    zenFinished = true;
    stopZenAmbience();
    strokeCount = Math.max(zenTouchStrokes.length, 1);
  }

  stopCanvasLoop();
  stopFreeAmbience();

  // Show loading
  document.getElementById("loading").classList.add("active");

  lastArtworkDataUrl = createArtworkDataURL();
  document.getElementById("cardImage").src = lastArtworkDataUrl;

  document.getElementById("loadingText").textContent = "正在為你生成心靈解讀...";
  (async () => {
    const interpretation = await generateInterpretationAI();

    if (!interpretation.isSafe) {
      document.getElementById("loading").classList.remove("active");
      document.getElementById("cardAffirmation").textContent = interpretation.affirmation;
      document.getElementById("cardReflection").textContent = interpretation.reflection;
      document.getElementById("cardImage").src = "";
      restoreCardUI("safety");
      showCardScreen();
      return;
    }

    pendingSession = {
      date: new Date().toISOString(),
      mode: appMode,
      scene: currentScene,
      strokes: strokeCount,
      silence: Math.round(totalSilence),
      dominantColor:
        appMode === "zen"
          ? "#e2b55a"
          : appMode === "sumi"
            ? sumiDominantColor()
            : getDominantColor(),
      source: interpretation.source || "template",
    };

    document.getElementById("cardAffirmation").textContent = interpretation.affirmation;
    document.getElementById("cardReflection").textContent = interpretation.reflection;
    restoreCardUI("normal");
    document.getElementById("loading").classList.remove("active");
    showCardScreen();
  })();
}

function generateInterpretation() {
  const safety = checkSafety(currentScene, strokeCount, totalSilence);
  if (safety) return safety;

  // ===== 2. AFFIRMATION POOL (10 per scene, 80 total) =====
  const affirmations = {
    anxious: [
      "你將未知的焦慮，溫柔地化作了色彩的流動。緊繃的背後，是你對生命的敬畏。",
      "每一筆不完美的線條，都是你勇敢面對空白的證明。",
      "你沒有逃避這張白紙，你選擇了與它對話。這份勇氣，本身就是平靜的開始。",
      "焦慮不是你的敵人，它是身體在提醒你：這件事對你很重要。",
      "你把看不見的壓力，變成了看得見的色彩。這份轉化，本身就是力量。",
      "白紙曾經讓你害怕，但你動筆了。這就夠了。",
      "你的手在顫抖，但你依然在畫。這份堅持，比任何一幅完美作品都珍貴。",
      "不需要平靜才能開始。帶著焦慮動筆，焦慮會在色彩中慢慢融化。",
      "你選擇面對，而不是逃避。這一步，已經比昨天更勇敢。",
      "深呼吸。你現在在這裡，在色彩裡，在安全的地方。",
    ],
    chaotic: [
      "混亂不是錯誤，是創造力正在湧動的跡象。",
      "你把腦中的風暴，輕輕地釋放在畫布上。紙承載得起你所有的思緒。",
      "思緒如雲，飄過就飄過了。你剛才做的，是讓它們有了一个温柔的出口。",
      "腦袋很亂的時候，不需要整理。畫出來，就是一種整理。",
      "混亂的線條是情緒最誠實的模樣。不需要美化，不需要解釋。",
      "你的思緒像一條湍急的河流。畫布是河岸，讓它流過。",
      "不需要想清楚才能畫。有時候，畫了才會想清楚。",
      "那些糾纏在一起的念頭，現在出現在紙上了。它們不再只困在你的腦袋裡。",
      "混亂代表你正在處理很多東西。這不是弱點，這是韌性。",
      "讓線條自己找到出路。你不需要為它們規劃路線。",
    ],
    stuck: [
      "停頓不是停滯，是土壤在安靜地準備下一次綻放。",
      "你選擇了與此刻的自己共處，不催促、不批判。這本身就是最深的覺知。",
      "留白也是創作的一部分。不落一筆，也是一種圓滿。",
      "停下來不是放棄。有時候，停下來才是最勇敢的選擇。",
      "你的手停住了，但你的心依然在感受。這份感受，比任何筆觸都重要。",
      "音樂最美的部分，往往是休止符。你的停頓，也是。",
      "不需要一直前進。在原地站一會兒，也是一種移動。",
      "你給了自己一個喘息的空間。這份溫柔，你值得擁有。",
      "空白不是空虛。它是可能性，是安靜，是你給自己的禮物。",
      "當你準備好，下一步自然會來。不急。",
    ],
    free: [
      "你讓手自由地舞動，讓色彩自己說話。這一刻，你與創作合為一體。",
      "不追求結果的創作，才是最純粹的表達。你做得很好。",
      "每一筆都在消失，每一筆都是全新的開始。享受這個流動的當下。",
      "沒有規則，沒有對錯。你的手知道要去哪裡。",
      "讓顏色帶領你。你不需要為它們做決定。",
      "這是你和色彩之間的對話。不需要旁觀者，不需要評分。",
      "你在這裡，在畫布前，在呼吸裡。這就是全部。",
      "你的手指是畫筆，你的心是顏料。這幅畫，是你此刻最真實的樣子。",
      "不需要畫出什麼。拿起筆，就是創作的開始。",
      "線條會消失，但體驗不會。你剛才那一刻的專注，已經留在你身體裡。",
    ],
    metta: [
      "你的每一筆，都是一句無聲的祝福。善意不需要言語，色彩就是它的語言。",
      "你在為一個人畫畫。這份心意，比任何一幅杰作都珍貴。",
      "慈是：我希望你快樂。你剛才用色彩說了這句話。",
      "不需要見到對方，善意就能穿越距離。你剛才做的事情，比你想像的更有力量。",
      "為他人畫畫的時候，你自己的心也會變得柔軟。",
      "你選擇了「慈」。這個選擇本身，就是一種修行。",
      "讓你的畫筆帶著溫暖流動。每一個顏色都是一份善意。",
      "不需要完美，只需要真心。你剛才畫的每一筆，都充滿了祝福。",
      "慈不求回報。你畫完了，善意就已經完成了。",
      "你為他人送上祝福，而祝福首先溫暖的是你自己。",
    ],
    karuna: [
      "你為一個人的痛苦畫了一幅畫。這份陪伴，比任何安慰都深沉。",
      "悲不是同情，是「我願意和你一起承受」。你剛才做的事情，就是這樣。",
      "你不需要解決任何問題。靜靜地陪伴，就是最大的慈悲。",
      "為受苦的人畫畫，是一種無聲的擁抱。",
      "你選擇了「悲」。這代表你的心是柔軟的、打開的。",
      "每一筆都在說：「你在這裡，你不孤單。」",
      "悲是：願你離苦。你剛才用色彩表達了這個願望。",
      "你為他人的痛苦騰出了一個空間。這份空間，就是慈悲。",
      "不需要做什麼。你的畫筆已經替你說了最溫柔的話。",
      "你選擇了陪伴而不是逃避。這份勇氣，本身就是慈悲。",
    ],
    mudita: [
      "你為他人的快樂而畫。這份喜悅，是雙倍的。",
      "為別人的成就感到高興，是一種稀缺的能力。你剛才做到了。",
      "你的色彩變得明亮了。因為你在為一個人的幸福畫畫。",
      "喜是：你的快樂就是我的快樂。你剛才用畫筆說了這句話。",
      "不需要比較。為他人歡喜，你自己也會變得更豐盛。",
      "你選擇了「喜」。這個選擇，讓你的心變得更寬廣。",
      "每一筆明亮的色彩，都是你為他人點亮的一盞燈。",
      "嫉妒消耗能量，隨喜創造能量。你剛才做了一件很有力量的事。",
      "為他人的幸福真心高興，是世界上最難也最美的修行。",
      "你剛才畫的這幅畫，是為一個人的笑容而存在的。",
    ],
    upekkha: [
      "你選擇了放下。讓畫筆隨意流動，不追趕、不執著。",
      "每一筆都會消失，就像生命中的一切。你接受這件事，就是自由。",
      "不追好、不避壞。你剛才在畫布上練習了平等心。",
      "捨是：我接受一切如其所是。你剛才用色彩表達了這份接受。",
      "不需要完美。不需要結果。你只需要在這裡，和畫布在一起。",
      "你選擇了「捨」。這代表你願意與無常和平共處。",
      "線條來了又走，色彩亮了又暗。你只是靜靜地看著。這就是修行。",
      "放下不是放棄。是「我看見了，我接受了，我繼續前行」。",
      "你在畫布上練習了最重要的一課：不執著。",
      "捨是四無量心的根基。沒有捨，就沒有真正的慈、悲、喜。你剛才做到了。",
    ],
    zen: [
      "你跟隨節奏，讓唐卡在眼前慢慢綻放。這份耐心，本身就是修行。",
      "你不需要畫得好，只需要在場。剛才那一分鐘，你已經做到了。",
      "輕觸之間，光暈散開。你與畫面同在，這就是覺知。",
      "音樂與圖案帶著你走，你的手只是回應。這份放鬆，值得被看見。",
      "一分鐘很短，但足夠讓心靜下來。你剛才給了自己一份禮物。",
      "唐卡的圓滿，不在於完美，而在於你願意跟隨。",
      "你讓圖案自己出現，讓手指輕輕回應。這就是禪繞的意義。",
      "剛才那一刻，你沒有追趕，沒有著急。很好。",
      "光暈散開的瞬間，你已經與當下合一。",
      "你完成了一幅禪意之畫。帶走這份平靜，回到日常吧。",
    ],
    sumi: [
      "墨滴落水，自己會找到形狀。你只需要放手，讓它流動。",
      "你攪動的水流，每一道紋路都係獨一無二。呢一刻，唔會再重複。",
      "墨色喺水面慢慢暈開，就好似情緒慢慢散開一樣。唔使捉緊。",
      "你冇控制結果，但結果好美。有時候，放下控制就係答案。",
      "水面承載得起所有墨色，就好似呢一刻承載得起你所有思緒。",
      "一滴墨改變唔到大海，但改變到成幅畫。你嘅每個小行動都有意思。",
      "墨流嘅美，在於佢從來唔重複。你嘅每一日，都係新嘅一幅畫。",
      "你睇住墨色流動嗰陣，心都靜咗落嚟。呢份觀察，就係正念。",
      "水唔會急，墨唔會趕。你都可以慢慢嚟。",
      "呢幅墨流畫係水同你合作嘅作品。學識同唔確定共處，係好大嘅成長。",
    ],
  };

  // ===== 3. COLOR DESCRIPTIONS (now connected) =====
  const colorDescriptions = {
    "#e2b55a": {
      name: "金光",
      meaning: "你選擇了金色，代表你內心正在尋找溫暖與智慧。",
      phrase: "金色的光芒",
    },
    "#2c5f7c": {
      name: "深海",
      meaning: "你選擇了深藍，代表你內心雖然澎湃，但依舊尋求平靜。",
      phrase: "深海的沉澱",
    },
    "#8b5e83": {
      name: "暮色",
      meaning: "你選擇了紫色，代表你正在經歷一次內在的轉化。",
      phrase: "暮色的直覺",
    },
    "#a0826d": {
      name: "枯葉",
      meaning: "你選擇了大地色，代表你需要穩定與根基。",
      phrase: "大地的穩定",
    },
    "#d4d0c8": {
      name: "霧白",
      meaning: "你選擇了白色，代表你在留白中尋找可能性。",
      phrase: "霧白的留白",
    },
    "#5a7a5a": {
      name: "翠竹",
      meaning: "你選擇了綠色，代表你內心渴望成長與療癒。",
      phrase: "翠竹的生長",
    },
    "#c46b4a": {
      name: "晚霞",
      meaning: "你選擇了橘色，代表你內心有強烈的生命力正在湧動。",
      phrase: "晚霞的熱情",
    },
    "#3a3a4a": {
      name: "墨色",
      meaning: "你選擇了墨色，代表你正在向內探索深處。",
      phrase: "墨色的內省",
    },
  };

  // ===== 4. REFLECTION ENGINE (modular, color-aware) =====
  const dominantColor = getDominantColor();
  const colorInfo = colorDescriptions[dominantColor] ||
    colorDescriptions[currentColor] || { meaning: "", phrase: "" };

  // Module A: stroke count
  let strokePart = "";
  if (strokeCount < 5) {
    strokePart = `你用寥寥幾筆 ${strokeCount} 筆完成了這幅畫，留出了大量空間`;
  } else if (strokeCount < 30) {
    strokePart = `你用 ${strokeCount} 筆勾勒了你此刻的心境`;
  } else if (strokeCount < 100) {
    strokePart = `你用 ${strokeCount} 筆層層疊疊地表達了自己`;
  } else if (strokeCount < 500) {
    strokePart = `你用超過 ${strokeCount} 筆進行了一次大規模的情緒釋放`;
  } else {
    strokePart = `你用 ${strokeCount} 筆完成了一次極致的釋放，畫布完全承接得起你所有的力量`;
  }

  // Module B: silence
  let silencePart = "";
  if (totalSilence > 60) {
    silencePart = `其中有一段超過一分鐘的深層寂靜，那是你與自己最深的對話`;
  } else if (totalSilence > 30) {
    silencePart = `其中有 ${Math.round(totalSilence)} 秒的深度停頓，那是你進入心流的證明`;
  } else if (totalSilence > 5) {
    silencePart = `其中有 ${Math.round(totalSilence)} 秒的寂靜，那是你與自己對話的時刻`;
  } else {
    silencePart = "節奏流暢，你的手一直帶著你前進";
  }

  // Module C: color
  let colorPart = colorInfo.meaning || "";

  // Module D: scene-specific ending
  const sceneEndings = {
    anxious: "焦慮終將過去，而你依然在這裡。帶住這份覺察，回到你的日常吧。",
    chaotic:
      "混亂的線條是你此刻最真實的樣子——不需要整理，不需要美化。每一筆的消逝，都帶走了一小部分重量。你做得很好。",
    stuck: "創作中的停頓像音樂的休止符，不是空白，而是蓄力。當你準備好時，下一步自然會來。",
    free: "這就是當下的力量——不追憶過去，不預期未來，只是純粹地創作。你做得很好。",
    metta:
      "你剛才為一個人送上了一份無聲的祝福。善意已經完成，不需要更多。帶住這份溫暖，回到你的日常。",
    karuna:
      "你剛才為一個人的痛苦騰出了一個空間。這份陪伴，就是你能做的最好的事。帶住這份慈悲，繼續前行。",
    mudita:
      "你剛才為他人的快樂畫了一幅畫。為他人歡喜，你自己也變得更豐盛。帶住這份喜悅，繼續前行。",
    upekkha: "你剛才在畫布上練習了放下。每一筆都會消失，而你平靜地接受了這件事。這就是最大的自由。",
    zen: "你剛才跟隨禪繞唐卡，完成了一次靜心的旅程。圖案已綻放，你的心也安定了。帶走這份感受，繼續前行。",
  };
  let endingPart = sceneEndings[currentScene] || sceneEndings.free;

  if (currentScene === "zen") {
    strokePart =
      zenTouchStrokes.length > 0
        ? `你在禪繞過程中留下了 ${zenTouchStrokes.length} 道色彩痕跡，每一筆都是與畫面的對話`
        : "你安靜地跟隨圖案綻放，讓節奏帶領你完成這幅畫";
    silencePart = "這一分鐘裡，你與音樂和圖案同在";
    colorPart = "金色的光暈貫穿整幅唐卡，象徵內心的溫暖與覺醒。";
  }

  // Assemble reflection
  const reflection = `${strokePart}，${silencePart}。${colorPart}${colorPart ? "。" : ""}${endingPart}`;

  // ===== 5. PICK AFFIRMATION =====
  const sceneAffirmations = affirmations[currentScene] || affirmations.free;
  const affirmation = sceneAffirmations[Math.floor(Math.random() * sceneAffirmations.length)];

  return { affirmation, reflection, isSafe: true };
}

// ===== 6. OLLAMA AI INTEGRATION (v2 - opt-in only) =====
const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "gemma4:12b";
const OLLAMA_HEALTH_MS = 1500;
const OLLAMA_GENERATE_MS = 5000;

function shouldUseOllama() {
  return new URLSearchParams(location.search).get("ai") === "1";
}

function templateInterpretation() {
  return { ...generateInterpretation(), source: "template" };
}

async function generateInterpretationAI() {
  const safety = checkSafety(currentScene, strokeCount, totalSilence);
  if (safety) return safety;

  if (!shouldUseOllama()) {
    return templateInterpretation();
  }

  document.getElementById("loadingText").textContent = "AI 正在為你撰寫專屬解讀...";

  try {
    const healthCheck = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
      signal: AbortSignal.timeout(OLLAMA_HEALTH_MS),
    });
    if (!healthCheck.ok) throw new Error("Ollama not available");
  } catch (e) {
    return templateInterpretation();
  }

  const dominantColor = getDominantColor();

  const colorNames = {
    "#e2b55a": "金色",
    "#2c5f7c": "深藍",
    "#8b5e83": "紫色",
    "#a0826d": "大地色",
    "#d4d0c8": "白色",
    "#5a7a5a": "綠色",
    "#c46b4a": "橘色",
    "#3a3a4a": "墨色",
  };

  const prompt = `你是一位擁有 10 年以上資深經驗的視藝教育家、藝術評論家，同時也是一位深諳東方佛學與表達藝術治療的靈魂導師。

你的語氣溫和、包容、充滿藝術氣息與詩意。
【絕對避免】使用任何宗教教條、陳腔濫調的說教，或過於商業化的療癒系口吻。
你說話的目的是給予用戶深度的陪伴、澄清與溫柔的轉念。
請用繁體中文/粵語混合的港式文風輸出。

用戶情緒狀態：${OLLAMA_SCENE_MAP[currentScene] || "自由書寫"}
繪畫統計：共 ${strokeCount} 筆，停頓 ${Math.round(totalSilence)} 秒，主要色彩 ${colorNames[dominantColor] || colorNames[currentColor] || "未指定"}

請生成：
1. 【禪意題字】（1-2 句話）：將用戶的焦慮或壓力文字提煉為充滿力量的禪意題句
2. 【心境解讀】（150-200 字）：結合繪畫統計進行客製化解讀，結構：點出筆數 → 解讀停頓意義 → 色彩與情感連結 → 將線條消失引導至無常與放低執著 → 一句溫柔讚賞

格式要求：
題字：
（你的題字）

解讀：
（你的解讀）`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(OLLAMA_GENERATE_MS),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.8, num_predict: 280 },
      }),
    });

    const data = await response.json();
    const output = data.response || "";

    const affirmationMatch = output.match(/題字[：:]\s*\n?(.*?)(?=\n\n|解讀)/s);
    const reflectionMatch = output.match(/解讀[：:]\s*\n?(.*)/s);

    // Safety check on AI response content
    const aiText =
      (affirmationMatch ? affirmationMatch[1] : "") +
      " " +
      (reflectionMatch ? reflectionMatch[1] : output);
    const aiSafety = checkSafety(aiText, 0, Infinity);
    if (aiSafety) {
      console.warn("Ollama response flagged by safety check, falling back to template");
      return templateInterpretation();
    }

    return {
      affirmation: affirmationMatch ? affirmationMatch[1].trim() : output.split("\n\n")[0],
      reflection: reflectionMatch ? reflectionMatch[1].trim() : output.split("\n\n")[1] || output,
      isSafe: true,
      source: "ollama",
    };
  } catch (e) {
    console.log("Ollama failed or timed out, using template:", e);
    return templateInterpretation();
  }
}

// ===== DOWNLOAD ARTWORK (raw drawing, no card text) =====
function downloadArtwork() {
  const dpr = window.devicePixelRatio || 1;
  const temp = document.createElement("canvas");
  temp.width = canvasW * dpr;
  temp.height = canvasH * dpr;
  const tctx = temp.getContext("2d");
  tctx.setTransform(1, 0, 0, 1, 0, 0);
  tctx.scale(dpr, dpr);
  renderPureArtwork(tctx, canvasW, canvasH);

  temp.toBlob((blob) => {
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "mindful-canvas-artwork.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: "覺知畫布作品" }).catch(() => {});
        return;
      }
    }
    const link = document.createElement("a");
    link.download = "mindful-canvas-artwork.png";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("作品已下載");
  }, "image/png");
}

// ===== SAVE CARD =====
function saveCard() {
  // Create a composite image
  const saveCanvas = document.createElement("canvas");
  const w = 1080;
  const h = 1440;
  saveCanvas.width = w;
  saveCanvas.height = h;
  const sctx = saveCanvas.getContext("2d");

  const cardMode = pendingSession?.mode || appMode;
  const isZenCard = cardMode === "zen" || cardMode === "sumi";
  sctx.fillStyle = isZenCard ? "#ebe4d6" : "#1a1a2e";
  sctx.fillRect(0, 0, w, h);
  if (isZenCard) {
    const tex = ensureWashiTexture();
    sctx.save();
    sctx.globalAlpha = 0.55;
    sctx.fillStyle = sctx.createPattern(tex, "repeat");
    sctx.fillRect(0, 0, w, h);
    sctx.restore();
  }

  const img = new Image();
  img.onload = () => {
    const drawH = 720;
    const pad = isZenCard ? 36 : 0;
    sctx.drawImage(img, pad, 80 + pad * 0.5, w - pad * 2, drawH - pad);

    sctx.fillStyle = isZenCard ? "#6b4f2a" : "#e2b55a";
    sctx.font = "500 36px -apple-system, PingFang HK, sans-serif";
    sctx.textAlign = "center";
    wrapText(sctx, document.getElementById("cardAffirmation").textContent, w / 2, 860, w - 120, 48);

    sctx.fillStyle = isZenCard ? "#5a5048" : "#a0a0b0";
    sctx.font = "300 26px -apple-system, PingFang HK, sans-serif";
    wrapText(sctx, document.getElementById("cardReflection").textContent, w / 2, 1100, w - 120, 38);

    sctx.fillStyle = isZenCard ? "#8a7a68" : "#555";
    sctx.font = "300 20px -apple-system, PingFang HK, sans-serif";
    sctx.fillText("覺知畫布 Mindful Canvas", w / 2, 1380);

    // Share or Download
    saveCanvas.toBlob(async (blob) => {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "mindful-canvas-card.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "覺知畫布 Mindful Canvas" });
            showToast("已分享");
            return;
          } catch (e) {
            // User cancelled or share failed, fall through to download
          }
        }
      }
      // Fallback: download
      const link = document.createElement("a");
      link.download = "mindful-canvas-card.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("卡片已儲存");
    }, "image/png");
  };
  img.src = document.getElementById("cardImage").src;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split("");
  let line = "";
  let currentY = y;
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

// ===== TERMS =====
let termsReturnScreen = "cardScreen";

function showTerms() {
  const active = document.querySelector(".screen.active");
  if (active && active.id !== "termsScreen") {
    termsReturnScreen = active.id;
  }
  showScreen("termsScreen");
}

function closeTerms() {
  showScreen(termsReturnScreen || "cardScreen");
}

// ===== TOAST =====
function showToast(msg, durationMs) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  const dur = durationMs || 3000;
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(() => t.classList.remove("show"), dur);
}

// ===== SESSION STORAGE (教師長按匯出) =====
function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveSession(record) {
  const sessions = getSessions();
  sessions.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function finishFromCard() {
  if (pendingSession) saveSession({ ...pendingSession });
  goHome();
}

function exportSessions() {
  const data = JSON.stringify(getSessions(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const link = document.createElement("a");
  link.download = "mindful-canvas-sessions.json";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("已匯出 session 數據");
}

function initTeacherExport() {
  const logo = document.getElementById("welcomeLogo");
  const start = () => {
    logoPressTimer = setTimeout(() => {
      exportSessions();
      logoPressTimer = null;
    }, 3000);
  };
  const cancel = () => {
    if (logoPressTimer) {
      clearTimeout(logoPressTimer);
      logoPressTimer = null;
    }
  };
  logo.addEventListener("mousedown", start);
  logo.addEventListener("mouseup", cancel);
  logo.addEventListener("mouseleave", cancel);
  logo.addEventListener("touchstart", start, { passive: true });
  logo.addEventListener("touchend", cancel);
  logo.addEventListener("touchcancel", cancel);
}

function initParticleToggle() {
  const toggle = document.getElementById("particleToggle");
  if (!toggle) return;
  particlesEnabled = toggle.checked;
  toggle.addEventListener("change", () => {
    particlesEnabled = toggle.checked;
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function restartWelcomeEnterAnimation() {
  document.querySelectorAll(".welcome-enter").forEach((el) => {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });
}

// ===== INIT =====
initColors();
initSizes();
initTeacherExport();
initParticleToggle();
registerServiceWorker();
startWelcomeAmbient();

// ===== TUTORIAL =====
let tutorialStep = 0;

function showTutorial() {
  if (localStorage.getItem("mc_tutorial_done")) return;
  tutorialStep = 1;
  document.getElementById("tutorialOverlay").style.display = "flex";
  document.getElementById("tutorialStep1").style.display = "block";
  document.getElementById("tutorialStep2").style.display = "none";
  document.getElementById("tutorialStep3").style.display = "none";
  document.getElementById("tutorialNextBtn").textContent = "繼續 →";
}

function advanceTutorial() {
  tutorialStep++;
  if (tutorialStep === 2) {
    document.getElementById("tutorialStep1").style.display = "none";
    document.getElementById("tutorialStep2").style.display = "block";
  } else if (tutorialStep === 3) {
    document.getElementById("tutorialStep2").style.display = "none";
    document.getElementById("tutorialStep3").style.display = "block";
    document.getElementById("tutorialNextBtn").textContent = "開始畫畫 ✨";
  } else {
    document.getElementById("tutorialOverlay").style.display = "none";
    localStorage.setItem("mc_tutorial_done", "1");
  }
}

window.advanceTutorial = advanceTutorial;

// Show tutorial on first visit
showTutorial();

window.addEventListener("resize", () => {
  if (document.getElementById("welcome").classList.contains("active")) {
    resizeWelcomeAmbient();
  }
  if (document.getElementById("canvasScreen").classList.contains("active")) {
    resizeCanvas();
  }
});

// Expose onclick handlers for HTML (ES modules are scoped)
window.openZenPicker = openZenPicker;
window.startSumiMode = startSumiMode;
window.startFreeMode = startFreeMode;
window.showScreen = showScreen;
window.startZenMode = startZenMode;
window.goHome = goHome;
window.generateCard = generateCard;
window.advanceZenStep = advanceZenStep;
window.clearSumiCanvas = clearSumiCanvas;
window.toggleToolsPanel = toggleToolsPanel;
window.toggleEraser = toggleEraser;
window.showTerms = showTerms;
window.saveCard = saveCard;
window.downloadArtwork = downloadArtwork;
window.finishFromCard = finishFromCard;
window.closeTerms = closeTerms;
