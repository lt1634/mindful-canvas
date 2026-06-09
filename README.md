# 覺知畫布 Mindful Canvas™

> 用觸覺繪畫與心靈解讀，幫學生用「畫」代替「講」來處理壓力。  
> ZenArt Lab · 零依賴 PWA · 完全在裝置上運行

**線上體驗：** [https://lt1634.github.io/mindful-canvas/](https://lt1634.github.io/mindful-canvas/)

---

## 係乜

Mindful Canvas 係一個給中學生的 **5 分鐘情緒出口**：

- 用手指在畫布上表達，唔使畫得好
- 完成後生成 **心靈卡片**（畫作 + 禪意題字 + 心境解讀）
- 資料留在本機，v1 **唔上雲**

唔係醫療或心理治療工具。嚴重情緒困擾請聯絡專業人士（香港 24 小時生命熱線：2382 0000）。

---

## 兩種模式

| 模式         | 說明                                              | 時長                      |
| ------------ | ------------------------------------------------- | ------------------------- |
| **自由畫布** | 自由塗抹，筆觸會慢慢消失（無常）；水墨暈染 + 光尾 | 約 5 分鐘，自行按「完成」 |
| **禪繞唐卡** | 禪意圖案漸現 + 柔和音樂；輕觸留低色彩痕跡         | 約 1 分鐘，自動完成       |

---

## 功能摘要

- 觸控繪畫（Pointer Events，支援手機／平板）
- 禪意調色盤、橡皮擦（自由畫布）
- 環境音樂 + 筆觸質感音效
- 模板解讀引擎（可選本機 Ollama）
- 危機關鍵詞安全網
- 完成後儲存卡片 PNG
- 簡短反饋問卷（localStorage）
- 教師匯出：長按歡迎頁「覺知畫布」標題 3 秒

---

## 技術

| 項目       | 說明                                           |
| ---------- | ---------------------------------------------- |
| 架構       | 單檔 `index.html` + `manifest.json` + `sw.js`  |
| 運行時依賴 | **零 npm**，Vanilla HTML / CSS / JavaScript    |
| 開發工具   | ESLint、Prettier、Vitest、Playwright（見下方） |
| 繪圖       | Canvas + requestAnimationFrame                 |
| 儲存       | `localStorage`（匿名 session）                 |
| 部署       | GitHub Pages 或本地 HTTP server                |

### v2 視覺

歡迎頁氛圍、光尾、水墨、呼吸節奏、UI 沉浸 — 詳見 [`V2_VISUAL_SPEC.md`](V2_VISUAL_SPEC.md)。

---

## 本地運行

```bash
cd mindful-canvas
npm run dev          # 或 python3 -m http.server 8888
```

瀏覽器開啟 `http://localhost:8888`

手機同 WiFi 測試：用電腦 IP，例如 `http://192.168.x.x:8080`（IP 變咗要更新 QR）。

校內正式測試建議用 **GitHub Pages**，唔使依賴本地 IP。詳見 [`DEPLOY.md`](DEPLOY.md)。

---

## 測試與 Code Review

```bash
npm ci                 # 首次安裝開發依賴
npm run validate       # format + lint + 29 單元測試
npx playwright install chromium   # 首次 E2E 前
npm run test:all       # lint + unit + E2E（12 場景 × Desktop/Mobile）
```

完整流程見 [`CODE_REVIEW.md`](CODE_REVIEW.md)。Push 到 `main` 時 GitHub Actions 會自動跑 lint → unit → E2E → 部署 Pages。

---

## 專案結構

```
mindful-canvas/
├── index.html              # 完整 App
├── src/logic.js            # 可測試純邏輯
├── tests/
│   ├── unit/logic.test.js  # 29 單元測試
│   └── e2e/app.spec.js     # 12 E2E（6 × 2 viewports）
├── .github/workflows/ci.yml
├── manifest.json           # PWA
├── sw.js                   # Service Worker
├── CODE_REVIEW.md          # 測試與審查流程
├── V2_VISUAL_SPEC.md       # v2 視覺規格
├── PLAN.md                 # 產品規格 v6.0
└── ...
```

---

## 文件

| 文件                                   | 用途                  |
| -------------------------------------- | --------------------- |
| [PLAN.md](PLAN.md)                     | 產品與功能規格        |
| [V2_VISUAL_SPEC.md](V2_VISUAL_SPEC.md) | 沉浸感與畫布視覺      |
| [BRAND.md](BRAND.md)                   | 品牌色、語氣          |
| [DEPLOY.md](DEPLOY.md)                 | GitHub Pages、QR、PWA |
| [CODEX_CONTEXT.md](CODEX_CONTEXT.md)   | 給 Coding Agent 接手  |

---

## 版權

© 2026 ZenArt Lab. All rights reserved.  
Mindful Canvas™ / 覺知畫布™ 為 ZenArt Lab 商標。

僅供學校教學及個人正念練習用途。使用條款見 App 內「使用條款」。

---

## 開發備註

- 規格真相：`PLAN.md`；視覺真相：`V2_VISUAL_SPEC.md`
- 盤點專案：`.cursor/skills/mindful-canvas-ops/SKILL.md`
- 改動後記得 bump `sw.js` 內 `CACHE` 版本，方便 PWA 更新
