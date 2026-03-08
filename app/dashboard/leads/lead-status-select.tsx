"use client";

import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quote_sent", label: "Quote Sent" },
  { value: "job_won", label: "Job Won ✓" },
  { value: "job_lost", label: "Job Lost" },
  { value: "no_response", label: "No Response" },
  { value: "spam", label: "Spam" },
] as const;

interface LeadStatusSelectProps {
  leadId: string;
  currentStatus: string;
}

export default function LeadStatusSelect({ leadId, currentStatus }: LeadStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch {
      // Revert on error — status stays unchanged
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring outline-none disabled:opacity-60"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
