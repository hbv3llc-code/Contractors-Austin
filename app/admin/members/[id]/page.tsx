export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import AdminMemberActions from "./member-actions";

export const metadata: Metadata = { title: "Manage Member | Admin" };

export default async function AdminMemberDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contractor: any = null;
  try {
    const { data } = await admin
      .from("Contractor")
      .select("*, Membership(planType, status), ContractorService(id, Service(id, name, slug))")
      .eq("id", params.id)
      .maybeSingle();
    if (data) {
      const membership = Array.isArray(data.Membership) ? data.Membership[0] : data.Membership;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const services = (data.ContractorService ?? []).map((cs: any) => ({
        ...cs,
        service: Array.isArray(cs.Service) ? cs.Service[0] : cs.Service,
      }));

      // Fetch lead and review counts + recent data
      const [{ data: leads }, { count: leadCount }, { count: reviewCount }] = await Promise.all([
        admin.from("Lead").select("id, name, status, createdAt, Service(name)").eq("contractorId", data.id).order("createdAt", { ascending: false }).limit(10),
        admin.from("Lead").select("*", { count: "exact", head: true }).eq("contractorId", data.id),
        admin.from("Review").select("*", { count: "exact", head: true }).eq("contractorId", data.id),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalizedLeads = (leads ?? []).map((l: any) => ({
        ...l,
        service: Array.isArray(l.Service) ? l.Service[0] : l.Service,
      }));

      contractor = {
        ...data,
        membership,
        services,
        leads: normalizedLeads,
        _count: { leads: leadCount ?? 0, reviews: reviewCount ?? 0 },
      };
    }
  } catch {}

  if (!contractor) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/members" className="text-sm text-muted-foreground hover:text-primary">
          ← Members
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{contractor.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile summary */}
        <div className="md:col-span-2 rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{contractor.name}</h1>
              <p className="text-sm text-muted-foreground">{contractor.city}, TX</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={
                contractor.verifiedStatus === "verified" ? "success" :
                contractor.verifiedStatus === "claimed" ? "featured" : "secondary"
              }>
                {contractor.verifiedStatus}
              </Badge>
              <Badge variant={
                contractor.membership?.planType === "premium" ? "premium" :
                contractor.membership?.planType === "featured" ? "featured" : "secondary"
              }>
                {contractor.membership?.planType ?? "basic"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Email:</span> {contractor.email ?? "—"}</div>
            <div><span className="text-muted-foreground">Phone:</span> {contractor.phone ?? "—"}</div>
            <div><span className="text-muted-foreground">Website:</span> {contractor.website ? <a href={contractor.website} className="text-primary hover:underline truncate block max-w-[180px]">{contractor.website}</a> : "—"}</div>
            <div><span className="text-muted-foreground">License #:</span> {contractor.licenseNumber ?? "—"}</div>
            <div><span className="text-muted-foreground">Leads:</span> {contractor._count.leads}</div>
            <div><span className="text-muted-foreground">Reviews:</span> {contractor._count.reviews}</div>
            <div><span className="text-muted-foreground">Rating:</span> {contractor.rating?.toFixed(1) ?? "—"}</div>
            <div><span className="text-muted-foreground">Joined:</span> {new Date(contractor.createdAt).toLocaleDateString()}</div>
          </div>

          {(contractor.licenseFileUrl || contractor.insuranceFileUrl) && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Uploaded Documents</p>
              <div className="flex flex-wrap gap-3">
                {contractor.licenseFileUrl && (
                  <a href={contractor.licenseFileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    📄 License File ↗
                  </a>
                )}
                {contractor.insuranceFileUrl && (
                  <a href={contractor.insuranceFileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    🛡️ Insurance File ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {contractor.services.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Services</p>
              <div className="flex flex-wrap gap-1.5">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {contractor.services.map((cs: any) => (
                  <span key={cs.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                    {cs.service?.name ?? "—"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin actions */}
        <AdminMemberActions contractor={{
          id: contractor.id,
          verifiedStatus: contractor.verifiedStatus,
          planType: contractor.membership?.planType ?? "basic",
          insuranceVerified: contractor.insuranceVerified,
        }} />
      </div>

      {/* Recent leads */}
      {contractor.leads.length > 0 && (
        <div className="rounded-xl border border-border bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-foreground">Recent Leads</h2>
          </div>
          <div className="divide-y divide-border">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {contractor.leads.map((lead: any) => (
              <div key={lead.id} className="px-6 py-3 flex justify-between text-sm">
                <div>
                  <span className="font-medium">{lead.name}</span>
                  {lead.service && <span className="text-muted-foreground"> · {lead.service.name}</span>}
                </div>
                <div className="text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
