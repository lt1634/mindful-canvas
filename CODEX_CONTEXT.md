# Mindful Canvas — AI Agent 上下文

> 交俾 Claude Code / Codex / Cursor Agent 快速接手本專案。

## 專案概要

- **產品**：覺知畫布 Mindful Canvas™ — 中學生情緒出口 PWA（畫 + 語音 + 解讀 + 卡片）
- **架構**：單檔 [`index.html`](index.html) + [`manifest.json`](manifest.json) + [`sw.js`](sw.js)，零 npm
- **規格**：[`PLAN.md`](PLAN.md) v6.0 為唯一真相來源

## 不可改動

- 品牌名：Mindful Canvas™ / 覺知畫布™ / ZenArt Lab™
- 主色：#1a1a2e 背景、#e2b55a 金光
- 安全網：危機關鍵詞 → 生命熱線 2382 0000 / 2389 2222，**模板與 AI 路徑必須一致**
- 免責：非醫療工具

## 畫面流程

```
welcome → canvas → card → feedback → welcome
```

安全模式：`card`（僅返回首頁，跳過 feedback）

## 關鍵函式（index.html）

| 函式 | 用途 |
|------|------|
| `checkSafety()` | 統一安全網（關鍵詞 + highStress） |
| `generateInterpretation()` | 模板解讀 |
| `generateInterpretationAI()` | Ollama 可選，fallback 模板 |
| `getDominantColor()` | 筆觸顏色頻率統計 |
| `saveSession()` / `exportSessions()` | localStorage 與教師匯出 |

## localStorage Schema

Key: `mindful_canvas_sessions`（JSON 陣列）

```json
{
  "date": "ISO8601",
  "scene": "anxious|chaotic|stuck|free|metta|karuna|mudita|upekkha",
  "strokes": 42,
  "silence": 12,
  "dominantColor": "#e2b55a",
  "voiceUsed": true,
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
- 無常淡化：`fadePhase` 遞增
- 禪意粒子：toggle `#particleToggle`，參考 [`REFERENCES/canvas-fixed.js`](REFERENCES/canvas-fixed.js)

## Ollama（可選）

- URL: `http://localhost:11434`
- Model: `gemma4:12b`（需本機已 pull）

## 待 v2（學生反饋後）

- 水墨暈染 / 光尾 / 呼吸節奏（PLAN §9.2 A/B/D）
- 模組化拆分 `js/`（見 PLAN v5，觸發條件：>1500 行或 A/B 測試）
