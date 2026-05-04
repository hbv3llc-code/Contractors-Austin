export const revalidate = 3600;

import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Home Improvement Guides | ContractorsAustin",
  description:
    "Expert guides on hiring contractors, planning home improvement projects, and navigating Austin's home services market.",
};

async function getGuides() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("GuidePost")
      .select("id, slug, title, excerpt, createdAt")
      .eq("isPublished", true)
      .order("createdAt", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function GuidesIndexPage() {
  const guides = await getGuides();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-white border-b border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                Resource Center
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Home Improvement Guides
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Expert advice on hiring contractors, planning renovations, and getting the best value
              from Austin&apos;s home services pros.
            </p>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          {guides.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Guides coming soon. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {guides.map((guide: any) => (
                <Link key={guide.id} href={`/guides/${guide.slug}`} className="group block">
                  <article className="rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all h-full flex flex-col">
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {guide.title}
                      </h2>
                      {guide.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {guide.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto pt-4 border-t border-border">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(guide.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-white border-t border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Ready to find a trusted contractor?
            </h2>
            <p className="text-muted-foreground mb-6">
              Browse Austin&apos;s top-rated home services pros.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/search"
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                Browse Contractors
              </Link>
              <Link
                href="/get-quotes"
                className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
              >
                Get Free Quotes
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
