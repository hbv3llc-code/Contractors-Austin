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
      where: { email: user.email },
      include: { membership: true },
    });

    if (!contractor?.membership?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`;
    const session = await stripe.billingPortal.sessions.create({
      customer: contractor.membership.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/memberships/portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
