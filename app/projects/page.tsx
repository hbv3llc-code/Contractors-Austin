export const revalidate = 3600;

import Link from "next/link";
import { Hammer, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Real Project Showcases | Austin Contractor Work",
  description: "Browse completed home improvement projects by Austin contractors. See before & after photos, project details, and find pros for your next project.",
};

async function getProjects() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ProjectPost")
      .select("id, slug, title, excerpt, imageUrl, city, serviceSlug, createdAt")
      .eq("isPublished", true)
      .order("createdAt", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                Project Gallery
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Real Projects by Austin Contractors
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Browse completed home improvement projects across the Austin metro area. Get inspired
              and find the right contractor for your next project.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          {projects.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Hammer className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Project showcases coming soon. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {projects.map((project: any) => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
                  <article className="rounded-xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden h-full flex flex-col">
                    {project.imageUrl ? (
                      <div className="aspect-video w-full overflow-hidden bg-gray-100">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <Hammer className="h-10 w-10 text-blue-200" />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {project.title}
                      </h2>
                      {project.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {project.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-border">
                        {project.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.city}, TX
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(project.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border-t border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Ready to start your project?
            </h2>
            <p className="text-muted-foreground mb-6">
              Find trusted Austin contractors for any home improvement project.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/search"
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
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
