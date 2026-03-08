export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ListingSetupForm } from "@/components/forms/listing-setup-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Listing" };

export default async function ListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let contractor = null;
  try {
    if (user?.email) {
      contractor = await prisma.contractor.findFirst({
        where: { email: user.email },
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
    </div>
  );
}
