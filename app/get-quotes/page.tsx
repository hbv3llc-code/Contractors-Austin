"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUDGET_OPTIONS } from "@/lib/validations/lead";

const serviceOptions = [
  "Painters", "Roofers", "Plumbers", "HVAC / AC Repair", "Electricians",
  "General Contractors", "Handyman Services", "Landscapers", "Deck Builders",
  "Flooring", "Windows & Doors", "Pool Services", "Cleaners", "Pest Control",
  "Garage Doors", "Foundation Repair", "Home Inspectors", "Security Systems",
  "Fencing", "Concrete & Masonry",
];

export default function GetQuotesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-3">Quote Request Received!</h1>
            <p className="text-gray-500 mb-8">
              We'll connect you with matching contractors in your area. Check your email for updates.
            </p>
            <Button asChild>
              <Link href="/search">Browse Contractors Now</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 py-12 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-3">Get Free Quotes from Local Contractors</h1>
            <p className="text-blue-100">
              Fill out one form and we'll match you with up to 4 vetted local pros. No obligation.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="service">What service do you need? *</Label>
                <select
                  id="service"
                  required
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a service...</option>
                  {serviceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <Label htmlFor="description">Describe your project *</Label>
                <Textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="What needs to be done? Include any relevant details about size, materials, timing..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget Range</Label>
                <select
                  id="budget"
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select budget...</option>
                  {BUDGET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <Label htmlFor="city">Your City *</Label>
                <select
                  id="city"
                  required
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select city...</option>
                  {["Austin", "Round Rock", "Cedar Park", "Georgetown", "Kyle", "Pflugerville", "Leander", "Buda", "San Marcos", "Hutto", "Bastrop", "Dripping Springs", "Bee Cave"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input id="name" required placeholder="John Smith" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="(512) 555-0100" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" required placeholder="john@email.com" className="mt-1" />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                {loading ? "Submitting..." : <>Get Free Quotes <ArrowRight className="h-4 w-4" /></>}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                No obligation. Your information is never sold. We only share with matching local contractors.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
