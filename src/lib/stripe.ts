import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: {
      aiQueriesPerDay: 3,
      watchlistItems: 5,
      portfolioTracking: false,
      advancedCharts: false,
      newsAlerts: false,
      apiAccess: false,
    },
  },
  PRO: {
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL,
    features: {
      aiQueriesPerDay: Infinity,
      watchlistItems: Infinity,
      portfolioTracking: true,
      advancedCharts: true,
      newsAlerts: true,
      apiAccess: false,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    features: {
      aiQueriesPerDay: Infinity,
      watchlistItems: Infinity,
      portfolioTracking: true,
      advancedCharts: true,
      newsAlerts: true,
      apiAccess: true,
    },
  },
} as const;
