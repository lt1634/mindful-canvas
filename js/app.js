// ===== STATE =====
import {
  DANGER_KEYWORDS,
  SAFETY_RESPONSE,
  OLLAMA_SCENE_MAP,
  STORAGE_KEY,
  GALLERY_MODE_LABELS,
  formatGalleryDate,
  checkSafety,
  isValidGalleryEntry,
  ZEN_TRACE_COLORS,
} from "../src/logic.js?v=zen-v38";
import {
  addGalleryEntry,
  listGalleryEntries,
  deleteGalleryEntry,
  dataUrlToThumbnailBlob,
} from "./gallery.js?v=zen-v38";

const ERASER_PREVIEW_FILL = "rgba(110, 200, 255, 0.32)";
const ERASER_PREVIEW_STROKE = "rgba(130, 210, 255, 1)";
const ERASER_TRAIL_COLOR = "rgba(110, 200, 255, 0.78)";
const ERASER_SIZE_MULTIPLIER = 2;
const ERASER_MIN_SIZE = 8;

let currentScene = "free";
let currentColor = "#ddb565";
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
let showZenTikseGrid = false;
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
let galleryObjectUrls = [];
let welcomeRecentObjectUrls = [];
let galleryDetailObjectUrl = null;
let galleryDetailEntryId = null;
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
let sumiUndoStack = [];
let sumiWashing = false;
let sumiWashFade = 1;

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

