import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Service Areas | Austin Metro Contractors",
  description: "Find local contractors serving Austin, Round Rock, Cedar Park, Pflugerville, Georgetown, and all surrounding cities.",
};

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    where: { isActive: true, parentId: null },
    include: {
      children: { where: { isActive: true }, orderBy: { name: "asc" } },
      _count: { select: { contractors: true } },
    },
    orderBy: { name: "asc" },
  }).catch(() => []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Service Areas</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Austin Metro Service Areas
            </h1>
            <p className="text-muted-foreground">
              Browse contractors by city. We cover all of Austin and surrounding communities.
            </p>
          </div>

          {locations.length === 0 ? (
            // Fallback to hardcoded Austin cities if DB is empty
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Austin", slug: "austin", count: null },
                { name: "Round Rock", slug: "round-rock", count: null },
                { name: "Cedar Park", slug: "cedar-park", count: null },
                { name: "Pflugerville", slug: "pflugerville", count: null },
                { name: "Georgetown", slug: "georgetown", count: null },
                { name: "Kyle", slug: "kyle", count: null },
                { name: "Buda", slug: "buda", count: null },
                { name: "San Marcos", slug: "san-marcos", count: null },
                { name: "Leander", slug: "leander", count: null },
                { name: "Hutto", slug: "hutto", count: null },
                { name: "Bastrop", slug: "bastrop", count: null },
                { name: "Dripping Springs", slug: "dripping-springs", count: null },
                { name: "Bee Cave", slug: "bee-cave", count: null },
              ].map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}-contractors`}
                  className="flex items-center justify-between rounded-xl border border-border bg-white p-5 shadow-sm hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {city.name}
                      </p>
                      <p className="text-xs text-muted-foreground">Austin Metro Area</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <Link
                  key={location.id}
                  href={`/${location.slug}-contractors`}
                  className="flex items-center justify-between rounded-xl border border-border bg-white p-5 shadow-sm hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {location.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {location._count.contractors > 0
                          ? `${location._count.contractors} contractor${location._count.contractors !== 1 ? "s" : ""}`
                          : "Austin Metro Area"}
                      </p>
                    </div>
                  </div>
                  {location.children.length > 0 && (
                    <span className="text-xs text-muted-foreground">{location.children.length} areas</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
