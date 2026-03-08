"use client";

import { useState } from "react";

interface AdminClaimActionsProps {
  claimId: string;
  currentStatus: string;
}

export default function AdminClaimActions({ claimId, currentStatus }: AdminClaimActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  if (status !== "pending") {
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
        status === "verified" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      }`}>
        {status}
      </span>
    );
  }

  async function updateClaim(action: "approve" | "reject") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setStatus(action === "approve" ? "verified" : "rejected");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => updateClaim("approve")}
        disabled={loading}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
      >
        Approve
      </button>
      <button
        onClick={() => updateClaim("reject")}
        disabled={loading}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}
