<div align="center">
  <h1>📈 YouTube Shorts Analyzer</h1>
  <p>
    <strong>A high-performance, dark-mode web application designed to help creators find the perfect time to post YouTube Shorts.</strong>
  </p>
  <p>
    <a href="#-about-the-project">About</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-how-it-works">How it Works</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 📖 About The Project

For content creators, timing is everything. Posting a highly-edited YouTube Short at the wrong hour can result in the algorithm completely ignoring it. The **YouTube Shorts Analyzer** solves this problem by deeply analyzing a channel's historical performance to determine the absolute best hour and day to upload. 

Instead of relying on generic advice like "post at 5 PM," this tool looks at your actual data—or the data of your competitors—to build a completely customized upload schedule locked to Indian Standard Time (IST).

---

## ✨ Key Features

### ⏱️ Precision Timing & Normalization
- **Optimal 1-Hour Windows**: Calculates the specific hour of the day that historically generates the most views.
- **Top 3 Peak Windows**: Provides backup time slots if you miss your primary upload window.
- **Weighted Normalization**: A custom toggle that normalizes view averages. If you posted only one video at 2 AM and it went viral, the raw average would falsely claim 2 AM is the best time. The normalizer penalizes time slots with low upload volume to give you statistically reliable advice.

### 📊 Comprehensive Insights & Charts
- **Upload Hour Heatmap (Bar Chart)**: A dynamic Recharts-powered visualization of Average Views vs. Upload Hour (00:00 to 23:00).
- **Historical View Trend (Line Chart)**: Tracks chronological view counts for the latest 50 videos, allowing you to visually spot momentum, algorithmic boosts, or channel death.
- **Duration Sweet Spot (Scatter Plot)**: Analyzes video length (in seconds) vs. views to pinpoint if your audience prefers bite-sized 15s clips or longer 50s storytelling.

### 💡 Content & Engagement Analysis
- **Engagement Rate Tracking**: Accurately calculates the interaction rate `((Likes + Comments) / Views * 100)` for every single short.
- **Smart Keyword Cloud**: Scrapes the titles of your latest videos, strips away common English stop words (like "the", "and"), and renders a tag cloud of keywords that historically average the highest views.

### 🛠️ Developer & Power User Utilities
- **Data Export**: Instantly download your parsed, timezone-converted analytics as a `.csv` file for external data modeling in Excel.
- **Tabbed Layout**: A clean separation of "Overview" (charts and tables) and "Deep Dive Insights" (growth and content analysis) to prevent endless scrolling.

---

## 💻 Tech Stack

This project was built from the ground up prioritizing speed, modern aesthetics, and type safety.

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) - Utilizing React Server Components and fast client-side transitions.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Strict typing for all YouTube API responses and internal data models.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utilizing a dark `neutral` palette with glassmorphism `backdrop-blur` effects.
- **UI Architecture**: [Shadcn UI](https://ui.shadcn.com/) - Unstyled, accessible Radix primitives completely customized for the app's dark ecosystem.
- **Iconography**: [Lucide React](https://lucide.dev/) - Crisp, lightweight SVG icons.
- **Visualizations**: [Recharts](https://recharts.org/) - Responsive, interactive SVG charting.
- **Data & Time**: 
  - `googleapis`: Official Google API Node.js client.
  - `date-fns` & `date-fns-tz`: For flawless UTC to IST (Asia/Kolkata) timezone conversion.

---

## 🚀 Getting Started

Follow these steps to get your local development environment up and running.

### 1. Prerequisites
You must generate a **YouTube Data API v3** key to fetch channel data.
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Navigate to **APIs & Services** > **Library**, and enable the **YouTube Data API v3**.
4. Navigate to **Credentials** and create an API Key.

### 2. Installation

Clone the repository to your local machine:
```bash
git clone https://github.com/BeingMirage/yt-video-analyser.git
cd yt-video-analyser
```

Install the required NPM packages:
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory of the project. Add your freshly generated API key:
```env
YOUTUBE_API_KEY=your_actual_api_key_here
```

### 4. Run the App
Boot up the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app should load instantly.

---

## 🧠 How it Works (Under the Hood)

The YouTube Data API does not have a native "Shorts" filter. To solve this, the backend performs the following pipeline:
1. **Handle Resolution**: If the user inputs a `@handle`, the app makes an initial API call to resolve the handle to a concrete `Channel ID`.
2. **Playlist Fetching**: It targets the channel's default `uploads` playlist and pulls the metadata for the last 50 published items.
3. **Shorts Isolation**: It makes a subsequent batch request to `videos.list` to grab exact durations. It strictly filters out any video lasting longer than 61 seconds.
4. **Timezone Matrix**: It parses the `publishedAt` ISO string (which is always UTC) and mathematically shifts it to `Asia/Kolkata` (IST), extracting the precise day of the week and local hour.

---

## 📂 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/shorts/route.ts  # Next.js Route Handler for YouTube API
│   │   ├── layout.tsx           # Global HTML layout & font definitions
│   │   └── page.tsx             # Main Dashboard (Client Component)
│   ├── components/
│   │   ├── AnalyticsChart.tsx   # Upload Hour Bar Chart
│   │   ├── DurationChart.tsx    # Scatter Plot for Duration vs Views
│   │   ├── GrowthChart.tsx      # Chronological Line Chart
│   │   ├── KeywordCloud.tsx     # Title Keyword Extractor
│   │   ├── ShortsTable.tsx      # Main Data Table & CSV Export
│   │   └── SummaryCards.tsx     # Top Level Metric Cards
│   ├── lib/
│   │   └── youtube.ts           # Core Google API logic & Data transformations
└── .env.example                 # Template for API keys
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
