# ssr-data-contracts 共用驗收狀態與功能測例

## 所有 repo 共通門檻：預設瀏覽器可開啟運作

使用者已明訂：網頁必須能在使用者的預設瀏覽器實際開啟並可操作、運作正常。所有 repo 採相同門檻；內容與具體測例依各 repo 真實功能訂定。必須實際看到頁面，操作適用的輸入、輸出和錯誤流程並保留證據。程式存在、檔案存在、HTTP 成功、後端或模擬 DOM 測試不能代替真實預設瀏覽器驗收。

本 repo 的共通門檻目前為 blocked／未驗證：先前 file: 導覽在載入前遭安全政策拒絕，沒有成功瀏覽器畫面，也未確認 Chrome 為預設瀏覽器。不得重試或換路徑繞過。機器可讀狀態見 common-acceptance-status.json：status=defined、overallResult=blocked。

本 repo 負責 v0.1 JSON 契約、合成範例及有限子集一致性檢查。下列 F01–F11 是本 repo 功能測例及預期結果，不是另一套驗收標準。功能測試的預期 exit 與內容 assertions 均須核對，不代表共用驗收、完整 JSON Schema、真實瀏覽器或整個機器人通過。

## 輸入與隔離

- 使用 contracts/v0.1 的 9 份 schema、examples 的 14 份虛構範例，或自行輸入的合成 JSON。
- 自訂輸入上限為 256 KiB UTF-8、64 層巢狀與 20,000 個節點。超限、空白、非法 JSON、未知 schema 必須顯示錯誤，不沿用舊通過結果。
- 網頁不送出網路請求、不使用 localStorage、不讀正式 DB、憑證或其他 repo。不要貼入真實個資或秘密。重新整理會清除自訂輸入。
- docs/acceptance 只保存合成測試紀錄，不含自訂輸入；頁面只含 schema、合成範例、相對來源路徑／hash 與去環境資訊的摘要。

## 本 repo 功能測例（不取代共用標準）

| ID | 輸入／操作 | 預期輸出與成功判定 |
|---|---|---|
| F01 | 14 份內建範例與 9 份 schema | CLI 與瀏覽器共用核心，14/14 通過，無遺漏範例或 schema。 |
| F02 | 缺欄位、錯型別／enum／const、額外欄位、錯陣列項目、無時區或不存在的日期 | valid=false，列出 JSON 路徑及原因，不拋未處理例外。時間檢查真實日曆日及帶時區的完整格式，不默默正規化。 |
| F03 | valid/invalid ingest、normalized_event、ingest_id 的各種組合 | 拒絕違反既有規則的組合；合法 invalid 記錄可通過契約，並不表示原始事件有效。 |
| F04 | 三種 disposition 與錯誤 next_step | invalid/not_triggered 到 fixed_sop；triggered 到 question_analysis；有效事件必有 message_id。 |
| F05 | Prompt 的 snapshot/run/message 錯配；不存在的素材來源 | 明確拒絕；正確關聯可通過。 |
| F06 | 空白、非法 JSON、未知 schema、過大／過深輸入 | 顯示可理解錯誤，不執行外部工具，不保留舊成功狀態。 |
| F07 | 載入、編輯、重複提交、清除／復原、返回工作台 | 輸入對應實際結果；編輯即標示過期；重複執行無累積副作用；清除可復原。 |
| F08 | 批次驗證、中途取消、再次執行 | 只顯示實際完成數；取消後不能聲稱 14 組通過；可乾淨重跑。 |
| F09 | 離線、桌面／窄視窗、鍵盤操作 | 無外部依賴、有 label／可見焦點，無整頁水平溢位；UI 未實際操作時明列未驗證。 |
| F10 | 來源、bundle、紀錄 | 同版 hash，bundle 可重建且新鮮；紀錄含時間、命令、合成輸入、stdout、stderr、exit code、限制。 |
| F11 | 自訂 JSON CLI／Node API、stdin／檔案、非法 UTF-8、使用錯誤及重送 | 收據符合 interfaces/validation-result.schema.json；合法 exit 0、契約拒絕 1、輸入／使用錯誤 2、內部錯誤 3。預期拒絕不能當成測試故障。 |

## 已實測結果與證據

實際結果以 docs/acceptance/latest.json 的精確 HEAD、工作樹指紋、合成輸入及真實輸出為準；status 僅為 functional_tests_pass / functional_tests_fail。共通網頁門檻另以 commonAcceptance.overallResult=blocked 記錄。網頁「本次操作」與已保存結果分開呈現，不能把歷史結果當成本次已執行。舊逐輪紀錄原樣保存，其中舊 pass 或 pending 欄位不是目前的共通網頁驗收結論。

在 repo 根目錄使用 Node 24（本輪環境）：

    node tools/build_workbench.mjs
    node tools/validate_examples.mjs
    node --test tests/contract-validator.test.mjs tests/workbench.test.mjs tests/interfaces.test.mjs
    node tools/build_workbench.mjs --check

一般驗證不改檔案。build_workbench 只產生 web/data.js；record_acceptance 只寫 docs/acceptance/latest.json、保留 runs 下的逐輪紀錄並重建 bundle，使用合成資料。

    node tools/record_acceptance.mjs

可串接入口與欄位語意見 INTERFACES.md；機器可讀案例與稽核見 interfaces/validation-cases.json、interfaces/audit.json。收據中的 exit 非零也可能是預期拒絕，必須核對 expectedExit、matchesExpectations 與 actualResult，不把 exit 0 當作唯一成功依據。

設計的本機開啟方式是以預設瀏覽器開啟 web/index.html，不需要埠或服務；若成功開啟，關閉頁籤即停止。本輪開啟步驟受阻，此方式尚未獲實際瀏覽器驗證。頁面實作包含單筆同步驗證、可取消批次、清除／復原與保留輸入的頁籤切換；「檢視 schema」與「驗收證據」只供閱讀。

## 不適用及理由

- 共通的預設瀏覽器門檻：適用，不可豁免；本 repo 目前受阻，並非不適用或通過。
- 現有靜態頁面的後端啟停操作：不適用，因 web/index.html、web/app.js 與 tools/contract-validator.js 只有靜態載入及本機計算，沒有後端服務。這是本 repo 功能操作的範圍說明，不是共用驗收項目的豁免。

## 未測／阻塞及同版規則

- docs/acceptance/latest.json 保存實際 Node 結果、HEAD、dirty 相對路徑及來源 hash。生成的 web/data.js 與證據檔不納入自身來源 hash，避免循環。
- 本次瀏覽器互動結果與保存的 Node/UI 紀錄分開顯示，不能拿歷史紀錄當成本次已執行。
- 共通門檻已明訂；目前整體網頁驗收為 blocked／未驗證。
- 使用者預設瀏覽器的呈現、輸入／輸出、鍵盤與窄視窗：未測。先前 Chrome 的 file: 導覽在載入前遭安全政策拒絕；Chrome 是否為預設瀏覽器亦未確認。沒有成功瀏覽器畫面，也沒有重試或換路徑繞過。
- 未完成：完整 Draft 2020-12、完整 RFC 3339、來源真實性、ID 生成／相容／發布政策、跨 repo adapter、STT／ACL、真實平台。
- 本次不修改 schema／範例；將原有語意規則共用於自訂輸入，不表示新增業務來源驗證。
- 執行環境名稱與指定裝置別名仍待總控核對；路徑不等於裝置身分證明。
