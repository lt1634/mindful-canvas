# Research：日式墨流し（Suminagashi）與數學墨流

> 用途：墨流畫布模式（v2.1）嘅技術依據與參考來源
> 日期：2026-06-12

---

## 一、靈感來源

| 來源                                                                             | 重點                                                                                                 |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [AIPostHub 墨流し教學](https://www.aiposthub.com/ai-suminagashi-webgl-tutorial/) | 一段 prompt 生成單檔 WebGL 流體水墨頁：滴墨暈開、拖曳攪水、和紙質感、自動演出、洗い流す              |
| [Fable 5 案例庫](https://eugeneintw.github.io/fable5-cases/)                     | 案例「墨水流體交融的視覺演出」（@hayashimon1，12.4k 讚）：WebGL Navier-Stokes 式流體混色，藝術裝置級 |

兩者都用 **WebGL + GPU 流體模擬**。Mindful Canvas 因為要照顧校內舊 Android，改用下面嘅 **數學墨流** 方案。

## 二、數學墨流（Mathematical Marbling）

依據：Lu, Jin, Zhao, Mao（2012）"Mathematical Marbling"（IEEE CG&A）；
Aubrey Jaffer [Mathematical Marbling](https://people.csail.mit.edu/jaffer/Marbling/)；
Amanda Ghassaei [Digital Marbling](https://blog.amandaghassaei.com/2022/10/25/digital-marbling/)。

核心思想：墨流變形係 **閉式幾何變換（homeomorphism）**，唔使流體解算器。
墨用**多邊形頂點列**表示，每次操作對所有頂點施一個變換，Canvas 2D `fill()` 渲染。

### 2.1 滴墨（保面積擴張）

新墨滴中心 C、半徑 r。圈外所有舊頂點 P 沿徑向推開：

```
P' = C + (P − C) · sqrt(1 + r² / |P−C|²)
```

性質：保面積——舊墨環被推開時自然「變薄」，多滴形成同心環（suminagashi 經典紋）。

### 2.2 攪水（tine line / 梳線）

拖曳方向單位向量 M，線上一點 B，N 為垂直單位向量。每點 P 到線距離
`d = |(P−B)·N|`，位移：

```
P' = P + z · u^d · M      （0 < u < 1）
```

- `z`：最大位移（拖曳速度可調）
- `u`：銳利度（越接近 1 暈得越寬）
- 沿線等距 cohort 平移 → 不壓縮、不膨脹

### 2.3 實作要點

- 每滴墨 = 一個多邊形（64–128 頂點圓），新滴疊喺舊滴上面
- 變換只郁頂點，渲染一律 `beginPath → fill`，無 per-pixel 運算
- 頂點過疏時插值補點（兩點距離 > threshold 先插）避免變換後出現折角
- 上限控制：墨滴數（~60）同每滴頂點數（~256），舊滴可合併/淘汰
- 60fps 唔使重算：只有互動（滴墨/拖曳）先變換，閒置只重繪

## 三、Mindful Canvas 嘅取捨

| 取捨                   | 決定                      | 原因                                               |
| ---------------------- | ------------------------- | -------------------------------------------------- |
| WebGL 流體 vs 數學墨流 | **數學墨流（Canvas 2D）** | 校內舊機跑得順；單檔零依賴；風格更似真 suminagashi |
| 即時模擬 vs 操作驅動   | **操作驅動**              | 點先滴墨、拖先攪水；閒置可慢速自動滴墨（呼吸節奏） |
| 取代自由畫布 vs 並存   | **並存（第三模式）**      | 自由畫布筆觸留痕係情緒出口；墨流係沉浸玩水         |

## 四、參考 prompt（fable5-cases 重建版，存檔備用）

> Build an interactive web page where colored inks dissolve and blend into each other like real fluids: mouse drag injects ink, colors swirl and diffuse with fluid-dynamics-like motion (Navier-Stokes style or convincing approximation), elegant minimal UI, runs smoothly at 60fps in a single HTML file with WebGL. Aim for an art-installation level of polish.

（出處：https://x.com/hayashimon1/status/2064658158698782873）
