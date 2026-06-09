# Mindful Canvas v2 視覺規格

> **Cursor 固定 spec** — 做 v2 視覺、沉浸感、畫布效果時，以此文件為準。  
> 產品功能規格仍以 [`PLAN.md`](PLAN.md) v6.0 為準；本文件專注 **Design Language + 畫面效果 + 實作約束**。  
> 最後更新：2026-06-08

---

## 一、為什麼要做 v2

v1 功能齊全，但視覺上仍似「深色畫布 + 實色線條 + 工具列」。  
**目標：** 學生打開 App **3 秒內**有「進入一個有空氣感空間」嘅感覺；落筆時似 **墨、光、呼吸**，唔似 MS Paint。

**成功標準（主觀但可驗）：**

- 創作者（Tim）自己會想打開用
- 第一筆有「劃過光／墨暈開」嘅觸感
- UI 唔搶畫面，沉浸優先於工具感

---

## 二、產品現況（實作真相，2026-06-08）

| 項目      | 現況                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| 入口      | 雙模式：**自由畫布** / **禪繞唐卡**（PLAN 仍寫 8 場景，代碼已改）                     |
| 架構      | 單檔 [`index.html`](index.html) + [`manifest.json`](manifest.json) + [`sw.js`](sw.js) |
| 語音      | **已移除**                                                                            |
| 儲存      | 卡片「儲存卡片」PNG；禪繞完成作品 **不含** mandala 引導線                             |
| 音效      | 兩模式均有 Web Audio 環境音 + 落筆音效                                                |
| 8 場景 JS | 題字庫／解讀仍保留，首頁唔顯示                                                        |

---

## 三、Design Language — 墨 · 光 · 息

| 隱喻   | 視覺語言                           | 禁止                          |
| ------ | ---------------------------------- | ----------------------------- |
| **墨** | 筆觸邊緣毛、向紙面暈開；和紙質底   | 實色硬邊、純平 `#0d1117` 死底 |
| **光** | 指尖光尾、mandala 高光、歡迎頁光霧 | 成屏金色、商業療癒 slogan UI  |
| **息** | 全畫面極淡呼吸脈動；線寬／音量微變 | 明顯 lag（>200ms 延遲感）     |
| **空** | 留白、邊緣 vignette、中央略亮      | 塞滿控件、工具列搶眼          |

### 品牌色用法（[`BRAND.md`](BRAND.md)）

```css
--bg: #1a1a2e;
--surface: #16213e;
--accent: #e2b55a; /* 光尾、高光、標題 — 唔好濫用 */
--text: #e8e8e8;
--text-muted: #a0a0b0;
```

禪意八色（用戶筆觸）：見 PLAN §4.2 / `COLORS` 陣列。

### 語氣（視覺亦要配合）

- 溫和、詩意、港式中文
- **避免：** 商業療癒系、宗教說教、醫療語氣

---

## 四、3 秒法則（歡迎頁 → 畫布）

```
0.0s  背景有流動光霧 + 墨點暈染（唔係死黑）
0.5s  標題「覺知畫布」浮現
1.5s  兩個 mode 有微動預覽（自由=墨流；禪繞=綻放）
3.0s  用家想撳入去
```

進入畫布：**0.4–0.7s** 由暗到亮（`canvas-enter`），唔好「啪」一聲跳轉。

---

## 五、分階段路線圖

| Phase | 內容                                         | 狀態      |
| ----- | -------------------------------------------- | --------- |
| **0** | 歡迎頁氛圍、mode 預覽、畫布入場過渡          | ✅ 已實作 |
| **1** | 光尾軌跡、粒子升級、禪繞離屏留痕層           | ✅ 已實作 |
| **2** | 水墨暈染（離屏 stamp，禁全屏 blur）          | ✅ 已實作 |
| **3** | 呼吸節奏（音畫同步、線寬、背景微脈動）       | ✅ 已實作 |
| **4** | UI 沉浸收斂（色條收起、卡片出場儀式）        | ✅ 已實作 |
| **5** | 規格同步（PLAN / CHANGELOG / CODEX_CONTEXT） | ✅ 已實作 |

**Cursor 接下一棒時：** 預設由 **Phase 3** 開始，除非用戶指定其他 Phase。

---

## 六、PLAN §9.2 四效果 — 規格與狀態

### A. 水墨暈染跟隨 — ✅ Phase 2

- 手指劃過處墨色慢暈開，邊緣毛邊
- **禁止** 每幀對全畫布 `shadowBlur`（mobile 會跌 fps）
- **建議：** 64×64 離屏 stamp，3–5 層遞減 alpha 同心圓；每 100–200ms composite
- 自由畫布：與 **無常淡化** 聯動（暈染一齊淡）

