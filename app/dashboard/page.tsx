export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Inbox, Star, Settings, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard",
};

async function getContractorData(userId: string, userEmail: string) {
  try {
    const contractor = await prisma.contractor.findFirst({
      where: { OR: [{ userId }, { email: userEmail }] },
      include: {
        membership: true,
        leads: { where: { status: "new" }, take: 5, orderBy: { createdAt: "desc" } },
        reviews: { where: { status: "pending" }, take: 3 },
      },
    });

    return contractor;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const contractor = await getContractorData(user?.id ?? "", user?.email ?? "");

  const plan = contractor?.membership?.planType ?? "basic";
  const newLeads = contractor?.leads?.length ?? 0;
  const completeness = contractor?.profileCompleteness ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your listing, leads, and account</p>
      </div>

      {/* Plan status */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">Current Plan:</span>
              <Badge variant={plan === "premium" ? "premium" : plan === "featured" ? "featured" : "secondary"}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </Badge>
              {contractor?.membership?.status === "active" && (
                <Badge variant="success">Active</Badge>
              )}
            </div>
            {contractor?.membership?.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Next billing: {new Date(contractor.membership.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
          {plan === "basic" && (
            <Button asChild>
              <Link href="/pricing">Upgrade to Get Leads →</Link>
            </Button>
          )}
          {plan !== "basic" && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/billing">Manage Billing</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Profile completeness */}
      {contractor && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Profile Completeness</h2>
            <span className="text-sm font-bold text-primary">{completeness}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
            <div
              className="bg-primary h-2.5 rounded-full transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Complete your profile to improve search rankings and build trust.{" "}
                <Link href="/dashboard/listing" className="font-medium text-primary hover:underline">
                  Update listing →
                </Link>
              </span>
            </div>
          )}
          {completeness === 100 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Your profile is complete!
            </div>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">New Leads</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{newLeads}</p>
          <Link href="/dashboard/leads" className="text-xs text-primary hover:underline mt-1 block">
            View all leads →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Rating</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {contractor?.rating?.toFixed(1) ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {contractor?.reviewCount ?? 0} reviews
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Response Rate</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {contractor?.responseRate ? `${Math.round(contractor.responseRate * 100)}%` : "—"}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Update My Listing", href: "/dashboard/listing", icon: Settings },
            { label: "View My Leads", href: "/dashboard/leads", icon: Inbox },
            { label: "See Public Profile", href: contractor ? `/contractor/${contractor.slug}` : "/dashboard", icon: ArrowRight },
            { label: "Manage Billing", href: "/dashboard/billing", icon: Settings },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      {/* No listing prompt */}
      {!contractor && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Complete Your Listing Setup</h3>
              <p className="text-sm text-gray-600 mb-3">
                You don't have a contractor profile yet. Set up your listing to start appearing in
                search results and receiving leads.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/listing">Set Up My Listing →</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
