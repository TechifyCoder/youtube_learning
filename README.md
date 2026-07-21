# 🧠 LearnLoop

**LearnLoop** is an intelligent, AI-powered learning platform designed for YouTube educational videos. It leverages Next.js, Gemini AI, and a modern glassmorphic 3D UI to help users track, understand, and validate their learning progress.

![LearnLoop Banner](https://via.placeholder.com/1200x400/1A1228/7C5CFC?text=LearnLoop+-+AI+Powered+Learning)

## ✨ Features

- **📺 YouTube Video Integration**: Seamlessly watch educational content with embedded video players and extracted transcripts.
- **🤖 AI Learning Assistant**: Powered by the **Google GenAI SDK (Gemini Flash)**, ask context-aware questions based strictly on the video's transcript.
- **📈 Activity Tracking**: Visual activity heatmap (similar to GitHub contributions) with month-wise and yearly filters.
- **📜 Premium Certificates**: Generate and download high-resolution, print-ready course completion certificates using `html2canvas`.
- **🌐 Public Profiles**: Share your learning progress via public URLs (e.g., `/u/username`).
- **🎨 Stunning 3D UI**: Built with Tailwind CSS, Framer Motion, and `@splinetool/react-spline` for interactive 3D elements, sleek dark themes, and glassmorphism.
- **🔐 Secure Authentication**: Handled via **NextAuth.js (v5)** with Google OAuth integration.
- **💾 Database Management**: Powered by **Neon (Serverless PostgreSQL)** and queried via **Drizzle ORM**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom CSS variables for themes
- **Animations:** Framer Motion, Spline 3D
- **UI Components:** Radix UI primitives
- **Charts/Data Vis:** Recharts

### Backend
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM
- **Auth:** Auth.js / NextAuth (v5 Beta)
- **AI Integration:** `@google/genai` (Gemini Flash)
- **Video Data:** YouTube Data API v3 & `youtube-transcript`

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **pnpm** installed on your system.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/your-username/learnloop.git
cd learnloop
pnpm install
```

### 3. Environment Variables
Rename the `.env.example` file to `.env.local` and populate it with your specific API keys and credentials:
```bash
cp .env.example .env.local
```
**Required Keys:**
- `DATABASE_URL` (Neon DB connection string)
- `NEXTAUTH_SECRET` (Generate using `npx auth secret`)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (For OAuth)
- `YOUTUBE_API_KEY` (Google Cloud Console)
- `GEMINI_API_KEY` (Google AI Studio)

### 4. Database Setup
Push the Drizzle schema to your Neon PostgreSQL database:
```bash
pnpm db:generate
pnpm db:push
```

### 5. Run Development Server
Start the local development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment (Vercel)

LearnLoop is optimized for deployment on Vercel:
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Configure all the environment variables from your `.env.local` in the Vercel Dashboard.
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel production domain.
5. Click **Deploy**.

---

## 📄 License
This project is licensed under the MIT License.
