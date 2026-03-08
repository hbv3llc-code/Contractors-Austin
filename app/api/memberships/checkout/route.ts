import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS = {
  featured_monthly: process.env.STRIPE_FEATURED_MONTHLY_PRICE_ID!,
  featured_annual: process.env.STRIPE_FEATURED_ANNUAL_PRICE_ID!,
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  premium_annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!,
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan") as "featured" | "premium";
    const cycle = (searchParams.get("cycle") as "monthly" | "annual") ?? "monthly";

    if (!["featured", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceKey = `${plan}_${cycle}` as keyof typeof PRICE_IDS;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 400 });
    }

    const contractor = await prisma.contractor.findFirst({
      where: { email: user.email! },
      include: { membership: true },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email!,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard/billing?success=true`,
      cancel_url: `${siteUrl}/dashboard/billing`,
      metadata: {
        userId: user.id,
        contractorId: contractor?.id ?? "",
        plan,
        cycle,
      },
    });

    return NextResponse.redirect(session.url!);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
