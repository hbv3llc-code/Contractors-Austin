import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Contractor Services in Austin, TX",
  description: "Browse all home improvement and contractor services available in Austin, TX.",
};

export default async function ServicesPage() {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let services: any[] = [];
  try {
    const { data: allServices } = await admin
      .from("Service")
      .select("id, name, slug, description, parentId")
      .eq("isPublic", true)
      .eq("isActive", true)
      .order("sortOrder", { ascending: true });
    const all = allServices ?? [];
    const topLevel = all.filter((s: any) => !s.parentId);
    services = topLevel.map((s: any) => ({
      ...s,
      children: all.filter((c: any) => c.parentId === s.id),
    }));
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">All Services in Austin, TX</h1>
        <p className="text-muted-foreground">Find contractors for any home improvement project.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <Link
              href={`/services/${service.slug}`}
              className="block text-lg font-semibold text-foreground hover:text-primary mb-2 transition-colors"
            >
              {service.name}
            </Link>
            {service.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
            )}
            {service.children.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {service.children.slice(0, 4).map((child) => (
                  <Link
                    key={child.id}
                    href={`/services/${child.slug}`}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {child.name}
                  </Link>
                ))}
                {service.children.length > 4 && (
                  <span className="text-xs text-muted-foreground py-0.5">+{service.children.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No services listed yet.
        </div>
      )}
    </div>
  );
}
