export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ReviewModerationRow from "./review-moderation-row";

export const metadata: Metadata = { title: "Review Moderation | Admin" };

async function getPendingReviews() {
  try {
    return await prisma.review.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: { contractor: { select: { name: true, slug: true } } },
    });
  } catch { return []; }
}

async function getRecentReviews() {
  try {
    return await prisma.review.findMany({
      where: { status: { not: "pending" } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { contractor: { select: { name: true, slug: true } } },
    });
  } catch { return []; }
}

export default async function AdminReviewsPage() {
  const [pending, recent] = await Promise.all([getPendingReviews(), getRecentReviews()]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Review Moderation</h1>

      {/* Pending */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center text-muted-foreground shadow-sm">
            No pending reviews — all caught up!
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((review) => (
              <ReviewModerationRow key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Recently Moderated</h2>
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Reviewer</th>
                  <th className="px-4 py-3 text-left font-semibold">Contractor</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{r.reviewerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.contractor.name}</td>
                    <td className="px-4 py-3">{"★".repeat(r.rating)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        r.status === "approved" ? "text-green-600" : "text-red-600"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
