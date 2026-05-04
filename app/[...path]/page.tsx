export const revalidate = 3600;

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ContractorCard } from "@/components/contractor/contractor-card";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";

interface PathPageProps {
  params: { path: string[] };
}

const STATIC_ROUTES = new Set([
  "", "search", "pricing", "how-it-works", "contact", "privacy", "terms",
  "get-quotes", "login", "signup", "dashboard", "admin", "guides", "projects",
  "contractor", "claim", "api",
]);

async function resolvePageType(slug: string) {
  const admin = createAdminClient();

  // Check if it's a pure service page
  let service = null;
  try {
    const { data } = await admin
      .from("Service")
      .select("id, name, slug, description, isPublic, isActive")
      .eq("slug", slug)
      .eq("isPublic", true)
      .eq("isActive", true)
      .maybeSingle();
    service = data;
  } catch {}
  if (service) return { type: "service" as const, service, location: null };

  // Check if it ends with -contractors (location page)
  if (slug.endsWith("-contractors")) {
    const locationSlug = slug.replace(/-contractors$/, "");
    let location = null;
    try {
      const { data } = await admin
        .from("Location")
        .select("id, name, slug, isActive")
        .eq("slug", locationSlug)
        .eq("isActive", true)
        .maybeSingle();
      location = data;
    } catch {}
    if (location) return { type: "location" as const, service: null, location };
  }

  // Check for service+location combo by fetching all and matching
  let services: { id: string; name: string; slug: string; description: string | null }[] = [];
  let locations: { id: string; name: string; slug: string }[] = [];
  try {
    const [{ data: svcs }, { data: locs }] = await Promise.all([
      admin.from("Service").select("id, name, slug, description").eq("isPublic", true).eq("isActive", true),
      admin.from("Location").select("id, name, slug").eq("isActive", true),
    ]);
    services = svcs ?? [];
    locations = locs ?? [];
  } catch {}

  for (const svc of services) {
    for (const loc of locations) {
      if (slug === `${loc.slug}-${svc.slug}`) {
        return { type: "service_location" as const, service: svc, location: loc };
      }
    }
  }

  return null;
}

