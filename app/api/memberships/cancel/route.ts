import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: contractor } = await admin
      .from("Contractor")
      .select("id, Membership(stripeSubscriptionId)")
      .or(`userId.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = contractor ? (Array.isArray(contractor.Membership) ? contractor.Membership[0] : contractor.Membership) as any : null;

    if (!membership?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/dashboard/billing?cancelled=true`);
  } catch (error) {
    console.error("POST /api/memberships/cancel error:", error);
    return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
  }
}
