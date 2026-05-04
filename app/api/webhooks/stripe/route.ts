import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendSubscriptionConfirmedEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const contractorId = session.metadata?.contractorId;
        const plan = session.metadata?.plan as "featured" | "premium";
        const cycle = session.metadata?.cycle as "monthly" | "annual";

        if (!contractorId || !plan) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        await admin.from("Membership").upsert(
          {
            contractorId,
            planType: plan,
            billingCycle: cycle,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "active",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          },
          { onConflict: "contractorId" }
        );

        let contractor: { email: string | null; name: string } | null = null;
        try {
          const { data } = await admin
            .from("Contractor")
            .update({ verifiedStatus: "claimed" })
            .eq("id", contractorId)
            .select("email, name")
            .single();
          contractor = data;
        } catch {}

        if (contractor?.email) {
          sendSubscriptionConfirmedEmail(
            contractor.email,
            contractor.name,
            plan.charAt(0).toUpperCase() + plan.slice(1)
          ).catch((err) => console.error("Failed to send subscription confirmed email:", err));
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const planItem = subscription.items.data[0];
        const priceId = planItem.price.id;
        let planType: "featured" | "premium" | "basic" = "basic";
        if (priceId === process.env.STRIPE_FEATURED_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_FEATURED_ANNUAL_PRICE_ID) {
          planType = "featured";
        } else if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID) {
          planType = "premium";
        }

        await admin
          .from("Membership")
          .update({
            planType,
            status: subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "cancelled",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripeSubscriptionId", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: cancelled } = await admin
          .from("Membership")
          .select("contractorId, currentPeriodEnd, Contractor(email, name)")
          .eq("stripeSubscriptionId", subscription.id)
          .maybeSingle();

        await admin
          .from("Membership")
          .update({ status: "cancelled", planType: "basic" })
          .eq("stripeSubscriptionId", subscription.id);

        if (cancelled) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const contractor = Array.isArray(cancelled.Contractor) ? cancelled.Contractor[0] : cancelled.Contractor as any;
          if (contractor?.email) {
            const periodEnd = cancelled.currentPeriodEnd
              ? new Date(cancelled.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : "the end of your billing period";
            sendSubscriptionCancelledEmail(
              contractor.email,
              contractor.name,
              periodEnd
            ).catch((err) => console.error("Failed to send cancellation email:", err));
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const { data: failedMembership } = await admin
            .from("Membership")
            .select("contractorId, Contractor(email, name)")
            .eq("stripeSubscriptionId", invoice.subscription as string)
            .maybeSingle();

          await admin
            .from("Membership")
            .update({ status: "past_due" })
            .eq("stripeSubscriptionId", invoice.subscription as string);

          if (failedMembership) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const contractor = Array.isArray(failedMembership.Contractor) ? failedMembership.Contractor[0] : failedMembership.Contractor as any;
            if (contractor?.email) {
              const amount = invoice.amount_due
                ? `$${(invoice.amount_due / 100).toFixed(2)}`
                : "your subscription amount";
              sendPaymentFailedEmail(
                contractor.email,
                contractor.name,
                amount
              ).catch((err) => console.error("Failed to send payment failed email:", err));
            }
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await admin
            .from("Membership")
            .update({
              status: "active",
              currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            })
            .eq("stripeSubscriptionId", invoice.subscription as string);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
