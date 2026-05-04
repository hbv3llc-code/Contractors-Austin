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
      .select("id, Membership(stripeCustomerId)")
      .or(`userId.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = contractor ? (Array.isArray(contractor.Membership) ? contractor.Membership[0] : contractor.Membership) as any : null;

    if (!membership?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`;
    const session = await stripe.billingPortal.sessions.create({
      customer: membership.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/memberships/portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
