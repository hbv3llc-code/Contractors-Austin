import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ContractorCard } from "@/components/contractor/contractor-card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const revalidate = 3600;

interface Props {
  params: { locationSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const location = await prisma.location.findUnique({ where: { slug: params.locationSlug } }).catch(() => null);
  if (!location) return {};
  return {
    title: `Contractors in ${location.name}, TX | Find Local Pros`,
    description: `Find trusted contractors in ${location.name}, TX. Compare ratings, read reviews, and get free quotes from verified local pros.`,
  };
}

export default async function LocationPage({ params }: Props) {
  const location = await prisma.location.findUnique({
    where: { slug: params.locationSlug },
    include: {
      parent: true,
      children: { where: { isActive: true }, orderBy: { name: "asc" } },
    },
  }).catch(() => null);

  if (!location || !location.isActive) notFound();

  const contractorLocations = await prisma.contractorLocation.findMany({
    where: { locationId: location.id },
    include: {
      contractor: {
        include: {
          membership: true,
          services: { include: { service: true } },
        },
      },
    },
    orderBy: [
      { contractor: { membership: { planType: "desc" } } },
      { contractor: { rating: "desc" } },
    ],
    take: 40,
  }).catch(() => []);

  const contractors = contractorLocations.map((cl) => cl.contractor);

  // Get popular services for this location (for cross-links)
  const services = await prisma.service.findMany({
    where: { isPublic: true, isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 10,
  }).catch(() => []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/locations" className="hover:text-primary">Service Areas</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{location.name}</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    Contractors in {location.name}, TX
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Find trusted local contractors in {location.name}. Compare ratings, read verified reviews, and get free quotes.
                </p>
              </div>

              {/* Neighborhood sub-areas */}
              {location.children.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Neighborhoods & Areas</h2>
                  <div className="flex flex-wrap gap-2">
                    {location.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/locations/${child.slug}`}
                        className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary bg-white transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">
                  {contractors.length} Contractor{contractors.length !== 1 ? "s" : ""} in {location.name}
                </p>
                <Link href="/search" className="text-sm text-primary hover:underline">
                  Advanced search →
                </Link>
              </div>

              {contractors.length === 0 ? (
                <div className="rounded-xl border border-border bg-white p-12 text-center shadow-sm">
                  <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No contractors listed yet</h3>
                  <p className="text-muted-foreground mb-4">
                    We're growing our network in {location.name}. Check back soon or search all Austin contractors.
                  </p>
                  <Link href="/search" className="text-primary hover:underline font-medium">
                    Search all contractors →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {contractors.map((contractor) => (
                    <ContractorCard key={contractor.id} contractor={contractor} showPhone />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0 space-y-4">
              {/* Services in this area */}
              {services.length > 0 && (
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-foreground mb-3">Services in {location.name}</h2>
                  <div className="space-y-1">
                    {services.map((svc) => (
                      <Link
                        key={svc.id}
                        href={`/services/${svc.slug}/${location.slug}`}
                        className="block text-sm text-gray-600 hover:text-primary py-1 hover:pl-1 transition-all"
                      >
                        {svc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
                <h3 className="font-semibold text-foreground mb-1">Are you a contractor?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get found by homeowners in {location.name}. Start free.
                </p>
                <Link
                  href="/signup"
                  className="block w-full text-center rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  List Your Business →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
