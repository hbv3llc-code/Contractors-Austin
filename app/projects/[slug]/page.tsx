export const revalidate = 86400;

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, Clock, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

interface ProjectPageProps {
  params: { slug: string };
}

async function getProject(slug: string) {
  try {
    return await prisma.projectPost.findUnique({
      where: { slug, isPublished: true },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.metaTitle ?? project.title,
    description: project.metaDesc ?? project.excerpt ?? undefined,
    openGraph: {
      title: project.metaTitle ?? project.title,
      description: project.metaDesc ?? project.excerpt ?? undefined,
      images: project.imageUrl ? [project.imageUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  try {
    const projects = await prisma.projectPost.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  // Get related contractor if linked
  const contractor = project.contractorId
    ? await prisma.contractor.findUnique({
        where: { id: project.contractorId },
        select: { name: true, slug: true, city: true },
      }).catch(() => null)
    : null;

  const contentParagraphs = project.content.split("\n").filter((line) => line.trim());

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li><Link href="/projects" className="hover:text-primary">Projects</Link></li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="text-foreground font-medium truncate max-w-[200px]">{project.title}</li>
            </ol>
          </div>
        </nav>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <article className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            {/* Hero image */}
            {project.imageUrl && (
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <header className="mb-8 pb-8 border-b border-border">
                <h1 className="text-3xl font-bold text-foreground mb-3">{project.title}</h1>
                {project.excerpt && (
                  <p className="text-lg text-gray-500 leading-relaxed">{project.excerpt}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  {project.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {project.city}, TX
                    </div>
                  )}
                  {project.serviceSlug && (
                    <Link
                      href={`/${project.serviceSlug}`}
                      className="hover:text-primary capitalize"
                    >
                      {project.serviceSlug.replace(/-/g, " ")}
                    </Link>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {contractor && (
                    <Link href={`/contractor/${contractor.slug}`} className="hover:text-primary font-medium">
                      by {contractor.name}
                    </Link>
                  )}
                </div>
              </header>

              <div className="prose prose-gray max-w-none">
                {contentParagraphs.map((para, i) => {
                  if (para.startsWith("# ")) {
                    return <h1 key={i} className="text-2xl font-bold text-foreground mt-6 mb-3">{para.slice(2)}</h1>;
                  }
                  if (para.startsWith("## ")) {
                    return <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-3">{para.slice(3)}</h2>;
                  }
                  if (para.startsWith("### ")) {
                    return <h3 key={i} className="text-lg font-semibold text-foreground mt-4 mb-2">{para.slice(4)}</h3>;
                  }
                  if (para.startsWith("- ")) {
                    return <li key={i} className="ml-4 text-gray-600 leading-relaxed list-disc">{para.slice(2)}</li>;
                  }
                  return <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>;
                })}
              </div>
            </div>
          </article>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/projects" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                All Projects
              </Link>
            </Button>
            {contractor ? (
              <Button asChild>
                <Link href={`/contractor/${contractor.slug}`}>
                  View {contractor.name}'s Profile →
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/search">Find Contractors</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
