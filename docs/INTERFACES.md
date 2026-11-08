# ssr-data-contracts 入口、出口與對接邊界

## 職責與完整流程

本 repo 提供 v0.1 契約形狀及既有語意的一致性檢查。流程為明確選擇 schema → 讀取合成 UTF-8 JSON → 大小／解析檢查 → 結構檢查 → 已定義的跨物件關聯 → 回傳同次結果。它不接收直播、不查 DB、不生成回答、不驗證來源真實性，也不保存輸入或執行修訂。

contracts/v0.1 是草稿集合版號；各 wire 的 schema_version 仍是 ssr.*.v1。這與 native adapter 的 1.0.1 不是同一版號空間。九份 wire schema 與原本範例保持原狀。

## 公開 CLI（實際 JSON 進出）

    node tools/validate_contract.mjs --schema chat-event.schema.json --input examples/chat-event.example.json
    node tools/validate_contract.mjs --schema chat-event.schema.json --stdin
    node tools/validate_contract.mjs --help

不指定 --input 時從 stdin 讀一筆 JSON，結束於 EOF。只接受九個精確 schema 檔名，不載入任意 schema 路徑，也不自動猜測 native 版本。不得同時指定 --input 與 --stdin。解析上限 256 KiB UTF-8；非法 UTF-8 不做替換。--input 只讀一般檔案，無寫入、網路或服務副作用。

除 --help 外，stdout 恰為一個 ssr.contract-validation-result.v1 JSON 物件；預期拒絕也走相同 JSON 出口，stderr 為空。此收據不是 chat-event、Query、Result、Evidence 或 Record。

| status | exit | 意義 |
|---|---:|---|
| valid | 0 | 符合所選契約與已定義語意；不代表原始輸入事件有效、來源真實或 ACL 允許。 |
| invalid | 1 | JSON 可讀，但契約／語意拒絕。 |
| input_error | 2 | 空白、解析、UTF-8、大小或讀取錯誤。 |
| usage_error | 2 | schema 或命令參數不合法。 |
| error | 3 | 進入 CLI 後可捕捉的內部／契約載入錯誤；不輸出原始 payload 或完整環境堆疊。 |

輸出 schema 位於 interfaces/validation-result.schema.json；可執行的合成輸入及預期結果位於 interfaces/validation-cases.json。真實子程序輸出、預期 exit 與 assertions 保存於 docs/acceptance/latest.json，不以手工範例冒充執行收據。

Node 執行檔不存在、來源語法損壞或程序在進入 CLI 前被 OS／政策阻擋時，不能保證產生此 JSON；呼叫端須另外檢查程序啟動錯誤。exit 3 的契約載入路徑使用全新暫存副本、相同程式 bytes 與缺少的合成契約目錄測試，不動正式 checkout。

## 公開 Node library 與網頁

tools/contracts-api.mjs 匯出 getContract、listContracts、validateContract、validateContractText、exitCodeFor。getContract 只讀本 repo 的固定九份 schema，回傳深層凍結物件；驗證不修改傳入物件。tools/contract-validator.js 是瀏覽器與 Node 共用核心，輸出 valid/errors。

    import { validateContractText, exitCodeFor } from './tools/contracts-api.mjs';
    const result = validateContractText(syntheticJsonText, 'chat-event.schema.json');
    const exitCode = exitCodeFor(result);

網頁的自訂輸入直接呼叫共用核心，不取保存紀錄當結果。內建範例只是合成輸入來源，並非假造後端回應。網頁顯示契約、同次 valid/errors 與保存的版本證據；不提供 HTTP API。先前瀏覽器拒絕仍保留，程式／模擬 DOM 測試不能使共通瀏覽器門檻變成通過。

## 格式、原文、時間與身分

- 原文不被摘要、校字、補欄位或回寫。JSON 字串解析僅供檢查，物件與來源檔案不修改。
- 時間要求完整日期、T、時分秒及 Z／UTC offset，檢查真實日曆日與閏年，不把 2 月 30 日正規化成其他日期。保持原字串，不猜時區。此支援 profile 仍不宣稱完整 RFC 3339（如閏秒）。
- ingest 的 invalid 記錄可符合 ingest-attempt 契約；valid 才能攜帶 normalized_event，兩者 ingest_id 必須一致。
- message/run/snapshot ID 是不透明關聯值；不生成、不合併帳號，不把 display_name 當 identity。
- query-result 的空 materials/sources 可以合法；不把 no_match、unavailable、error 混成同一業務狀態。
- query-result 的 source_id 是素材來源引用；驗收 source fingerprint 是程式來源識別，兩者不得互換。
- v0.1 沒有 scope、policy 或 ACL 欄位；符合契約不授予讀寫權。不能把新欄位塞進 additionalProperties:false 格式，也不補 permissive default。
- 重送相同合成輸入得到相同收據，沒有儲存副作用；業務去重、revision/current/history 不在本 repo 實作，不能假稱已驗收。

## 上下游相容決策（交總控）

assembly README 明列本 repo 不是目前新版 runtime/schema package 依賴；本 repo 不因新增 CLI 自動成為所有 repo 的上游。相關比較只採既有 imported-components/contracts-v1.0.1 快照，不宣稱已核對或修改各 native repo 的實際服務接線。

1. legacy chat-event → native Record：message_id 可由顯式 bridge 映射 source_event_id，occurred_at 可映射 event_time，text 原樣保留；仍缺 record_id、source_id、revision、received_at、完整 scope、record_kind、source_refs、可信 access_scope 與 actor_account_id 的身分上下文。conversation_id 不等於 session_id，actor_id 也不能憑字串直接合併帳號。由 bridge 提供者供可信上下文，Record 消費者按原 schema 拒絕缺欄位；不在此補假值。
2. legacy query-request → native Query：query_id/query_text 可由顯式 bridge 對應 request_id/text；仍需 scope、actor/person、時間窗、exclude_event_ids、limit、layer、conditions、access_scope 等上下文。query_type 不是可無條件直接改名的權限或 domain。weather 無明定 native 對應，不硬轉。
3. native Evidence → native Record：快照中 Record 額外必填 schema_version、record_kind、access_scope；Evidence 則有 layer、source_kind、match_reasons、rank。importer/store 只交 Evidence 時，要求完整 Record 的 reader 不能直接把它改標籤。應由提供者交回同 source／revision 的原始 Record 及可信 ACL，或由消費者提供明確 Evidence-reader 接口；兩者均需總控確認擁有者及實際接線，不能放寬來源綁定或補假 ACL。
4. legacy query-result → native Evidence：materials/sources 不含完整 scope/revision/ACL/原始定位上下文；不得直接宣稱是完整 Evidence，舊 unavailable 也不能推定成 denied/not_configured。

同一問題及素材的 query_id/question_id 唯一性、跨用途多 query 的對應政策、ID 生成、相容發布及完整標準 validator 仍待跨 repo 決策，不在這次擅自新增 wire 拒絕規則。
