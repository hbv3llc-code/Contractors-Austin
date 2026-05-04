import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const admin = createAdminClient();

    const newStatus = action === "approve" ? "verified" : "rejected";

    const { data: claim } = await admin
      .from("ClaimRequest")
      .update({
        status: newStatus,
        verifiedAt: action === "approve" ? new Date().toISOString() : undefined,
        adminNotes,
      })
      .eq("id", params.id)
      .select("id, listingId, memberId, status")
      .single();

    if (action === "approve" && claim) {
      await admin
        .from("ImportedListing")
        .update({ status: "claimed", claimedAt: new Date().toISOString(), claimedByMemberId: claim.memberId })
        .eq("id", claim.listingId);
    }

    return NextResponse.json({ success: true, data: claim });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}
