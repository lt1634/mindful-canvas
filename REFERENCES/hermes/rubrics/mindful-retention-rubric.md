# Mindful-Retention Rubric — DEFENSIVE GATE

> **用途：守門員。** 任何 `/goal` 改 UI / 加功能，必須先過呢張表。  
> **唔係**用嚟「build retention」，係用嚟**擋 bait 偷偷入嚟**。  
> 任何一條答 **YES** = 自動 **BLOCK**，要 reviewer 推翻先過得。

產品前提：Mindful Canvas = **情緒調節** mindfulness app（非生產力工具）；現漏斗 = `canvas_open → card_save → card_share`（conversion 先，retention 後）。

---

## A. Bait 偵測（任何一條 YES = BLOCK）

- [ ] 呢個功能會唔會喺用戶**唔在場**時主動拉佢返嚟？（push / 紅點 / streak 提醒）
- [ ] 有冇引入「連續性」概念？（streak / 連續日數 / 唔好斷）
- [ ] 有冇將練習量化成一個**分數 / 進度條**令人想追？
- [ ] 失敗 / 中斷會唔會觸發 What-the-Hell effect？（一漏就想全放棄）
- [ ] 有冇任何比較 / 排名 / leaderboard？
- [ ] 移除呢個元素，核心價值會唔會**毫髮無損**？（YES = 證明佢只係 bait → **BLOCK**）

## B. 脆弱用戶安全（任何一條 YES = BLOCK）

- [ ] 最差情況下，呢個訊息會唔會令一個情緒低落嘅人覺得「我又失敗咗」？
- [ ] 有冇任何「你做得唔夠」嘅隱含 framing？
- [ ] 自報數據會唔會被當成事實展示返畀用戶？（measurement validity 未過）

## C. 階段對位（任何一條 NO = PARK，唔係 BLOCK）

- [ ] 呢個功能對應到當前漏斗某格**實測** drop-off？（open → save → share）
- [ ] 有 GA 數據 / grep 實證支撐，而非「聽落有道理」？（Step 0 provenance gate）

## D. 價值純度（全部 YES 先算合格）

- [ ] 用戶返嚟係因為**自己想要嗰份平靜**，而唔係怕失去啲咩？
- [ ] 拎走所有 tracking / badge，呢個體驗本身仍然值得用？
- [ ] 用戶可以**極容易**關閉 / 退出任何提醒？

---

## 判定

| 結果 | 條件 |
| ---- | ---- |
| **BLOCK** | A 或 B 任何 YES |
| **PARK 等數據** | C 任何 NO |
| **打回重設計** | D 未全 YES |
| **可進 `/plan`** | 全過 |

---

## 已確認合格（現有功能，唔使再加 bait）

- 完成後題字 + 可選 save 卡片
- 心靈藝廊（本機 10 張，可刪）
- 匿名 GA 漏斗（唔騷擾用戶）

---

備註：呢張 rubric **唔產生功能**，只負責「唔好衰咗」。進攻（揀做乜）留返畀漏斗數據 + `/plan`。

Parked ideas：[`data/backlog/retention-ideas.md`](../../../data/backlog/retention-ideas.md)
