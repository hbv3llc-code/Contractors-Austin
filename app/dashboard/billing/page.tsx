export const dynamic = "force-dynamic";

import Link from "next/link";
import { CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let membership = null;
  try {
    if (user?.email) {
      const contractor = await prisma.contractor.findFirst({
        where: { email: user.email },
        include: { membership: true },
      });
      membership = contractor?.membership;
    }
  } catch {}

  const plan = membership?.planType ?? "basic";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and payment method</p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-foreground capitalize">{plan}</span>
              {membership?.status && (
                <Badge variant={membership.status === "active" ? "success" : "warning"}>
                  {membership.status}
                </Badge>
              )}
            </div>
            {plan === "basic" && <p className="text-sm text-muted-foreground">Free forever</p>}
            {plan !== "basic" && membership?.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Renews {new Date(membership.currentPeriodEnd).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          {plan !== "basic" && membership?.stripeCustomerId && (
            <form action="/api/memberships/portal" method="POST">
              <Button type="submit" variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Manage Payment
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Upgrade */}
      {plan === "basic" && (
        <div className="rounded-xl border-2 border-primary bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-2">Upgrade Your Plan</h2>
          <p className="text-sm text-gray-500 mb-4">
            Unlock leads, phone visibility, and higher search placement with Featured or Premium.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Featured",
                price: "$9.99/mo",
                annual: "$99.99/yr",
                features: ["Phone visible", "Receive leads", "5 categories", "Tier 2 search"],
                plan: "featured",
              },
              {
                name: "Premium",
                price: "$19.99/mo",
                annual: "$199.99/yr",
                features: ["Everything in Featured", "Verified badge", "10 categories", "Tier 1 search", "Analytics"],
                plan: "premium",
              },
            ].map((tier) => (
              <div key={tier.plan} className="rounded-xl border border-border p-5">
                <h3 className="font-bold text-foreground mb-1">{tier.name}</h3>
                <p className="text-xl font-bold text-primary mb-1">{tier.price}</p>
                <p className="text-xs text-green-600 mb-3">or {tier.annual} (save 17%)</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  {tier.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                <Button asChild className="w-full gap-2">
                  <Link href={`/api/memberships/checkout?plan=${tier.plan}`}>
                    Upgrade to {tier.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel */}
      {plan !== "basic" && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-2">Cancel Subscription</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your listing will revert to the Basic (free) plan at the end of your billing period. You
            won't be charged again.
          </p>
          <form action="/api/memberships/cancel" method="POST">
            <Button type="submit" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Cancel Subscription
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