// 墨流調色：每色色相分明，主盤四色＋更多進階
const SUMI_COLORS = [
  { hex: "#1a1a1a", name: "黑墨" },
  { hex: "#bc4032", name: "朱紅" },
  { hex: "#224a6a", name: "靛青" },
  { hex: "#cba329", name: "藤黄" },
  { hex: "#3d774a", name: "松綠" },
  { hex: "#794d89", name: "紫菫" },
  { hex: "#d87a40", name: "琥珀" },
  { hex: "#208484", name: "青碧" },
  { hex: "#5a4132", name: "栗褐" },
  { hex: "#4f9ed1", name: "空色" },
  { hex: "#c4a77c", name: "砂金" },
  { hex: "#98b57b", name: "若草" },
];
// 主盤四色：黑墨、朱紅、靛青、藤黄
const SUMI_PRIMARY_INDICES = [0, 1, 2, 3];
const SUMI_WASH_FADE_STEP = 0.045;
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
  lotus_mantha: {
    id: "lotus_mantha",
    name: "六字真言八瓣蓮",
    steps: [
      {
        hint: "畫外圈引導圓",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.75})`;
          ctx.lineWidth = lw;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.45, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫外層八瓣蓮",
        draw(cx, cy, r, a, lw) {
          drawZenLotusManthaPetals(cx, cy, r, 0, 0.38, 1, a, lw);
        },
      },
      {
        hint: "畫內層八瓣蓮",
        draw(cx, cy, r, a, lw) {
          drawZenLotusManthaPetals(cx, cy, r, Math.PI / 8, 0.3, 0.55, a, lw);
        },
      },
      {
        hint: "畫蓮蓬與蓮子",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.08, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(226,181,90,${a * 0.85})`;
          for (let i = 0; i < 7; i++) {
            const seedAngle = (i * Math.PI) / 3;
            const seedX = cx + (i === 0 ? 0 : Math.cos(seedAngle) * sz * 0.04);
            const seedY = cy + (i === 0 ? 0 : Math.sin(seedAngle) * sz * 0.04);
            ctx.beginPath();
            ctx.arc(seedX, seedY, sz * 0.008, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        },
      },
    ],
  },
  vajra: {
    id: "vajra",
    name: "智慧五股金剛杵",
    guideRadius: 0.42,
    steps: [
      {
        hint: "畫背景神聖圓環",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a * 0.45})`;
          ctx.lineWidth = lw * 0.8;
          ctx.setLineDash([10, 12]);
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫中心摩尼寶珠",
        draw(cx, cy, r, a, lw) {
          const u = zenArtSize(r) / 600;
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, 32 * u, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, 8 * u, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫上半金剛杵",
        draw(cx, cy, r, a, lw) {
          drawZenHalfVajra(cx, cy, zenArtSize(r) / 600, true, a, lw);
        },
      },
      {
        hint: "畫下半金剛杵",
        draw(cx, cy, r, a, lw) {
          drawZenHalfVajra(cx, cy, zenArtSize(r) / 600, false, a, lw);
        },
      },
    ],
  },
  conch: {
    id: "conch",
    name: "吉祥右旋白法螺",
    guideRadius: 0.48,
    steps: [
      {
        hint: "畫法螺主體輪廓",
        draw(cx, cy, r, a, lw) {
          const u = zenArtSize(r) / 600;
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.85})`;
          ctx.lineWidth = lw * 1.1;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(cx - 20 * u, cy - 130 * u);
          ctx.bezierCurveTo(
            cx + 130 * u,
            cy - 180 * u,
            cx + 190 * u,
            cy + 30 * u,
            cx + 50 * u,
            cy + 160 * u
          );
          ctx.bezierCurveTo(
            cx - 10 * u,
            cy + 220 * u,
            cx - 160 * u,
            cy + 140 * u,
            cx - 110 * u,
            cy - 10 * u
          );
          ctx.bezierCurveTo(
            cx - 80 * u,
            cy - 100 * u,
            cx - 50 * u,
            cy - 110 * u,
            cx - 20 * u,
            cy - 130 * u
          );
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫右旋螺旋核心",
        draw(cx, cy, r, a, lw) {
          const u = zenArtSize(r) / 600;
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(cx - 20 * u, cy - 130 * u);
          ctx.bezierCurveTo(
            cx + 50 * u,
            cy - 90 * u,
            cx + 60 * u,
            cy + 20 * u,
            cx - 20 * u,
            cy + 60 * u
          );
          ctx.bezierCurveTo(
            cx - 70 * u,
            cy + 80 * u,
            cx - 110 * u,
            cy + 10 * u,
            cx - 60 * u,
            cy - 40 * u
          );
          ctx.bezierCurveTo(
            cx - 20 * u,
            cy - 60 * u,
            cx + 10 * u,
            cy - 10 * u,
            cx - 10 * u,
            cy + 20 * u
          );
          ctx.bezierCurveTo(
            cx - 20 * u,
            cy + 30 * u,
            cx - 40 * u,
            cy + 10 * u,
            cx - 30 * u,
            cy - 10 * u
          );
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫飄帶與螺頂",
        draw(cx, cy, r, a, lw) {
          const u = zenArtSize(r) / 600;
          ctx.save();
          ctx.strokeStyle = `rgba(90,122,90,${a * 0.7})`;
          ctx.lineWidth = lw * 0.85;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(cx - 100 * u, cy + 120 * u);
          ctx.quadraticCurveTo(cx - 200 * u, cy + 200 * u, cx - 130 * u, cy + 250 * u);
          ctx.quadraticCurveTo(cx - 180 * u, cy + 220 * u, cx - 220 * u, cy + 160 * u);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + 100 * u, cy + 100 * u);
          ctx.quadraticCurveTo(cx + 220 * u, cy + 180 * u, cx + 160 * u, cy + 250 * u);
          ctx.quadraticCurveTo(cx + 200 * u, cy + 200 * u, cx + 240 * u, cy + 150 * u);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = `rgba(226,181,90,${a * 0.75})`;
          ctx.beginPath();
          ctx.moveTo(cx - 20 * u, cy - 130 * u);
          ctx.lineTo(cx - 35 * u, cy - 170 * u);
          ctx.quadraticCurveTo(cx - 20 * u, cy - 190 * u, cx - 10 * u, cy - 165 * u);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        },
      },
    ],
  },
  dharma_wheel: {
    id: "dharma_wheel",
    name: "金法輪",
    steps: [
      {
        hint: "畫外圈法輪圓環",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.36, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        },
      },
      {
        hint: "畫八條輪輻",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          const outer = sz * 0.36;
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.85})`;
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * sz * 0.1, cy + Math.sin(angle) * sz * 0.1);
            ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
            ctx.stroke();
          }
          ctx.restore();
        },
      },
      {
        hint: "畫中心軸與內圈",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw * 0.9;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.1, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.04, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(226,181,90,${a * 0.75})`;
          ctx.beginPath();
          ctx.arc(cx, cy, sz * 0.02, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      },
    ],
  },
  treasure_vase: {
    id: "treasure_vase",
    name: "甘露寶瓶",
    guideRadius: 0.44,
    steps: [
      {
        hint: "畫蓮座底座",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(90,122,90,${a * 0.75})`;
          ctx.lineWidth = lw;
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x1 = cx + Math.cos(angle) * sz * 0.12;
            const y1 = cy + sz * 0.22 + Math.sin(angle) * sz * 0.04;
            const x2 = cx + Math.cos(angle) * sz * 0.22;
            const y2 = cy + sz * 0.28;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cx + Math.cos(angle) * sz * 0.18, cy + sz * 0.3, x2, y2);
            ctx.stroke();
          }
          ctx.restore();
        },
      },
      {
        hint: "畫寶瓶瓶身",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(226,181,90,${a})`;
          ctx.lineWidth = lw * 1.1;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(cx - sz * 0.18, cy + sz * 0.22);
          ctx.bezierCurveTo(
            cx - sz * 0.22,
            cy + sz * 0.05,
            cx - sz * 0.16,
            cy - sz * 0.12,
            cx - sz * 0.1,
            cy - sz * 0.22
          );
          ctx.bezierCurveTo(
            cx - sz * 0.06,
            cy - sz * 0.32,
            cx + sz * 0.06,
            cy - sz * 0.32,
            cx + sz * 0.1,
            cy - sz * 0.22
          );
          ctx.bezierCurveTo(
            cx + sz * 0.16,
            cy - sz * 0.12,
            cx + sz * 0.22,
            cy + sz * 0.05,
            cx + sz * 0.18,
            cy + sz * 0.22
          );
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        },
      },
      {
        hint: "畫瓶頸與寶蓋紋",
        draw(cx, cy, r, a, lw) {
          const sz = zenArtSize(r);
          ctx.save();
          ctx.strokeStyle = `rgba(44,95,124,${a * 0.8})`;
          ctx.lineWidth = lw * 0.85;
          ctx.beginPath();
          ctx.moveTo(cx - sz * 0.1, cy - sz * 0.22);
          ctx.lineTo(cx - sz * 0.06, cy - sz * 0.34);
          ctx.lineTo(cx + sz * 0.06, cy - sz * 0.34);
          ctx.lineTo(cx + sz * 0.1, cy - sz * 0.22);
          ctx.stroke();
          ctx.strokeStyle = `rgba(226,181,90,${a * 0.7})`;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(cx - sz * 0.14, cy - sz * 0.02);
          ctx.quadraticCurveTo(cx, cy - sz * 0.06, cx + sz * 0.14, cy - sz * 0.02);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = `rgba(255,248,220,${a * 0.6})`;
          ctx.beginPath();
          ctx.arc(cx, cy - sz * 0.36, sz * 0.03, 0, Math.PI * 2);
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
      <button class="btn-primary" onclick="finishFromCard()">返回首頁</button>
    `;
  }
}

// Colors — 原本色相，每色向亮度中性灰混入 12%
const COLORS = [
  { name: "雪白", hex: "#f5f0e9" },
  { name: "薄霧", hex: "#c8c4bd" },
  { name: "浅樱", hex: "#e9a3aa" },
  { name: "玫瑰", hex: "#dd638a" },
  { name: "朱砂", hex: "#c83637" },
  { name: "晚霞", hex: "#de7b4a" },
  { name: "金光", hex: "#ddb565" },
  { name: "柠黄", hex: "#c4af3f" },
  { name: "薄荷", hex: "#63b49a" },
  { name: "翠竹", hex: "#44965d" },
  { name: "墨松", hex: "#315e49" },
  { name: "天青", hex: "#53add0" },
  { name: "钴蓝", hex: "#356fb5" },
  { name: "靛青", hex: "#4c5891" },
  { name: "紫罗兰", hex: "#9d73b9" },
  { name: "暮色", hex: "#77528b" },
  { name: "赭石", hex: "#9c7956" },
  { name: "深海", hex: "#234f6b" },
  { name: "墨色", hex: "#4a4a57" },
  { name: "深夜", hex: "#1f2836" },
  { name: "纯墨", hex: "#0c0c13" },
];

const SIZES = [4, 8, 14, 22];

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
  document.getElementById("eraserBtn").setAttribute("aria-pressed", "false");
  canvas.classList.remove("eraser-cursor");
  document.querySelectorAll(".color-dot").forEach((d) => d.classList.remove("active"));
  el.classList.add("active");
  touchToolsActivity();
}

function toggleEraser() {
  isEraser = !isEraser;
  if (!isEraser) eraserHoverPos = null;
  const eraserBtn = document.getElementById("eraserBtn");
  eraserBtn.classList.toggle("active", isEraser);
  eraserBtn.setAttribute("aria-pressed", String(isEraser));
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

function cloneSumiDrops(drops) {
  return drops.map((d) => ({
    color: d.color,
    verts: d.verts.map((v) => ({ x: v.x, y: v.y })),
  }));
}

function resetSumiUndoStack() {
  sumiUndoStack = [cloneSumiDrops(sumiDrops)];
  updateUndoButton();
}

function pushSumiUndoState() {
  sumiUndoStack.push(cloneSumiDrops(sumiDrops));
  if (sumiUndoStack.length > 48) sumiUndoStack.shift();
  updateUndoButton();
}

function canUndo() {
  if (appMode === "sumi") return sumiUndoStack.length > 1;
  if (appMode === "zen") return zenTouchStrokes.length > 0;
  return strokeHistory.length > 0;
}

function updateUndoButton() {
  const enabled = canUndo();
  const undoBtn = document.getElementById("undoBtn");
  const sumiUndoBtn = document.getElementById("sumiUndoBtn");
  if (undoBtn) undoBtn.disabled = !enabled;
  if (sumiUndoBtn) sumiUndoBtn.disabled = !enabled;
}

function undoLastAction() {
  if (drawing) commitStroke();
  if (!canUndo()) {
    showToast("沒有可撤銷的步驟");
    return;
  }
  if (appMode === "sumi") {
    sumiUndoStack.pop();
    sumiDrops = cloneSumiDrops(sumiUndoStack[sumiUndoStack.length - 1]);
    sumiFlowImpulses = [];
    sumiRipples = [];
    strokeCount = sumiDrops.length ? Math.max(1, strokeCount - 1) : 0;
    showToast("已撤銷上一步");
    updateUndoButton();
    return;
  }
  if (appMode === "zen") {
    const last = zenTouchStrokes.pop();
    if (last && !last.eraser) zenTouchCount = Math.max(0, zenTouchCount - 1);
    redrawZenTraceLayer();
    showToast("已撤銷上一步");
    updateUndoButton();
    return;
  }
  const last = strokeHistory.pop();
  if (last && !last.eraser) strokeCount = Math.max(0, strokeCount - 1);
  redrawFreeArtLayer();
  showToast("已撤銷上一步");
  updateUndoButton();
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
  const base = eraser
    ? Math.max(currentSize * ERASER_SIZE_MULTIPLIER, ERASER_MIN_SIZE)
    : currentSize;
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
let eraserHoverPos = null;

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
  draw(targetCtx, color, baseWidth, composite = "lighter") {
    if (this.points.length < 2) return;
    const c = targetCtx || ctx;
    c.save();
    c.globalCompositeOperation = composite;
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

function drawEraserRangePreview(targetCtx, points, size, stampBrushSize) {
  if (!points.length) return;
  const stampRadius = eraseInkRadius(stampBrushSize || size);
  const spacing = Math.max(3, size * 0.35);
  targetCtx.save();
  targetCtx.globalCompositeOperation = "source-over";
  targetCtx.fillStyle = ERASER_PREVIEW_FILL;
  targetCtx.strokeStyle = ERASER_PREVIEW_STROKE;
  targetCtx.lineWidth = 1.5;
  targetCtx.setLineDash([4, 3]);
  if (points.length > 1) {
    targetCtx.beginPath();
    targetCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      targetCtx.lineTo(points[i].x, points[i].y);
    }
    targetCtx.stroke();
  }
  const stampAt = (x, y) => {
    targetCtx.beginPath();
    targetCtx.arc(x, y, stampRadius, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();
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

function paintEraserRangeIndicator() {
  if (!isEraser || appMode === "sumi") return;
  const brush = appMode === "zen" ? getZenBrushSize(true) : getBrushSize(true);
  const stamp = appMode === "zen" ? brush * 1.25 : brush;
  if (drawing && currentStroke.length) {
    drawEraserRangePreview(ctx, currentStroke, brush, stamp);
  } else if (eraserHoverPos) {
    drawEraserRangePreview(ctx, [eraserHoverPos], brush, stamp);
  }
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
  } else if (drawing && isEraser && currentStroke.length > 1) {
    strokeTrail.draw(ctx, ERASER_TRAIL_COLOR, getBrushSize(true), "source-over");
  }
  paintEraserRangeIndicator();
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
  } else if (drawing && isEraser && currentStroke.length > 1) {
    strokeTrail.draw(ctx, ERASER_TRAIL_COLOR, getZenBrushSize(true), "source-over");
  }

  for (let i = zenRipples.length - 1; i >= 0; i--) {
    zenRipples[i].update();
    if (zenRipples[i].life <= 0) zenRipples.splice(i, 1);
    else zenRipples[i].draw();
  }
  drawParticles();
  paintEraserRangeIndicator();

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
  return eraser ? Math.max(base * ERASER_SIZE_MULTIPLIER, ERASER_MIN_SIZE) : base;
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

function drawZenLotusManthaPetals(cx, cy, r, offsetAngle, scale, opacityMul, a, lw) {
  const sz = zenArtSize(r);
  ctx.save();
  ctx.strokeStyle = `rgba(226,181,90,${a * opacityMul})`;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + offsetAngle;
    const xStart = cx + Math.cos(angle) * sz * 0.06;
    const yStart = cy + Math.sin(angle) * sz * 0.06;
    const xEnd = cx + Math.cos(angle) * sz * scale;
    const yEnd = cy + Math.sin(angle) * sz * scale;
    const cpAngle1 = angle - 0.28;
    const cpAngle2 = angle + 0.28;
    const cp1x = cx + Math.cos(cpAngle1) * sz * scale * 0.7;
    const cp1y = cy + Math.sin(cpAngle1) * sz * scale * 0.7;
    const cp2x = cx + Math.cos(cpAngle2) * sz * scale * 0.7;
    const cp2y = cy + Math.sin(cpAngle2) * sz * scale * 0.7;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.bezierCurveTo(cp1x, cp1y, cp1x, cp1y, xEnd, yEnd);
    ctx.bezierCurveTo(cp2x, cp2y, cp2x, cp2y, xStart, yStart);
    ctx.stroke();
    const midX = cx + Math.cos(angle) * sz * scale * 0.6;
    const midY = cy + Math.sin(angle) * sz * scale * 0.6;
    ctx.strokeStyle = `rgba(90,122,90,${a * opacityMul * 0.5})`;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(midX, midY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(226,181,90,${a * opacityMul})`;
  }
  ctx.restore();
}

function drawZenHalfVajra(cx, cy, unit, isUpper, a, lw) {
  const sign = isUpper ? -1 : 1;
  const offset = cy + sign * 32 * unit;
  const u = sign * unit;
  ctx.save();
  ctx.strokeStyle = `rgba(226,181,90,${a})`;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 50 * unit, offset);
  ctx.quadraticCurveTo(cx, offset + 25 * u, cx + 50 * unit, offset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 65 * unit, offset + 28 * u);
  ctx.bezierCurveTo(
    cx - 40 * unit,
    offset + 5 * u,
    cx + 40 * unit,
    offset + 5 * u,
    cx + 65 * unit,
    offset + 28 * u
  );
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 10 * unit, offset + 28 * u);
  ctx.lineTo(cx, offset + 195 * u);
  ctx.lineTo(cx + 10 * unit, offset + 28 * u);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 45 * unit, offset + 28 * u);
  ctx.bezierCurveTo(
    cx - 100 * unit,
    offset + 100 * u,
    cx - 50 * unit,
    offset + 175 * u,
    cx,
    offset + 195 * u
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 45 * unit, offset + 28 * u);
  ctx.bezierCurveTo(
    cx + 100 * unit,
    offset + 100 * u,
    cx + 50 * unit,
    offset + 175 * u,
    cx,
    offset + 195 * u
  );
  ctx.stroke();
  ctx.strokeStyle = `rgba(44,95,124,${a * 0.65})`;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(cx - 25 * unit, offset + 28 * u);
  ctx.bezierCurveTo(
    cx - 55 * unit,
    offset + 80 * u,
    cx - 25 * unit,
    offset + 140 * u,
    cx,
    offset + 155 * u
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 25 * unit, offset + 28 * u);
  ctx.bezierCurveTo(
    cx + 55 * unit,
    offset + 80 * u,
    cx + 25 * unit,
    offset + 140 * u,
    cx,
    offset + 155 * u
  );
  ctx.stroke();
  ctx.restore();
}

