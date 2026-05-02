import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/forms/review-form";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

interface ReviewPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("Contractor").select("name").eq("slug", params.slug).maybeSingle();
    return { title: `Write a Review for ${data?.name ?? "Contractor"}` };
  } catch {
    return { title: "Write a Review" };
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  let contractor = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("Contractor")
      .select("id, name, slug, verifiedStatus")
      .eq("slug", params.slug)
      .neq("verifiedStatus", "unclaimed")
      .maybeSingle();
    contractor = data;
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
