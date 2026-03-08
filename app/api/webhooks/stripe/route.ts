import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const contractorId = session.metadata?.contractorId;
        const plan = session.metadata?.plan as "featured" | "premium";
        const cycle = session.metadata?.cycle as "monthly" | "annual";

        if (!contractorId || !plan) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        await prisma.membership.upsert({
          where: { contractorId },
          update: {
            planType: plan,
            billingCycle: cycle,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "active",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          create: {
            contractorId,
            planType: plan,
            billingCycle: cycle,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "active",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Update contractor status to claimed if unclaimed
        const contractor = await prisma.contractor.update({
          where: { id: contractorId },
          data: { verifiedStatus: "claimed" },
        }).catch(() => null);

        // Send subscription confirmed email
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
        // Determine plan from price ID
        const priceId = planItem.price.id;
        let planType: "featured" | "premium" | "basic" = "basic";
        if (priceId === process.env.STRIPE_FEATURED_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_FEATURED_ANNUAL_PRICE_ID) {
          planType = "featured";
        } else if (priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID) {
          planType = "premium";
        }

        await prisma.membership.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            planType,
            status: subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "cancelled",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const cancelled = await prisma.membership.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          include: { contractor: true },
        });
        await prisma.membership.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "cancelled", planType: "basic" },
        });
        if (cancelled?.contractor?.email) {
          const periodEnd = cancelled.currentPeriodEnd
            ? cancelled.currentPeriodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "the end of your billing period";
          sendSubscriptionCancelledEmail(
            cancelled.contractor.email,
            cancelled.contractor.name,
            periodEnd
          ).catch((err) => console.error("Failed to send cancellation email:", err));
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const failedMembership = await prisma.membership.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
            include: { contractor: true },
          });
          await prisma.membership.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: "past_due" },
          });
          if (failedMembership?.contractor?.email) {
            const amount = invoice.amount_due
              ? `$${(invoice.amount_due / 100).toFixed(2)}`
              : "your subscription amount";
            sendPaymentFailedEmail(
              failedMembership.contractor.email,
              failedMembership.contractor.name,
              amount
            ).catch((err) => console.error("Failed to send payment failed email:", err));
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await prisma.membership.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: {
              status: "active",
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
          // Receipt is sent by Stripe directly if configured in Dashboard
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
