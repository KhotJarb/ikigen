<div align="center">

# 🌸 IkiGen — Discover Your Ikigai

**An AI-powered web application that guides you on a personalized journey to find your life's purpose (生き甲斐).**

*Where passion meets profession. Where mission meets vocation.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Upstash](https://img.shields.io/badge/Upstash-Redis-00E9A3?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-F472B6?style=for-the-badge)](LICENSE)

<br />

### 🚀 [✦ Experience IkiGen Live ✦](https://ikigen-chi.vercel.app/)

---

> *"Ikigai (生き甲斐) — A Japanese concept meaning 'a reason for being.'*
> *It lies at the intersection of what you love, what you're good at,*
> *what the world needs, and what you can be paid for."*

</div>

---

## ✨ What is IkiGen?

IkiGen is an AI-driven web app built with **Next.js** that helps users discover their **Ikigai** — the sweet spot where passion, talent, purpose, and livelihood converge. Through an intelligent questionnaire generated uniquely for each user, followed by deep AI analysis, IkiGen delivers a personalized, beautifully-presented life purpose assessment.

The experience is designed to feel like a premium digital journey — from a serene landing page with falling sakura petals, through a thoughtful quiz, to a cinematic, story-driven reveal of your results.

---

## 🎯 Core Features

### 🤖 AI-Powered Analysis
Leverages **Gemini 2.5 Flash** (with DeepSeek fallback) to analyze user inputs and generate personalized quiz questions that probe the four pillars of Ikigai. The AI then synthesizes quiz responses into a comprehensive archetype assessment, complete with strengths, growth areas, and actionable guidance.

### 🌍 Full Internationalization (i18n)
Seamlessly switch between **English (EN)**, **Thai (TH)**, and **Japanese (JA)** using `next-intl`. Every UI string — from button labels to radar chart axes — is fully translated. The language switcher features glassmorphism design with country flag emojis (🇬🇧 🇯🇵 🇹🇭).

### 🎨 Premium UI/UX — "Twilight in Kyoto"
- **Dark Mode** with deep gradient backgrounds (`slate-950 → #1a0b2e → slate-900`)
- **Glassmorphism** cards with `backdrop-blur-xl` and subtle white borders
- **Dynamic backgrounds** — each page features a different high-quality Unsplash image (temple at dusk, bamboo forest, Mt. Fuji)
- **Custom canvas sakura particles** — hand-coded `requestAnimationFrame` animation with zero library dependencies
- **Google Fonts** — Inter, Noto Sans JP, and Noto Sans Thai for multi-language typographic excellence

### 📊 Cinematic Results — Immersive Insights
A story-driven, scroll-triggered results experience that reveals your life's purpose one insight at a time:
- **Interactive Radar Chart** (Recharts) showing your balance across the four Ikigai pillars
- **Vibrant gradient section cards** with decorative corner glows and `whileInView` reveal animations
- **Archetype reveal** — a bold, celebratory header announcing your unique Ikigai archetype
- **Downloadable results** — export your results as a high-resolution PNG image

### 🔗 Custom Share Modal
Purpose-built social sharing experience with:
- **Copy Link** — instant clipboard with "Copied!" feedback
- **X (Twitter)** — pre-formatted tweet with your top pillar
- **Facebook** — Open Graph-ready sharing
- **LINE** — native LINE message sharing (popular in Japan & Thailand)

### ⚡ Serverless Architecture
AI analysis is powered by **Next.js API Routes** with **Upstash Redis** for caching and session management. The entire app deploys as a single unit on **Vercel** — no separate backend required.

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16 (App Router) | Full-stack framework (pages + API routes) |
| **React** | 19 | UI rendering |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Framer Motion** | 12 | Animations & transitions |
| **next-intl** | 4 | Internationalization (EN, JA, TH) |
| **Recharts** | 2 | Radar chart visualization |
| **html-to-image** | 1.11 | PNG export |
| **Upstash Redis** | Serverless | Caching & session management |
| **Google Gemini** | 2.5 Flash | AI quiz generation & analysis |

### Infrastructure
| Service | Tier | Purpose |
|---|---|---|
| **Vercel** | Free Hobby | Full-stack hosting (SSR + API routes) |
| **Upstash** | Free Redis | Serverless Redis with TLS |

---

## 🚀 Getting Started

> **⚡ Just want to try it?** Skip the setup and **[experience IkiGen live](https://ikigen-chi.vercel.app/)** — no installation required.

### Prerequisites

- **Node.js** ≥ 18.17
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)
- An **Upstash Redis** database ([free tier](https://upstash.com/))

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ikigen.git
cd ikigen
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# === AI ===
GEMINI_API_KEY=your_gemini_api_key_here

# === Upstash Redis ===
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token_here
```

> **💡 Tip:** Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/) and create a free Redis database at [Upstash Console](https://console.upstash.com/).

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** 🌸

---

## 📁 Project Structure

```
ikigen/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Locale-based routing
│   │   │   ├── page.tsx           # 🏠 Landing page
│   │   │   ├── quiz/page.tsx      # 📝 Quiz page
│   │   │   ├── results/page.tsx   # 📊 Results page
│   │   │   └── layout.tsx         # Root layout with i18n provider
│   │   ├── api/                   # Next.js API routes (serverless)
│   │   └── globals.css            # Design system & glass tokens
│   ├── components/
│   │   ├── SakuraBackground.tsx   # 🌸 Custom canvas particle system
│   │   ├── LandingInput.tsx       # ✍️  Glassmorphism text input
│   │   ├── QuizCard.tsx           # 🃏 Animated quiz question card
│   │   ├── RadarChart.tsx         # 📊 i18n-ready Recharts radar
│   │   ├── ResultSlides.tsx       # 🎴 Cinematic insight cards
│   │   ├── ShareModal.tsx         # 🔗 Social share modal
│   │   ├── ShareButton.tsx        # 📤 Download + share buttons
│   │   ├── LanguageSwitcher.tsx   # 🌍 EN/JA/TH selector
│   │   ├── LoadingScreen.tsx      # ⏳ Animated loading overlay
│   │   └── ProgressBar.tsx        # 📏 Quiz progress indicator
│   ├── i18n/
│   │   ├── messages/
│   │   │   ├── en.json            # 🇬🇧 English (63 keys)
│   │   │   ├── ja.json            # 🇯🇵 Japanese (63 keys)
│   │   │   └── th.json            # 🇹🇭 Thai (63 keys)
│   │   └── routing.ts            # Locale routing config
│   └── lib/
│       ├── api.ts                 # API client (fetch + polling)
│       └── types.ts               # TypeScript interfaces
├── public/                        # Static assets
├── vercel.json                    # Vercel deployment config
├── package.json
├── tsconfig.json
└── .env.local                     # Environment variables (git-ignored)
```

---

## 🌐 Deployment (100% Free)

IkiGen deploys as a single unit on **Vercel** with **Upstash Redis** — no separate backend required.

```
┌───────────────────────────────────┐
│           Vercel (Free)           │
│  ┌─────────────┐  ┌────────────┐  │
│  │  Next.js 16 │  │ API Routes │  │
│  │  React 19   │  │ (Gemini AI)│  │
│  │  Tailwind v4│  │ Serverless │  │
│  └─────────────┘  └──────┬─────┘  │
│                          │        │
│         ┌────────────────▼─────┐  │
│         │  Upstash Redis (TLS) │  │
│         │  REST API · Free     │  │
│         └──────────────────────┘  │
└───────────────────────────────────┘
```

### Quick Deploy Steps

| Step | Service | Time | Action |
|------|---------|------|--------|
| 1 | **Upstash** | ~2 min | Create free Redis → copy REST URL + Token |
| 2 | **Vercel** | ~3 min | Import repo → add env vars (`GEMINI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) |

**Total time: ~5 minutes · Total cost: $0/month** 🎉

---

## 🗺 Roadmap

### ✅ v0.1 — Initial Release *(Current)*

- [x] AI-powered quiz generation (Gemini 2.5 Flash + DeepSeek fallback)
- [x] Full i18n support (EN, JA, TH — 63 keys per locale)
- [x] Premium dark-mode UI with glassmorphism & sakura particles
- [x] Cinematic, story-driven results presentation
- [x] Custom social share modal (X, Facebook, LINE, Copy Link)
- [x] Downloadable PNG results export
- [x] 100% free-tier cloud deployment (Vercel + Upstash)

### 🔮 Coming Soon — v0.2

- [ ] **Open Graph & Twitter Cards** — Rich social previews with dynamic archetype images
- [ ] **User Accounts** — Save and revisit past Ikigai assessments over time
- [ ] **Progress Tracking** — Visualize how your Ikigai evolves over months
- [ ] **Additional Languages** — Korean (KO), Simplified Chinese (ZH-CN)
- [ ] **PDF Export** — Beautiful multi-page PDF report generation
- [ ] **Dark/Light Mode Toggle** — User-controlled theme switching
- [ ] **Accessibility Audit** — WCAG 2.1 AA compliance

---

## 🎨 Design Philosophy

IkiGen's visual identity draws from the concept of **"Twilight in Kyoto"** — the serene moment when day meets night, symbolizing the journey of self-discovery:

| Element | Design Choice | Rationale |
|---|---|---|
| **Color Palette** | Deep indigo → purple → slate | Contemplative, introspective mood |
| **Typography** | Inter + Noto Sans JP/Thai | Clean readability across 3 scripts |
| **Glass Effects** | `backdrop-blur-xl` + `bg-white/[0.04]` | Modern depth without visual clutter |
| **Particles** | Custom canvas sakura petals | Japanese aesthetic, zero library bloat |
| **Gradients** | Pink → Rose → Amber | Warmth of self-discovery |
| **Backgrounds** | Unsplash overlays per page | Sense of progression through the journey |

---

## 🤝 Contributing

Contributions are welcome! Whether it's fixing a bug, adding a translation, or improving the UI — every contribution makes IkiGen better.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

> **📝 i18n Rule:** If you add any user-facing text, you **must** update all three locale files (`en.json`, `ja.json`, `th.json`) simultaneously.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💗 and a love for self-discovery**

*IkiGen — 生き甲斐を見つけよう*

🌸

</div>
