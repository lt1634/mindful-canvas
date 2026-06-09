import { describe, it, expect } from "vitest";
import {
  checkSafety,
  hexToRgb,
  getDominantColor,
  getBreathValue,
  getBreathLineMultiplier,
  getBrushSize,
  parseSessions,
  serializeSessions,
  getInkStamp,
  DANGER_KEYWORDS,
  SAFETY_RESPONSE,
  OLLAMA_SCENE_MAP,
} from "../../src/logic.js";

// ===== checkSafety =====

describe("checkSafety", () => {
  it("returns null for safe text", () => {
    expect(checkSafety("happy")).toBeNull();
    expect(checkSafety("free")).toBeNull();
    expect(checkSafety("")).toBeNull();
    expect(checkSafety(null)).toBeNull();
  });

  it("detects danger keywords in Chinese", () => {
    expect(checkSafety("我想死")).toEqual(SAFETY_RESPONSE);
    expect(checkSafety("自殺念頭")).toEqual(SAFETY_RESPONSE);
    expect(checkSafety("活著冇意思")).toEqual(SAFETY_RESPONSE);
    expect(checkSafety("頂唔順")).toEqual(SAFETY_RESPONSE);
  });

  it("detects danger keywords in English", () => {
    expect(checkSafety("kill myself")).toEqual(SAFETY_RESPONSE);
    expect(checkSafety("want to die")).toEqual(SAFETY_RESPONSE);
    expect(checkSafety("end my life")).toEqual(SAFETY_RESPONSE);
  });

  it("is case-insensitive", () => {
    expect(checkSafety("KILL MYSELF")).toEqual(SAFETY_RESPONSE);
    expect(checkSafety("Want To Die")).toEqual(SAFETY_RESPONSE);
  });

  it("detects high-stress pattern", () => {
    // anxious + >200 strokes + <3s silence = danger
    expect(checkSafety("anxious", 201, 2)).toEqual(SAFETY_RESPONSE);
    expect(checkSafety("chaotic", 300, 1)).toEqual(SAFETY_RESPONSE);
  });

  it("does not trigger high-stress for normal patterns", () => {
    expect(checkSafety("anxious", 100, 5)).toBeNull();
    expect(checkSafety("anxious", 201, 10)).toBeNull();
    expect(checkSafety("free", 300, 1)).toBeNull();
  });
});

// ===== hexToRgb =====

describe("hexToRgb", () => {
  it("converts hex to RGB", () => {
    expect(hexToRgb("#e2b55a")).toEqual({ r: 226, g: 181, b: 90 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("handles hex without #", () => {
    expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });
});

// ===== getDominantColor =====

describe("getDominantColor", () => {
  it("returns fallback for empty history", () => {
    expect(getDominantColor([])).toBe("#e2b55a");
    expect(getDominantColor([], "#ff0000")).toBe("#ff0000");
  });

  it("returns the most used color", () => {
    const history = [
      { color: "#ff0000", eraser: false },
      { color: "#ff0000", eraser: false },
      { color: "#00ff00", eraser: false },
    ];
    expect(getDominantColor(history)).toBe("#ff0000");
  });

  it("ignores eraser strokes", () => {
    const history = [
      { color: "#ff0000", eraser: true },
      { color: "#00ff00", eraser: false },
    ];
    expect(getDominantColor(history)).toBe("#00ff00");
  });
});

// ===== getBreathValue =====

describe("getBreathValue", () => {
  it("returns 0.5 at t=0", () => {
    expect(getBreathValue(0)).toBe(0.5);
  });

  it("returns values between 0 and 1", () => {
    for (let t = 0; t < 16000; t += 100) {
      const val = getBreathValue(t);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it("completes a full cycle", () => {
    const v1 = getBreathValue(0);
    const v2 = getBreathValue(8000); // one full cycle
    expect(v1).toBeCloseTo(v2, 2);
  });
});

// ===== getBreathLineMultiplier =====

describe("getBreathLineMultiplier", () => {
  it("returns values between 0.6 and 1.6", () => {
    for (let t = 0; t < 16000; t += 100) {
      const mult = getBreathLineMultiplier(t);
      expect(mult).toBeGreaterThanOrEqual(0.6);
      expect(mult).toBeLessThanOrEqual(1.6);
    }
  });

  it("is 1.1 at t=0 (breath=0.5)", () => {
    expect(getBreathLineMultiplier(0)).toBeCloseTo(1.1, 1);
  });
});

// ===== getBrushSize =====

describe("getBrushSize", () => {
  it("returns base size for normal brush", () => {
    expect(getBrushSize(false)).toBe(4);
  });

  it("returns multiplied size for eraser", () => {
    expect(getBrushSize(true)).toBe(12);
  });

  it("respects custom parameters", () => {
    expect(getBrushSize(false, 8, 2)).toBe(8);
    expect(getBrushSize(true, 8, 2)).toBe(16);
  });
});

// ===== parseSessions / serializeSessions =====

describe("parseSessions", () => {
  it("parses valid JSON array", () => {
    const data = [{ id: 1 }, { id: 2 }];
    expect(parseSessions(JSON.stringify(data))).toEqual(data);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseSessions("not json")).toEqual([]);
  });

  it("returns empty array for non-array JSON", () => {
    expect(parseSessions('{"key": "value"}')).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseSessions("")).toEqual([]);
  });
});

describe("serializeSessions", () => {
  it("serializes sessions to JSON", () => {
    const sessions = [{ id: 1 }];
    expect(serializeSessions(sessions)).toBe('[{"id":1}]');
  });
});

// ===== getInkStamp =====

describe("getInkStamp", () => {
  it("returns stamp data with correct alpha", () => {
    const stamp = getInkStamp("#ff0000", 4);
    expect(stamp.color).toBe("#ff0000");
    expect(stamp.brushSize).toBe(4);
    expect(stamp.alpha).toBeCloseTo(0.68, 2);
  });

  it("caps alpha at 1", () => {
    const stamp = getInkStamp("#ff0000", 50);
    expect(stamp.alpha).toBe(1);
  });
});

// ===== CONSTANTS =====

describe("constants", () => {
  it("DANGER_KEYWORDS is non-empty", () => {
    expect(DANGER_KEYWORDS.length).toBeGreaterThan(0);
  });

  it("SAFETY_RESPONSE has required fields", () => {
    expect(SAFETY_RESPONSE.affirmation).toBeTruthy();
    expect(SAFETY_RESPONSE.reflection).toBeTruthy();
    expect(SAFETY_RESPONSE.isSafe).toBe(false);
  });

  it("OLLAMA_SCENE_MAP has expected scenes", () => {
    expect(OLLAMA_SCENE_MAP).toHaveProperty("anxious");
    expect(OLLAMA_SCENE_MAP).toHaveProperty("free");
    expect(OLLAMA_SCENE_MAP).toHaveProperty("zen");
  });
});