function drawZenTikseGrid(alpha) {
  const size = Math.min(canvasW, canvasH);
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const a = alpha ?? 0.32;
  ctx.save();
  ctx.strokeStyle = `rgba(217, 119, 6, ${a})`;
  ctx.lineWidth = 1.1;
  ctx.setLineDash([2, 6]);
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, canvasH);
  ctx.moveTo(0, cy);
  ctx.lineTo(canvasW, cy);
  ctx.stroke();
  ctx.setLineDash([1, 8]);
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(cx - size / 2, cy - size / 2);
  ctx.lineTo(cx + size / 2, cy + size / 2);
  ctx.moveTo(cx + size / 2, cy - size / 2);
  ctx.lineTo(cx - size / 2, cy + size / 2);
  ctx.stroke();
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1;
  const inset = size * 0.08;
  ctx.strokeRect(cx - size / 2 + inset, cy - size / 2 + inset, size - inset * 2, size - inset * 2);
  ctx.setLineDash([2, 4]);
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawZenGuide() {
  if (showZenTikseGrid) drawZenTikseGrid(0.28);
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
  { id: "lotus_mantha", desc: "觀音慈悲 · 4 步 · 雙層八瓣蓮" },
  { id: "spiral", desc: "跟呼吸繞圈 · 5 步 · 流動感" },
  { id: "mandala", desc: "神聖壇城 · 5 步 · 專業底稿" },
  { id: "flower_of_life", desc: "神聖幾何 · 全螢幕 · 對稱之美" },
  { id: "endless_knot", desc: "因緣交織 · 6 步 · 立體編織" },
  { id: "bodhi_fish", desc: "八吉祥 · 6 步 · 流動和諧" },
  { id: "vajra", desc: "密宗法器 · 4 步 · 中軸對稱" },
  { id: "conch", desc: "八吉祥 · 3 步 · 黃金螺旋" },
  { id: "dharma_wheel", desc: "八吉祥 · 3 步 · 八輻法輪" },
  { id: "treasure_vase", desc: "八吉祥 · 3 步 · 甘露寶瓶" },
];

