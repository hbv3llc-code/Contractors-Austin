export const revalidate = 86400;

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Clock, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";

interface GuidePageProps {
  params: { slug: string };
}

async function getGuide(slug: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("GuidePost")
      .select("id, slug, title, excerpt, content, metaTitle, metaDesc, createdAt, isPublished")
      .eq("slug", slug)
      .eq("isPublished", true)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = await getGuide(params.slug);
  if (!guide) return { title: "Guide Not Found" };
  return {
    title: guide.metaTitle ?? guide.title,
    description: guide.metaDesc ?? guide.excerpt ?? undefined,
  };
}

export async function generateStaticParams() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("GuidePost")
      .select("slug")
      .eq("isPublished", true);
    return (data ?? []).map((g: { slug: string }) => ({ slug: g.slug }));
  } catch {
    return [];
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = await getGuide(params.slug);
  if (!guide) notFound();

  const contentParagraphs = guide.content.split("\n").filter((line: string) => line.trim());

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li><Link href="/guides" className="hover:text-primary">Guides</Link></li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="text-foreground font-medium truncate max-w-[200px]">{guide.title}</li>
            </ol>
          </div>
        </nav>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
          <article className="rounded-xl border border-border bg-white p-8 shadow-sm">
            <header className="mb-8 pb-8 border-b border-border">
              <h1 className="text-3xl font-bold text-foreground mb-3">{guide.title}</h1>
              {guide.excerpt && (
                <p className="text-lg text-gray-500 leading-relaxed">{guide.excerpt}</p>
              )}
              <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(guide.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>·</span>
                <span>ContractorsAustin.com</span>
              </div>
            </header>

            <div className="prose prose-gray max-w-none">
              {contentParagraphs.map((para: string, i: number) => {
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
          </article>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/guides" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                All Guides
              </Link>
            </Button>
            <Button asChild>
              <Link href="/search">Find Contractors</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
