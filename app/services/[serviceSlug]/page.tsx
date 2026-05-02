import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ContractorCard } from "@/components/contractor/contractor-card";

export const revalidate = 3600;

interface Props {
  params: { serviceSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const admin = createAdminClient();
    const { data: service } = await admin.from("Service").select("id, name").eq("slug", params.serviceSlug).maybeSingle();
    if (!service) return {};
    const { data: seoPage } = await admin.from("SeoPage").select("title, metaDescription").eq("pageType", "service").eq("serviceId", service.id).maybeSingle();
    return {
      title: seoPage?.title ?? `${service.name} in Austin, TX`,
      description: seoPage?.metaDescription ?? `Find trusted ${service.name.toLowerCase()} contractors in Austin, TX. Compare ratings, read reviews, and get free quotes.`,
    };
  } catch { return {}; }
}

export default async function ServicePage({ params }: Props) {
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let service: any = null;
  try {
    const { data } = await admin
      .from("Service")
      .select("id, name, slug, isPublic, description")
      .eq("slug", params.serviceSlug)
      .maybeSingle();
    service = data;
  } catch {}

  if (!service || !service.isPublic) notFound();

  const [{ data: childrenData }, { data: seoPage }, { data: csData }] = await Promise.all([
    admin.from("Service").select("id, name, slug").eq("parentId", service.id).eq("isActive", true),
    admin.from("SeoPage").select("title, metaDescription, introContent").eq("pageType", "service").eq("serviceId", service.id).maybeSingle(),
    admin.from("ContractorService").select("Contractor(*, ContractorService(id, isPrimary, Service(id, name, slug)), Membership(planType, status))").eq("serviceId", service.id).limit(30),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contractors = (csData ?? []).map((cs: any) => {
    const c = Array.isArray(cs.Contractor) ? cs.Contractor[0] : cs.Contractor;
    if (!c) return null;
    return {
      ...c,
      services: (c.ContractorService ?? []).map((s: any) => ({ ...s, service: s.Service })),
      membership: Array.isArray(c.Membership) ? c.Membership[0] : c.Membership,
    };
  }).filter(Boolean);

  const serviceWithChildren = { ...service, children: childrenData ?? [] };
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
      {serviceWithChildren.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Related Services</h2>
          <div className="flex flex-wrap gap-2">
            {serviceWithChildren.children.map((child) => (
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
