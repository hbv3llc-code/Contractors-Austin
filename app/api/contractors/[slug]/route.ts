import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const admin = createAdminClient();
    const { data: contractor } = await admin
      .from("Contractor")
      .select("*, ContractorService(id, isPrimary, Service(id, name, slug)), ContractorLocation(id, Location(id, name, slug)), Review(id, rating, reviewerName, reviewText, status, createdAt), Membership(planType, status), ContractorPhoto(id, url, caption, sortOrder)")
      .eq("slug", params.slug)
      .maybeSingle();

    if (!contractor) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contractor not found" } },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalized = {
      ...contractor,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      services: (contractor.ContractorService ?? []).map((cs: any) => ({ ...cs, service: cs.Service })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locations: (contractor.ContractorLocation ?? []).map((cl: any) => ({ ...cl, location: cl.Location })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviews: (contractor.Review ?? []).filter((r: any) => r.status === "approved").sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
      membership: Array.isArray(contractor.Membership) ? contractor.Membership[0] : contractor.Membership,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      photos: (contractor.ContractorPhoto ?? []).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("GET /api/contractors/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch contractor" } },
      { status: 500 }
    );
  }
}
