"use client";

import { useState } from "react";
import { Check, X, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Get started for free. No credit card required.",
    cta: "Get Started Free",
    ctaVariant: "secondary" as const,
    features: [
      { text: "Market overview (delayed)", included: true },
      { text: "Basic crypto table", included: true },
      { text: "5 watchlist items", included: true },
      { text: "3 AI queries per day", included: true },
      { text: "News feed", included: true },
      { text: "Advanced charting", included: false },
      { text: "Portfolio tracker", included: false },
      { text: "Unlimited AI access", included: false },
      { text: "Price alerts", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 20,
    description: "Everything you need to trade smarter.",
    cta: "Start 7-Day Trial",
    ctaVariant: "primary" as const,
    featured: true,
    features: [
      { text: "Real-time market data", included: true },
      { text: "Advanced charting + TradingView", included: true },
      { text: "Unlimited watchlist", included: true },
      { text: "Unlimited AI queries", included: true },
      { text: "Full portfolio tracker", included: true },
      { text: "Price & news alerts", included: true },
      { text: "Technical indicators", included: true },
      { text: "Priority support", included: true },
      { text: "Team accounts", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 99,
    annualPrice: 69,
    description: "For teams, funds, and power users.",
    cta: "Contact Sales",
    ctaVariant: "secondary" as const,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Team accounts (unlimited)", included: true },
      { text: "Admin dashboard", included: true },
      { text: "REST API access", included: true },
      { text: "White-label option", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "99.9% SLA uptime guarantee", included: true },
      { text: "Custom data exports", included: true },
      { text: "On-premise deployment", included: true },
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-mono text-primary mb-6">
              <Zap className="w-3 h-3" />
              Simple, Transparent Pricing
            </div>
            <h1 className="font-display text-5xl font-black mb-4">Choose Your Edge</h1>
            <p className="text-muted text-lg max-w-md mx-auto">Unlock professional-grade financial intelligence at any level.</p>

            {/* Billing Toggle */}
            <div className="inline-flex mt-8 p-1 bg-card border border-border rounded-xl gap-1">
              <button onClick={() => setBilling("monthly")} className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all", billing === "monthly" ? "bg-card-hover text-white" : "text-muted")}>
                Monthly
              </button>
              <button onClick={() => setBilling("annual")} className={cn("px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", billing === "annual" ? "bg-card-hover text-white" : "text-muted")}>
                Annual
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">-30%</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => {
              const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div key={plan.name} className={cn(
                  "relative bg-card border rounded-2xl p-6 transition-transform hover:-translate-y-1",
                  plan.featured ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                )}>
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background text-xs font-mono font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="font-display text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted mb-4">{plan.description}</p>
                  <div className="mb-6">
                    {price === 0 ? (
                      <span className="font-display text-4xl font-black">Free</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-black">${price}</span>
                        <span className="text-muted text-sm">/month</span>
                        {billing === "annual" && <span className="text-xs text-primary font-mono ml-2">billed annually</span>}
                      </div>
                    )}
                  </div>
                  <button className={cn(
                    "w-full rounded-xl py-3 text-sm font-semibold transition-colors mb-6",
                    plan.ctaVariant === "primary"
                      ? "bg-primary text-background hover:bg-primary/90"
                      : "border border-border hover:border-primary hover:text-primary"
                  )}>
                    {plan.cta}
                  </button>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f.text} className={cn("flex items-start gap-3 text-sm", f.included ? "text-white" : "text-muted/50")}>
                        {f.included
                          ? <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          : <X className="w-4 h-4 text-muted/30 flex-shrink-0 mt-0.5" />
                        }
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="mt-24 text-center">
            <h2 className="font-display text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-left max-w-3xl mx-auto">
              {[
                { q: "Can I cancel anytime?", a: "Yes — cancel with one click from your dashboard. No fees, no questions." },
                { q: "Is my data secure?", a: "100%. We use Supabase with Row Level Security and never sell your data." },
                { q: "Do you offer refunds?", a: "We offer a 7-day free trial on Pro. If you're not satisfied, we'll refund your first month." },
                { q: "What payment methods do you accept?", a: "All major credit cards via Stripe. No crypto payments yet." },
              ].map((faq) => (
                <div key={faq.q} className="bg-card border border-border rounded-xl p-4">
                  <p className="font-semibold text-sm mb-1">{faq.q}</p>
                  <p className="text-sm text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
