-- ============================================
-- InvestHub - Initial Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'PREMIUM', 'ADMIN');
CREATE TYPE "RiskLevel" AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE');
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'CRYPTO', 'ETF', 'FOREX');
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT');
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE');

-- Users
CREATE TABLE "users" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "avatarUrl" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Profiles
CREATE TABLE "profiles" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "bio" TEXT,
  "location" TEXT,
  "website" TEXT,
  "riskTolerance" "RiskLevel" NOT NULL DEFAULT 'MODERATE',
  "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
  "notifications" JSONB NOT NULL DEFAULT '{"email":true,"priceAlerts":true,"news":true}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- Categories
CREATE TABLE "categories" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- Articles
CREATE TABLE "articles" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "coverImage" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "views" INTEGER NOT NULL DEFAULT 0,
  "readTime" INTEGER NOT NULL DEFAULT 5,
  "authorId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "tags" TEXT[] DEFAULT '{}',
  "metadata" JSONB,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- Portfolios
CREATE TABLE "portfolios" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT 'My Portfolio',
  "description" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "portfolios_userId_key" ON "portfolios"("userId");

-- Portfolio Items
CREATE TABLE "portfolio_items" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "portfolioId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "assetType" "AssetType" NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "avgBuyPrice" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "portfolio_items_portfolioId_symbol_key" UNIQUE ("portfolioId", "symbol")
);

-- Transactions
CREATE TABLE "transactions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "portfolioItemId" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- Watchlists
CREATE TABLE "watchlists" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT 'Watchlist',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- Watchlist Items
CREATE TABLE "watchlist_items" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "watchlistId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "assetType" "AssetType" NOT NULL,
  "alertPrice" DOUBLE PRECISION,
  "notes" TEXT,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "watchlist_items_watchlistId_symbol_key" UNIQUE ("watchlistId", "symbol")
);

-- Subscriptions
CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- AI Chats
CREATE TABLE "ai_chats" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'New Chat',
  "messages" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ai_chats_pkey" PRIMARY KEY ("id")
);

-- Price Alerts
CREATE TABLE "price_alerts" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "assetType" "AssetType" NOT NULL,
  "condition" TEXT NOT NULL,
  "targetPrice" DOUBLE PRECISION NOT NULL,
  "triggered" BOOLEAN NOT NULL DEFAULT false,
  "triggeredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id");
ALTER TABLE "articles" ADD CONSTRAINT "articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id");
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "portfolio_items"("id") ON DELETE CASCADE;
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "watchlists"("id") ON DELETE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "ai_chats" ADD CONSTRAINT "ai_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Seed categories
INSERT INTO "categories" ("id", "name", "slug", "description", "color", "icon", "createdAt") VALUES
('cat_stocks', 'Stocks', 'stocks', 'Stock market news and analysis', '#3B82F6', '📈', NOW()),
('cat_crypto', 'Crypto', 'crypto', 'Cryptocurrency news and updates', '#F59E0B', '₿', NOW()),
('cat_macro', 'Macro', 'macro', 'Global macroeconomic analysis', '#8B5CF6', '🌍', NOW()),
('cat_ai', 'AI & Tech', 'ai-tech', 'Artificial intelligence and technology', '#00C896', '🤖', NOW()),
('cat_earnings', 'Earnings', 'earnings', 'Company earnings reports', '#EC4899', '💰', NOW());

