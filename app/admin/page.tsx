export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Users, TrendingUp, Star, Inbox } from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats() {
  try {
    const [
      totalContractors,
      totalMembers,
      featuredCount,
      premiumCount,
      totalLeads,
      newLeads,
      pendingReviews,
      pendingClaims,
    ] = await Promise.all([
      prisma.contractor.count(),
      prisma.membership.count({ where: { planType: { not: "basic" } } }),
      prisma.membership.count({ where: { planType: "featured", status: "active" } }),
      prisma.membership.count({ where: { planType: "premium", status: "active" } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "new" } }),
      prisma.review.count({ where: { status: "pending" } }),
      prisma.claimRequest.count({ where: { status: "pending" } }),
    ]);
    return { totalContractors, totalMembers, featuredCount, premiumCount, totalLeads, newLeads, pendingReviews, pendingClaims };
  } catch {
    return { totalContractors: 0, totalMembers: 0, featuredCount: 0, premiumCount: 0, totalLeads: 0, newLeads: 0, pendingReviews: 0, pendingClaims: 0 };
  }
}

async function getRecentLeads() {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { contractor: { select: { name: true } }, service: { select: { name: true } } },
    });
  } catch { return []; }
}

export default async function AdminDashboard() {
  const [stats, recentLeads] = await Promise.all([getStats(), getRecentLeads()]);

  const mrr = (stats.featuredCount * 9.99 + stats.premiumCount * 19.99).toFixed(2);

  const statCards = [
    { label: "Total Contractors", value: stats.totalContractors, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Paying Members", value: stats.totalMembers, icon: TrendingUp, color: "bg-green-50 text-green-600" },
    { label: "MRR (est.)", value: `$${mrr}`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: "New Leads", value: stats.newLeads, icon: Inbox, color: "bg-orange-50 text-orange-600" },
    { label: "Pending Reviews", value: stats.pendingReviews, icon: Star, color: "bg-yellow-50 text-yellow-600" },
    { label: "Pending Claims", value: stats.pendingClaims, icon: Users, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.color} mb-3`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-4">Plan Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalContractors - stats.featuredCount - stats.premiumCount}</p>
            <p className="text-sm text-muted-foreground">Basic (Free)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.featuredCount}</p>
            <p className="text-sm text-muted-foreground">Featured ($9.99/mo)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.premiumCount}</p>
            <p className="text-sm text-muted-foreground">Premium ($19.99/mo)</p>
          </div>
        </div>
      </div>

      {/* Recent leads */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Recent Leads</h2>
        </div>
        <div className="divide-y divide-border">
          {recentLeads.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground text-center">No leads yet</p>
          ) : (
            recentLeads.map((lead) => (
              <div key={lead.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.service?.name ?? "General"} → {lead.contractor.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    lead.status === "new" ? "bg-blue-100 text-blue-700" :
                    lead.status === "job_won" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {lead.status.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
