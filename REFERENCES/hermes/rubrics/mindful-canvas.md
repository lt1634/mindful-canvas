# Rubric — Mindful Canvas PWA

> `/goal` 觸及本 repo 時必載入。產品定位：**情緒調節 mindfulness app**（畫 + 題字），唔係生產力繪圖工具。

## 維度 1：設計品質

- **Pass**：主色嚴守 `#1a1a2e`（深底）+ `#e2b55a`（金點綴）；calm / mindful，唔花。
- **Fail**：搶眼非品牌色；視覺嘈雜；破壞和紙／水墨氛圍。

## 維度 2：原創性

- **Pass**：有意識設計語言（showcase 卡、墨流步驟、禪繞引導）；唔似 default UI kit。
- **Fail**：一睇就係未改過嘅 framework 預設。

## 維度 3：技術執行（PWA 命根）

- **Pass**：
  1. 改動後 **`sw.js` CACHE bump** + `index.html` / `js/app.js` / `js/gallery.js` / `src/logic.js` 版本 query 同步
  2. offline 可開、可畫（network-first 對 html/js/css）
  3. `npm run validate` 通過；實機 console 無新 error
  4. 手機 + desktop responsive（E2E mobile viewport）
  5. CI deploy 含 `src/i18n/`（若改 i18n）
- **Fail**：漏 bump SW（用戶食舊 cache）；validate 失敗；手機爆版；漏 deploy 路徑。

## 維度 4：可用性

- **Pass**：工具揾得到；觸控順；首次用者睇得明；**中英切換**唔破壞進行中創作。
- **Fail**：觸控明顯延遲；功能藏到揾唔到；切語言清空畫布。

## 維度 4b：Mindful 定位（情緒安全）

- **Pass**：操作令人平靜；唔催谷；唔製造焦慮（無 streak、無紅點、無「你 X 日冇嚟」）。
- **Fail**：engagement-bait（連續打卡、進度壓力、催 share）。詳見 [`mindful-retention-rubric.md`](mindful-retention-rubric.md)。

## 部署 Gate（必過）

- GitHub Pages：`https://lt1634.github.io/mindful-canvas/`
- 任何產品改動 → CHANGELOG 一行 + cache 版本

## 凍結清單（Constraints 自動注入）

| 項目 | 驗證 |
| ---- | ---- |
| `checkSafety()` 模板 + AI 一致 | `src/logic.js` + `generateInterpretationAI` |
| 熱線 2382 0000 / 2389 2222 | 安全網文案 |
| zenTraceLayer + Pointer Events | 唔改輸入模型 |
| 墨流 Canvas 2D | 唔引入 WebGL |
| GA4 匿名事件 | 隱私條款 §5 對齊 |
