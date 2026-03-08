export const revalidate = 3600;

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ContractorCard } from "@/components/contractor/contractor-card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

interface PathPageProps {
  params: { path: string[] };
}

const STATIC_ROUTES = new Set([
  "", "search", "pricing", "how-it-works", "contact", "privacy", "terms",
  "get-quotes", "login", "signup", "dashboard", "admin", "guides", "projects",
  "contractor", "claim", "api",
]);

async function resolvePageType(slug: string) {
  // Check if it's a pure service page
  const service = await prisma.service.findUnique({
    where: { slug, isPublic: true, isActive: true },
  }).catch(() => null);
  if (service) return { type: "service" as const, service, location: null };

  // Check if it ends with -contractors (location page)
  if (slug.endsWith("-contractors")) {
    const locationSlug = slug.replace(/-contractors$/, "");
    const location = await prisma.location.findUnique({
      where: { slug: locationSlug, isActive: true },
    }).catch(() => null);
    if (location) return { type: "location" as const, service: null, location };
  }

  // Check for service+location combo: try all public services
  const services = await prisma.service.findMany({
    where: { isPublic: true, isActive: true },
    select: { slug: true, name: true, id: true, description: true },
  }).catch(() => []);

  for (const svc of services) {
    // Try all locations for this service slug suffix
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, id: true },
    }).catch(() => []);

    for (const loc of locations) {
      if (slug === `${loc.slug}-${svc.slug}`) {
        const fullService = await prisma.service.findUnique({ where: { id: svc.id } });
        const fullLocation = await prisma.location.findUnique({ where: { id: loc.id } });
        if (fullService && fullLocation) {
          return { type: "service_location" as const, service: fullService, location: fullLocation };
        }
      }
    }
  }

  return null;
}

async function getContractors(type: "service" | "location" | "service_location", serviceSlug?: string, locationSlug?: string) {
  try {
    return await prisma.contractor.findMany({
      where: {
        verifiedStatus: { not: "unclaimed" },
        ...(serviceSlug && {
          services: { some: { service: { slug: serviceSlug } } },
        }),
        ...(locationSlug && {
          locations: { some: { location: { slug: locationSlug } } },
        }),
      },
      include: {
        services: {
          include: { service: true },
          where: { isPrimary: true },
          take: 1,
        },
        membership: true,
      },
      orderBy: [
        { membership: { planType: "desc" } },
        { rating: "desc" },
        { reviewCount: "desc" },
      ],
      take: 20,
    });
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
    const [services, locations] = await Promise.all([
      prisma.service.findMany({ where: { isPublic: true, isActive: true }, select: { slug: true } }),
      prisma.location.findMany({ where: { isActive: true }, select: { slug: true } }),
    ]);

    const paths: { path: string[] }[] = [];

    // Service pages
    services.forEach((s) => paths.push({ path: [s.slug] }));

    // Location pages
    locations.forEach((l) => paths.push({ path: [`${l.slug}-contractors`] }));

    // Service × Location pages
    services.forEach((s) => {
      locations.forEach((l) => {
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

  // Block static routes from this catch-all
  const firstSegment = slug.split("/")[0];
  if (!firstSegment || STATIC_ROUTES.has(firstSegment)) {
    notFound();
  }

  const resolved = await resolvePageType(slug);
  if (!resolved) notFound();

  const { type, service, location } = resolved;

  const contractors = await getContractors(
    type,
    service?.slug,
    location?.slug
  );

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
              {/* Location links for service pages */}
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
