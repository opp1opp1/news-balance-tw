# 🇹🇼 台灣新聞觀點平衡器 (Taiwan News Balancer)

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![AI](https://img.shields.io/badge/AI-Gemini_Pro-blue)

打破同溫層，用 AI 讀懂新聞全貌。
**Taiwan News Balancer** 是一個全自動化的新聞聚合與分析平台，利用 Google Gemini AI 技術，自動蒐集台灣各大媒體（涵蓋泛藍、泛綠、中立及國際視角）的報導，針對熱門議題進行觀點對照與事實查核，生成客觀平衡的綜合報導。

[Read in English](./README-EN.md)

## ✨ 核心功能

*   **📰 全光譜新聞聚合**：即時抓取 **公視、自由時報、聯合報、中時、TVBS、ETtoday** 及 **BBC、CNN** 等多方來源。
*   **🤖 AI 觀點平衡**：針對同一議題，AI 自動提取各家媒體的「共同事實」與「觀點差異」，並生成中立摘要。
*   **🌈 媒體立場識別**：透過直觀的色彩系統（🟩 泛綠 / 🟦 泛藍 / 🟪 國際 / 🟥 紅色）標示訊息來源。
*   **⚡ 極速靜態瀏覽**：採用「後端定時生成 -> 前端靜態讀取」架構，網頁秒開，且大幅節省 API 成本。
*   **🧠 智慧模型回退**：內建模型備援機制 (Gemini 2.5 -> Lite -> Gemma)，確保系統高可用性。

## 🛠️ 技術架構

*   **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), Tailwind CSS, shadcn/ui
*   **Backend / Script**: Node.js, `rss-parser`
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
*   **Automation**: GitHub Actions (每 2 小時自動抓取並更新資料)
*   **Deployment**: Vercel

## 🚀 快速開始

### 1. 複製專案
```bash
git clone https://github.com/your-username/news-balance-tw.git
cd news-balance-tw
npm install
```

### 2. 設定環境變數
在專案根目錄建立 `.env.local` 檔案：
```env
GOOGLE_GENERATIVE_AI_API_KEY=你的_Gemini_API_Key
```

### 3. 執行開發伺服器
```bash
npm run dev
```
開啟瀏覽器訪問 `http://localhost:3000`。

### 4. 手動觸發新聞更新 (生成報告)
```bash
npx tsx scripts/update-news.ts
```
這會抓取最新新聞、執行 AI 分析，並將結果儲存至 `data/latest-report.json`。

## 🔄 自動化部署原理

本專案採用 **GitOps** 流程：
1.  **GitHub Actions** 定時 (Cron) 執行爬蟲與 AI 分析腳本。
2.  分析結果寫入 `data/latest-report.json` 並自動 Commit 推送回 GitHub Repository。
3.  **Vercel** 偵測到 GitHub 有新 Commit，自動觸發重新部署。
4.  使用者永遠看到的是最新的靜態分析結果，無需等待 AI 生成。

## 🤝 貢獻

歡迎提交 Pull Request 或 Issue！
特別感謝所有開源貢獻者。

## 📄 授權

MIT License