# 🇹🇼 Taiwan News Balancer

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![AI](https://img.shields.io/badge/AI-Gemini_Pro-blue)

Break the echo chamber. Understand the full picture with AI.
**Taiwan News Balancer** is an automated news aggregation and analysis platform powered by Google Gemini AI. It collects news from major Taiwanese media outlets (covering Pan-Blue, Pan-Green, Neutral, and International perspectives), analyzes hot topics, contrasts different viewpoints, and generates objective, balanced summaries.

[中文說明](./README.md)

## ✨ Key Features

*   **📰 Full-Spectrum Aggregation**: Real-time crawling from **PTS, LTN, UDN, China Times, TVBS, ETtoday**, and international sources like **BBC & CNN**.
*   **🤖 AI Viewpoint Balancing**: For each topic, AI extracts "Common Facts" and "Viewpoint Differences" from various sources to synthesize a neutral report.
*   **🌈 Media Bias Visualization**: Intuitive color-coding system (🟩 Green / 🟦 Blue / 🟪 Int'l / 🟥 Red) to identify media stance instantly.
*   **⚡ High-Performance Static View**: Uses "Backend Scheduled Generation -> Frontend Static Read" architecture for instant page loads and zero API latency for users.
*   **🧠 Smart Model Fallback**: Built-in fallback mechanism (Gemini 2.5 -> Lite -> Gemma) ensures high availability.

## 🛠️ Tech Stack

*   **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), Tailwind CSS, shadcn/ui
*   **Backend / Script**: Node.js, `rss-parser`
*   **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
*   **Automation**: GitHub Actions (Updates data every 2 hours)
*   **Deployment**: Vercel

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/news-balance-tw.git
cd news-balance-tw
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Trigger News Update (Generate Report)
```bash
npx tsx scripts/update-news.ts
```
This will fetch the latest news, run AI analysis, and save the result to `data/latest-report.json`.

## 🔄 Automation Workflow

This project follows a **GitOps** workflow:
1.  **GitHub Actions** runs the crawler and AI analysis script on a schedule (Cron).
2.  The result is saved to `data/latest-report.json` and automatically committed back to the GitHub Repository.
3.  **Vercel** detects the new commit and triggers a re-deployment.
4.  Users always see the latest static analysis without waiting for AI generation.

## 🤝 Contribution

Pull Requests and Issues are welcome!

## 📄 License

MIT License
