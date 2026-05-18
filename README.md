# InvestHub 🚀

> Professional financial intelligence platform — real-time stocks, crypto, AI analysis, and portfolio tracking.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

---

## ✨ Features

- **📈 Stock Dashboard** — Real-time quotes, advanced charting, technical indicators
- **₿ Crypto Dashboard** — Top 50 coins, market cap, sparklines, Fear & Greed
- **💼 Portfolio Tracker** — P&L tracking, allocation charts, performance history
- **🤖 AI Assistant** — Claude-powered analysis, market summaries, financial Q&A
- **📰 News System** — Curated financial news with category filters
- **⭐ Watchlist** — Monitor assets with price alerts
- **💳 Premium Subscriptions** — Stripe-powered Free / Pro / Enterprise tiers
- **🔐 Auth** — Email/password + Google OAuth via Supabase

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| AI | Anthropic Claude API |
| Payments | Stripe |
| Market Data | CoinGecko + Alpha Vantage |
| Deployment | Vercel |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/investhub.git
cd investhub
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in all required variables (see .env.example)
```

### 3. Database Setup

```bash
# Push schema to Supabase
npx prisma db push

# Seed initial data
npm run db:seed
```

### 4. Run Dev Server

```bash
npm run dev
# Visit http://localhost:3000
```

---

## 🔑 Required API Keys

| Service | Where to Get | Free Tier |
|---------|-------------|-----------|
| [Supabase](https://supabase.com) | Project Settings → API | ✅ Yes |
| [Anthropic](https://console.anthropic.com) | API Keys | Pay-per-use |
| [CoinGecko](https://www.coingecko.com/en/api) | Account → API | ✅ Demo key |
| [Alpha Vantage](https://www.alphavantage.co) | Get Free API Key | ✅ 25 req/day |
| [Stripe](https://stripe.com) | Dashboard → Developers | ✅ Test mode |

---

## 📁 Project Structure

```
investhub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, Register
│   │   ├── (dashboard)/        # Stocks, Crypto, Portfolio, AI, News, Watchlist
│   │   ├── admin/              # Admin Dashboard
│   │   ├── pricing/            # Pricing Page
│   │   └── api/                # API Routes
│   ├── components/
│   │   ├── ai/                 # AI Chat component
│   │   ├── charts/             # Price charts, Sparklines
│   │   ├── layout/             # Navbar, Footer, TickerBar
│   │   ├── market/             # Market overview cards
│   │   └── ui/                 # Button, Card, Badge, Input, etc.
│   ├── lib/
│   │   ├── auth.ts             # Auth helpers
│   │   ├── market-data.ts      # CoinGecko + Alpha Vantage fetchers
│   │   ├── mock-data.ts        # Development mock data
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── stripe.ts           # Stripe client + plan config
│   │   ├── supabase.ts         # Supabase client (browser + server)
│   │   └── utils.ts            # Formatting utilities
│   ├── store/                  # Zustand global state
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Auth protection for routes
├── prisma/
│   ├── schema.prisma           # Complete database schema
│   ├── seed.ts                 # Seed script
│   └── migrations/             # SQL migrations
├── .env.example                # Environment variables template
└── README.md
```

---

## 🗄️ Database Schema

- **Users** → Profiles → Subscriptions
- **Articles** → Categories
- **Portfolios** → PortfolioItems → Transactions
- **Watchlists** → WatchlistItems
- **AIChats**, **PriceAlerts**

---

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel Dashboard
# → Settings → Environment Variables
```

### Stripe Webhook Setup

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In production, add webhook in Stripe Dashboard:
# → Developers → Webhooks → Add endpoint
# → URL: https://yourdomain.com/api/webhooks/stripe
# → Events: customer.subscription.*
```

---

## 📖 Build Phases

- **Phase 1** ✅ Project setup, authentication, landing page
- **Phase 2** ✅ Stock dashboard, Crypto dashboard
- **Phase 3** ✅ Portfolio tracker, Watchlist
- **Phase 4** ✅ AI assistant (Claude API)
- **Phase 5** ✅ Premium subscription (Stripe)
- **Phase 6** ✅ Admin dashboard

---

## ⚠️ Disclaimer

InvestHub is for informational purposes only. Nothing on this platform constitutes financial advice. Always do your own research before making investment decisions.

---

Built with ❤️ by the InvestHub team.
