/**
 * POST /api/claims/[id]/verify
 * Submit verification code to complete a claim.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
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

    const claim = await prisma.claimRequest.findUnique({
      where: { id: params.id },
      include: { listing: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    if (claim.memberId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (claim.status !== "pending") {
      return NextResponse.json({ error: "This claim is no longer pending" }, { status: 409 });
    }

    // Check expiry (30 minutes from sentAt)
    const expiresAt = new Date(claim.sentAt.getTime() + 30 * 60 * 1000);
    if (new Date() > expiresAt) {
      await prisma.claimRequest.update({ where: { id: params.id }, data: { status: "expired" } });
      return NextResponse.json({ error: "Verification code has expired" }, { status: 410 });
    }

    if (claim.verificationCode !== code.toUpperCase()) {
      return NextResponse.json({ error: "Incorrect verification code" }, { status: 422 });
    }

    // Mark claim verified and listing claimed
    await prisma.$transaction([
      prisma.claimRequest.update({
        where: { id: params.id },
        data: { status: "verified", verifiedAt: new Date() },
      }),
      prisma.importedListing.update({
        where: { id: claim.listingId },
        data: { status: "claimed", claimedByMemberId: user.id, claimedAt: new Date() },
      }),
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
