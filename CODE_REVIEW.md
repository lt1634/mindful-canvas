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
