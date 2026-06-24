---
name: goal
description: >-
  Slash command /goal — expand fuzzy tasks into 5-element Goal Prompt + project
  Rubric before coding. Mindful Canvas: auto-inject frozen constraints, provenance
  gate, phase-separated review/fix. Use when Tim says /goal, goal prompt, or hands
  a vague build task.
---

# goal（slash command: `/goal`）— v2

## When to use

Tim 打 `/goal <任務>`，或交一個會改 code / UI / 內容嘅模糊任務。
觸發後**唔准即刻動手**——先過 Provenance gate，再展開 5 元素，確認先做。

## Step 0 — Provenance gate（最先做，過唔到就停）

每個 goal 必須答：**「呢個 goal 邊度嚟？」**

| 來源                      | 說明                               |
| ------------------------- | ---------------------------------- |
| ① code review / grep 實證 | 附檔案 + 行號                      |
| ② GA 漏斗 drop-off        | **貼數字**（例：open→save 跌 92%） |
| ③ 用戶 / bug 報告         | 附情境或截圖                       |
| ④ 純拍腦                  | 預設 **唔開工**                    |

若係 ④，或 ② 但冇實際數據 → 回 Tim：

> 「呢個 goal 暫時冇證據支撐，建議等 [咩數據/驗證] 先做。」

**Mindful Canvas 現況（2026-06）**：核心已穩定（v2.6 中英文、藝廊、GA4）；校內測試前大部分「加功能 / 做 retention」類 goal 應擋或 park 去 [`data/backlog/retention-ideas.md`](../../../data/backlog/retention-ideas.md)。

## Step 1 — 展開 5 元素（Goal Prompt）

| #   | 元素                 | 填咩                                                                      |
| --- | -------------------- | ------------------------------------------------------------------------- |
| 01  | **Outcome**          | 可量度狀態（例：觸控延遲 &lt; 50ms），含 Tim constraint（時間、校內測試） |
| 02  | **Verification**     | 具體指令 / 裝置 / 工具（`npm run validate`、Safari 實測、GA Realtime）    |
| 03  | **Constraints**      | 禁區 + **Step 1.5 自動注入**（Mindful Canvas）                            |
| 04  | **Iteration Policy** | 每步：改咗咩 → 量到咩 → 下一步假設                                        |
| 05  | **Error Handling**   | 卡住即停：試過咩、瓶頸、需要 Tim 咩決定                                   |

## Step 1.5 — Mindful Canvas 凍結區（自動注入 Constraints）

任何涉及本 repo 嘅 goal，Constraints **自動加入**：

- ❌ 安全網文案、熱線 **2382 0000 / 2389 2222**、`checkSafety()` 行為
- ❌ 品牌色 **#1a1a2e / #e2b55a**（見 [`BRAND.md`](../../../BRAND.md)）
- ❌ **zenTraceLayer** + Pointer Events 輸入架構
- ❌ 墨流改 WebGL（保持 Canvas 2D）
- ❌ 唔加新功能（除非 goal 明寫「新功能」且 provenance 過 gate）
- ✅ 改動產品：**CHANGELOG** + **`sw.js` CACHE bump**（`zen-vNN`）+ `index.html` / `js/*` query 同步

完整 Rubric：[`REFERENCES/hermes/rubrics/mindful-canvas.md`](../../../REFERENCES/hermes/rubrics/mindful-canvas.md)

## Step 2 — 載入 Rubric

- UI / 設計 / 內容 / PWA → 載入 `mindful-canvas.md`
- 任何可能加「留存機制」→ **額外**載入 [`mindful-retention-rubric.md`](../../../REFERENCES/hermes/rubrics/mindful-retention-rubric.md)（防 engagement-bait）
- 冇現成 rubric → 即場用 4 維度建 Pass/Fail

## Step 3 — 執行：Review 與 Fix 分開

| Phase        | 規則                                                         |
| ------------ | ------------------------------------------------------------ |
| **1 Review** | read-only；box 只准 `[ ]` 或 `~~N/A~~`；產出發現 + grep 證據 |
| **2 Fix**    | 改 code；跑 Verification；**先過先准 `[x]`**                 |

一份報告同時話「冇改 code」又「改咗 N 行」= **禁止**。

## Step 4 — 誠實 checkbox

- `[x]` = 實際執行並通過（附輸出）
- `[ ]` = 未跑
- `~~N/A~~` = 不適用
- 嚴禁「`[x]`（冇跑）」；config 存在 ≠ lint 通過

## Step 5 — Measurement validity

信指標前先問：壞咗會點樣？

- `card_share = 0` → 真係冇人 share，定 Web Share API 靜默失敗？
- 自報 mood / 壓力降幅 → 不可當硬 KPI

分唔清 → **先修量度**，唔好用嚟開新 goal。

## Hard constraints（鐵律）

1. Provenance / 5 元素未齊 → 唔准改 code
2. 撞 Error Handling → 停低回報，唔准無限試、亂改、自把自為擴範圍
3. 嚴守 Constraints（含凍結區）
4. 改完一定跑 Verification；冇跑唔當完成

## 配合 Tim 節奏

- Outcome 要含現實 constraint（老師、湊女、時間）
- 每次回覆含**具體下一步**
- 唔堆理論；park 嘅 idea 入 backlog，唔當批准開工

## 範例

[`REFERENCES/hermes/examples/goal-touch-latency.md`](../../../REFERENCES/hermes/examples/goal-touch-latency.md)

## 與 `/plan` 的關係（階段 3，未實作）

```
/plan  ← GA 漏斗 + review 發現 → 排序 goal backlog
  └─ 每個 goal 仍走 /goal v2（5 元素 + rubric + gate）
```

GA 有數之前，`/plan` 只應產出「等數據」或「校內測試」類 goal，唔應自動排 retention 大功能。

## Hermes 部署路徑（可選）

Copy 本檔到 `~/NS/runtime/hermes/skills/goal/SKILL.md`；rubrics 到 `~/NS/runtime/hermes/data/rubrics/`（與 repo `REFERENCES/hermes/rubrics/` 保持同步）。
