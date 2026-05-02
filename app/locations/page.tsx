import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Service Areas | Austin Metro Contractors",
  description: "Find local contractors serving Austin, Round Rock, Cedar Park, Pflugerville, Georgetown, and all surrounding cities.",
};

export default async function LocationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let locations: any[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("Location")
      .select("id, name, slug")
      .eq("isActive", true)
      .is("parentId", null)
      .order("name", { ascending: true });
    locations = data ?? [];
  } catch {}

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Austin Metro Service Areas</h1>
            <p className="text-muted-foreground">Browse contractors by city. We cover all of Austin and surrounding communities.</p>
          </div>

          {locations.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Austin","Round Rock","Cedar Park","Pflugerville","Georgetown","Kyle","Buda","San Marcos","Leander","Hutto","Bastrop","Dripping Springs","Bee Cave"].map((city) => (
                <Link key={city} href={`/${city.toLowerCase().replace(/\s+/g, "-")}-contractors`} className="flex items-center justify-between rounded-xl border border-border bg-white p-5 shadow-sm hover:border-primary hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{city}</p>
                      <p className="text-xs text-muted-foreground">Austin Metro Area</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {locations.map((location: any) => (
                <Link key={location.id} href={`/${location.slug}-contractors`} className="flex items-center justify-between rounded-xl border border-border bg-white p-5 shadow-sm hover:border-primary hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{location.name}</p>
                  </div>
                  <span className="text-muted-foreground text-sm">→</span>
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
