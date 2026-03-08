import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action, adminNotes } = schema.parse(await request.json());

    const newStatus = action === "approve" ? "verified" : "rejected";

    const claim = await prisma.claimRequest.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        verifiedAt: action === "approve" ? new Date() : undefined,
        adminNotes,
      },
      include: { listing: true },
    });

    // If approved, mark listing as claimed
    if (action === "approve") {
      await prisma.importedListing.update({
        where: { id: claim.listingId },
        data: { status: "claimed", claimedAt: new Date(), claimedByMemberId: claim.memberId },
      });
    }

    return NextResponse.json({ success: true, data: claim });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}
