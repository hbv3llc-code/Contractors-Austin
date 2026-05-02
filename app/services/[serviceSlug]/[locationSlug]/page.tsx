import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ContractorCard } from "@/components/contractor/contractor-card";

export const dynamic = "force-dynamic";

interface Props {
  params: { serviceSlug: string; locationSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const admin = createAdminClient();
    const [{ data: service }, { data: location }] = await Promise.all([
      admin.from("Service").select("id, name").eq("slug", params.serviceSlug).maybeSingle(),
      admin.from("Location").select("id, name").eq("slug", params.locationSlug).maybeSingle(),
    ]);
    if (!service || !location) return {};
    const { data: seoPage } = await admin.from("SeoPage").select("title, metaDescription").eq("pageType", "service_location").eq("serviceId", service.id).eq("locationId", location.id).maybeSingle();
    return {
      title: seoPage?.title ?? `${service.name} in ${location.name}, TX`,
      description: seoPage?.metaDescription ?? `Find trusted ${service.name.toLowerCase()} contractors near ${location.name}. Compare ratings and get free quotes.`,
    };
  } catch { return {}; }
}

export default async function ServiceLocationPage({ params }: Props) {
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any = null, location: any = null;
  try {
    const [sr, lr] = await Promise.all([
      admin.from("Service").select("id, name, slug, isPublic").eq("slug", params.serviceSlug).maybeSingle(),
      admin.from("Location").select("id, name, slug, isActive").eq("slug", params.locationSlug).maybeSingle(),
    ]);
    service = sr.data;
    location = lr.data;
  } catch {}

  if (!service || !service.isPublic || !location || !location.isActive) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let seoPage: any = null, clData: any[] = [];
  try {
    const [sp, cl] = await Promise.all([
      admin.from("SeoPage").select("title, metaDescription, introContent").eq("pageType", "service_location").eq("serviceId", service.id).eq("locationId", location.id).maybeSingle(),
      admin.from("ContractorLocation")
        .select("Contractor(*, ContractorService(id, isPrimary, Service(id, name, slug)), Membership(planType, status))")
        .eq("locationId", location.id)
        .limit(30),
    ]);
    seoPage = sp.data;
    clData = cl.data ?? [];
  } catch {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contractors = (clData ?? []).map((cl: any) => {
    const c = Array.isArray(cl.Contractor) ? cl.Contractor[0] : cl.Contractor;
    if (!c) return null;
    return {
      ...c,
      services: (c.ContractorService ?? []).map((cs: any) => ({ ...cs, service: cs.Service })),
      membership: Array.isArray(c.Membership) ? c.Membership[0] : c.Membership,
    };
  }).filter(Boolean);

  const introContent = seoPage?.introContent as { body?: string } | null;
  const title = seoPage?.title ?? `${service.name} in ${location.name}, TX`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {contractors.map((contractor: any) => (
            <ContractorCard key={contractor.id} contractor={contractor} />
          ))}
        </div>
      )}
    </div>
  );
}
