/**
 * Mindful Canvas — Core Logic Module
 * Pure functions extracted for unit testing
 */

// ===== CONSTANTS =====

export const DANGER_KEYWORDS = [
  "想死",
  "自殺",
  "死咗",
  "死掉",
  "結束生命",
  "活著冇意思",
  "活著沒有意思",
  "唔想活",
  "不想活",
  "冇人要",
  "沒人要",
  "消失",
  "割",
  "跳落",
  "跳下",
  "食藥",
  "吃藥",
  "自殘",
  "自伤",
  "了結",
  "了结",
  "冇意義",
  "沒有意義",
  "好痛苦",
  "好辛苦",
  "頂唔順",
  "撐唔住",
  "頂不住",
  "撐不住",
  "out of hope",
  "give up",
  "no point",
  "kill myself",
  "suicide",
  "want to die",
  "end my life",
];

export const SAFETY_RESPONSE = {
  affirmation: "我聽到你了。你不是一個人。",
  reflection:
    "如果你正在經歷困難的時刻，請記得有人在乎你。香港 24 小時生命熱線：2382 0000（東華三院）或 2389 2222（撒瑪利亞）。你願意撥一個電話嗎？",
  isSafe: false,
};

export const OLLAMA_SCENE_MAP = {
  anxious: "焦慮、壓力、擔心",
  chaotic: "混亂、思緒紛飛、腦袋很亂",
  stuck: "卡住、停滯、不知道怎麼開始",
  free: "自由書寫、隨心所欲、沒有特定情緒",
  metta: "慈、祝福他人、願你快樂",
  karuna: "悲、陪伴受苦的人、願你離苦",
  mudita: "喜、為他人歡喜、分享快樂",
  upekkha: "捨、放下執著、接納無常",
  zen: "禪繞唐卡、靜心跟隨、輕觸感受、一分鐘完成",
  sumi: "墨流畫布、滴墨攪水、觀察流動、放下控制",
};

export const BREATH_CYCLE_MS = 8000;
export const TOOLS_IDLE_MS = 3000;
export const ZEN_TRACE_COLORS = [
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
export const STORAGE_KEY = "mindful_canvas_sessions";

// ===== SAFETY =====

/**
 * Check if text contains danger keywords or high-stress indicators
 * @param {string} sceneText - The scene/mood text to check
 * @param {number} strokeCount - Number of strokes drawn
 * @param {number} totalSilence - Total silence duration
 * @returns {object|null} Safety response if danger detected, null otherwise
 */
export function checkSafety(sceneText, strokeCount = 0, totalSilence = Infinity) {
  const allText = (sceneText || "").toLowerCase();
  const dangerHit = DANGER_KEYWORDS.some((kw) => allText.includes(kw));
  const highStress =
    (sceneText === "anxious" || sceneText === "chaotic") && strokeCount > 200 && totalSilence < 3;
  if (dangerHit || highStress) return { ...SAFETY_RESPONSE };
  return null;
}

// ===== COLOR =====

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string (e.g., "#e2b55a")
 * @returns {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Get the dominant color from stroke history
 * @param {Array} strokeHistory - Array of stroke objects with .color and .eraser properties
 * @param {string} fallbackColor - Fallback color if no strokes
 * @returns {string} Hex color
 */
export function getDominantColor(strokeHistory, fallbackColor = "#e2b55a") {
  const painted = strokeHistory.filter((s) => !s.eraser);
  if (!painted.length) return fallbackColor;
  const counts = {};
  painted.forEach((s) => {
    counts[s.color] = (counts[s.color] || 0) + 1;
  });
  let max = 0;
  let dominant = fallbackColor;
  for (const [hex, n] of Object.entries(counts)) {
    if (n > max) {
      max = n;
      dominant = hex;
    }
  }
  return dominant;
}

// ===== BREATH =====

/**
 * Calculate breath value (0-1) based on sine wave
 * @param {number} ts - Timestamp in ms
 * @param {number} cycleMs - Breath cycle duration in ms
 * @returns {number} Breath value between 0 and 1
 */
export function getBreathValue(ts, cycleMs = BREATH_CYCLE_MS) {
  return (Math.sin((ts / cycleMs) * Math.PI * 2) + 1) / 2;
}

/**
 * Get breath-based line width multiplier (matches index.html ±15%)
 * @param {number} ts - Timestamp in ms
 * @param {number} cycleMs - Breath cycle duration in ms
 * @returns {number} Multiplier between 0.85 and 1.15
 */
export function getBreathLineMultiplier(ts, cycleMs = BREATH_CYCLE_MS) {
  const b = getBreathValue(ts, cycleMs);
  return 1 + 0.3 * (b - 0.5);
}

// ===== BRUSH =====

/**
 * Calculate brush size based on eraser mode
 * @param {boolean} isEraser - Whether eraser is active
 * @param {number} baseSize - Base brush size
 * @param {number} eraserMultiplier - Eraser size multiplier
 * @returns {number} Brush size
 */
export function getBrushSize(isEraser, baseSize = 4, eraserMultiplier = 3) {
  return isEraser ? baseSize * eraserMultiplier : baseSize;
}

// ===== STORAGE =====

/**
 * Parse sessions from localStorage JSON
 * @param {string} json - Raw JSON string from localStorage
 * @returns {Array} Parsed sessions array
 */
export function parseSessions(json) {
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Serialize sessions to JSON for localStorage
 * @param {Array} sessions - Sessions array
 * @returns {string} JSON string
 */
export function serializeSessions(sessions) {
  return JSON.stringify(sessions);
}

// ===== INK STAMP =====

/**
 * Create ink stamp pattern data
 * @param {string} color - Hex color
 * @param {number} brushSize - Brush size
 * @returns {object} Stamp data with color, brushSize, alpha
 */
export function getInkStamp(color, brushSize) {
  const alpha = Math.min(0.6 + brushSize * 0.02, 1);
  return { color, brushSize, alpha };
}
