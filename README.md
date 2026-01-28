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
