# Mindful Canvas — AI Agent 上下文

> 交俾 Claude Code / Codex / Cursor Agent 快速接手本專案。

## 專案概要

- **產品**：覺知畫布 Mindful Canvas™ — 中學生情緒出口 PWA（畫 + 解讀 + 卡片）
- **入口**：三模式 — **禪繞唐卡**（12 款）/ **墨流畫布** / **自由畫布**
- **架構**：[`index.html`](index.html)（殼）+ [`src/logic.js`](src/logic.js)（可測常數）+ [`js/app.js`](js/app.js)（執行）+ [`js/gallery.js`](js/gallery.js)（IndexedDB 藝廊）+ [`manifest.json`](manifest.json) + [`sw.js`](sw.js)
- **規格**：[`PLAN.md`](PLAN.md) v6.0；視覺細節 [`V2_VISUAL_SPEC.md`](V2_VISUAL_SPEC.md)

## 不可改動

- 品牌名：Mindful Canvas™ / 覺知畫布™ / ZenArt Lab™
- 主色：#1a1a2e 背景、#e2b55a 金光
- 安全網：危機關鍵詞 → 生命熱線 2382 0000 / 2389 2222，**模板與 AI 路徑必須一致**
- 免責：非醫療工具
- 禪繞：`zenTraceLayer` + Pointer Events 輸入（勿破壞）

## 畫面流程

```
welcome（三模式 + 心靈藝廊）→ canvas → card → welcome
```

- **無 feedback 問卷畫面**（v2.4 起已移除 UI；session 仍可在卡片完成時寫入 localStorage）
- **安全模式**：`card` 僅「返回首頁」，跳過後續流程
- **心靈藝廊**：welcome 入口 → `galleryScreen`（IndexedDB 最近 10 次縮圖，可刪除）

## 關鍵函式

| 模組            | 函式                                         | 用途                       |
| --------------- | -------------------------------------------- | -------------------------- |
| `src/logic.js`  | `checkSafety()`                              | 統一安全網                 |
| `src/logic.js`  | `isValidGalleryEntry()`                      | 藝廊條目驗證               |
| `src/logic.js`  | `ZEN_TRACE_COLORS`                           | 禪繞預設筆色常數           |
| `js/app.js`     | `generateInterpretation()`                   | 模板解讀                   |
| `js/app.js`     | `generateInterpretationAI()`                 | Ollama 可選，fallback 模板 |
| `js/app.js`     | `persistCardToGallery()`                     | 卡片完成後存藝廊縮圖       |
| `js/app.js`     | `openGallery()` / `deleteGalleryDetail()`    | 藝廊 UI                    |
| `js/gallery.js` | `addGalleryEntry()` / `deleteGalleryEntry()` | IndexedDB CRUD             |
| `js/app.js`     | `saveSession()` / `exportSessions()`         | localStorage 與教師匯出    |
| `js/app.js`     | `persistZenStroke()` / `zenTraceLayer`       | 禪繞持久留痕               |

## localStorage Schema

Key: `mindful_canvas_sessions`（JSON 陣列）

```json
{
  "date": "ISO8601",
  "mode": "free|zen|sumi",
  "scene": "free|zen|sumi|anxious|...",
  "strokes": 42,
  "silence": 12,
  "dominantColor": "#e2b55a",
  "source": "template|ollama",
  "happiness": 7,
  "replay": true,
  "comment": "可選文字",
  "skipped": false
}
```

## IndexedDB 藝廊

- DB：`mindful_canvas_gallery` / store：`entries`
- 每筆：`createdAt`、`mode`、`templateId?`、`affirmation`、`thumb`（JPEG Blob）
- 上限 10 筆；損壞條目開啟時自動清除

## 教師匯出

長按歡迎頁「覺知畫布」標題 3 秒 → 下載 `mindful-canvas-sessions.json`

## Canvas 引擎

- `requestAnimationFrame` 渲染迴圈
- 無常淡化：`fadePhase` 遞增（自由畫布）
- v2 視覺：光尾、水墨 stamp、呼吸節奏、歡迎光霧（見 V2_VISUAL_SPEC）
- 禪意粒子：toggle `#particleToggle`（禪繞模式恆開）
- 擦膠預覽：淺藍色範圍圈（`ERASER_PREVIEW_*` 常數）

## Ollama（可選）

- URL: `http://localhost:11434`
- Model: `gemma4:12b`（需本機已 pull）
- 啟用：`?ai=1` query opt-in

## v2 狀態（2026-06）

- ✅ Phase 0–4：歡迎氛圍、光尾、水墨、呼吸、UI 沉浸
- ✅ 三模式：禪繞 12 款、墨流、自由畫布
- ✅ v2.4 心靈藝廊（IndexedDB MVP）
- ✅ 模組化：`src/logic.js` + `js/app.js` + `js/gallery.js`（deploy 須 copy `src/`）

## 專案盤點 Skill

- 路徑：`.cursor/skills/mindful-canvas-ops/SKILL.md`
- 觸發：盤點、未做、更新、refine、research、automations、Hermes 交接
- 機械檢查：`bash .cursor/skills/mindful-canvas-ops/scripts/audit.sh`
