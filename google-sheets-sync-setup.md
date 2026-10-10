# Google 試算表同步設定

這份設定用來讓旅遊 App 的「購物清單」與「家庭備忘錄」在不同手機同步。

## 1. 建立 Google 試算表

建立一張 Google 試算表，名稱可用：

```text
名古屋旅遊 App 同步資料表
```

## 2. 貼上 Apps Script

1. 在試算表上方選單點「擴充功能」。
2. 點「Apps Script」。
3. 刪掉原本內容。
4. 貼上 `google-sheets-sync-apps-script.gs` 的全部內容。
5. 如果想換同步碼，修改第一行：

```js
const SYNC_TOKEN = "nagoya2026";
```

## 3. 執行一次初始化

在 Apps Script 上方函式選單選 `ensureSheets`，按「執行」。

第一次會要求 Google 授權，請用自己的 Google 帳號允許。這會建立兩個分頁：

- `Shopping`
- `Memos`

## 4. 部署成 Web App

1. 點右上角「部署」。
2. 選「新增部署」。
3. 類型選「網頁應用程式」。
4. 執行身分選「我」。
5. 誰可以存取選「所有人」或「知道連結的所有人」。
6. 按部署，複製 Web App URL。

## 5. 回到旅遊 App

1. 打開旅遊 App。
2. 到最下方「設定」。
3. 在「Google 試算表同步」貼上 Web App URL。
4. 輸入同步碼，例如 `nagoya2026`。
5. 按「儲存同步設定」。

之後購物清單與家庭備忘錄新增或刪除時，會寫入 Google 試算表；其他手機開著同一個 App，約幾秒內會自動更新。