async function getContractors(serviceSlug?: string, locationSlug?: string) {
  const admin = createAdminClient();
  try {
    let finalIds: string[] | null = null;

    if (serviceSlug) {
      const { data: svc } = await admin.from("Service").select("id").eq("slug", serviceSlug).maybeSingle();
      if (!svc) return [];
      const { data: cs } = await admin.from("ContractorService").select("contractorId").eq("serviceId", svc.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalIds = (cs ?? []).map((c: any) => c.contractorId);
    }

    if (locationSlug) {
      const { data: loc } = await admin.from("Location").select("id").eq("slug", locationSlug).maybeSingle();
      if (!loc) return [];
      const { data: cl } = await admin.from("ContractorLocation").select("contractorId").eq("locationId", loc.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const locIds = new Set((cl ?? []).map((c: any) => c.contractorId));
      finalIds = finalIds ? finalIds.filter((id) => locIds.has(id)) : [...locIds];
    }

    if (finalIds !== null && finalIds.length === 0) return [];

    let query = admin
      .from("Contractor")
      .select("*, ContractorService(id, isPrimary, Service(id, name, slug)), Membership(planType, status)")
      .neq("verifiedStatus", "unclaimed")
      .order("rating", { ascending: false })
      .limit(20);

    if (finalIds !== null) {
      query = query.in("id", finalIds);
    }

    const { data } = await query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((c: any) => ({
      ...c,
      services: (c.ContractorService ?? []).map((cs: any) => ({ ...cs, service: cs.Service })),
      membership: Array.isArray(c.Membership) ? c.Membership[0] : c.Membership,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PathPageProps): Promise<Metadata> {
  const slug = params.path.join("/");
  const resolved = await resolvePageType(slug);
  if (!resolved) return { title: "Not Found" };

  const { type, service, location } = resolved;

  if (type === "service") {
    return {
      title: `Best ${service!.name} in Austin, TX`,
      description: `Find top-rated ${service!.name.toLowerCase()} in Austin, TX. Compare local contractors, read verified reviews, and get free quotes. Serving all Austin neighborhoods.`,
    };
  }
  if (type === "location") {
    return {
      title: `Top Contractors in ${location!.name}, TX`,
      description: `Find trusted home service contractors in ${location!.name}, TX. Browse verified professionals, read reviews, and get free quotes from local contractors.`,
    };
  }
  return {
    title: `Best ${service!.name} in ${location!.name}, TX`,
    description: `Find trusted ${service!.name.toLowerCase()} in ${location!.name}, TX. Browse local contractors, read verified reviews, and get free quotes.`,
  };
}

export async function generateStaticParams() {
  try {
    const admin = createAdminClient();
    const [{ data: services }, { data: locations }] = await Promise.all([
      admin.from("Service").select("slug").eq("isPublic", true).eq("isActive", true),
      admin.from("Location").select("slug").eq("isActive", true),
    ]);

    const paths: { path: string[] }[] = [];

    (services ?? []).forEach((s: { slug: string }) => paths.push({ path: [s.slug] }));
    (locations ?? []).forEach((l: { slug: string }) => paths.push({ path: [`${l.slug}-contractors`] }));
    (services ?? []).forEach((s: { slug: string }) => {
      (locations ?? []).forEach((l: { slug: string }) => {
        paths.push({ path: [`${l.slug}-${s.slug}`] });
      });
    });

    return paths;
  } catch {
    return [];
  }
}

export default async function DynamicSeoPage({ params }: PathPageProps) {
  const slug = params.path.join("/");

  const firstSegment = slug.split("/")[0];
  if (!firstSegment || STATIC_ROUTES.has(firstSegment)) {
    notFound();
  }

  const resolved = await resolvePageType(slug);
  if (!resolved) notFound();

  const { type, service, location } = resolved;

  const contractors = await getContractors(service?.slug, location?.slug);

  const locations = [
    { name: "Austin", slug: "austin" },
    { name: "Round Rock", slug: "round-rock" },
    { name: "Cedar Park", slug: "cedar-park" },
    { name: "Pflugerville", slug: "pflugerville" },
    { name: "Georgetown", slug: "georgetown" },
    { name: "Kyle", slug: "kyle" },
    { name: "Buda", slug: "buda" },
    { name: "San Marcos", slug: "san-marcos" },
    { name: "Leander", slug: "leander" },
    { name: "Hutto", slug: "hutto" },
    { name: "Bastrop", slug: "bastrop" },
    { name: "Dripping Springs", slug: "dripping-springs" },
    { name: "Bee Cave", slug: "bee-cave" },
  ];

  const pageTitle =
    type === "service"
      ? `Best ${service!.name} in Austin, TX`
      : type === "location"
      ? `Top Contractors in ${location!.name}, TX`
      : `Best ${service!.name} in ${location!.name}, TX`;

  const pageIntro =
    type === "service"
      ? `Looking for ${service!.name.toLowerCase()} in Austin, TX? ContractorsAustin.com connects Austin-area homeowners with ${contractors.length > 0 ? contractors.length : "top"} local ${service!.name.toLowerCase()} serving Austin and surrounding neighborhoods. Browse verified reviews, compare pricing, and get free quotes in minutes.`
      : type === "location"
      ? `Find trusted home service contractors in ${location!.name}, TX. ContractorsAustin.com connects ${location!.name} homeowners with verified local pros for all home improvement projects. Browse reviews and get free quotes.`
      : `Looking for ${service!.name.toLowerCase()} in ${location!.name}, TX? Browse ${contractors.length > 0 ? contractors.length : "local"} ${service!.name.toLowerCase()} serving ${location!.name} and surrounding areas. Verified reviews, free quotes, licensed & insured contractors.`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <ChevronRight className="h-3.5 w-3.5" />
              {type === "service_location" && service && (
                <>
                  <li>
                    <Link href={`/${service.slug}`} className="hover:text-primary">
                      {service.name}
                    </Link>
                  </li>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              {type === "service_location" && location && (
                <>
                  <li>
                    <Link href={`/${location.slug}-contractors`} className="hover:text-primary">
                      {location.name}
                    </Link>
                  </li>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              <li className="text-foreground font-medium">{pageTitle}</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <div className="bg-white border-b border-border py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">{pageTitle}</h1>
            <p className="text-gray-500 max-w-2xl leading-relaxed">{pageIntro}</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              {(type === "service" || type === "service_location") && service && (
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm mb-4">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">
                    {service.name} by City
                  </h3>
                  <div className="space-y-0.5">
                    <Link
                      href={`/${service.slug}`}
                      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${type === "service" ? "bg-blue-50 text-primary font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-primary"}`}
                    >
                      All Austin Metro
                    </Link>
                    {locations.map((loc) => (
                      <Link
                        key={loc.slug}
                        href={`/${loc.slug}-${service.slug}`}
                        className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${location?.slug === loc.slug ? "bg-blue-50 text-primary font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-primary"}`}
                      >
                        {loc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
                <h3 className="font-semibold text-foreground mb-2">List Your Business</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {service
                    ? `Are you a ${service.name.toLowerCase()} serving ${location?.name ?? "Austin"}?`
                    : `Are you a contractor serving ${location?.name ?? "Austin"}?`}{" "}
                  Join our directory for free.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/pricing">Get Listed Free</Link>
                </Button>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {contractors.length} contractor{contractors.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {contractors.length === 0 ? (
                <div className="rounded-xl border border-border bg-white p-12 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No contractors listed yet
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {type === "service_location" && service && (
                      <>
                        Check back soon or{" "}
                        <Link href={`/${service.slug}`} className="text-primary hover:underline">
                          browse all {service.name} in Austin
                        </Link>
                        .
                      </>
                    )}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/pricing">List Your Business Free →</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {contractors.map((contractor: any) => (
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
