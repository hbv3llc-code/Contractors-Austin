"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ContractorSummary {
  id: string;
  verifiedStatus: string;
  planType: string;
}

export default function AdminMemberActions({ contractor }: { contractor: ContractorSummary }) {
  const [status, setStatus] = useState(contractor.verifiedStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/contractors/${contractor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedStatus: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        setMessage("Status updated successfully");
      } else {
        setMessage("Failed to update status");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
      <h2 className="font-bold text-foreground">Admin Actions</h2>

      {message && (
        <p className={`text-xs rounded p-2 ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </p>
      )}

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Verification Status</p>
        <div className="space-y-1.5">
          {["unclaimed", "claimed", "verified"].map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={saving || status === s}
              className={`w-full rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                status === s
                  ? "bg-primary text-white font-semibold"
                  : "border border-border hover:bg-gray-50 text-foreground"
              } disabled:opacity-60`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <a
          href={`/contractor/${contractor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          View Public Profile ↗
        </a>
      </div>
    </div>
  );
}
