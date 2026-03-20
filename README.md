# TripPlanner 🛫

![TripPlanner Banner](./assets/banner.png)

**TripPlanner** 是一個純前端、輕量且高效的旅遊行程規劃工具。不需要註冊帳號，即可輕鬆安排多天行程、管理景點，並透過壓縮 URL 即時分享給旅伴。

## ✨ 核心特色

- **純前端架構**：無需後端資料庫，資料儲存於 LocalStorage，隱私性高。
- **多天行程規劃**：直覺的天數切換介面，輕鬆安排長途旅行。
- **Google Maps 整合**：內建 POI 搜尋（Google Places API），點擊地圖即可查看景點資訊。
- **拖曳排序 (Drag & Drop)**：使用 `@dnd-kit` 優化的流暢拖曳體驗，隨時調整景點順序。
- **URL 分享機制**：利用 `lz-string` 壓縮行程數據至 URL 參數，產生的連結即為完整的唯讀行程表。
- **響應式設計 (RWD)**：支援手機與電腦版網頁，出遊時手機隨手查閱超方便。

## 🛠️ 技術棧

- **框架**：React 18 (Vite + TypeScript)
- **樣式**：Tailwind CSS
- **圖示**：Lucide React
- **地圖**：@react-google-maps/api
- **互動**：@dnd-kit/core, @dnd-kit/sortable
- **工具**：lz-string (數據壓縮), date-fns (日期處理)

## 🚀 快速上手

### 環境要求

- Node.js (建議 v18 以上)
- Google Maps API Key

### 安裝步驟

1. **複製專案**
   ```bash
   git clone https://github.com/yukishirotsubasa/TripPlanner.git
   cd TripPlanner
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **配置環境變數**
   在專案根目錄建立 `.env` 檔案，並填入您的 Google Maps API Key：
   ```env
   VITE_GOOGLE_MAPS_API_KEY="您的_API_KEY"
   ```

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

## 📖 使用指南

### 編輯模式
- 直接進入首頁即可開始編輯。
- 搜尋景點並點選「新增至行程」。
- 在清單中拖曳卡片以更改順序。
- 設定每個景點的預計停留時間。

### 分享模式
- 點擊「產生分享連結」後，網址列會更新為包含加密數據的連結。
- 將該連結傳送給他人，對方開啟後將進入 **唯讀模式**（無法修改行程）。

## 📂 專案結構

```text
src/
├── components/         # UI 元件 (Map, Itinerary, Layout)
├── hooks/              # 自定義 Hook (行程狀態管理、分享邏輯)
├── types/              # TypeScript 型別定義
├── utils/              # 工具函式 (數據壓縮等)
├── App.tsx             # 路由入口
└── main.tsx            # React 掛載點
```

---
*Inspired by modern travel workflow. Built with ❤️ for travelers.*
