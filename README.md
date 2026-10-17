# SSR Data Contracts（草稿）

本地草稿 v0.1，供 SSR 第一批 repo 討論與獨立驗證。此目錄定義跨 repo 的訊息形狀；它不是執行中的服務，也不指定資料庫、佇列、傳輸協定、部署方式或模型供應商。所有 schema 和範例均為提案，尚未接上真實平台。

## 責任邊界

- 本 repo 負責版本化的資料形狀、欄位語意、JSON 範例與範例檢查工具。
- 各功能 repo 負責自己的商業規則、來源驗證、失敗處理及執行；契約不代替這些實作。
- 呼叫端以版本化依賴使用契約。這不表示所有能力要作為共用常駐服務運行。
- 不在此 repo 放平台憑證、真實聊天室資料、知識內容或服務設定。

## v0.1 契約

| Schema | 用途 |
|---|---|
| `ingest-attempt` | 保留原始輸入及必要欄位／來源驗證結果；無效輸入也可交固定 SOP。 |
| `chat-event` | 驗證通過後供正式流程使用的標準化聊天事件。 |
| `routing-decision` | 明確記錄 invalid、not-triggered 或 triggered 的後續去向。 |
| `context-snapshot` | `conversation-context` 從 `conversation-store` 讀取並回給 runtime 的前文快照。 |
| `question-analysis` | 對同一輸入拆分多個問題；每個問題指定獨立用途。 |
| `query-request` / `query-result` | 一次只描述一種用途的查詢；結果限於素材、來源與狀態，不是生成答案。 |
| `answer-prompt-input` | 組 Prompt 的明確輸入，包含分析、查詢素材和同一份前文快照。 |
| `answer-run-record` | 問答執行歷史，使用 `run_id` 連結 `message_id`；不複製聊天室原文。 |

契約只列必要欄位。`message_id`、`run_id`、`snapshot_id` 等識別碼在此皆是不透明字串；其產生方式尚未決定。來源驗證規則、前文窗口、查詢狀態政策及相容性政策也待決策，見 assembly repo 的未決事項。

## 路由與資料語意

- 無效輸入與有效但未觸發的事件均須送到 `ssr-event-sop` 的固定 SOP；不得靜默丟棄。`ingest_id` 可追蹤沒有可用 `message_id` 的無效輸入。
- 觸發後才建立問答執行。執行歷史以 `run_id` 連到標準聊天事件的 `message_id`。原始聊天事件與執行記錄是不同資料，不由此契約要求共用資料庫。
- 前文路徑固定表達為 runtime 呼叫 `conversation-context`，後者讀 `conversation-store` 並回傳 `context-snapshot`。分析和 Prompt 組裝都引用同一個 `snapshot_id`；窗口及是否包含當前訊息尚未決定。
- 每個 `query-request` 只指定一種用途：`weather`、`person`、`game_info`、`game_guide` 或 `game_item`。素材查詢結果不產生答案。
- 缺少材料時應回傳明確狀態並留下缺口記錄；背景知識研究可獨立進行。缺口補充必須人工審核後才發布。
- STT／主播逐字稿不在 v0.1 實作範圍內，未加入其資料契約。

## 結構

- `contracts/v0.1/`：JSON Schema Draft 2020-12 契約。
- `examples/`：對應 schema 的虛構資料範例。
- `tools/validate_examples.mjs`：無外部套件的範例一致性檢查器。

## 驗證

在本 repo 根目錄執行：

```powershell
node tools/validate_examples.mjs
```

檢查器會解析所有範例 JSON、依 schema 目前使用的子集檢查型別、必填欄位、列舉、陣列項目、額外欄位、日期時間格式，以及 ingest／路由／snapshot／run 的跨物件關係。它不是完整 JSON Schema validator 或 Draft 2020-12 meta-schema 驗證器；發布前仍應以支援 Draft 2020-12 的標準 validator 驗證 schema 與資料。

修改契約時，請同步更新 schema、範例、檢查器（若使用到新的 schema 關鍵字）及此處語意。語意化版本與向後相容政策尚待決定；`v0.1` 只代表草稿版號。
