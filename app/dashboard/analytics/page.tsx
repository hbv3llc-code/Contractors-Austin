export const dynamic = "force-dynamic";

import Link from "next/link";
import { TrendingUp, Inbox, CheckCircle, XCircle, Clock, Star, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contractor: any = null;
  try {
    if (user) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("Contractor")
        .select("id, rating, Membership(planType)")
        .or(`userId.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      if (data) {
        const membership = Array.isArray(data.Membership) ? data.Membership[0] : data.Membership;
        const { data: leads } = await admin.from("Lead").select("id, status, createdAt").eq("contractorId", data.id).order("createdAt", { ascending: false });
        const { data: reviews } = await admin.from("Review").select("id, rating, reviewerName, reviewText, createdAt").eq("contractorId", data.id).eq("status", "approved");
        contractor = { ...data, membership, leads: leads ?? [], reviews: reviews ?? [] };
      }
    }
  } catch {}

  const plan = contractor?.membership?.planType ?? "basic";

  if (plan !== "premium") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your leads and business performance</p>
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Premium Feature</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Analytics are available on the Premium plan. Upgrade to see lead trends, conversion rates, and more.
          </p>
          <Button asChild>
            <Link href="/pricing">Upgrade to Premium →</Link>
          </Button>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads: any[] = contractor?.leads ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: any[] = contractor?.reviews ?? [];

  // Lead status breakdown
  const statusCounts = leads.reduce((acc: Record<string, number>, lead: any) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const wonLeads = statusCounts["job_won"] ?? 0;
  const lostLeads = statusCounts["job_lost"] ?? 0;
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

  // Leads by month (last 6 months)
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    const count = leads.filter((l: any) => {
      const ld = new Date(l.createdAt);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    }).length;
    months.push({ label, count });
  }

  const maxMonthCount = Math.max(...months.map((m) => m.count), 1);

  const statCards = [
    { label: "Total Leads", value: leads.length, icon: Inbox, color: "bg-blue-50 text-blue-600" },
    { label: "Jobs Won", value: wonLeads, icon: CheckCircle, color: "bg-green-50 text-green-600" },
    { label: "Jobs Lost", value: lostLeads, icon: XCircle, color: "bg-red-50 text-red-600" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: "Avg Rating", value: contractor?.rating?.toFixed(1) ?? "—", icon: Star, color: "bg-amber-50 text-amber-500" },
    { label: "New / Pending", value: statusCounts["new"] ?? 0, icon: Clock, color: "bg-orange-50 text-orange-600" },
  ];

  const statusLabels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    quote_sent: "Quote Sent",
    job_won: "Job Won",
    job_lost: "Job Lost",
    no_response: "No Response",
    spam: "Spam",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Your business performance at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.color} mb-3`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Leads by month bar chart */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-5">Leads — Last 6 Months</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No leads yet</p>
        ) : (
          <div className="flex items-end gap-3 h-32">
            {months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-foreground">{m.count > 0 ? m.count : ""}</span>
                <div
                  className="w-full rounded-t-sm bg-primary transition-all"
                  style={{ height: `${Math.round((m.count / maxMonthCount) * 96)}px`, minHeight: m.count > 0 ? "4px" : "0" }}
                />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead status breakdown */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-4">Lead Status Breakdown</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]: [string, number]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted-foreground">{statusLabels[status] ?? status}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${Math.round((count / leads.length) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent reviews */}
      {reviews.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex-shrink-0 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-sm ${star <= review.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{review.reviewerName}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{review.reviewText}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
