import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

async function isAdmin(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user && ADMIN_EMAILS.includes(user.email ?? "");
}

const patchSchema = z.object({
  verifiedStatus: z.enum(["unclaimed", "claimed", "verified"]).optional(),
  planType: z.enum(["basic", "featured", "premium"]).optional(),
  insuranceVerified: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updates = patchSchema.parse(body);
    const admin = createAdminClient();

    const contractorData: Record<string, unknown> = {};
    if (updates.verifiedStatus) contractorData.verifiedStatus = updates.verifiedStatus;
    if (updates.insuranceVerified !== undefined) contractorData.insuranceVerified = updates.insuranceVerified;

    const { data: contractor } = await admin
      .from("Contractor")
      .update(contractorData)
      .eq("id", params.id)
      .select()
      .single();

    if (updates.planType) {
      await admin
        .from("Membership")
        .upsert(
          { contractorId: params.id, planType: updates.planType },
          { onConflict: "contractorId" }
        );
    }

    return NextResponse.json({ success: true, data: contractor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update contractor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    await admin.from("Contractor").delete().eq("id", params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete contractor" }, { status: 500 });
  }
}
