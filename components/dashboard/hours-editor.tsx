"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

type DayKey = typeof DAYS[number]["key"];

interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

type HoursMap = Record<DayKey, DayHours>;

function parseHours(raw: unknown): HoursMap {
  const defaults: HoursMap = {
    monday:    { open: true,  from: "08:00", to: "17:00" },
    tuesday:   { open: true,  from: "08:00", to: "17:00" },
    wednesday: { open: true,  from: "08:00", to: "17:00" },
    thursday:  { open: true,  from: "08:00", to: "17:00" },
    friday:    { open: true,  from: "08:00", to: "17:00" },
    saturday:  { open: false, from: "09:00", to: "14:00" },
    sunday:    { open: false, from: "09:00", to: "14:00" },
  };
  if (!raw || typeof raw !== "object") return defaults;
  const map = raw as Record<string, unknown>;
  const result = { ...defaults };
  for (const day of DAYS) {
    const entry = map[day.key];
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      result[day.key] = {
        open: Boolean(e.open),
        from: typeof e.from === "string" ? e.from : defaults[day.key].from,
        to:   typeof e.to   === "string" ? e.to   : defaults[day.key].to,
      };
    }
  }
  return result;
}

export function HoursEditor({
  contractorId,
  initialHours,
}: {
  contractorId: string;
  initialHours: unknown;
}) {
  const [hours, setHours] = useState<HoursMap>(() => parseHours(initialHours));
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function setDay(day: DayKey, patch: Partial<DayHours>) {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/hours`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractorId, hours }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save hours");
      }
      toast({ title: "Business hours saved" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold text-foreground">Business Hours</h2>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = hours[key];
          return (
            <div key={key} className="grid grid-cols-[120px_80px_1fr] items-center gap-3">
              <span className="text-sm font-medium text-foreground">{label}</span>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setDay(key, { open: !day.open })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    day.open ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      day.open ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12">
                  {day.open ? "Open" : "Closed"}
                </span>
              </label>

              {day.open ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.from}
                    onChange={(e) => setDay(key, { from: e.target.value })}
                    className="rounded-md border border-border px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={day.to}
                    onChange={(e) => setDay(key, { to: e.target.value })}
                    className="rounded-md border border-border px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Hours"}
        </Button>
      </div>
    </div>
  );
}