const ZEN_TEMPLATE_META = {
  mandala: {
    englishTitle: "Vairocana Great Mandala",
    difficulty: "⭐⭐⭐⭐⭐",
    timeCost: "約 45 分鐘",
    symbolism: "圓滿、專注、降伏雜念",
  },
  lotus_mantha: {
    englishTitle: "Sacred Lotus of Compassion",
    difficulty: "⭐⭐⭐⭐",
    timeCost: "約 30 分鐘",
    symbolism: "純潔、慈悲、出淤泥而不染",
  },
  bodhi_fish: {
    englishTitle: "The Golden Auspicious Fish",
    difficulty: "⭐⭐⭐⭐",
    timeCost: "約 35 分鐘",
    symbolism: "自由無礙、豐饒喜樂",
  },
  endless_knot: {
    englishTitle: "The Eternal Shrivatsa Knot",
    difficulty: "⭐⭐⭐⭐⭐",
    timeCost: "約 50 分鐘",
    symbolism: "長壽、無窮智慧、和諧因緣",
  },
  vajra: {
    englishTitle: "The Five-Pronged Vajra",
    difficulty: "⭐⭐⭐⭐⭐",
    timeCost: "約 55 分鐘",
    symbolism: "斷除執著、摧破心魔",
  },
  conch: {
    englishTitle: "The Sacred White Conch",
    difficulty: "⭐⭐⭐⭐",
    timeCost: "約 40 分鐘",
    symbolism: "妙音遠揚、消除愚痴",
  },
  dharma_wheel: {
    englishTitle: "The Golden Dharma Wheel",
    difficulty: "⭐⭐⭐",
    timeCost: "約 25 分鐘",
    symbolism: "佛法常轉、智慧不息",
  },
  treasure_vase: {
    englishTitle: "The Treasure Vase of Nectar",
    difficulty: "⭐⭐⭐⭐",
    timeCost: "約 35 分鐘",
    symbolism: "福智圓滿、甘露滿盈",
  },
};

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
    const meta = ZEN_TEMPLATE_META[item.id];
    const parts = [preview, name];
    if (meta?.englishTitle) {
      const en = document.createElement("div");
      en.className = "zen-tpl-en";
      en.textContent = meta.englishTitle;
      parts.push(en);
    }
    const desc = document.createElement("div");
    desc.className = "zen-tpl-desc";
    desc.textContent = item.desc || `${tpl.steps.length} 步跟畫`;
    parts.push(desc);
    if (meta?.symbolism) {
      const sym = document.createElement("div");
      sym.className = "zen-tpl-symbolism";
      sym.textContent = meta.symbolism;
      parts.push(sym);
    }
    if (meta?.difficulty) {
      const badge = document.createElement("div");
      badge.className = "zen-tpl-meta";
      badge.textContent = `${meta.difficulty} · ${meta.timeCost}`;
      parts.push(badge);
    }
    card.append(...parts);
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

function toggleZenTikseGrid() {
  showZenTikseGrid = !showZenTikseGrid;
  const btn = document.getElementById("zenTikseBtn");
  if (btn) {
    btn.classList.toggle("active", showZenTikseGrid);
    btn.setAttribute("aria-pressed", String(showZenTikseGrid));
  }
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
  if (sumiWashing) c.globalAlpha = sumiWashFade;
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
  if (sumiWashing) c.globalAlpha = sumiWashFade;
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
  if (!sumiWashing) {
    if (sumiAnimFrame % 3 === 0) sumiApplyFlows();
    if (sumiAnimFrame % 8 === 0) sumiAutoMawari();
  }
  drawSumiDrops();
  if (sumiAnimFrame % 2 === 0) drawSumiRipples();
  if (sumiWashing) tickSumiWashFade();

  // 閒置時跟呼吸慢滴小墨，畫面唔會完全靜止
  const now = Date.now();
  if (
    !sumiWashing &&
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
  document.querySelectorAll(".sumi-dot").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.colorIndex) === idx);
  });
}

function toggleSumiPalette() {
  const adv = document.getElementById("sumiPaletteAdvanced");
  const toggle = document.getElementById("sumiPaletteToggle");
  if (!adv || !toggle) return;
  const open = adv.hidden;
  adv.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "收起" : "更多";
  toggle.classList.toggle("open", open);
}

function createSumiColorDot(colorIndex) {
  const c = SUMI_COLORS[colorIndex];
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sumi-dot" + (colorIndex === sumiColorIndex ? " active" : "");
  b.style.background = c.hex;
  b.dataset.colorIndex = String(colorIndex);
  b.title = c.name;
  b.setAttribute("aria-label", c.name);
  b.onclick = () => selectSumiColor(colorIndex);
  return b;
}

function setSumiClearBusy(busy) {
  const clearBtn = document.querySelector(".sumi-clear");
  if (clearBtn) clearBtn.disabled = busy;
}

function finishSumiWash() {
  sumiDrops = [];
  sumiFlowImpulses = [];
  sumiRipples = [];
  sumiAutoMawariAngle = 0;
  strokeCount = 0;
  resetSumiUndoStack();
  sumiWashing = false;
  sumiWashFade = 1;
  setSumiClearBusy(false);
  showToast("水面已洗淨，重新開始");
}

