"use client";

import { useState } from "react";

interface Review {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  reviewText: string;
  projectType?: string | null;
  createdAt: Date;
  contractor: { name: string; slug: string };
}

export default function ReviewModerationRow({ review }: { review: Review }) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);

  if (status !== "pending") return null;

  async function moderate(action: "approve" | "reject") {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setStatus(action === "approve" ? "approved" : "rejected");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{review.reviewerName}</span>
            <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
            <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            For <strong>{review.contractor.name}</strong>
            {review.projectType ? ` · ${review.projectType}` : ""}
            {" · "}{new Date(review.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{review.reviewText}</p>
          <p className="text-xs text-muted-foreground mt-2">{review.reviewerEmail}</p>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => moderate("approve")}
            disabled={loading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => moderate("reject")}
            disabled={loading}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
