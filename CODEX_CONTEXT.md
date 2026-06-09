# Mindful Canvas — AI Agent 上下文

> 交俾 Claude Code / Codex / Cursor Agent 快速接手本專案。

## 專案概要

- **產品**：覺知畫布 Mindful Canvas™ — 中學生情緒出口 PWA（畫 + 解讀 + 卡片）
- **入口**：雙模式 — **自由畫布** / **禪繞唐卡**（8 場景題字庫仍用於解讀，首頁唔顯示）
- **架構**：單檔 [`index.html`](index.html) + [`manifest.json`](manifest.json) + [`sw.js`](sw.js)，零 npm
- **規格**：[`PLAN.md`](PLAN.md) v6.0；視覺細節 [`V2_VISUAL_SPEC.md`](V2_VISUAL_SPEC.md)

## 不可改動

- 品牌名：Mindful Canvas™ / 覺知畫布™ / ZenArt Lab™
- 主色：#1a1a2e 背景、#e2b55a 金光
- 安全網：危機關鍵詞 → 生命熱線 2382 0000 / 2389 2222，**模板與 AI 路徑必須一致**
- 免責：非醫療工具
- 禪繞：`zenTraceLayer` + Pointer Events 輸入（勿破壞）

## 畫面流程

```
welcome（雙模式）→ canvas → card → feedback → welcome
```

安全模式：`card`（僅返回首頁，跳過 feedback）

## 關鍵函式（index.html）

| 函式                                     | 用途                              |
| ---------------------------------------- | --------------------------------- |
| `checkSafety()`                          | 統一安全網（關鍵詞 + highStress） |
| `generateInterpretation()`               | 模板解讀                          |
| `generateInterpretationAI()`             | Ollama 可選，fallback 模板        |
| `getDominantColor()`                     | 筆觸顏色頻率統計                  |
| `saveSession()` / `exportSessions()`     | localStorage 與教師匯出           |
| `updateBreath()` / `drawBreathOverlay()` | v2 呼吸節奏（Phase 3）            |
| `persistZenStroke()` / `zenTraceLayer`   | 禪繞持久留痕                      |

## localStorage Schema

Key: `mindful_canvas_sessions`（JSON 陣列）

```json
{
  "date": "ISO8601",
  "mode": "free|zen",
  "scene": "free|zen|anxious|...",
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

## 教師匯出

長按歡迎頁「覺知畫布」標題 3 秒 → 下載 `mindful-canvas-sessions.json`

## Canvas 引擎

- `requestAnimationFrame` 渲染迴圈
- 無常淡化：`fadePhase` 遞增（自由畫布）
- v2 視覺：光尾、水墨 stamp、呼吸節奏、歡迎光霧（見 V2_VISUAL_SPEC）
- 禪意粒子：toggle `#particleToggle`（禪繞模式恆開）

## Ollama（可選）

- URL: `http://localhost:11434`
- Model: `gemma4:12b`（需本機已 pull）

## v2 狀態（2026-06-09）

- ✅ Phase 0–4：歡迎氛圍、光尾、水墨、呼吸、UI 沉浸
- ✅ 語音已移除（產品決策）
- ⬜ 模組化拆分 `js/`（>2500 行時考慮）

## 專案盤點 Skill

- 路徑：`.cursor/skills/mindful-canvas-ops/SKILL.md`
- 觸發：盤點、未做、更新、refine、research、automations、Hermes 交接
- 機械檢查：`bash .cursor/skills/mindful-canvas-ops/scripts/audit.sh`
