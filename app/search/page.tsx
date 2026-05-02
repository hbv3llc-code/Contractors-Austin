export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { Search, MapPin, Filter } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ContractorCard } from "@/components/contractor/contractor-card";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Contractors in Austin, TX",
  description:
    "Search and compare home service contractors in Austin, TX and surrounding cities. Filter by service, location, and rating.",
};

interface SearchPageProps {
  searchParams: {
    service?: string;
    location?: string;
    q?: string;
    page?: string;
  };
}

async function getSearchResults(searchParams: SearchPageProps["searchParams"]) {
  const { service, location, q } = searchParams;
  try {
    const admin = createAdminClient();
    let query = admin
      .from("Contractor")
      .select("*, ContractorService(id, isPrimary, Service(id, name, slug)), Membership(planType, status)")
      .neq("verifiedStatus", "unclaimed")
      .order("rating", { ascending: false })
      .limit(20);

    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

    const { data } = await query;
    if (!data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let results: any[] = data.map((c: any) => ({
      ...c,
      services: (c.ContractorService ?? []).map((cs: any) => ({ ...cs, service: cs.Service })),
      membership: Array.isArray(c.Membership) ? c.Membership[0] : c.Membership,
    }));

    // Client-side filter by service slug
    if (service) {
      results = results.filter((c) => c.services.some((s: any) => s.service?.slug === service));
    }

    return results;
  } catch {
    return [];
  }
}

async function getServices() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("Service")
      .select("id, name, slug")
      .eq("isPublic", true)
      .eq("isActive", true)
      .order("sortOrder", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

async function getLocations() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("Location")
      .select("id, name, slug")
      .eq("isActive", true)
      .order("name", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [contractors, services, locations] = await Promise.all([
    getSearchResults(searchParams),
    getServices(),
    getLocations(),
  ]);

  const currentService = services.find((s) => s.slug === searchParams.service);
  const currentLocation = locations.find((l) => l.slug === searchParams.location);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b border-border py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
                <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  defaultValue={searchParams.q}
                  placeholder="Search contractors..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-gray-400 outline-none"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm min-w-[200px]">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {currentLocation?.name ?? "All Austin Metro"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Results
                </h3>

                {/* Service Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Service Type
                  </label>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    <Link
                      href="/search"
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        !searchParams.service
                          ? "bg-blue-50 text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      All Services
                    </Link>
                    {services.map((svc) => (
                      <Link
                        key={svc.id}
                        href={`/search?service=${svc.slug}${searchParams.location ? `&location=${searchParams.location}` : ""}`}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          searchParams.service === svc.slug
                            ? "bg-blue-50 text-primary font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {svc.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City / Area
                  </label>
                  <div className="space-y-1">
                    <Link
                      href={searchParams.service ? `/search?service=${searchParams.service}` : "/search"}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        !searchParams.location
                          ? "bg-blue-50 text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      All Cities
                    </Link>
                    {locations.map((loc) => (
                      <Link
                        key={loc.id}
                        href={`/search?location=${loc.slug}${searchParams.service ? `&service=${searchParams.service}` : ""}`}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          searchParams.location === loc.slug
                            ? "bg-blue-50 text-primary font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {loc.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="rounded-xl bg-blue-50 p-4 text-center">
                  <p className="text-sm font-medium text-foreground mb-2">Are you a contractor?</p>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/pricing">List Your Business</Link>
                  </Button>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {currentService
                      ? `${currentService.name} in ${currentLocation?.name ?? "Austin Metro"}`
                      : currentLocation
                      ? `Contractors in ${currentLocation.name}, TX`
                      : "All Contractors in Austin Metro"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {contractors.length} {contractors.length === 1 ? "contractor" : "contractors"} found
                  </p>
                </div>
              </div>

              {contractors.length === 0 ? (
                <div className="rounded-xl border border-border bg-white p-12 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No contractors found in this area yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to list your business and reach Austin homeowners.
                  </p>
                  <Button asChild>
                    <Link href="/pricing">List Your Business Free →</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contractors.map((contractor) => (
                    <ContractorCard
                      key={contractor.id}
                      contractor={contractor as Parameters<typeof ContractorCard>[0]["contractor"]}
                      showPhone={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