### B. 光尾跟隨 — ✅ Phase 1（可再 polish）

- `TrailBuffer`：最近 ~20 點，漸細漸淡
- 顏色：自由=當前色；禪繞=當前痕跡色 + `lighter`
- **待加：** 尾長隨 pointer 速度變化（快=長）

### C. 粉塵粒子 — ✅ Phase 1（可再 polish）

- 圓形、3–5 粒/次、輕重力、生命 ~1–2s
- 用當前筆色；上限 ~200，超則 trim
- Toggle：`#particleToggle`（禪繞模式粒子恆開）

### D. 呼吸節奏 — ✅ Phase 3

- 建議週期：4s 吸 → 4s 呼（sin 波即可，唔使複雜 4-6-4）
- 影響：背景亮度 ±3%、線寬 ±15%、環境音量 ±5%
- 視覺延遲：**80–150ms**（唔好用 PLAN 原文 300ms，會似 lag）
- Zen overlay hint 可隨呼吸微動

---

## 七、雙模式視覺差異

|            | 自由畫布               | 禪繞唐卡                                     |
| ---------- | ---------------------- | -------------------------------------------- |
| 氛圍       | 開放、流動、無常       | 結構、節奏、共生                             |
| 底層       | 和紙 + 淡化筆觸        | 深色底 + **程式 mandala**（僅體驗用）        |
| 用家留痕   | `strokeHistory` + 淡化 | `zenTouchStrokes` → **`zenTraceLayer` 離屏** |
| 完成作品   | 只含用家筆觸           | 只含用家色彩痕跡，**唔含** mandala           |
| 主效果優先 | 水墨 + 光尾 + 淡化     | 光尾 + 光暈 ripple + 呼吸                    |

### 禪繞留痕（重要，勿破壞）

- 每筆結束 → `persistZenStroke()` 寫入 `zenTraceLayer`
- 每幀：`drawZenMandala` → `drawImage(zenTraceLayer)` → 當前筆 + 光尾 → 粒子
- **唔好** 每幀只靠 `zenTouchStrokes` 重畫全部（曾導致第二筆唔顯示）

### 觸控輸入（重要，勿破壞）

- 使用 **Pointer Events** + `setPointerCapture`
- `onPointerDown`：若已有 `activePointerId` 且未結束 → `commitStroke()` + `releaseActivePointer()`
- 必須監聽：`pointerdown/move/up/cancel` + **`lostpointercapture`**
- **唔好** 混用 touch + mouse 雙套 listener

---

## 八、Canvas 渲染架構

### 自由畫布（`animateFreeFrame`）

```
1. clearRect
2. redrawWithFade()          // strokeHistory + 無常
3. 當前筆觸 + strokeTrail   // 光尾
4. drawParticles()
```

### 禪繞唐卡（`animateZenFrame`）

```
1. fillRect 底色
2. drawZenMandala(progress)  // 引導層，export 時跳過
3. drawImage(zenTraceLayer)   // 持久用家痕跡
4. 當前筆 + strokeTrail
5. zenRipples + particles
6. 計時 / finishZenSession
```

### 歡迎頁（僅 `#welcome.active`）

- `#welcomeAmbient`：光霧 + `welcomeInkDots`
- `#previewFree` / `#previewZen`：mode 卡片微動畫
- 離開 welcome → `stopWelcomeAmbient()` 停 rAF

---

## 九、關鍵程式對照（index.html）

| 符號                                     | 用途                               |
| ---------------------------------------- | ---------------------------------- |
| `TrailBuffer`                            | 光尾點列                           |
| `strokeTrail`                            | 全域光尾實例                       |
| `getInkStamp()` / `drawInkAlongPoints()` | 水墨暈染 stamp                     |
| `drawPaperBackground()`                  | 和紙質底 + vignette                |
| `Particle`                               | 圓形飄散粒子                       |
| `zenTraceLayer` / `zenTraceCtx`          | 禪繞持久留痕離屏                   |
| `persistZenStroke()`                     | 單筆寫入離屏層                     |
| `drawZenTraceStroke()`                   | 留痕繪製（`source-over` + shadow） |
| `renderPureArtwork()`                    | 卡片/下載用純用家作品              |
| `createMeditationMusic()`                | 環境音                             |
| `startWelcomeAmbient()`                  | Phase 0 歡迎動畫                   |
| `enterCanvasScreen()`                    | 畫布入場 class `canvas-enter`      |
| `onPointerDown/Move/Up`                  | 統一繪畫輸入                       |

