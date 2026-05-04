export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminClaimActions from "./claim-actions";

export const metadata: Metadata = { title: "Claim Requests | Admin" };

async function getClaims() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ClaimRequest")
      .select("id, listingId, memberId, verificationMethod, status, sentAt, adminNotes, ImportedListing(businessName, city, phone, email)")
      .order("sentAt", { ascending: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((c: any) => ({
      ...c,
      listing: Array.isArray(c.ImportedListing) ? c.ImportedListing[0] : c.ImportedListing,
    }));
  } catch { return []; }
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminClaimsPage() {
  const claims = await getClaims();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pending = claims.filter((c: any) => c.status === "pending");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const others = claims.filter((c: any) => c.status !== "pending");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Claim Requests</h1>

      {/* Pending */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center text-muted-foreground shadow-sm">
            No pending claims
          </div>
        ) : (
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {pending.map((claim: any) => (
              <div key={claim.id} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{claim.listing?.businessName ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {claim.listing?.city} · {claim.verificationMethod.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Member: {claim.memberId} · Sent: {new Date(claim.sentAt).toLocaleString()}
                    </p>
                    {claim.adminNotes && (
                      <p className="text-xs text-gray-500 mt-1 italic">{claim.adminNotes}</p>
                    )}
                  </div>
                  <AdminClaimActions claimId={claim.id} currentStatus={claim.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {others.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">History</h2>
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Business</th>
                  <th className="px-4 py-3 text-left font-semibold">Method</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {others.map((claim: any) => (
                  <tr key={claim.id}>
                    <td className="px-4 py-3 font-medium">{claim.listing?.businessName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {claim.verificationMethod.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[claim.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(claim.sentAt).toLocaleDateString()}
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
