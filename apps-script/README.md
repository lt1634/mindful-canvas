# Mindful Canvas Feedback — Google Apps Script Setup

## 步驟

1. 打開 Google Sheet：https://docs.google.com/spreadsheets/d/1OXYMvbh9Kn-jNdf7Sgid8wGgxbXTnDAtPQk748NLZ2I/edit
2. 點擊選單 **Extensions → Apps Script**
3. 刪除預設代碼，貼上 `Code.gs` 的內容
4. 點 **💾 Save**（Cmd+S）
5. 點 **Deploy → New deployment**
6. 選 **Web app**
7. Description: `Mindful Canvas Feedback API`
8. Execute as: **Me**
9. Who has access: **Anyone**
10. 點 **Deploy** → 複製 Web app URL
11. 將 URL 告訴 Hermes，更新前端代碼

## 驗證

```bash
# Test POST
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"time":"2026-08-11T10:00:00Z","mode":"welcome","comment":"測試留言","device":"test"}'

# Test GET
curl "YOUR_WEB_APP_URL"
```

## Sheet 結構

| 時間          | 模式                  | 留言     | 裝置      |
| ------------- | --------------------- | -------- | --------- |
| ISO timestamp | welcome/free/zen/sumi | 學生留言 | UA string |
