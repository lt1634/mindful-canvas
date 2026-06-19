# Logo Mark — 起格規格

> Mindful Canvas™ / 覺知畫布 · ZenArt Lab  
> 向量檔：`logo-mark.svg`（成品）、`logo-mark-grid.svg`（起格參考）

## 構圖

| 項目         | 數值 |
| ------------ | ---- |
| 中心圓半徑 R | 20.5 |
| 灰斜線線寬   | 4    |
| 金斜線線寬   | 5.5  |

| 元素       | 色碼      | 說明                   |
| ---------- | --------- | ---------------------- |
| 背景       | **透明**  | 無底色，疊於頁面背景上 |
| 後景線     | `#6e6e7a` | 灰對角                 |
| **中心圓** | `#f0c96e` | 較亮描邊金（覺知核心） |
| **前景線** | `#d4a84f` | 較深琥珀金（筆觸）     |

## 意象

- **圓**：覺知、圓滿、當下
- **十字對角**：度量起格（Tikse）、空間秩序
- **前後兩色線**：層次與深度（灰為底稿，金為筆觸）

## 匯出

```bash
# 需要 raster icon 時（需安裝 librsvg 或 Inkscape）
rsvg-convert -w 512 -h 512 assets/logo-mark.svg -o icon-512.png
rsvg-convert -w 192 -h 192 assets/logo-mark.svg -o icon-192.png
```

## 使用

- App icon、favicon、社交頭像：使用 `logo-mark.svg`
- 設計延伸、印刷起格：使用 `logo-mark-grid.svg`
- 四周留白 ≥ 標誌高度的 50%
