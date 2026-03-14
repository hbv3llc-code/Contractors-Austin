import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContractorCard } from "@/components/contractor-card";

export const revalidate = 3600;

interface Props {
  params: { serviceSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await prisma.service.findUnique({ where: { slug: params.serviceSlug } });
  if (!service) return {};

  const seoPage = await prisma.seoPage.findFirst({
    where: { pageType: "service", serviceId: service.id },
  });

  return {
    title: seoPage?.title ?? `${service.name} in Austin, TX`,
    description: seoPage?.metaDescription ?? `Find trusted ${service.name.toLowerCase()} contractors in Austin, TX. Compare ratings, read reviews, and get free quotes.`,
  };
}

export default async function ServicePage({ params }: Props) {
  const service = await prisma.service.findUnique({
    where: { slug: params.serviceSlug },
    include: { children: { where: { isActive: true } } },
  });

  if (!service || !service.isPublic) notFound();

  const [seoPage, contractorServices] = await Promise.all([
    prisma.seoPage.findFirst({
      where: { pageType: "service", serviceId: service.id },
    }),
    prisma.contractorService.findMany({
      where: { serviceId: service.id },
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/services" className="hover:text-primary">Services</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{service.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {seoPage?.title ?? `${service.name} in Austin, TX`}
        </h1>
        {introContent?.body ? (
          <p className="text-muted-foreground max-w-2xl">{introContent.body}</p>
        ) : (
          <p className="text-muted-foreground max-w-2xl">
            Find trusted {service.name.toLowerCase()} contractors in Austin, TX. Compare ratings, read verified reviews, and request free quotes.
          </p>
        )}
      </div>

      {/* Sub-services */}
      {service.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Related Services</h2>
          <div className="flex flex-wrap gap-2">
            {service.children.map((child) => (
              <Link
                key={child.id}
                href={`/services/${child.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {contractors.length} Contractors Available
        </h2>
      </div>

      {contractors.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <p className="text-muted-foreground mb-4">No contractors listed for this service yet.</p>
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Are you a contractor? List your business →
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
