export const dynamic = "force-dynamic";

import Link from "next/link";
import { CheckCircle, Phone, Mail, Clock, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/utils";
import LeadStatusSelect from "./lead-status-select";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Leads" };

const statusConfig = {
  new: { label: "New", variant: "featured" as const },
  contacted: { label: "Contacted", variant: "default" as const },
  quote_sent: { label: "Quote Sent", variant: "secondary" as const },
  job_won: { label: "Won ✓", variant: "success" as const },
  job_lost: { label: "Lost", variant: "destructive" as const },
  no_response: { label: "No Response", variant: "secondary" as const },
  spam: { label: "Spam", variant: "warning" as const },
};

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let leads: any[] = [];

  try {
    if (user) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: contractor } = await admin
        .from("Contractor")
        .select("id")
        .or(`userId.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();

      if (contractor) {
        const { data } = await admin
          .from("Lead")
          .select("*, Service(id, name)")
          .eq("contractorId", contractor.id)
          .neq("status", "spam")
          .order("createdAt", { ascending: false });
        leads = (data ?? []).map((l: any) => ({ ...l, service: l.Service }));
      }
    }
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Leads</h1>
          <p className="text-muted-foreground mt-1">{leads.length} total leads</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
          <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No leads yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete your profile and upgrade to Featured or Premium to start receiving quote requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard/listing">Complete Profile</Link>
            </Button>
            <Button asChild>
              <Link href="/pricing">Upgrade Plan</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const status = statusConfig[lead.status as keyof typeof statusConfig] ?? statusConfig.new;
            return (
              <div key={lead.id} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">{lead.name}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {lead.isMultiQuote && (
                        <Badge variant="secondary" className="text-xs">Multi-quote</Badge>
                      )}
                    </div>
                    {lead.service && (
                      <p className="text-sm text-muted-foreground mb-1">{lead.service.name}</p>
                    )}
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {lead.projectDescription}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${lead.email}`} className="hover:text-primary">{lead.email}</a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${lead.phone}`} className="hover:text-primary">{formatPhone(lead.phone)}</a>
                        </div>
                      )}
                      {lead.budgetRange && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          {lead.budgetRange}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                    {lead.preferredContactDay && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Prefers: {lead.preferredContactDay}{lead.preferredContactTime ? `, ${lead.preferredContactTime}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
