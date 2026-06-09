---
name: mindful-canvas-ops
description: >-
  Audits the Mindful Canvas 一人公司 project end-to-end: compares PLAN.md vs code,
  lists done/undone/updated items, syncs FEEDBACK.md and HABITS KPIs, suggests
  refinements and Cursor Automations, and outputs Hermes-ready handoff reports.
  Use when the user asks for 盤點、未做、更新、refine、research、automations,
  project status, 下一步, Hermes 交接, or periodic 一人公司 review.
---

# Mindful Canvas Ops — 專案自動盤點

一人公司營運 Skill。每次執行時**自己讀完整個 repo**，唔靠記憶。

## 真相來源（讀取順序）

1. [`PLAN.md`](../../../PLAN.md) v6.0 — 產品規格（唯一規格真相）
2. [`CODEX_CONTEXT.md`](../../../CODEX_CONTEXT.md) — 架構與不可改規則
3. [`CHANGELOG.md`](../../../CHANGELOG.md) — 已發布版本
4. [`FEEDBACK.md`](../../../FEEDBACK.md) + localStorage schema — 學生數據
5. [`HABITS.md`](../../../HABITS.md) — 每日/每週節奏與 90 日 KPI
6. [`index.html`](../../../index.html) — 實際程式
7. [`DEPLOY.md`](../../../DEPLOY.md) — 部署狀態

## 執行流程（每次必跑）

```
進度：
- [ ] 1. 跑 audit script（如有）
- [ ] 2. 讀規格與程式落差
- [ ] 3. 檢查 git / 部署狀態
- [ ] 4. 對齊 HABITS KPI
- [ ] 5. 產出報告 + 下一步 +（可選）Automation 建議
```

### Step 1 — 快速機械檢查

```bash
bash .cursor/skills/mindful-canvas-ops/scripts/audit.sh
```

用 script 輸出補充人工閱讀；script 唔夠時再 grep / read 檔案。

### Step 2 — 規格 vs 實作矩陣

對照 [`audit-checklist.md`](audit-checklist.md) 每一項標 ✅ / ⚠️ / ❌：

| 類別     | 必查                                       |
| -------- | ------------------------------------------ |
| 畫面流程 | welcome→canvas→card→feedback→welcome       |
| 安全網   | `checkSafety()` 模板+AI 一致               |
| 數據     | `mindful_canvas_sessions`、教師匯出        |
| PWA      | manifest、icons、sw.js                     |
| v2 待定  | PLAN §9.2 A/B/D 水墨/光尾/呼吸             |
| 文件     | CHANGELOG、FEEDBACK、CODEX_CONTEXT、DEPLOY |

**不可改**：品牌™、主色、安全網、非醫療免責（見 CODEX_CONTEXT）。

### Step 3 — Git 與部署

- `git log -5`、`git status`、remote 是否存在
- GitHub Pages 是否已啟用（`gh` 或 DEPLOY.md 指引）
- **切勿在報告中貼出含 token 的 remote URL**；若發現 token 在 remote，標 🔴 建議改 SSH 或 credential helper

### Step 4 — HABITS 對齊

從 [`HABITS.md`](../../../HABITS.md) §十讀 90 日 KPI，用 FEEDBACK.md 條目數 / 匯出 JSON 估算進度：

| KPI           | 目標 |
| ------------- | ---- |
| 學生體驗次數  | ≥3   |
| FEEDBACK 筆數 | ≥10  |
| MVP 改版      | ≥2   |
| 小紅書        | ≥4   |

### Step 5 — 產出報告

用以下模板回覆用戶（繁體中文）。若用戶話「copy 俾 Hermes」，整段用 markdown code block 輸出。

```markdown
# Mindful Canvas 盤點報告 — [日期]

## 現況一句話

[版本 + 可唔可以校內測試]

## 已完成（自上次以來）

- …

## 未完成 / 落差

| 項目 | 規格 | 現況 | 優先 |
| ---- | ---- | ---- | ---- |

## 建議下一步（排序）

1. …
2. …

## Refine（可改進，非阻塞）

- …

## Automations 建議

- [每日] …
- [每週五] …

## 給 Hermes 的第一條指令

> 「…」
```

## Automations 建議庫（按情境選）

用戶要設 Cursor Automation 時，讀 [`automate` skill](file:///Users/newmac/.cursor/skills-cursor/automate/SKILL.md) 並用 plain language 起草。

| 節奏       | 觸發                | Agent 做乜                                  |
| ---------- | ------------------- | ------------------------------------------- |
| 每日放學後 | cron 週一至五 17:00 | 跑本 Skill 精簡版 → 提醒 Tim 填「今日觀察」 |
| 週五復盤   | cron 週五 18:00     | 讀 FEEDBACK + 建議更新 FEEDBACK.md 條目     |
| push 後    | git push main       | 檢查 index.html 有冇破壞安全網 / manifest   |
| 校內測試後 | 手動 / webhook      | 從 sessions JSON 生成週報                   |

## Research 模式

用戶話「research」時，額外搜尋：

- 競品：Calm/Headspace 留存痛點（見 Plan v4）
- 技術：iOS Web Speech 限制、學校 WiFi 封鎖 Pages 備案
- 內容：REFERENCES/christy-noverba.md、love-psychology-buddhism.md

Research 結果放報告「Research」一節，每點附**對產品嘅一個具體建議**。

## Refine 模式

用戶話「refine」時，只提案**最小 diff**：

- 優先：安全、數據、校內測試阻塞項
- 其次：UX 文案、效能
- 唔做：v5 全量模組化（除非 index.html >1500 行且改動頻繁）

改前先問：「而家係校內測試前定已有學生反饋？」

## 版本發布規則

改動產品時同步：

1. `CHANGELOG.md` 加一行
2. `CODEX_CONTEXT.md` 若架構變
3. Terms 內版本號（index.html）
4. `sw.js` CACHE 常數 bump（若快取策略變）

## 額外資源

- 完整檢查清單：[audit-checklist.md](audit-checklist.md)
- 機械檢查：[scripts/audit.sh](scripts/audit.sh)
