# 🛫 純前端旅遊行程規劃網站功能規格書 (Functional Specification Document)

## 1. 專案概述 (Project Overview)
- **專案目標**：打造一個純前端的旅遊行程規劃工具，讓使用者可以安排多天行程、加入/排序景點，並透過壓縮 URL 產生唯讀連結分享給他人。
- **目標平台**：架設於 GitHub Pages 之靜態網站。
- **目標客群**：手機與電腦網頁使用者（RWD 響應式佈局優先）。
- **核心範圍限制**：純前端（無後端資料庫），不包含多人即時協作，專屬使用者資料以 LocalStorage 保存，分享資料以 URL 負載。

## 2. 確認技術棧 (Confirmed Technology Stack)
- **前端框架**：React 18 (結合 Vite + TypeScript)
- **UI & 樣式**：Tailwind CSS (快速響應式排版) + Lucide (Icon)
- **拖曳互動**：`@dnd-kit/core` 及其關聯套件 (手機端優化)
- **地圖服務**：Google Maps API (`@react-google-maps/api` + Google Places API)
- **狀態分享機制**：`lz-string` (壓縮 JSON 轉譯至 URL)
- **資料持久化**：原生 `localStorage` (維持使用者自己編輯進度)

## 3. 完整相依套件清單 (Complete Dependency List)
**核心依賴與安裝指令：**
```bash
# 初始化專案
npm create vite@latest trip-planner -- --template react-ts
cd trip-planner

# 核心與地圖功能
npm install react-router-dom @react-google-maps/api use-places-autocomplete

# 拖曳功能
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 工具功能 (狀態壓縮、日期處理、圖示)
npm install lz-string date-fns lucide-react

# 樣式依賴 (Tailwind Setup)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 4. 專案目錄結構 (Project Directory Structure)
```text
src/
├── components/
│   ├── map/           # Google Map 與景點搜尋 Autocomplete
│   ├── itinerary/     # 天數切換、拖曳排序清單、景點卡片
│   ├── ui/            # 共用按鈕、對話框等基底元件
│   └── layout/        # 網站 RWD 主外觀與 Header
├── hooks/
│   ├── useItinerary.ts # 行程狀態機狀態管理 (含 LocalStorage 同步)
│   └── useShare.ts     # URL 解壓縮與編碼邏輯
├── types/
│   └── index.ts       # 型別定義 (Spot, Day, Itinerary)
├── utils/
│   └── compression.ts # lz-string 邏輯封裝
├── App.tsx            # 主程式路由入口
└── main.tsx           # React 掛載點
```

## 5. 資料模型 (Data Models)
```typescript
interface Spot {
  id: string;          // 唯一識別碼 (前台生成 uuid)
  placeId: string;     // Google Maps Place ID
  name: string;        // 景點名稱
  address: string;     // 地址
  location: {          // 經緯度供地圖顯示
    lat: number;
    lng: number;
  };
  durationMins: number; // 預計停留時間 (分鐘)
}

interface DayPlan {
  id: string;          // 天數 ID
  date: string;        // 預設第 N 天或真實日期
  spots: Spot[];       // 該天的所有景點序列
}

interface Itinerary {
  id: string;          // 行程表 ID
  title: string;       // 行程名稱
  days: DayPlan[];     // 天數陣列
}
```

## 6. API 端點規格 (API Endpoint Specification)
由於為純前端架構，無本機端或後端 API。
**唯一外部 API：Google UI API**
- `Places API`: 透過 `use-places-autocomplete` 用於搜尋景點。
- `Maps JavaScript API`: 用於載入地圖基底。

## 7. 頁面 / 畫面規格 (Page / Screen Specification)
本系統採 SPA 設計架構：
- **`/?data=...` 或 `/` (主編輯器 / 分享頁面)**：
  - **狀態偵測**：若 URL 帶有 `data` query string，則進行 `lz-string` 解碼。如果解碼成功，進入**唯讀 (Read-only) 模式**，隱藏所有編輯與拖曳按鈕。若無，進入**編輯模式**，並自動載入 `localStorage` 資料。
  - **佈局設計 (RWD)**：
    - **電腦版**：左半部（景點搜尋與行程拖曳清單）、右半部（Google Map 互動地圖）。
    - **手機版**：上下滾動，上方為地圖（可收合）+ 下方為天數切換與景點清單。

## 8. 身分驗證與授權規格 (Authentication & Authorization)
- **無帳號系統**。
- 權限管理依賴於進入模式：
  1. 所有人在沒有 `data` URL 參數時都有自己的編輯環境（存在本機 Cache 中）。
  2. 收取到分享連結者，為嚴格的本機狀態強制蓋寫唯讀檢視。

## 9. 錯誤處理規格 (Error Handling Specification)
- **E-MAP-01**: Google Map API Key 無效或用盡額度 → 地圖區塊顯示系統錯誤替代畫面，並仍允許清單操作。
- **E-URL-01**: 無效的分享連結（解碼失敗） → 跳出「連結無效」提示框，並將使用者重導回乾淨的建立首頁。
- **E-SYS-01**: 用戶 LocalStorage 滿載容量 → 捕捉 quota exceeded 並提示使用者清理儲存空間。

## 10. 環境變數 (Environment Variables)
僅需配置一個環境變數供 Google Maps 使用：
```env
# .env (本機) 與 GitHub Pages Secrets 中設定
VITE_GOOGLE_MAPS_API_KEY="AIzaSyYourGoogleMapsApiKeyHere..."
```

## 11. 實作順序 (Implementation Order)
1. **Phase A - 基底建設**：Vite 初始化、Tailwind 設定、基礎型別與 Zustand 或 React Context 狀態庫建置。
2. **Phase B - 地圖與搜尋**：導入 Google Maps 模組，完成搜尋即時預覽。
3. **Phase C - 行程與拖曳**：實作增刪改查（CRUD）天數與景點，並套用 `dnd-kit` 實現排序。
4. **Phase D - 壓縮與分享**：連接 `lz-string`，製作「產生分享連結」按鈕，實作網頁初始化檢查 query string 進入唯讀模式的行為。
5. **Phase E - UI/UX 微調與發布**：針對手機設備滑動、點擊區塊大小優化，配置 GitHub Actions 自動發布至 GitHub Pages。

## 12. 驗收標準 (Acceptance Criteria)
- [ ] 能夠從地圖搜尋列找到景點，並成功新增至指定天數中。
- [ ] 能夠透過滑鼠或手指拖曳景點卡片，並成功改變在該天的排序順序。
- [ ] 設定停留時間後，能總結顯示當天總共耗費的總時間。
- [ ] 點擊「產生分享連結」，可複製一串長網址，並在新的無痕視窗開啟後，能成功看到剛才排好的行程且無法進行修改。
- [ ] 使用 `npm run build` 無錯誤且順利編譯。
