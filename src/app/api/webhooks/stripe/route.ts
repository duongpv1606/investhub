import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as any;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer },
        data: {
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0].price.id,
          status: sub.status.toUpperCase(),
          plan: sub.items.data[0].price.id.includes("enterprise") ? "ENTERPRISE" : "PRO",
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as any;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer },
        data: { status: "CANCELED", plan: "FREE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
