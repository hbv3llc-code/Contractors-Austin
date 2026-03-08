"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Users } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUDGET_OPTIONS } from "@/lib/validations/lead";

const SERVICE_OPTIONS = [
  "Painters", "Roofers", "Plumbers", "HVAC / AC Repair", "Electricians",
  "General Contractors", "Handyman Services", "Landscapers", "Deck Builders",
  "Flooring", "Windows & Doors", "Pool Services", "Cleaners", "Pest Control",
  "Garage Doors", "Foundation Repair", "Home Inspectors", "Security Systems",
  "Fencing", "Concrete & Masonry",
];

const CITY_OPTIONS = [
  "Austin", "Round Rock", "Cedar Park", "Georgetown", "Kyle", "Pflugerville",
  "Leander", "Buda", "San Marcos", "Hutto", "Bastrop", "Dripping Springs", "Bee Cave",
];

interface FormErrors {
  [key: string]: string;
}

export default function GetQuotesPage() {
  const [submitted, setSubmitted] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const form = formRef.current!;
    const data = new FormData(form);
    const body = {
      service: data.get("service") as string,
      city: data.get("city") as string,
      description: data.get("description") as string,
      budget: (data.get("budget") as string) || undefined,
      name: data.get("name") as string,
      email: data.get("email") as string,
      phone: (data.get("phone") as string) || undefined,
      _honeypot: data.get("_honeypot") as string,
    };

    try {
      const res = await fetch("/api/get-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.fields) {
          setErrors(json.fields);
        } else {
          setErrors({ _form: json.error ?? "Something went wrong. Please try again." });
        }
        return;
      }

      setMatchedCount(json.data?.matchedCount ?? 0);
      setSubmitted(true);
    } catch {
      setErrors({ _form: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-3">Quote Request Sent!</h1>
            {matchedCount > 0 ? (
              <p className="text-gray-500 mb-2">
                We matched your project with{" "}
                <strong>{matchedCount} local contractor{matchedCount > 1 ? "s" : ""}</strong>.
                Each one has been notified and will reach out shortly.
              </p>
            ) : (
              <p className="text-gray-500 mb-2">
                Your request has been received. We&apos;ll connect you with available contractors
                in your area.
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3 mb-8">
              <Users className="h-4 w-4" />
              <span>Contractors typically respond within 2–4 hours</span>
            </div>
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
            <h1 className="text-3xl font-bold text-white mb-3">
              Get Free Quotes from Local Contractors
            </h1>
            <p className="text-blue-100">
              Fill out one form and we&apos;ll match you with up to 4 vetted local pros. No
              obligation.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
            {errors._form && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {errors._form}
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot */}
              <input type="text" name="_honeypot" className="hidden" tabIndex={-1} />

              <div>
                <Label htmlFor="service">What service do you need? *</Label>
                <select
                  id="service"
                  name="service"
                  required
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a service...</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.service && <p className="mt-1 text-xs text-red-600">{errors.service}</p>}
              </div>

              <div>
                <Label htmlFor="description">Describe your project *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  placeholder="What needs to be done? Include relevant details about size, materials, timing..."
                  className="mt-1"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="budget">Budget Range</Label>
                <select
                  id="budget"
                  name="budget"
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select budget...</option>
                  {BUDGET_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="city">Your City *</Label>
                <select
                  id="city"
                  name="city"
                  required
                  className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select city...</option>
                  {CITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input id="name" name="name" required placeholder="John Smith" className="mt-1" />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(512) 555-0100"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@email.com"
                  className="mt-1"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                {loading ? "Submitting..." : (
                  <>Get Free Quotes <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                No obligation. Your information is never sold. We only share with matching local
                contractors.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
