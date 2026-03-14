import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContractorCard } from "@/components/contractor-card";

export const revalidate = 3600;

interface Props {
  params: { serviceSlug: string; locationSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [service, location] = await Promise.all([
    prisma.service.findUnique({ where: { slug: params.serviceSlug } }),
    prisma.location.findUnique({ where: { slug: params.locationSlug } }),
  ]);

  if (!service || !location) return {};

  const seoPage = await prisma.seoPage.findFirst({
    where: { pageType: "service_location", serviceId: service.id, locationId: location.id },
  });

  const defaultTitle = `${service.name} in ${location.name}, TX`;
  const defaultDesc = `Find trusted ${service.name.toLowerCase()} contractors near ${location.name}. Compare ratings and get free quotes.`;

  return {
    title: seoPage?.title ?? defaultTitle,
    description: seoPage?.metaDescription ?? defaultDesc,
  };
}

export default async function ServiceLocationPage({ params }: Props) {
  const [service, location] = await Promise.all([
    prisma.service.findUnique({ where: { slug: params.serviceSlug } }),
    prisma.location.findUnique({
      where: { slug: params.locationSlug },
      include: { parent: true },
    }),
  ]);

  if (!service || !service.isPublic || !location || !location.isActive) notFound();

  const [seoPage, contractorServices] = await Promise.all([
    prisma.seoPage.findFirst({
      where: { pageType: "service_location", serviceId: service.id, locationId: location.id },
    }),
    prisma.contractorService.findMany({
      where: {
        serviceId: service.id,
        contractor: {
          locations: { some: { locationId: location.id } },
        },
      },
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
      take: 30,
    }),
  ]);

  const contractors = contractorServices.map((cs) => cs.contractor);
  const introContent = seoPage?.introContent as { body?: string } | null;
  const title = seoPage?.title ?? `${service.name} in ${location.name}, TX`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/services/${service.slug}`} className="hover:text-primary">{service.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{location.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
        {introContent?.body ? (
          <p className="text-muted-foreground max-w-2xl">{introContent.body}</p>
        ) : (
          <p className="text-muted-foreground max-w-2xl">
            Find top-rated {service.name.toLowerCase()} contractors serving {location.name}. Read verified reviews and get free project quotes.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {contractors.length} Contractor{contractors.length !== 1 ? "s" : ""} Near {location.name}
        </h2>
        <Link href={`/services/${service.slug}`} className="text-sm text-primary hover:underline">
          All {service.name} →
        </Link>
      </div>

      {contractors.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <p className="text-muted-foreground mb-4">No contractors found for this area yet.</p>
          <Link href={`/services/${service.slug}`} className="text-primary hover:underline font-medium">
            View all {service.name} contractors →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contractors.map((contractor) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
      )}
    </div>
  );
}
