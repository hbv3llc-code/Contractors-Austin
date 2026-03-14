import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contractor = await prisma.contractor.findFirst({
      where: { OR: [{ userId: user.id }, { email: user.email! }] },
      include: { membership: true },
    });

    if (!contractor?.membership?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Cancel at period end — contractor keeps access until billing period ends
    await stripe.subscriptions.update(contractor.membership.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/dashboard/billing?cancelled=true`);
  } catch (error) {
    console.error("POST /api/memberships/cancel error:", error);
    return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
  }
}
