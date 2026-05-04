/**
 * POST /api/claims/[id]/verify
 * Submit verification code to complete a claim.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({ code: z.string().min(4).max(12) });

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = schema.parse(await request.json());
    const admin = createAdminClient();

    const { data: claim } = await admin
      .from("ClaimRequest")
      .select("id, listingId, memberId, status, sentAt, verificationCode")
      .eq("id", params.id)
      .maybeSingle();

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    if (claim.memberId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (claim.status !== "pending") {
      return NextResponse.json({ error: "This claim is no longer pending" }, { status: 409 });
    }

    const expiresAt = new Date(new Date(claim.sentAt).getTime() + 30 * 60 * 1000);
    if (new Date() > expiresAt) {
      await admin
        .from("ClaimRequest")
        .update({ status: "expired" })
        .eq("id", params.id);
      return NextResponse.json({ error: "Verification code has expired" }, { status: 410 });
    }

    if (claim.verificationCode !== code.toUpperCase()) {
      return NextResponse.json({ error: "Incorrect verification code" }, { status: 422 });
    }

    await Promise.all([
      admin.from("ClaimRequest").update({ status: "verified", verifiedAt: new Date().toISOString() }).eq("id", params.id),
      admin.from("ImportedListing").update({ status: "claimed", claimedByMemberId: user.id, claimedAt: new Date().toISOString() }).eq("id", claim.listingId),
    ]);

    return NextResponse.json({ success: true, data: { listingId: claim.listingId } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("POST /api/claims/[id]/verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
