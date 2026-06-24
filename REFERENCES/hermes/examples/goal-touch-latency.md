# /goal 範例 — 手機畫線延遲

**觸發**：`/goal 手機上畫線有延遲，整順佢`

---

## Step 0 — Provenance

- 來源：**③ 用戶報告**（校內試用 Safari 拖線有拖影）或 **① grep**（`smoothPoint` / rAF 路徑）
- 若只有「覺得慢」無裝置 → 先補 Verification 計劃，唔改 code

---

## 01 Outcome

手機觸控畫線 input→render 體感 &lt; 50ms；桌面 Chrome 不退步；禪繞 / 自由模式均適用。

## 02 Verification

1. iPhone Safari 實測拖線 10 次，無明顯拖影
2. Chrome DevTools Performance：pointermove → 下一幀 canvas 繪製
3. `npm run validate` 通過
4. `sw.js` bump `zen-vNN`，`?v=zen-vNN` 確認無舊 cache

## 03 Constraints

- 只准改：pointer handler、`smoothPoint`、rAF 繪製節流相關
- 自動注入凍結區：安全網、品牌色、zenTraceLayer 架構、唔加功能
- 唔准郁：UI 配色、工具列、i18n 文案、GA、manifest

## 04 Iteration Policy

| 輪次 | 改動 | 量度 | 假設 |
| ---- | ---- | ---- | ---- |
| 1 | 記錄 baseline ms | Safari 拖線 | 建立對照 |
| 2 | … | … | … |

## 05 Error Handling

若 2 輪後仍 &gt; 50ms：停，回報試過咩、瓶頸（repaint / throttle / DPR）、要否降 smooth window。

---

## Rubric 自評（Fix 後先填 `[x]`）

### mindful-canvas.md

- [ ] 維度 1 設計品質
- [ ] 維度 2 原創性
- [ ] 維度 3 SW bump + validate + responsive
- [ ] 維度 4 可用性
- [ ] 維度 4b 無 bait

### mindful-retention.md

- ~~N/A~~（本 goal 唔加留存機制）
