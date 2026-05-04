import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");
    const location = searchParams.get("location");
    const q = searchParams.get("q");
    const plan = searchParams.get("plan");
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
    const cursor = searchParams.get("cursor");

    const admin = createAdminClient();

    // Build a set of contractor IDs from each active filter, then intersect
    let finalIds: Set<string> | null = null;

    if (service) {
      const { data: svc } = await admin.from("Service").select("id").eq("slug", service).maybeSingle();
      if (svc) {
        const { data: cs } = await admin.from("ContractorService").select("contractorId").eq("serviceId", svc.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalIds = new Set((cs ?? []).map((c: any) => c.contractorId));
      } else {
        return NextResponse.json({ success: true, data: [], nextCursor: null, total: 0 });
      }
    }

    if (location) {
      const { data: loc } = await admin.from("Location").select("id").eq("slug", location).maybeSingle();
      if (loc) {
        const { data: cl } = await admin.from("ContractorLocation").select("contractorId").eq("locationId", loc.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const locSet = new Set((cl ?? []).map((c: any) => c.contractorId));
        finalIds = finalIds ? new Set([...finalIds].filter((id) => locSet.has(id))) : locSet;
      } else {
        return NextResponse.json({ success: true, data: [], nextCursor: null, total: 0 });
      }
    }

    if (plan) {
      const { data: memberships } = await admin.from("Membership").select("contractorId").eq("planType", plan).eq("status", "active");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const planSet = new Set((memberships ?? []).map((m: any) => m.contractorId));
      finalIds = finalIds ? new Set([...finalIds].filter((id) => planSet.has(id))) : planSet;
    }

    if (finalIds !== null && finalIds.size === 0) {
      return NextResponse.json({ success: true, data: [], nextCursor: null, total: 0 });
    }

    let query = admin
      .from("Contractor")
      .select("*, ContractorService(id, isPrimary, Service(id, name, slug)), Membership(planType, status)")
      .neq("verifiedStatus", "unclaimed")
      .order("rating", { ascending: false })
      .limit(limit + 1);

    if (finalIds !== null) {
      query = query.in("id", [...finalIds]);
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (cursor) {
      query = query.gt("id", cursor);
    }

    const { data: contractors } = await query;

    const hasMore = (contractors?.length ?? 0) > limit;
    const data = hasMore ? (contractors ?? []).slice(0, limit) : (contractors ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextCursor = hasMore ? (data[data.length - 1] as any)?.id : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalized = data.map((c: any) => ({
      ...c,
      services: (c.ContractorService ?? []).map((cs: any) => ({ ...cs, service: cs.Service })),
      membership: Array.isArray(c.Membership) ? c.Membership[0] : c.Membership,
    }));

    return NextResponse.json({
      success: true,
      data: normalized,
      nextCursor,
      total: normalized.length,
    });
  } catch (error) {
    console.error("GET /api/contractors error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch contractors" } },
      { status: 500 }
    );
  }
}
