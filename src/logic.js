/**
 * Mindful Canvas — Core Logic Module
 * Pure functions extracted for unit testing
 * @module logic
 */

// ===== CONSTANTS =====

/** @type {string[]} List of danger keywords for safety detection */
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

/** @type {{ affirmation: string, reflection: string, isSafe: boolean }} */
export const SAFETY_RESPONSE = {
  affirmation: "我聽到你了。你不是一個人。",
  reflection:
    "如果你正在經歷困難的時刻，請記得有人在乎你。香港 24 小時生命熱線：2382 0000（東華三院）或 2389 2222（撒瑪利亞）。你願意撥一個電話嗎？",
  isSafe: false,
};

/** @type {Record<string, string>} Scene names for Ollama AI interpretation */
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

export const GALLERY_DB_NAME = "mindful_canvas_gallery";
export const GALLERY_MAX_ENTRIES = 10;
export const GALLERY_MODE_LABELS = {
  free: "自由畫布",
  zen: "禪繞唐卡",
  sumi: "墨流畫布",
};

/**
 * Validate a gallery IndexedDB entry before display or persistence
 * @param {Object} entry - Gallery entry object
 * @param {string} entry.createdAt - ISO8601 date string
 * @param {Blob} entry.thumb - Thumbnail blob
 * @param {string} entry.mode - Drawing mode (free|zen|sumi)
 * @returns {boolean} True if entry is valid
 */
export function isValidGalleryEntry(entry) {
  return Boolean(
    entry &&
    entry.createdAt &&
    entry.thumb instanceof Blob &&
    entry.thumb.size > 0 &&
    typeof entry.mode === "string"
  );
}

/**
 * Format gallery entry ISO date for zh-Hant UI
 * @param {string} iso - ISO8601 date string
 * @returns {string}
 */
export function formatGalleryDate(iso, lang = "zh") {
  try {
    const locale = lang === "en" ? "en-HK" : "zh-Hant";
    return new Date(iso).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ===== SAFETY =====

/**
 * Check if text contains danger keywords or high-stress indicators
 * @param {string} sceneText - The scene/mood text to check
 * @param {number} [strokeCount=0] - Number of strokes drawn
 * @param {number} [totalSilence=Infinity] - Total silence duration in seconds
 * @returns {{ affirmation: string, reflection: string, isSafe: boolean } | null} Safety response if danger detected, null otherwise
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
 * @returns {{ r: number, g: number, b: number }} RGB values (0-255)
 */
export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

// ===== BREATH =====

/**
 * Calculate breath value (0-1) based on sine wave
 * @param {number} ts - Timestamp in milliseconds
 * @param {number} [cycleMs=8000] - Breath cycle duration in milliseconds
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
