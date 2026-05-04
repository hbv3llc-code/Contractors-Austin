export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import ReviewModerationRow from "./review-moderation-row";

export const metadata: Metadata = { title: "Review Moderation | Admin" };

async function getPendingReviews() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("Review")
      .select("id, rating, reviewerName, reviewText, status, createdAt, contractorId, Contractor(name, slug)")
      .eq("status", "pending")
      .order("createdAt", { ascending: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({
      ...r,
      contractor: Array.isArray(r.Contractor) ? r.Contractor[0] : r.Contractor,
    }));
  } catch { return []; }
}

async function getRecentReviews() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("Review")
      .select("id, rating, reviewerName, status, createdAt, contractorId, Contractor(name, slug)")
      .neq("status", "pending")
      .order("createdAt", { ascending: false })
      .limit(20);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((r: any) => ({
      ...r,
      contractor: Array.isArray(r.Contractor) ? r.Contractor[0] : r.Contractor,
    }));
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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pending.map((review: any) => (
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recent.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{r.reviewerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.contractor?.name ?? "—"}</td>
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