function tickSumiWashFade() {
  sumiWashFade -= SUMI_WASH_FADE_STEP;
  if (sumiWashFade <= 0) finishSumiWash();
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
  if (!bar || bar.dataset.ready) return;
  bar.dataset.ready = "1";

  const palette = document.createElement("div");
  palette.className = "sumi-palette";
  palette.id = "sumiPalette";

  const main = document.createElement("div");
  main.className = "sumi-palette-main";
  main.id = "sumiPaletteMain";
  SUMI_PRIMARY_INDICES.forEach((i) => main.appendChild(createSumiColorDot(i)));

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "sumi-palette-toggle";
  toggle.id = "sumiPaletteToggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "更多";
  toggle.onclick = () => toggleSumiPalette();

  const advanced = document.createElement("div");
  advanced.className = "sumi-palette-advanced";
  advanced.id = "sumiPaletteAdvanced";
  advanced.hidden = true;
  SUMI_COLORS.forEach((_, i) => {
    if (!SUMI_PRIMARY_INDICES.includes(i)) advanced.appendChild(createSumiColorDot(i));
  });

  palette.append(main, toggle, advanced);
  const flowCtrl = document.getElementById("sumiFlowCtrl");
  bar.insertBefore(palette, flowCtrl || bar.firstChild);
}

