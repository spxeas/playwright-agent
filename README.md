# Playwright Agent 範例

這個專案示範如何使用 Playwright 操控 Google 搜尋，同時透過「人性化」行為（逐字輸入、滑鼠移動、滾動頁面、重試機制、持久化瀏覽器資料夾等）降低自動化的可偵測性。腳本執行後會將搜尋結果寫入 `results.json`，方便後續分析或整合其他工具。

## 環境需求
- Node.js 18 以上（Playwright 需要較新的 Node 版本）
- Git（非必須，但方便同步程式碼）
- 可執行 Chromium 的環境；首次安裝 Playwright 會自動下載對應瀏覽器

## 安裝步驟
```bash
git clone https://github.com/spxeas/playwright-agent.git
cd playwright-agent
npm install
```

如果你已經有本地專案資料夾，只要在專案根目錄執行 `npm install` 安裝相依即可。

## 使用方式
### 基本執行
```bash
node agent.js "Playwright 自動化"
```
Chromium 會在有頭模式啟動，使用人性化延遲輸入關鍵字、模擬滑鼠與滾動，最後把抓到的標題與連結寫進 `results.json`。

### 可調參數
在 `agent.js` 呼叫 `searchGoogle` 時可以調整：
- `headless`：改成 `true` 可隱藏瀏覽器視窗。
- `usePersistent`：`true` 會使用 `./user-data` 存放持久化的瀏覽器資料（Cookie、歷史紀錄）。
- `profilePath`：若想把持久化資料放在別處可修改這裡。
- `maxRetries`：導航失敗時的最大重試次數。
- `timeout`：各項導航操作的逾時毫秒數。

## 輸出內容
每次執行會覆寫 `results.json`，格式如下：
```json
{
  "query": "Playwright 自動化",
  "results": [
    { "title": "Example result", "href": "https://example.com" }
  ],
  "ts": "2024-01-01T12:00:00.000Z"
}
```

## 注意事項
- 啟用 `usePersistent` 後會生成 `user-data/` 目錄；若想保留 Cookie 就不要刪掉它。
- 腳本內有簡單處理 Google Cookie 彈窗，但不同地區顯示內容可能不同，必要時自行調整。
- 若要用於正式環境，建議加上更完整的錯誤處理、紀錄與風險控管，並注意 Google 的服務條款。
