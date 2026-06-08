# Mindful Canvas 部署指引

## 本地測試

```bash
cd /Users/newmac/Desktop/mindful-canvas
python3 -m http.server 8080
```

手機與電腦同一 WiFi，開啟 `http://<你的電腦IP>:8080`

## GitHub Pages（推薦校內 QR 測試）

### 1. 建立 GitHub 倉庫

```bash
cd /Users/newmac/Desktop/mindful-canvas
git init   # 若尚未初始化
git add index.html manifest.json sw.js icon-192.png icon-512.png CHANGELOG.md FEEDBACK.md CODEX_CONTEXT.md DEPLOY.md PLAN.md BRAND.md HABITS.md
git commit -m "Mindful Canvas v1.4 — 校內測試就緒"
```

在 GitHub 建立新 repo（例如 `mindful-canvas`），然後：

```bash
git remote add origin https://github.com/<你的用戶名>/mindful-canvas.git
git branch -M main
git push -u origin main
```

### 2. 啟用 Pages

1. GitHub repo → **Settings** → **Pages**
2. Source：**Deploy from a branch**
3. Branch：`main` / `/ (root)`
4. Save

幾分鐘後網址為：`https://<用戶名>.github.io/mindful-canvas/`

### 3. QR Code

用任意 QR 產生器，內容填入 Pages URL。學生掃碼即用。

建議列印 A4：標題「覺知畫布 · 5 分鐘情緒出口」+ QR + 「非醫療工具，嚴重困擾請找老師」

## 學校內網備案

若 GitHub Pages 被學校 WiFi 封鎖：

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

在學校內網機器運行，QR 指向內網 IP。

## PWA 安裝

- Android Chrome：選單 →「加到主畫面」
- iOS Safari：分享 →「加入主畫面」
- 需 HTTPS（GitHub Pages 已滿足）

## 檢查清單

- [ ] 8 場景可選、可畫、可完成
- [ ] 反饋問卷可提交
- [ ] 長按標題 3 秒可匯出 JSON
- [ ] 離線第二次開啟仍可用（Service Worker）
- [ ] 圖示正常顯示
