import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["new", "contacted", "quote_sent", "job_won", "job_lost", "no_response", "spam"]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: lead } = await admin
      .from("Lead")
      .select("id, contractorId, Contractor(userId, email)")
      .eq("id", params.id)
      .maybeSingle();

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contractor = Array.isArray((lead as any).Contractor) ? (lead as any).Contractor[0] : (lead as any).Contractor;
    if (contractor?.userId !== user.id && contractor?.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = updateSchema.parse(body);

    const { data: updated, error } = await admin
      .from("Lead")
      .update({ status })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid status value", details: error.errors }, { status: 400 });
    }
    console.error("PUT /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
