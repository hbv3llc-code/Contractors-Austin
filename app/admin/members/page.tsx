export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Members | Admin" };

async function getContractors(search?: string) {
  try {
    return await prisma.contractor.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        membership: true,
        _count: { select: { leads: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch { return []; }
}

const planColor: Record<string, string> = {
  premium: "premium",
  featured: "featured",
  basic: "secondary",
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const contractors = await getContractors(searchParams.q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Members ({contractors.length})</h1>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by name, email, or city..."
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Business</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">Leads</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">Reviews</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contractors.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No contractors found
                </td>
              </tr>
            ) : (
              contractors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/contractor/${c.slug}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {c.name}
                    </Link>
                    {c.city && <p className="text-xs text-muted-foreground">{c.city}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {c.membership ? (
                      <Badge variant={planColor[c.membership.planType] as "premium" | "featured" | "secondary"}>
                        {c.membership.planType}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">basic</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      c.verifiedStatus === "verified" ? "text-green-600" :
                      c.verifiedStatus === "claimed" ? "text-blue-600" :
                      "text-gray-400"
                    }`}>
                      {c.verifiedStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c._count.leads}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{c._count.reviews}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/members/${c.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
