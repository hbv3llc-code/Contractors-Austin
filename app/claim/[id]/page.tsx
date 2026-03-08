import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ClaimWizard from "./claim-wizard";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await prisma.importedListing.findUnique({ where: { id: params.id } });
  if (!listing) return { title: "Claim Not Found" };
  return {
    title: `Claim ${listing.businessName} | ContractorsAustin`,
    robots: { index: false },
  };
}

export default async function ClaimPage({ params }: Props) {
  const listing = await prisma.importedListing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      businessName: true,
      address: true,
      city: true,
      phone: true,
      email: true,
      website: true,
      status: true,
    },
  });

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
