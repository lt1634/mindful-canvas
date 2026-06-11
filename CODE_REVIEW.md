# Mindful Canvas — Code Review & Testing 流程

## 快速命令

```bash
# 開發
npm run dev              # 啟動本地 server (port 8888)

# 代碼質量
npm run lint             # ESLint 檢查
npm run lint:fix         # 自動修復
npm run format           # Prettier 格式化
npm run format:check     # 檢查格式

# 測試
npm run test             # 單元測試 (Vitest)
npm run test:watch       # 監聽模式
npm run test:coverage    # 覆蓋率報告
npm run test:e2e         # E2E 測試 (Playwright)
npm run test:all         # 全部測試

# 一步到位
npm run validate         # format:check + lint + test

# 首次 E2E 前（本機）
npx playwright install chromium
```

## 流程

### 1. 日常開發

```bash
# 改完代碼後
npm run validate         # 確認冇問題
git add -A
git commit -m "feat: xxx"  # pre-commit hook 自動跑 lint + test
```

### 2. Code Review（Cursor subagent）

在 Cursor 對話中說：

```
review 最近 commit
```

或

```
review PR #xxx
```

Agent 會：

- 撈出 git diff
- 派獨立 reviewer subagent 審查（安全 + 邏輯 + 建議）
- 對照 `CODE_REVIEW.md` checklist 輸出結果

### 3. CI/CD（GitHub Actions）

- **Push to main** → 自動跑 lint + unit test + E2E test → 部署到 GitHub Pages
- **PR to main** → 跑全部測試，通過先可以 merge

## 測試結構

```
tests/
├── unit/
│   └── logic.test.js      # 純邏輯函數測試（29 tests）
└── e2e/
    └── app.spec.js         # 瀏覽器端到端測試（6 tests × 2 viewports）
```

## 新增測試

### 單元測試（在 `src/logic.js` 加新函數後）

```bash
# 1. 在 src/logic.js 寫函數
# 2. 在 tests/unit/logic.test.js 加測試
npm run test             # 確認通過
```

### E2E 測試（加新功能後）

```bash
# 在 tests/e2e/app.spec.js 加場景
npm run test:e2e         # 確認通過
```

## Pre-commit Hook

每次 `git commit` 自動跑：

1. **lint-staged** — 只检查 staged 檔案（ESLint + Prettier）
2. **vitest** — 跑全部單元測試

如果失敗，commit 會被阻止。

## Code Review Checklist

Reviewer subagent 會檢查：

- [ ] 冇硬編碼 secrets / API keys
- [ ] 用戶輸入有驗證
- [ ] 外部調用有 error handling
- [ ] 冇 debug print / console.log 殘留
- [ ] 冇註釋掉嘅代碼
- [ ] 新代碼有測試
- [ ] 邏輯正確（條件、邊界、race condition）
- [ ] 安全問題（XSS、注入、路徑穿越）

## File Structure

```
mindful-canvas/
├── .github/workflows/ci.yml    # CI/CD pipeline
├── .husky/pre-commit           # Pre-commit hook
├── src/
│   └── logic.js                # 核心邏輯（可測試）
├── tests/
│   ├── unit/logic.test.js      # 單元測試
│   └── e2e/app.spec.js         # E2E 測試
├── index.html                  # 主應用（UI）
├── eslint.config.js            # ESLint 配置
├── vitest.config.js            # Vitest 配置
├── playwright.config.js        # Playwright 配置
├── .prettierrc                 # Prettier 配置
└── package.json                # npm scripts
```

## Cursor Automations

### 週五復盤（建議新增）

| 欄位       | 設定                                                                |
| ---------- | ------------------------------------------------------------------- |
| 名稱       | 覺知畫布 · 週五一人公司復盤                                         |
| Trigger    | Every Friday at 17:00 GMT+8                                         |
| Repository | mindful-canvas / main                                               |
| Run on     | **Local**                                                           |
| 工具       | Memories + Terminal + Read/Edit files（可選 Web Search，最多 1 次） |

Instructions 全文見下方「週五復盤 Instructions」區塊，複製貼入 Automation 大框。

### 每日盤點（已有）

Trigger：Every day 09:00 GMT+8。Instructions 同每日盤點 Automation 設定一致。

---

### 週五復盤 Instructions（複製貼上）

```
你是 Mindful Canvas™ 週五復盤 Agent。Repo：mindful-canvas，分支 main。Tim 係創作者兼教師。目標：總結本週、對齊 HABITS KPI、規劃下週 3 件具體事。用繁體中文。禁止自動 commit / push。

## 現況基線
- v2.0 已上線；雙模式；CI push main 四關（lint/unit/E2E/Pages）
- 線上：https://lt1634.github.io/mindful-canvas/
- 數據：長按歡迎頁「覺知畫布」3 秒匯出 mindful-canvas-sessions.json

## 每次必做

1. 讀 HABITS.md（§二週五復盤、§十 KPI）、FEEDBACK.md、CHANGELOG.md 最近條目
2. 讀 git log --since="7 days ago" --oneline；git status
3. 若有 node_modules：npm run validate；否則寫「待本機驗證」
4. 檢查 GitHub Actions 本週 main runs（success/failure）
5. 讀 FEEDBACK.md：匯總表、反饋條目數；無數據寫「待校內測試」

## HABITS KPI（§十）
| KPI | 目標 | 本週 |
| 學生體驗次數 | ≥3 | 從 FEEDBACK/條目估 |
| FEEDBACK 筆數 | ≥10 累計 | 數 FEEDBACK.md |
| MVP 改版 | ≥2 累計 | 數 CHANGELOG v2+ |
| 小紅書 | ≥4 累計 | 待 Tim 填 |
| 每日最低行動 | ≥80% | 待 Tim 填 |

## 本週產品檢查（輕量）
- 本週 commit 有無觸碰：checkSafety、zenTraceLayer、Pointer Events
- src/logic.js 與 index.html 是否仍同步
- 有無未解 CI failure

## Refine（週五只做文檔，最多改 1 檔）
允許：更新 FEEDBACK.md 匯總表、補 CHANGELOG 草稿條目、HABITS 週記模板
禁止：改 index.html 邏輯、大範圍重構
若 Tim 提供 sessions JSON 內容，可草擬 FEEDBACK 條目（唔自動 commit）

## Research（可選，最多 1 次）
主題：校內推廣正念工具、學生留存、教師帶領 3–5 分鐘流程
每點一句產品行動

## 輸出格式

# Mindful Canvas 週五復盤 — [日期]

## 本週一句話
[做咗乜 + 最大收穫或阻塞]

## KPI 進度
| 指標 | 目標 | 現況 | 差距 |

## 本週 commit / 部署摘要
- …

## 學生與反饋（FEEDBACK）
- session 數、開心指數、會再玩、常見意見
- 若無數據：下週如何取得（QR、課堂 3 人試用）

## 做得好的
- …

## 要改進的
- …

## 下週 3 件具體事（SMART）
1. …
2. …
3. …

## 給 Tim 的週一開場白
> 「…」（可直接複製）

週日休息，唔排工作。報告簡潔，唔堆砌。
```
