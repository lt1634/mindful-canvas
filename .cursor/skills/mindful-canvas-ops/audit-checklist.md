# Mindful Canvas 審計清單

> Agent 盤點時逐項標記。規格見 PLAN.md v6.0。

## A. 核心流程

| ID  | 項目                          | 驗證方式                                      |
| --- | ----------------------------- | --------------------------------------------- |
| A1  | 雙模式（自由畫布 / 禪繞唐卡） | index.html welcome mode-cards                 |
| A2  | 畫布：8 色 + 4 筆刷           | COLORS / SIZES                                |
| A3  | 無常淡化                      | rAF + fadePhase                               |
| A4  | 語音                          | **已移除**（v2.0 產品決策）                   |
| A5  | 模板解讀 80 句                | generateInterpretation                        |
| A6  | Ollama 可選                   | generateInterpretationAI + fallback           |
| A7  | 心靈卡片 PNG 1080×1440        | saveCard                                      |
| A8  | 反饋問卷 3 題                 | **已移除**（v2.4；session 仍寫 localStorage） |
| A9  | 流程含 feedback               | **已改**：card → welcome（`finishFromCard`）  |
| A10 | 使用條款                      | #termsScreen                                  |

## B. 安全與合規

| ID  | 項目               | 驗證方式                                  |
| --- | ------------------ | ----------------------------------------- |
| B1  | checkSafety() 共用 | 模板+AI 都呼叫                            |
| B2  | highStress 規則    | anxious/chaotic + strokes>200 + silence<3 |
| B3  | 生命熱線文案       | 2382 0000 / 2389 2222                     |
| B4  | 安全模式跳過問卷   | restoreCardUI('safety')                   |

## C. 數據與營運

| ID  | 項目                                 | 驗證方式                           |
| --- | ------------------------------------ | ---------------------------------- |
| C1  | localStorage mindful_canvas_sessions | saveSession                        |
| C2  | 教師匯出（長按 logo 3s）             | exportSessions                     |
| C3  | FEEDBACK.md 有真實條目               | 手動 / JSON 匯入                   |
| C4  | getDominantColor 用於解讀            | `js/app.js` generateInterpretation |

## D. PWA 與部署

| ID  | 項目                       | 驗證方式              |
| --- | -------------------------- | --------------------- |
| D1  | manifest.json              | start_url ./          |
| D2  | icon-192 / icon-512 存在   | 檔案                  |
| D3  | sw.js 註冊                 | registerServiceWorker |
| D4  | .nojekyll                  | GitHub Pages          |
| D5  | git remote + 至少 1 commit | git                   |
| D6  | DEPLOY.md 與實際 URL 一致  | 文件                  |

## E. v2 待定（學生反饋後）

| ID  | 項目       | PLAN             |
| --- | ---------- | ---------------- |
| E1  | 水墨暈染 A | §9.2 ✅          |
| E2  | 光尾 B     | §9.2 ✅          |
| E3  | 呼吸節奏 D | §9.2 ✅          |
| E4  | js/ 模組化 | v5，>1500 行觸發 |
| E5  | README.md  | 可選             |

## F. 文件完整性

| ID  | 檔案             | 狀態   |
| --- | ---------------- | ------ |
| F1  | PLAN.md          | 應存在 |
| F2  | BRAND.md         | 應存在 |
| F3  | HABITS.md        | 應存在 |
| F4  | CHANGELOG.md     | 應存在 |
| F5  | FEEDBACK.md      | 應存在 |
| F6  | CODEX_CONTEXT.md | 應存在 |
| F7  | DEPLOY.md        | 應存在 |

## G. 已知風險（每次提及）

- Ollama 模型名 `gemma4:12b` 需本機確認
- iOS Safari 語音可能不可用
- 學校 WiFi 可能封 GitHub Pages
- git remote 不應含明文 token
