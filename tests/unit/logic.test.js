import { describe, it, expect } from "vitest";
import {
  checkSafety,
  hexToRgb,
  getBreathValue,
  getBreathLineMultiplier,
  parseSessions,
  serializeSessions,
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
  it("returns values between 0.85 and 1.15 (±15%)", () => {
    for (let t = 0; t < 16000; t += 100) {
      const mult = getBreathLineMultiplier(t);
      expect(mult).toBeGreaterThanOrEqual(0.85);
      expect(mult).toBeLessThanOrEqual(1.15);
    }
  });

  it("is 1.0 at t=0 (breath=0.5)", () => {
    expect(getBreathLineMultiplier(0)).toBeCloseTo(1.0, 1);
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
