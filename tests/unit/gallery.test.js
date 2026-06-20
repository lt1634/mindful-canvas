import { describe, it, expect } from "vitest";
import {
  GALLERY_MAX_ENTRIES,
  GALLERY_MODE_LABELS,
  GALLERY_DB_NAME,
  formatGalleryDate,
} from "../../src/logic.js";
import { isValidGalleryEntry } from "../../src/logic.js";

describe("gallery logic", () => {
  it("defines IndexedDB name", () => {
    expect(GALLERY_DB_NAME).toBe("mindful_canvas_gallery");
  });

  it("defines mode labels for all app modes", () => {
    expect(GALLERY_MODE_LABELS.free).toBe("自由畫布");
    expect(GALLERY_MODE_LABELS.zen).toBe("禪繞唐卡");
    expect(GALLERY_MODE_LABELS.sumi).toBe("墨流畫布");
  });

  it("caps gallery at 10 entries", () => {
    expect(GALLERY_MAX_ENTRIES).toBe(10);
  });

  it("formats ISO dates for zh-Hant locale", () => {
    const text = formatGalleryDate("2026-06-12T14:30:00.000Z");
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("isValidGalleryEntry", () => {
  const validThumb = new Blob(["x"], { type: "image/jpeg" });

  it("accepts entry with non-empty thumb blob", () => {
    expect(
      isValidGalleryEntry({
        createdAt: "2026-06-12T14:30:00.000Z",
        mode: "zen",
        thumb: validThumb,
      })
    ).toBe(true);
  });

  it("rejects missing thumb", () => {
    expect(
      isValidGalleryEntry({
        createdAt: "2026-06-12T14:30:00.000Z",
        mode: "zen",
      })
    ).toBe(false);
  });

  it("rejects empty thumb blob", () => {
    expect(
      isValidGalleryEntry({
        createdAt: "2026-06-12T14:30:00.000Z",
        mode: "zen",
        thumb: new Blob([], { type: "image/jpeg" }),
      })
    ).toBe(false);
  });

  it("rejects non-blob thumb", () => {
    expect(
      isValidGalleryEntry({
        createdAt: "2026-06-12T14:30:00.000Z",
        mode: "zen",
        thumb: "not-a-blob",
      })
    ).toBe(false);
  });
});