function clearSumiCanvas() {
  if (sumiWashing) return;
  if (!sumiDrops.length) {
    showToast("水面已洗淨，重新開始");
    return;
  }
  sumiWashing = true;
  sumiWashFade = 1;
  setSumiClearBusy(true);
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
  const tikseBtn = document.getElementById("zenTikseBtn");
  if (tikseBtn) tikseBtn.style.display = mode === "zen" ? "inline-flex" : "none";
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

  if (currentScene === "sumi") {
    targetCtx.lineCap = "round";
    targetCtx.lineJoin = "round";
    drawSumiDrops(targetCtx);
    return;
  }

  const ink = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  ink.width = Math.max(1, Math.round(w * dpr));
  ink.height = Math.max(1, Math.round(h * dpr));
  const ictx = ink.getContext("2d");
  ictx.setTransform(1, 0, 0, 1, 0, 0);
  ictx.scale(dpr, dpr);
  ictx.lineCap = "round";
  ictx.lineJoin = "round";

  if (currentScene === "zen") {
    zenTouchStrokes.forEach((s) => drawZenTraceStroke(s, ictx));
  } else {
    strokeHistory.forEach((s) => {
      if (s.eraser) {
        eraseInkAlongPoints(ictx, s.points, s.size);
        return;
      }
      drawInkAlongPoints(ictx, s.points, s.color, s.size, 1, 4);
      drawStroke(s, 0.35, ictx);
    });
  }

  targetCtx.drawImage(ink, 0, 0, w, h);
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
    pushSumiUndoState();
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
    updateUndoButton();
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
  updateUndoButton();
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
canvas.addEventListener("pointermove", (e) => {
  if (!isEraser || drawing || appMode === "sumi") return;
  eraserHoverPos = getPointerPos(e);
});
canvas.addEventListener("pointerleave", () => {
  eraserHoverPos = null;
});

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

function setupPreviewCanvas(c) {
  const art = c.closest(".showcase-art");
  const w = art ? Math.max(art.clientWidth, 120) : 160;
  const h = art ? Math.max(art.clientHeight, 120) : 132;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (c.width !== pw || c.height !== ph) {
    c.width = pw;
    c.height = ph;
    const ctx = c.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  return { w, h, ctx: c.getContext("2d") };
}

function drawFreePreview() {
  const c = document.getElementById("previewFree");
  if (!c) return;
  const { w, h, ctx } = setupPreviewCanvas(c);
  ctx.fillStyle = "#0f1018";
  ctx.fillRect(0, 0, w, h);
  const strokes = [
    { color: "#c084fc", x0: 0.08, y0: 0.72, x1: 0.55, y1: 0.18, w: 14 },
    { color: "#f472b6", x0: 0.2, y0: 0.85, x1: 0.78, y1: 0.42, w: 11 },
    { color: "#fb923c", x0: 0.35, y0: 0.15, x1: 0.92, y1: 0.68, w: 12 },
    { color: "#60a5fa", x0: 0.05, y0: 0.35, x1: 0.48, y1: 0.88, w: 10 },
    { color: "#a78bfa", x0: 0.58, y0: 0.55, x1: 0.95, y1: 0.22, w: 9 },
  ];
  strokes.forEach((s, i) => {
    const sway = Math.sin(previewPhase * 0.4 + i * 1.1) * 0.04;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.w;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(w * s.x0, h * (s.y0 + sway));
    ctx.bezierCurveTo(
      w * (s.x0 + 0.22),
      h * (s.y0 - 0.18 + sway),
      w * (s.x1 - 0.18),
      h * (s.y1 + 0.12 - sway),
      w * s.x1,
      h * (s.y1 - sway * 0.5)
    );
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
}

function drawZenPreview() {
  const c = document.getElementById("previewZen");
  if (!c) return;
  const { w, h, ctx } = setupPreviewCanvas(c);
  const cx = w * 0.52;
  const cy = h * 0.5;
  const pulse = 0.92 + Math.sin(previewPhase * 0.45) * 0.04;
  ctx.fillStyle = "#0f1018";
  ctx.fillRect(0, 0, w, h);
  const gold = "#e6b85c";
  const rings = [0.42, 0.3, 0.18, 0.08];
  rings.forEach((r, i) => {
    ctx.strokeStyle = gold;
    ctx.globalAlpha = 0.22 + (rings.length - i) * 0.12;
    ctx.lineWidth = 1.2 - i * 0.15;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * r * pulse, 0, Math.PI * 2);
    ctx.stroke();
  });
  const petals = 12;
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2 - Math.PI / 2 + previewPhase * 0.08;
    const px = cx + Math.cos(angle) * Math.min(w, h) * 0.26 * pulse;
    const py = cy + Math.sin(angle) * Math.min(w, h) * 0.26 * pulse;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = `rgba(230, 184, 92, ${0.35 + (i % 2) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.min(w, h) * 0.055, Math.min(w, h) * 0.018, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(a) * Math.min(w, h) * 0.36 * pulse,
      cy + Math.sin(a) * Math.min(w, h) * 0.36 * pulse
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(w, h) * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawSumiPreview() {
  const c = document.getElementById("previewSumi");
  if (!c) return;
  const { w, h, ctx } = setupPreviewCanvas(c);
  const flow = (Math.sin(previewPhase * 0.5) + 1) / 2;
  ctx.fillStyle = "#0a1520";
  ctx.fillRect(0, 0, w, h);
  const blobs = [
    { cx: 0.42, cy: 0.48, rx: 0.38, ry: 0.32, color: "#1e6f8c", rot: 0.2 },
    { cx: 0.55, cy: 0.55, rx: 0.3, ry: 0.36, color: "#4fc3f7", rot: -0.35 },
    { cx: 0.38, cy: 0.62, rx: 0.22, ry: 0.28, color: "#2dd4bf", rot: 0.5 },
  ];
  blobs.forEach((b, k) => {
    const bx = w * (b.cx + Math.sin(previewPhase * 0.3 + k) * 0.03);
    const by = h * (b.cy + Math.cos(previewPhase * 0.25 + k * 1.2) * 0.02);
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(b.rot + previewPhase * 0.05);
    ctx.globalAlpha = 0.55 + flow * 0.25;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * b.rx);
    grad.addColorStop(0, b.color);
    grad.addColorStop(0.55, b.color);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      w * b.rx * (0.85 + flow * 0.15),
      h * b.ry * (0.85 + flow * 0.15),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  });
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = "#e6b85c";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let t = 0; t <= 1; t += 0.03) {
    const x = w * (0.12 + t * 0.72);
    const y = h * (0.35 + Math.sin(t * Math.PI * 3.2 + previewPhase) * 0.22);
    if (t === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
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
  sumiUndoStack = [];
  sumiWashing = false;
  sumiWashFade = 1;
  drawing = false;
  activePointerId = null;
  currentStroke = [];
  isEraser = false;
  document.getElementById("eraserBtn").classList.remove("active");
  document.getElementById("eraserBtn").setAttribute("aria-pressed", "false");
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
    updateUndoButton();
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
    resetSumiUndoStack();
    startCanvasLoop();
    updateUndoButton();
  }, 100);
}

function startZenMode(templateId) {
  if (!templateId || !ZEN_TEMPLATES[templateId]) templateId = "lotus";
  zenTemplateId = templateId;
  zenStepIndex = 0;
  showZenTikseGrid = false;
  const tikseBtn = document.getElementById("zenTikseBtn");
  if (tikseBtn) {
    tikseBtn.classList.remove("active");
    tikseBtn.setAttribute("aria-pressed", "false");
  }
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
    updateUndoButton();
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
  document.getElementById("eraserBtn").setAttribute("aria-pressed", "false");
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
  if (!force && appMode === "sumi" && sumiDrops.length === 0) {
    showToast("輕點水面，滴一滴墨");
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
    persistCardToGallery(interpretation.affirmation);
  })();
}

function generateInterpretation() {
  const safety = checkSafety(currentScene, strokeCount, totalSilence);
  if (safety) return safety;

  // ===== 2. AFFIRMATION POOL (10 per scene, 80 total) =====
  const affirmations = {
    anxious: [
      "你動筆了，這就夠了。",
      "焦慮在色彩裡慢慢融化。",
      "你在這裡，很安全。",
      "面對空白，你已經很勇敢。",
      "深呼吸，此刻與你同在。",
    ],
    chaotic: [
      "混亂也是創造力。",
      "畫出來，就是一種整理。",
      "讓線條自己找路。",
      "不必想清楚才動筆。",
      "情緒誠實地留在紙上。",
    ],
    stuck: [
      "留白也是創作。",
      "停下來，也是溫柔。",
      "不急，下一步會來。",
      "你給了自己空間。",
      "空白是給自己的禮物。",
    ],
    free: [
      "沒有對錯，只有當下。",
      "你的手知道要去哪。",
      "你在這裡，這就夠了。",
      "每一筆都是新的開始。",
      "專注的當下已留在身上。",
    ],
    metta: [
      "你用色彩送上祝福。",
      "善意先溫暖了自己。",
      "祝福穿越了距離。",
      "柔軟的心正在綻放。",
      "慈心已經完成。",
    ],
    karuna: [
      "你願意一起承受。",
      "畫筆說了最溫柔的話。",
      "你為痛苦騰出空間。",
      "你在這裡，你不孤單。",
      "陪伴本身就是慈悲。",
    ],
    mudita: [
      "為他人歡喜，心更豐盛。",
      "隨喜是一種力量。",
      "你為笑容留了一筆。",
      "這份心，很珍貴。",
      "喜心已經完成。",
    ],
    upekkha: [
      "不執著，就是自由。",
      "你練習了平等心。",
      "看見，接受，前行。",
      "線條來了又走。",
      "靜靜地看，就是修行。",
    ],
    zen: [
      "你跟隨節奏，心在場。",
      "輕觸之間，覺知同在。",
      "一分鐘，足夠靜下來。",
      "不需要畫得好。",
      "你已與當下合一。",
    ],
    sumi: [
      "墨會自己找形狀。",
      "每一道紋路都獨一無二。",
      "放下控制，結果很美。",
      "水面承載得住思緒。",
      "水不急，墨不趕。",
    ],
  };

  // ===== 3. COLOR DESCRIPTIONS (now connected) =====
  const colorDescriptions = {
    "#e2b55a": { name: "金光", meaning: "金色，溫暖智慧。" },
    "#2c5f7c": { name: "深海", meaning: "深藍，尋找平靜。" },
    "#8b5e83": { name: "暮色", meaning: "紫色，內在轉化。" },
    "#a0826d": { name: "枯葉", meaning: "大地色，穩定根基。" },
    "#d4d0c8": { name: "霧白", meaning: "留白，保留可能。" },
    "#5a7a5a": { name: "翠竹", meaning: "綠色，渴望療癒。" },
    "#c46b4a": { name: "晚霞", meaning: "橘色，生命力湧動。" },
    "#3a3a4a": { name: "墨色", meaning: "墨色，向內探索。" },
  };

  // ===== 4. REFLECTION ENGINE（簡短版，儲存卡片用）=====
  const dominantColor = getDominantColor();
  const colorInfo = colorDescriptions[dominantColor] ||
    colorDescriptions[currentColor] || { meaning: "" };

  let strokePart = "";
  if (strokeCount < 5) {
    strokePart = `${strokeCount} 筆，留白多`;
  } else if (strokeCount < 30) {
    strokePart = `${strokeCount} 筆勾勒心境`;
  } else if (strokeCount < 100) {
    strokePart = `${strokeCount} 筆層層疊加`;
  } else {
    strokePart = `${strokeCount} 筆的釋放`;
  }

  let silencePart = "";
  if (totalSilence > 60) {
    silencePart = "曾有深層寂靜";
  } else if (totalSilence > 30) {
    silencePart = `停頓約 ${Math.round(totalSilence)} 秒`;
  } else if (totalSilence > 5) {
    silencePart = `寂靜 ${Math.round(totalSilence)} 秒`;
  } else {
    silencePart = "節奏流暢";
  }

  const colorPart = colorInfo.meaning || "";

  const sceneEndings = {
    anxious: "帶著覺察回到日常。",
    chaotic: "重量又輕了一點。",
    stuck: "準備好時，下一步會來。",
    free: "只專注此刻的創作。",
    metta: "帶走這份溫暖。",
    karuna: "陪伴已經完成。",
    mudita: "隨喜讓心更豐盛。",
    upekkha: "平靜地接受消逝。",
    zen: "帶走這份安定。",
    sumi: "讓水繼續流動。",
  };
  let endingPart = sceneEndings[currentScene] || sceneEndings.free;

  if (currentScene === "zen") {
    strokePart =
      zenTouchStrokes.length > 0 ? `${zenTouchStrokes.length} 道色彩痕跡` : "安靜跟隨完成";
    silencePart = "與節奏同在";
    endingPart = sceneEndings.zen;
  }

  if (currentScene === "sumi") {
    strokePart = strokeCount > 0 ? `${strokeCount} 次與水互動` : "靜觀墨流";
    silencePart = "水流自有節奏";
    endingPart = sceneEndings.sumi;
  }

  const reflectionParts = [strokePart, silencePart, colorPart, endingPart].filter(Boolean);
  const reflection = reflectionParts.slice(0, 3).join("，") + "。";

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

  const prompt = `你是一位資深視藝教育家與東方禪學導師。語氣溫和、簡潔。
【避免】宗教教條、商業療癒口吻。請用繁體中文/粵語港式文風。

用戶情緒：${OLLAMA_SCENE_MAP[currentScene] || "自由書寫"}
繪畫：${strokeCount} 筆，停頓 ${Math.round(totalSilence)} 秒，主要色彩 ${colorNames[dominantColor] || colorNames[currentColor] || "未指定"}

請生成（務必簡短，適合手機卡片）：
1. 【禪意題字】（1 句，8 字以內）
2. 【心境解讀】（1-2 句，共 20-35 字）

格式：
題字：
（1 句）

解讀：
（20-35 字）`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(OLLAMA_GENERATE_MS),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.8, num_predict: 100 },
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

// ===== SAVE CARD =====
function drawLogoMark(ctx, x, y, size) {
  const u = size / 100;
  ctx.save();
  ctx.strokeStyle = "#6e6e7a";
  ctx.lineWidth = 4 * u;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(x + 10 * u, y + 10 * u);
  ctx.lineTo(x + 90 * u, y + 90 * u);
  ctx.stroke();
  ctx.fillStyle = "#f0c96e";
  ctx.beginPath();
  ctx.arc(x + 50 * u, y + 50 * u, 20.5 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d4a84f";
  ctx.lineWidth = 5.5 * u;
  ctx.beginPath();
  ctx.moveTo(x + 10 * u, y + 90 * u);
  ctx.lineTo(x + 90 * u, y + 10 * u);
  ctx.stroke();
  ctx.restore();
}

function drawCardBrandFooter(sctx, w, isZenCard) {
  const footBaseY = 1372;
  const logoSize = 50;
  const gap = 14;
  const line1 = "覺知畫布";
  const line2 = "Mindful Canvas™";

  sctx.textAlign = "left";
  sctx.textBaseline = "alphabetic";
  sctx.font = "400 26px -apple-system, PingFang HK, sans-serif";
  const w1 = sctx.measureText(line1).width;
  sctx.font = "300 17px -apple-system, PingFang HK, sans-serif";
  const w2 = sctx.measureText(line2).width;
  const textW = Math.max(w1, w2);
  const groupW = logoSize + gap + textW;
  let x = (w - groupW) / 2;

  drawLogoMark(sctx, x, footBaseY - logoSize + 6, logoSize);
  x += logoSize + gap;

  sctx.fillStyle = isZenCard ? "#6b4f2a" : "#e2b55a";
  sctx.font = "400 26px -apple-system, PingFang HK, sans-serif";
  sctx.fillText(line1, x, footBaseY - 6);
  sctx.fillStyle = isZenCard ? "#8a7a68" : "#888898";
  sctx.font = "300 17px -apple-system, PingFang HK, sans-serif";
  sctx.fillText(line2, x, footBaseY + 16);
}

function saveCard() {
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

  const artworkImg = new Image();
  artworkImg.onload = () => {
    const drawH = 720;
    const pad = isZenCard ? 36 : 0;
    sctx.drawImage(artworkImg, pad, 80 + pad * 0.5, w - pad * 2, drawH - pad);

    sctx.fillStyle = isZenCard ? "#6b4f2a" : "#e2b55a";
    sctx.font = "500 36px -apple-system, PingFang HK, sans-serif";
    sctx.textAlign = "center";
    wrapText(sctx, document.getElementById("cardAffirmation").textContent, w / 2, 860, w - 120, 48);

    sctx.fillStyle = isZenCard ? "#5a5048" : "#a0a0b0";
    sctx.font = "300 26px -apple-system, PingFang HK, sans-serif";
    wrapText(sctx, document.getElementById("cardReflection").textContent, w / 2, 1100, w - 120, 38);

    drawCardBrandFooter(sctx, w, isZenCard);

    saveCanvas.toBlob(async (blob) => {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], "mindful-canvas-card.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "覺知畫布 Mindful Canvas" });
            showToast("已分享");
            return;
          } catch (e) {}
        }
      }
      const link = document.createElement("a");
      link.download = "mindful-canvas-card.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("卡片已儲存");
    }, "image/png");
  };
  artworkImg.src = document.getElementById("cardImage").src;
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

// ===== GALLERY (IndexedDB) =====
function setGalleryInnerInert(inert) {
  const inner = document.querySelector("#galleryScreen .gallery-inner");
  if (inner) inner.inert = inert;
}

function getGalleryDeleteEntryId() {
  if (galleryDetailEntryId != null) return galleryDetailEntryId;
  const btn = document.getElementById("galleryDeleteBtn");
  const raw = btn?.dataset.entryId;
  if (raw == null || raw === "") return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function initGallery() {
  const deleteBtn = document.getElementById("galleryDeleteBtn");
  if (!deleteBtn || deleteBtn.dataset.bound) return;
  deleteBtn.dataset.bound = "1";
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    void deleteGalleryDetail();
  });
}

function revokeGalleryGridUrls() {
  galleryObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  galleryObjectUrls = [];
}

function revokeGalleryDetailUrl() {
  if (galleryDetailObjectUrl) {
    URL.revokeObjectURL(galleryDetailObjectUrl);
    galleryDetailObjectUrl = null;
  }
}

function createGalleryThumbUrl(entry) {
  if (!isValidGalleryEntry(entry)) return null;
  try {
    return URL.createObjectURL(entry.thumb);
  } catch {
    return null;
  }
}

async function purgeInvalidGalleryEntries(entries) {
  const invalid = entries.filter((e) => !isValidGalleryEntry(e));
  if (!invalid.length) return entries.filter((e) => isValidGalleryEntry(e));
  await Promise.all(invalid.map((e) => deleteGalleryEntry(e.id).catch(() => {})));
  if (invalid.length) showToast(`已移除 ${invalid.length} 筆損壞紀錄`);
  return entries.filter((e) => isValidGalleryEntry(e));
}

function setGalleryDetailThumb(entry) {
  const img = document.getElementById("galleryDetailImg");
  if (!img) return false;

  revokeGalleryDetailUrl();
  img.removeAttribute("src");
  img.hidden = true;

  const url = createGalleryThumbUrl(entry);
  if (!url) return false;

  galleryDetailObjectUrl = url;
  img.onerror = () => {
    revokeGalleryDetailUrl();
    img.removeAttribute("src");
    img.hidden = true;
  };
  img.onload = () => {
    img.hidden = false;
  };
  img.src = url;
  return true;
}

function getGalleryModeLabel(entry) {
  const base = GALLERY_MODE_LABELS[entry.mode] || entry.mode;
  if (entry.mode === "zen" && entry.templateId && ZEN_TEMPLATES[entry.templateId]) {
    return `${base} · ${ZEN_TEMPLATES[entry.templateId].name}`;
  }
  return base;
}

async function persistCardToGallery(affirmation) {
  if (!lastArtworkDataUrl || lastArtworkDataUrl.length < 32) return;
  try {
    const thumb = await dataUrlToThumbnailBlob(lastArtworkDataUrl);
    if (!thumb || thumb.size === 0) return;
    await addGalleryEntry({
      createdAt: new Date().toISOString(),
      mode: appMode,
      templateId: appMode === "zen" ? zenTemplateId : null,
      affirmation: String(affirmation || "").slice(0, 120),
      thumb,
    });
    await refreshGalleryBadge();
  } catch {
    /* gallery is optional; fail silently */
  }
}

async function refreshGalleryBadge() {
  await renderWelcomeRecentStrip();
}

function revokeWelcomeRecentUrls() {
  welcomeRecentObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  welcomeRecentObjectUrls = [];
}

async function openGalleryFromRecent(entry) {
  try {
    await openGallery();
    openGalleryDetail(entry);
  } catch {
    showToast("無法開啟藝廊");
  }
}

async function renderWelcomeRecentStrip() {
  const strip = document.getElementById("welcomeRecentStrip");
  const empty = document.getElementById("welcomeRecentEmpty");
  if (!strip) return;

  revokeWelcomeRecentUrls();
  strip.innerHTML = "";

  try {
    const entries = await listGalleryEntries();
    const valid = entries.filter((e) => isValidGalleryEntry(e)).slice(0, 6);
    if (!valid.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    valid.forEach((entry) => {
      const url = createGalleryThumbUrl(entry);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "welcome-recent-thumb";
      btn.setAttribute("aria-label", getGalleryModeLabel(entry));
      if (url) {
        welcomeRecentObjectUrls.push(url);
        const img = document.createElement("img");
        img.src = url;
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("error", () => {
          img.replaceWith(
            Object.assign(document.createElement("div"), {
              className: "welcome-recent-placeholder",
              ariaHidden: "true",
            })
          );
        });
        btn.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "welcome-recent-placeholder";
        ph.setAttribute("aria-hidden", "true");
        btn.appendChild(ph);
      }
      btn.addEventListener("click", () => {
        void openGalleryFromRecent(entry);
      });
      strip.appendChild(btn);
    });
  } catch {
    if (empty) empty.hidden = false;
  }
}

function renderGalleryGrid(entries) {
  revokeGalleryGridUrls();
  const grid = document.getElementById("galleryGrid");
  const empty = document.getElementById("galleryEmpty");
  if (!grid || !empty) return;

  grid.innerHTML = "";
  const valid = entries.filter((e) => isValidGalleryEntry(e));
  if (!valid.length) {
    empty.hidden = false;
    empty.textContent =
      entries.length > 0
        ? "紀錄已損壞或已清除。完成一次創作後會自動收錄。"
        : "還沒有作品。完成一次創作後會自動收錄。";
    return;
  }
  empty.hidden = true;
  empty.textContent = "還沒有作品。完成一次創作後會自動收錄。";

  valid.forEach((entry) => {
    const url = createGalleryThumbUrl(entry);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-item";
    const thumbHtml = url
      ? `<img src="${url}" alt="" loading="lazy" />`
      : `<div class="gallery-thumb-missing gallery-thumb-missing--tile" aria-hidden="true"><span>無縮圖</span></div>`;
    if (url) galleryObjectUrls.push(url);
    btn.innerHTML = `
      ${thumbHtml}
      <div class="gallery-item-meta">
        <div class="gallery-item-mode">${getGalleryModeLabel(entry)}</div>
        <div class="gallery-item-date">${formatGalleryDate(entry.createdAt)}</div>
      </div>
    `;
    const img = btn.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        img.replaceWith(
          Object.assign(document.createElement("div"), {
            className: "gallery-thumb-missing gallery-thumb-missing--tile",
            innerHTML: "<span>無縮圖</span>",
          })
        );
      });
    }
    btn.addEventListener("click", () => openGalleryDetail(entry));
    grid.appendChild(btn);
  });
}

function openGalleryDetail(entry) {
  const detail = document.getElementById("galleryDetail");
  const modeEl = document.getElementById("galleryDetailMode");
  const dateEl = document.getElementById("galleryDetailDate");
  const affEl = document.getElementById("galleryDetailAffirmation");
  if (!detail) return;

  if (!isValidGalleryEntry(entry)) {
    showToast("此作品未完整儲存");
    if (entry?.id != null) removeGalleryItem(entry.id);
    return;
  }

  galleryDetailEntryId = entry.id;
  const deleteBtn = document.getElementById("galleryDeleteBtn");
  if (deleteBtn) deleteBtn.dataset.entryId = String(entry.id);
  setGalleryDetailThumb(entry);
  if (modeEl) modeEl.textContent = getGalleryModeLabel(entry);
  if (dateEl) dateEl.textContent = formatGalleryDate(entry.createdAt);
  if (affEl) affEl.textContent = entry.affirmation || "";
  setGalleryInnerInert(true);
  detail.hidden = false;
}

function closeGalleryDetail() {
  galleryDetailEntryId = null;
  const deleteBtn = document.getElementById("galleryDeleteBtn");
  if (deleteBtn) deleteBtn.dataset.entryId = "";
  setGalleryInnerInert(false);
  revokeGalleryDetailUrl();
  const img = document.getElementById("galleryDetailImg");
  if (img) {
    img.removeAttribute("src");
    img.hidden = true;
    img.onerror = null;
    img.onload = null;
  }
  const detail = document.getElementById("galleryDetail");
  if (detail) detail.hidden = true;
}

async function deleteGalleryDetail() {
  const entryId = getGalleryDeleteEntryId();
  if (entryId == null) {
    showToast("無法刪除此作品");
    return;
  }
  const btn = document.getElementById("galleryDeleteBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "刪除中…";
  }
  try {
    await removeGalleryItem(entryId);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "刪除此作品";
    }
  }
}

async function removeGalleryItem(id) {
  if (id == null) {
    showToast("無法刪除此作品");
    return;
  }
  try {
    await deleteGalleryEntry(id);
    closeGalleryDetail();
    const entries = await listGalleryEntries();
    renderGalleryGrid(entries.filter((e) => isValidGalleryEntry(e)));
    await refreshGalleryBadge();
    showToast("已刪除");
  } catch {
    showToast("刪除失敗，請再試");
  }
}

async function openGallery() {
  try {
    closeGalleryDetail();
    const entries = await listGalleryEntries();
    const valid = await purgeInvalidGalleryEntries(entries);
    renderGalleryGrid(valid);
    showScreen("galleryScreen");
  } catch {
    showToast("無法開啟藝廊（此裝置可能不支援本地儲存）");
  }
}

function closeGallery() {
  closeGalleryDetail();
  revokeGalleryGridUrls();
  showScreen("welcome");
  restartWelcomeEnterAnimation();
  void renderWelcomeRecentStrip();
  startWelcomeAmbient();
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
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => reg.update())
    .catch(() => {});
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
initGallery();
initTeacherExport();
initParticleToggle();
registerServiceWorker();
startWelcomeAmbient();
refreshGalleryBadge();

window.addEventListener("resize", () => {
  if (document.getElementById("welcome").classList.contains("active")) {
    resizeWelcomeAmbient();
    drawFreePreview();
    drawZenPreview();
    drawSumiPreview();
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
window.toggleZenTikseGrid = toggleZenTikseGrid;
window.undoLastAction = undoLastAction;
window.showTerms = showTerms;
window.saveCard = saveCard;
window.finishFromCard = finishFromCard;
window.closeTerms = closeTerms;
window.openGallery = openGallery;
window.closeGallery = closeGallery;
window.closeGalleryDetail = closeGalleryDetail;
window.deleteGalleryDetail = deleteGalleryDetail;
