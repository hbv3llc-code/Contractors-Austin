export const revalidate = 600;

import Link from "next/link";
import { ArrowRight, Search, Star, Shield, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractorCard } from "@/components/contractor/contractor-card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { createAdminClient } from "@/lib/supabase/admin";

const serviceCategories = [
  { name: "Painters", slug: "painters", emoji: "🎨", description: "Interior & exterior painting" },
  { name: "Roofers", slug: "roofers", emoji: "🏠", description: "Repairs & replacements" },
  { name: "Plumbers", slug: "plumbers", emoji: "🔧", description: "24/7 emergency available" },
  { name: "HVAC / AC Repair", slug: "hvac", emoji: "❄️", description: "Heating & cooling experts" },
  { name: "Electricians", slug: "electricians", emoji: "⚡", description: "Licensed master electricians" },
  { name: "General Contractors", slug: "general-contractors", emoji: "🔨", description: "Full remodels" },
  { name: "Handyman", slug: "handyman", emoji: "🛠️", description: "Any size job welcome" },
  { name: "Landscapers", slug: "landscapers", emoji: "🌿", description: "Lawn & yard care" },
  { name: "Deck Builders", slug: "deck-builders", emoji: "🪵", description: "Decks, patios & outdoor" },
  { name: "Flooring", slug: "flooring", emoji: "🏡", description: "All floor types" },
  { name: "Windows & Doors", slug: "windows-doors", emoji: "🪟", description: "Installation & repair" },
  { name: "Pool Services", slug: "pool-services", emoji: "🏊", description: "Cleaning & maintenance" },
  { name: "Cleaners", slug: "cleaners", emoji: "✨", description: "Home & commercial" },
  { name: "Pest Control", slug: "pest-control", emoji: "🐛", description: "Licensed exterminators" },
  { name: "Garage Doors", slug: "garage-doors", emoji: "🚗", description: "Repair & installation" },
  { name: "Foundation Repair", slug: "foundation-repair", emoji: "🏗️", description: "Structural experts" },
  { name: "Home Inspectors", slug: "home-inspectors", emoji: "🔍", description: "Pre-purchase inspections" },
  { name: "Security Systems", slug: "security-systems", emoji: "🔒", description: "Smart home security" },
  { name: "Fencing", slug: "fencing", emoji: "🌳", description: "Wood, vinyl & iron" },
  { name: "Concrete & Masonry", slug: "concrete-masonry", emoji: "🧱", description: "Driveways & patios" },
];

async function getFeaturedContractors() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("Contractor")
      .select("*, ContractorService(id, isPrimary, Service(id, name, slug)), Membership!inner(planType, status)")
      .in("verifiedStatus", ["verified", "claimed"])
      .in("Membership.planType", ["premium", "featured"])
      .order("rating", { ascending: false })
      .limit(6);
    if (!data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((c: any) => ({
      ...c,
      services: (c.ContractorService ?? []).map((cs: any) => ({ ...cs, service: cs.Service })),
      membership: Array.isArray(c.Membership) ? c.Membership[0] : c.Membership,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredContractors = await getFeaturedContractors();

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 py-20 sm:py-28">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Trusted Contractors
              <br />
              <span className="text-blue-200">in Austin, TX</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 leading-relaxed">
              Compare verified local pros, read real reviews from Austin homeowners, and get free
              quotes in minutes. Serving Austin, Round Rock, Cedar Park, and all surrounding cities.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-10 max-w-2xl">
              <div className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white p-3 shadow-2xl">
                <div className="flex flex-1 items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-gray-400 outline-none"
                  />
                </div>
                <Button size="lg" className="sm:w-auto w-full gap-2" asChild>
                  <Link href="/search">
                    Find Pros
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-sm text-blue-200">
                Popular: Painters · Roofers · Plumbers · HVAC · Electricians
              </p>
            </div>

            {/* Trust signals */}
            <div className="mx-auto mt-12 flex flex-wrap justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-300" />
                Verified Contractors
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-400" />
                Real Customer Reviews
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-300" />
                Licensed & Insured Pros
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-300" />
                Free Quotes in Minutes
              </div>
            </div>
          </div>
        </section>

        {/* Service Category Grid */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground">Browse by Service</h2>
              <p className="mt-2 text-gray-500">Find trusted pros for every home project</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {serviceCategories.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/${svc.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-4 text-center hover:border-primary hover:bg-blue-50 transition-all hover:shadow-sm"
                >
                  <span className="text-3xl">{svc.emoji}</span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {svc.name}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {svc.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
              <p className="mt-2 text-gray-500">Find your perfect contractor in 3 easy steps</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  icon: Search,
                  title: "Search",
                  description:
                    "Browse contractors by service type and location. Filter by rating, availability, and plan tier.",
                },
                {
                  step: "2",
                  icon: Star,
                  title: "Compare",
                  description:
                    "Read verified reviews from Austin homeowners, view project photos, and compare credentials.",
                },
                {
                  step: "3",
                  icon: CheckCircle,
                  title: "Hire",
                  description:
                    "Request free quotes from multiple pros at once. No obligation, no hidden fees.",
                },
              ].map(({ step, icon: Icon, title, description }) => (
                <div key={step} className="relative flex flex-col items-center text-center p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white mb-4 shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-blue-100 border-2 border-primary text-primary text-xs font-bold flex items-center justify-center">
                    {step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Contractors */}
        {featuredContractors.length > 0 && (
          <section className="py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Top-Rated Contractors</h2>
                  <p className="mt-1 text-gray-500">Verified professionals serving Austin metro</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/search">View All</Link>
                </Button>
              </div>
              <div className="grid gap-4">
                {featuredContractors.map((contractor) => (
                  <ContractorCard
                    key={contractor.id}
                    contractor={contractor as Parameters<typeof ContractorCard>[0]["contractor"]}
                    showPhone={true}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pro CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Are You a Local Contractor?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join Austin's fastest-growing contractor directory. Get discovered by homeowners
              actively searching for your services. Start free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/pricing">
                  Get Listed Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
            <p className="mt-4 text-blue-200 text-sm">
              Basic listing is always free · Upgrade anytime for more visibility
            </p>
          </div>
        </section>

        {/* Austin Cities */}
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">
              Serving All Austin Metro Cities
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Austin", "Round Rock", "Cedar Park", "Pflugerville", "Georgetown",
                "Kyle", "Buda", "San Marcos", "Leander", "Hutto", "Bastrop",
                "Dripping Springs", "Bee Cave",
              ].map((city) => (
                <Link
                  key={city}
                  href={`/${city.toLowerCase().replace(/\s+/g, "-")}-contractors`}
                  className="rounded-full border border-border bg-white px-4 py-1.5 text-sm text-gray-600 hover:border-primary hover:text-primary hover:bg-blue-50 transition-all"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
