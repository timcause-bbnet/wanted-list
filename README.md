# Wanted List

這是一個基於 React 和 Vite 的待辦事項清單應用程式。

## 專案設定

本專案已完成以下設定：

1.  **專案初始化**: 使用 Vite 建立 React + JavaScript 專案。
2.  **相依套件**: 設定 `package.json` 並包含 React, React DOM 等必要套件。
3.  **版本控制**: 設定 `.gitignore` 以排除 `node_modules`, `dist`, `.env` 等檔案。
4.  **自動部署**: 包含 GitHub Actions Workflow (`.github/workflows/deploy.yml`) 以支援自動部署至 GitHub Pages。
5.  **樣式設計**: 使用 Modern CSS (Glassmorphism, Dark Mode) 提供優質視覺體驗。

## 快速開始

### 1. 安裝相依套件

在專案目錄下執行：

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

伺服器啟動後，請開啟瀏覽器訪問顯示的 URL (通常是 http://localhost:5173)。

### 3. 建置生產版本

```bash
npm run build
```

## 部署

本專案已設定 GitHub Actions。

1.  將程式碼推送至 GitHub 儲存庫的 `main` 分支。
2.  GitHub Actions 將會自動觸發 `Deploy to GitHub Pages` workflow。
3.  請至儲存庫的 **Settings > Pages** 確認 Source 設定為 **GitHub Actions**。

## 檔案結構

-   `src/`: 原始碼
    -   `App.jsx`: 主要應用程式元件
    -   `index.css`: 全域樣式設定
    -   `main.jsx`: 程式進入點
-   `public/`: 靜態資源
-   `.github/workflows/`: CI/CD 設定檔

## 🔥 如何取得 Firebase 資料庫網址 (Database URL)

為了讓多台裝置同步顯示懸賞單，我們使用 Google 提供的 Firebase 服務。請依照以下步驟免費取得網址：

1.  前往 **[Firebase Console](https://console.firebase.google.com/)** 並登入您的 Google 帳號。
2.  點擊 **"新增專案" (Add project)**，輸入專案名稱（例如 `wanted-list`），然後一路點擊「繼續」直到建立完成。
3.  進入專案後，在左側選單點擊 **"Build" (建置)** -> **"Realtime Database"**。
4.  點擊 **"Create Database" (建立資料庫)**。
    *   **Database location**: 選擇預設即可 (通常是 `us-central1`)。
    *   **Security rules**: **重要！** 請選擇 **"Start in test mode" (以測試模式啟動)**。這會允許任何人讀寫您的資料庫（方便展示用）。
        *   *(注意：測試模式通常預設 30 天後過期，若要長期使用，後續需修改規則)*
5.  建立完成後，您會看到一個 **以 `https://` 開頭、以 `firebaseio.com` 結尾的網址**。
    *   例如：`https://project-id-default-rtdb.firebaseio.com/`
6.  複製這個網址。
7.  回到本網頁：
    *   **後台**：點擊左上角「⚙️ 設定」，貼上網址。
    *   **前台**：首次開啟時，貼上網址。

完成！現在您的懸賞單已經雲端同步了。
