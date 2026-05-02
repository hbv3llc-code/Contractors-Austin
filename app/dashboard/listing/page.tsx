export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { ListingSetupForm } from "@/components/forms/listing-setup-form";
import { PhotoUpload } from "@/components/dashboard/photo-upload";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import { HoursEditor } from "@/components/dashboard/hours-editor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Listing" };

export default async function ListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contractor: any = null;
  try {
    if (user) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data } = await admin
        .from("Contractor")
        .select("*, ContractorService(*, Service(*)), Membership(*), ContractorPhoto(id, url, caption, sortOrder)")
        .or(`userId.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle();
      if (data) {
        // Normalize Supabase response to match component expectations
        contractor = {
          ...data,
          photos: [...(data.ContractorPhoto ?? [])].sort((a: any, b: any) => a.sortOrder - b.sortOrder),
          membership: Array.isArray(data.Membership) ? data.Membership[0] : data.Membership,
          services: (data.ContractorService ?? []).map((cs: any) => ({ ...cs, service: cs.Service })),
        };
      }
    }
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Listing</h1>
        <p className="text-muted-foreground mt-1">
          {contractor ? "Update your contractor profile" : "Set up your contractor profile"}
        </p>
      </div>
      <ListingSetupForm contractor={contractor} userEmail={user?.email ?? ""} />
      {contractor && (
        <PhotoUpload
          contractorId={contractor.id}
          initialPhotos={contractor.photos}
          planType={contractor.membership?.planType ?? "basic"}
        />
      )}
      {contractor && (
        <DocumentUpload
          licenseFileUrl={contractor.licenseFileUrl ?? null}
          insuranceFileUrl={contractor.insuranceFileUrl ?? null}
          insuranceVerified={contractor.insuranceVerified}
        />
      )}
      {contractor && (
        <HoursEditor
          contractorId={contractor.id}
          initialHours={contractor.hours}
        />
      )}
    </div>
  );
}