---

## 十、技術約束（必守）

1. **零依賴** — 僅 HTML/CSS/Vanilla JS，唔引入 npm / CDN 庫
2. **單檔優先** — 邏輯留 `index.html`；超 ~2500 行先考慮拆 `js/visual/`
3. **60fps mobile** — 離屏 blur 節制；粒子有上限；welcome 動畫離開即停
4. **唔破壞** — `checkSafety()`、品牌色、非醫療免責、localStorage schema
5. **唔改** — 解讀引擎、反饋問卷、教師匯出（除非用戶另提）
6. **PWA** — 改動後 bump `sw.js` 的 `CACHE` 版本字串
7. **效能模式** — 將來可加 toggle；預設開沉浸效果

---

## 十一、Phase 2–4 驗收清單（Cursor 做完要對）

### Phase 2 — 水墨

- [x] 落筆見到邊緣暈開，唔係硬線
- [x] 離屏 64×64 stamp，禁全屏 shadowBlur
- [x] 自由畫布淡化時暈染一齊變淡
- [x] 禪繞留痕層行為不變（`zenTraceLayer` + ink stamp）
- [ ] iPhone / 中階 Android 實機主觀流暢（待校內驗證）

### Phase 3 — 呼吸

- [x] 不畫時仍感到畫面「活著」（極淡脈動）
- [x] 線寬變化唔突兀
- [x] 音量能聽出但唔搶戲

### Phase 4 — UI

- [x] 色條可收起，畫布佔比 >70% 視覺
- [x] 卡片出場：畫作 fade + 題字延遲浮現
- [x] 歡迎頁與畫布風格一致

---

## 十二、已知問題與修復紀錄

| 問題             | 原因                                  | 修復                                              |
| ---------------- | ------------------------------------- | ------------------------------------------------- |
| 禪繞第二筆畫唔到 | `activePointerId` 卡住 / 幽靈事件     | Pointer 統一 + down 時清理 + `lostpointercapture` |
| 第二筆痕跡唔顯示 | 每幀重畫 + `lighter` 合成不穩         | `zenTraceLayer` 離屏持久層                        |
| 提早完成禪繞     | `zenStartTime === 0` 時 progress 誤判 | 僅 `zenStartTime` 有效時才 `finishZenSession`     |

**改觸控或禪繞渲染前必讀此表。**

---

## 十三、Cursor 工作方式

### 開工前讀

1. 本文件 `V2_VISUAL_SPEC.md`
2. [`CODEX_CONTEXT.md`](CODEX_CONTEXT.md) — 不可改規則
3. [`BRAND.md`](BRAND.md) — 色與語氣
4. 相關函式周邊代碼（唔好只 grep 片段）

### 建議 commit 訊息前綴

- `feat(visual):` — 新視覺效果
- `fix(zen-touch):` — 禪繞觸控/留痕
- `perf(canvas):` — 效能

### 盤點時

用 `.cursor/skills/mindful-canvas-ops/SKILL.md`，對照本文件 Phase 狀態更新報告。

### 典型 prompt 範本

```
做 Mindful Canvas v2 Phase 2：水墨暈染。
跟 V2_VISUAL_SPEC.md，零依賴，保持單檔。
勿破壞 zenTraceLayer 與 Pointer 輸入。
做完對照 Phase 2 驗收清單。
```

---

## 十四、與 PLAN.md 的關係

| 文件                | 角色                                        |
| ------------------- | ------------------------------------------- |
| `PLAN.md`           | 產品全規格（場景、解讀、條款…）             |
| `V2_VISUAL_SPEC.md` | **視覺與沉浸感** 專用，更新較快             |
| `CODEX_CONTEXT.md`  | Agent 快速上下文；Phase 完成後應同步 §待 v2 |

**PLAN §9.2 仍有效**，但以本文件 Phase 狀態為實作進度真相。  
PLAN 寫 v2.0「待定」— 實際以 Phase 0/1 已上線代碼為準逐步推進。

---

## 十五、版本紀錄

| 日期       | 變更                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 2026-06-08 | 初版：Design Language、Phase 0–5、雙模式、已實作 TrailBuffer / zenTraceLayer / Welcome Ambient |
| 2026-06-08 | Phase 2：水墨 stamp、和紙底、與無常淡化聯動                                                    |
| 2026-06-09 | Phase 3–4：呼吸節奏、色條收合、卡片出場；Phase 5 文件同步                                      |

---

_Mindful Canvas™ 覺知畫布 · ZenArt Lab · © 2026 Tim Yuen_
