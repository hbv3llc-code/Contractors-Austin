import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/forms/review-form";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface ReviewPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { slug: params.slug },
      select: { name: true },
    });
    return { title: `Write a Review for ${contractor?.name ?? "Contractor"}` };
  } catch {
    return { title: "Write a Review" };
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  let contractor = null;
  try {
    contractor = await prisma.contractor.findUnique({
      where: { slug: params.slug, verifiedStatus: { not: "unclaimed" } },
      select: { id: true, name: true, slug: true },
    });
  } catch {}

  if (!contractor) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Write a Review for {contractor.name}
          </h1>
          <p className="text-muted-foreground mb-8">
            Help other Austin homeowners by sharing your experience.
          </p>
          <ReviewForm contractorId={contractor.id} contractorSlug={contractor.slug} />
        </div>
      </main>
      <Footer />
    </>
  );
}
