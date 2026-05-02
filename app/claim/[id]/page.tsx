import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ClaimWizard from "./claim-wizard";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("ImportedListing").select("businessName").eq("id", params.id).maybeSingle();
    if (!data) return { title: "Claim Not Found" };
    return { title: `Claim ${data.businessName} | ContractorsAustin`, robots: { index: false } };
  } catch {
    return { title: "Claim Not Found" };
  }
}

export default async function ClaimPage({ params }: Props) {
  let listing = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ImportedListing")
      .select("id, businessName, address, city, phone, email, website, status")
      .eq("id", params.id)
      .maybeSingle();
    listing = data;
  } catch {}

  if (!listing) notFound();

  if (listing.status === "claimed") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full text-center">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
              <div className="text-4xl mb-4">🔒</div>
              <h1 className="text-xl font-bold text-foreground mb-2">Already Claimed</h1>
              <p className="text-gray-500 mb-6">
                <strong>{listing.businessName}</strong> has already been claimed. If you believe
                this is an error, please contact support.
              </p>
              <a href="/contact" className="text-primary text-sm hover:underline">
                Contact Support →
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ClaimWizard listing={listing} />
      <Footer />
    </>
  );
}
