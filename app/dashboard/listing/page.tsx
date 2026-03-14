export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ListingSetupForm } from "@/components/forms/listing-setup-form";
import { PhotoUpload } from "@/components/dashboard/photo-upload";
import { DocumentUpload } from "@/components/dashboard/document-upload";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Listing" };

export default async function ListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let contractor = null;
  try {
    if (user) {
      contractor = await prisma.contractor.findFirst({
        where: { OR: [{ userId: user.id }, { email: user.email! }] },
        include: {
          services: { include: { service: true } },
          membership: true,
          photos: { orderBy: { sortOrder: "asc" } },
        },
      });
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
    </div>
  );
}
